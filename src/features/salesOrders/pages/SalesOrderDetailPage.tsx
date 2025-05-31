// src/features/salesOrders/pages/SalesOrderDetailPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  Container, Typography, Box, CircularProgress, Alert, Paper, Button,
  Divider, IconButton, Tooltip, TableContainer, Table, TableHead, TableRow,
  TableCell, TableBody, Chip, Link as MuiLink, Snackbar, Stack
} from '@mui/material'; // [cite: 1]
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; // [cite: 3]
import EditIcon from '@mui/icons-material/Edit'; // [cite: 3]
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'; // [cite: 3]
import PersonIcon from '@mui/icons-material/Person'; // [cite: 3]
import EventIcon from '@mui/icons-material/Event'; // [cite: 3]
import InfoIcon from '@mui/icons-material/Info'; // [cite: 4]
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'; // [cite: 4]
import CancelIcon from '@mui/icons-material/Cancel'; // Para anular orden [cite: 4]
import AddIcon from '@mui/icons-material/Add'; // Para añadir producto a la orden [cite: 4]
import DeleteIcon from '@mui/icons-material/Delete'; // Para eliminar detalle [cite: 5]

import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom'; // [cite: 6]
import { getSalesOrderById, annulSalesOrder, removeDetailFromSalesOrder } from '../../../api/salesOrderService'; // [cite: 7]
import type { SalesOrderDetails, SalesOrderDetailDetails } from '../../../types/salesOrder.types'; // [cite: 7]
import { useAuth } from '../../../contexts/AuthContext'; // [cite: 8]
import { format, parseISO } from 'date-fns'; // [cite: 8]
import { es } from 'date-fns/locale/es'; // [cite: 8]
import { formatCurrency } from '../../../utils/formatting'; // [cite: 9]
import ConfirmationDialog from '../../../components/common/ConfirmationDialog'; // [cite: 9]
import SalesOrderHeaderEditModal from '../components/SalesOrderHeaderEditModal'; // [cite: 9]
import SalesOrderDetailAddModal from '../components/SalesOrderDetailAddModal'; // [cite: 10]
import SalesOrderDetailEditModal from '../components/SalesOrderDetailEditModal'; // [cite: 10]
import type { ApiErrorResponseDTO } from '../../../types/error.types'; // Añadido según la solución

const SalesOrderDetailPage: React.FC = () => {
  const { orderId: orderIdParam } = useParams<{ orderId: string }>(); // [cite: 11]
  const navigate = useNavigate(); // [cite: 12]
  const { user: currentUser } = useAuth(); // [cite: 12]

  const [order, setOrder] = useState<SalesOrderDetails | null>(null); // [cite: 12]
  const [loading, setLoading] = useState(true); // [cite: 13]
  const [actionLoading, setActionLoading] = useState(false); // Para anular/eliminar detalle [cite: 13]
  const [error, setError] = useState<string | null>(null); // [cite: 13, 14]
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // [cite: 14]
  const [snackbarOpen, setSnackbarOpen] = useState(false); // [cite: 14]

  const [openAnnulDialog, setOpenAnnulDialog] = useState(false); // [cite: 14]
  const [openEditHeaderModal, setOpenEditHeaderModal] = useState(false); // [cite: 15]
  const [openAddDetailModal, setOpenAddDetailModal] = useState(false); // [cite: 15]
  const [editingDetail, setEditingDetail] = useState<SalesOrderDetailDetails | null>(null); // [cite: 16]
  const [openDeleteDetailDialog, setOpenDeleteDetailDialog] = useState(false); // [cite: 17]
  const [selectedDetailToDelete, setSelectedDetailToDelete] = useState<SalesOrderDetailDetails | null>(null); // [cite: 17]

  const orderId = parseInt(orderIdParam || '', 10); // [cite: 18]

  const fetchSalesOrder = useCallback(async () => {
    if (!isNaN(orderId)) {
      setLoading(true);
      setError(null);
      try {
        const data = await getSalesOrderById(orderId);
        setOrder(data);
      } catch (err: any) {
        console.error("Error al cargar datos de la orden de venta:", err);
        setError(err.message || 'No se pudo cargar la información de la orden.');
      } finally {
        setLoading(false);
      }
    } else {
      setError("ID de orden de venta inválido o no proporcionado.");
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (!isNaN(orderId)) {
      fetchSalesOrder();
    } else {
      setError("ID de orden inválido.");
      setLoading(false);
    }
  }, [orderId, fetchSalesOrder]);

  const handleAnnulOrderClick = () => {
    setOpenAnnulDialog(true);
  };

  const confirmAnnulOrder = async () => {
    if (order) {
      setActionLoading(true);
      setError(null);
      try {
        await annulSalesOrder(order.idOrdenVenta);
        setSuccessMessage(`Orden de Venta #${order.idOrdenVenta} anulada correctamente.`);
        setOpenAnnulDialog(false);
        fetchSalesOrder();
      } catch (err: any) {
        setError(err.message || `Error al anular la orden de venta #${order.idOrdenVenta}.`);
        setOpenAnnulDialog(false);
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
    setSuccessMessage(null);
    setError(null);
  };

  const handleOrderHeaderUpdated = () => {
    fetchSalesOrder();
    setOpenEditHeaderModal(false);
  };

  const handleDetailAdded = () => {
    fetchSalesOrder();
    setOpenAddDetailModal(false);
  };

  const handleDetailUpdated = () => {
    fetchSalesOrder();
    setEditingDetail(null);
  };

  const handleEditDetailClick = (detail: SalesOrderDetailDetails) => {
    setEditingDetail(detail);
  };

  const handleDeleteDetailClick = (detail: SalesOrderDetailDetails) => {
    setSelectedDetailToDelete(detail);
    setOpenDeleteDetailDialog(true);
  };

  const confirmDeleteDetail = async () => {
    if (selectedDetailToDelete && order) {
      setActionLoading(true);
      setError(null);
      setSuccessMessage(null);
      try {
        await removeDetailFromSalesOrder(order.idOrdenVenta, selectedDetailToDelete.idDetalleOrden);
        setSuccessMessage(`Producto '${selectedDetailToDelete.producto.nombreProducto}' eliminado de la orden.`);
        setSnackbarOpen(true);
        fetchSalesOrder();
      } catch (err: any) {
        console.error("Error al eliminar detalle de la orden:", err);
        const apiError = err as ApiErrorResponseDTO;
        setError(apiError?.message || 'Error al eliminar el producto de la orden.');
        setSnackbarOpen(true);
      } finally {
        setOpenDeleteDetailDialog(false);
        setSelectedDetailToDelete(null);
        setActionLoading(false);
      }
    }
  };

  const canEditOrderHeader = (orderStatus: string | undefined) =>
    currentUser && orderStatus &&
    (currentUser.rolUsuario === 'Administrador' || currentUser.rolUsuario === 'Ventas') &&
    !['Anulada', 'Entregada'].includes(orderStatus);

  const canAnnulOrder = (orderStatus: string | undefined) =>
    currentUser && orderStatus &&
    (currentUser.rolUsuario === 'Administrador' || currentUser.rolUsuario === 'Gerente' || currentUser.rolUsuario === 'Ventas') &&
    !['Anulada', 'Entregada'].includes(orderStatus);

  const canManageDetails = (orderStatus: string | undefined) =>
    currentUser && orderStatus &&
    (currentUser.rolUsuario === 'Administrador' || currentUser.rolUsuario === 'Ventas') &&
    !['Anulada', 'Entregada', 'En Producción'].includes(orderStatus);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>;
  }

  if (error && !order) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>
        <Button onClick={() => navigate('/ordenes-venta')} sx={{ mt: 2 }}>Volver a la lista</Button>
      </Container>
    );
  }

  if (!order) {
    return <Container maxWidth="md"><Alert severity="warning" sx={{ mt: 4 }}>Orden de Venta no encontrada.</Alert></Container>;
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
    <Container maxWidth="xl">
      <Box sx={{ my: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap:'wrap', gap:1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => navigate(-1)} color="primary" sx={{ mr: 1 }} aria-label="Volver">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Detalle de Orden de Venta #{order.idOrdenVenta}
          </Typography>
        </Box>
        <Box>
          {canEditOrderHeader(order.estadoOrden) && (
            <Button
              variant="outlined"
              color="primary"
              startIcon={<EditIcon />}
              onClick={() => setOpenEditHeaderModal(true)}
              sx={{ mr: 1 }}
            >
              Editar Cabecera
            </Button>
          )}
          {canAnnulOrder(order.estadoOrden) && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<CancelIcon />}
              onClick={handleAnnulOrderClick}
              disabled={actionLoading}
            >
              Anular Orden
            </Button>
          )}
        </Box>
      </Box>

      <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
        <Stack spacing={2}>
           <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
             <InfoIcon color="action" />
             <Typography variant="h6" gutterBottom>Datos de la Orden</Typography>
           </Box>
           <Divider />
           <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', gap: 2 }}>
             <Typography variant="body2" color="text.secondary">ID Orden:</Typography><Typography variant="body1" fontWeight="bold">{order.idOrdenVenta}</Typography>
             <Typography variant="body2" color="text.secondary" sx={{display:'flex', alignItems:'center'}}><EventIcon sx={{mr:0.5}} fontSize="inherit"/>Fecha Pedido:</Typography><Typography variant="body1">{format(parseISO(order.fechaPedido), 'dd/MM/yyyy HH:mm', { locale: es })}</Typography>
           </Box>
           <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', gap: 2 }}>
             <Typography variant="body2" color="text.secondary" sx={{display:'flex', alignItems:'center'}}><EventIcon sx={{mr:0.5}} fontSize="inherit"/>Entrega Estimada:</Typography><Typography variant="body1">{order.fechaEntregaEstimada ? format(parseISO(order.fechaEntregaEstimada), 'dd/MM/yyyy', { locale: es }) : 'N/A'}</Typography>
             <Typography variant="body2" color="text.secondary">Estado:</Typography><Chip label={order.estadoOrden} color={getStatusChipColor(order.estadoOrden)} size="small" />
           </Box>
           <Box>
             <Typography variant="body2" color="text.secondary">Observaciones:</Typography><Typography variant="body1" sx={{whiteSpace: 'pre-wrap'}}>{order.observacionesOrden || 'N/A'}</Typography>
           </Box>
        </Stack>
      </Paper>

      <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, mb: 3, mt: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h2" sx={{ display: 'flex', alignItems: 'center' }}>
            <ReceiptLongIcon sx={{ mr: 1 }} /> Productos en la Orden
          </Typography>
          {canManageDetails(order.estadoOrden) && (
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<AddIcon />}
              onClick={() => setOpenAddDetailModal(true)}
            >
              Añadir Producto
            </Button>
          )}
        </Box>
        <Divider sx={{ mb: 2 }} />
        {order.detalles && order.detalles.length > 0 ? (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Producto (Ref.)</TableCell>
                  <TableCell align="right">Cantidad</TableCell>
                  <TableCell align="right">Precio Unit.</TableCell>
                  <TableCell align="right">Subtotal</TableCell>
                  {canManageDetails(order.estadoOrden) && <TableCell align="center">Acciones</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {order.detalles.map((detalle) => (
                  <TableRow key={detalle.idDetalleOrden}>
                    <TableCell>
                      <MuiLink component={RouterLink} to={`/productos/${detalle.producto.idProducto}`}>
                        {detalle.producto.nombreProducto}
                      </MuiLink>
                      <Typography variant="caption" display="block">Ref: {detalle.producto.referenciaProducto}</Typography>
                    </TableCell>
                    <TableCell align="right">{detalle.cantidadProducto}</TableCell>
                    <TableCell align="right">{formatCurrency(detalle.precioUnitarioVenta)}</TableCell>
                    <TableCell align="right">{formatCurrency(detalle.subtotalDetalle)}</TableCell>
                    {canManageDetails(order.estadoOrden) && (
                      <TableCell align="center">
                        {/* Solución: Agrupar los Tooltips en un solo elemento hijo */}
                        <span style={{ display: 'inline-flex', gap: 4 }}>
                          <Tooltip title="Editar Detalle">
                            <span>
                              <IconButton size="small" color="primary" onClick={() => handleEditDetailClick(detalle)}>
                                <EditIcon fontSize="inherit" />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="Eliminar Detalle">
                            <span>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteDetailClick(detalle)}
                                disabled={actionLoading}
                              >
                                <DeleteIcon fontSize="inherit" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </span>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography color="text.secondary" sx={{textAlign: 'center', py:2}}>
            No hay productos en esta orden.
          </Typography>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt:2, p:2, borderTop: '1px solid', borderColor:'divider' }}>
          <Typography variant="h5" fontWeight="bold">Total Orden: {formatCurrency(order.totalOrden)}</Typography>
        </Box>
      </Paper>
      
      {/* Dialogo para anular orden */}
      <ConfirmationDialog
        open={openAnnulDialog}
        onClose={() => { if (!actionLoading) setOpenAnnulDialog(false); }}
        onConfirm={confirmAnnulOrder}
        title="Confirmar Anulación de Orden"
        message={`¿Estás seguro de que deseas anular la Orden de Venta #${order.idOrdenVenta}? Esta acción no se puede deshacer.`}
        confirmText="Anular Orden"
        isLoading={actionLoading}
      />

      {/* Dialogo para ELIMINAR DETALLE */}
      <ConfirmationDialog
        open={openDeleteDetailDialog}
        onClose={() => { if (!actionLoading) setOpenDeleteDetailDialog(false); }}
        onConfirm={confirmDeleteDetail}
        title="Confirmar Eliminación de Detalle"
        message={selectedDetailToDelete ? `¿Estás seguro de que deseas eliminar el producto "${selectedDetailToDelete.producto.nombreProducto}" de esta orden?` : "¿Estás seguro de que deseas eliminar este detalle?"}
        confirmText="Eliminar Detalle"
        isLoading={actionLoading}
      />
      
      {/* Modales (Editar Cabecera, Añadir Detalle, Editar Detalle) */}
       {order && (
         <SalesOrderHeaderEditModal
           open={openEditHeaderModal}
           onClose={() => setOpenEditHeaderModal(false)}
           orderData={order}
           onOrderHeaderUpdated={handleOrderHeaderUpdated}
         />
       )}
       {order && (
         <SalesOrderDetailAddModal
           open={openAddDetailModal}
           onClose={() => setOpenAddDetailModal(false)}
           orderId={order.idOrdenVenta}
           existingProductIdsInOrder={order.detalles?.map(d => d.producto.idProducto) || []}
           onDetailAdded={handleDetailAdded}
         />
       )}
       {order && editingDetail && (
         <SalesOrderDetailEditModal
           open={!!editingDetail}
           onClose={() => setEditingDetail(null)}
           orderId={order.idOrdenVenta}
           detailData={editingDetail}
           onDetailUpdated={handleDetailUpdated}
         />
       )}

      {/* Snackbar para mensajes de éxito/error de la página */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={successMessage ? "success" : "error"}
          sx={{ width: '100%' }}
          variant="filled"
        >
          {successMessage || error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SalesOrderDetailPage;