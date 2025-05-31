// src/features/salesOrders/pages/SalesOrdersListPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Button, Paper, TableContainer, Table, TableHead, TableRow,
  TableCell, TableBody, TablePagination, CircularProgress, Alert, IconButton, Tooltip, Chip, Container
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { getAllSalesOrders } from '../../../api/salesOrderService';
import type { SalesOrderPageableRequest } from '../../../types/salesOrder.types';
import type { PaginatedSalesOrders } from '../../../types/salesOrder.types';
import { useAuth } from '../../../contexts/AuthContext';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { formatCurrency } from '../../../utils/formatting';

const SalesOrdersListPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [salesOrdersPage, setSalesOrdersPage] = useState<PaginatedSalesOrders | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchSalesOrders = useCallback(async (currentPage: number, currentRowsPerPage: number) => {
    setLoading(true);
    setError(null);
    try {
      const params: SalesOrderPageableRequest = {
        page: currentPage,
        size: currentRowsPerPage,
        sort: 'fechaPedido,desc', // Ordenar por fecha de pedido descendente
      };
      const data = await getAllSalesOrders(params);
      setSalesOrdersPage(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar órdenes de venta.');
      console.error("Error fetching sales orders:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSalesOrders(page, rowsPerPage);
  }, [fetchSalesOrders, page, rowsPerPage]);

  const handleChangePage = (event: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewDetails = (orderId: number) => navigate(`/ordenes-venta/${orderId}`);

  // Permisos basados en OrdenVentaController
  const canCreateSalesOrders = currentUser?.rolUsuario === 'Administrador' || currentUser?.rolUsuario === 'Ventas';
  const canViewSalesOrders = currentUser?.rolUsuario === 'Administrador' || currentUser?.rolUsuario === 'Gerente' || currentUser?.rolUsuario === 'Ventas';

  if (loading && !salesOrdersPage?.content.length && !error) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>;
  }
  if (!canViewSalesOrders && !loading && !error) {
     return <Container maxWidth="md"><Alert severity="warning" sx={{mt:2}}>No tienes permiso para ver esta página.</Alert></Container>;
  }
  if (error && !salesOrdersPage?.content.length) {
    return <Container maxWidth="md"><Alert severity="error" sx={{mt:2}}>{error}</Alert></Container>;
  }

  const getStatusChipColor = (status: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    switch (status?.toLowerCase()) {
        case 'pendiente': return 'warning';
        case 'confirmada': return 'info';
        case 'en producción': return 'secondary';
        case 'entregada': return 'success';
        case 'anulada': return 'error';
        default: return 'default';
    }
};

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', p: {xs: 1, sm: 2} }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h5" component="h1" sx={{display: 'flex', alignItems: 'center'}}>
          <ShoppingCartIcon sx={{mr:1}} /> Gestión de Órdenes de Venta
        </Typography>
        {canCreateSalesOrders && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            component={RouterLink}
            to="/ordenes-venta/nuevo"
          >
            Nueva Orden de Venta
          </Button>
        )}
      </Box>

      {error && salesOrdersPage?.content && salesOrdersPage.content.length > 0 && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my:2 }}><CircularProgress /></Box>}

      {!loading && salesOrdersPage && salesOrdersPage.content.length > 0 ? (
        <>
          <TableContainer>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID Orden</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Fecha Pedido</TableCell>
                  <TableCell>Fecha Entrega Est.</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {salesOrdersPage.content.map((order) => (
                  <TableRow hover key={order.idOrdenVenta}>
                    <TableCell>{order.idOrdenVenta}</TableCell>
                    <TableCell>{order.cliente.nombreCliente}</TableCell>
                    <TableCell>{format(parseISO(order.fechaPedido), 'dd/MM/yyyy HH:mm')}</TableCell>
                    <TableCell>{order.fechaEntregaEstimada ? format(parseISO(order.fechaEntregaEstimada), 'dd/MM/yyyy') : 'N/A'}</TableCell>
                    <TableCell>
                        <Chip label={order.estadoOrden} color={getStatusChipColor(order.estadoOrden)} size="small" />
                    </TableCell>
                    <TableCell align="right">{formatCurrency(order.totalOrden)}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Ver Detalles y Gestionar">
                        <IconButton onClick={() => handleViewDetails(order.idOrdenVenta)} color="primary" size="small">
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={salesOrdersPage.totalElements}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Órdenes por página:"
            getItemAriaLabel={(type) => type === 'first' ? 'Primera página' : type === 'last' ? 'Última página' : type === 'next' ? 'Siguiente página' : 'Página anterior'}
          />
        </>
      ) : (
         !loading && !error && <Typography sx={{mt: 2, textAlign: 'center'}}>No se encontraron órdenes de venta.</Typography>
      )}
    </Paper>
  );
};

export default SalesOrdersListPage;