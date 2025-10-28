// src/versionCheck.js
const APP_VERSION = "1.0.5"; // Increment this on each new deploy

export async function checkAndClearCache() {
  try {
    const storedVersion = localStorage.getItem("app_version");
    if (storedVersion === APP_VERSION) return;

    console.log("🧹 New app version detected → clearing old caches");

    // Delete browser caches
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
    }

    // Delete IndexedDB (Firebase, etc.)
    if ("indexedDB" in window && indexedDB.databases) {
      const dbs = await indexedDB.databases();
      for (const db of dbs) {
        if (db.name) indexedDB.deleteDatabase(db.name);
      }
    }

    sessionStorage.clear();
    localStorage.clear();
    localStorage.setItem("app_version", APP_VERSION);
    console.log("✅ Cache cleared successfully");
  } catch (err) {
    console.warn("Cache cleanup error:", err);
  }
}
