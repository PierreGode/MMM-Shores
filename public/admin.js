// ==========================
// Språkdata (inbakad direkt i admin.js)
// ==========================
const LANGUAGES = {
  en: {
    title: "MMM-Chores Admin",
    subtitle: "Manage tasks, people & analytics",
    tabs: ["Dashboard", "Analytics"],
    peopleTitle: "People",
    newPersonPlaceholder: "New person…",
    addPersonBtnTitle: "Add",
    taskTitle: "Tasks",
    taskDoneLabel: "done",
    taskPendingLabel: "pending",
    taskNamePlaceholder: "Task name…",
    taskAddButton: "Add",
    analyticsTitle: "Analytics",
    addChartOption: "Add Chart...",
    chartOptions: {
      weekly: "Tasks Completed Per Week",
      weekdays: "Busiest Weekdays",
      perPerson: "Chores Per Person",
      taskmaster: "Taskmaster This Month",
      lazyLegends: "Lazy Legends",
      speedDemons: "Speed Demons",
      weekendWarriors: "Weekend Warriors",
      slacker9000: "Slacker Detector 9000"
    },
    chartLabels: {
      unfinishedTasks: "Unfinished Tasks",
      completedTasks: "Completed Tasks",
      avgCompletionTime: "Avg Completion Time (days)",
      weekendTasksCompleted: "Weekend Tasks Completed",
      oldestOpenTaskAge: "Oldest Open Task Age (days)"
    },
    noPeople: "No people added",
    noTasks: "No tasks added",
    unassigned: "Unassigned",
    remove: "Remove",
    footer: "Built with Bootstrap & Chart.js • MMM-Chores by Pierre Gode"
  },
  sv: {
    title: "MMM-Chores Admin",
    subtitle: "Hantera uppgifter, personer & analys",
    tabs: ["Dashboard", "Analys"],
    peopleTitle: "Personer",
    newPersonPlaceholder: "Ny person…",
    addPersonBtnTitle: "Lägg till",
    taskTitle: "Uppgifter",
    taskDoneLabel: "klar",
    taskPendingLabel: "pågående",
    taskNamePlaceholder: "Uppgiftsnamn…",
    taskAddButton: "Lägg till",
    analyticsTitle: "Analys",
    addChartOption: "Lägg till diagram...",
    chartOptions: {
      weekly: "Uppgifter utförda per vecka",
      weekdays: "Mest aktiva veckodagar",
      perPerson: "Sysslor per person",
      taskmaster: "Månadens mästare",
      lazyLegends: "Latmaskarna",
      speedDemons: "Snabbisarna",
      weekendWarriors: "Helghjältarna",
      slacker9000: "Slacker Detektor 9000"
    },
    chartLabels: {
      unfinishedTasks: "Ej färdiga uppgifter",
      completedTasks: "Färdiga uppgifter",
      avgCompletionTime: "Genomsnittlig avslutningstid (dagar)",
      weekendTasksCompleted: "Helguppgifter slutförda",
      oldestOpenTaskAge: "Äldsta öppna uppgift (dagar)"
    },
    noPeople: "Inga personer tillagda",
    noTasks: "Inga uppgifter tillagda",
    unassigned: "Ej tilldelad",
    remove: "Ta bort",
    footer: "Byggt med Bootstrap & Chart.js • MMM-Chores av Pierre Gode"
  },
  fr: {
    title: "MMM-Chores Admin",
    subtitle: "Gérer les tâches, les personnes et les analyses",
    tabs: ["Tableau de bord", "Analytique"],
    peopleTitle: "Personnes",
    newPersonPlaceholder: "Nouvelle personne…",
    addPersonBtnTitle: "Ajouter",
    taskTitle: "Tâches",
    taskDoneLabel: "fait",
    taskPendingLabel: "en attente",
    taskNamePlaceholder: "Nom de la tâche…",
    taskAddButton: "Ajouter",
    analyticsTitle: "Analytique",
    addChartOption: "Ajouter un graphique...",
    chartOptions: {
      weekly: "Tâches terminées par semaine",
      weekdays: "Jours de semaine les plus occupés",
      perPerson: "Corvées par personne",
      taskmaster: "Meilleur ouvrier du mois",
      lazyLegends: "Les paresseux",
      speedDemons: "Démons de la vitesse",
      weekendWarriors: "Guerriers du week-end",
      slacker9000: "Détecteur de paresse 9000"
    },
    chartLabels: {
      unfinishedTasks: "Tâches non terminées",
      completedTasks: "Tâches terminées",
      avgCompletionTime: "Temps moyen d'achèvement (jours)",
      weekendTasksCompleted: "Tâches du week-end terminées",
      oldestOpenTaskAge: "Âge de la tâche ouverte la plus ancienne (jours)"
    },
    noPeople: "Aucune personne ajoutée",
    noTasks: "Aucune tâche ajoutée",
    unassigned: "Non assigné",
    remove: "Supprimer",
    footer: "Construit avec Bootstrap & Chart.js • MMM-Chores par Pierre Gode"
  },
  es: {
    title: "MMM-Chores Admin",
    subtitle: "Gestionar tareas, personas y análisis",
    tabs: ["Panel", "Analítica"],
    peopleTitle: "Personas",
    newPersonPlaceholder: "Nueva persona…",
    addPersonBtnTitle: "Agregar",
    taskTitle: "Tareas",
    taskDoneLabel: "completadas",
    taskPendingLabel: "pendientes",
    taskNamePlaceholder: "Nombre de tarea…",
    taskAddButton: "Agregar",
    analyticsTitle: "Analítica",
    addChartOption: "Agregar gráfico...",
    chartOptions: {
      weekly: "Tareas completadas por semana",
      weekdays: "Días laborables más ocupados",
      perPerson: "Tareas por persona",
      taskmaster: "Maestro del mes",
      lazyLegends: "Leyendas perezosas",
      speedDemons: "Demonios de la velocidad",
      weekendWarriors: "Guerreros del fin de semana",
      slacker9000: "Detector de flojos 9000"
    },
    chartLabels: {
      unfinishedTasks: "Tareas sin terminar",
      completedTasks: "Tareas completadas",
      avgCompletionTime: "Tiempo promedio de finalización (días)",
      weekendTasksCompleted: "Tareas de fin de semana completadas",
      oldestOpenTaskAge: "Edad de la tarea abierta más antigua (días)"
    },
    noPeople: "No hay personas agregadas",
    noTasks: "No hay tareas agregadas",
    unassigned: "Sin asignar",
    remove: "Eliminar",
    footer: "Construido con Bootstrap y Chart.js • MMM-Chores por Pierre Gode"
  },
  de: {
    title: "MMM-Chores Admin",
    subtitle: "Aufgaben, Personen & Analysen verwalten",
    tabs: ["Übersicht", "Analytik"],
    peopleTitle: "Personen",
    newPersonPlaceholder: "Neue Person…",
    addPersonBtnTitle: "Hinzufügen",
    taskTitle: "Aufgaben",
    taskDoneLabel: "erledigt",
    taskPendingLabel: "offen",
    taskNamePlaceholder: "Aufgabenname…",
    taskAddButton: "Hinzufügen",
    analyticsTitle: "Analytik",
    addChartOption: "Diagramm hinzufügen...",
    chartOptions: {
      weekly: "Abgeschlossene Aufgaben pro Woche",
      weekdays: "Beschäftigste Wochentage",
      perPerson: "Hausarbeiten pro Person",
      taskmaster: "Aufgabenmeister des Monats",
      lazyLegends: "Faule Legenden",
      speedDemons: "Geschwindigkeitsdämonen",
      weekendWarriors: "Wochenendkrieger",
      slacker9000: "Faulenzer-Detektor 9000"
    },
    chartLabels: {
      unfinishedTasks: "Unfertige Aufgaben",
      completedTasks: "Abgeschlossene Aufgaben",
      avgCompletionTime: "Durchschnittliche Abschlusszeit (Tage)",
      weekendTasksCompleted: "Wochenendaufgaben erledigt",
      oldestOpenTaskAge: "Ältestes offenes Aufgabenalter (Tage)"
    },
    noPeople: "Keine Personen hinzugefügt",
    noTasks: "Keine Aufgaben hinzugefügt",
    unassigned: "Nicht zugeordnet",
    remove: "Entfernen",
    footer: "Erstellt mit Bootstrap & Chart.js • MMM-Chores von Pierre Gode"
  },
  it: {
    title: "MMM-Chores Admin",
    subtitle: "Gestisci compiti, persone e analisi",
    tabs: ["Dashboard", "Analisi"],
    peopleTitle: "Persone",
    newPersonPlaceholder: "Nuova persona…",
    addPersonBtnTitle: "Aggiungi",
    taskTitle: "Compiti",
    taskDoneLabel: "completati",
    taskPendingLabel: "in sospeso",
    taskNamePlaceholder: "Nome del compito…",
    taskAddButton: "Aggiungi",
    analyticsTitle: "Analisi",
    addChartOption: "Aggiungi grafico...",
    chartOptions: {
      weekly: "Compiti completati a settimana",
      weekdays: "Giorni feriali più impegnativi",
      perPerson: "Faccende per persona",
      taskmaster: "Miglior lavoratore del mese",
      lazyLegends: "Leggende pigre",
      speedDemons: "Demoni della velocità",
      weekendWarriors: "Guerrieri del weekend",
      slacker9000: "Rilevatore di fannulloni 9000"
    },
    chartLabels: {
      unfinishedTasks: "Compiti non completati",
      completedTasks: "Compiti completati",
      avgCompletionTime: "Tempo medio di completamento (giorni)",
      weekendTasksCompleted: "Compiti del weekend completati",
      oldestOpenTaskAge: "Età del compito aperto più vecchio (giorni)"
    },
    noPeople: "Nessuna persona aggiunta",
    noTasks: "Nessun compito aggiunto",
    unassigned: "Non assegnato",
    remove: "Rimuovi",
    footer: "Realizzato con Bootstrap & Chart.js • MMM-Chores di Pierre Gode"
  },
  nl: {
    title: "MMM-Chores Admin",
    subtitle: "Beheer taken, mensen & analyses",
    tabs: ["Dashboard", "Analyse"],
    peopleTitle: "Mensen",
    newPersonPlaceholder: "Nieuwe persoon…",
    addPersonBtnTitle: "Toevoegen",
    taskTitle: "Taken",
    taskDoneLabel: "klaar",
    taskPendingLabel: "in behandeling",
    taskNamePlaceholder: "Taaknaam…",
    taskAddButton: "Toevoegen",
    analyticsTitle: "Analyse",
    addChartOption: "Grafiek toevoegen...",
    chartOptions: {
      weekly: "Taken voltooid per week",
      weekdays: "Drukste weekdagen",
      perPerson: "Klussen per persoon",
      taskmaster: "Taakmeester van deze maand",
      lazyLegends: "Lui Legenden",
      speedDemons: "Snelheidsduivels",
      weekendWarriors: "Weekendstrijders",
      slacker9000: "Luilak Detector 9000"
    },
    chartLabels: {
      unfinishedTasks: "Onvoltooide taken",
      completedTasks: "Voltooide taken",
      avgCompletionTime: "Gemiddelde voltooiingstijd (dagen)",
      weekendTasksCompleted: "Voltooide weekendtaken",
      oldestOpenTaskAge: "Oudste open taak leeftijd (dagen)"
    },
    noPeople: "Geen personen toegevoegd",
    noTasks: "Geen taken toegevoegd",
    unassigned: "Niet toegewezen",
    remove: "Verwijderen",
    footer: "Gemaakt met Bootstrap & Chart.js • MMM-Chores door Pierre Gode"
  },
  pl: {
    title: "MMM-Chores Admin",
    subtitle: "Zarządzaj zadaniami, ludźmi i analizami",
    tabs: ["Panel", "Analityka"],
    peopleTitle: "Osoby",
    newPersonPlaceholder: "Nowa osoba…",
    addPersonBtnTitle: "Dodaj",
    taskTitle: "Zadania",
    taskDoneLabel: "ukończone",
    taskPendingLabel: "oczekujące",
    taskNamePlaceholder: "Nazwa zadania…",
    taskAddButton: "Dodaj",
    analyticsTitle: "Analityka",
    addChartOption: "Dodaj wykres...",
    chartOptions: {
      weekly: "Zadania ukończone w tygodniu",
      weekdays: "Najbardziej pracowite dni tygodnia",
      perPerson: "Obowiązki na osobę",
      taskmaster: "Mistrz miesiąca",
      lazyLegends: "Lenie",
      speedDemons: "Szybcy wykonawcy",
      weekendWarriors: "Wojownicy weekendowi",
      slacker9000: "Detektor leni 9000"
    },
    chartLabels: {
      unfinishedTasks: "Niewykonane zadania",
      completedTasks: "Wykonane zadania",
      avgCompletionTime: "Średni czas ukończenia (dni)",
      weekendTasksCompleted: "Ukończone zadania weekendowe",
      oldestOpenTaskAge: "Wiek najstarszego otwartego zadania (dni)"
    },
    noPeople: "Brak dodanych osób",
    noTasks: "Brak dodanych zadań",
    unassigned: "Nieprzypisane",
    remove: "Usuń",
    footer: "Zbudowane z Bootstrap i Chart.js • MMM-Chores przez Pierre Gode"
  },
  zh: {
    title: "MMM-Chores 管理",
    subtitle: "管理任务、人员和分析",
    tabs: ["仪表板", "分析"],
    peopleTitle: "人员",
    newPersonPlaceholder: "新人员…",
    addPersonBtnTitle: "添加",
    taskTitle: "任务",
    taskDoneLabel: "已完成",
    taskPendingLabel: "待处理",
    taskNamePlaceholder: "任务名称…",
    taskAddButton: "添加",
    analyticsTitle: "分析",
    addChartOption: "添加图表...",
    chartOptions: {
      weekly: "每周完成的任务",
      weekdays: "最忙的工作日",
      perPerson: "每人家务",
      taskmaster: "本月任务高手",
      lazyLegends: "懒人传说",
      speedDemons: "速度达人",
      weekendWarriors: "周末勇士",
      slacker9000: "懒散探测器 9000"
    },
    chartLabels: {
      unfinishedTasks: "未完成的任务",
      completedTasks: "已完成的任务",
      avgCompletionTime: "平均完成时间（天）",
      weekendTasksCompleted: "周末完成的任务",
      oldestOpenTaskAge: "最长未完成任务时间（天）"
    },
    noPeople: "未添加人员",
    noTasks: "未添加任务",
    unassigned: "未分配",
    remove: "移除",
    footer: "由 Bootstrap 和 Chart.js 构建 • MMM-Chores 由 Pierre Gode 创建"
  },
  ar: {
    title: "إدارة MMM-Chores",
    subtitle: "إدارة المهام، الأشخاص والتحليلات",
    tabs: ["لوحة التحكم", "تحليلات"],
    peopleTitle: "الأشخاص",
    newPersonPlaceholder: "شخص جديد…",
    addPersonBtnTitle: "إضافة",
    taskTitle: "المهام",
    taskDoneLabel: "منجز",
    taskPendingLabel: "قيد الانتظار",
    taskNamePlaceholder: "اسم المهمة…",
    taskAddButton: "إضافة",
    analyticsTitle: "تحليلات",
    addChartOption: "إضافة مخطط...",
    chartOptions: {
      weekly: "المهام المكتملة في الأسبوع",
      weekdays: "أكثر أيام الأسبوع نشاطًا",
      perPerson: "الأعمال المنزلية لكل شخص",
      taskmaster: "سيد المهام هذا الشهر",
      lazyLegends: "الكسالى الأسطوريون",
      speedDemons: "شياطين السرعة",
      weekendWarriors: "محاربو عطلة نهاية الأسبوع",
      slacker9000: "كاشف الكسالى 9000"
    },
    chartLabels: {
      unfinishedTasks: "المهام غير المكتملة",
      completedTasks: "المهام المكتملة",
      avgCompletionTime: "متوسط وقت الإنجاز (بالأيام)",
      weekendTasksCompleted: "المهام المنجزة في عطلة نهاية الأسبوع",
      oldestOpenTaskAge: "أقدم مهمة مفتوحة (بالأيام)"
    },
    noPeople: "لم يتم إضافة أي أشخاص",
    noTasks: "لم يتم إضافة أي مهام",
    unassigned: "غير معين",
    remove: "إزالة",
    footer: "تم الإنشاء باستخدام Bootstrap و Chart.js • MMM-Chores بواسطة Pierre Gode"
  }
};

let currentLang = localStorage.getItem("mmm-chores-lang") || 'en';

function setLanguage(lang) {
  if (!LANGUAGES[lang]) return;
  currentLang = lang;
  localStorage.setItem("mmm-chores-lang", lang);
  const t = LANGUAGES[lang];

  document.querySelector(".hero h1").textContent = t.title;
  document.querySelector(".hero small").textContent = t.subtitle;

  // Tabs
  const tabs = document.querySelectorAll(".nav-link");
  if (tabs[0]) tabs[0].textContent = t.tabs[0];
  if (tabs[1]) tabs[1].textContent = t.tabs[1];

  // People header & form
  const peopleHeader = document.getElementById("peopleHeader");
  if (peopleHeader) peopleHeader.textContent = t.peopleTitle;
  const peopleInput = document.getElementById("personName");
  if (peopleInput) peopleInput.placeholder = t.newPersonPlaceholder;
  const personAddBtn = document.querySelector("#personForm button");
  if (personAddBtn) personAddBtn.title = t.addPersonBtnTitle;

  // Tasks header, done/pending labels & form
  const tasksHeader = document.getElementById("tasksHeader");
  if (tasksHeader) tasksHeader.textContent = t.taskTitle;
  const doneLabel = document.getElementById("doneLabel");
  if (doneLabel) doneLabel.textContent = ` ${t.taskDoneLabel}`;
  const pendingLabel = document.getElementById("pendingLabel");
  if (pendingLabel) pendingLabel.textContent = ` ${t.taskPendingLabel}`;
  const taskInput = document.getElementById("taskName");
  if (taskInput) taskInput.placeholder = t.taskNamePlaceholder;
  const taskAddBtn = document.querySelector("#taskForm button");
  if (taskAddBtn) taskAddBtn.innerHTML = `<i class='bi bi-plus-lg me-1'></i>${t.taskAddButton}`;

  // Analytics header and chart select options
  const analyticsHeader = document.getElementById("analyticsHeader");
  if (analyticsHeader) analyticsHeader.textContent = t.analyticsTitle;
  const addChartSelect = document.getElementById("addChartSelect");
  if (addChartSelect) {
    addChartSelect.options[0].textContent = t.addChartOption;
    Object.entries(t.chartOptions).forEach(([key, val]) => {
      const option = Array.from(addChartSelect.options).find(o => o.value === key);
      if (option) option.textContent = val;
    });
  }

  // Footer
  const footer = document.getElementById("footerText");
  if (footer) footer.textContent = t.footer;

  // Unassigned in task assignee dropdowns - update dynamically
  document.querySelectorAll("select").forEach(select => {
    const unassignedOption = Array.from(select.options).find(opt => opt.value === "");
    if (unassignedOption) unassignedOption.textContent = t.unassigned;
  });

  // Clear and update empty lists messages after language switch
  renderPeople();
  renderTasks();
}

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

// Mappning av board-titlar för språk (uppdateras i setLanguage)
let boardTitleMap = { ...LANGUAGES[currentLang].chartOptions };

// Uppdatera boardTitleMap vid språkbyte
function updateBoardTitleMap() {
  boardTitleMap = { ...LANGUAGES[currentLang].chartOptions };
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
  const list = document.getElementById("peopleList");
  list.innerHTML = "";

  if (peopleCache.length === 0) {
    const li = document.createElement("li");
    li.className = "list-group-item text-center text-muted";
    li.textContent = LANGUAGES[currentLang].noPeople;
    list.appendChild(li);
    return;
  }

  for (const person of peopleCache) {
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";
    li.textContent = person.name;

    const btn = document.createElement("button");
    btn.className = "btn btn-sm btn-outline-danger";
    btn.title = LANGUAGES[currentLang].remove;
    btn.innerHTML = '<i class="bi bi-trash"></i>';
    btn.onclick = () => deletePerson(person.id);

    li.appendChild(btn);
    list.appendChild(li);
  }
}

function renderTasks() {
  const list = document.getElementById("taskList");
  list.innerHTML = "";

  if (tasksCache.length === 0) {
    const li = document.createElement("li");
    li.className = "list-group-item text-center text-muted";
    li.textContent = LANGUAGES[currentLang].noTasks;
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
    const unassignedOption = new Option(LANGUAGES[currentLang].unassigned, "");
    select.add(unassignedOption);
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
    del.title = LANGUAGES[currentLang].remove;
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
  if (getCurrentBoardTypes().includes(type)) return; // no duplicates

  const container = document.getElementById("analyticsContainer");
  const card = document.createElement("div");
  card.className = "col-md-6";

  const cardId = `chart-${chartIdCounter++}`;
  card.innerHTML = `
    <div class="card card-shadow h-100">
      <div class="card-header d-flex justify-content-between align-items-center">
        <span>${boardTitleMap[type]}</span>
        <button class="btn btn-sm btn-outline-danger remove-widget" title="${LANGUAGES[currentLang].remove}">&times;</button>
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
  const ctx = document.getElementById(canvasId).getContext("2d");
  let data = { labels: [], datasets: [] };
  let options = { scales: { y: { beginAtZero: true } } };
  let chartType = "bar";

  const t = LANGUAGES[currentLang].chartLabels;

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
          label: t.completedTasks,
          data: counts,
          backgroundColor: "rgba(75,192,192,0.5)"
        }]
      };
      break;
    }

    case "weekdays": {
      chartType = "pie";
      const labels = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
      const dataArr = [0,0,0,0,0,0,0];
      tasksCache.forEach(t => dataArr[new Date(t.date).getDay()]++);
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
          label: t.unfinishedTasks,
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
          label: t.completedTasks,
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
          label: t.unfinishedTasks,
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
          label: t.avgCompletionTime,
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
          label: t.weekendTasksCompleted,
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
          label: t.oldestOpenTaskAge,
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
  chart.boardType = type; // store board type on chart instance for updates
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

// Extract chart data for updateAllCharts
function getChartData(type) {
  // replicate the data building logic from renderChart but return data only (no new Chart)
  let data = { labels: [], datasets: [] };

  // ... Add cases if live update is needed

  return data;
}

// ==========================
// Initial Load
// ==========================
document.addEventListener("DOMContentLoaded", async () => {
  // Lägg till språkval dropdown längst upp höger
  const selector = document.createElement("select");
  selector.className = "form-select w-auto position-absolute end-0 top-0 m-3";
  Object.keys(LANGUAGES).forEach(lang => {
    const opt = document.createElement("option");
    opt.value = lang;
    opt.textContent = lang.toUpperCase();
    if (lang === currentLang) opt.selected = true;
    selector.appendChild(opt);
  });
  selector.addEventListener("change", e => {
    setLanguage(e.target.value);
    updateBoardTitleMap();

    // Uppdatera titlar i befintliga analytics cards
    Object.entries(chartInstances).forEach(([id, chart]) => {
      const cardHeaderSpan = document.querySelector(`#${id}`).closest(".card").querySelector(".card-header span");
      if (cardHeaderSpan && boardTitleMap[chart.boardType]) {
        cardHeaderSpan.textContent = boardTitleMap[chart.boardType];
      }
    });
  });
  document.body.appendChild(selector);

  await fetchPeople();
  await fetchTasks();

  updateBoardTitleMap();

  // Ladda sparade boards och återställ dem
  const savedBoards = await fetchSavedBoards();
  if (savedBoards.length) {
    savedBoards.forEach(type => addChart(type));
  }
});
