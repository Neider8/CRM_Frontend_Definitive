import React, { useState, useEffect, useRef } from 'react';
import {
  AppBar, Toolbar, Typography, Button, Box, IconButton, Avatar,
  Tooltip, Menu, MenuItem, ListItemIcon, Divider
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import SplitText from "../common/SplitText";
import { gsap } from "gsap";
import logo from "../../assets/logo.png";
import { FaBell } from "react-icons/fa";
import { Badge } from "@mui/material";

// --- INICIO Bloque de Alertas ---
import { getActiveStockAlerts } from '../../api/stockAlertsService';
import type { StockAlert } from '../../types/stock.types';
import AlertsPanel from '../alerts/AlertsPanel';
// --- FIN Bloque de Alertas ---

interface HeaderProps {
  onDrawerToggle?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onDrawerToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const logoRef = useRef<HTMLImageElement>(null);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [anchorElAlerts, setAnchorElAlerts] = useState<null | HTMLElement>(null);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);

  const fetchAlerts = async () => {
    try {
      if (user) {
        const activeAlerts = await getActiveStockAlerts();
        setAlerts(activeAlerts);
      }
    } catch (error) {
      console.error("Error al cargar las alertas:", error);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const intervalId = setInterval(fetchAlerts, 60000);
    return () => clearInterval(intervalId);
  }, [user]);

  const newAlertsCount = alerts.filter(alert => alert.estadoAlerta === 'Nueva').length;

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

  const handleOpenAlertsMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElAlerts(event.currentTarget);
  };

  const handleCloseAlertsMenu = () => {
    setAnchorElAlerts(null);
  };

  const handleLogout = () => {
    logout();
    handleCloseUserMenu();
    navigate('/login');
  };

  const handleProfile = () => {
    handleCloseUserMenu();
    if (user?.idUsuario) {
      navigate(`/usuarios/${user.idUsuario}`);
    } else {
      navigate('/login');
    }
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: '#5033d8',
      }}
    >
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* IZQUIERDA */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onDrawerToggle}
            sx={{ display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <img
            src={logo}
            alt="Logo"
            ref={logoRef}
            style={{ height: '2.5rem' }}
          />
        </Box>

        {/* CENTRO */}
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
          <SplitText
            text="BIENVENIDOS A TECH 360"
            className="text-xl font-semibold text-[#5033d8] whitespace-nowrap"
            delay={30}
            duration={0.6}
            ease="power3.out"
            splitType="chars"
            from={{ opacity: 0, y: 40 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.1}
            rootMargin="-0.391rem"
            textAlign="center"
            onLetterAnimationComplete={() => {}}
          />
        </Box>

        {/* DERECHA */}
        {user ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Campana de notificaciones */}
            <Tooltip title="Ver notificaciones">
            <IconButton onClick={handleOpenAlertsMenu} sx={{ color: 'inherit' }}>
              <Badge
                color="error"
                variant={newAlertsCount > 0 ? "standard" : "dot"}
                badgeContent={newAlertsCount > 0 ? newAlertsCount : null}
                overlap="circular"
              >
                <FaBell size={20} />
              </Badge>
            </IconButton>
            </Tooltip>
            <Menu
              anchorEl={anchorElAlerts}
              open={Boolean(anchorElAlerts)}
              onClose={handleCloseAlertsMenu}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              PaperProps={{
                elevation: 4,
                sx: {
                  mt: 1.5,
                  minWidth: 350,
                  maxHeight: 400,
                  borderRadius: 2,
                  backgroundColor: '#fff',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  p: 1,
                  overflowY: 'auto',
                },
              }}
            >
              <AlertsPanel
                alerts={alerts}
                onAlertClick={() => {
                  handleCloseAlertsMenu();
                  fetchAlerts();
                }}
              />
            </Menu>

            {/* Menú de usuario */}
            <Tooltip title="Abrir opciones de usuario">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar sx={{ bgcolor: 'secondary.main' }}>
                  {user.nombreUsuario?.charAt(0).toUpperCase() || <AccountCircleIcon />}
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={anchorElUser}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              PaperProps={{
                elevation: 4,
                sx: {
                  mt: 1.5,
                  minWidth: 220,
                  borderRadius: 2,
                  backgroundColor: '#fff',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  '& .MuiMenuItem-root': {
                    borderRadius: 1,
                    mx: 1,
                    my: 0.5,
                    px: 2,
                    py: 1.2,
                    transition: 'background 0.2s ease-in-out',
                    '&:hover': { backgroundColor: '#f0f0f0' },
                  },
                },
              }}
            >
              <MenuItem onClick={handleProfile}>
                <ListItemIcon><AccountCircleIcon fontSize="small" /></ListItemIcon>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Perfil ({user.nombreUsuario})
                </Typography>
              </MenuItem>
              <MenuItem disabled>
                <Typography variant="caption" sx={{ px: 1, fontStyle: 'italic', opacity: 0.7 }}>
                  Rol: {user.rolUsuario}
                </Typography>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon><ExitToAppIcon fontSize="small" /></ListItemIcon>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Cerrar Sesión
                </Typography>
              </MenuItem>
            </Menu>
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
