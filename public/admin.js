// ==========================
// ADMIN.JS with Browser Notifications
// ==========================

// UI elements
const personForm = document.getElementById("personForm");
const personList = document.getElementById("peopleList");
const taskForm   = document.getElementById("taskForm");
const taskList   = document.getElementById("taskList");

// Keep track of which tasks we've already notified
let notified = JSON.parse(localStorage.getItem("notifiedTasks") || "[]");

// Helper: today in YYYY-MM-DD
function getTodayDate() {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0")
  ].join("-");
}

// Ask for notification permission up front
if ("Notification" in window) {
  if (Notification.permission === "default") {
    Notification.requestPermission();
  }
}

// Show a browser notification
function notify(task) {
  if (Notification.permission === "granted") {
    new Notification("Task Due Today", {
      body: `${task.name} is due today (${task.date})`,
      icon: "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/icons/exclamation-circle-fill.svg"
    });
    notified.push(task.id);
    localStorage.setItem("notifiedTasks", JSON.stringify(notified));
  }
}

// Fetch & render people
async function fetchPeople() {
  const res = await fetch("/api/people");
  const people = await res.json();
  renderPeople(people);
}

// Render people list
function renderPeople(people) {
  personList.innerHTML = "";
  people.forEach(p => {
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";
    li.textContent = p.name;
    const del = document.createElement("button");
    del.className = "btn btn-sm btn-outline-danger";
    del.textContent = "Delete";
    del.addEventListener("click", () => deletePerson(p.id));
    li.appendChild(del);
    personList.appendChild(li);
  });
}

// Fetch & render tasks, plus notify
async function fetchTasks() {
  const [resT, resP] = await Promise.all([fetch("/api/tasks"), fetch("/api/people")]);
  const tasks  = await resT.json();
  const people = await resP.json();
  renderTasks(tasks, people);

  // Check for notifications: tasks due today, not done, not yet notified
  const today = getTodayDate();
  tasks.forEach(task => {
    if (
      task.date === today &&
      !task.done &&
      !notified.includes(task.id)
    ) {
      notify(task);
    }
  });
}

// Render the task list with checkboxes, assign dropdown, delete
function renderTasks(tasks, people) {
  taskList.innerHTML = "";
  if (tasks.length === 0) {
    const li = document.createElement("li");
    li.className = "list-group-item text-center text-muted";
    li.textContent = "No tasks for today 🎉";
    taskList.appendChild(li);
    return;
  }

  tasks.forEach(t => {
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";

    // Checkbox + text
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

    // Assignment dropdown
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

    // Delete button
    const del = document.createElement("button");
    del.className = "btn btn-sm btn-outline-danger";
    del.textContent = "Delete";
    del.addEventListener("click", () => deleteTask(t.id));

    li.appendChild(left);
    li.appendChild(select);
    li.appendChild(del);
    taskList.appendChild(li);
  });
}

// Add person, task, update, delete… (same as before)
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

// Auto-refresh & initial load
setInterval(fetchTasks, 30 * 1000);
fetchPeople();
fetchTasks();
