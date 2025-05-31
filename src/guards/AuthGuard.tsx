// src/guards/AuthGuard.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface AuthGuardProps {
  children: React.ReactElement;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // Puedes mostrar un spinner aquí si prefieres, en lugar de en App.tsx globalmente
    // para rutas protegidas específicas.
    return <div>Verificando autenticación...</div>; // O un CircularProgress de MUI
  }

  if (!isAuthenticated) {
    // Redirige a la página de login, guardando la ubicación actual
    // para que el usuario pueda ser redirigido de vuelta después del login.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children; // Si está autenticado, renderiza el contenido protegido.
};

export default AuthGuard;