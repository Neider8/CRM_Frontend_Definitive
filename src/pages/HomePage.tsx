import React from 'react';
import {
  Container, Paper, Typography, Box, Button,
  Divider
} from '@mui/material';
import SpeedIcon from '@mui/icons-material/Speed';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// --- Componentes Funcionales Reales ---
import StockAlertsDisplay from '../components/stock/StockAlertsDisplay'; 

const HomePage: React.FC = () => {
  const { user } = useAuth();

  const QuickAccessButton: React.FC<{ to: string; icon: React.ReactElement; text: string }> = ({ to, icon, text }) => (
    <Button component={RouterLink} to={to} variant="contained" startIcon={icon}
      sx={{ m: 1, py: 1.5, px: 2, textTransform: 'none', width: '100%', justifyContent: 'flex-start' }}
    >
      {text}
    </Button>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <SpeedIcon color="primary" sx={{ fontSize: '2.5rem', mr: 1 }} />
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Dashboard {user ? `- Bienvenido, ${user.nombreUsuario}` : ''}
        </Typography>
      </Box>

      {/* --- SECCIÓN DE ALERTAS EN TIEMPO REAL (FUNCIONAL) --- */}
      {/* Esta sección ahora funcionará después de corregir el error 1 */}
      <Box sx={{ mb: 4 }}>
        <StockAlertsDisplay />
      </Box>

      {/* --- SECCIÓN DE ACCESOS RÁPIDOS (FUNCIONAL) --- */}
      <Box sx={{ flex: '1 1 320px', minWidth: 280 }}>
        <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>Accesos Rápidos</Typography>
          <Divider sx={{mb:2}}/>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <QuickAccessButton to="/ordenes-venta/nuevo" icon={<AddCircleOutlineIcon />} text="Nueva Orden de Venta" />
            <QuickAccessButton to="/clientes/nuevo" icon={<AddCircleOutlineIcon />} text="Nuevo Cliente" />
            <QuickAccessButton to="/productos/nuevo" icon={<AddCircleOutlineIcon />} text="Nuevo Producto" />
            <QuickAccessButton to="/insumos/nuevo" icon={<AddCircleOutlineIcon />} text="Nuevo Insumo" />
            <QuickAccessButton to="/proveedores/nuevo" icon={<AddCircleOutlineIcon />} text="Nuevo Proveedor" />
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default HomePage;