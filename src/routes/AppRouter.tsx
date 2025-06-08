// src/routes/AppRouter.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import MainLayout from '../components/layout/MainLayout';
import DashboardPage from '../pages/HomePage';
import LoginPage from '../features/auth/pages/LoginPage';
import RegisterPage from '../features/auth/pages/RegisterPage';
import NotFoundPage from '../pages/NotFoundPage';
import AuthGuard from '../guards/AuthGuard';

// 🧑‍💼 Módulo de Usuarios
import UsersListPage from '../features/users/pages/UsersListPage';
import UserCreatePage from '../features/users/pages/UserCreatePage';
import UserEditPage from '../features/users/pages/UserEditPage';
import UserProfilePage from '../features/users/pages/UserProfilePage';
import UserChangePasswordAdminPage from '../features/users/pages/UserChangePasswordAdminPage';
import ChangeOwnPasswordPage from '../features/auth/pages/ChangeOwnPasswordPage';

// 🏢 Módulo de Empleados
import EmployeesListPage from '../features/employees/pages/EmployeesListPage';
import EmployeeCreatePage from '../features/employees/pages/EmployeeCreatePage';
import EmployeeEditPage from '../features/employees/pages/EmployeeEditPage';
import EmployeeDetailPage from '../features/employees/pages/EmployeeDetailPage';

// 🤝 Módulo de Clientes
import ClientsListPage from '../features/clients/pages/ClientsListPage';
import ClientCreatePage from '../features/clients/pages/ClientCreatePage';
import ClientEditPage from '../features/clients/pages/ClientEditPage';
import ClientDetailPage from '../features/clients/pages/ClientDetailPage';

// 🚚 Módulo de Proveedores
import SuppliersListPage from '../features/suppliers/page/SuppliersListPage';
import SupplierCreatePage from '../features/suppliers/components/SupplierCreateForm';
import SupplierEditPage from '../features/suppliers/page/SupplierEditPage'; // <--- ESTA IMPORTACIÓN ES CLAVE
import SupplierDetailPage from '../features/suppliers/page/SupplierDetailPage';

// 📦 Módulo de Productos
import ProductsListPage from '../features/products/pages/ProductsListPage';
import ProductCreatePage from '../features/products/components/ProductCreateForm';
import ProductEditPage from '../features/products/pages/ProductEditPage';
import ProductDetailPage from '../features/products/pages/ProductDetailPage';

// 🧪 Módulo de Insumos
import SuppliesListPage from '../features/supplies/pages/SuppliesListPage';
import SupplyCreatePage from '../features/supplies/components/SupplyCreateForm';
import SupplyEditPage from '../features/supplies/pages/SupplyEditPage';
import SupplyDetailPage from '../features/supplies/pages/SupplyDetailPage';

// 📦 Módulo de Inventario de Productos
import ProductInventoryListPage from '../features/productInventory/pages/ProductInventoryListPage';
import ProductInventoryCreatePage from '../features/productInventory/pages/ProductInventoryCreatePage';
import ProductInventoryDetailPage from '../features/productInventory/pages/ProductInventoryDetailPage';

// 🧪 Módulo de Inventario de Insumos
import SupplyInventoryListPage from '../features/supplyInventory/pages/SupplyInventoryListPage';
import SupplyInventoryCreatePage from '../features/supplyInventory/pages/SupplyInventoryCreatePage';
import SupplyInventoryDetailPage from '../features/supplyInventory/pages/SupplyInventoryDetailPage';

// 🛒 Módulo de Órdenes de Venta
import SalesOrdersListPage from '../features/salesOrders/pages/SalesOrdersListPage';
import SalesOrderCreatePage from '../features/salesOrders/pages/SalesOrderCreatePage';
import SalesOrderDetailPage from '../features/salesOrders/pages/SalesOrderDetailPage';

// 🛍️ Módulo de Órdenes de Compra
import PurchaseOrdersListPage from '../features/purchaseOrders/pages/PurchaseOrdersListPage';
import PurchaseOrderCreatePage from '../features/purchaseOrders/pages/PurchaseOrderCreatePage';
import PurchaseOrderDetailPage from '../features/purchaseOrders/pages/PurchaseOrderDetailPage';

// ⚙️ Módulo de Órdenes de Producción
import ProductionOrdersListPage from '../features/productionOrders/pages/ProductionOrdersListPage';
import ProductionOrderCreatePage from '../features/productionOrders/pages/ProductionOrderCreatePage';
import ProductionOrderDetailPage from '../features/productionOrders/pages/ProductionOrderDetailPage';

// 💰 Módulo de Pagos y Cobros
import PaymentReceiptsListPage from '../features/paymentReceipts/pages/PaymentReceiptsListPage';
import PaymentReceiptCreatePage from '../features/paymentReceipts/pages/PaymentReceiptCreatePage';
import PaymentReceiptDetailPage from '../features/paymentReceipts/pages/PaymentReceiptDetailPage';

// 🛡️ Módulo de Roles y Permisos (solo para Admin)
import RolePermissionsPage from '../features/rolePermissions/pages/RolePermissionsPage';

// 🛡️ Nuevo: Página de Permisos de Admin
import AdminPermissionsPage from '../features/adminPermissions/pages/AdminPermissionsPage';

const AppRouter: React.FC = () => {
    return (
        <Routes>
            {/* 🔓 Rutas públicas */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* 🔐 Rutas protegidas bajo MainLayout + AuthGuard */}
            <Route
                path="/"
                element={
                    <AuthGuard>
                        <MainLayout />
                    </AuthGuard>
                }
            >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />

                {/* 🧑‍💼 Módulo de Usuarios */}
                <Route path="usuarios" element={<UsersListPage />} />
                <Route path="usuarios/nuevo" element={<UserCreatePage />} />
                <Route path="usuarios/:userId" element={<UserProfilePage />} />
                <Route path="usuarios/:userId/editar" element={<UserEditPage />} />
                <Route path="usuarios/:userId/cambiar-contrasena" element={<UserChangePasswordAdminPage />} />
                <Route path="perfil/cambiar-contrasena" element={<ChangeOwnPasswordPage />} />

                {/* 🏢 Módulo de Empleados */}
                <Route path="empleados" element={<EmployeesListPage />} />
                <Route path="empleados/nuevo" element={<EmployeeCreatePage />} />
                <Route path="empleados/:employeeId" element={<EmployeeDetailPage />} />
                <Route path="empleados/:employeeId/editar" element={<EmployeeEditPage />} />

                {/* 🤝 Módulo de Clientes */}
                <Route path="clientes" element={<ClientsListPage />} />
                <Route path="clientes/nuevo" element={<ClientCreatePage />} />
                <Route path="clientes/:clientId" element={<ClientDetailPage />} />
                <Route path="clientes/:clientId/editar" element={<ClientEditPage />} />

                {/* 🚚 Módulo de Proveedores */}
                <Route path="proveedores" element={<SuppliersListPage />} />
                <Route path="proveedores/nuevo" element={<SupplierCreatePage />} />
                <Route path="proveedores/:supplierId/editar" element={<SupplierEditPage />} /> {/* <--- ESTA RUTA ES CLAVE */}
                <Route path="proveedores/:supplierId" element={<SupplierDetailPage />} />

                {/* 📦 Módulo de Productos */}
                <Route path="productos" element={<ProductsListPage />} />
                <Route path="productos/nuevo" element={<ProductCreatePage />} />
                <Route path="productos/:productId/editar" element={<ProductEditPage />} />
                <Route path="productos/:productId" element={<ProductDetailPage />} />

                {/* 🧪 Módulo de Insumos */}
                <Route path="insumos" element={<SuppliesListPage />} />
                <Route path="insumos/nuevo" element={<SupplyCreatePage />} />
                <Route path="insumos/:supplyId" element={<SupplyDetailPage />} />
                <Route path="insumos/:supplyId/editar" element={<SupplyEditPage />} />

                {/* 📦 Módulo de Inventario de Productos */}
                <Route path="inventario-productos" element={<ProductInventoryListPage />} />
                <Route path="inventario-productos/nuevo" element={<ProductInventoryCreatePage />} />
                <Route path="inventario-productos/:inventoryId" element={<ProductInventoryDetailPage />} />

                {/* 🧪 Módulo de Inventario de Insumos */}
                <Route path="inventario-insumos" element={<SupplyInventoryListPage />} />
                <Route path="inventario-insumos/nuevo" element={<SupplyInventoryCreatePage />} />
                <Route path="inventario-insumos/:inventoryId" element={<SupplyInventoryDetailPage />} />

                {/* 🛒 Módulo de Órdenes de Venta */}
                <Route path="ordenes-venta" element={<SalesOrdersListPage />} />
                <Route path="ordenes-venta/nuevo" element={<SalesOrderCreatePage />} />
                <Route path="ordenes-venta/:orderId" element={<SalesOrderDetailPage />} />

                {/* 🛍️ Módulo de Órdenes de Compra */}
                <Route path="ordenes-compra" element={<PurchaseOrdersListPage />} />
                <Route path="ordenes-compra/nuevo" element={<PurchaseOrderCreatePage />} />
                <Route path="ordenes-compra/:orderId" element={<PurchaseOrderDetailPage />} />

                {/* ⚙️ Módulo de Órdenes de Producción */}
                <Route path="ordenes-produccion" element={<ProductionOrdersListPage />} />
                <Route path="ordenes-produccion/nuevo" element={<ProductionOrderCreatePage />} />
                <Route path="ordenes-produccion/:orderId" element={<ProductionOrderDetailPage />} />

                {/* 💰 Módulo de Pagos y Cobros */}
                <Route path="pagos-cobros" element={<PaymentReceiptsListPage />} />
                <Route path="pagos-cobros/nuevo" element={<PaymentReceiptCreatePage />} />
                <Route path="pagos-cobros/:transactionId" element={<PaymentReceiptDetailPage />} />

                {/* 🛡️ Módulo de Roles y Permisos (solo para Admin) */}
                <Route path="roles-permisos" element={<RolePermissionsPage />} />

                {/* 🛡️ Nuevo: Página de Permisos de Admin */}
                <Route path="admin/permisos" element={<AdminPermissionsPage />} />

                {/* Aquí puedes agregar más rutas futuras */}
            </Route>
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
};

export default AppRouter;