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
  const peopleList = document.getElementById("peopleList");
  if (peopleList && peopleList.children.length === 0) {
    peopleList.innerHTML = `<li class='list-group-item text-center text-muted'>${t.noPeople}</li>`;
  }
  const taskList = document.getElementById("taskList");
  if (taskList && taskList.children.length === 0) {
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
    if (lang === currentLang) opt.selected = true;
    selector.appendChild(opt);
  });
  selector.addEventListener("change", e => {
    setLanguage(e.target.value);
    // Update board titles after language change
    if (window.updateBoardTitleMap) window.updateBoardTitleMap();
    if (window.chartInstances) {
      Object.entries(window.chartInstances).forEach(([id, chart]) => {
        const cardHeaderSpan = document.querySelector(`#${id}`).closest(".card").querySelector(".card-header span");
        if (cardHeaderSpan && window.boardTitleMap && window.boardTitleMap[chart.boardType]) {
          cardHeaderSpan.textContent = window.boardTitleMap[chart.boardType];
        }
      });
    }
  });
  document.body.appendChild(selector);
  setLanguage(currentLang);
});
