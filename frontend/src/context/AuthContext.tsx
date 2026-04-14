"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import {
  getUser,
  setAuth,
  clearAuth,
  isAuthenticated,
  AuthUser,
} from "@/lib/auth";

interface AuthContextType {
  user: AuthUser | null;
  isLoggedIn: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoggedIn: false,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Hydrate from storage on mount
  useEffect(() => {
    if (isAuthenticated()) {
      setUser(getUser());
      setIsLoggedIn(true);
    }
  }, []);

  const login = useCallback((token: string) => {
    setAuth(token);
    setUser(getUser());
    setIsLoggedIn(true);
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
    setIsLoggedIn(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
