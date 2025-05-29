Module.register("MMM-Chores", {
  defaults: {
    updateInterval: 60 * 1000,
    adminPort: 5003,
    showDays: 1,
    showPast: false,
    dateFormatting: "yyyy-mm-dd" // standardformat, kan ändras i config
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
    if (notification === "SETTINGS_UPDATE") {
      // Om du vill uppdatera config live vid settings-ändring
      Object.assign(this.config, payload);
      this.updateDom();
    }
  },

  shouldShowTask(task) {
    const showDays = parseInt(this.config.showDays, 10);
    const showPast = Boolean(this.config.showPast);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tDate = new Date(task.date);
    tDate.setHours(0, 0, 0, 0);

    const diffMs = tDate - today;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return showPast && task.done === false;
    }
    return diffDays < showDays;
  },

  getPersonName(id) {
    const p = this.people.find(p => p.id === id);
    return p ? p.name : "";
  },

  async toggleDone(task) {
    try {
      await fetch(`/api/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ done: !task.done })
      });
    } catch (e) {
      Log && Log.error ? Log.error(e) : console.error(e);
    }
  },

  formatDate(dateStr) {
    const [yyyy, mm, dd] = dateStr.split("-");

    let result = this.config.dateFormatting;

    // Ersätt formatnycklar (case-insensitive)
    result = result.replace(/yyyy/gi, yyyy);
    result = result.replace(/mm/gi, mm);
    result = result.replace(/dd/gi, dd);

    return result;
  },

  getDom() {
    const wrapper = document.createElement("div");

    const header = document.createElement("div");
    header.className = "bright large";
    header.innerHTML = "";
    wrapper.appendChild(header);

    // Filtrerar bort raderade tasks
    const visible = this.tasks.filter(t => !t.deleted && this.shouldShowTask(t));

    if (visible.length === 0) {
      const emptyEl = document.createElement("div");
      emptyEl.className = "small dimmed";
      emptyEl.innerHTML = "No tasks to show 🎉";
      wrapper.appendChild(emptyEl);
      return wrapper;
    }

    const ul = document.createElement("ul");
    ul.className = "normal";

    visible.forEach(task => {
      const li = document.createElement("li");
      li.className = "small";

      const cb = document.createElement("span");
      cb.innerHTML = task.done ? "✅" : "⬜";
      cb.style.marginRight = "8px";
      cb.style.cursor = "pointer";
      cb.title = "Klicka för att markera som klar/inte klar";
      cb.addEventListener("click", () => this.toggleDone(task));
      li.appendChild(cb);

      const dateText = this.formatDate(task.date);
      const text = document.createTextNode(`${task.name} ${dateText}`);
      li.appendChild(text);

      if (task.assignedTo) {
        const person = this.getPersonName(task.assignedTo);
        const assignedEl = document.createElement("span");
        assignedEl.className = "xsmall dimmed";
        assignedEl.style.marginLeft = "6px";
        assignedEl.innerHTML = ` — ${person}`;
        li.appendChild(assignedEl);
      }

      ul.appendChild(li);
    });

    wrapper.appendChild(ul);
    return wrapper;
  }
});
