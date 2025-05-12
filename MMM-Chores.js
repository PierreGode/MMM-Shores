/* Magic Mirror² Module: MMM-Chores */
Module.register("MMM-Chores", {
  defaults: {
    updateInterval: 60 * 1000,   // update every minute
    adminPort: 5003,             // admin page port
    showDays: 1                  // how many days of tasks to show (1 = today only)
  },

  start() {
    this.tasks = [];
    this.people = [];
    this.sendSocketNotification("INIT_SERVER", this.config);
    this.scheduleUpdate();
  },

  getStyles() {
    return ["MMM-Chores.css"];
  },

  scheduleUpdate() {
    setInterval(() => this.updateDom(), this.config.updateInterval);
  },

  socketNotificationReceived(notification, payload) {
    if (notification === "TASKS_UPDATE") {
      this.tasks = payload;
      this.updateDom();
    }
    if (notification === "PEOPLE_UPDATE") {
      this.people = payload;
      this.updateDom();
    }
  },

  /**
   * Returns true if `taskDate` is within the next `this.config.showDays` days (inclusive).
   */
  isInRange(taskDate) {
    const showDays = parseInt(this.config.showDays, 10);
    const today = new Date();
    // Normalize to midnight:
    today.setHours(0, 0, 0, 0);
    const target = new Date(taskDate);
    target.setHours(0, 0, 0, 0);
    const diffMs = target - today;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays < showDays;
  },

  getPersonName(id) {
    const p = this.people.find(p => p.id === id);
    return p ? p.name : "";
  },

  getDom() {
    const wrapper = document.createElement("div");

    // Module header
    const header = document.createElement("div");
    header.innerHTML = "MMM-Chores";
    header.className = "bright large";
    wrapper.appendChild(header);

    // Filter tasks by date range
    const visibleTasks = this.tasks.filter(t => this.isInRange(t.date));

    if (visibleTasks.length === 0) {
      const emptyEl = document.createElement("div");
      emptyEl.className = "small dimmed";
      emptyEl.innerHTML = "No tasks in range 🎉";
      wrapper.appendChild(emptyEl);
      return wrapper;
    }

    // Task list
    const ul = document.createElement("ul");
    ul.className = "normal";

    visibleTasks.forEach(task => {
      const li = document.createElement("li");
      li.className = "small";

      // Checkbox indicator
      const cb = document.createElement("span");
      cb.innerHTML = task.done ? "✅" : "⬜";
      cb.style.marginRight = "8px";
      li.appendChild(cb);

      // Task text
      const text = document.createTextNode(`${task.name} (${task.date})`);
      li.appendChild(text);

      // Assigned person
      if (task.assignedTo) {
        const person = this.getPersonName(task.assignedTo);
        const assignedEl = document.createElement("span");
        assignedEl.className = "xsmall dimmed";
        assignedEl.innerHTML = ` — ${person}`;
        assignedEl.style.marginLeft = "6px";
        li.appendChild(assignedEl);
      }

      ul.appendChild(li);
    });

    wrapper.appendChild(ul);
    return wrapper;
  }
});
