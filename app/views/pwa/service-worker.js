// Add a service worker for processing Web Push notifications:

self.addEventListener("push", async (event) => {
  const { title, options } = await event.data.json()
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener("notificationclick", function(event) {
  event.notification.close()
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      for (let i = 0; i < clientList.length; i++) {
        let client = clientList[i]
        let clientPath = (new URL(client.url)).pathname
        if (clientPath == event.notification.data.path && "focus" in client) {
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.path)
      }
    })
  )
})

self.addEventListener("install", (event) => {
  console.log("Service Worker installato!");
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker attivato!");
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  console.log("Intercepted fetch:", event.request.url);
});

async function checkServerStatus() {
  try {
    const response = await fetch("/up", { method: "HEAD", cache: "no-store" });
    return response.ok;
  } catch (error) {
    return false;
  }
}

self.addEventListener("message", async (event) => {
  if (event.data && event.data.type === "CHECK_ONLINE") {
    const isOnline = await checkServerStatus();
    event.source.postMessage({ type: "ONLINE_STATUS", online: isOnline });
  }
});
