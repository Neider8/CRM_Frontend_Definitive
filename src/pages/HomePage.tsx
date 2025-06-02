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
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Ajusta la ruta si es diferente

// Importar el nuevo componente de gráfico
import SampleBarChart from '../features/dashboard/components/SampleBarChart'; // Ajusta la ruta si es diferente

interface DashboardStats {
  activeSalesOrders: number;
  productionOrdersInProgress: number;
  pendingPurchaseOrders: number;
  lowStockProducts: number;
}

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        await new Promise(resolve => setTimeout(resolve, 700));
        setStats({
          activeSalesOrders: 12,
          productionOrdersInProgress: 5,
          pendingPurchaseOrders: 3,
          lowStockProducts: 7,
        });
      } catch (err: unknown) {
        console.error("Error cargando datos del dashboard:", err);
        if (err instanceof Error) {
          setError(err.message || "No se pudieron cargar los datos del dashboard.");
        } else {
          setError("No se pudieron cargar los datos del dashboard.");
        }
      } finally {
        setLoading(false);
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

  const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactElement; color?: string; linkTo?: string; linkText?: string }> = ({ title, value, icon, color = 'text.primary', linkTo, linkText }) => (
    <Paper elevation={3} sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%', minHeight:180, justifyContent:'space-between', mb: 2 }}>
        <Box sx={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <Typography variant="subtitle1" color="text.secondary">{title}</Typography>
            <Avatar sx={{ bgcolor: color, width: 40, height: 40 }}>{icon}</Avatar>
        </Box>
        <Typography variant="h3" component="p" sx={{ my: 2, fontWeight: 'bold' }}>
            {loading && !stats ? <CircularProgress size={30} /> : value}
        </Typography>
        {linkTo && linkText && <Button component={RouterLink} to={linkTo} size="small" sx={{alignSelf:'flex-start'}}> {linkText} </Button>}
    </Paper>
  );

  if (error) {
    return <Container><Alert severity="error" sx={{ mt: 2 }}>{error}</Alert></Container>;
  }

  return (
    <Container maxWidth="md" sx={{ mt: 2, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <SpeedIcon color="primary" sx={{ fontSize: '2.5rem', mr: 1 }} />
        <Typography variant="h4" component="h1">
          Dashboard {user ? `- Bienvenido, ${user.nombreUsuario}` : ''}
        </Typography>
      </Box>

      {/* Stat Cards */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box sx={{ flex: '1 1 220px', minWidth: 220 }}>
          <StatCard title="Órdenes de Venta Activas" value={stats?.activeSalesOrders ?? '--'} icon={<ShoppingCartIcon />} color="primary.main" linkTo="/ordenes-venta" linkText="Ver Órdenes"/>
        </Box>
        <Box sx={{ flex: '1 1 220px', minWidth: 220 }}>
          <StatCard title="O. Producción en Curso" value={stats?.productionOrdersInProgress ?? '--'} icon={<PrecisionManufacturingIcon />} color="secondary.main" linkTo="/ordenes-produccion" linkText="Ver Órdenes"/>
        </Box>
        <Box sx={{ flex: '1 1 220px', minWidth: 220 }}>
          <StatCard title="Órdenes de Compra Pend." value={stats?.pendingPurchaseOrders ?? '--'} icon={<ShoppingBasketIcon />} color="info.main" linkTo="/ordenes-compra" linkText="Ver Órdenes"/>
        </Box>
        <Box sx={{ flex: '1 1 220px', minWidth: 220 }}>
          <StatCard title="Productos Bajo Stock" value={stats?.lowStockProducts ?? '--'} icon={<InventoryIcon />} color="warning.main" linkTo="/inventario-productos" linkText="Ver Inventario"/>
        </Box>
      </Box>

      {/* Quick Access and Chart */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        <Paper elevation={3} sx={{ p: 2, flex: '1 1 300px', mb: { xs: 2, md: 0 } }}>
          <Typography variant="h6" gutterBottom>Accesos Rápidos</Typography>
          <Divider sx={{mb:1}}/>
          <QuickAccessButton to="/ordenes-venta/nuevo" icon={<AddCircleOutlineIcon />} text="Nueva Orden de Venta" />
          <QuickAccessButton to="/clientes/nuevo" icon={<AddCircleOutlineIcon />} text="Nuevo Cliente" />
          <QuickAccessButton to="/productos/nuevo" icon={<AddCircleOutlineIcon />} text="Nuevo Producto" />
          <QuickAccessButton to="/insumos/nuevo" icon={<AddCircleOutlineIcon />} text="Nuevo Insumo" />
          <QuickAccessButton to="/proveedores/nuevo" icon={<AddCircleOutlineIcon />} text="Nuevo Proveedor" />
        </Paper>
        <Box sx={{ flex: '2 1 500px', minWidth: 300 }}>
          <SampleBarChart />
        </Box>
      </Box>
    </Container>
  );
};

export default HomePage;
