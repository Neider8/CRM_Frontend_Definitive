// src/features/purchaseOrders/pages/PurchaseOrderDetailPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  Container, Typography, Box, CircularProgress, Alert, Paper, /* Grid, */ Button,
  Divider, IconButton, Tooltip, TableContainer, Table, TableHead, TableRow,
  TableCell, TableBody, Chip, Link as MuiLink, Snackbar
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import BusinessIcon from '@mui/icons-material/Business'; // Para Proveedor
import EventIcon from '@mui/icons-material/Event';
import InfoIcon from '@mui/icons-material/Info';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CancelIcon from '@mui/icons-material/Cancel';
import AddIcon from '@mui/icons-material/Add'; // Para añadir detalle
import DeleteIcon from '@mui/icons-material/Delete';

import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { getPurchaseOrderById, annulPurchaseOrder, removeDetailFromPurchaseOrder } from '../../../api/purchaseOrderService';
import type { PurchaseOrderDetails, PurchaseOrderDetailDetails } from '../../../types/purchaseOrder.types';
import { useAuth } from '../../../contexts/AuthContext';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { formatCurrency } from '../../../utils/formatting';
import ConfirmationDialog from '../../../components/common/ConfirmationDialog';
// Importar el modal de edición de cabecera
import PurchaseOrderHeaderEditModal from '../components/PurchaseOrderHeaderEditModal'; 
// Futuros modales:
// import PurchaseOrderDetailAddModal from '../components/PurchaseOrderDetailAddModal';
// import PurchaseOrderDetailEditModal from '../components/PurchaseOrderDetailEditModal';


const PurchaseOrderDetailPage: React.FC = () => {
  const { orderId: orderIdParam } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [order, setOrder] = useState<PurchaseOrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const [openAnnulDialog, setOpenAnnulDialog] = useState(false);
  const [openDeleteDetailDialog, setOpenDeleteDetailDialog] = useState(false);
  const [selectedDetailToDelete, setSelectedDetailToDelete] = useState<PurchaseOrderDetailDetails | null>(null);

  // Estado para el modal de edición de cabecera
  const [openEditHeaderModal, setOpenEditHeaderModal] = useState(false); 

  const orderId = parseInt(orderIdParam || '', 10);

  const fetchPurchaseOrder = useCallback(async () => {
    if (orderIdParam && !isNaN(orderId)) {
      setLoading(true);
      setError(null);
      try {
        const data = await getPurchaseOrderById(orderId);
        setOrder(data);
      } catch (err: any) {
        console.error("Error al cargar datos de la orden de compra:", err);
        setError(err.message || 'No se pudo cargar la información de la orden.');
      } finally {
        setLoading(false);
      }
    } else {
      setError("ID de orden de compra inválido o no proporcionado.");
      setLoading(false);
    }
  }, [orderIdParam, orderId]);

  useEffect(() => {
    fetchPurchaseOrder();
  }, [fetchPurchaseOrder]);

  const handleAnnulOrderClick = () => {
    setOpenAnnulDialog(true);
  };

  const confirmAnnulOrder = async () => {
    if (order) {
      setActionLoading(true);
      setError(null);
      try {
        await annulPurchaseOrder(order.idOrdenCompra);
        setSuccessMessage(`Orden de Compra #${order.idOrdenCompra} anulada correctamente.`);
        setSnackbarOpen(true);
        setOpenAnnulDialog(false);
        fetchPurchaseOrder();
      } catch (err: any) {
        setError(err.message || `Error al anular la orden de compra #${order.idOrdenCompra}.`);
        setSnackbarOpen(true);
        setOpenAnnulDialog(false);
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleDeleteDetailClick = (detail: PurchaseOrderDetailDetails) => {
    setSelectedDetailToDelete(detail);
    setOpenDeleteDetailDialog(true);
  };

  const confirmDeleteDetail = async () => {
    if (selectedDetailToDelete && order) {
      setActionLoading(true);
      setError(null);
      setSuccessMessage(null);
      try {
        await removeDetailFromPurchaseOrder(order.idOrdenCompra, selectedDetailToDelete.idDetalleCompra);
        setSuccessMessage(`Insumo '${selectedDetailToDelete.insumo.nombreInsumo}' eliminado de la orden.`);
        setSnackbarOpen(true);
        fetchPurchaseOrder(); 
      } catch (err: any) {
        setError(err.message || 'Error al eliminar el insumo de la orden.');
        setSnackbarOpen(true);
      } finally {
        setOpenDeleteDetailDialog(false);
        setSelectedDetailToDelete(null);
        setActionLoading(false);
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
    // Opcionalmente, limpiar mensajes aquí:
    // setSuccessMessage(null);
    // setError(null);
  };

  // Manejador para cuando la cabecera se actualiza desde el modal
  const handleOrderHeaderUpdated = () => {
    fetchPurchaseOrder(); // Recargar datos de la orden
    // El modal se cierra desde su propio onClose, así que setOpenEditHeaderModal(false) no es estrictamente necesario aquí.
    // Pero si el modal NO se cierra solo, entonces sí: setOpenEditHeaderModal(false);
  };

  const canEditOrderHeader = (orderStatus?: string) =>
    currentUser && orderStatus &&
    (currentUser.rolUsuario === 'Administrador' || currentUser.rolUsuario === 'Gerente') &&
    !['Anulada', 'Recibida Total'].includes(orderStatus);

  const canAnnulOrder = (orderStatus?: string) =>
    currentUser && orderStatus &&
    (currentUser.rolUsuario === 'Administrador' || currentUser.rolUsuario === 'Gerente') &&
    !['Anulada', 'Recibida Total', 'Recibida Parcial'].includes(orderStatus);

  const canManageDetails = (orderStatus?: string) =>
    currentUser && orderStatus &&
    (currentUser.rolUsuario === 'Administrador' || currentUser.rolUsuario === 'Gerente') &&
    !['Anulada', 'Recibida Total', 'Recibida Parcial'].includes(orderStatus);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>;
  }

  if (error && !order) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>
        <Button onClick={() => navigate('/ordenes-compra')} sx={{ mt: 2 }}>Volver a la lista</Button>
      </Container>
    );
  }

  if (!order) {
    return <Container maxWidth="md"><Alert severity="warning" sx={{ mt: 4 }}>Orden de Compra no encontrada.</Alert></Container>;
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
    <Container maxWidth="xl">
      <Box sx={{ my: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap:'wrap', gap:1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => navigate(-1)} color="primary" sx={{ mr: 1 }} aria-label="Volver">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Detalle de Orden de Compra #{order.idOrdenCompra}
          </Typography>
        </Box>
        <Box>
          {canEditOrderHeader(order.estadoCompra) && (
            <Button
              variant="outlined" // o "contained" según tu diseño
              color="primary"
              startIcon={<EditIcon />}
              onClick={() => setOpenEditHeaderModal(true)} // ABRIR EL MODAL
              sx={{ mr: 1 }}
            >
              Editar Cabecera
            </Button>
          )}
          {canAnnulOrder(order.estadoCompra) && (
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

      { (successMessage || error) && 
        <Snackbar open={snackbarOpen} autoHideDuration={5000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert onClose={handleCloseSnackbar} severity={successMessage ? "success" : "error"} sx={{ width: '100%' }} variant="filled">
            {successMessage || error}
          </Alert>
        </Snackbar>
      }

      {/* Información de la Cabecera de la Orden (sin cambios, usando Box) */}
      <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
         {/* ... (tu estructura con Box para la cabecera) ... */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: {xs: 2, md: 3} }}>
            {/* Columna Izquierda: Datos de la Orden */}
            <Box sx={{ width: { xs: '100%', md: 'calc(60% - 12px)'} }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <InfoIcon sx={{ mr: 1 }} color="action" /> Datos de la Orden
                </Typography>
                <Divider sx={{mb:1.5}}/>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                    <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 6px)' } }}>
                        <Typography variant="body2" color="text.secondary">ID Orden:</Typography>
                        <Typography variant="body1" fontWeight="bold">{order.idOrdenCompra}</Typography>
                    </Box>
                    <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 6px)' } }}>
                        <Typography variant="body2" color="text.secondary" sx={{display:'flex', alignItems:'center'}}><EventIcon sx={{mr:0.5}} fontSize="inherit"/>Fecha Pedido:</Typography>
                        <Typography variant="body1">{format(parseISO(order.fechaPedidoCompra), 'dd/MM/yyyy HH:mm', { locale: es })}</Typography>
                    </Box>
                    <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 6px)' } }}>
                        <Typography variant="body2" color="text.secondary" sx={{display:'flex', alignItems:'center'}}><EventIcon sx={{mr:0.5}} fontSize="inherit"/>Entrega Estimada:</Typography>
                        <Typography variant="body1">{order.fechaEntregaEstimadaCompra ? format(parseISO(order.fechaEntregaEstimadaCompra), 'dd/MM/yyyy', { locale: es }) : 'N/A'}</Typography>
                    </Box>
                    <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 6px)' } }}>
                        <Typography variant="body2" color="text.secondary" sx={{display:'flex', alignItems:'center'}}><EventIcon sx={{mr:0.5}} fontSize="inherit"/>Entrega Real:</Typography>
                        <Typography variant="body1">{order.fechaEntregaRealCompra ? format(parseISO(order.fechaEntregaRealCompra), 'dd/MM/yyyy', { locale: es }) : 'N/A'}</Typography>
                    </Box>
                    <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 6px)' } }}>
                        <Typography variant="body2" color="text.secondary">Estado:</Typography>
                        <Chip label={order.estadoCompra} color={getStatusChipColor(order.estadoCompra)} size="small" />
                    </Box>
                     <Box sx={{ width: '100%' }}>
                        <Typography variant="body2" color="text.secondary">Observaciones:</Typography>
                        <Typography variant="body1" sx={{whiteSpace: 'pre-wrap'}}>{order.observacionesCompra || 'N/A'}</Typography>
                    </Box>
                </Box>
            </Box>
            {/* Columna Derecha: Proveedor */}
            <Box sx={{ width: { xs: '100%', md: 'calc(40% - 12px)'} }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <BusinessIcon sx={{ mr: 1 }} color="action" /> Proveedor
                </Typography>
                <Divider sx={{mb:1.5}}/>
                <MuiLink component={RouterLink} to={`/proveedores/${order.proveedor.idProveedor}`} variant="body1" fontWeight="bold" sx={{display:'block', mb: 0.5}}>
                    {order.proveedor.nombreComercialProveedor}
                </MuiLink>
                <Typography variant="body2" color="text.secondary">NIT: {order.proveedor.nitProveedor}</Typography>
            </Box>
        </Box>
      </Paper>

      {/* Detalles de la Orden (Insumos) (sin cambios) */}
      <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
         {/* ... (tu tabla de detalles) ... */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h2" sx={{ display: 'flex', alignItems: 'center' }}>
            <ReceiptLongIcon sx={{ mr: 1 }} /> Insumos en la Orden
          </Typography>
          {canManageDetails(order.estadoCompra) && (
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<AddIcon />}
              onClick={() => navigate(`/ordenes-compra/${order.idOrdenCompra}/detalles/nuevo`)}
            >
              Añadir Insumo
            </Button>
          )}
        </Box>
        <Divider sx={{ mb: 2 }} />
        {order.detalles && order.detalles.length > 0 ? (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Insumo (ID)</TableCell>
                  <TableCell align="right">Cantidad</TableCell>
                  <TableCell>Unidad</TableCell>
                  <TableCell align="right">Precio Unit.</TableCell>
                  <TableCell align="right">Subtotal</TableCell>
                  {canManageDetails(order.estadoCompra) && <TableCell align="center">Acciones</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {order.detalles.map((detalle) => (
                  <TableRow hover key={detalle.idDetalleCompra}>
                    <TableCell>
                      <MuiLink component={RouterLink} to={`/insumos/${detalle.insumo.idInsumo}`}>
                        {detalle.insumo.nombreInsumo}
                      </MuiLink>
                      <Typography variant="caption" display="block">ID: {detalle.insumo.idInsumo}</Typography>
                    </TableCell>
                    <TableCell align="right">{Number(detalle.cantidadCompra).toLocaleString(undefined, {minimumFractionDigits:0, maximumFractionDigits:3})}</TableCell>
                    <TableCell>{detalle.insumo.unidadMedidaInsumo}</TableCell>
                    <TableCell align="right">{formatCurrency(detalle.precioUnitarioCompra)}</TableCell>
                    <TableCell align="right">{formatCurrency(detalle.subtotalCompra)}</TableCell>
                    {canManageDetails(order.estadoCompra) && (
                      <TableCell align="center">
                        <Tooltip title="Editar Detalle">
                          <IconButton size="small" color="primary" onClick={() => navigate(`/ordenes-compra/${order.idOrdenCompra}/detalles/${detalle.idDetalleCompra}/editar`)}>
                            <EditIcon fontSize="inherit" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar Detalle">
                          <IconButton size="small" color="error" onClick={() => handleDeleteDetailClick(detalle)} disabled={actionLoading}>
                            <DeleteIcon fontSize="inherit" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography color="text.secondary" sx={{textAlign: 'center', py:2}}>No hay insumos en esta orden de compra.</Typography>
        )}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt:2, p:2, borderTop: '1px solid', borderColor:'divider' }}>
            <Typography variant="h5" fontWeight="bold">Total Orden: {formatCurrency(order.totalCompra)}</Typography>
        </Box>
      </Paper>

      {/* Diálogos de confirmación (sin cambios) */}
      <ConfirmationDialog
        open={openAnnulDialog}
        onClose={() => { if (!actionLoading) setOpenAnnulDialog(false); }}
        onConfirm={confirmAnnulOrder}
        title="Confirmar Anulación de Orden de Compra"
        message={`¿Estás seguro de que deseas anular la Orden de Compra #${order.idOrdenCompra}?`}
        confirmText="Anular Orden"
        isLoading={actionLoading} // Aquí debería ser actionLoading para el diálogo de anulación
      />
      <ConfirmationDialog
        open={openDeleteDetailDialog}
        onClose={() => { if (!actionLoading) setOpenDeleteDetailDialog(false); }}
        onConfirm={confirmDeleteDetail}
        title="Confirmar Eliminación de Detalle"
        message={selectedDetailToDelete ? `¿Estás seguro de que deseas eliminar el insumo "${selectedDetailToDelete.insumo.nombreInsumo}" de esta orden?` : "¿Estás seguro?"}
        confirmText="Eliminar Detalle"
        isLoading={actionLoading} // Aquí actionLoading para el diálogo de eliminar detalle
      />

      {/* Modal para editar cabecera de la orden de compra */}
      {order && ( // Asegurarse que order exista
        <PurchaseOrderHeaderEditModal
          open={openEditHeaderModal}
          onClose={() => setOpenEditHeaderModal(false)}
          orderData={order}
          onOrderHeaderUpdated={handleOrderHeaderUpdated}
        />
      )}

    </Container>
  );
};

export default PurchaseOrderDetailPage;