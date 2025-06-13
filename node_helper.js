const Log        = require("logger");
const NodeHelper = require("node_helper");
const express    = require("express");
const bodyParser = require("body-parser");
const path       = require("path");
const fs         = require("fs");
const https      = require("https");

// Use built-in fetch if available (Node 18+) otherwise fall back to node-fetch
let fetchFn = global.fetch;
if (!fetchFn) {
  fetchFn = (...args) =>
    import("node-fetch").then(({ default: fetch }) => fetch(...args));
}

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

function broadcastTasks(helper) {
  const visible = tasks.filter(t => !t.deleted);
  helper.sendSocketNotification("TASKS_UPDATE", tasks);
  helper.sendSocketNotification("CHORES_DATA", visible);
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
    if (notification === "USER_TOGGLE_CHORE") {
      this.handleUserToggle(payload);
    }
  },

  async aiGenerateTasks(req, res) {
    // Reload data from disk to ensure the AI sees the latest tasks
    loadData();
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
              // ── ROLE ────────────────────────────────────────────────────────────

              `You are an assistant that, given household-task history from "completedTasks" and open chores from "openTasks", ` +
              `creates a schedule for the **next 7 days**. Use openTasks to avoid duplicating existing chores. All tasks and responses must be written in the ${settings.language} language.\n\n` +
        
              // ── OUTPUT FORMAT ───────────────────────────────────────────────────
              "Return **only** a raw JSON array (no surrounding text). Each item " +
              "must include:\n" +
              "  • name         – string\n" +
              "  • date         – string in YYYY-MM-DD format\n" +
              "  • assignedTo   – person-ID (omit or null if unassigned)\n\n" +
        
              // ── SCHEDULING RULES ────────────────────────────────────────────────
              "1. Skip tasks marked as *done* unless they are recurring.\n" +
              "2. Don’t duplicate an unfinished or very recently completed task on " +
              "   the same day.\n" +
              "3. Never assign more than **one** *big* task per person per week; " +
              "   *small* tasks can appear more often.\n" +
              "4. It’s okay if some days end up without new tasks – keeping " +
              "   routines is more important than filling every date.\n" +
              "5. Try to keep weekly tasks on the same weekday they historically " +
              "   occur.\n" +
              "6. Only generate dates within the next 7 days.\n" +
              "7. Do not invent new people or tasks that aren’t present in the " +
              "   input data.\n" +
              "8. Do not add unnecessary data.\n\n" +
        
              // ── EXAMPLES TO DISTINGUISH SMALL VS BIG TASKS ──────────────────────
              "Examples of **small chores** include:\n" +
              "Wash dishes, Water plants, Take out trash, Sweep floor, Dust shelves, " +
              `Wipe counters, Fold laundry, Clean mirrors, Make bed, Replace hand towels. Use the same language (${settings.language}) for all tasks.\n\n` +
        
              "Examples of **big chores** include:\n" +
              "Vacuum entire house, Mow lawn, Deep clean bathroom, Organize garage, " +
              "Paint room, Shampoo carpets, Clean gutters, Declutter closets, Wash windows (outside), Repair door hinges. " +
              `Always write tasks in ${settings.language}.\n` +
        
              // ── REASONABLENESS GUIDELINES ───────────────────────────────────────
              "9. Be reasonable with scheduling: avoid assigning overly exhausting tasks " +
              "   like cleaning the entire house or doing all big chores in one day. " +
              "   Balance workload fairly over the week per person.\n" +
              "10. Prioritize routines and habits over forcing new tasks every day.\n" +
              "11. If a task is big or time-consuming, spread it out or assign it only once " +
              "    per week per person.\n" +
              "12. Consider recent completions and do not repeat tasks too soon.\n" +

              "13. Big chores like painting a house occur only every 10 years; if one was recently finished, do not schedule it again within the next years."


          },
          { role: "user", content: prompt }
        ],

        max_tokens: 5000,
        temperature: 0.1
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
      let createdCount = 0;

      newTasks.forEach(task => {
        const alreadyExists = tasks.some(t => t.name === task.name && t.date === task.date && !t.deleted);
        if (!alreadyExists) {
          task.id      = Date.now() + Math.floor(Math.random() * 10000);
          task.created = now.toISOString();
          task.done    = false;
          if (!task.assignedTo) task.assignedTo = null;
          tasks.push(task);
          createdCount++;
        }
      });

      saveData();
      broadcastTasks(this);
      res.json({ success: true, createdTasks: newTasks, count: createdCount });

    } catch (err) {
      Log.error("AI Generate error:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  },

  buildPromptFromTasks() {
    // Completed tasks provide history for scheduling patterns
    const completedTasks = tasks.filter(t => t.done === true).map(t => ({
      name:       t.name,
      assignedTo: t.assignedTo,
      date:       t.date,
      deleted:    t.deleted || false,
      created:    t.created
    }));

    // Open tasks help avoid scheduling duplicates in the same time period
    const openTasks = tasks.filter(t => !t.done && !t.deleted).map(t => ({
      name:       t.name,
      assignedTo: t.assignedTo,
      date:       t.date,
      created:    t.created
    }));

    const localeMap = {
      en: 'en-US',
      sv: 'sv-SE',
      fr: 'fr-FR',
      es: 'es-ES',
      de: 'de-DE',
      it: 'it-IT',
      nl: 'nl-NL',
      pl: 'pl-PL',
      zh: 'zh-CN',
      ar: 'ar-EG'
    };
    const locale = localeMap[settings.language] || 'en-US';
    const todayString = new Date().toLocaleDateString(locale, {
      weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric'
    });

    return JSON.stringify({
      instruction:
        `Today is ${todayString}. ` +
        "Analyze historical data to determine which day of the week different people usually perform specific chores. " +
        "Based on this, generate new tasks for the next 7 days with the correct assignment of the right person on the right day in the same language as the tasks. " +
        "Return ONLY a JSON array of objects containing: name, date (yyyy-mm-dd), assignedTo (person id).",

      today: new Date().toISOString().slice(0, 10),
      language: settings.language,
      completedTasks: completedTasks,
      openTasks: openTasks,

      people: people
    });
  },

  async handleUserToggle({ id, done }) {
    try {
      const now = new Date();
      const iso = now.toISOString();
      const pad = n => n.toString().padStart(2, "0");
      const stamp = prefix =>
        prefix + pad(now.getMonth() + 1) + pad(now.getDate()) + pad(now.getHours()) + pad(now.getMinutes());

      const body = { done };
      if (done) {
        body.finished = iso;
        body.finishedShort = stamp("F");
      } else {
        body.finished = null;
        body.finishedShort = null;
      }

      const port = this.config.adminPort;
      await fetchFn(`http://localhost:${port}/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const res = await fetchFn(`http://localhost:${port}/api/tasks`);
      const latest = await res.json();
      this.sendSocketNotification("CHORES_DATA", latest);
    } catch (e) {
      Log.error("MMM-Chores: failed updating task", e);
    }
  },

  initServer(port) {
    const self = this;
    const app  = express();

    app.use(bodyParser.json());
    app.use(express.static(path.join(__dirname, "public")));

    app.get("/", (req, res) => {
      res.sendFile(path.join(__dirname, "public", "admin.html"));
    });

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
      broadcastTasks(self);
      res.json({ success: true });
    });

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
      broadcastTasks(self);
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
      broadcastTasks(self);
      res.json(task);
    });
    app.delete("/api/tasks/:id", (req, res) => {
      const id = parseInt(req.params.id, 10);
      const task = tasks.find(t => t.id === id);
      if (!task) return res.status(404).json({ error: "Task not found" });

      task.deleted = true;
      saveData();
      broadcastTasks(self);
      res.json({ success: true });
    });

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
      broadcastTasks(self);
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
