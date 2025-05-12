const NodeHelper = require("node_helper");
const express    = require("express");
const bodyParser = require("body-parser");
const path       = require("path");
const fs         = require("fs");
const https      = require("https");

const DATA_FILE = path.join(__dirname, "data.json");
const CERT_DIR  = path.join(__dirname, "certs");

let tasks = [];
let people = [];

// Load and save data (same as before)
function loadData() {
  if (fs.existsSync(DATA_FILE)) {
    try {
      const j = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
      tasks = j.tasks || [];
      people = j.people || [];
      console.log(`MMM-Chores: Loaded ${tasks.length} tasks and ${people.length} people`);
    } catch (e) {
      console.error("MMM-Chores: Error reading data.json:", e);
    }
  }
}
function saveData() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ tasks, people }, null, 2), "utf8");
    console.log(`MMM-Chores: Saved ${tasks.length} tasks and ${people.length} people`);
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
    const self = this;
    const app  = express();

    app.use(bodyParser.json());
    app.use(express.static(path.join(__dirname, "public")));

    // Serve admin UI
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
    app.get("/api/tasks", (req, res) => res.json(tasks));
    app.post("/api/tasks", (req, res) => {
      const { name, date } = req.body;
      if (!name || !date) return res.status(400).json({ error: "Name and date are required" });
      const newTask = { id: Date.now(), name, date, done: false, assignedTo: null };
      tasks.push(newTask);
      saveData();
      self.sendSocketNotification("TASKS_UPDATE", tasks);
      res.status(201).json(newTask);
    });
    app.put("/api/tasks/:id", (req, res) => {
      const id = parseInt(req.params.id, 10);
      const task = tasks.find(t => t.id === id);
      if (!task) return res.status(404).json({ error: "Task not found" });
      if (typeof req.body.done === "boolean") task.done = req.body.done;
      if (req.body.hasOwnProperty("assignedTo")) {
        task.assignedTo = req.body.assignedTo;
      }
      saveData();
      self.sendSocketNotification("TASKS_UPDATE", tasks);
      res.json(task);
    });
    app.delete("/api/tasks/:id", (req, res) => {
      const id = parseInt(req.params.id, 10);
      tasks = tasks.filter(t => t.id !== id);
      saveData();
      self.sendSocketNotification("TASKS_UPDATE", tasks);
      res.json({ success: true });
    });

    // HTTP server
    app.listen(port, "0.0.0.0", () => {
      console.log(`MMM-Chores admin (HTTP) running at http://0.0.0.0:${port}`);
      // send initial data
      self.sendSocketNotification("TASKS_UPDATE", tasks);
      self.sendSocketNotification("PEOPLE_UPDATE", people);
    });

    // HTTPS server on port+1
    const httpsPort = port + 1;
    const keyPath  = path.join(CERT_DIR, "server.key");
    const certPath = path.join(CERT_DIR, "server.crt");
    if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
      const options = {
        key:  fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath)
      };
      https.createServer(options, app).listen(httpsPort, "0.0.0.0", () => {
        console.log(`MMM-Chores admin (HTTPS) running at https://0.0.0.0:${httpsPort}`);
      });
    } else {
      console.warn("MMM-Chores: HTTPS cert/key not found, skipping HTTPS server");
    }
  }
});
