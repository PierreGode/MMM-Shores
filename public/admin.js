/* =======================================================================
 *  admin.js  –  MMM-Chores front-end logic
 *  (theme toggle • CRUD for /api • Chart.js analytics • GridStack dashboard)
 * ===================================================================== */

/* -----------------------------------------------------------------------
 *  1.  THEME TOGGLE
 * -------------------------------------------------------------------- */
const root        = document.documentElement;
const themeTgl    = document.getElementById("themeToggle");
const themeIcon   = document.getElementById("themeIcon");
const STORAGE_KEY = "mmm-chores-theme";

const savedTheme  = localStorage.getItem(STORAGE_KEY) || "light";
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
  themeIcon.className =
    theme === "dark" ? "bi bi-moon-stars-fill" : "bi bi-brightness-high-fill";
}

/* -----------------------------------------------------------------------
 *  2.  DOM REFERENCES
 * -------------------------------------------------------------------- */
const personForm = document.getElementById("personForm");
const personList = document.getElementById("peopleList");
const taskForm   = document.getElementById("taskForm");
const taskList   = document.getElementById("taskList");

/* -----------------------------------------------------------------------
 *  3.  STATE
 * -------------------------------------------------------------------- */
let peopleCache = [];          // fetched /api/people
let tasksCache  = [];          // fetched /api/tasks

// default (main) Chart.js instances
let chartWeekly, chartWeekdays, chartPerPerson;

/* -----------------------------------------------------------------------
 *  4.  HELPERS
 * -------------------------------------------------------------------- */
function todayISO () {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0")
  ].join("-");
}

/* Calculate the three datasets we use several times */
function weeklyStats() {
  const today = new Date();
  const labels = [], counts = [];
  for (let i = 3; i >= 0; i--) {
    const start = new Date(today);
    start.setDate(today.getDate() - i * 7);
    labels.push(`${start.getFullYear()}-${String(start.getMonth()+1).padStart(2,"0")}-${String(start.getDate()).padStart(2,"0")}`);

    const c = tasksCache.filter(t => {
      if (!t.done) return false;
      const d = new Date(t.date);
      const diff = Math.floor((today - d) / (1000*60*60*24));
      return diff >= i*7 && diff < (i+1)*7;
    }).length;
    counts.push(c);
  }
  return { labels, counts };
}
function weekdayStats() {
  const labels = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const counts = [0,0,0,0,0,0,0];
  tasksCache.forEach(t => counts[new Date(t.date).getDay()]++);
  return { labels, counts };
}
function perPersonStats() {
  const labels = peopleCache.map(p => p.name);
  const counts = peopleCache.map(p =>
    tasksCache.filter(t => t.assignedTo === p.id).length
  );
  return { labels, counts };
}

/* -----------------------------------------------------------------------
 *  5.  CHART-DRAW HELPERS  (used by both static & dynamic widgets)
 * -------------------------------------------------------------------- */
function renderWeeklyChart(canvasId) {
  const { labels, counts } = weeklyStats();
  const ctx = document.getElementById(canvasId).getContext("2d");
  return new Chart(ctx, {
    type : "bar",
    data : {
      labels,
      datasets : [{
        label: "Completed",
        data : counts,
        backgroundColor: "rgba(75,192,192,.5)",
        borderColor    : "rgba(75,192,192,1)",
        borderWidth    : 1
      }]
    },
    options : { scales: { y: { beginAtZero: true } } }
  });
}
function renderWeekdaysChart(canvasId) {
  const { labels, counts } = weekdayStats();
  const ctx = document.getElementById(canvasId).getContext("2d");
  return new Chart(ctx, {
    type : "pie",
    data : {
      labels,
      datasets : [{
        data : counts,
        backgroundColor: [
          "#FF6384","#36A2EB","#FFCE56","#4BC0C0","#9966FF","#FF9F40","#C9CBCF"
        ]
      }]
    }
  });
}
function renderPerPersonChart(canvasId) {
  const { labels, counts } = perPersonStats();
  const ctx = document.getElementById(canvasId).getContext("2d");
  return new Chart(ctx, {
    type : "bar",
    data : {
      labels,
      datasets : [{
        label: "Assigned Tasks",
        data : counts,
        backgroundColor: "rgba(153,102,255,.5)",
        borderColor    : "rgba(153,102,255,1)",
        borderWidth    : 1
      }]
    },
    options : { scales: { y: { beginAtZero: true } } }
  });
}
function renderTaskmasterChart(canvasId) {
  const now   = new Date();
  const year  = now.getFullYear();
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
  return new Chart(ctx, {
    type : "bar",
    data : {
      labels,
      datasets : [{
        label: "Tasks Done This Month",
        data : counts,
        backgroundColor: "rgba(255,159,64,.5)",
        borderColor    : "rgba(255,159,64,1)",
        borderWidth    : 1
      }]
    },
    options : { scales: { y: { beginAtZero: true } } }
  });
}

/* -----------------------------------------------------------------------
 *  6.  FETCH & CRUD
 * -------------------------------------------------------------------- */
async function fetchPeople() {
  const res = await fetch("/api/people");
  peopleCache = await res.json();
  renderPeople();
}
async function fetchTasks() {
  const res = await fetch("/api/tasks");
  tasksCache = await res.json();
  renderTasks();
  refreshStaticCharts();   // update the 3 main charts
}

/* --- PERSONS list drawing ------------------------------------------------ */
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
    const li  = document.createElement("li");
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

/* --- TASKS list drawing -------------------------------------------------- */
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

    /* left: checkbox + label */
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

    /* middle: assignment select */
    const sel = document.createElement("select");
    sel.className = "form-select mx-3";
    sel.add(new Option("Unassigned", ""));
    peopleCache.forEach(p => {
      const o = new Option(p.name, p.id);
      if (t.assignedTo === p.id) o.selected = true;
      sel.add(o);
    });
    sel.addEventListener("change", () => {
      const val = sel.value ? parseInt(sel.value, 10) : null;
      updateTask(t.id, { assignedTo: val });
    });

    /* right: delete */
    const del = document.createElement("button");
    del.className = "btn btn-sm btn-outline-danger";
    del.innerHTML = '<i class="bi bi-trash"></i>';
    del.addEventListener("click", () => deleteTask(t.id));

    li.append(left, sel, del);
    taskList.appendChild(li);
  });
}

/* --- Mutations ----------------------------------------------------------- */
personForm.addEventListener("submit", async e => {
  e.preventDefault();
  const name = document.getElementById("personName").value.trim();
  if (!name) return;
  await fetch("/api/people", {
    method : "POST",
    headers: { "Content-Type":"application/json" },
    body   : JSON.stringify({ name })
  });
  personForm.reset();
  await fetchPeople(); await fetchTasks();
});
taskForm.addEventListener("submit", async e => {
  e.preventDefault();
  const name = document.getElementById("taskName").value.trim();
  let   date = document.getElementById("taskDate").value;
  if (!name) return;
  if (!date) date = todayISO();
  await fetch("/api/tasks", {
    method : "POST",
    headers: { "Content-Type":"application/json" },
    body   : JSON.stringify({ name, date })
  });
  taskForm.reset();
  await fetchTasks();
});
async function updateTask(id, changes) {
  await fetch(`/api/tasks/${id}`, {
    method : "PUT",
    headers: { "Content-Type":"application/json" },
    body   : JSON.stringify(changes)
  });
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

/* -----------------------------------------------------------------------
 *  7.  INITIAL PAGE SET-UP (Charts + GridStack)
 * -------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {

  /* --- build the 3 default charts ----------------------------------- */
  chartWeekly    = renderWeeklyChart("chartWeekly");
  chartWeekdays  = renderWeekdaysChart("chartWeekdays");
  chartPerPerson = renderPerPersonChart("chartPerPerson");

  /* --- pull initial data -------------------------------------------- */
  fetchPeople().then(fetchTasks);

  /* ------------------------------------------------------------------
   *      GRIDSTACK  (editable dashboard + responsive columns)
   * ------------------------------------------------------------------ */
  const MAX_COLS    = 6;     // desktop grid
  const MIN_CELL_W  = 160;   // px
  const grid        = GridStack.init({
    column             : MAX_COLS,
    disableOneColumnMode: true,   // keep multi-col even on phone
    mobileBreakpoint   : 0,
    float              : false,
    cellHeight         : 120,
    resizable          : { handles: "all" },
    draggable          : { handle : ".card-header" }
  });

  /* load saved layout (if any) */
  const saved = localStorage.getItem("analyticsLayout");
  if (saved) grid.load(JSON.parse(saved));

  /* re-draw every widget’s canvas */
  grid.engine.nodes.forEach(n => {
    const c = n.el.querySelector("canvas");
    if (!c) return;
    if (c.id.startsWith("chartWeekly"))    renderWeeklyChart(c.id);
    if (c.id.startsWith("chartWeekdays"))  renderWeekdaysChart(c.id);
    if (c.id.startsWith("chartPerPerson")) renderPerPersonChart(c.id);
    if (c.id.includes("taskmaster"))       renderTaskmasterChart(c.id);
  });

  /* persist on change */
  grid.on("change", () => {
    localStorage.setItem("analyticsLayout", JSON.stringify(grid.save()));
  });

  /* ----------  RESPONSIVE COLUMN COUNT  ---------- */
  function currentCols() {
    return grid.getColumn ? grid.getColumn() : grid.opts.column;
  }
  function calcCols() {
    const w = grid.el.getBoundingClientRect().width;
    return Math.min(
      MAX_COLS,
      Math.max(2, Math.floor(w / MIN_CELL_W))
    );
  }
  function applyResponsiveCols() {
    const cols = calcCols();
    if (cols !== currentCols()) grid.column(cols, "moveScale");
  }
  applyResponsiveCols();            // once at start
  window.addEventListener("resize", applyResponsiveCols);

  /* ----------  EDIT MODE + ADD / REMOVE ---------- */
  const editBtn      = document.getElementById("analyticsEditBtn");
  const widgetSelect = document.getElementById("widgetSelect");
  let   editing      = false;

  editBtn.addEventListener("click", () => {
    editing = !editing;
    grid.el.classList.toggle("editing", editing);
    grid.setStatic(!editing);
    widgetSelect.classList.toggle("d-none", !editing);
    editBtn.textContent = editing ? "Done Editing" : "Edit Dashboard";
  });

  widgetSelect.addEventListener("change", () => {
    const preset = widgetSelect.value;
    if (!preset) return;

    let header, renderFn;
    switch (preset) {
      case "tasksWeekly":     header="Tasks Completed Per Week"; renderFn=renderWeeklyChart;    break;
      case "busiestWeekdays": header="Busiest Weekdays";         renderFn=renderWeekdaysChart;  break;
      case "choresPerPerson": header="Chores Per Person";        renderFn=renderPerPersonChart; break;
      case "taskmaster":      header="Taskmaster This Month";    renderFn=renderTaskmasterChart;break;
      default: return;
    }

    const id   = `${preset}-${Date.now()}`;
    const item = document.createElement("div");
    item.className = "grid-stack-item";
    item.setAttribute("gs-w", "2");
    item.setAttribute("gs-h", "2");
    item.innerHTML = `
      <div class="grid-stack-item-content card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <span>${header}</span>
          <button class="btn btn-sm btn-outline-danger remove-widget">&times;</button>
        </div>
        <div class="card-body"><canvas id="${id}"></canvas></div>
      </div>`;
    grid.addWidget(item);
    renderFn(id);
    widgetSelect.value = "";
  });

  grid.el.addEventListener("click", e => {
    if (e.target.classList.contains("remove-widget")) {
      grid.removeWidget(e.target.closest(".grid-stack-item"));
    }
  });
});

/* -----------------------------------------------------------------------
 *  8.  PERIODIC REFRESH
 * -------------------------------------------------------------------- */
setInterval(fetchTasks, 30_000);

/* -----------------------------------------------------------------------
 *  9.  UPDATE THE 3 STATIC CHARTS WHEN DATA CHANGES
 * -------------------------------------------------------------------- */
function refreshStaticCharts() {
  /* weekly */
  const w = weeklyStats();
  chartWeekly.data.labels = w.labels;
  chartWeekly.data.datasets[0].data = w.counts;
  chartWeekly.update();

  /* weekdays */
  const d = weekdayStats();
  chartWeekdays.data.labels = d.labels;
  chartWeekdays.data.datasets[0].data = d.counts;
  chartWeekdays.update();

  /* per person */
  const p = perPersonStats();
  chartPerPerson.data.labels = p.labels;
  chartPerPerson.data.datasets[0].data = p.counts;
  chartPerPerson.update();
}
