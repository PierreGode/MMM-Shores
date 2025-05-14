// ==========================
// admin.js — Theme Toggle + Existing Logic
// ==========================

// ---------- THEME TOGGLE SETUP ----------
const root        = document.documentElement;
const themeTgl    = document.getElementById("themeToggle");
const themeIcon   = document.getElementById("themeIcon");
const STORAGE_KEY = "mmm-chores-theme";

// Read saved theme (or default to light)
const savedTheme  = localStorage.getItem(STORAGE_KEY) || "light";
root.setAttribute("data-theme", savedTheme);
themeTgl.checked = (savedTheme === "dark");
setIcon(savedTheme);

// When user flips the switch
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
// ---------------------------------------

// ==========================
// admin.js — Dashboard + Analytics
// ==========================

// UI elements
const personForm   = document.getElementById("personForm");
const personList   = document.getElementById("peopleList");
const taskForm     = document.getElementById("taskForm");
const taskList     = document.getElementById("taskList");

// Chart.js instances
let chartWeekly, chartWeekdays, chartPerPerson;

// Caches
let peopleCache = [];
let tasksCache  = [];

/**
 * Helper: today’s date in YYYY-MM-DD
 */
function getTodayDate() {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0")
  ].join("-");
}

// ==========================
// Data Fetch & Render
// ==========================

async function fetchPeople() {
  const res = await fetch("/api/people");
  peopleCache = await res.json();
  renderPeople(peopleCache);
}

async function fetchTasks() {
  const res = await fetch("/api/tasks");
  tasksCache = await res.json();
  renderTasks(tasksCache, peopleCache);
  renderAnalytics(tasksCache, peopleCache);
}

// ==========================
// Render Functions
// ==========================

function renderPeople(people) {
  personList.innerHTML = "";
  people.forEach(p => {
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

  if (people.length === 0) {
    const li = document.createElement("li");
    li.className = "list-group-item text-center text-muted";
    li.textContent = "No people added";
    personList.appendChild(li);
  }
}

function renderTasks(tasks, people) {
  taskList.innerHTML = "";

  if (tasks.length === 0) {
    const li = document.createElement("li");
    li.className = "list-group-item text-center text-muted";
    li.textContent = "No tasks added";
    taskList.appendChild(li);
    return;
  }

  tasks.forEach(t => {
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";

    // Left: checkbox + task text
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

    // Middle: assignment dropdown
    const select = document.createElement("select");
    select.className = "form-select mx-3";
    select.add(new Option("Unassigned", ""));
    people.forEach(p => {
      const opt = new Option(p.name, p.id);
      if (t.assignedTo === p.id) opt.selected = true;
      select.add(opt);
    });
    select.addEventListener("change", () => {
      const val = select.value ? parseInt(select.value, 10) : null;
      updateTask(t.id, { assignedTo: val });
    });

    // Right: delete button
    const del = document.createElement("button");
    del.className = "btn btn-sm btn-outline-danger";
    del.innerHTML = '<i class="bi bi-trash"></i>';
    del.addEventListener("click", () => deleteTask(t.id));

    li.appendChild(left);
    li.appendChild(select);
    li.appendChild(del);
    taskList.appendChild(li);
  });
}

// ==========================
// Analytics Rendering
// ==========================

function renderAnalytics(tasks, people) {
  // Tasks Completed Per Week (last 4 weeks)
  const today = new Date();
  const weeklyCounts = [];
  const weekLabels = [];
  for (let i = 3; i >= 0; i--) {
    const day = new Date(today);
    day.setDate(today.getDate() - i * 7);
    const label = `${day.getFullYear()}-${String(day.getMonth()+1).padStart(2,'0')}-${String(day.getDate()).padStart(2,'0')}`;
    weekLabels.push(label);

    const count = tasks.filter(t => {
      if (!t.done) return false;
      const d = new Date(t.date);
      const diffDays = Math.floor((today - d)/(1000*60*60*24));
      return diffDays >= i*7 && diffDays < (i+1)*7;
    }).length;
    weeklyCounts.push(count);
  }
  updateChart(chartWeekly, weekLabels, weeklyCounts);

  // Busiest Weekdays
  const dayLabels = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const dayCounts = [0,0,0,0,0,0,0];
  tasksCache.forEach(t => {
    const d = new Date(t.date);
    dayCounts[d.getDay()]++;
  });
  updateChart(chartWeekdays, dayLabels, dayCounts);

  // Chores Per Person
  const personLabels = people.map(p => p.name);
  const personCounts = people.map(p => tasksCache.filter(t => t.assignedTo === p.id).length);
  updateChart(chartPerPerson, personLabels, personCounts);
}

/**
 * New: Taskmaster This Month
 * Bar chart of completed tasks per person in current month
 */
function renderTaskmasterChart(canvasId) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const labels = peopleCache.map(p => p.name);
  const counts = peopleCache.map(p =>
    tasksCache.filter(t => {
      if (!t.done) return false;
      const d = new Date(t.date);
      return d.getFullYear() === year && d.getMonth() === month && t.assignedTo === p.id;
    }).length
  );

  const ctx = document.getElementById(canvasId).getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Tasks Done This Month",
        data: counts,
        backgroundColor: "rgba(255,159,64,0.5)",
        borderColor: "rgba(255,159,64,1)",
        borderWidth: 1
      }]
    },
    options: { scales: { y: { beginAtZero: true } } }
  });
}

// Utility to update a Chart.js chart
function updateChart(chart, labels, data) {
  chart.data.labels = labels;
  chart.data.datasets[0].data = data;
  chart.update();
}

// ==========================
// CRUD Handlers
// ==========================

personForm.addEventListener("submit", async e => {
  e.preventDefault();
  const name = document.getElementById("personName").value.trim();
  if (!name) return;
  await fetch("/api/people", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name })
  });
  personForm.reset();
  await fetchPeople();
  await fetchTasks();
});

taskForm.addEventListener("submit", async e => {
  e.preventDefault();
  const name = document.getElementById("taskName").value.trim();
  let date = document.getElementById("taskDate").value;
  if (!name) return;
  if (!date) date = getTodayDate();
  await fetch("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, date })
  });
  taskForm.reset();
  await fetchTasks();
});

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
// Chart Initialization & Initial Load
// ==========================

document.addEventListener("DOMContentLoaded", () => {
  const ctxW = document.getElementById("chartWeekly").getContext("2d");
  chartWeekly = new Chart(ctxW, {
    type: "bar",
    data: {
      labels: [],
      datasets: [{
        label: "Completed",
        data: [],
        backgroundColor: "rgba(75,192,192,0.5)",
        borderColor: "rgba(75,192,192,1)",
        borderWidth: 1
      }]
    },
    options: { scales: { y: { beginAtZero: true } } }
  });

  const ctxD = document.getElementById("chartWeekdays").getContext("2d");
  chartWeekdays = new Chart(ctxD, {
    type: "pie",
    data: {
      labels: [],
      datasets: [{
        data: [],
        backgroundColor: [
          "#FF6384","#36A2EB","#FFCE56","#4BC0C0","#9966FF","#FF9F40","#C9CBCF"
        ]
      }]
    },
    options: {}
  });

  const ctxP = document.getElementById("chartPerPerson").getContext("2d");
  chartPerPerson = new Chart(ctxP, {
    type: "bar",
    data: {
      labels: [],
      datasets: [{
        label: "Assigned Tasks",
        data: [],
        backgroundColor: "rgba(153,102,255,0.5)",
        borderColor: "rgba(153,102,255,1)",
        borderWidth: 1
      }]
    },
    options: { scales: { y: { beginAtZero: true } } }
  });

  // Load data
  fetchPeople().then(fetchTasks);

  // ==========================
  // START: Analytics Dashboard GridStack integration
  // ==========================
  const grid = GridStack.init({
    column: 6,
    disableOneColumnMode: true,   // ← disable mobile single-column mode
    mobileBreakpoint: 0,          // ← never switch to mobile mode
    float: false,
    cellHeight: 120,
    resizable: { handles: 'all' },
    draggable: { handle: '.card-header' }
  });

  // Load saved layout
  const saved = localStorage.getItem('analyticsLayout');
  if (saved) {
    grid.removeAll();
    grid.load(JSON.parse(saved));
    grid.engine.nodes.forEach(n => {
      const canvas = n.el.querySelector('canvas');
      if (!canvas) return;
      if (canvas.id.startsWith('chartWeekly'))    renderWeeklyChart(canvas.id);
      if (canvas.id.startsWith('chartWeekdays'))  renderWeekdaysChart(canvas.id);
      if (canvas.id.startsWith('chartPerPerson')) renderPerPersonChart(canvas.id);
      if (canvas.id.includes('taskmaster'))       renderTaskmasterChart(canvas.id);
    });
  }

  // Persist on layout change
  grid.on('change', () => {
    localStorage.setItem('analyticsLayout', JSON.stringify(grid.save()));
  });

  // Edit-mode toggle
  const editBtn      = document.getElementById('analyticsEditBtn');
  const widgetSelect = document.getElementById('widgetSelect');
  let editing = false;

  editBtn.addEventListener('click', () => {
    editing = !editing;
    document.querySelector('.grid-stack').classList.toggle('editing', editing);
    grid.setStatic(!editing);
    widgetSelect.classList.toggle('d-none', !editing);
    editBtn.textContent = editing ? 'Done Editing' : 'Edit Dashboard';
  });

  // Add new widget
  widgetSelect.addEventListener('change', () => {
    const preset = widgetSelect.value;
    if (!preset) return;

    let header, renderFn;
    switch (preset) {
      case 'tasksWeekly':
        header   = 'Tasks Completed Per Week';
        renderFn = renderWeeklyChart;
        break;
      case 'busiestWeekdays':
        header   = 'Busiest Weekdays';
        renderFn = renderWeekdaysChart;
        break;
      case 'choresPerPerson':
        header   = 'Chores Per Person';
        renderFn = renderPerPersonChart;
        break;
      case 'taskmaster':
        header   = 'Taskmaster This Month';
        renderFn = renderTaskmasterChart;
        break;
      default:
        return;
    }

    const id = `${preset}-${Date.now()}`;
    const item = document.createElement('div');
    item.classList.add('grid-stack-item');
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

  // Remove widget
  document.querySelector('.grid-stack').addEventListener('click', e => {
    if (e.target.classList.contains('remove-widget')) {
      grid.removeWidget(e.target.closest('.grid-stack-item'));
    }
  });
  // ==========================
  // END: Analytics Dashboard GridStack integration
  // ==========================
});

// Auto-refresh every 30 sec
setInterval(fetchTasks, 30 * 1000);
