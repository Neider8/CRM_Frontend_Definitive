import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import type { AuthTokenPayload, UserInfo } from '../types/auth.types';

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserInfo | null;
  token: string | null;
  login: (payload: AuthTokenPayload) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const attemptAutoLogin = () => {
      const storedToken = localStorage.getItem('authToken');
      const storedUserInfo = localStorage.getItem('userInfo');

      if (storedToken && storedUserInfo) {
        try {
          const decodedToken: { exp: number } = jwtDecode(storedToken);
          const currentTime = Date.now() / 1000;

          if (decodedToken.exp < currentTime) {
            console.warn('Token expirado. Cerrando sesión automáticamente.');
            logout();
          } else {
            setToken(storedToken);
            setUser(JSON.parse(storedUserInfo));
            console.info('Sesión restaurada desde localStorage.');
          }
        } catch (error) {
          console.error('Error procesando token/userInfo:', error);
          logout();
        }
      }
      setIsLoading(false);
    };

    attemptAutoLogin();
  }, []);

  const login = async (payload: AuthTokenPayload) => {
    const { token, idUsuario, nombreUsuario, rolUsuario } = payload;

    const userInfo: UserInfo = {
      idUsuario,
      nombreUsuario,
      rolUsuario,
    };

    localStorage.setItem('authToken', token);
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
    setToken(token);
    setUser(userInfo);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    setToken(null);
    setUser(null);
    // Si prefieres una redirección inmediata, puedes descomentar esto:
    // window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated: Boolean(token && user),
      user,
      token,
      login,
      logout,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};
