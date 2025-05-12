const NodeHelper = require("node_helper");
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");

const DATA_FILE = path.join(__dirname, "data.json");

let tasks = [];
let people = [];

/**
 * Load saved data from disk, if available.
 */
function loadData() {
  if (fs.existsSync(DATA_FILE)) {
    try {
      const raw = fs.readFileSync(DATA_FILE);
      const j = JSON.parse(raw);
      tasks = j.tasks || [];
      people = j.people || [];
      console.log("MMM-Chores: Loaded data.json");
    } catch (e) {
      console.error("MMM-Chores: Error reading data.json:", e);
    }
  }
}

/**
 * Save current tasks & people to disk.
 */
function saveData() {
  const j = { tasks, people };
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(j, null, 2));
    // console.log("MMM-Chores: Saved data.json");
  } catch (e) {
    console.error("MMM-Chores: Error writing data.json:", e);
  }
}

module.exports = NodeHelper.create({
  start() {
    console.log("MMM-Chores helper started...");
    loadData();
  },

  socketNotificationReceived(notification, payload) {
    if (notification === "INIT_SERVER") {
      this.initServer(payload.adminPort);
    }
  },

  initServer(port) {
    const app = express();

    // JSON parser & static files
    app.use(bodyParser.json());
    app.use(express.static(path.join(__dirname, "public")));

    // Serve admin UI
    app.get("/", (req, res) => {
      res.sendFile(path.join(__dirname, "public", "admin.html"));
    });

    //
    // PEOPLE ENDPOINTS
    //

    app.get("/api/people", (req, res) => {
      res.json(people);
    });

    app.post("/api/people", (req, res) => {
      const { name } = req.body;
      if (!name) return res.status(400).json({ error: "Name is required" });
      const newPerson = { id: Date.now(), name };
      people.push(newPerson);
      saveData();
      this.sendSocketNotification("PEOPLE_UPDATE", people);
      res.status(201).json(newPerson);
    });

    app.delete("/api/people/:id", (req, res) => {
      const id = parseInt(req.params.id, 10);
      people = people.filter(p => p.id !== id);
      tasks = tasks.map(t => t.assignedTo === id ? { ...t, assignedTo: null } : t);
      saveData();
      this.sendSocketNotification("PEOPLE_UPDATE", people);
      this.sendSocketNotification("TASKS_UPDATE", tasks);
      res.json({ success: true });
    });

    //
    // TASKS ENDPOINTS
    //

    app.get("/api/tasks", (req, res) => {
      res.json(tasks);
    });

    app.post("/api/tasks", (req, res) => {
      const { name, date } = req.body;
      if (!name || !date) return res.status(400).json({ error: "Name and date are required" });
      const newTask = { id: Date.now(), name, date, done: false, assignedTo: null };
      tasks.push(newTask);
      saveData();
      this.sendSocketNotification("TASKS_UPDATE", tasks);
      res.status(201).json(newTask);
    });

    app.put("/api/tasks/:id", (req, res) => {
      const id = parseInt(req.params.id, 10);
      const task = tasks.find(t => t.id === id);
      if (!task) return res.status(404).json({ error: "Task not found" });
      const { done, assignedTo } = req.body;
      if (typeof done === "boolean") task.done = done;
      if (assignedTo === null || people.find(p => p.id === assignedTo)) {
        task.assignedTo = assignedTo;
      }
      saveData();
      this.sendSocketNotification("TASKS_UPDATE", tasks);
      res.json(task);
    });

    app.delete("/api/tasks/:id", (req, res) => {
      const id = parseInt(req.params.id, 10);
      tasks = tasks.filter(t => t.id !== id);
      saveData();
      this.sendSocketNotification("TASKS_UPDATE", tasks);
      res.json({ success: true });
    });

    // Start server on all interfaces
    app.listen(port, "0.0.0.0", () => {
      console.log(`MMM-Chores admin running at http://0.0.0.0:${port}`);
    });
  }
});
