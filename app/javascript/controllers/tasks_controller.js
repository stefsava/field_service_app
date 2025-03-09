import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["tasksList"];

  connect() {
    console.log("✅ TasksController collegato!");
    this.loadTasks();

    // 🔥 Sincronizza i tasks quando si torna online
    document.addEventListener("serverOnline", () => {
      console.log("🌐 Il server è tornato online, sincronizzo i tasks...");
      this.syncPendingTasks();
    });
  }

  async loadTasks() {
    try {
      console.log("🔄 Recupero tasks da Odoo...");
      const response = await fetch("/tasks.json", { cache: "no-store" });
      if (!response.ok) throw new Error("Errore nel recupero dei tasks");

      let tasks = await response.json();
      tasks = tasks.map(task => ({
        ...task,
        stage_name: task.stage_id ? task.stage_id[1] : "Sconosciuto"
      }));

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
      store.put({ ...task, pending_sync: false });
    });

    console.log("✅ Tasks salvati in IndexedDB!");
  }

  async loadTasksFromIndexedDB() {
    const db = await this.openDB();
    const transaction = db.transaction("tasks", "readonly");
    const store = transaction.objectStore("tasks");

    const tasks = await store.getAll();
    return Array.isArray(tasks) ? tasks : []; // ✅ Se non è un array, restituisce un array vuoto
  }

  async updateTaskName(event) {
    const taskId = event.target.dataset.taskId;
    const newName = event.target.value;

    console.log(`📝 Modifica nome task ${taskId} -> ${newName}`);

    await this.updateTaskNameInIndexedDB(taskId, newName);

    const cachedTasks = await this.loadTasksFromIndexedDB();
    if (!Array.isArray(cachedTasks)) {
      console.error("❌ Errore: I tasks caricati da IndexedDB non sono un array.");
      return;
    }

    this.renderTasks(cachedTasks);

    if (navigator.onLine) {
      await this.syncPendingTasks();
    }
  }

  async updateTaskNameInIndexedDB(taskId, newName) {
    const db = await this.openDB();
    const transaction = db.transaction("tasks", "readwrite");
    const store = transaction.objectStore("tasks");

    const request = store.get(Number(taskId));
    request.onsuccess = () => {
      const task = request.result;
      if (task) {
        task.name = newName;
        task.pending_sync = true; // 🟡 Segnalo che deve essere sincronizzato
        store.put(task);
        console.log(`📝 Nome del task ${taskId} aggiornato offline: ${newName}`);
      }
    };
  }

  async syncPendingTasks() {
    if (!navigator.onLine) return;

    const db = await this.openDB();
    const transaction = db.transaction("tasks", "readonly");
    const store = transaction.objectStore("tasks");

    const request = store.getAll();
    request.onsuccess = async () => {
      const tasks = request.result.filter(task => task.pending_sync);

      for (const task of tasks) {
        try {
          const response = await fetch(`/tasks/${task.id}.json`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: task.name })
          });

          if (response.ok) {
            console.log(`✅ Task ${task.id} sincronizzato con Odoo!`);
            const tx = db.transaction("tasks", "readwrite");
            const store = tx.objectStore("tasks");
            task.pending_sync = false;
            store.put(task);
          } else {
            console.warn(`⚠️ Task ${task.id} non sincronizzato!`);
          }
        } catch (error) {
          console.error(`❌ Errore sincronizzazione task ${task.id}:`, error);
        }
      }
    };
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
          <input type="text" value="${task.name}"
                 data-task-id="${task.id}"
                 data-action="input->tasks#updateTaskName">
          <span class="badge bg-info">${task.stage_name}</span>
          ${task.pending_sync ? '<span class="badge bg-danger">⚠️ Non sincronizzato</span>' : ""}
        </li>`)
      .join("");
  }
}
