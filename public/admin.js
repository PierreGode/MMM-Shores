const form = document.getElementById("taskForm");
const list = document.getElementById("taskList");

// Fetch and render all tasks
async function fetchTasks() {
  try {
    const res = await fetch("/api/tasks");
    const tasks = await res.json();
    renderTasks(tasks);
  } catch (e) {
    console.error("Could not fetch tasks:", e);
  }
}

// Render task list with clickable checkboxes and delete buttons
function renderTasks(tasks) {
  list.innerHTML = "";

  if (tasks.length === 0) {
    const li = document.createElement("li");
    li.className = "list-group-item text-center text-muted";
    li.textContent = "No tasks for today 🎉";
    list.appendChild(li);
    return;
  }

  tasks.forEach((t, i) => {
    const li = document.createElement("li");
    li.className = `list-group-item d-flex justify-content-between align-items-center ${t.done ? "task-done" : ""}`;

    // Checkbox
    const chk = document.createElement("input");
    chk.type = "checkbox";
    chk.checked = t.done;
    chk.className = "form-check-input me-3";
    chk.addEventListener("change", () => toggleDone(i, chk.checked, li));

    // Task text
    const span = document.createElement("span");
    span.innerHTML = `<strong>${t.name}</strong> <small class="text-muted">(${t.date})</small>`;

    // Delete button
    const del = document.createElement("button");
    del.className = "btn btn-sm btn-outline-danger";
    del.innerHTML = "Delete";
    del.addEventListener("click", () => deleteTask(i));

    // Assemble
    const left = document.createElement("div");
    left.className = "d-flex align-items-center";
    left.appendChild(chk);
    left.appendChild(span);

    li.appendChild(left);
    li.appendChild(del);
    list.appendChild(li);
  });
}

// Add new task via the form
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
    console.error("Could not add task:", e);
  }
});

// Toggle the 'done' status on the server
async function toggleDone(idx, done, li) {
  try {
    await fetch(`/api/tasks/${idx}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done })
    });
    li.classList.toggle("task-done", done);
  } catch (e) {
    console.error("Could not update status:", e);
  }
}

// Delete a task on the server
async function deleteTask(idx) {
  try {
    await fetch(`/api/tasks/${idx}`, { method: "DELETE" });
    fetchTasks();
  } catch (e) {
    console.error("Could not delete task:", e);
  }
}

// Auto-refresh the list every 30 seconds
setInterval(fetchTasks, 30 * 1000);

// Initial load
fetchTasks();
