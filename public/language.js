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
  }
  // Add 8 more languages here...
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

  // Update no people/tasks messages if empty
  const peopleList = document.getElementById("peopleList");
  if (!peopleList.children.length) {
    peopleList.innerHTML = `<li class='list-group-item text-center text-muted'>${t.noPeople}</li>`;
  }
  const taskList = document.getElementById("taskList");
  if (!taskList.children.length) {
    taskList.innerHTML = `<li class='list-group-item text-center text-muted'>${t.noTasks}</li>`;
  }
}

// Optional: add language selector on page load
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
