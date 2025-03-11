export default class IndexedDBService {
  static async openDB() {
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

  static async saveTasks(tasks) {
    const db = await this.openDB();
    const tx = db.transaction("tasks", "readwrite");
    const store = tx.objectStore("tasks");
    tasks.forEach((task) => store.put({ ...task, pending_sync: false }));
  }

  static async getTasks() {
    const db = await this.openDB();
    const tx = db.transaction("tasks", "readonly");
    const store = tx.objectStore("tasks");
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject("❌ Errore nel recupero dei tasks");
    });
  }

  static async updateTask(taskId, newName) {
    const db = await this.openDB();
    const tx = db.transaction("tasks", "readwrite");
    const store = tx.objectStore("tasks");
    const request = store.get(Number(taskId));
    request.onsuccess = () => {
      const task = request.result;
      if (task) {
        task.name = newName;
        task.pending_sync = true;
        store.put(task);
      }
    };
  }
}
