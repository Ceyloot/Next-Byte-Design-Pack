const DB_NAME = 'notebook-db';
const DB_VERSION = 1;
const STORE = 'source-content';

let dbPromise = null;

function openDB() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onerror = () => { dbPromise = null; reject(req.error); };
      req.onsuccess = () => resolve(req.result);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE, { keyPath: 'id' });
        }
      };
    });
  }
  return dbPromise;
}

export async function idbGetContent(sourceId) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).get(sourceId);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

export async function idbPutContent(sourceId, content) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    const req = tx.objectStore(STORE).put({ id: sourceId, ...content });
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function idbDeleteContent(sourceId) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    const req = tx.objectStore(STORE).delete(sourceId);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}
