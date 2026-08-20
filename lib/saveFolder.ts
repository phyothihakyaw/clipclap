const DB_NAME = "clipclap";
const STORE_NAME = "handles";
/** Legacy key kept so existing installs keep their folder permission. */
const HANDLE_KEY = "vaultDirectory";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB open failed"));
  });
}

async function idbGet<T>(key: string): Promise<T | undefined> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result as T | undefined);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB get failed"));
  });
}

async function idbSet(key: string, value: unknown): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(value, key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error ?? new Error("IndexedDB set failed"));
  });
}

async function idbDelete(key: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error ?? new Error("IndexedDB delete failed"));
  });
}

export async function getSaveFolderHandle(): Promise<FileSystemDirectoryHandle | null> {
  return (await idbGet<FileSystemDirectoryHandle>(HANDLE_KEY)) ?? null;
}

export async function clearSaveFolderHandle(): Promise<void> {
  await idbDelete(HANDLE_KEY);
}

export async function pickSaveFolder(): Promise<FileSystemDirectoryHandle> {
  const handle = await window.showDirectoryPicker({
    mode: "readwrite",
    id: "clipclap-save-folder",
  });
  await idbSet(HANDLE_KEY, handle);
  return handle;
}

async function ensureWritable(
  handle: FileSystemDirectoryHandle,
): Promise<FileSystemDirectoryHandle> {
  const permission = await handle.queryPermission({ mode: "readwrite" });
  if (permission === "granted") {
    return handle;
  }
  const requested = await handle.requestPermission({ mode: "readwrite" });
  if (requested !== "granted") {
    throw new Error("Write permission to the save folder was denied.");
  }
  return handle;
}

async function uniqueFileHandle(
  directory: FileSystemDirectoryHandle,
  filename: string,
): Promise<{ handle: FileSystemFileHandle; name: string }> {
  const extensionMatch = filename.match(/(\.[^.]+)$/);
  const extension = extensionMatch?.[1] ?? ".md";
  const base = filename.slice(0, filename.length - extension.length) || filename;
  let candidate = `${base}${extension}`;
  let index = 1;
  while (true) {
    try {
      await directory.getFileHandle(candidate);
      candidate = `${base}-${index}${extension}`;
      index += 1;
    } catch {
      const handle = await directory.getFileHandle(candidate, { create: true });
      return { handle, name: candidate };
    }
  }
}

/** Create-only write of Markdown (with attributes) or plain text into the save folder. */
export async function writeSavedFile(
  filename: string,
  contents: string,
): Promise<{ filename: string; folderName: string }> {
  const stored = await getSaveFolderHandle();
  if (!stored) {
    throw new Error("Choose a save folder first.");
  }
  const directory = await ensureWritable(stored);
  const { handle, name } = await uniqueFileHandle(directory, filename);
  const writable = await handle.createWritable();
  await writable.write(contents);
  await writable.close();
  return { filename: name, folderName: directory.name };
}
