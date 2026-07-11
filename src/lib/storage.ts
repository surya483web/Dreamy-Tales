const DB_NAME = "DreamyTalesDB";
const DB_VERSION = 1;
const CONTENT_STORE = "content_store";
const INQUIRIES_STORE = "inquiries_store";

function initStorageDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(CONTENT_STORE)) {
        db.createObjectStore(CONTENT_STORE);
      }
      if (!db.objectStoreNames.contains(INQUIRIES_STORE)) {
        db.createObjectStore(INQUIRIES_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Helpers for StudioContent
export async function getLocalContent(): Promise<any | null> {
  try {
    const db = await initStorageDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(CONTENT_STORE, "readonly");
      const store = transaction.objectStore(CONTENT_STORE);
      const request = store.get("studio_content");
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error("IndexedDB getLocalContent failed, falling back to localStorage:", err);
    try {
      const saved = localStorage.getItem("studio_content");
      return saved ? JSON.parse(saved) : null;
    } catch (localErr) {
      return null;
    }
  }
}

export async function saveLocalContent(content: any): Promise<void> {
  // Always update IndexedDB (large quota)
  try {
    const db = await initStorageDb();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(CONTENT_STORE, "readwrite");
      const store = transaction.objectStore(CONTENT_STORE);
      const request = store.put(content, "studio_content");
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error("IndexedDB saveLocalContent failed:", err);
  }

  // Also try to update localStorage as an additional secondary sync
  // We strip very large Base64 files if they exceed localStorage quota limits
  try {
    const jsonStr = JSON.stringify(content);
    if (jsonStr.length < 4 * 1024 * 1024) { // Only sync to localStorage if under 4MB
      localStorage.setItem("studio_content", jsonStr);
    }
  } catch (storageErr) {
    console.warn("localStorage backup failed (likely due to large file uploads exceeding quota):", storageErr);
  }
}

// Helpers for Inquiries
export async function getLocalInquiries(): Promise<any[] | null> {
  try {
    const db = await initStorageDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(INQUIRIES_STORE, "readonly");
      const store = transaction.objectStore(INQUIRIES_STORE);
      const request = store.get("studio_inquiries");
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error("IndexedDB getLocalInquiries failed, falling back to localStorage:", err);
    try {
      const saved = localStorage.getItem("studio_inquiries");
      return saved ? JSON.parse(saved) : null;
    } catch (localErr) {
      return null;
    }
  }
}

export async function saveLocalInquiries(inquiries: any[]): Promise<void> {
  try {
    const db = await initStorageDb();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(INQUIRIES_STORE, "readwrite");
      const store = transaction.objectStore(INQUIRIES_STORE);
      const request = store.put(inquiries, "studio_inquiries");
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error("IndexedDB saveLocalInquiries failed:", err);
  }

  try {
    localStorage.setItem("studio_inquiries", JSON.stringify(inquiries));
  } catch (storageErr) {
    console.warn("localStorage inquiries backup failed:", storageErr);
  }
}

// Helpers for Philosophy Catalog
export async function getLocalPhilosophyCatalog(): Promise<string[]> {
  try {
    const db = await initStorageDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(CONTENT_STORE, "readonly");
      const store = transaction.objectStore(CONTENT_STORE);
      const request = store.get("philosophy_catalog");
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error("IndexedDB getLocalPhilosophyCatalog failed, falling back to localStorage:", err);
    try {
      const saved = localStorage.getItem("philosophy_catalog");
      return saved ? JSON.parse(saved) : [];
    } catch (localErr) {
      return [];
    }
  }
}

export async function saveLocalPhilosophyCatalog(catalog: string[]): Promise<void> {
  try {
    const db = await initStorageDb();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(CONTENT_STORE, "readwrite");
      const store = transaction.objectStore(CONTENT_STORE);
      const request = store.put(catalog, "philosophy_catalog");
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error("IndexedDB saveLocalPhilosophyCatalog failed:", err);
  }

  try {
    const jsonStr = JSON.stringify(catalog);
    if (jsonStr.length < 4 * 1024 * 1024) {
      localStorage.setItem("philosophy_catalog", jsonStr);
    }
  } catch (storageErr) {
    console.warn("localStorage philosophy catalog backup failed:", storageErr);
  }
}

