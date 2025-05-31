// src/components/layout/Header.tsx
import React from 'react';
import {AppBar, Toolbar, Typography, Button, Box, IconButton, Avatar, Tooltip, Menu, MenuItem, ListItemIcon, Divider, } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

interface HeaderProps {
  onDrawerToggle?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onDrawerToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);

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
      navigate(`/usuarios/${user.idUsuario}`); // ✅ Ruta al perfil del usuario
    } else {
      console.warn('No se pudo navegar al perfil: usuario o ID de usuario no disponible.');
      navigate('/login'); // Opcional: redirigir a login como fallback
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
