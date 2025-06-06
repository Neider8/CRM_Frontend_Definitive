import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Avatar, Tooltip, Menu, MenuItem, ListItemIcon, Divider } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

// --- INICIO Bloque de Alertas ---
// 1. Importaciones necesarias para las alertas
import { getActiveStockAlerts } from '../../api/stockAlertsService';
import type { StockAlert } from '../../types/stock.types';
import AlertBell from '../alerts/AlertBell'; // Asumiendo la ruta del componente
import AlertsPanel from '../alerts/AlertsPanel'; // Asumiendo la ruta del componente
// --- FIN Bloque de Alertas ---

interface HeaderProps {
  onDrawerToggle?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onDrawerToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);

  // --- INICIO Bloque de Alertas ---
  // 2. Estados para manejar las alertas y la visibilidad del panel
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // 3. Función para cargar o recargar las alertas desde la API
  const fetchAlerts = async () => {
    try {
      if (user) { // Solo buscar alertas si el usuario está logueado
        const activeAlerts = await getActiveStockAlerts();
        setAlerts(activeAlerts);
      }
    } catch (error) {
      console.error("Error al cargar las alertas:", error);
      // Podrías manejar aquí la expiración del token (ej. logout()) si el error es 401
    }
  };

  // 4. Efecto para cargar las alertas al inicio y luego periódicamente
  useEffect(() => {
    fetchAlerts(); // Carga inicial
    const intervalId = setInterval(fetchAlerts, 60000); // Vuelve a consultar cada 60 segundos

    // Limpia el intervalo cuando el componente se desmonta para evitar fugas de memoria
    return () => clearInterval(intervalId);
  }, [user]); // Se vuelve a ejecutar si el estado del usuario cambia (login/logout)

  // 5. Calculamos el número de alertas nuevas para el contador
  const newAlertsCount = alerts.filter(alert => alert.estadoAlerta === 'Nueva').length;
  // --- FIN Bloque de Alertas ---

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

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onDrawerToggle}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        <Typography
          variant="h6"
          noWrap
          component={RouterLink}
          to="/dashboard"
          sx={{ flexGrow: 1, color: 'inherit', textDecoration: 'none' }}
        >
          CRMTech360
        </Typography>

        {user ? (
          // Contenedor para los íconos de la derecha (alertas y menú de usuario)
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            
            {/* --- INICIO Bloque de Alertas --- */}
            {/* 6. Componente de la campana de alertas integrado */}
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
            {/* --- FIN Bloque de Alertas --- */}

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