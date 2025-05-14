/* =======================================================================
 *  admin.js  –  MMM-Chores front-end
 *    • theme toggle
 *    • CRUD to /api
 *    • Chart.js analytics
 *    • GridStack editable dashboard (works on mobile)
 * ===================================================================== */

/* ---------------------------------------------------------------------
 *  1.  THEME TOGGLE
 * ------------------------------------------------------------------ */
const root        = document.documentElement;
const themeTgl    = document.getElementById("themeToggle");
const themeIcon   = document.getElementById("themeIcon");
const STORAGE_KEY = "mmm-chores-theme";

const savedTheme  = localStorage.getItem(STORAGE_KEY) || "light";
root.setAttribute("data-theme", savedTheme);
themeTgl.checked  = savedTheme === "dark";
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

/* ---------------------------------------------------------------------
 *  2.  DOM REFERENCES
 * ------------------------------------------------------------------ */
const personForm = document.getElementById("personForm");
const personList = document.getElementById("peopleList");
const taskForm   = document.getElementById("taskForm");
const taskList   = document.getElementById("taskList");

/* ---------------------------------------------------------------------
 *  3.  STATE
 * ------------------------------------------------------------------ */
let peopleCache = [];
let tasksCache  = [];

let chartWeekly, chartWeekdays, chartPerPerson;   // default charts

/* ---------------------------------------------------------------------
 *  4.  HELPERS
 * ------------------------------------------------------------------ */
function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
/* quick stats builders used by multiple charts */
function weeklyStats() {
  const today = new Date();
  const labels = [], counts = [];
  for (let i = 3; i >= 0; i--) {
    const start = new Date(today);
    start.setDate(today.getDate() - i*7);
    labels.push(`${start.getFullYear()}-${String(start.getMonth()+1).padStart(2,"0")}-${String(start.getDate()).padStart(2,"0")}`);

    const c = tasksCache.filter(t => {
      if (!t.done) return false;
      const d = new Date(t.date);
      const diff = Math.floor((today-d)/(864e5));
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

/* ---------------------------------------------------------------------
 *  5.  CHART RENDERERS (accept any canvas ID)
 * ------------------------------------------------------------------ */
function renderWeeklyChart(id){
  const {labels,counts}=weeklyStats();
  return new Chart(document.getElementById(id),{
    type:"bar",
    data:{labels,datasets:[{label:"Completed",data:counts,
      backgroundColor:"rgba(75,192,192,.5)",borderColor:"rgba(75,192,192,1)",borderWidth:1}]},
    options:{scales:{y:{beginAtZero:true}}}
  });
}
function renderWeekdaysChart(id){
  const {labels,counts}=weekdayStats();
  return new Chart(document.getElementById(id),{
    type:"pie",
    data:{labels,datasets:[{data:counts,backgroundColor:[
      "#FF6384","#36A2EB","#FFCE56","#4BC0C0","#9966FF","#FF9F40","#C9CBCF"]}]}
  });
}
function renderPerPersonChart(id){
  const {labels,counts}=perPersonStats();
  return new Chart(document.getElementById(id),{
    type:"bar",
    data:{labels,datasets:[{label:"Assigned Tasks",data:counts,
      backgroundColor:"rgba(153,102,255,.5)",borderColor:"rgba(153,102,255,1)",borderWidth:1}]},
    options:{scales:{y:{beginAtZero:true}}}
  });
}
function renderTaskmasterChart(id){
  const now=new Date(),Y=now.getFullYear(),M=now.getMonth();
  const labels=peopleCache.map(p=>p.name);
  const counts=peopleCache.map(p=>
    tasksCache.filter(t=>{
      if(!t.done)return false;
      const d=new Date(t.date);
      return d.getFullYear()===Y&&d.getMonth()===M&&t.assignedTo===p.id;
    }).length);
  return new Chart(document.getElementById(id),{
    type:"bar",
    data:{labels,datasets:[{label:"Tasks Done This Month",data:counts,
      backgroundColor:"rgba(255,159,64,.5)",borderColor:"rgba(255,159,64,1)",borderWidth:1}]},
    options:{scales:{y:{beginAtZero:true}}}
  });
}

/* ---------------------------------------------------------------------
 *  6.  FETCH & CRUD
 * ------------------------------------------------------------------ */
async function fetchPeople(){peopleCache=await (await fetch("/api/people")).json();renderPeople();}
async function fetchTasks (){tasksCache =await (await fetch("/api/tasks")).json();renderTasks();refreshStaticCharts();}

/* ------- render lists ------------------------------------------------ */
function renderPeople(){
  personList.innerHTML="";
  if(!peopleCache.length){
    const li=document.createElement("li");
    li.className="list-group-item text-center text-muted";
    li.textContent="No people added";personList.appendChild(li);return;
  }
  peopleCache.forEach(p=>{
    const li=document.createElement("li");
    li.className="list-group-item d-flex justify-content-between align-items-center";
    li.textContent=p.name;
    const del=document.createElement("button");
    del.className="btn btn-sm btn-outline-danger";del.innerHTML='<i class="bi bi-trash"></i>';
    del.addEventListener("click",()=>deletePerson(p.id));
    li.appendChild(del);personList.appendChild(li);
  });
}
function renderTasks(){
  taskList.innerHTML="";
  if(!tasksCache.length){
    const li=document.createElement("li");
    li.className="list-group-item text-center text-muted";
    li.textContent="No tasks added";taskList.appendChild(li);return;
  }
  tasksCache.forEach(t=>{
    const li=document.createElement("li");
    li.className="list-group-item d-flex justify-content-between align-items-center";
    const left=document.createElement("div");
    left.className="d-flex align-items-center";
    const chk=document.createElement("input");
    chk.type="checkbox";chk.className="form-check-input me-3";chk.checked=t.done;
    chk.addEventListener("change",()=>updateTask(t.id,{done:chk.checked}));
    const span=document.createElement("span");
    span.innerHTML=`<strong>${t.name}</strong> <small class="text-muted">(${t.date})</small>`;
    if(t.done)span.classList.add("task-done");
    left.append(chk,span);

    const sel=document.createElement("select");
    sel.className="form-select mx-3";
    sel.add(new Option("Unassigned",""));
    peopleCache.forEach(p=>{
      const o=new Option(p.name,p.id);
      if(t.assignedTo===p.id)o.selected=true;
      sel.add(o);
    });
    sel.addEventListener("change",()=>{
      updateTask(t.id,{assignedTo:sel.value?parseInt(sel.value,10):null});
    });

    const del=document.createElement("button");
    del.className="btn btn-sm btn-outline-danger";del.innerHTML='<i class="bi bi-trash"></i>';
    del.addEventListener("click",()=>deleteTask(t.id));

    li.append(left,sel,del);
    taskList.appendChild(li);
  });
}

/* ------- mutations --------------------------------------------------- */
personForm.addEventListener("submit",async e=>{
  e.preventDefault();
  const name=document.getElementById("personName").value.trim();
  if(!name)return;
  await fetch("/api/people",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name})});
  personForm.reset();await fetchPeople();await fetchTasks();
});
taskForm.addEventListener("submit",async e=>{
  e.preventDefault();
  const name=document.getElementById("taskName").value.trim();
  let date=document.getElementById("taskDate").value || todayISO();
  if(!name)return;
  await fetch("/api/tasks",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,date})});
  taskForm.reset();await fetchTasks();
});
async function updateTask(id,changes){await fetch(`/api/tasks/${id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(changes)});await fetchTasks();}
async function deletePerson(id){await fetch(`/api/people/${id}`,{method:"DELETE"});await fetchPeople();await fetchTasks();}
async function deleteTask  (id){await fetch(`/api/tasks/${id}`,{method:"DELETE"});await fetchTasks();}

/* ---------------------------------------------------------------------
 *  7.  INITIALISE CHARTS + GRIDSTACK
 * ------------------------------------------------------------------ */
document.addEventListener("DOMContentLoaded",()=>{

  /* ----- default (static) charts ------ */
  chartWeekly    = renderWeeklyChart   ("chartWeekly");
  chartWeekdays  = renderWeekdaysChart ("chartWeekdays");
  chartPerPerson = renderPerPersonChart("chartPerPerson");

  /* ----- fetch initial data ----------- */
  fetchPeople().then(fetchTasks);

  /* ----- GRIDSTACK -------------------- */
  const MAX_COLS=6, MIN_CELL_W=160;
  const grid=GridStack.init({
    column:MAX_COLS,
    disableOneColumnMode:true,
    mobileBreakpoint:0,
    float:false,
    cellHeight:120,
    resizable:{handles:"all"},
    draggable:{handle:".card-header"}
  });

  /* load saved layout */
  const saved=localStorage.getItem("analyticsLayout");
  if(saved)grid.load(JSON.parse(saved));

  /* render each widget’s chart */
  grid.engine.nodes.forEach(n=>{
    const c=n.el.querySelector("canvas");
    if(!c)return;
    if(c.id.startsWith("chartWeekly"))   renderWeeklyChart(c.id);
    if(c.id.startsWith("chartWeekdays")) renderWeekdaysChart(c.id);
    if(c.id.startsWith("chartPerPerson"))renderPerPersonChart(c.id);
    if(c.id.includes("taskmaster"))      renderTaskmasterChart(c.id);
  });

  grid.on("change",()=>localStorage.setItem("analyticsLayout",JSON.stringify(grid.save())));

  /* ---------- responsive columns ------------ */
  function currentCols(){return grid.getColumn?grid.getColumn():grid.opts.column;}
  function calcCols(){
    const w=grid.el.getBoundingClientRect().width;
    return Math.min(MAX_COLS,Math.max(2,Math.floor(w/MIN_CELL_W)));
  }
  function applyResponsiveCols(){
    const cols=calcCols();
    if(cols!==currentCols())grid.column(cols,"moveScale");
  }
  applyResponsiveCols();
  window.addEventListener("resize",applyResponsiveCols);

  /* ▶ TAB-SHOWN FIX — recalc when Analytics tab is first displayed */
  document.querySelector('button[data-bs-target="#analytics"]')
          .addEventListener("shown.bs.tab",applyResponsiveCols);

  /* ---------- edit mode + add/remove ---------- */
  const editBtn=document.getElementById("analyticsEditBtn");
  const widgetSel=document.getElementById("widgetSelect");
  let editing=false;

  editBtn.addEventListener("click",()=>{
    editing=!editing;
    grid.el.classList.toggle("editing",editing);
    grid.setStatic(!editing);
    widgetSel.classList.toggle("d-none",!editing);
    editBtn.textContent=editing?"Done Editing":"Edit Dashboard";
  });

  widgetSel.addEventListener("change",()=>{
    const preset=widgetSel.value;if(!preset)return;
    let header,fn;
    switch(preset){
      case"tasksWeekly":     header="Tasks Completed Per Week";fn=renderWeeklyChart;break;
      case"busiestWeekdays": header="Busiest Weekdays";        fn=renderWeekdaysChart;break;
      case"choresPerPerson": header="Chores Per Person";       fn=renderPerPersonChart;break;
      case"taskmaster":      header="Taskmaster This Month";   fn=renderTaskmasterChart;break;
      default:return;
    }
    const id=`${preset}-${Date.now()}`;
    const item=document.createElement("div");
    item.className="grid-stack-item";
    item.setAttribute("gs-w","2");item.setAttribute("gs-h","2");
    item.innerHTML=`
      <div class="grid-stack-item-content card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <span>${header}</span>
          <button class="btn btn-sm btn-outline-danger remove-widget">&times;</button>
        </div>
        <div class="card-body"><canvas id="${id}"></canvas></div>
      </div>`;
    grid.addWidget(item); fn(id);
    widgetSel.value="";
  });

  grid.el.addEventListener("click",e=>{
    if(e.target.classList.contains("remove-widget")){
      grid.removeWidget(e.target.closest(".grid-stack-item"));
    }
  });
});

/* ---------------------------------------------------------------------
 *  8.  PERIODIC TASK REFRESH
 * ------------------------------------------------------------------ */
setInterval(fetchTasks,30_000);

/* ---------------------------------------------------------------------
 *  9.  UPDATE STATIC CHARTS WHEN DATA REFRESHES
 * ------------------------------------------------------------------ */
function refreshStaticCharts(){
  const w=weeklyStats();
  chartWeekly.data.labels=w.labels;chartWeekly.data.datasets[0].data=w.counts;chartWeekly.update();

  const d=weekdayStats();
  chartWeekdays.data.labels=d.labels;chartWeekdays.data.datasets[0].data=d.counts;chartWeekdays.update();

  const p=perPersonStats();
  chartPerPerson.data.labels=p.labels;chartPerPerson.data.datasets[0].data=p.counts;chartPerPerson.update();
}
