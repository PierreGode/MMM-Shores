/* Magic Mirror² Module: MMM-Chores */
Module.register("MMM-Chores", {
  defaults: {
    updateInterval: 60 * 1000,    // update every minute
    adminPort: 5003               // admin page port
  },

  start() {
    this.tasks = [];
    this.sendSocketNotification("INIT_SERVER", this.config);
    this.scheduleUpdate();
  },

  getStyles() {
    return ["MMM-Chores.css"];
  },

  scheduleUpdate() {
    setInterval(() => {
      this.updateDom();
    }, this.config.updateInterval);
  },

  socketNotificationReceived(notification, payload) {
    if (notification === "TASKS_UPDATE") {
      this.tasks = payload;
      this.updateDom();
    }
  },

  getDom() {
    const wrapper = document.createElement("div");

    // Module header
    const header = document.createElement("div");
    header.innerHTML = "MMM-Chores";
    header.className = "bright large";
    wrapper.appendChild(header);

    // If no tasks
    if (this.tasks.length === 0) {
      const emptyEl = document.createElement("div");
      emptyEl.className = "small dimmed";
      emptyEl.innerHTML = "No tasks for today 🎉";
      wrapper.appendChild(emptyEl);
      return wrapper;
    }

    // Task list
    const ul = document.createElement("ul");
    this.tasks.forEach(task => {
      const li = document.createElement("li");
      li.className = "small";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = task.done;
      checkbox.disabled = true; // only admin page can toggle
      li.appendChild(checkbox);

      const text = document.createTextNode(` ${task.name} (${task.date})`);
      li.appendChild(text);

      if (task.done) {
        li.style.textDecoration = "line-through";
        li.style.opacity = "0.6";
      }

      ul.appendChild(li);
    });
    wrapper.appendChild(ul);

    return wrapper;
  }
});
