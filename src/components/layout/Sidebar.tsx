// src/components/layout/Sidebar.tsx
import React from 'react';
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Box, Divider, Typography, Tooltip } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import BusinessIcon from '@mui/icons-material/Business';
import InventoryIcon from '@mui/icons-material/Inventory'; // Productos
import CategoryIcon from '@mui/icons-material/Category'; // Insumos (cambiado de LocalShippingIcon para diferenciar mejor)
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import StoreIcon from '@mui/icons-material/Store';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
// import SettingsIcon from '@mui/icons-material/Settings'; // Descomentar si se usa

import { NavLink as RouterNavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  mobileOpen: boolean;
  onDrawerToggle: () => void;
  drawerWidth: number;
}

interface MenuItemStructure {
  text: string;
  icon: React.ReactElement;
  path: string;
  allowedRoles?: string[];
  subItems?: MenuItemStructure[]; // Para futuros submenús
}

const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onDrawerToggle, drawerWidth }) => {
  const location = useLocation();
  const { user } = useAuth();

  // Definición de los ítems del menú
  // Ajusta los paths y allowedRoles según tu estructura de backend y necesidades
  const menuItems: MenuItemStructure[] = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Clientes', icon: <PeopleIcon />, path: '/clientes', allowedRoles: ['Administrador', 'Gerente', 'Ventas'] },
    { text: 'Proveedores', icon: <BusinessIcon />, path: '/proveedores', allowedRoles: ['Administrador', 'Gerente'] },
    { text: 'Productos', icon: <InventoryIcon />, path: '/productos' },
    { text: 'Insumos', icon: <CategoryIcon />, path: '/insumos', allowedRoles: ['Administrador', 'Gerente', 'Operario'] },
    { text: 'Órdenes de Venta', icon: <ShoppingCartIcon />, path: '/ordenes-venta', allowedRoles: ['Administrador', 'Gerente', 'Ventas'] },
    { text: 'Órdenes de Compra', icon: <StoreIcon />, path: '/ordenes-compra', allowedRoles: ['Administrador', 'Gerente'] },
    { text: 'Órdenes de Producción', icon: <PrecisionManufacturingIcon />, path: '/ordenes-produccion', allowedRoles: ['Administrador', 'Gerente', 'Operario'] },
    { text: 'Inv. Productos', icon: <WarehouseIcon />, path: '/inventario-productos', allowedRoles: ['Administrador', 'Gerente', 'Operario', 'Ventas'] }, // Podrías renombrar "Inventario Productos" a algo más corto
    { text: 'Inv. Insumos', icon: <WarehouseIcon sx={{ transform: 'scaleX(-1)'}}/>, path: '/inventario-insumos', allowedRoles: ['Administrador', 'Gerente', 'Operario'] }, // Ídem
    { text: 'Pagos y Cobros', icon: <AccountBalanceWalletIcon />, path: '/pagos-cobros', allowedRoles: ['Administrador', 'Gerente', 'Ventas'] },
    { text: 'Usuarios', icon: <PersonOutlineIcon />, path: '/usuarios', allowedRoles: ['Administrador', 'Gerente'] },
    { text: 'Empleados', icon: <GroupAddIcon />, path: '/empleados', allowedRoles: ['Administrador', 'Gerente'] },
    { text: 'Roles y Permisos', icon: <VpnKeyIcon />, path: '/roles-permisos', allowedRoles: ['Administrador'] },
  ];

  const isUserAllowed = (itemRoles?: string[]): boolean => {
    if (!user || !user.rolUsuario) return false;
    if (!itemRoles || itemRoles.length === 0) return true;
    return itemRoles.includes(user.rolUsuario);
  };

  const drawerContent = (
    <Box>
      <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        {/* Podrías poner un logo pequeño aquí o el nombre de la app */}
        <Typography variant="h6" noWrap component="div" sx={{ mt: 1, color: (theme) => theme.palette.primary.main }}>
          CRMTech360
        </Typography>
        <Typography variant="caption" sx={{color: (theme) => theme.palette.text.secondary}}>
          Menú Principal
        </Typography>
      </Toolbar>
      <Divider />
      <List sx={{ pt: 0 }}>
        {menuItems
          .filter(item => isUserAllowed(item.allowedRoles))
          .map(item => (
            <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
              <Tooltip
                title={item.text}
                placement="right"
                arrow
                disableHoverListener={!mobileOpen && drawerWidth <= 70}
              >
                <ListItemButton
                  component={RouterNavLink}
                  to={item.path}
                  selected={
                    location.pathname === item.path ||
                    (item.path !== '/dashboard' && location.pathname.startsWith(item.path))
                  }
                  onClick={() => {
                    if (mobileOpen) onDrawerToggle();
                  }}
                  sx={{
                    minHeight: 48,
                    justifyContent: 'initial',
                    px: 2.5,
                    '&.Mui-selected': {
                      backgroundColor: (theme) => theme.palette.action.selected,
                      '&:hover': {
                        backgroundColor: (theme) => theme.palette.action.hover,
                      },
                    },
                    '&:hover': {
                      backgroundColor: (theme) => theme.palette.action.hover,
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: 3,
                      justifyContent: 'center',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} sx={{ opacity: 1 }} />
                </ListItemButton>
              </Tooltip>
            </ListItem>
          ))}
      </List>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      aria-label="mailbox folders"
    >
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, bgcolor: 'background.paper' },
        }}
      >
        {drawerContent}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, bgcolor: 'background.paper' },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default Sidebar;