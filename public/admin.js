// ==========================
// Theme Toggle
// ==========================
const root = document.documentElement;
const themeTgl = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");
const STORAGE_KEY = "mmm-chores-theme";

const savedTheme = localStorage.getItem(STORAGE_KEY) || "light";
root.setAttribute("data-theme", savedTheme);
themeTgl.checked = savedTheme === "dark";
setIcon(savedTheme);

themeTgl.addEventListener("change", () => {
  const theme = themeTgl.checked ? "dark" : "light";
  root.setAttribute("data-theme", theme);
  localStorage.setItem(STORAGE_KEY, theme);
  setIcon(theme);
});

function setIcon(theme) {
  themeIcon.className = theme === "dark"
    ? "bi bi-moon-stars-fill"
    : "bi bi-brightness-high-fill";
}

// ==========================
// State
// ==========================
let peopleCache = [];
let tasksCache = [];
let chartInstances = {};
let chartIdCounter = 0;

let boardTitleMap = {};

// ==========================
// Helper to get current translations
// ==========================
function getCurrentTranslations() {
  return window.LANGUAGES ? window.LANGUAGES[localStorage.getItem("mmm-chores-lang") || "en"] : null;
}

function updateBoardTitleMap() {
  const t = getCurrentTranslations();
  if (t && t.chartOptions) {
    boardTitleMap = { ...t.chartOptions };
  } else {
    boardTitleMap = {
      weekly: "Tasks Completed Per Week",
      weekdays: "Busiest Weekdays",
      perPerson: "Chores Per Person",
      taskmaster: "Taskmaster This Month",
      lazyLegends: "Lazy Legends",
      speedDemons: "Speed Demons",
      weekendWarriors: "Weekend Warriors",
      slacker9000: "Slacker Detector 9000"
    };
  }
}

// ==========================
// Fetch People & Tasks
// ==========================
async function fetchPeople() {
  const res = await fetch("/api/people");
  peopleCache = await res.json();
  renderPeople();
}

async function fetchTasks() {
  const res = await fetch("/api/tasks");
  tasksCache = await res.json();
  renderTasks();
}

// ==========================
// Render People & Tasks
// ==========================
function renderPeople() {
  const t = getCurrentTranslations() || { noPeople: "No people added" };
  const list = document.getElementById("peopleList");
  list.innerHTML = "";

  if (peopleCache.length === 0) {
    const li = document.createElement("li");
    li.className = "list-group-item text-center text-muted";
    li.textContent = t.noPeople;
    list.appendChild(li);
    return;
  }

  for (const person of peopleCache) {
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";
    li.textContent = person.name;

    const btn = document.createElement("button");
    btn.className = "btn btn-sm btn-outline-danger";
    btn.innerHTML = '<i class="bi bi-trash"></i>';
    btn.onclick = () => deletePerson(person.id);

    li.appendChild(btn);
    list.appendChild(li);
  }
}

function renderTasks() {
  const t = getCurrentTranslations() || { noTasks: "No tasks added", unassigned: "Unassigned" };
  const list = document.getElementById("taskList");
  list.innerHTML = "";

  if (tasksCache.length === 0) {
    const li = document.createElement("li");
    li.className = "list-group-item text-center text-muted";
    li.textContent = t.noTasks;
    list.appendChild(li);
    return;
  }

  for (const task of tasksCache) {
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";

    const left = document.createElement("div");
    left.className = "d-flex align-items-center";

    const chk = document.createElement("input");
    chk.type = "checkbox";
    chk.checked = task.done;
    chk.className = "form-check-input me-3";
    chk.addEventListener("change", async () => {
      const updateObj = { done: chk.checked };

      const now = new Date();
      const iso = now.toISOString();

      const pad = n => n.toString().padStart(2, "0");
      const stamp = (prefix) => (
        prefix +
        pad(now.getMonth() + 1) +
        pad(now.getDate()) +
        pad(now.getHours()) +
        pad(now.getMinutes())
      );

      if (chk.checked) {
        updateObj.finished = iso;
        updateObj.finishedShort = stamp("F");
      } else {
        updateObj.finished = null;
        updateObj.finishedShort = null;
      }
      await updateTask(task.id, updateObj);
    });

    const span = document.createElement("span");
    span.innerHTML = `<strong>${task.name}</strong> <small class="text-muted">(${task.date})</small>`;
    if (task.done) span.classList.add("task-done");

    left.appendChild(chk);
    left.appendChild(span);

    const select = document.createElement("select");
    select.className = "form-select mx-3";

    select.add(new Option(t.unassigned, ""));

    peopleCache.forEach(p => {
      const opt = new Option(p.name, p.id);
      if (task.assignedTo === p.id) opt.selected = true;
      select.add(opt);
    });
    select.addEventListener("change", () => {
      const val = select.value ? parseInt(select.value) : null;
      const updateObj = { assignedTo: val };
      if (val !== task.assignedTo) {
        const now = new Date();
        const iso = now.toISOString();
        const pad = n => n.toString().padStart(2, "0");
        const stamp = (prefix) => (
          prefix +
          pad(now.getMonth() + 1) +
          pad(now.getDate()) +
          pad(now.getHours()) +
          pad(now.getMinutes())
        );
        updateObj.assignedDate = iso;
        updateObj.assignedDateShort = stamp("A");
      }
      updateTask(task.id, updateObj);
    });

    const del = document.createElement("button");
    del.className = "btn btn-sm btn-outline-danger";
    del.innerHTML = '<i class="bi bi-trash"></i>';
    del.addEventListener("click", () => deleteTask(task.id));

    li.append(left, select, del);
    list.appendChild(li);
  }
}

// ==========================
// CRUD Handlers
// ==========================
document.getElementById("personForm").addEventListener("submit", async e => {
  e.preventDefault();
  const name = document.getElementById("personName").value.trim();
  if (!name) return;
  await fetch("/api/people", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name })
  });
  e.target.reset();
  await fetchPeople();
  await fetchTasks();
});

document.getElementById("taskForm").addEventListener("submit", async e => {
  e.preventDefault();
  const name = document.getElementById("taskName").value.trim();
  let date = document.getElementById("taskDate").value;
  if (!name) return;
  if (!date) date = new Date().toISOString().split("T")[0];

  const now = new Date();
  const iso = now.toISOString();
  const pad = n => n.toString().padStart(2, "0");
  const stamp = (prefix) => (
    prefix +
    pad(now.getMonth() + 1) +
    pad(now.getDate()) +
    pad(now.getHours()) +
    pad(now.getMinutes())
  );

  await fetch("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      date,
      created: iso,
      createdShort: stamp("C")
    })
  });
  e.target.reset();
  await fetchTasks();
});

async function updateTask(id, changes) {
  Object.keys(changes).forEach(key => {
    if (changes[key] === null) changes[key] = undefined;
  });
  await fetch(`/api/tasks/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(changes)
  });
  await fetchTasks();
}

async function deletePerson(id) {
  await fetch(`/api/people/${id}`, { method: "DELETE" });
  await fetchPeople();
  await fetchTasks();
}

async function deleteTask(id) {
  await fetch(`/api/tasks/${id}`, { method: "DELETE" });
  await fetchTasks();
}

// ==========================
// Analytics Board Persistence
// ==========================
async function fetchSavedBoards() {
  try {
    const res = await fetch('/api/analyticsBoards');
    if (!res.ok) throw new Error('Failed fetching saved boards');
    return await res.json();
  } catch (e) {
    console.warn('No saved analytics boards or error:', e);
    return [];
  }
}

async function saveBoards(typesArray) {
  try {
    await fetch('/api/analyticsBoards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(typesArray)
    });
  } catch (e) {
    console.error('Failed saving analytics boards:', e);
  }
}

function getCurrentBoardTypes() {
  return Array.from(document.querySelectorAll('#analyticsContainer .card-header span'))
    .map(span => {
      const text = span.textContent.trim();
      for (const [key, title] of Object.entries(boardTitleMap)) {
        if (title === text) return key;
      }
      return null;
    }).filter(Boolean);
}

// ==========================
// Analytics Chart Handling
// ==========================
document.getElementById("addChartSelect").addEventListener("change", function () {
  const value = this.value;
  if (!value) return;
  addChart(value);
  this.value = "";
});

function addChart(type) {
  const t = getCurrentTranslations();
  if (!boardTitleMap || Object.keys(boardTitleMap).length === 0) {
    updateBoardTitleMap();
  }
  if (getCurrentBoardTypes().includes(type)) return;

  const container = document.getElementById("analyticsContainer");
  const card = document.createElement("div");
  card.className = "col-md-6";

  const cardId = `chart-${chartIdCounter++}`;
  card.innerHTML = `
    <div class="card card-shadow h-100">
      <div class="card-header d-flex justify-content-between align-items-center">
        <span>${boardTitleMap[type] || type}</span>
        <button class="btn btn-sm btn-outline-danger remove-widget" title="${t ? (t.remove || 'Remove') : 'Remove'}">&times;</button>
      </div>
      <div class="card-body"><canvas id="${cardId}"></canvas></div>
    </div>
  `;

  container.appendChild(card);
  chartInstances[cardId] = renderChart(cardId, type);

  saveBoards(getCurrentBoardTypes());

  card.querySelector(".remove-widget").addEventListener("click", () => {
    chartInstances[cardId].destroy();
    delete chartInstances[cardId];
    card.remove();
    saveBoards(getCurrentBoardTypes());
  });
}

function renderChart(canvasId, type) {
  const t = getCurrentTranslations() || {};
  const ctx = document.getElementById(canvasId).getContext("2d");
  let data = { labels: [], datasets: [] };
  let options = { scales: { y: { beginAtZero: true } } };
  let chartType = "bar";

  switch (type) {
    case "weekly": {
      const today = new Date();
      const labels = [];
      const counts = [];
      for (let i = 3; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i * 7);
        labels.push(d.toISOString().split("T")[0]);
        const c = tasksCache.filter(t => {
          const td = new Date(t.date);
          return t.done && ((today - td) / 86400000) >= i * 7 && ((today - td) / 86400000) < (i + 1) * 7;
        }).length;
        counts.push(c);
      }
      data = {
        labels,
        datasets: [{
          label: t.chartLabels?.completedTasks || "Completed",
          data: counts,
          backgroundColor: "rgba(75,192,192,0.5)"
        }]
      };
      break;
    }

    case "weekdays": {
      chartType = "pie";
      const labels = t ? ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"] : ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
      const dataArr = [0,0,0,0,0,0,0];
      tasksCache.forEach(tk => dataArr[new Date(tk.date).getDay()]++);
      data = {
        labels,
        datasets: [{
          data: dataArr,
          backgroundColor: [
            "#FF6384","#36A2EB","#FFCE56","#4BC0C0","#9966FF","#FF9F40","#C9CBCF"
          ]
        }]
      };
      options = {};
      break;
    }

    case "perPerson": {
      const labels = peopleCache.map(p => p.name);
      const counts = peopleCache.map(p =>
        tasksCache.filter(t => t.assignedTo === p.id).length
      );
      data = {
        labels,
        datasets: [{
          label: t.chartLabels?.completedTasks || "Chores",
          data: counts,
          backgroundColor: "rgba(153,102,255,0.5)"
        }]
      };
      break;
    }

    case "taskmaster": {
      const now = new Date();
      const labels = peopleCache.map(p => p.name);
      const counts = peopleCache.map(p =>
        tasksCache.filter(t => {
          const d = new Date(t.date);
          return t.done && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && t.assignedTo === p.id;
        }).length
      );
      data = {
        labels,
        datasets: [{
          label: t.chartLabels?.completedTasks || "Tasks Done This Month",
          data: counts,
          backgroundColor: "rgba(255,159,64,0.5)"
        }]
      };
      break;
    }

    case "lazyLegends": {
      const labels = peopleCache.map(p => p.name);
      const counts = peopleCache.map(p =>
        tasksCache.filter(t => t.assignedTo === p.id && !t.done).length
      );
      data = {
        labels,
        datasets: [{
          label: t.chartLabels?.unfinishedTasks || "Unfinished Tasks",
          data: counts,
          backgroundColor: "rgba(255,99,132,0.5)"
        }]
      };
      break;
    }

    case "speedDemons": {
      const labels = peopleCache.map(p => p.name);
      const avgDays = peopleCache.map(p => {
        const times = tasksCache
          .filter(t => t.assignedTo === p.id && t.done && t.finished && t.assignedDate)
          .map(t => {
            const dDone = new Date(t.finished);
            const dAssigned = new Date(t.assignedDate);
            return (dDone - dAssigned) / (1000*60*60*24);
          });
        if (times.length === 0) return 0;
        return times.reduce((a,b) => a+b, 0) / times.length;
      });
      data = {
        labels,
        datasets: [{
          label: t.chartLabels?.avgCompletionTime || "Avg Completion Time (days)",
          data: avgDays,
          backgroundColor: "rgba(54,162,235,0.5)"
        }]
      };
      break;
    }

    case "weekendWarriors": {
      const labels = peopleCache.map(p => p.name);
      const counts = peopleCache.map(p =>
        tasksCache.filter(t => {
          if (!t.done || t.assignedTo !== p.id) return false;
          const d = new Date(t.date);
          return d.getDay() === 0 || d.getDay() === 6;
        }).length
      );
      data = {
        labels,
        datasets: [{
          label: t.chartLabels?.weekendTasksCompleted || "Weekend Tasks Completed",
          data: counts,
          backgroundColor: "rgba(255,206,86,0.5)"
        }]
      };
      break;
    }

    case "slacker9000": {
      const labels = peopleCache.map(p => p.name);
      const ages = peopleCache.map(p => {
        const openTasks = tasksCache.filter(t => t.assignedTo === p.id && !t.done && t.assignedDate);
        if (openTasks.length === 0) return 0;
        const now = new Date();
        return Math.max(...openTasks.map(t => (now - new Date(t.assignedDate)) / (1000*60*60*24)));
      });
      data = {
        labels,
        datasets: [{
          label: t.chartLabels?.oldestOpenTaskAge || "Oldest Open Task Age (days)",
          data: ages,
          backgroundColor: "rgba(153,102,255,0.5)"
        }]
      };
      break;
    }

    default:
      data = { labels: [], datasets: [] };
      break;
  }

  const chart = new Chart(ctx, { type: chartType, data, options });
  chart.boardType = type;
  return chart;
}

function updateAllCharts() {
  for (const [id, chart] of Object.entries(chartInstances)) {
    const type = chart.boardType || "weekly";
    const newData = getChartData(type);
    chart.data.labels = newData.labels;
    chart.data.datasets[0].data = newData.datasets[0].data;
    chart.update();
  }
}

function getChartData(type) {
  // Implementera om du vill dynamiskt uppdatera diagramdata (valfritt)
  return { labels: [], datasets: [] };
}

// ==========================
// Initial Load
// ==========================
document.addEventListener("DOMContentLoaded", async () => {
  updateBoardTitleMap();
  await fetchPeople();
  await fetchTasks();

  const savedBoards = await fetchSavedBoards();
  if (savedBoards.length) {
    savedBoards.forEach(type => addChart(type));
  }
});
