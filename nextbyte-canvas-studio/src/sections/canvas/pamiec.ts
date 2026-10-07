/**
 * Trwała pamięć projektu Canvas w IndexedDB.
 *
 * `localStorage` ma ok. 5 MB, a zdjęcia jako data URI przepełniały go po
 * jednym–dwóch plikach, więc projekt znikał po odświeżeniu i zdjęcia trzeba
 * było wklejać od nowa. IndexedDB mieści setki MB. Każda operacja jest
 * bezpieczna: przy braku IndexedDB (tryb prywatny, blokada) zwraca `null`.
 */
const BAZA = 'nb-canvas'
const SKLEP = 'projekt'

function otworz(): Promise<IDBDatabase | null> {
  return new Promise(resolve => {
    try {
      const zadanie = indexedDB.open(BAZA, 1)
      zadanie.onupgradeneeded = () => zadanie.result.createObjectStore(SKLEP)
      zadanie.onsuccess = () => resolve(zadanie.result)
      zadanie.onerror = () => resolve(null)
      zadanie.onblocked = () => resolve(null)
    } catch {
      resolve(null)
    }
  })
}

export async function zapiszWPamieci(klucz: string, wartosc: unknown): Promise<boolean> {
  const db = await otworz()
  if (!db) return false
  return new Promise(resolve => {
    try {
      const tx = db.transaction(SKLEP, 'readwrite')
      tx.objectStore(SKLEP).put(wartosc, klucz)
      tx.oncomplete = () => {
        db.close()
        resolve(true)
      }
      tx.onerror = tx.onabort = () => {
        db.close()
        resolve(false)
      }
    } catch {
      db.close()
      resolve(false)
    }
  })
}

export async function wczytajZPamieci<T = unknown>(klucz: string): Promise<T | null> {
  const db = await otworz()
  if (!db) return null
  return new Promise(resolve => {
    try {
      const zadanie = db.transaction(SKLEP, 'readonly').objectStore(SKLEP).get(klucz)
      zadanie.onsuccess = () => {
        db.close()
        resolve((zadanie.result as T | undefined) ?? null)
      }
      zadanie.onerror = () => {
        db.close()
        resolve(null)
      }
    } catch {
      db.close()
      resolve(null)
    }
  })
}
