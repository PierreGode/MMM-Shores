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
    app.use(bodyParser.json());
    app.use(express.static(path.join(__dirname, "public")));

    // Hämta tasks
    app.get("/api/tasks", (req, res) => {
      res.json(tasks);
    });

    // Lägg till task
    app.post("/api/tasks", (req, res) => {
      const { name, date } = req.body;
      tasks.push({ name, date, done: false });
      this.sendSocketNotification("TASKS_UPDATE", tasks);
      res.status(201).json(tasks);
    });

    // Starta server
    app.listen(port, () => {
      console.log(`MMM-Chores admin running at http://localhost:${port}`);
    });
  }
});
