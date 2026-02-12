const STORAGE_MODE_KEY = 'storage_mode';

export type StorageMode = 'local' | 'canister';

export function getStorageMode(): StorageMode {
  try {
    const stored = localStorage.getItem(STORAGE_MODE_KEY);
    return (stored as StorageMode) || 'local';
  } catch {
    return 'local';
  }
}

export function setStorageMode(mode: StorageMode): void {
  try {
    localStorage.setItem(STORAGE_MODE_KEY, mode);
  } catch (error) {
    console.error('Failed to save storage mode:', error);
  }
}
