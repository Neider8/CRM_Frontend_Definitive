import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';

const drawerWidth = 250; // Ancho del sidebar, puedes ajustarlo

const MainLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      <Header onDrawerToggle={handleDrawerToggle} />
      <Sidebar
        drawerWidth={drawerWidth}
        mobileOpen={mobileOpen}
        onDrawerToggle={handleDrawerToggle}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 }, // Padding responsivo
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: { xs: '56px', sm: '64px' }, // Espacio para el AppBar fijo
          bgcolor: 'background.default', // Usar color de fondo del tema
          overflowY: 'auto', // Scroll para contenido largo
          transition: (theme) =>
            theme.transitions.create('margin', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          marginLeft: { sm: 0 }, // Asegurar que el contenido principal se posicione correctamente con el drawer permanente
          ...(mobileOpen && {
            // Podrías necesitarla si el sidebar temporal empuja el contenido
          }),
        }}
      >
        {/* El Outlet renderizará las rutas hijas definidas en AppRouter */}
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;