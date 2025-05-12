const NodeHelper = require("node_helper");
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

let tasks = [];
let people = [];

module.exports = NodeHelper.create({
  start() {
    console.log("MMM-Chores helper started...");
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

    // Get all people
    app.get("/api/people", (req, res) => {
      res.json(people);
    });

    // Add a person
    app.post("/api/people", (req, res) => {
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ error: "Name is required" });
      }
      const newPerson = { id: Date.now(), name };
      people.push(newPerson);
      this.sendSocketNotification("PEOPLE_UPDATE", people);
      res.status(201).json(newPerson);
    });

    // Delete a person
    app.delete("/api/people/:id", (req, res) => {
      const id = parseInt(req.params.id, 10);
      people = people.filter(p => p.id !== id);
      // Unassign tasks assigned to this person
      tasks = tasks.map(t => t.assignedTo === id ? { ...t, assignedTo: null } : t);
      this.sendSocketNotification("PEOPLE_UPDATE", people);
      this.sendSocketNotification("TASKS_UPDATE", tasks);
      res.json({ success: true });
    });

    //
    // TASKS ENDPOINTS
    //

    // Get all tasks
    app.get("/api/tasks", (req, res) => {
      res.json(tasks);
    });

    // Add a new task
    app.post("/api/tasks", (req, res) => {
      const { name, date } = req.body;
      if (!name || !date) {
        return res.status(400).json({ error: "Name and date are required" });
      }
      const newTask = { id: Date.now(), name, date, done: false, assignedTo: null };
      tasks.push(newTask);
      this.sendSocketNotification("TASKS_UPDATE", tasks);
      res.status(201).json(newTask);
    });

    // Update a task (done or assignedTo)
    app.put("/api/tasks/:id", (req, res) => {
      const id = parseInt(req.params.id, 10);
      const task = tasks.find(t => t.id === id);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      const { done, assignedTo } = req.body;
      if (typeof done === "boolean") task.done = done;
      if (assignedTo === null || people.find(p => p.id === assignedTo)) {
        task.assignedTo = assignedTo;
      }
      this.sendSocketNotification("TASKS_UPDATE", tasks);
      res.json(task);
    });

    // Delete a task
    app.delete("/api/tasks/:id", (req, res) => {
      const id = parseInt(req.params.id, 10);
      tasks = tasks.filter(t => t.id !== id);
      this.sendSocketNotification("TASKS_UPDATE", tasks);
      res.json({ success: true });
    });

    // Start listening on all interfaces
    app.listen(port, "0.0.0.0", () => {
      console.log(`MMM-Chores admin running at http://0.0.0.0:${port}`);
    });
  }
});
