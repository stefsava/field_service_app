import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["tasks"];

  async connect() {
    console.log("Tasks Controller collegato!");
    await this.fetchTasks();
  }

  async fetchTasks() {
    try {
      const response = await fetch("/tasks");
      if (!response.ok) throw new Error("Errore nel recupero dei tasks");

      const tasks = await response.json();
      this.saveTasksToIndexedDB(tasks);
      this.renderTasks(tasks);
    } catch (error) {
      console.error("Errore nel recupero dei tasks:", error);
      this.loadTasksFromIndexedDB();
    }
  }

  async saveTasksToIndexedDB(tasks) {
    const db = await this.openDB();
    const transaction = db.transaction("tasks", "readwrite");
    const store = transaction.objectStore("tasks");
    store.clear();
    tasks.forEach((task) => store.put(task));
    console.log("Tasks salvati in IndexedDB");
  }

  async loadTasksFromIndexedDB() {
    const db = await this.openDB();
    const transaction = db.transaction("tasks", "readonly");
    const store = transaction.objectStore("tasks");
    const tasks = await store.getAll();
    this.renderTasks(tasks);
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
      request.onerror = () => reject("Errore nell'apertura di IndexedDB");
    });
  }

  renderTasks(tasks) {
    this.tasksTarget.innerHTML = tasks
      .map((task) => `<li>${task.name} - Scadenza: ${task.date_deadline}</li>`)
      .join("");
  }
}
