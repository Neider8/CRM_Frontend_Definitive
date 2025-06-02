// src/features/paymentReceipts/pages/PaymentReceiptsListPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Button, Paper, TableContainer, Table, TableHead, TableRow,
  TableCell, TableBody, TablePagination, CircularProgress, Alert, IconButton, Tooltip, Chip,
  Link as MuiLink,
  Container
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PaymentIcon from '@mui/icons-material/Payment'; // Icono general
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { getAllPaymentReceipts } from '../../../api/paymentReceiptService';
import type { PaymentReceiptPageableRequest, PaginatedPaymentReceipts } from '../../../types/transaction.types';
import { useAuth } from '../../../contexts/AuthContext';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { formatCurrency } from '../../../utils/formatting';

const PaymentReceiptsListPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [paymentReceiptsPage, setPaymentReceiptsPage] = useState<PaginatedPaymentReceipts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchPaymentReceipts = useCallback(async (currentPage: number, currentRowsPerPage: number) => {
    setLoading(true);
    setError(null);
    try {
      const params: PaymentReceiptPageableRequest = {
        page: currentPage,
        size: currentRowsPerPage,
        sort: 'fechaRegistroTransaccion,desc',
      };
      const data = await getAllPaymentReceipts(params);
      setPaymentReceiptsPage(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar pagos y cobros.');
      console.error("Error fetching payment/receipts:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPaymentReceipts(page, rowsPerPage);
  }, [fetchPaymentReceipts, page, rowsPerPage]);

  const handleChangePage = (event: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewDetails = (transactionId: number) => navigate(`/pagos-cobros/${transactionId}`);

  // Permisos basados en PagoCobroController
  const canCreateTransactions = currentUser?.rolUsuario === 'Administrador' || currentUser?.rolUsuario === 'Gerente' || currentUser?.rolUsuario === 'Ventas';
  const canViewTransactions = currentUser?.rolUsuario === 'Administrador' || currentUser?.rolUsuario === 'Gerente' || currentUser?.rolUsuario === 'Ventas';

  if (loading && !paymentReceiptsPage?.content.length && !error) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>;
  }
  if (!canViewTransactions && !loading && !error) {
     return <Container maxWidth="md"><Alert severity="warning" sx={{mt:2}}>No tienes permiso para ver esta página.</Alert></Container>;
  }
  if (error && !paymentReceiptsPage?.content.length) {
    return <Container maxWidth="md"><Alert severity="error" sx={{mt:2}}>{error}</Alert></Container>;
  }

  const getStatusChipColor = (status: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    switch (status?.toLowerCase()) {
        case 'pendiente': return 'warning';
        case 'pagado': return 'success';
        case 'cobrado': return 'success';
        case 'vencido': return 'error'; 
        case 'anulado': return 'error';
        default: return 'default';
    }
};

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', p: {xs: 1, sm: 2} }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h5" component="h1" sx={{display: 'flex', alignItems: 'center'}}>
          <PaymentIcon sx={{mr:1}} /> Gestión de Pagos y Cobros
        </Typography>
        {canCreateTransactions && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            component={RouterLink}
            to="/pagos-cobros/nuevo"
          >
            Registrar Transacción
          </Button>
        )}
      </Box>

      {error && paymentReceiptsPage?.content && paymentReceiptsPage.content.length > 0 && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my:2 }}><CircularProgress /></Box>}

      {!loading && paymentReceiptsPage && paymentReceiptsPage.content.length > 0 ? (
        <>
          <TableContainer>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID Trans.</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Orden Asociada</TableCell>
                  <TableCell>Fecha Trans.</TableCell>
                  <TableCell>Método</TableCell>
                  <TableCell align="right">Monto</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paymentReceiptsPage.content.map((trans) => (
                  <TableRow hover key={trans.idPagoCobro}>
                    <TableCell>{trans.idPagoCobro}</TableCell>
                    <TableCell>
                        <Chip 
                            label={trans.tipoTransaccion} 
                            color={trans.tipoTransaccion === 'Cobro' ? 'success' : 'info'} 
                            variant="outlined"
                            size="small"
                        />
                    </TableCell>
                    <TableCell>
                      {trans.ordenVenta && (
                        <MuiLink component={RouterLink} to={`/ordenes-venta/${trans.ordenVenta.idOrdenVenta}`}>
                          OV #{trans.ordenVenta.idOrdenVenta} ({trans.ordenVenta.clienteNombre})
                        </MuiLink>
                      )}
                      {trans.ordenCompra && (
                        <MuiLink component={RouterLink} to={`/ordenes-compra/${trans.ordenCompra.idOrdenCompra}`}>
                          OC #{trans.ordenCompra.idOrdenCompra} ({trans.ordenCompra.proveedorNombre})
                        </MuiLink>
                      )}
                    </TableCell>
                    <TableCell>{format(parseISO(trans.fechaPagoCobro), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>{trans.metodoPago}</TableCell>
                    <TableCell align="right">{formatCurrency(trans.montoTransaccion)}</TableCell>
                    <TableCell>
                        <Chip label={trans.estadoTransaccion} color={getStatusChipColor(trans.estadoTransaccion)} size="small" />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Ver Detalles y Gestionar">
                        <IconButton onClick={() => handleViewDetails(trans.idPagoCobro)} color="primary" size="small">
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
            count={paymentReceiptsPage.totalElements}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Transacciones por página:"
            getItemAriaLabel={(type) => type === 'first' ? 'Primera página' : type === 'last' ? 'Última página' : type === 'next' ? 'Siguiente página' : 'Página anterior'}
          />
        </>
      ) : (
         !loading && !error && <Typography sx={{mt: 2, textAlign: 'center'}}>No se encontraron transacciones de pagos o cobros.</Typography>
      )}
    </Paper>
  );
};

export default PaymentReceiptsListPage;