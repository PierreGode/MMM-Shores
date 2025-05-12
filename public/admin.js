// Helper: today’s date in YYYY-MM-DD format
function getTodayDate() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// UI elements
const personForm = document.getElementById("personForm");
const personList = document.getElementById("peopleList");
const taskForm = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");
const taskDateInput = document.getElementById("taskDate");

// Set the date input to today
function resetTaskDate() {
  taskDateInput.value = getTodayDate();
}

// Fetch and render people
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

// Add a person
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

// Delete a person
async function deletePerson(id) {
  await fetch(`/api/people/${id}`, { method: "DELETE" });
  await fetchPeople();
  await fetchTasks();
}

// Fetch and render tasks (with people for assignment)
async function fetchTasks() {
  const [resT, resP] = await Promise.all([
    fetch("/api/tasks"),
    fetch("/api/people")
  ]);
  const tasks = await resT.json();
  const people = await resP.json();
  renderTasks(tasks, people);
}

// Render tasks list
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

    // Left: checkbox + text span
    const left = document.createElement("div");
    left.className = "d-flex align-items-center";

    const chk = document.createElement("input");
    chk.type = "checkbox";
    chk.checked = t.done;
    chk.className = "form-check-input me-3";
    chk.addEventListener("change", () => updateTask(t.id, { done: chk.checked }));

    const span = document.createElement("span");
    span.innerHTML = `<strong>${t.name}</strong> <small class="text-muted">(${t.date})</small>`;
    if (t.done) {
      span.classList.add("task-done");
    }

    left.appendChild(chk);
    left.appendChild(span);

    // Middle: assignment dropdown
    const select = document.createElement("select");
    select.className = "form-select mx-3";
    const noneOption = new Option("Unassigned", "");
    select.add(noneOption);
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
    del.textContent = "Delete";
    del.addEventListener("click", () => deleteTask(t.id));

    li.appendChild(left);
    li.appendChild(select);
    li.appendChild(del);
    taskList.appendChild(li);
  });
}

// Add a new task, defaulting date to today if user clears it
taskForm.addEventListener("submit", async e => {
  e.preventDefault();
  const name = document.getElementById("taskName").value.trim();
  let date = taskDateInput.value;
  if (!name) return;
  if (!date) date = getTodayDate();
  await fetch("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, date })
  });
  taskForm.reset();
  resetTaskDate();
  await fetchTasks();
});

// Update a task
async function updateTask(id, changes) {
  await fetch(`/api/tasks/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(changes)
  });
  await fetchTasks();
}

// Delete a task
async function deleteTask(id) {
  await fetch(`/api/tasks/${id}`, { method: "DELETE" });
  await fetchTasks();
}

// Initial setup: set default date, load data, and auto-refresh
resetTaskDate();
fetchPeople();
fetchTasks();
setInterval(fetchTasks, 30 * 1000);
