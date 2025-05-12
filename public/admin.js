// ==========================
// admin.js — Dashboard + Analytics
// ==========================

// UI elements
const personForm = document.getElementById("personForm");
const personList = document.getElementById("peopleList");
const taskForm   = document.getElementById("taskForm");
const taskList   = document.getElementById("taskList");

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

/**
 * Fetch people from API and render
 */
async function fetchPeople() {
  try {
    const res = await fetch("/api/people");
    peopleCache = await res.json();
    renderPeople(peopleCache);
  } catch (e) {
    console.error("Could not fetch people:", e);
  }
}

/**
 * Fetch tasks from API, render tasks and analytics
 */
async function fetchTasks() {
  try {
    const res = await fetch("/api/tasks");
    tasksCache = await res.json();
    renderTasks(tasksCache, peopleCache);
    renderAnalytics(tasksCache, peopleCache);
  } catch (e) {
    console.error("Could not fetch tasks:", e);
  }
}

/**
 * Render the list of people
 */
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

/**
 * Render the list of tasks with checkboxes, assign dropdown, delete
 */
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

/**
 * Render analytics charts
 */
function renderAnalytics(tasks, people) {
  // 1. Tasks Completed Per Week (last 4 weeks)
  const today = new Date();
  const weeklyCounts = [];
  const weekLabels = [];
  for (let i = 3; i >= 0; i--) {
    const end = new Date(today);
    end.setDate(today.getDate() - i * 7);
    const label = `${end.getFullYear()}-${String(end.getMonth()+1).padStart(2,'0')}-${String(end.getDate()).padStart(2,'0')}`;
    weekLabels.push(label);

    const count = tasks.filter(t => {
      if (!t.done) return false;
      const d = new Date(t.date);
      const diff = (today - d) / (1000*60*60*24);
      return diff >= i*7 && diff < (i+1)*7;
    }).length;
    weeklyCounts.push(count);
  }
  updateChart(chartWeekly, weekLabels, weeklyCounts);

  // 2. Busiest Weekdays
  const dayLabels = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const dayCounts = [0,0,0,0,0,0,0];
  tasks.forEach(t => {
    const d = new Date(t.date);
    dayCounts[d.getDay()]++;
  });
  updateChart(chartWeekdays, dayLabels, dayCounts);

  // 3. Chores Per Person
  const personLabels = people.map(p => p.name);
  const personCounts = people.map(p => tasks.filter(t => t.assignedTo === p.id).length);
  updateChart(chartPerPerson, personLabels, personCounts);
}

/**
 * Update or redraw a Chart.js instance
 */
function updateChart(chart, labels, data) {
  chart.data.labels = labels;
  chart.data.datasets[0].data = data;
  chart.update();
}

/**
 * CRUD handlers
 */
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

/**
 * Initialize charts and load data on DOM ready
 */
document.addEventListener("DOMContentLoaded", () => {
  // Weekly bar chart
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

  // Weekday pie chart
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

  // Per-person bar chart
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

  // Load initial data
  fetchPeople().then(fetchTasks);
});
