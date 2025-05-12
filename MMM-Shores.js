/* Magic Mirror² Module: MMM-Shores */
Module.register("MMM-Shores", {
  defaults: {
    updateInterval: 60 * 1000,    // uppdatera varje minut
    adminPort: 8080
  },

  start() {
    this.tasks = [];
    this.sendSocketNotification("INIT_SERVER", this.config);
    this.scheduleUpdate();
  },

  getStyles() {
    return ["MMM-Shores.css"];  // om du vill lägga till egen styling
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

    // Visa dagens datum
    const dateEl = document.createElement("div");
    const now = new Date();
    dateEl.innerHTML = now.toLocaleDateString();
    dateEl.className = "bright medium";
    wrapper.appendChild(dateEl);

    // Lista tasks
    const ul = document.createElement("ul");
    this.tasks.forEach(task => {
      const li = document.createElement("li");
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = task.done;
      checkbox.disabled = true; // endast admin kan ändra
      li.appendChild(checkbox);
      li.appendChild(document.createTextNode(` ${task.name} (${task.date})`));
      ul.appendChild(li);
    });
    wrapper.appendChild(ul);

    return wrapper;
  }
});
