const form = document.getElementById("shoreForm");
const list = document.getElementById("taskList");

// Hämta och rendera alla ärenden
async function fetchTasks() {
  try {
    const res = await fetch("/api/tasks");
    const tasks = await res.json();
    renderTasks(tasks);
  } catch (e) {
    console.error("Kunde inte hämta ärenden:", e);
  }
}

// Rendera listan med klickbara checkboxar
function renderTasks(tasks) {
  list.innerHTML = "";

  if (tasks.length === 0) {
    const li = document.createElement("li");
    li.className = "list-group-item text-center text-muted";
    li.textContent = "Inga ärenden för idag 🎉";
    list.appendChild(li);
    return;
  }

  tasks.forEach((t, i) => {
    const li = document.createElement("li");
    li.className = `list-group-item d-flex align-items-center ${t.done ? "task-done" : ""}`;

    const chk = document.createElement("input");
    chk.type = "checkbox";
    chk.checked = t.done;
    chk.className = "form-check-input me-3";
    chk.addEventListener("change", () => toggleDone(i, chk.checked, li));

    const span = document.createElement("span");
    span.innerHTML = `<strong>${t.name}</strong> <small class="text-muted">(${t.date})</small>`;

    li.appendChild(chk);
    li.appendChild(span);
    list.appendChild(li);
  });
}

// Lägg till nytt ärende via formuläret
form.addEventListener("submit", async e => {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const date = document.getElementById("date").value;
  if (!name || !date) return;

  try {
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, date })
    });
    form.reset();
    fetchTasks();
  } catch (e) {
    console.error("Kunde inte lägga till ärende:", e);
  }
});

// Uppdatera ‘done’-status på servern
async function toggleDone(idx, done, li) {
  try {
    await fetch(`/api/tasks/${idx}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done })
    });
    li.classList.toggle("task-done", done);
  } catch (e) {
    console.error("Kunde inte uppdatera status:", e);
  }
}

// Auto-uppdatera listan var 30:e sekund
setInterval(fetchTasks, 30 * 1000);

// Initial laddning
fetchTasks();
