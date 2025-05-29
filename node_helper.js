const Log        = require("logger");
const NodeHelper = require("node_helper");
const express    = require("express");
const bodyParser = require("body-parser");
const path       = require("node:path");
const fs         = require("node:fs");
const https      = require("node:https");

const DATA_FILE = path.join(__dirname, "data.json");
const CERT_DIR  = path.join(__dirname, "certs");

let tasks = [];
let people = [];
let analyticsBoards = [];
let settings = {
  language: "en",
  dateFormatting: "yyyy-mm-dd" // Exempel på inställning som kan utökas
};

// Ladda data från fil
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

// Spara data till fil
function saveData() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ tasks, people, analyticsBoards, settings }, null, 2), "utf8");
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
      this.initServer(payload.adminPort);
    }
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

    // Synliga tasks (inga raderade)
    app.get("/api/tasks", (req, res) => {
      const visibleTasks = tasks.filter(t => !t.deleted);
      res.json(visibleTasks);
    });

    // ALLA tasks inkl deleted (för analytics)
    app.get("/api/alltasks", (req, res) => {
      res.json(tasks);
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
    // Soft delete: Sätt deleted=true istället för att ta bort
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

    // Start HTTP server
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
