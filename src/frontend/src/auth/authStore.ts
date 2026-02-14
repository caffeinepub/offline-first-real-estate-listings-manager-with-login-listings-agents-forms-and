const STORAGE_KEY = 'real_estate_auth';
const CREDENTIALS_KEY = 'real_estate_credentials';

interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
}

interface Credentials {
  username: string;
  password: string;
}

const DEFAULT_CREDENTIALS: Credentials = {
  username: 'Vivid@Btm',
  password: '123456'
};

export function getStoredAuth(): AuthState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load auth state:', error);
  }
  return { isAuthenticated: false, username: null };
}

export function setStoredAuth(state: AuthState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save auth state:', error);
  }
}

export function clearStoredAuth(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear auth state:', error);
  }
}

export function getCredentials(): Credentials {
  try {
    const stored = localStorage.getItem(CREDENTIALS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Ensure we always return valid credentials
      if (parsed && parsed.username && parsed.password) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Failed to load credentials:', error);
  }
  // Initialize with default credentials if none exist
  setCredentials(DEFAULT_CREDENTIALS);
  return DEFAULT_CREDENTIALS;
}

export function setCredentials(credentials: Credentials): void {
  try {
    localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(credentials));
  } catch (error) {
    console.error('Failed to save credentials:', error);
  }
}

export function verifyCredentials(username: string, password: string): boolean {
  // Always read the latest credentials from storage
  const credentials = getCredentials();
  return credentials.username === username && credentials.password === password;
}
