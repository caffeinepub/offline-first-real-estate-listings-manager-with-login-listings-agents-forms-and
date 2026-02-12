import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getStoredAuth, setStoredAuth, clearStoredAuth, verifyCredentials } from './authStore';

interface AuthContextType {
  isAuthenticated: boolean;
  username: string | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState(() => getStoredAuth());

  useEffect(() => {
    setStoredAuth(authState);
  }, [authState]);

  const login = (username: string, password: string): boolean => {
    if (verifyCredentials(username, password)) {
      setAuthState({ isAuthenticated: true, username });
      return true;
    }
    return false;
  };

  const logout = () => {
    setAuthState({ isAuthenticated: false, username: null });
    clearStoredAuth();
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
