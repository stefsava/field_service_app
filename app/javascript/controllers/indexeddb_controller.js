import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["status"];

  connect() {
    console.log("IndexedDB Controller collegato!");
    this.checkSession();
  }

  async checkSession() {
    const userId = await this.getSession();
    if (userId) {
      this.statusTarget.textContent = `Utente offline: ${userId}`;
    } else {
      this.statusTarget.textContent = "Nessuna sessione trovata.";
    }
  }

  async saveSession(userId) {
    const db = await this.openDB();
    const transaction = db.transaction("sessions", "readwrite");
    const store = transaction.objectStore("sessions");
    store.put({ id: "current", userId });
  }

  async getSession() {
    const db = await this.openDB();
    const transaction = db.transaction("sessions", "readonly");
    const store = transaction.objectStore("sessions");

    return new Promise((resolve) => {
      const request = store.get("current");
      request.onsuccess = () => resolve(request.result?.userId || null);
      request.onerror = () => resolve(null);
    });
  }

  async openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("field_service_db", 1);
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains("sessions")) {
          db.createObjectStore("sessions", { keyPath: "id" });
        }
      };
      request.onsuccess = (event) => resolve(event.target.result);
      request.onerror = () => reject("Errore IndexedDB");
    });
  }
}
