interface RecordData {
  id: string;
  category: string;
  createdAt: number;
  [key: string]: any;
}

interface AgentData {
  id: string;
  name: string;
  contact: string;
  address?: string;
  workArea?: string;
  citizenshipId?: string;
  createdAt: number;
}

interface AttachmentData {
  id: string;
  fileName: string;
  blob: Blob;
  recordId: string;
}

const DB_NAME = 'real-estate-db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function openDatabase(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains('records')) {
        const recordStore = db.createObjectStore('records', { keyPath: 'id' });
        recordStore.createIndex('by-category', 'category', { unique: false });
        recordStore.createIndex('by-created', 'createdAt', { unique: false });
      }

      if (!db.objectStoreNames.contains('agents')) {
        const agentStore = db.createObjectStore('agents', { keyPath: 'id' });
        agentStore.createIndex('by-created', 'createdAt', { unique: false });
      }

      if (!db.objectStoreNames.contains('attachments')) {
        db.createObjectStore('attachments', { keyPath: 'id' });
      }
    };
  });

  return dbPromise;
}

export async function saveRecord(record: RecordData): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['records'], 'readwrite');
    const store = transaction.objectStore('records');
    const request = store.put(record);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getRecord(id: string): Promise<RecordData | undefined> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['records'], 'readonly');
    const store = transaction.objectStore('records');
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllRecords(): Promise<RecordData[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['records'], 'readonly');
    const store = transaction.objectStore('records');
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function getRecordsByCategory(category: string): Promise<RecordData[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['records'], 'readonly');
    const store = transaction.objectStore('records');
    const index = store.index('by-category');
    const request = index.getAll(category);

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteRecord(id: string): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['records'], 'readwrite');
    const store = transaction.objectStore('records');
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function saveAgent(agent: AgentData): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['agents'], 'readwrite');
    const store = transaction.objectStore('agents');
    const request = store.put(agent);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getAgent(id: string): Promise<AgentData | undefined> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['agents'], 'readonly');
    const store = transaction.objectStore('agents');
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllAgents(): Promise<AgentData[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['agents'], 'readonly');
    const store = transaction.objectStore('agents');
    const request = store.getAll();

    request.onsuccess = () => {
      const agents = request.result || [];
      agents.sort((a, b) => b.createdAt - a.createdAt);
      resolve(agents);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function deleteAgent(id: string): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['agents'], 'readwrite');
    const store = transaction.objectStore('agents');
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function saveAttachment(id: string, fileName: string, blob: Blob, recordId: string): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['attachments'], 'readwrite');
    const store = transaction.objectStore('attachments');
    const request = store.put({ id, fileName, blob, recordId });

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getAttachment(id: string): Promise<AttachmentData | undefined> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['attachments'], 'readonly');
    const store = transaction.objectStore('attachments');
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteAttachment(id: string): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['attachments'], 'readwrite');
    const store = transaction.objectStore('attachments');
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
