interface RecordData {
  id: string;
  category: string;
  createdAt: number;
  starred?: boolean;
  status?: string;
  priority?: string;
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

interface ReminderData {
  id: string;
  note: string;
  date: string;
  time: string;
  dismissed: boolean;
  createdAt: number;
}

interface DealData {
  id: string;
  propertyId: string;
  buyerId: string;
  status: 'Deal Closed' | 'Deal Open';
  finalDealAmount: string;
  agreedDate: string;
  bainaAmount: string;
  passDate: string;
  agreedCommission: string;
  createdAt: number;
}

const DB_NAME = 'real-estate-db';
const DB_VERSION = 3;

let dbPromise: Promise<IDBDatabase> | null = null;

function openDatabase(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const oldVersion = event.oldVersion;

      if (!db.objectStoreNames.contains('records')) {
        const recordStore = db.createObjectStore('records', { keyPath: 'id' });
        recordStore.createIndex('by-category', 'category', { unique: false });
        recordStore.createIndex('by-created', 'createdAt', { unique: false });
        recordStore.createIndex('by-starred', 'starred', { unique: false });
      } else if (oldVersion < 2) {
        const transaction = (event.target as IDBOpenDBRequest).transaction!;
        const recordStore = transaction.objectStore('records');
        if (!recordStore.indexNames.contains('by-starred')) {
          recordStore.createIndex('by-starred', 'starred', { unique: false });
        }
      }

      if (!db.objectStoreNames.contains('agents')) {
        const agentStore = db.createObjectStore('agents', { keyPath: 'id' });
        agentStore.createIndex('by-created', 'createdAt', { unique: false });
      }

      if (!db.objectStoreNames.contains('attachments')) {
        db.createObjectStore('attachments', { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains('reminders')) {
        const reminderStore = db.createObjectStore('reminders', { keyPath: 'id' });
        reminderStore.createIndex('by-created', 'createdAt', { unique: false });
      }

      if (!db.objectStoreNames.contains('deals')) {
        const dealStore = db.createObjectStore('deals', { keyPath: 'id' });
        dealStore.createIndex('by-created', 'createdAt', { unique: false });
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

export async function saveReminder(reminder: ReminderData): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['reminders'], 'readwrite');
    const store = transaction.objectStore('reminders');
    const request = store.put(reminder);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getReminder(id: string): Promise<ReminderData | undefined> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['reminders'], 'readonly');
    const store = transaction.objectStore('reminders');
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllReminders(): Promise<ReminderData[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['reminders'], 'readonly');
    const store = transaction.objectStore('reminders');
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteReminder(id: string): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['reminders'], 'readwrite');
    const store = transaction.objectStore('reminders');
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function saveDeal(deal: DealData): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['deals'], 'readwrite');
    const store = transaction.objectStore('deals');
    const request = store.put(deal);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getAllDeals(): Promise<DealData[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['deals'], 'readonly');
    const store = transaction.objectStore('deals');
    const request = store.getAll();

    request.onsuccess = () => {
      const deals = request.result || [];
      deals.sort((a, b) => b.createdAt - a.createdAt);
      resolve(deals);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function deleteDeal(id: string): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['deals'], 'readwrite');
    const store = transaction.objectStore('deals');
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
