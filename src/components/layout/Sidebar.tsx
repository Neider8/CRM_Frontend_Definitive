// src/components/layout/Sidebar.tsx
import './layout.css';
import '../../styles/global.css';
import { NavLink as RouterNavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Box, Tooltip } from '@mui/material';

import { FaHouseChimney, FaPersonCircleCheck, FaListCheck } from 'react-icons/fa6';
import { AiFillCalendar } from 'react-icons/ai';
import { FaRegCalendarAlt } from 'react-icons/fa';
import { IoPeople } from 'react-icons/io5';
import { PiNutBold } from 'react-icons/pi';
import { GiClothes } from 'react-icons/gi';

interface SidebarProps {
  drawerWidth: number;
}

interface MenuItemStructure {
  text: string;
  icon: React.ReactElement;
  path: string;
  allowedRoles?: string[];
}

const Sidebar: React.FC<SidebarProps> = ({ drawerWidth }) => {
  const location = useLocation();
  const { user } = useAuth();

  const menuItems: MenuItemStructure[] = [
    { text: 'Dashboard', icon: <FaHouseChimney />, path: '/dashboard' },
    { text: 'Clientes', icon: <IoPeople />, path: '/clientes', allowedRoles: ['Administrador', 'Gerente', 'Ventas'] },
    { text: 'Proveedores', icon: <FaRegCalendarAlt />, path: '/proveedores', allowedRoles: ['Administrador', 'Gerente'] },
    { text: 'Productos', icon: <GiClothes />, path: '/productos' },
    { text: 'Insumos', icon: <PiNutBold />, path: '/insumos', allowedRoles: ['Administrador', 'Gerente', 'Operario'] },
    { text: 'Órdenes de Venta', icon: <FaListCheck />, path: '/ordenes-venta', allowedRoles: ['Administrador', 'Gerente', 'Ventas'] },
    { text: 'Órdenes de Compra', icon: <AiFillCalendar />, path: '/ordenes-compra', allowedRoles: ['Administrador', 'Gerente'] },
    { text: 'Órdenes de Producción', icon: <FaRegCalendarAlt />, path: '/ordenes-produccion', allowedRoles: ['Administrador', 'Gerente', 'Operario'] },
    { text: 'Inv. Productos', icon: <GiClothes />, path: '/inventario-productos', allowedRoles: ['Administrador', 'Gerente', 'Operario', 'Ventas'] },
    { text: 'Inv. Insumos', icon: <PiNutBold />, path: '/inventario-insumos', allowedRoles: ['Administrador', 'Gerente', 'Operario'] },
    { text: 'Pagos y Cobros', icon: <FaListCheck />, path: '/pagos-cobros', allowedRoles: ['Administrador', 'Gerente', 'Ventas'] },
    { text: 'Usuarios', icon: <FaPersonCircleCheck />, path: '/usuarios', allowedRoles: ['Administrador', 'Gerente'] },
    { text: 'Empleados', icon: <IoPeople />, path: '/empleados', allowedRoles: ['Administrador', 'Gerente'] },
    { text: 'Roles y Permisos', icon: <FaListCheck />, path: '/roles-permisos', allowedRoles: ['Administrador'] },
    { text: 'Definir Permisos', icon: <FaListCheck />, path: '/admin/permisos', allowedRoles: ['Administrador'] },
  ];

  const isUserAllowed = (itemRoles?: string[]): boolean => {
    if (!user || !user.rolUsuario) return false;
    if (!itemRoles || itemRoles.length === 0) return true;
    return itemRoles.includes(user.rolUsuario);
  };

  return (
    <Box className="sidebar" sx={{ width: '4.9rem' }}>
      <ul className="sidebar-list">
        {menuItems
          .filter(item => isUserAllowed(item.allowedRoles))
          .map(item => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path);
            return (
              <li key={item.text}>
                <Tooltip title={item.text} placement="right" arrow>
                  <RouterNavLink
                    to={item.path}
                    className={`sidebar-link ${isActive ? 'active' : ''}`}
                  >
                    <span className="sidebar-icon">{item.icon}</span>
                    <span className="sidebar-text">{item.text}</span>
                  </RouterNavLink>
                </Tooltip>
              </li>
            );
          })}
      </ul>
    </Box>
  );
};

export default Sidebar;
