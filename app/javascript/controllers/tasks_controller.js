import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["tasksList"];

  async connect() {
    console.log("✅ TasksController collegato!");
    await this.loadTasks();
  }

  async loadTasks() {
    try {
      console.log("🔄 Recupero tasks da Odoo...");
      const response = await fetch("/tasks.json", { cache: "no-store" }); // ✅ CORRETTO
      if (!response.ok) throw new Error("Errore nel recupero dei tasks");

      const tasks = await response.json();
      await this.saveTasksToIndexedDB(tasks);
      this.renderTasks(tasks);
    } catch (error) {
      console.warn("⚠️ Errore nel recupero dei tasks, caricamento da IndexedDB...");
      const cachedTasks = await this.loadTasksFromIndexedDB();
      this.renderTasks(cachedTasks);
    }
  }

  async saveTasksToIndexedDB(tasks) {
    const db = await this.openDB();
    const transaction = db.transaction("tasks", "readwrite");
    const store = transaction.objectStore("tasks");

    tasks.forEach((task) => {
      store.put({ ...task, pending_sync: false }); // 🟢 Salviamo con pending_sync=false
    });

    console.log("✅ Tasks salvati in IndexedDB!");
  }

  async loadTasksFromIndexedDB() {  // ✅ Metodo definito!
    const db = await this.openDB();
    const transaction = db.transaction("tasks", "readonly");
    const store = transaction.objectStore("tasks");
    return store.getAll();
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
      request.onerror = () => reject("❌ Errore IndexedDB");
    });
  }

  renderTasks(tasks) {
    this.tasksListTarget.innerHTML = tasks
      .map((task) => `
        <li>
          <strong>${task.name}</strong> -
          <span class="badge ${task.status === 'done' ? 'bg-success' : 'bg-warning'}">${task.status}</span>
        </li>`)
      .join("");
  }
}
