const Log        = require("logger");
const NodeHelper = require("node_helper");
const express    = require("express");
const bodyParser = require("body-parser");
const path       = require("path");
const fs         = require("fs");
const https      = require("https");
const { OpenAI } = require("openai");

const DATA_FILE = path.join(__dirname, "data.json");
const CERT_DIR  = path.join(__dirname, "certs");

let tasks = [];
let people = [];
let analyticsBoards = [];
let settings = {
  language: "en",
  dateFormatting: "yyyy-mm-dd"
};

function loadData() {
  if (fs.existsSync(DATA_FILE)) {
    try {
      const j = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
      tasks = j.tasks || [];
      people = j.people || [];
      analyticsBoards = j.analyticsBoards || [];
      settings = j.settings || { language: "en", dateFormatting: "yyyy-mm-dd" };
      Log.log(`MMM-Chores: Loaded ${tasks.length} tasks, ${people.length} people, ${analyticsBoards.length} analytics boards, language: ${settings.language}`);
    } catch (e) {
      Log.error("MMM-Chores: Error reading data.json:", e);
    }
  }
}

function saveData() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ tasks, people, analyticsBoards, settings }, null, 2), "utf8");
    Log.log(`MMM-Chores: Saved ${tasks.length} tasks, ${people.length} people, ${analyticsBoards.length} analytics boards, language: ${settings.language}`);
  } catch (e) {
    Log.error("MMM-Chores: Error writing data.json:", e);
  }
}

const strictPrompt =
`You are an assistant that generates household tasks for the next 7 days, ONLY using the real historical task data provided.

Rules:
- You MUST base all task generation only on the actual history below – DO NOT invent new chores or people.
- Schedule new tasks ONLY if the pattern in the data suggests they are due (based on frequency, assigned person, and weekday).
- Do NOT include any task, person, or date not reflected in the history.
- If a task is normally done every N days (e.g. dishes every 2 days, laundry every Tuesday), keep that pattern for the same person.
- If a "big" task (like cleaning house, changing sheets, window cleaning) is only done once per week or less, do NOT generate it more often. "Small" tasks (like dishes, making bed) can repeat more often, but ONLY as the history shows.
- Never schedule more than one 'big' task per week per person.
- Do NOT duplicate tasks for a date/person/task that is already scheduled or unfinished for the upcoming 7 days.
- If no historical pattern exists for a specific task/person/date, do NOT generate anything for it.
- Output ONLY a pure JSON array of new tasks for the next 7 days, nothing else. Each task must have: name, date (yyyy-mm-dd), assignedTo (person id or null).

Data to analyze:
`;

module.exports = NodeHelper.create({
  start() {
    Log.log("MMM-Chores helper started...");
    loadData();
  },

  socketNotificationReceived(notification, payload) {
    if (notification === "INIT_SERVER") {
      this.config = payload; // Spara konfig inkl openaiApiKey
      this.initServer(payload.adminPort);
    }
  },

  async aiGenerateTasks(req, res) {
    try {
      if (!this.config || !this.config.openaiApiKey) {
        return res.status(400).json({ success: false, error: "OpenAI token missing in config." });
      }

      const openai = new OpenAI({ apiKey: this.config.openaiApiKey });

      const prompt = this.buildPromptFromTasks();
      Log.log("MMM-Chores: Sending prompt to OpenAI...");

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: strictPrompt + prompt }
        ],
        max_tokens: 1000,
        temperature: 0.2
      });

      let text = completion.choices[0].message.content;
      Log.log("MMM-Chores: OpenAI RAW response:", text);

      text = text.trim();
      if (text.startsWith("```")) {
        text = text.replace(/```[a-z]*\s*([\s\S]*?)\s*```/, "$1").trim();
      }

      const firstBracket = text.indexOf('[');
      const lastBracket = text.lastIndexOf(']');
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
        task.id = Date.now() + Math.floor(Math.random() * 10000);
        task.created = now.toISOString();
        task.done = false;
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
    // Ta ut alla tasks ur historiken och ALLA som är schemalagda nästa 7 dagar (för att förhindra dubbletter)
    const today = new Date();
    today.setHours(0,0,0,0);

    const windowDates = Array.from({length: 7}).map((_,i) => {
      const d = new Date(today); d.setDate(today.getDate() + i);
      return d.toISOString().split('T')[0];
    });

    const scheduledTasks = tasks.filter(
      t => !t.deleted && windowDates.includes(t.date)
    ).map(t => ({
      name: t.name,
      assignedTo: t.assignedTo,
      date: t.date
    }));

    const pastTasks = tasks.filter(
      t => t.date && new Date(t.date) < today
    ).map(t => ({
      name: t.name,
      assignedTo: t.assignedTo,
      date: t.date,
      done: t.done,
      deleted: t.deleted || false,
      created: t.created
    }));

    return `
Historical tasks (for pattern analysis):
${JSON.stringify(pastTasks, null, 2)}

Already scheduled or pending next 7 days (do NOT repeat):
${JSON.stringify(scheduledTasks, null, 2)}

People:
${JSON.stringify(people, null, 2)}
`;
  },

  initServer(port) {
    const self = this;
    const app  = express();

    app.use(bodyParser.json());
    app.use(express.static(path.join(__dirname, "public")));

    // Admin UI
    app.get("/", (req, res) => {
      res.sendFile(path.join(__dirname, "public", "admin.html"));
    });

    // People endpoints
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
      tasks = tasks.map(t => t.assignedTo === id ? { ...t, assignedTo: null } : t);
      saveData();
      self.sendSocketNotification("PEOPLE_UPDATE", people);
      self.sendSocketNotification("TASKS_UPDATE", tasks);
      res.json({ success: true });
    });

    // Task endpoints
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
      const id = parseInt(req.params.id, 10);
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

    // Analytics Boards endpoints
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

    // Settings endpoints
    app.get("/api/settings", (req, res) => {
      res.json(settings);
    });

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

    // AI generate endpoint
    app.post("/api/ai-generate", (req, res) => self.aiGenerateTasks(req, res));

    app.listen(port, "0.0.0.0", () => {
      Log.log(`MMM-Chores admin (HTTP) running at http://0.0.0.0:${port}`);
      self.sendSocketNotification("TASKS_UPDATE", tasks);
      self.sendSocketNotification("PEOPLE_UPDATE", people);
      self.sendSocketNotification("ANALYTICS_UPDATE", analyticsBoards);
      self.sendSocketNotification("SETTINGS_UPDATE", settings);
    });

    // Optional HTTPS server on port+1
    const httpsPort = port + 1;
    const keyPath  = path.join(CERT_DIR, "server.key");
    const certPath = path.join(CERT_DIR, "server.crt");
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
