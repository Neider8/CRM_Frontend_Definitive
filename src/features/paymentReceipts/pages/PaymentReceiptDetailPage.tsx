// src/features/paymentReceipts/pages/PaymentReceiptDetailPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  Container, Typography, Box, CircularProgress, Alert, Paper, Button,
  Divider, IconButton, Tooltip, Chip, Link as MuiLink, Snackbar
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';
import ReceiptIcon from '@mui/icons-material/Receipt';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import EventIcon from '@mui/icons-material/Event';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { getPaymentReceiptById, annulPaymentReceipt } from '../../../api/paymentReceiptService';
import type { PaymentReceiptDetails } from '../../../types/transaction.types';
import { useAuth } from '../../../contexts/AuthContext';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { formatCurrency } from '../../../utils/formatting';
import ConfirmationDialog from '../../../components/common/ConfirmationDialog';
import PaymentReceiptEditModal from '../components/PaymentReceiptEditModal';

const PaymentReceiptDetailPage: React.FC = () => {
  const { transactionId: transactionIdParam } = useParams<{ transactionId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [transaction, setTransaction] = useState<PaymentReceiptDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info'>('success'); // Añadido para controlar la severidad del snackbar

  const [openAnnulDialog, setOpenAnnulDialog] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);

  const transactionId = parseInt(transactionIdParam || '', 10);

  const fetchTransaction = useCallback(async () => {
    if (transactionIdParam && !isNaN(transactionId)) {
      setLoading(true);
      setError(null);
      try {
        const data = await getPaymentReceiptById(transactionId);
        setTransaction(data);
      } catch (err: any) {
        console.error("Error al cargar datos del pago/cobro:", err);
        setError(err.message || 'No se pudo cargar la información de la transacción.');
      } finally {
        setLoading(false);
      }
    } else {
      setError("ID de transacción inválido o no proporcionado.");
      setLoading(false);
    }
  }, [transactionIdParam, transactionId]);

  useEffect(() => {
    if (!isNaN(transactionId)) {
        fetchTransaction();
    }
  }, [transactionId, fetchTransaction]);

  const handleAnnulClick = () => setOpenAnnulDialog(true);

  const confirmAnnul = async () => {
    if (transaction) {
      setActionLoading(true);
      setError(null);
      try {
        await annulPaymentReceipt(transaction.idPagoCobro);
        setSuccessMessage(`Transacción #${transaction.idPagoCobro} anulada correctamente.`);
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        setOpenAnnulDialog(false);
        fetchTransaction(); // Recargar
      } catch (err: any) {
        setError(err.message || `Error al anular la transacción.`);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setOpenAnnulDialog(false);
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleTransactionUpdated = () => {
    fetchTransaction(); 
    setSuccessMessage('Transacción actualizada exitosamente.');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };
  
  const handleEditModalClose = () => {
    setOpenEditModal(false);
  };

  const canEditTransaction = (status?: string) => 
    currentUser && status &&
    (currentUser.rolUsuario === 'Administrador' || currentUser.rolUsuario === 'Gerente') &&
    status !== 'Anulado';

  const canAnnulTransaction = (status?: string) => 
    currentUser && status &&
    (currentUser.rolUsuario === 'Administrador' || currentUser.rolUsuario === 'Gerente') &&
    status !== 'Anulado'; 

  const canView = currentUser?.rolUsuario === 'Administrador' || 
                  currentUser?.rolUsuario === 'Gerente' || 
                  currentUser?.rolUsuario === 'Ventas';


  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>;
  if (!canView && !loading && !error) return <Container maxWidth="md"><Alert severity="warning" sx={{mt:2}}>Acceso Denegado.</Alert></Container>;
  if (error && !transaction) return <Container maxWidth="md"><Alert severity="error" sx={{ mt: 4 }}>{error}</Alert><Button onClick={() => navigate('/pagos-cobros')} sx={{mt:2}}>Volver</Button></Container>;
  if (!transaction) return <Container maxWidth="md"><Alert severity="warning" sx={{ mt: 4 }}>Transacción no encontrada.</Alert></Container>;

  const getStatusChipColor = (status: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    switch (status?.toLowerCase()) {
        case 'pendiente': return 'warning';
        case 'pagado': case 'cobrado': return 'success';
        case 'vencido': return 'error'; 
        case 'anulado': return 'error';
        default: return 'default';
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap:'wrap', gap:1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => navigate(-1)} color="primary" sx={{ mr: 1 }} aria-label="Volver atrás"><ArrowBackIcon /></IconButton>
          <Typography variant="h4" component="h1">
            Detalle de {transaction.tipoTransaccion} #{transaction.idPagoCobro}
          </Typography>
        </Box>
        <Box>
          {canEditTransaction(transaction.estadoTransaccion) && (
            <Button
              variant="outlined" 
              color="primary"
              startIcon={<EditIcon />}
              onClick={() => setOpenEditModal(true)}
              sx={{ mr: 1 }}
            >
              Editar
            </Button>
          )}
          {canAnnulTransaction(transaction.estadoTransaccion) && (
            <Button variant="outlined" color="error" startIcon={<CancelIcon />} onClick={handleAnnulClick} disabled={actionLoading}>Anular</Button>
          )}
        </Box>
      </Box>

      {(successMessage || error) && 
        <Snackbar open={snackbarOpen} autoHideDuration={5000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }} variant="filled">
            {successMessage || error}
          </Alert>
        </Snackbar>
      }

      {/* Contenedor principal para las dos columnas usando Flexbox */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mt: 1 }}>
        {/* Columna Izquierda: Detalles de la Transacción */}
        <Box sx={{ flex: {md: (transaction.ordenVenta || transaction.ordenCompra) ? 7 : 12}, width: '100%' }}>
          <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{display:'flex', alignItems:'center'}}>
                {transaction.tipoTransaccion === 'Cobro' ? <ReceiptIcon sx={{mr:1}}/> : <LocalAtmIcon sx={{mr:1}}/>}
                Información de la Transacción
            </Typography>
            <Divider sx={{mb:1.5}}/>
            {/* Usaremos Box para los items internos también para consistencia */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                <Box sx={{ flex: '1 1 200px', minWidth: '180px' }}><Typography variant="body2" color="text.secondary">ID Transacción:</Typography><Typography variant="body1" fontWeight="bold">{transaction.idPagoCobro}</Typography></Box>
                <Box sx={{ flex: '1 1 200px', minWidth: '180px' }}><Typography variant="body2" color="text.secondary">Tipo:</Typography><Chip label={transaction.tipoTransaccion} color={transaction.tipoTransaccion === 'Cobro' ? 'success' : 'info'} size="small"/></Box>
                <Box sx={{ flex: '1 1 200px', minWidth: '180px' }}><Typography variant="body2" color="text.secondary" sx={{display:'flex', alignItems:'center'}}><EventIcon sx={{mr:0.5}} fontSize="inherit"/>Fecha Transacción:</Typography><Typography variant="body1">{format(parseISO(transaction.fechaPagoCobro), 'dd/MM/yyyy', { locale: es })}</Typography></Box>
                <Box sx={{ flex: '1 1 200px', minWidth: '180px' }}><Typography variant="body2" color="text.secondary" sx={{display:'flex', alignItems:'center'}}><EventIcon sx={{mr:0.5}} fontSize="inherit"/>Fecha Registro:</Typography><Typography variant="body1">{format(parseISO(transaction.fechaRegistroTransaccion), 'dd/MM/yyyy HH:mm', { locale: es })}</Typography></Box>
                <Box sx={{ flex: '1 1 200px', minWidth: '180px' }}><Typography variant="body2" color="text.secondary">Método de Pago:</Typography><Typography variant="body1">{transaction.metodoPago}</Typography></Box>
                <Box sx={{ flex: '1 1 200px', minWidth: '180px' }}><Typography variant="body2" color="text.secondary">Referencia:</Typography><Typography variant="body1">{transaction.referenciaTransaccion || 'N/A'}</Typography></Box>
                <Box sx={{ flex: '1 1 200px', minWidth: '180px' }}><Typography variant="body2" color="text.secondary">Monto:</Typography><Typography variant="h6" color={transaction.tipoTransaccion === 'Cobro' ? 'success.dark' : 'error.dark'}>{formatCurrency(transaction.montoTransaccion)}</Typography></Box>
                <Box sx={{ flex: '1 1 200px', minWidth: '180px' }}><Typography variant="body2" color="text.secondary">Estado:</Typography><Chip label={transaction.estadoTransaccion} color={getStatusChipColor(transaction.estadoTransaccion)} size="small"/></Box>
                {transaction.fechaActualizacion && <Box sx={{ flex: '1 1 200px', minWidth: '180px' }}><Typography variant="body2" color="text.secondary">Última Actualización:</Typography><Typography variant="body1">{format(parseISO(transaction.fechaActualizacion), 'dd/MM/yyyy HH:mm', { locale: es })}</Typography></Box>}
                <Box sx={{ width: '100%', mt: 1 }}><Typography variant="body2" color="text.secondary">Observaciones:</Typography><Typography variant="body1" sx={{whiteSpace:'pre-wrap'}}>{transaction.observacionesTransaccion || 'N/A'}</Typography></Box>
            </Box>
          </Paper>
        </Box>

        {(transaction.ordenVenta || transaction.ordenCompra) && (
          <Box sx={{ flex: {md: 5}, width: '100%' }}>
            <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, height: '100%' }}>
              {transaction.ordenVenta && (
                <>
                  <Typography variant="h6" gutterBottom sx={{display:'flex', alignItems:'center'}}><ShoppingCartIcon sx={{mr:1}}/>Orden de Venta Asociada</Typography>
                  <Divider sx={{mb:1.5}}/>
                  <Typography variant="body2">ID Orden Venta: <MuiLink component={RouterLink} to={`/ordenes-venta/${transaction.ordenVenta.idOrdenVenta}`} sx={{fontWeight:'bold'}}>#{transaction.ordenVenta.idOrdenVenta}</MuiLink></Typography>
                  <Typography variant="body2">Cliente: {transaction.ordenVenta.clienteNombre}</Typography>
                  <Typography variant="body2">Fecha Pedido O.V.: {format(parseISO(transaction.ordenVenta.fechaPedido), 'dd/MM/yyyy HH:mm', { locale: es })}</Typography>
                </>
              )}
              {transaction.ordenCompra && (
                <>
                  <Typography variant="h6" gutterBottom sx={{display:'flex', alignItems:'center'}}><ShoppingBasketIcon sx={{mr:1}}/>Orden de Compra Asociada</Typography>
                   <Divider sx={{mb:1.5}}/>
                  <Typography variant="body2">ID Orden Compra: <MuiLink component={RouterLink} to={`/ordenes-compra/${transaction.ordenCompra.idOrdenCompra}`} sx={{fontWeight:'bold'}}>#{transaction.ordenCompra.idOrdenCompra}</MuiLink></Typography>
                  <Typography variant="body2">Proveedor: {transaction.ordenCompra.proveedorNombre}</Typography>
                  <Typography variant="body2">Fecha Pedido O.C.: {format(parseISO(transaction.ordenCompra.fechaPedidoCompra), 'dd/MM/yyyy HH:mm', { locale: es })}</Typography>
                </>
              )}
            </Paper>
          </Box>
        )}
      </Box>

      <ConfirmationDialog 
        open={openAnnulDialog} 
        onClose={() => {if(!actionLoading)setOpenAnnulDialog(false)}} 
        onConfirm={confirmAnnul} 
        title="Confirmar Anulación" 
        message={`¿Está seguro de que desea anular la Transacción #${transaction.idPagoCobro}? Esta acción no se puede deshacer.`} 
        isLoading={actionLoading} 
        confirmText="Sí, Anular Transacción"
      />

      {transaction && (
        <PaymentReceiptEditModal
          open={openEditModal}
          onClose={handleEditModalClose}
          transactionData={transaction}
          onUpdated={handleTransactionUpdated}
        />
      )}
    </Container>
  );
};
export default PaymentReceiptDetailPage;