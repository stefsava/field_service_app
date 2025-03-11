import { Controller } from "@hotwired/stimulus";
import ApiService from "services/api";  // ✅ Usa il nome registrato in Importmap
import IndexedDBService from "storage/indexeddb"; // ✅ Usa il nome registrato in Importmap

export default class extends Controller {
  static targets = ["tasksList", "view", "edit", "nameInput"];

  connect() {
    console.log("✅ TasksController collegato!");
    this.loadTasks();
    document.addEventListener("serverOnline", () => this.syncPendingTasks());
  }

  async loadTasks() {
    try {
      let tasks = await ApiService.fetchTasks();
      if (!tasks) {
        console.warn("⚠️ Caricamento da IndexedDB...");
        tasks = await IndexedDBService.getTasks();
      } else {
        await IndexedDBService.saveTasks(tasks);
      }
      this.renderTasks(tasks);
    } catch (error) {
      console.error("❌ Errore nel caricamento tasks:", error);
    }
  }

  async syncPendingTasks() {
    if (!navigator.onLine) return;
    const tasks = await IndexedDBService.getTasks();
    const pendingTasks = tasks.filter((t) => t.pending_sync);

    for (const task of pendingTasks) {
      if (await ApiService.updateTask(task.id, { name: task.name })) {
        task.pending_sync = false;
        await IndexedDBService.saveTasks([task]);
      }
    }

    this.loadTasks();
  }

  renderTasks(tasks) {
    this.tasksListTarget.innerHTML = ""; // Pulisce la lista

    tasks.forEach(task => {
      const template = document.getElementById("task-template");
      const clone = template.content.cloneNode(true);

      const li = clone.querySelector("li");
      li.id = `task-${task.id}`;

      const view = clone.querySelector("[data-task-target='view']");
      const taskName = view.querySelector(".task-name");
      taskName.textContent = task.name;

      const input = clone.querySelector("input");
      input.value = task.name;
      input.dataset.taskId = task.id;

      const stageName = clone.querySelector(".badge.bg-info");
      stageName.textContent = task.stage_name || "Sconosciuto";

      if (task.pending_sync) {
        const pendingSyncBadge = clone.querySelector(".pending-badge");
        pendingSyncBadge.style.display = "inline";
      }

      this.tasksListTarget.appendChild(clone);
    });
  }

  editTask(event) {
    const taskElement = event.target.closest("li");
    taskElement.querySelector("[data-task-target='view']").style.display = "none";
    taskElement.querySelector("[data-task-target='edit']").style.display = "block";
  }

  async confirmEdit(event) {
    event.preventDefault();
    const taskElement = event.target.closest("li");
    const input = taskElement.querySelector("[data-task-target='nameInput']");
    const taskId = input.dataset.taskId;
    const newName = input.value;

    if (navigator.onLine) {
      if (await ApiService.updateTask(taskId, { name: newName })) {
        await IndexedDBService.updateTask(taskId, newName);
        this.updateTaskInDOM(taskId, newName);
      }
    } else {
      await IndexedDBService.updateTask(taskId, newName);
      this.updateTaskInDOM(taskId, newName);
    }

    this.cancelEdit(event);
  }

  cancelEdit(event) {
    const taskElement = event.target.closest("li");
    taskElement.querySelector("[data-task-target='view']").style.display = "block";
    taskElement.querySelector("[data-task-target='edit']").style.display = "none";
  }

  updateTaskInDOM(taskId, newName) {
    const taskElement = document.getElementById(`task-${taskId}`);
    if (taskElement) {
      taskElement.querySelector(".task-name").textContent = newName;
    }
  }
}
