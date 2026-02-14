import { useState, useEffect } from 'react';

export type PersistenceStatus = 'granted' | 'denied' | 'unsupported' | 'unknown';

export function usePersistentStorage() {
  const [status, setStatus] = useState<PersistenceStatus>('unknown');
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    checkPersistence();
  }, []);

  const checkPersistence = async () => {
    if (!navigator.storage || !navigator.storage.persisted) {
      setStatus('unsupported');
      return;
    }

    try {
      const isPersisted = await navigator.storage.persisted();
      setStatus(isPersisted ? 'granted' : 'denied');
    } catch (error) {
      console.error('Error checking persistence:', error);
      setStatus('unsupported');
    }
  };

  const requestPersistence = async (): Promise<boolean> => {
    if (!navigator.storage || !navigator.storage.persist) {
      setStatus('unsupported');
      return false;
    }

    setIsRequesting(true);
    try {
      const granted = await navigator.storage.persist();
      setStatus(granted ? 'granted' : 'denied');
      return granted;
    } catch (error) {
      console.error('Error requesting persistence:', error);
      setStatus('unsupported');
      return false;
    } finally {
      setIsRequesting(false);
    }
  };

  return {
    status,
    isRequesting,
    requestPersistence,
    checkPersistence,
    isSupported: status !== 'unsupported',
    isPersisted: status === 'granted'
  };
}
