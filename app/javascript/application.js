import "@hotwired/turbo-rails";
import "controllers";
import "bootstrap";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker")
      .then((registration) => {
        console.log("Service Worker registrato con successo:", registration);
      })
      .catch((error) => {
        console.error("Errore nella registrazione del Service Worker:", error);
      });
  });
}

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

async function checkFullOnlineStatus() {
  if (!navigator.onLine) {
    updateNetworkStatus(false);
    return;
  }

  try {
    const response = await fetch("/up", { method: "HEAD", cache: "no-store" });
    if (response.ok) {
      updateNetworkStatus(true);
    } else {
      updateNetworkStatus(false);
    }
  } catch (error) {
    updateNetworkStatus(false);
  }
}

setInterval(checkFullOnlineStatus, 10000);

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.addEventListener("message", (event) => {
    if (event.data && event.data.type === "ONLINE_STATUS") {
      updateNetworkStatus(event.data.online);
    }
  });
}

window.addEventListener("online", checkFullOnlineStatus);
window.addEventListener("offline", () => updateNetworkStatus(false));

document.addEventListener("DOMContentLoaded", checkFullOnlineStatus);
