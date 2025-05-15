/* MagicMirror² Module: MMM-Chores */
Module.register("MMM-Chores", {
  defaults: {
    updateInterval: 60 * 1000,   // update every minute
    adminPort: 5003,             // admin page port
    showDays: 1,                 // how many days from today to show (1 = today only)
    showPast: false,             // whether to include unfinished tasks from past days
    hideYear: false              // hide year in date
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
   * Decide whether a task should be visible:
   * - Past unfinished tasks if showPast = true
   * - Tasks dated today through (showDays-1) days ahead
   */
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
      // it's in the past
      return showPast && task.done === false;
    }
    // diffDays >= 0
    return diffDays < showDays;
  },

  getPersonName(id) {
    const p = this.people.find(p => p.id === id);
    return p ? p.name : "";
  },

  // Gör en PATCH-förfrågan för att toggla task.done
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

  getDom() {
    const wrapper = document.createElement("div");

    // Header
    const header = document.createElement("div");
    header.innerHTML = "";
    header.className = "bright large";
    wrapper.appendChild(header);

    // Filter tasks
    const visible = this.tasks.filter(t => this.shouldShowTask(t));

    if (visible.length === 0) {
      const emptyEl = document.createElement("div");
      emptyEl.className = "small dimmed";
      emptyEl.innerHTML = "No tasks to show 🎉";
      wrapper.appendChild(emptyEl);
      return wrapper;
    }

    // Task list
    const ul = document.createElement("ul");
    ul.className = "normal";

    visible.forEach(task => {
      const li = document.createElement("li");
      li.className = "small";

      // Emoji-indikator (klickbar för att toggla!)
      const cb = document.createElement("span");
      cb.innerHTML = task.done ? "✅" : "⬜";
      cb.style.marginRight = "8px";
      cb.style.cursor = "pointer";
      cb.title = "Klicka för att markera som klar/inte klar";
      cb.addEventListener("click", () => {
        this.toggleDone(task);
      });
      li.appendChild(cb);

      // Datumformattering (med/utan år)
      let dateText;
      if (this.config.hideYear) {
        const [yyyy, mm, dd] = task.date.split("-");
        dateText = `${mm}-${dd}`;
      } else {
        dateText = task.date;
      }

      const text = document.createTextNode(`${task.name} (${dateText})`);
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
