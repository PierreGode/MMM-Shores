const Log        = require("logger");
const NodeHelper = require("node_helper");
const express    = require("express");
const bodyParser = require("body-parser");
const path       = require("path");
const fs         = require("fs");
const https      = require("https");

let openaiLoaded = true;
let OpenAI;
try {
  OpenAI = require("openai").OpenAI;
} catch (err) {
  openaiLoaded = false;
}

const DATA_FILE = path.join(__dirname, "data.json");
const CERT_DIR  = path.join(__dirname, "certs");

let tasks = [];
let people = [];
let analyticsBoards = [];

let settings = {
  language: "en"
};

function loadData() {
  if (fs.existsSync(DATA_FILE)) {
    try {
      const j = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
      tasks            = j.tasks            || [];
      people           = j.people           || [];
      analyticsBoards  = j.analyticsBoards  || [];
      settings         = j.settings         || { language: "en", dateFormatting: "yyyy-mm-dd" };

      Log.log(`MMM-Chores: Loaded ${tasks.length} tasks, ${people.length} people, ${analyticsBoards.length} analytics boards, language: ${settings.language}`);
    } catch (e) {
      Log.error("MMM-Chores: Error reading data.json:", e);
    }
  }
}

function saveData() {
  try {
    fs.writeFileSync(
      DATA_FILE,
      JSON.stringify({ tasks, people, analyticsBoards, settings }, null, 2),
      "utf8"
    );
    Log.log(`MMM-Chores: Saved ${tasks.length} tasks, ${people.length} people, ${analyticsBoards.length} analytics boards, language: ${settings.language}`);
  } catch (e) {
    Log.error("MMM-Chores: Error writing data.json:", e);
  }
}

module.exports = NodeHelper.create({
  start() {
    Log.log("MMM-Chores helper started...");
    loadData();
  },

  socketNotificationReceived(notification, payload) {
    if (notification === "INIT_SERVER") {
      this.config = payload;

      settings = {
        ...settings,
        language:       payload.language       ?? settings.language,
        dateFormatting: payload.dateFormatting ?? settings.dateFormatting
      };
      saveData();
      this.initServer(payload.adminPort);
    }
  },

  async aiGenerateTasks(req, res) {
    if (!this.config || this.config.useAI === false) {
      return res.status(400).json({
        success: false,
        error: "AI is disabled. Please install the 'openai' npm package and set useAI: true in your config."
      });
    }
    if (!openaiLoaded) {
      return res.status(400).json({
        success: false,
        error: "The 'openai' npm package is not installed. Run 'npm install openai' in the module folder."
      });
    }
    if (!this.config.openaiApiKey) {
      return res.status(400).json({ success: false, error: "OpenAI token missing in config." });
    }

    // Kontrollera antal genomförda uppgifter (done === true), oavsett deleted
    const completedCount = tasks.filter(t => t.done === true).length;
    const requiredCount = 30;
    if (completedCount < requiredCount) {
      const amountLeft = requiredCount - completedCount;
      return res.status(400).json({
        success: false,
        error: `Too little data. Please complete ${amountLeft} more task${amountLeft > 1 ? "s" : ""} to unlock AI generation.`
      });
    }

    try {
      const openai = new OpenAI({ apiKey: this.config.openaiApiKey });

      const prompt = this.buildPromptFromTasks();

      Log.log("MMM-Chores: Sending prompt to OpenAI...");

      const completion = await openai.chat.completions.create({
        model: "gpt-4.1-nano",
        messages: [
          {
            role: "system",
            content:
              "You are an assistant that generates household tasks for the next 7 days based on historical tasks data. " +
              "Return ONLY a pure JSON array, with no text before or after. Each item must include: name, date (yyyy-mm-dd), and assignedTo (person id) if applicable. " +
              "Do not include tasks marked as done unless they are recurring. Try to be logical, do not overly generate tasks if all tasks already exist, not completed or are very recent completed. " +
              "Never schedule more than one 'big' task per week per person. 'Small' tasks can be scheduled more often. find weekly taks and try to assign them to the same days. Only generate for the next 7 days. Stay strictly within provided data, don't invent people or tasks."
          },
          { role: "user", content: prompt }
        ],
        max_tokens: 700,
        temperature: 0.7
      });

      let text = completion.choices[0].message.content;

      Log.log("MMM-Chores: OpenAI RAW response:", text);

      text = text.trim();
      if (text.startsWith("```")) {
        text = text.replace(/```[a-z]*\s*([\s\S]*?)\s*```/, "$1").trim();
      }

      const firstBracket = text.indexOf('[');
      const lastBracket  = text.lastIndexOf(']');
      if (firstBracket !== -1 && lastBracket !== -1) {
        text = text.substring(firstBracket, lastBracket + 1);
      }

      let newTasks = [];
      try {
        newTasks = JSON.parse(text);
      } catch (e) {
        Log.error("Failed parsing AI response:", e);
        Log.error("OpenAI returned:", text);
        return res.status(500).json({ success: false, error: "Invalid AI response format.", raw: text });
      }

      const now = new Date();
      newTasks.forEach(task => {
        task.id      = Date.now() + Math.floor(Math.random() * 10000);
        task.created = now.toISOString();
        task.done    = false;
        if (!task.assignedTo) task.assignedTo = null;
        tasks.push(task);
      });

      saveData();
      this.sendSocketNotification("TASKS_UPDATE", tasks);
      res.json({ success: true, createdTasks: newTasks, count: newTasks.length });

    } catch (err) {
      Log.error("AI Generate error:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  },

  buildPromptFromTasks() {
    // Ta med alla uppgifter som är done=true och deleted=true (de historiska)
    const relevantTasks = tasks.filter(t => t.done === true && t.deleted === true).map(t => ({
      name:        t.name,
      assignedTo:  t.assignedTo,
      date:        t.date,
      done:        t.done,
      deleted:     t.deleted || false,
      created:     t.created
    }));

    const todayString = new Date().toLocaleDateString("sv-SE", {
      weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric'
    });

    return JSON.stringify({
      instruction:
        `Idag är ${todayString}. ` +
        "Analysera historiska uppgifter för att förstå vilken dag i veckan olika personer brukar göra specifika sysslor. " +
        "Baserat på detta, generera nya uppgifter för de kommande 7 dagarna med korrekt tilldelning av rätt person på rätt dag. " +
        "Returnera ENDAST en JSON-array med objekt som innehåller: name, date (yyyy-mm-dd), assignedTo (person id).",

      today: new Date().toISOString().slice(0, 10),
      tasks: relevantTasks,
      people: people
    });
  },

  initServer(port) {
    const self = this;
    const app  = express();

    app.use(bodyParser.json());
    app.use(express.static(path.join(__dirname, "public")));

    /*─────────────────── REST-API ───────────────────*/

    // Admin UI
    app.get("/", (req, res) => {
      res.sendFile(path.join(__dirname, "public", "admin.html"));
    });

    /* People endpoints */
    app.get("/api/people", (req, res) => res.json(people));
    app.post("/api/people", (req, res) => {
      const { name } = req.body;
      if (!name) return res.status(400).json({ error: "Name is required" });
      const newPerson = { id: Date.now(), name };
      people.push(newPerson);
      saveData();
      self.sendSocketNotification("PEOPLE_UPDATE", people);
      res.status(201).json(newPerson);
    });
    app.delete("/api/people/:id", (req, res) => {
      const id = parseInt(req.params.id, 10);
      people = people.filter(p => p.id !== id);
      tasks  = tasks.map(t => t.assignedTo === id ? { ...t, assignedTo: null } : t);
      saveData();
      self.sendSocketNotification("PEOPLE_UPDATE", people);
      self.sendSocketNotification("TASKS_UPDATE", tasks);
      res.json({ success: true });
    });

    /* Task endpoints */
    app.get("/api/tasks", (req, res) => {
      const visibleTasks = tasks.filter(t => !t.deleted);
      res.json(visibleTasks);
    });
    app.post("/api/tasks", (req, res) => {
      const newTask = {
        id: Date.now(),
        ...req.body,
        done: false,
        assignedTo: null,
      };
      tasks.push(newTask);
      saveData();
      self.sendSocketNotification("TASKS_UPDATE", tasks);
      res.status(201).json(newTask);
    });
    app.put("/api/tasks/:id", (req, res) => {
      const id   = parseInt(req.params.id, 10);
      const task = tasks.find(t => t.id === id);
      if (!task) return res.status(404).json({ error: "Task not found" });

      Object.entries(req.body).forEach(([key, val]) => {
        if (val === undefined || val === null) {
          delete task[key];
        } else {
          task[key] = val;
        }
      });
      saveData();
      self.sendSocketNotification("TASKS_UPDATE", tasks);
      res.json(task);
    });
    app.delete("/api/tasks/:id", (req, res) => {
      const id = parseInt(req.params.id, 10);
      const task = tasks.find(t => t.id === id);
      if (!task) return res.status(404).json({ error: "Task not found" });

      task.deleted = true;
      saveData();
      self.sendSocketNotification("TASKS_UPDATE", tasks);
      res.json({ success: true });
    });

    /* Analytics Boards endpoints */
    app.get("/api/analyticsBoards", (req, res) => res.json(analyticsBoards));
    app.post("/api/analyticsBoards", (req, res) => {
      const newBoards = req.body;
      if (!Array.isArray(newBoards)) {
        return res.status(400).json({ error: "Expected an array of board types" });
      }
      analyticsBoards = newBoards;
      saveData();
      self.sendSocketNotification("ANALYTICS_UPDATE", analyticsBoards);
      res.json({ success: true, analyticsBoards });
    });

    /* Settings endpoints */
    app.get("/api/settings", (req, res) => res.json(settings));

    app.put("/api/settings", (req, res) => {
      const newSettings = req.body;
      if (typeof newSettings !== "object") {
        return res.status(400).json({ error: "Invalid settings data" });
      }
      Object.entries(newSettings).forEach(([key, val]) => {
        settings[key] = val;
      });
      saveData();
      self.sendSocketNotification("SETTINGS_UPDATE", settings);
      res.json({ success: true, settings });
    });

    app.post("/api/ai-generate", (req, res) => self.aiGenerateTasks(req, res));

    app.listen(port, "0.0.0.0", () => {
      Log.log(`MMM-Chores admin (HTTP) running at http://0.0.0.0:${port}`);
      self.sendSocketNotification("TASKS_UPDATE", tasks);
      self.sendSocketNotification("PEOPLE_UPDATE", people);
      self.sendSocketNotification("ANALYTICS_UPDATE", analyticsBoards);
      self.sendSocketNotification("SETTINGS_UPDATE", settings);
    });

    const httpsPort = port + 1;
    const keyPath   = path.join(CERT_DIR, "server.key");
    const certPath  = path.join(CERT_DIR, "server.crt");
    if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
      const options = {
        key:  fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath)
      };
      https.createServer(options, app).listen(httpsPort, "0.0.0.0", () => {
        Log.log(`MMM-Chores admin (HTTPS) running at https://0.0.0.0:${httpsPort}`);
      });
    } else {
      Log.warn("MMM-Chores: HTTPS cert/key not found, skipping HTTPS server");
    }
  }
});
