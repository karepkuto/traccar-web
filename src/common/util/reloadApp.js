// Fully reload the installed app (PWA) with the newest version: drop the
// service worker and its cached files, then reload. The login session is a
// server cookie, so the user stays logged in.
const reloadApp = async () => {
  try {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));
    }
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    }
  } catch {
    // Even if cleaning fails, a plain reload is still better than nothing.
  }
  window.location.reload();
};

export default reloadApp;
