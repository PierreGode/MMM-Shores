// language.js

const LANGUAGES = {
  en: {
    title: "MMM-Chores Admin",
    subtitle: "Manage tasks, people & analytics",
    tabs: ["Dashboard", "Analytics"],
    peopleTitle: "People",
    newPersonPlaceholder: "New person…",
    taskTitle: "Tasks",
    taskNamePlaceholder: "Task name…",
    taskButton: "Add",
    analyticsTitle: "Analytics",
    addChartOption: "Add Chart...",
    noPeople: "No people added",
    noTasks: "No tasks added",
    footer: "Built with Bootstrap & Chart.js • MMM-Chores by Pierre Gode"
  },
  sv: {
    title: "MMM-Chores Admin",
    subtitle: "Hantera uppgifter, personer & analys",
    tabs: ["Dashboard", "Analys"],
    peopleTitle: "Personer",
    newPersonPlaceholder: "Ny person…",
    taskTitle: "Uppgifter",
    taskNamePlaceholder: "Uppgiftsnamn…",
    taskButton: "Lägg till",
    analyticsTitle: "Analys",
    addChartOption: "Lägg till diagram...",
    noPeople: "Inga personer tillagda",
    noTasks: "Inga uppgifter tillagda",
    footer: "Byggt med Bootstrap & Chart.js • MMM-Chores av Pierre Gode"
  },
  fr: {
    title: "MMM-Chores Admin",
    subtitle: "Gérer les tâches, les personnes et les analyses",
    tabs: ["Tableau de bord", "Analytique"],
    peopleTitle: "Personnes",
    newPersonPlaceholder: "Nouvelle personne…",
    taskTitle: "Tâches",
    taskNamePlaceholder: "Nom de la tâche…",
    taskButton: "Ajouter",
    analyticsTitle: "Analytique",
    addChartOption: "Ajouter un graphique...",
    noPeople: "Aucune personne ajoutée",
    noTasks: "Aucune tâche ajoutée",
    footer: "Construit avec Bootstrap & Chart.js • MMM-Chores par Pierre Gode"
  },
  es: {
    title: "MMM-Chores Admin",
    subtitle: "Gestionar tareas, personas y análisis",
    tabs: ["Panel", "Analítica"],
    peopleTitle: "Personas",
    newPersonPlaceholder: "Nueva persona…",
    taskTitle: "Tareas",
    taskNamePlaceholder: "Nombre de tarea…",
    taskButton: "Agregar",
    analyticsTitle: "Analítica",
    addChartOption: "Agregar gráfico...",
    noPeople: "No hay personas agregadas",
    noTasks: "No hay tareas agregadas",
    footer: "Construido con Bootstrap y Chart.js • MMM-Chores por Pierre Gode"
  },
  de: {
    title: "MMM-Chores Admin",
    subtitle: "Aufgaben, Personen & Analysen verwalten",
    tabs: ["Übersicht", "Analytik"],
    peopleTitle: "Personen",
    newPersonPlaceholder: "Neue Person…",
    taskTitle: "Aufgaben",
    taskNamePlaceholder: "Aufgabenname…",
    taskButton: "Hinzufügen",
    analyticsTitle: "Analytik",
    addChartOption: "Diagramm hinzufügen...",
    noPeople: "Keine Personen hinzugefügt",
    noTasks: "Keine Aufgaben hinzugefügt",
    footer: "Erstellt mit Bootstrap & Chart.js • MMM-Chores von Pierre Gode"
  },
  it: {
    title: "MMM-Chores Admin",
    subtitle: "Gestisci compiti, persone e analisi",
    tabs: ["Dashboard", "Analisi"],
    peopleTitle: "Persone",
    newPersonPlaceholder: "Nuova persona…",
    taskTitle: "Compiti",
    taskNamePlaceholder: "Nome del compito…",
    taskButton: "Aggiungi",
    analyticsTitle: "Analisi",
    addChartOption: "Aggiungi grafico...",
    noPeople: "Nessuna persona aggiunta",
    noTasks: "Nessun compito aggiunto",
    footer: "Realizzato con Bootstrap & Chart.js • MMM-Chores di Pierre Gode"
  },
  nl: {
    title: "MMM-Chores Admin",
    subtitle: "Beheer taken, mensen & analyses",
    tabs: ["Dashboard", "Analyse"],
    peopleTitle: "Mensen",
    newPersonPlaceholder: "Nieuwe persoon…",
    taskTitle: "Taken",
    taskNamePlaceholder: "Taaknaam…",
    taskButton: "Toevoegen",
    analyticsTitle: "Analyse",
    addChartOption: "Grafiek toevoegen...",
    noPeople: "Geen personen toegevoegd",
    noTasks: "Geen taken toegevoegd",
    footer: "Gemaakt met Bootstrap & Chart.js • MMM-Chores door Pierre Gode"
  },
  pl: {
    title: "MMM-Chores Admin",
    subtitle: "Zarządzaj zadaniami, ludźmi i analizami",
    tabs: ["Panel", "Analityka"],
    peopleTitle: "Osoby",
    newPersonPlaceholder: "Nowa osoba…",
    taskTitle: "Zadania",
    taskNamePlaceholder: "Nazwa zadania…",
    taskButton: "Dodaj",
    analyticsTitle: "Analityka",
    addChartOption: "Dodaj wykres...",
    noPeople: "Brak dodanych osób",
    noTasks: "Brak dodanych zadań",
    footer: "Zbudowane z Bootstrap i Chart.js • MMM-Chores przez Pierre Gode"
  },
  zh: {
    title: "MMM-Chores 管理",
    subtitle: "管理任务、人员和分析",
    tabs: ["仪表板", "分析"],
    peopleTitle: "人员",
    newPersonPlaceholder: "新人员…",
    taskTitle: "任务",
    taskNamePlaceholder: "任务名称…",
    taskButton: "添加",
    analyticsTitle: "分析",
    addChartOption: "添加图表...",
    noPeople: "未添加人员",
    noTasks: "未添加任务",
    footer: "由 Bootstrap 和 Chart.js 构建 • MMM-Chores 由 Pierre Gode 创建"
  },
  ar: {
    title: "إدارة MMM-Chores",
    subtitle: "إدارة المهام، الأشخاص والتحليلات",
    tabs: ["لوحة التحكم", "تحليلات"],
    peopleTitle: "الأشخاص",
    newPersonPlaceholder: "شخص جديد…",
    taskTitle: "المهام",
    taskNamePlaceholder: "اسم المهمة…",
    taskButton: "إضافة",
    analyticsTitle: "تحليلات",
    addChartOption: "إضافة مخطط...",
    noPeople: "لم يتم إضافة أي أشخاص",
    noTasks: "لم يتم إضافة أي مهام",
    footer: "تم الإنشاء باستخدام Bootstrap و Chart.js • MMM-Chores بواسطة Pierre Gode"
  }
};

let currentLang = 'en';

function setLanguage(lang) {
  if (!LANGUAGES[lang]) return;
  currentLang = lang;
  const t = LANGUAGES[lang];

  document.querySelector(".hero h1").textContent = t.title;
  document.querySelector(".hero small").textContent = t.subtitle;
  const tabs = document.querySelectorAll(".nav-link");
  tabs[0].textContent = t.tabs[0];
  tabs[1].textContent = t.tabs[1];

  document.querySelector(".card-header").textContent = t.peopleTitle;
  document.getElementById("personName").placeholder = t.newPersonPlaceholder;

  document.querySelectorAll(".card-header")[1].firstChild.textContent = t.taskTitle;
  document.getElementById("taskName").placeholder = t.taskNamePlaceholder;
  document.querySelector("#taskForm button").innerHTML = `<i class='bi bi-plus-lg me-1'></i>${t.taskButton}`;

  document.querySelector("#analytics h5").textContent = t.analyticsTitle;
  document.getElementById("addChartSelect").options[0].textContent = t.addChartOption;

  document.querySelector("footer").textContent = t.footer;

  const peopleList = document.getElementById("peopleList");
  if (!peopleList.children.length) {
    peopleList.innerHTML = `<li class='list-group-item text-center text-muted'>${t.noPeople}</li>`;
  }
  const taskList = document.getElementById("taskList");
  if (!taskList.children.length) {
    taskList.innerHTML = `<li class='list-group-item text-center text-muted'>${t.noTasks}</li>`;
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const selector = document.createElement("select");
  selector.className = "form-select w-auto position-absolute end-0 top-0 m-3";
  Object.keys(LANGUAGES).forEach(lang => {
    const opt = document.createElement("option");
    opt.value = lang;
    opt.textContent = lang.toUpperCase();
    selector.appendChild(opt);
  });
  selector.addEventListener("change", e => setLanguage(e.target.value));
  document.body.appendChild(selector);
});
