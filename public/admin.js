// ==========================
// ADMIN.JS with Analytics
// ==========================

// UI elements
const personForm = document.getElementById("personForm");
const personList = document.getElementById("peopleList");
const taskForm   = document.getElementById("taskForm");
const taskList   = document.getElementById("taskList");

// Chart.js instances
let chartWeekly, chartWeekdays, chartPerPerson;

// Fetch initial data
let peopleCache = [];
let tasksCache  = [];

// Helper: today’s date in YYYY-MM-DD
function getTodayDate() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

// FETCH DATA functions
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

// RENDER PEOPLE
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
}

// RENDER TASKS
function renderTasks(tasks, people) {
  taskList.innerHTML = "";
  if (tasks.length === 0) {
    const li = document.createElement("li");
    li.className = "list-group-item text-center text-muted";
    li.textContent = "No tasks 🎉";
    taskList.appendChild(li);
    return;
  }
  tasks.forEach(t => {
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";
    // left: checkbox & text
    const left = document.createElement("div"); left.className = "d-flex align-items-center";
    const chk  = document.createElement("input");
    chk.type = "checkbox"; chk.checked = t.done; chk.className = "form-check-input me-3";
    chk.addEventListener("change", () => updateTask(t.id, { done: chk.checked }));
    const span = document.createElement("span");
    span.innerHTML = `<strong>${t.name}</strong> <small class="text-muted">(${t.date})</small>`;
    if (t.done) span.classList.add("task-done");
    left.append(chk, span);
    // middle: person dropdown
    const select = document.createElement("select"); select.className = "form-select mx-3";
    select.add(new Option("Unassigned",""));
    people.forEach(p => {
      const opt = new Option(p.name,p.id);
      if (t.assignedTo===p.id) opt.selected = true;
      select.add(opt);
    });
    select.addEventListener("change",()=>updateTask(t.id,{assignedTo: select.value?parseInt(select.value):null}));
    // right: delete
    const del = document.createElement("button");
    del.className = "btn btn-sm btn-outline-danger";
    del.innerHTML = '<i class="bi bi-trash"></i>';
    del.addEventListener("click",()=>deleteTask(t.id));
    li.append(left, select, del);
    taskList.appendChild(li);
  });
}

// ANALYTICS RENDERING
function renderAnalytics(tasks, people) {
  // 1. Tasks completed per week (last 4 weeks)
  const today = new Date();
  const weeklyCounts = Array(4).fill(0);
  const labelsWeeks = [];
  for (let i=3; i>=0; i--) {
    const start = new Date(); start.setDate(today.getDate() - i*7);
    const label = `${start.getFullYear()}-${String(start.getMonth()+1).padStart(2,'0')}-${String(start.getDate()).padStart(2,'0')}`;
    labelsWeeks.push(label);
    weeklyCounts[3-i] = tasks.filter(t=>{
      if (!t.done) return false;
      const d=new Date(t.date);
      const diff=(today - d)/(1000*60*60*24);
      return diff >= i*7 && diff < (i+1)*7;
    }).length;
  }
  updateChart(chartWeekly, labelsWeeks, weeklyCounts, 'rgba(75,192,192,0.5)', 'rgba(75,192,192,1)');

  // 2. Busiest weekdays (Mon–Sun)
  const dayCounts = [0,0,0,0,0,0,0];
  const labelsDays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  tasks.forEach(t=>{
    const d = new Date(t.date);
    dayCounts[d.getDay()]++;
  });
  updateChart(chartWeekdays, labelsDays, dayCounts, ['#FF6384','#36A2EB','#FFCE56','#4BC0C0','#9966FF','#FF9F40','#C9CBCF']);

  // 3. Chores per person
  const personLabels = people.map(p=>p.name);
  const personCounts = people.map(p=> tasks.filter(t=>t.assignedTo===p.id).length );
  updateChart(chartPerPerson, personLabels, personCounts, 'rgba(153,102,255,0.5)', 'rgba(153,102,255,1)');
}

// UTILITY: Create or update a chart
function updateChart(chart, labels, data, bg, border) {
  if (!chart) return;
  chart.data.labels = labels;
  chart.data.datasets[0].data = data;
  if (Array.isArray(bg)) {
    chart.data.datasets[0].backgroundColor = bg;
  } else {
    chart.data.datasets[0].backgroundColor = labels.map(()=>bg);
  }
  chart.data.datasets[0].borderColor = border;
  chart.update();
}

// INITIALIZE charts once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const ctxW = document.getElementById('chartWeekly').getContext('2d');
  chartWeekly = new Chart(ctxW, {
    type: 'bar',
    data: { labels: [], datasets: [{ label: 'Completed', data: [], backgroundColor: [], borderColor: [], borderWidth: 1 }]},
    options: { scales: { y: { beginAtZero: true } } }
  });

  const ctxD = document.getElementById('chartWeekdays').getContext('2d');
  chartWeekdays = new Chart(ctxD, {
    type: 'pie',
    data: { labels: [], datasets: [{ data: [], backgroundColor: [], borderColor: [], borderWidth: 1 }]},
    options: {}
  });

  const ctxP = document.getElementById('chartPerPerson').getContext('2d');
  chartPerPerson = new Chart(ctxP, {
    type: 'bar',
    data: { labels: [], datasets: [{ label: 'Assigned Tasks', data: [], backgroundColor: [], borderColor: [], borderWidth: 1 }]},
    options: { scales: { y: { beginAtZero: true } } }
  });

  // initial load
  fetchPeople().then(fetchTasks);
});

// FORM & CRUD handlers (unchanged from previous)
personForm.addEventListener("submit", async e => {
  e.preventDefault();
  const name = document.getElementById("personName").value.trim();
  if (!name) return;
  await fetch("/api/people", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({name}) });
  personForm.reset(); await fetchPeople(); await fetchTasks();
});
taskForm.addEventListener("submit", async e => {
  e.preventDefault();
  const name = document.getElementById("taskName").value.trim();
  let date = document.getElementById("taskDate").value || getTodayDate();
  if (!name) return;
  await fetch("/api/tasks", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({name,date}) });
  taskForm.reset(); await fetchTasks();
});
async function updateTask(id, changes) {
  await fetch(`/api/tasks/${id}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(changes) });
  await fetchTasks();
}
async function deletePerson(id) {
  await fetch(`/api/people/${id}`, { method:"DELETE" });
  await fetchPeople(); await fetchTasks();
}
async function deleteTask(id) {
  await fetch(`/api/tasks/${id}`, { method:"DELETE" });
  await fetchTasks();
}
