import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["tasks"];

  async connect() {
    console.log("⚡ Tasks Controller collegato!");
    await this.loadTasks();
  }

  async loadTasks() {
    try {
      console.log("🔄 Recupero tasks da Odoo...");
      const response = await fetch("/tasks", { cache: "no-store" });
      if (!response.ok) throw new Error("Errore nel recupero dei tasks");

      const tasks = await response.json();
      await this.saveTasksToIndexedDB(tasks);
      this.renderTasks(tasks);
    } catch (error) {
      console.warn("⚠️ Errore nel recupero dei tasks, caricamento da IndexedDB...");
      await this.loadTasksFromIndexedDB();
    }
  }

  async saveTasksToIndexedDB(tasks) {
    const db = await this.openDB();
    const transaction = db.transaction("tasks", "readwrite");
    const store = transaction.objectStore("tasks");
    store.clear();
    tasks.forEach((task) => store.put(task));
    console.log("✅ Tasks salvati in IndexedDB");
  }

  async loadTasksFromIndexedDB() {
    const db = await this.openDB();
    const transaction = db.transaction("tasks", "readonly");
    const store = transaction.objectStore("tasks");
    const tasks = await store.getAll();

    if (tasks.length > 0) {
      console.log("📦 Caricati tasks da IndexedDB:", tasks);
      this.renderTasks(tasks);
    } else {
      console.log("⚠️ Nessun task disponibile in IndexedDB");
      this.tasksTarget.innerHTML = "<li>Nessun task disponibile offline.</li>";
    }
  }

  async openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("field_service_db", 1);
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains("tasks")) {
          db.createObjectStore("tasks", { keyPath: "id" });
        }
      };
      request.onsuccess = (event) => resolve(event.target.result);
      request.onerror = () => reject("❌ Errore nell'apertura di IndexedDB");
    });
  }

  renderTasks(tasks) {
    if (!tasks || tasks.length === 0) {
      this.tasksTarget.innerHTML = "<li>Nessun task disponibile.</li>";
      return;
    }

    this.tasksTarget.innerHTML = tasks
      .map((task) => `
        <li>
          <strong>${task.name}</strong> - Scadenza: ${task.date_deadline}
          <button class="btn btn-sm btn-primary edit-task" data-task-id="${task.id}">✏️ Modifica</button>
        </li>`)
      .join("");
  }
}
