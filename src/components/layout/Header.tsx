// src/components/layout/Header.tsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

const Header: React.FC<{ onDrawerToggle?: () => void }> = ({ onDrawerToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/login');
  };

  const handleProfile = () => {
    setMenuOpen(false);
    if (user?.idUsuario) {
      navigate(`/usuarios/${user.idUsuario}`);
    } else {
      navigate('/login');
    }
  };

  return (
    <header className="header">
      <button className="menu-button" onClick={onDrawerToggle}>
        ☰
      </button>

      <RouterLink to="/dashboard" className="logo">
        CRMTech360
      </RouterLink>

      {user ? (
        <div className="user-menu">
          <button className="avatar-button" onClick={() => setMenuOpen(!menuOpen)}>
            {user.nombreUsuario?.charAt(0).toUpperCase() || '👤'}
          </button>

          {menuOpen && (
            <ul className="dropdown-menu">
              <li onClick={handleProfile}>👤 Perfil</li>
              <li className="disabled">Rol: {user.rolUsuario}</li>
              <li onClick={handleLogout}>🚪 Cerrar sesión</li>
            </ul>
          )}
        </div>
      ) : (
        <RouterLink to="/login" className="login-button">
          Iniciar sesión
        </RouterLink>
      )}
    </header>
  );
};

export default Header;
