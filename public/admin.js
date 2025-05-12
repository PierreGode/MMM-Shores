// PEOPLE UI
const personForm = document.getElementById("personForm");
const personList = document.getElementById("peopleList");

// TASK UI
const taskForm = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");

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

// Add person
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
  await fetchTasks(); // refresh assignments dropdown
});

// Delete person
async function deletePerson(id) {
  await fetch(`/api/people/${id}`, { method: "DELETE" });
  await fetchPeople();
  await fetchTasks();
}

// Fetch & render tasks
async function fetchTasks() {
  const [resT, resP] = await Promise.all([
    fetch("/api/tasks"),
    fetch("/api/people")
  ]);
  const tasks = await resT.json();
  const people = await resP.json();
  renderTasks(tasks, people);
}

// Render tasks list with assign dropdown
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
    li.className = `list-group-item d-flex justify-content-between align-items-center ${t.done ? "task-done" : ""}`;

    // Left: checkbox + name & date
    const left = document.createElement("div");
    left.className = "d-flex align-items-center";

    const chk = document.createElement("input");
    chk.type = "checkbox";
    chk.checked = t.done;
    chk.className = "form-check-input me-3";
    chk.addEventListener("change", () => updateTask(t.id, { done: chk.checked }));

    const span = document.createElement("span");
    span.innerHTML = `<strong>${t.name}</strong> <small class="text-muted">(${t.date})</small>`;

    left.appendChild(chk);
    left.appendChild(span);

    // Middle: person assignment
    const select = document.createElement("select");
    select.className = "form-select mx-3";
    const noneOption = new Option("Unassigned", "");
    select.add(noneOption);
    people.forEach(p => {
      const opt = new Option(p.name, p.id);
      if (t.assignedTo === p.id) opt.selected = true;
      select.add(opt);
    });
    select.addEventListener("change", () => updateTask(t.id, { assignedTo: select.value ? parseInt(select.value, 10) : null }));

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

// Add new task
taskForm.addEventListener("submit", async e => {
  e.preventDefault();
  const name = document.getElementById("taskName").value.trim();
  const date = document.getElementById("taskDate").value;
  if (!name || !date) return;
  await fetch("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, date })
  });
  taskForm.reset();
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

// Auto-refresh every 30 seconds
setInterval(fetchTasks, 30 * 1000);

// Initial load
fetchPeople();
fetchTasks();
