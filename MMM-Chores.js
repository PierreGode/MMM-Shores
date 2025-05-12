/* Magic Mirror² Module: MMM-Chores */
Module.register("MMM-Chores", {
  defaults: {
    updateInterval: 60 * 1000,  // update every minute
    adminPort: 5003
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
    }
    if (notification === "PEOPLE_UPDATE") {
      this.people = payload;
    }
    this.updateDom();
  },

  getPersonName(id) {
    const p = this.people.find(p => p.id === id);
    return p ? p.name : "";
  },

  getDom() {
    const wrapper = document.createElement("div");

    // Header
    const header = document.createElement("div");
    header.innerHTML = "MMM-Chores";
    header.className = "bright large";
    wrapper.appendChild(header);

    if (this.tasks.length === 0) {
      const emptyEl = document.createElement("div");
      emptyEl.className = "small dimmed";
      emptyEl.innerHTML = "No tasks for today 🎉";
      wrapper.appendChild(emptyEl);
      return wrapper;
    }

    // Task list
    const ul = document.createElement("ul");
    ul.className = "normal";

    this.tasks.forEach(task => {
      const li = document.createElement("li");
      li.className = "small";
      // checkbox indicator
      const cb = document.createElement("span");
      cb.innerHTML = task.done ? "✅" : "⬜";
      cb.style.marginRight = "8px";
      li.appendChild(cb);

      // task text
      const text = document.createTextNode(`${task.name} (${task.date})`);
      li.appendChild(text);

      // assigned person
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
