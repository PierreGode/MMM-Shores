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

    // Root-route som serverar admin.html
    app.get("/", (req, res) => {
      res.sendFile(path.join(__dirname, "public", "admin.html"));
    });

    // Hämta alla tasks
    app.get("/api/tasks", (req, res) => {
      res.json(tasks);
    });

    // Lägg till en ny task
    app.post("/api/tasks", (req, res) => {
      const { name, date } = req.body;
      tasks.push({ name, date, done: false });
      this.sendSocketNotification("TASKS_UPDATE", tasks);
      res.status(201).json(tasks);
    });

    // Starta server på alla nätverksgränssnitt
    app.listen(port, "0.0.0.0", () => {
      console.log(`MMM-Chores admin running at http://0.0.0.0:${port}`);
    });
  }
});
