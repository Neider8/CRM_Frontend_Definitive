import React, { useState, useEffect, useRef } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Avatar, Tooltip, Menu, MenuItem, ListItemIcon, Divider } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import SplitText from "../common/SplitText";
import { gsap } from "gsap";
import logo from "../../assets/logo.png";

// --- INICIO Bloque de Alertas ---
import { getActiveStockAlerts } from '../../api/stockAlertsService';
import type { StockAlert } from '../../types/stock.types';
import AlertBell from '../alerts/AlertBell';
import AlertsPanel from '../alerts/AlertsPanel';
// --- FIN Bloque de Alertas ---

interface HeaderProps {
  onDrawerToggle?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onDrawerToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Estados de Header de jhosep
  const logoRef = useRef<HTMLImageElement>(null);

  // Estados de Header de daniel
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);

  // --- INICIO Bloque de Alertas (de daniel) ---
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const fetchAlerts = async () => {
    try {
      if (user) {
        const activeAlerts = await getActiveStockAlerts();
        setAlerts(activeAlerts);
      }
    } catch (error) {
      console.error("Error al cargar las alertas:", error);
      // Podrías manejar aquí la expiración del token (ej. logout()) si el error es 401
    }
  };

  useEffect(() => {
    fetchAlerts();
    const intervalId = setInterval(fetchAlerts, 60000);

    return () => clearInterval(intervalId);
  }, [user]);

  const newAlertsCount = alerts.filter(alert => alert.estadoAlerta === 'Nueva').length;
  // --- FIN Bloque de Alertas ---


  // Efecto de animación del logo (de jhosep)
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

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    logout();
    handleCloseUserMenu();
    navigate('/login');
  };

  const handleProfile = () => {
    handleCloseUserMenu();
    if (user && user.idUsuario) {
      navigate(`/usuarios/${user.idUsuario}`);
    } else {
      console.warn('No se pudo navegar al perfil: usuario o ID de usuario no disponible.');
      navigate('/login');
    }
  };

  const handleAnimationComplete = () => {
    console.log("All letters have animated!");
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar>
        {/* Botón de menú para pantallas pequeñas (de daniel) */}
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onDrawerToggle}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        {/* Logo de la aplicación (de jhosep, integrado con el AppBar de daniel) */}
        <div className="flex items-center gap-3">
          <img src={logo} alt="Logo" className="logotech" ref={logoRef} style={{ height: '40px' }} /> {/* Ajusta el tamaño si es necesario */}
        </div>
        
        {/* Título de la aplicación (de daniel) */}
        <Typography
          variant="h6"
          noWrap
          component={RouterLink}
          to="/dashboard"
          sx={{ flexGrow: 1, color: 'inherit', textDecoration: 'none', ml: 2 }} // Añadido margen
        >
          CRMTech360
        </Typography>

        {/* Sección central para el SplitText (de jhosep) - lo he movido, pero su visibilidad dependerá de tu diseño */}
        {/* Puedes decidir si este componente SplitText sigue siendo relevante con el nuevo diseño del Header de MUI.
            Si solo quieres el logo y el título, puedes eliminar este div.
            Lo mantengo aquí comentado, pero podrías necesitar ajustar su posicionamiento CSS si lo activas.
        */}
        {/*
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
        */}


        {user ? (
          // Contenedor para los íconos de la derecha (alertas y menú de usuario)
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>

            {/* Bloque de Alertas (de daniel) */}
            <div className="relative">
              <AlertBell
                newAlertsCount={newAlertsCount}
                onClick={() => setIsPanelOpen(prev => !prev)}
              />
              {isPanelOpen && (
                <AlertsPanel
                  alerts={alerts}
                  onAlertClick={() => {
                    setIsPanelOpen(false); // Cierra el panel
                    fetchAlerts(); // Vuelve a cargar las alertas para actualizar el estado
                  }}
                />
              )}
            </div>

            {/* Menú de usuario (de daniel) */}
            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Abrir opciones de usuario">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar sx={{ bgcolor: 'secondary.main' }}>
                    {user.nombreUsuario
                      ? user.nombreUsuario.charAt(0).toUpperCase()
                      : <AccountCircleIcon />}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                <MenuItem onClick={handleProfile}>
                  <ListItemIcon>
                    <AccountCircleIcon fontSize="small" />
                  </ListItemIcon>
                  <Typography textAlign="center">Perfil ({user.nombreUsuario})</Typography>
                </MenuItem>
                <MenuItem disabled>
                  <Typography textAlign="center" variant="caption" sx={{ px: 1 }}>
                    Rol: {user.rolUsuario}
                  </Typography>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <ExitToAppIcon fontSize="small" />
                  </ListItemIcon>
                  <Typography textAlign="center">Cerrar Sesión</Typography>
                </MenuItem>
              </Menu>
            </Box>
          </Box>
        ) : (
          <Button color="inherit" component={RouterLink} to="/login">
            Iniciar Sesión
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;