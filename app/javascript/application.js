import "@hotwired/turbo-rails";
import "controllers";
import "bootstrap";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker")
      .then((registration) => {
        console.log("✅ Service Worker registrato con successo:", registration);
      })
      .catch((error) => {
        console.error("❌ Errore nella registrazione del Service Worker:", error);
      });
  });
}

// 🔥 Aggiorna lo stato della connessione nella UI
function updateNetworkStatus(online) {
  const statusText = document.getElementById("status-text");
  if (!statusText) return;

  if (online) {
    statusText.textContent = "Online ✅";
    statusText.style.color = "lightgreen";
  } else {
    statusText.textContent = "Offline ⚠️";
    statusText.style.color = "red";
  }
}

// 🔥 Controlla lo stato del server tramite /up
async function checkFullOnlineStatus() {
  try {
    const response = await fetch("/up", { method: "HEAD", cache: "no-store" });
    const isOnline = response.ok;

    // Aggiorna la UI
    updateNetworkStatus(isOnline);

    // Invia lo stato alla pagina e ai controller Stimulus
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: "ONLINE_STATUS", online: isOnline });
    }

    // Notifica Stimulus SOLO quando si torna online
    if (isOnline && !window.wasOnline) {
      window.wasOnline = true;
      document.dispatchEvent(new Event("serverOnline"));
    } else if (!isOnline) {
      window.wasOnline = false;
    }
  } catch (error) {
    console.warn("❌ Errore nel ping a /up, il server potrebbe essere offline.");
    updateNetworkStatus(false);
    window.wasOnline = false;
  }
}

// 🔥 Controllo dello stato della connessione ogni 10 secondi
setInterval(checkFullOnlineStatus, 10000);

// 🔥 Ascolta il ritorno online dal browser
window.addEventListener("online", checkFullOnlineStatus);
window.addEventListener("offline", () => updateNetworkStatus(false));

// 🔥 Controllo iniziale al caricamento della pagina
document.addEventListener("DOMContentLoaded", checkFullOnlineStatus);
