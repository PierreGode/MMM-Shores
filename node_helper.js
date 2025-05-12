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

    // Middleware
    app.use(bodyParser.json());
    app.use(express.static(path.join(__dirname, "public")));

    // Root-route: serverar admin.html
    app.get("/", (req, res) => {
      res.sendFile(path.join(__dirname, "public", "admin.html"));
    });

    // Hämta alla ärenden
    app.get("/api/tasks", (req, res) => {
      res.json(tasks);
    });

    // Lägg till nytt ärende
    app.post("/api/tasks", (req, res) => {
      const { name, date } = req.body;
      if (!name || !date) {
        return res.status(400).json({ error: "Name and date are required" });
      }
      tasks.push({ name, date, done: false });
      this.sendSocketNotification("TASKS_UPDATE", tasks);
      res.status(201).json(tasks);
    });

    // Uppdatera done-status för ett ärende
    app.put("/api/tasks/:idx", (req, res) => {
      const idx = parseInt(req.params.idx, 10);
      if (isNaN(idx) || idx < 0 || idx >= tasks.length) {
        return res.status(404).json({ error: "Invalid task index" });
      }
      const { done } = req.body;
      tasks[idx].done = Boolean(done);
      this.sendSocketNotification("TASKS_UPDATE", tasks);
      res.json(tasks[idx]);
    });

    // Starta server på alla nätverksgränssnitt
    app.listen(port, "0.0.0.0", () => {
      console.log(`MMM-Chores admin running at http://0.0.0.0:${port}`);
    });
  }
});
