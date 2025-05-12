const form = document.getElementById("shoreForm");
const list = document.getElementById("taskList");

async function fetchTasks() {
  const res = await fetch("/api/tasks");
  const tasks = await res.json();
  renderTasks(tasks);
}

function renderTasks(tasks) {
  list.innerHTML = "";
  tasks.forEach((t, i) => {
    const li = document.createElement("li");
    li.textContent = `${t.name} – ${t.date}`;
    list.appendChild(li);
  });
}

form.addEventListener("submit", async e => {
  e.preventDefault();
  const name = document.getElementById("name").value;
  const date = document.getElementById("date").value;
  await fetch("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, date })
  });
  form.reset();
  fetchTasks();
});

// Initial render
fetchTasks();
