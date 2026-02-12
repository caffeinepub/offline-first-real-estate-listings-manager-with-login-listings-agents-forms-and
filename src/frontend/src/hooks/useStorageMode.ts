import { useState, useEffect } from 'react';
import { getStorageMode, setStorageMode as saveStorageMode, StorageMode } from '../storage/storageMode';

export function useStorageMode() {
  const [mode, setMode] = useState<StorageMode>(getStorageMode);

  const updateMode = (newMode: StorageMode) => {
    setMode(newMode);
    saveStorageMode(newMode);
  };

  return { mode, setMode: updateMode };
}
