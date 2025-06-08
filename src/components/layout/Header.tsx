import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import SplitText from "../common/SplitText";
import { gsap } from "gsap";
import logo from "../../assets/logo.png";

const Header: React.FC<{ onDrawerToggle?: () => void }> = ({ onDrawerToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const logoRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (logoRef.current) {
      gsap.fromTo(
        logoRef.current,
        { opacity: 0, y: -20 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          delay: 0.2,
        }
      );
    }
  }, []);

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

  const handleAnimationComplete = () => {
    console.log("All letters have animated!");
  };

  return (
    <header className="header relative flex items-center justify-between p-4 bg-white shadow-md">

    {/* IZQUIERDA: solo el logo */}
    <div className="flex items-center gap-3">
      <img src={logo} alt="Logo" className="logotech" ref={logoRef} />
    </div>


      {/* CENTRO: SplitText centrado */}
      <div className="absolute left-1/2 transform -translate-x-1/2 z-0">
        <SplitText
          text="BIENVENIDOS A TECH 360"
          className="text-xl font-semibold text-center text-[#5033d8] whitespace-nowrap"
          delay={100}
          duration={0.6}
          ease="power3.out"
          splitType="chars"
          from={{ opacity: 0, y: 40 }}
          to={{ opacity: 1, y: 0 }}
          threshold={0.1}
          rootMargin="-100px"
          textAlign="center"
          onLetterAnimationComplete={handleAnimationComplete}
        />
      </div>

      {/* DERECHA: Menú de usuario o login */}
      {user ? (
        <div className="user-menu z-10">
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
        <RouterLink to="/login" className="login-button z-10">
          Iniciar sesión
        </RouterLink>
      )}
    </header>
  );
};

export default Header;
