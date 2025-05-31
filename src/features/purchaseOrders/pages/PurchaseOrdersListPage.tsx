// src/features/purchaseOrders/pages/PurchaseOrdersListPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Button, Paper, TableContainer, Table, TableHead, TableRow,
  TableCell, TableBody, TablePagination, CircularProgress, Alert, IconButton, Tooltip, Chip, Container
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket'; // Icono para órdenes de compra
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { getAllPurchaseOrders } from '../../../api/purchaseOrderService';
import type { PurchaseOrderPageableRequest, PaginatedPurchaseOrders } from '../../../types/purchaseOrder.types';
import { useAuth } from '../../../contexts/AuthContext';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { formatCurrency } from '../../../utils/formatting';

const PurchaseOrdersListPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [purchaseOrdersPage, setPurchaseOrdersPage] = useState<PaginatedPurchaseOrders | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchPurchaseOrders = useCallback(async (currentPage: number, currentRowsPerPage: number) => {
    setLoading(true);
    setError(null);
    try {
      const params: PurchaseOrderPageableRequest = {
        page: currentPage,
        size: currentRowsPerPage,
        sort: 'fechaPedidoCompra,desc',
      };
      const data = await getAllPurchaseOrders(params);
      setPurchaseOrdersPage(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar órdenes de compra.');
      console.error("Error fetching purchase orders:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPurchaseOrders(page, rowsPerPage);
  }, [fetchPurchaseOrders, page, rowsPerPage]);

  const handleChangePage = (event: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewDetails = (orderId: number) => navigate(`/ordenes-compra/${orderId}`);

  // Permisos basados en OrdenCompraController
  const canCreatePurchaseOrders = currentUser?.rolUsuario === 'Administrador' || currentUser?.rolUsuario === 'Gerente';
  const canViewPurchaseOrders = currentUser?.rolUsuario === 'Administrador' || currentUser?.rolUsuario === 'Gerente' /*|| currentUser?.rolUsuario === 'Operario' */; // Operario usualmente no ve OC

  if (loading && !purchaseOrdersPage?.content.length && !error) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>;
  }
  if (!canViewPurchaseOrders && !loading && !error) {
     return <Container maxWidth="md"><Alert severity="warning" sx={{mt:2}}>No tienes permiso para ver esta página.</Alert></Container>;
  }
  if (error && !purchaseOrdersPage?.content.length) {
    return <Container maxWidth="md"><Alert severity="error" sx={{mt:2}}>{error}</Alert></Container>;
  }

  const getStatusChipColor = (status: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    switch (status?.toLowerCase()) {
        case 'pendiente': return 'warning';
        case 'enviada': return 'info';
        case 'recibida parcial': return 'secondary';
        case 'recibida total': return 'success';
        case 'anulada': return 'error';
        default: return 'default';
    }
};


  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', p: {xs: 1, sm: 2} }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h5" component="h1" sx={{display: 'flex', alignItems: 'center'}}>
          <ShoppingBasketIcon sx={{mr:1}} /> Gestión de Órdenes de Compra
        </Typography>
        {canCreatePurchaseOrders && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            component={RouterLink}
            to="/ordenes-compra/nuevo"
          >
            Nueva Orden de Compra
          </Button>
        )}
      </Box>

      {error && purchaseOrdersPage?.content && purchaseOrdersPage.content.length > 0 && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my:2 }}><CircularProgress /></Box>}

      {!loading && purchaseOrdersPage && purchaseOrdersPage.content.length > 0 ? (
        <>
          <TableContainer>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID Orden</TableCell>
                  <TableCell>Proveedor</TableCell>
                  <TableCell>Fecha Pedido</TableCell>
                  <TableCell>Entrega Est.</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {purchaseOrdersPage.content.map((order) => (
                  <TableRow hover key={order.idOrdenCompra}>
                    <TableCell>{order.idOrdenCompra}</TableCell>
                    <TableCell>{order.proveedor.nombreComercialProveedor}</TableCell>
                    <TableCell>{format(parseISO(order.fechaPedidoCompra), 'dd/MM/yyyy HH:mm')}</TableCell>
                    <TableCell>{order.fechaEntregaEstimadaCompra ? format(parseISO(order.fechaEntregaEstimadaCompra), 'dd/MM/yyyy') : 'N/A'}</TableCell>
                    <TableCell>
                        <Chip label={order.estadoCompra} color={getStatusChipColor(order.estadoCompra)} size="small" />
                    </TableCell>
                    <TableCell align="right">{formatCurrency(order.totalCompra)}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Ver Detalles y Gestionar">
                        <IconButton onClick={() => handleViewDetails(order.idOrdenCompra)} color="primary" size="small">
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
            count={purchaseOrdersPage.totalElements}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Órdenes por página:"
            getItemAriaLabel={(type) => type === 'first' ? 'Primera página' : type === 'last' ? 'Última página' : type === 'next' ? 'Siguiente página' : 'Página anterior'}
          />
        </>
      ) : (
         !loading && !error && <Typography sx={{mt: 2, textAlign: 'center'}}>No se encontraron órdenes de compra.</Typography>
      )}
    </Paper>
  );
};

export default PurchaseOrdersListPage;