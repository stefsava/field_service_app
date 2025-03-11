export default class ApiService {
  static async fetchTasks() {
    try {
      const response = await fetch("/tasks.json", { cache: "no-store" });
      if (!response.ok) throw new Error("Errore nel recupero dei tasks");
      return await response.json();
    } catch (error) {
      console.error("❌ Errore API:", error);
      return null;
    }
  }

  static async updateTask(taskId, data) {
    try {
      const response = await fetch(`/tasks/${taskId}.json`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return response.ok;
    } catch (error) {
      console.error(`❌ Errore aggiornamento task ${taskId}:`, error);
      return false;
    }
  }
}
