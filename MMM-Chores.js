Module.register("MMM-Chores", {
  defaults: {
    updateInterval: 60 * 1000,
    adminPort: 5003,
    showDays: 1,
    showPast: false,
    dateFormatting: "yyyy-mm-dd" // Standardformat, kan ändras i config
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
      if (task.done) {
        if (task.finished) {
          const fin = new Date(task.finished);
          fin.setHours(0, 0, 0, 0);
          if (fin.getTime() === today.getTime()) return true;
        }
        return false;
      }
      return showPast;
    }
    return diffDays < showDays;
  },

  getPersonName(id) {
    const p = this.people.find(p => p.id === id);
    return p ? p.name : "";
  },

  async toggleDone(task) {
    try {
      const now = new Date();
      const iso = now.toISOString();
      const pad = n => n.toString().padStart(2, "0");
      const stamp = prefix => (
        prefix + pad(now.getMonth() + 1) + pad(now.getDate()) + pad(now.getHours()) + pad(now.getMinutes())
      );

      const body = { done: !task.done };
      if (!task.done) {
        body.finished = iso;
        body.finishedShort = stamp("F");
      } else {
        body.finished = null;
        body.finishedShort = null;
      }

      await fetch(`/api/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
    } catch (e) {
      Log && Log.error ? Log.error(e) : console.error(e);
    }
  },

  formatDate(dateStr) {
    if (!dateStr) return "";
    const match = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return dateStr;
    const [ , yyyy, mm, dd ] = match;

    // Use module config for formatting. If set to empty string, hide the date
    // entirely. Only fall back to the default when no value is specified.
    let result =
      this.config.dateFormatting !== undefined &&
      this.config.dateFormatting !== null
        ? this.config.dateFormatting
        : "yyyy-mm-dd";

    if (result === "") return "";

    // Ersätt både små och stora bokstäver för yyyy, mm, dd
    result = result.replace(/yyyy/gi, yyyy);
    result = result.replace(/mm/gi, mm);
    result = result.replace(/dd/gi, dd);

    // Extra stöd för stora bokstäver som kan missas pga regex
    // (Om användaren skriver t.ex "DD" istället för "dd")
    result = result.replace(/YYYY/g, yyyy);
    result = result.replace(/MM/g, mm);
    result = result.replace(/DD/g, dd);

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
