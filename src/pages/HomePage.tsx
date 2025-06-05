// src/pages/HomePage.tsx
import React, { useEffect, useState } from 'react';
import {
  Container, Paper, Typography, Box, CircularProgress, Alert, Button,
  Divider, Avatar
} from '@mui/material';
import SpeedIcon from '@mui/icons-material/Speed';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import InventoryIcon from '@mui/icons-material/Inventory';
import PeopleIcon from '@mui/icons-material/People';
import CategoryIcon from '@mui/icons-material/Category';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PersonIcon from '@mui/icons-material/Person';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

import StockAlertsDisplay from '../components/stock/StockAlertsDisplay';
import SampleBarChart from '../features/dashboard/components/SampleBarChart';
import { getDashboardSummaryStats } from '../services/dashboardService';
import { formatCurrency } from '../utils/formatting';
import type { DashboardSummaryStats } from '../types/dashboard.types';

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardSummaryStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [errorStats, setErrorStats] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoadingStats(true);
      setErrorStats(null);
      try {
        const fetchedStats = await getDashboardSummaryStats();
        setStats(fetchedStats);
      } catch (err: unknown) {
        console.error("Error cargando datos del dashboard:", err);
        if (err instanceof Error) {
          setErrorStats(err.message || "No se pudieron cargar los datos del dashboard.");
        } else {
          setErrorStats("No se pudieron cargar los datos del dashboard.");
        }
      } finally {
        setLoadingStats(false);
      }
    };
    fetchDashboardData();
  }, []);

  const QuickAccessButton: React.FC<{ to: string; icon: React.ReactElement; text: string }> = ({ to, icon, text }) => (
    <Button
      component={RouterLink}
      to={to}
      variant="contained"
      startIcon={icon}
      sx={{ m: 1, py: 1.5, px: 2, textTransform: 'none', width: '100%', justifyContent: 'flex-start' }}
    >
      {text}
    </Button>
  );

  const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactElement; color?: string; linkTo?: string; linkText?: string }> = ({ title, value, icon, color = 'primary.main', linkTo, linkText }) => (
    <Paper elevation={3} sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%', minHeight:180, justifyContent:'space-between', mb: 2 }}>
        <Box sx={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <Typography variant="subtitle1" color="text.secondary">{title}</Typography>
            <Avatar sx={{ bgcolor: color, width: 40, height: 40 }}>{icon}</Avatar>
        </Box>
        <Typography variant="h3" component="p" sx={{ my: 2, fontWeight: 'bold' }}>
            {loadingStats && !stats ? <CircularProgress size={30} /> : value}
        </Typography>
        {linkTo && linkText && <Button component={RouterLink} to={linkTo} size="small" sx={{alignSelf:'flex-start'}}> {linkText} </Button>}
    </Paper>
  );

  // Componente interno para mostrar las estadísticas del dashboard
  const DashboardStatsDisplay: React.FC = () => {
    if (loadingStats) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
          <CircularProgress size={24} sx={{ mr: 1 }} />
          <Typography variant="body1" color="text.secondary">Cargando estadísticas...</Typography>
        </Box>
      );
    }

    if (errorStats) {
      return (
        <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
          <ErrorOutlineIcon fontSize="inherit" sx={{ mr: 1 }} />
          <Typography variant="body1" component="span" sx={{ fontWeight: 'bold' }}>Error al cargar estadísticas: </Typography>
          <Typography variant="body2" component="span">{errorStats}</Typography>
        </Alert>
      );
    }

    if (!stats) {
      return null;
    }

    // Sin Grid: usar flexbox para las tarjetas
    return (
      <Box sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 2,
        mb: 4,
        justifyContent: { xs: 'center', sm: 'flex-start' }
      }}>
        <Box sx={{ flex: '1 1 220px', minWidth: 220, maxWidth: 300 }}>
          <StatCard title="Clientes Totales" value={stats.totalClients} icon={<PeopleIcon />} color="primary.main" linkTo="/clients" linkText="Ver Clientes"/>
        </Box>
        <Box sx={{ flex: '1 1 220px', minWidth: 220, maxWidth: 300 }}>
          <StatCard title="Productos Totales" value={stats.totalProducts} icon={<CategoryIcon />} color="success.main" linkTo="/products" linkText="Ver Productos"/>
        </Box>
        <Box sx={{ flex: '1 1 220px', minWidth: 220, maxWidth: 300 }}>
          <StatCard title="Ventas este Mes" value={stats.totalSalesThisMonth} icon={<ShoppingCartIcon />} color="info.main" linkTo="/sales-orders" linkText="Ver Ventas"/>
        </Box>
        <Box sx={{ flex: '1 1 220px', minWidth: 220, maxWidth: 300 }}>
          <StatCard title="Producción Pendiente" value={stats.totalProductionOrdersPending} icon={<PrecisionManufacturingIcon />} color="warning.main" linkTo="/production-orders" linkText="Ver Producción"/>
        </Box>
        <Box sx={{ flex: '1 1 220px', minWidth: 220, maxWidth: 300 }}>
          <StatCard title="Ventas Recientes" value={formatCurrency(stats.recentSalesValue)} icon={<ShoppingCartIcon />} color="secondary.main" linkTo="/sales-orders" linkText="Ver Ventas"/>
        </Box>
      </Box>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <SpeedIcon color="primary" sx={{ fontSize: '2.5rem', mr: 1 }} />
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Dashboard {user ? `- Bienvenido, ${user.nombreUsuario}` : ''}
        </Typography>
      </Box>

      {/* Sección de Alertas de Stock */}
      <Box sx={{ mb: 4 }}>
        <StockAlertsDisplay />
      </Box>

      {/* Sección de Estadísticas Clave */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>📊 Estadísticas Clave</Typography>
        <DashboardStatsDisplay />
      </Box>

      {/* Quick Access and Chart sin Grid */}
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: 3
      }}>
        <Box sx={{ flex: '1 1 320px', minWidth: 280 }}>
          <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>Accesos Rápidos</Typography>
            <Divider sx={{mb:2}}/>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <QuickAccessButton to="/sales-orders/new" icon={<AddCircleOutlineIcon />} text="Nueva Orden de Venta" />
              <QuickAccessButton to="/clients/new" icon={<AddCircleOutlineIcon />} text="Nuevo Cliente" />
              <QuickAccessButton to="/products/new" icon={<AddCircleOutlineIcon />} text="Nuevo Producto" />
              <QuickAccessButton to="/supplies/new" icon={<AddCircleOutlineIcon />} text="Nuevo Insumo" />
              <QuickAccessButton to="/suppliers/new" icon={<AddCircleOutlineIcon />} text="Nuevo Proveedor" />
            </Box>
          </Paper>
        </Box>
        <Box sx={{ flex: '2 1 500px', minWidth: 320 }}>
          <Paper elevation={3} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>Gráfico de Ventas (Ejemplo)</Typography>
            <Box sx={{ flexGrow: 1, minHeight: 300 }}>
              <SampleBarChart />
            </Box>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};

export default HomePage;
