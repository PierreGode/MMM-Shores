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
// DOM Elements & State
// ==========================
const personForm = document.getElementById("personForm");
const personList = document.getElementById("peopleList");
const taskForm = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");

let chartWeekly, chartWeekdays, chartPerPerson;
let peopleCache = [];
let tasksCache = [];

// ==========================
// Helpers
// ==========================
function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// ==========================
// CRUD
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
  renderAnalytics();
}

async function updateTask(id, changes) {
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
// Render People & Tasks
// ==========================
function renderPeople() {
  personList.innerHTML = "";
  if (peopleCache.length === 0) {
    const li = document.createElement("li");
    li.className = "list-group-item text-center text-muted";
    li.textContent = "No people added";
    personList.appendChild(li);
    return;
  }

  peopleCache.forEach(p => {
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";
    li.textContent = p.name;

    const del = document.createElement("button");
    del.className = "btn btn-sm btn-outline-danger";
    del.innerHTML = '<i class="bi bi-trash"></i>';
    del.addEventListener("click", () => deletePerson(p.id));

    li.appendChild(del);
    personList.appendChild(li);
  });
}

function renderTasks() {
  taskList.innerHTML = "";

  if (tasksCache.length === 0) {
    const li = document.createElement("li");
    li.className = "list-group-item text-center text-muted";
    li.textContent = "No tasks added";
    taskList.appendChild(li);
    return;
  }

  tasksCache.forEach(t => {
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";

    const left = document.createElement("div");
    left.className = "d-flex align-items-center";

    const chk = document.createElement("input");
    chk.type = "checkbox";
    chk.checked = t.done;
    chk.className = "form-check-input me-3";
    chk.addEventListener("change", () => updateTask(t.id, { done: chk.checked }));

    const span = document.createElement("span");
    span.innerHTML = `<strong>${t.name}</strong> <small class="text-muted">(${t.date})</small>`;
    if (t.done) span.classList.add("task-done");

    left.appendChild(chk);
    left.appendChild(span);

    const select = document.createElement("select");
    select.className = "form-select mx-3";
    select.add(new Option("Unassigned", ""));
    peopleCache.forEach(p => {
      const opt = new Option(p.name, p.id);
      if (t.assignedTo === p.id) opt.selected = true;
      select.add(opt);
    });
    select.addEventListener("change", () => {
      const val = select.value ? parseInt(select.value, 10) : null;
      updateTask(t.id, { assignedTo: val });
    });

    const del = document.createElement("button");
    del.className = "btn btn-sm btn-outline-danger";
    del.innerHTML = '<i class="bi bi-trash"></i>';
    del.addEventListener("click", () => deleteTask(t.id));

    li.append(left, select, del);
    taskList.appendChild(li);
  });
}

// ==========================
// Analytics Charts
// ==========================
function updateChart(chart, labels, data) {
  chart.data.labels = labels;
  chart.data.datasets[0].data = data;
  chart.update();
}

function renderAnalytics() {
  const today = new Date();

  // Weekly
  const weekLabels = [], weekCounts = [];
  for (let i = 3; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i * 7);
    const label = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    weekLabels.push(label);

    const count = tasksCache.filter(t => {
      if (!t.done) return false;
      const td = new Date(t.date);
      const diff = Math.floor((today - td) / (1000 * 60 * 60 * 24));
      return diff >= i * 7 && diff < (i + 1) * 7;
    }).length;
    weekCounts.push(count);
  }
  updateChart(chartWeekly, weekLabels, weekCounts);

  // Weekdays
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const counts = [0,0,0,0,0,0,0];
  tasksCache.forEach(t => {
    const d = new Date(t.date);
    counts[d.getDay()]++;
  });
  updateChart(chartWeekdays, days, counts);

  // Per Person
  const labels = peopleCache.map(p => p.name);
  const perCounts = peopleCache.map(p =>
    tasksCache.filter(t => t.assignedTo === p.id).length
  );
  updateChart(chartPerPerson, labels, perCounts);
}

// ==========================
// DOM Loaded
// ==========================
document.addEventListener("DOMContentLoaded", () => {
  // Charts
  chartWeekly = new Chart(document.getElementById("chartWeekly").getContext("2d"), {
    type: "bar",
    data: { labels: [], datasets: [{ label: "Completed", data: [], backgroundColor: "rgba(75,192,192,.5)", borderColor: "rgba(75,192,192,1)", borderWidth: 1 }] },
    options: { scales: { y: { beginAtZero: true } } }
  });

  chartWeekdays = new Chart(document.getElementById("chartWeekdays").getContext("2d"), {
    type: "pie",
    data: { labels: [], datasets: [{ data: [], backgroundColor: ["#FF6384","#36A2EB","#FFCE56","#4BC0C0","#9966FF","#FF9F40","#C9CBCF"] }] },
    options: {}
  });

  chartPerPerson = new Chart(document.getElementById("chartPerPerson").getContext("2d"), {
    type: "bar",
    data: { labels: [], datasets: [{ label: "Assigned Tasks", data: [], backgroundColor: "rgba(153,102,255,.5)", borderColor: "rgba(153,102,255,1)", borderWidth: 1 }] },
    options: { scales: { y: { beginAtZero: true } } }
  });

  // Initial fetch
  fetchPeople().then(fetchTasks);

  // GridStack init with responsive breakpoints
  const grid = GridStack.init({
    column: 6,
    float: false,
    cellHeight: 120,
    columnOpts: {
      breakpoints: [
        { w: 576, c: 1 },
        { w: 768, c: 2 },
        { w: 992, c: 4 }
      ]
    },
    resizable: { handles: 'all' },
    draggable: { handle: '.card-header' }
  });

  // Load saved layout
  const saved = localStorage.getItem('analyticsLayout');
  if (saved) {
    grid.load(JSON.parse(saved));
    grid.engine.nodes.forEach(n => {
      const c = n.el.querySelector('canvas');
      if (c?.id?.includes('taskmaster')) renderTaskmasterChart(c.id);
    });
  }

  // Save layout
  grid.on('change', () => {
    localStorage.setItem('analyticsLayout', JSON.stringify(grid.save()));
  });

  // Edit mode
  const editBtn = document.getElementById('analyticsEditBtn');
  const widgetSelect = document.getElementById('widgetSelect');
  let editing = false;

  editBtn.addEventListener('click', () => {
    editing = !editing;
    grid.el.classList.toggle('editing', editing);
    grid.setStatic(!editing);
    widgetSelect.classList.toggle('d-none', !editing);
    editBtn.textContent = editing ? "Done Editing" : "Edit Dashboard";
  });

  widgetSelect.addEventListener('change', () => {
    const preset = widgetSelect.value;
    if (!preset) return;

    let header, renderFn;
    switch (preset) {
      case 'tasksWeekly': header = 'Tasks Completed Per Week'; renderFn = renderWeeklyChart; break;
      case 'busiestWeekdays': header = 'Busiest Weekdays'; renderFn = renderWeekdaysChart; break;
      case 'choresPerPerson': header = 'Chores Per Person'; renderFn = renderPerPersonChart; break;
      case 'taskmaster': header = 'Taskmaster This Month'; renderFn = renderTaskmasterChart; break;
    }

    const id = `${preset}-${Date.now()}`;
    const item = document.createElement('div');
    item.className = 'grid-stack-item';
    item.setAttribute('gs-w', '2');
    item.setAttribute('gs-h', '2');
    item.innerHTML = `
      <div class="grid-stack-item-content card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <span>${header}</span>
          <button class="btn btn-sm btn-outline-danger remove-widget">&times;</button>
        </div>
        <div class="card-body">
          <canvas id="${id}"></canvas>
        </div>
      </div>`;
    grid.addWidget(item);
    renderFn(id);
    widgetSelect.value = '';
  });

  grid.el.addEventListener('click', e => {
    if (e.target.classList.contains('remove-widget')) {
      grid.removeWidget(e.target.closest('.grid-stack-item'));
    }
  });
});

// ==========================
// Auto Refresh
// ==========================
setInterval(fetchTasks, 30000);

// ==========================
// Taskmaster Chart
// ==========================
function renderTaskmasterChart(canvasId) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const labels = peopleCache.map(p => p.name);
  const data = peopleCache.map(p =>
    tasksCache.filter(t => {
      const d = new Date(t.date);
      return t.done && t.assignedTo === p.id && d.getMonth() === month && d.getFullYear() === year;
    }).length
  );
  const ctx = document.getElementById(canvasId).getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Tasks Done This Month",
        data,
        backgroundColor: "rgba(255,159,64,0.5)",
        borderColor: "rgba(255,159,64,1)",
        borderWidth: 1
      }]
    },
    options: { scales: { y: { beginAtZero: true } } }
  });
}
