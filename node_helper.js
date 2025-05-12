const NodeHelper = require("node_helper");
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

let tasks = [];

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

    // Middleware to parse JSON and serve static files
    app.use(bodyParser.json());
    app.use(express.static(path.join(__dirname, "public")));

    // Serve admin.html on the root route
    app.get("/", (req, res) => {
      res.sendFile(path.join(__dirname, "public", "admin.html"));
    });

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
      tasks.push({ name, date, done: false });
      this.sendSocketNotification("TASKS_UPDATE", tasks);
      res.status(201).json(tasks);
    });

    // Update the 'done' status of a task
    app.put("/api/tasks/:idx", (req, res) => {
      const idx = parseInt(req.params.idx, 10);
      if (isNaN(idx) || idx < 0 || idx >= tasks.length) {
        return res.status(404).json({ error: "Invalid task index" });
      }
      tasks[idx].done = Boolean(req.body.done);
      this.sendSocketNotification("TASKS_UPDATE", tasks);
      res.json(tasks[idx]);
    });

    // Delete a task
    app.delete("/api/tasks/:idx", (req, res) => {
      const idx = parseInt(req.params.idx, 10);
      if (isNaN(idx) || idx < 0 || idx >= tasks.length) {
        return res.status(404).json({ error: "Invalid task index" });
      }
      const removed = tasks.splice(idx, 1)[0];
      this.sendSocketNotification("TASKS_UPDATE", tasks);
      res.json({ removed });
    });

    // Start server listening on all network interfaces
    app.listen(port, "0.0.0.0", () => {
      console.log(`MMM-Chores admin running at http://0.0.0.0:${port}`);
    });
  }
});
