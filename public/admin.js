/* =====================================================================
 *  admin.js  –  MMM-Chores 2025 edition
 * ===================================================================== */

/* --------------------------------------------------  THEME TOGGLE  --- */
const root = document.documentElement;
const themeTgl  = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");
const THEME_KEY = "mmm-chores-theme";
const savedTheme = localStorage.getItem(THEME_KEY) || "light";

root.setAttribute("data-theme", savedTheme);
themeTgl.checked = savedTheme === "dark";
setThemeIcon(savedTheme);

themeTgl.addEventListener("change", () => {
  const next = themeTgl.checked ? "dark" : "light";
  root.setAttribute("data-theme", next);
  localStorage.setItem(THEME_KEY, next);
  setThemeIcon(next);
  Chart.defaults.color = next === "dark" ? "#e9ecef" : "#212529";
});
function setThemeIcon(t) {
  themeIcon.className =
    t === "dark" ? "bi bi-moon-stars-fill" : "bi bi-brightness-high-fill";
}

/* -------------------------------------------  CHART GLOBAL DEFAULTS  --- */
Chart.defaults.font.family = "'Inter', system-ui, sans-serif";
Chart.defaults.color = savedTheme === "dark" ? "#e9ecef" : "#212529";

/* --------------------------------------------------  DOM SHORTCUTS  --- */
const qs   = s => document.querySelector(s);
const qsa  = s => document.querySelectorAll(s);

const personForm = qs("#personForm");
const personList = qs("#peopleList");
const taskForm   = qs("#taskForm");
const taskList   = qs("#taskList");

/* --------------------------------------------------  STATE / CACHE  --- */
let peopleCache = [];
let tasksCache  = [];

/* Chart instances for the 3 “built-in” widgets */
let chartWeekly, chartWeekdays, chartPerPerson;

/* Promise queue (avoid flooding the Pi) */
let apiQueue = Promise.resolve();

/* --------------------------------------------------  HELPER FNS  --- */
const isoToday = () => new Date().toISOString().slice(0, 10);

const debounce = (fn, ms = 300) => {
  let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
};
const raf      = fn => { let id; const cb=()=>{fn();id=null}; return ()=>{if(!id)id=requestAnimationFrame(cb);} };

/* Standardised fetch with basic error banner */
const errBanner = (() => {
  const el = document.createElement("div");
  el.className = "alert alert-danger text-center m-0 d-none";
  document.body.prepend(el);
  return {
    show: msg => { el.textContent = msg; el.classList.remove("d-none"); },
    hide: () => el.classList.add("d-none")
  };
})();
async function api(path, opts = {}) {
  try {
    const res = await fetch(path, opts);
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    errBanner.hide();
    return res.json().catch(() => ({}));
  } catch (e) {
    errBanner.show(`Connection error: ${e.message}`);
    throw e;
  }
}

/* --------------------------------------------------  STATS HELPERS  --- */
const statsWeekly = () => {
  const now = new Date();
  const labels = [], counts = [];
  for (let i = 3; i >= 0; i--) {
    const d = new Date(now); d.setDate(now.getDate() - i * 7);
    labels.push(d.toLocaleDateString(undefined, { month:"short", day:"numeric" }));
    const c = tasksCache.filter(t=>{
      if(!t.done) return false;
      const td = new Date(t.date);
      const delta = Math.floor((now-td)/864e5);
      return delta >= i*7 && delta < (i+1)*7;
    }).length;
    counts.push(c);
  }
  return { labels, counts };
};
const statsWeekday = () => {
  const labels = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const counts = new Array(7).fill(0);
  tasksCache.forEach(t => counts[new Date(t.date).getDay()]++);
  return { labels, counts };
};
const statsPerPerson = () => {
  const labels = peopleCache.map(p=>p.name);
  const counts = peopleCache.map(p=>
    tasksCache.filter(t=>t.assignedTo===p.id).length
  );
  return { labels, counts };
};

/* --------------------------------------------------  CHART BUILDERS  --- */
const buildWeekly = id => new Chart(qs(`#${id}`), {
  type:"bar",
  data:{labels:[],datasets:[{label:"Completed",data:[],backgroundColor:"rgba(75,192,192,.5)",borderColor:"rgba(75,192,192,1)",borderWidth:1}]},
  options:{scales:{y:{beginAtZero:true}}}
});
const buildWeekdays = id => new Chart(qs(`#${id}`), {
  type:"pie",
  data:{labels:[],datasets:[{data:[],backgroundColor:["#FF6384","#36A2EB","#FFCE56","#4BC0C0","#9966FF","#FF9F40","#C9CBCF"]}]}
});
const buildPerPerson = id => new Chart(qs(`#${id}`), {
  type:"bar",
  data:{labels:[],datasets:[{label:"Assigned",data:[],backgroundColor:"rgba(153,102,255,.5)",borderColor:"rgba(153,102,255,1)",borderWidth:1}]},
  options:{scales:{y:{beginAtZero:true}}}
});
const buildTaskmaster = id => new Chart(qs(`#${id}`), {
  type:"bar",
  data:{labels:[],datasets:[{label:"Done this month",data:[],backgroundColor:"rgba(255,159,64,.5)",borderColor:"rgba(255,159,64,1)",borderWidth:1}]},
  options:{scales:{y:{beginAtZero:true}}}
});

/* Immutable update helper */
function updateChart(chart, labels, data) {
  chart.data.labels = labels;
  chart.data.datasets[0].data = data;
  chart.update();
}

/* --------------------------------------------------  FETCH & RENDER  --- */
async function loadPeople() {
  peopleCache = await api("/api/people");
  renderPeople();
}
async function loadTasks() {
  tasksCache = await api("/api/tasks");
  renderTasks();
  refreshStaticCharts();
}

/* ---------  PERSON LIST  -------- */
function renderPeople() {
  personList.innerHTML = "";
  if (!peopleCache.length) {
    const li = `<li class="list-group-item text-center text-muted">No people added</li>`;
    personList.insertAdjacentHTML("beforeend", li);
    return;
  }
  peopleCache.forEach(p => {
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";
    li.textContent = p.name;
    const del = document.createElement("button");
    del.className = "btn btn-sm btn-outline-danger"; del.innerHTML = '<i class="bi bi-trash"></i>';
    del.onclick = () => removePerson(p.id);
    li.appendChild(del);
    personList.appendChild(li);
  });
}

/* ---------  TASK LIST + FILTER  -------- */
function renderTasks() {
  const filter = qs("#taskFilter")?.value?.toLowerCase() ?? "";
  taskList.innerHTML = "";
  const visible = tasksCache.filter(t => t.name.toLowerCase().includes(filter));
  if (!visible.length) {
    taskList.insertAdjacentHTML("beforeend",
      `<li class="list-group-item text-center text-muted">No tasks to show</li>`);
    updateTaskBadges();
    return;
  }
  visible.forEach(t => {
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";

    const left = document.createElement("div");
    left.className = "d-flex align-items-center";

    const chk   = document.createElement("input");
    chk.type="checkbox"; chk.className="form-check-input me-3"; chk.checked=t.done;
    chk.onchange = () => patchTask(t.id,{done:chk.checked});

    const span  = document.createElement("span");
    span.innerHTML = `<strong>${t.name}</strong> <small class="text-muted">(${t.date})</small>`;
    if (t.done) span.classList.add("task-done");
    left.append(chk,span);

    const sel   = document.createElement("select");
    sel.className="form-select mx-3";
    sel.add(new Option("Unassigned",""));
    peopleCache.forEach(p=>{
      const opt = new Option(p.name,p.id);
      if(t.assignedTo===p.id) opt.selected=true;
      sel.add(opt);
    });
    sel.onchange = () => patchTask(t.id,{assignedTo: sel.value ? Number(sel.value):null});

    const del   = document.createElement("button");
    del.className="btn btn-sm btn-outline-danger"; del.innerHTML='<i class="bi bi-trash"></i>';
    del.onclick = () => removeTask(t.id);

    li.append(left,sel,del);
    taskList.appendChild(li);
  });
  updateTaskBadges();
}
/* Badges in header */
function updateTaskBadges() {
  const total = tasksCache.length;
  const done  = tasksCache.filter(t=>t.done).length;
  qs(".badge .bi-check2-square").nextSibling.textContent = ` ${done} `;
  qs(".badge .bi-square").nextSibling.textContent        = ` ${total - done} `;
}

/* --------------------------------------------------  CRUD HELPERS  --- */
function queue(fn){ apiQueue = apiQueue.then(fn).catch(()=>{}); }
function addPerson(name)  { queue(()=>api("/api/people",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name})})) .then(loadPeople);}
function removePerson(id) { queue(()=>api(`/api/people/${id}`,{method:"DELETE"})) .then(()=>{peopleCache=peopleCache.filter(p=>p.id!==id);renderPeople();renderTasks();});}
function addTask(name,date){ queue(()=>api("/api/tasks",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,date})})) .then(loadTasks);}
function patchTask(id,ch) { queue(()=>api(`/api/tasks/${id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(ch)})) .then(loadTasks);}
function removeTask(id)   { queue(()=>api(`/api/tasks/${id}`,{method:"DELETE"})) .then(loadTasks);}

/* --------------------------------------------------  FORM HANDLERS  --- */
personForm.onsubmit = e => { e.preventDefault();
  const name = qs("#personName").value.trim();
  if(name) addPerson(name);
  personForm.reset();
};
taskForm.onsubmit = e => { e.preventDefault();
  const name = qs("#taskName").value.trim();
  const date = qs("#taskDate").value || isoToday();
  if(name) addTask(name,date);
  taskForm.reset();
};

/* Live task filter input */
const filterBox = document.createElement("input");
filterBox.type="search"; filterBox.className="form-control form-control-sm";
filterBox.placeholder="Filter…"; filterBox.id="taskFilter";
filterBox.oninput = debounce(renderTasks,150);
qs(".card-header span").after(filterBox);

/* --------------------------------------------------  CHART REFRESH  --- */
function refreshStaticCharts() {
  const w = statsWeekly();   updateChart(chartWeekly,   w.labels,w.counts);
  const d = statsWeekday();  updateChart(chartWeekdays, d.labels,d.counts);
  const p = statsPerPerson();updateChart(chartPerPerson,p.labels,p.counts);
}

/* --------------------------------------------------  GRIDSTACK  --- */
document.addEventListener("DOMContentLoaded",()=>{

  /* Build the three default charts now that canvases exist */
  chartWeekly    = buildWeekly   ("chartWeekly");
  chartWeekdays  = buildWeekdays ("chartWeekdays");
  chartPerPerson = buildPerPerson("chartPerPerson");

  /* initial data fetch */
  loadPeople().then(loadTasks);

  /* Grid init */
  const MAX_COL=6, MINW=160;
  const grid = GridStack.init({
    column:MAX_COL,
    disableOneColumnMode:true,
    mobileBreakpoint:0,
    float:false,
    cellHeight:120,
    resizable:{handles:"all"},
    draggable:{handle:".card-header"}
  });

  /* Restore layout */
  const LAYOUT_KEY="analyticsLayout";
  try{ const saved=localStorage.getItem(LAYOUT_KEY); if(saved) grid.load(JSON.parse(saved)); }catch{}

  /* Render charts for restored widgets */
  grid.engine.nodes.forEach(n=>{
    const c=n.el.querySelector("canvas"); if(!c) return;
    if(c.id.startsWith("chartWeekly"))     buildWeekly   (c.id);
    else if(c.id.startsWith("chartWeekdays")) buildWeekdays(c.id);
    else if(c.id.startsWith("chartPerPerson"))buildPerPerson(c.id);
    else if(c.id.includes("taskmaster"))   buildTaskmaster(c.id);
  });

  /* Responsive column function */
  const calcCols = ()=>Math.min(MAX_COL,Math.max(2,Math.floor(grid.el.getBoundingClientRect().width/MINW)));
  const applyCols = ()=>{ const c=calcCols(); if(c!==grid.getColumn()) grid.column(c,"moveScale"); };

  window.addEventListener("resize", raf(applyCols));
  qs('button[data-bs-target="#analytics"]')
    .addEventListener("shown.bs.tab", applyCols);

  /* Debounced persistent save */
  const saveLayout = debounce(()=>localStorage.setItem(LAYOUT_KEY,JSON.stringify(grid.save())),500);
  grid.on("change", saveLayout);

  /* ----------  EDIT-MODE UI  ---------- */
  const editBtn   = qs("#analyticsEditBtn");
  const widgetSel = qs("#widgetSelect");
  const toolsBar  = document.createElement("div");
  toolsBar.className="d-inline-flex gap-2 ms-2 d-none";

  /* Reset layout */
  const btnReset = Object.assign(document.createElement("button"),{
    className:"btn btn-sm btn-outline-secondary",textContent:"Reset"
  });
  btnReset.onclick = ()=>{ if(confirm("Reset dashboard layout?")){localStorage.removeItem(LAYOUT_KEY);location.reload();}};
  /* Export layout */
  const btnExport = Object.assign(document.createElement("button"),{
    className:"btn btn-sm btn-outline-secondary",textContent:"Export"
  });
  btnExport.onclick = ()=>{ navigator.clipboard.writeText(JSON.stringify(grid.save(),null,2)); alert("Layout JSON copied to clipboard!");};
  /* Import layout */
  const btnImport = Object.assign(document.createElement("button"),{
    className:"btn btn-sm btn-outline-secondary",textContent:"Import"
  });
  btnImport.onclick = async ()=>{
    const json = prompt("Paste layout JSON:");
    try{ if(json){ localStorage.setItem(LAYOUT_KEY,json); location.reload(); }}catch(e){alert("Invalid JSON");}
  };
  /* Screenshot */
  const btnShot = Object.assign(document.createElement("button"),{
    className:"btn btn-sm btn-outline-secondary",innerHTML:'<i class="bi bi-camera"></i>'
  });
  btnShot.onclick = async () => {
    const {default:html2canvas}=await import("https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/+esm");
    const canvas = await html2canvas(grid.el,{backgroundColor:null,scrollY:-window.scrollY});
    const link=document.createElement("a");
    link.download="dashboard.png";
    link.href=canvas.toDataURL("image/png");
    link.click();
  };

  toolsBar.append(btnReset,btnExport,btnImport,btnShot);
  editBtn.after(toolsBar);

  let editing=false;
  editBtn.onclick = ()=>{
    editing=!editing;
    grid.el.classList.toggle("editing",editing);
    grid.setStatic(!editing);
    widgetSel.classList.toggle("d-none",!editing);
    toolsBar.classList.toggle("d-none",!editing);
    editBtn.textContent = editing ? "Done" : "Edit Dashboard";
  };

  /* Add widget */
  widgetSel.onchange = ()=>{
    const val = widgetSel.value; if(!val) return;
    const map = {
      tasksWeekly   : ["Tasks Completed Per Week", buildWeekly],
      busiestWeekdays:["Busiest Weekdays",          buildWeekdays],
      choresPerPerson:["Chores Per Person",         buildPerPerson],
      taskmaster     :["Taskmaster This Month",     buildTaskmaster]
    };
    const [title,builder] = map[val] || [];
    if(!title) return;
    const id = `${val}-${Date.now()}`;
    const item = document.createElement("div");
    item.className="grid-stack-item"; item.setAttribute("gs-w","2"); item.setAttribute("gs-h","2");
    item.innerHTML=`<div class="grid-stack-item-content card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <span>${title}</span>
        <button class="btn btn-sm btn-outline-danger remove-widget">&times;</button>
      </div>
      <div class="card-body"><canvas id="${id}"></canvas></div>
    </div>`;
    grid.addWidget(item);
    builder(id);
    widgetSel.value="";
    saveLayout();
  };

  /* Remove widget */
  grid.el.addEventListener("click",e=>{
    if(e.target.classList.contains("remove-widget")){
      grid.removeWidget(e.target.closest(".grid-stack-item")); saveLayout();
    }
  });

});

/* --------------------------------------------------  AUTO-REFRESH  --- */
setInterval(loadTasks, 30_000);
