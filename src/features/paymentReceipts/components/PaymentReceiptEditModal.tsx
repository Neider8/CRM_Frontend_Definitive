import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  CircularProgress, Alert, Snackbar, MenuItem, Box, Typography
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale/es';
import type { PaymentReceiptUpdateRequest, PaymentReceiptDetails } from '../../../types/transaction.types';
import { updatePaymentReceipt } from '../../../api/paymentReceiptService';
import type { ApiErrorResponseDTO } from '../../../types/error.types';
import { formatISO, parseISO } from 'date-fns';

// Quita el esquema y el resolver

interface PaymentReceiptEditModalProps {
  open: boolean;
  onClose: () => void;
  transactionData: PaymentReceiptDetails;
  onUpdated: () => void;
}

const PaymentReceiptEditModal: React.FC<PaymentReceiptEditModalProps> = ({
  open,
  onClose,
  transactionData,
  onUpdated,
}) => {
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info'>('success');

  const {
    control,
    register,
    handleSubmit,
    formState: { isDirty },
    reset,
  } = useForm<PaymentReceiptUpdateRequest>({
    defaultValues: {},
  });

  useEffect(() => {
    if (transactionData && open) {
      reset({
        fechaPagoCobro: transactionData.fechaPagoCobro,
        metodoPago: transactionData.metodoPago || '',
        referenciaTransaccion: transactionData.referenciaTransaccion || '',
        estadoTransaccion: transactionData.estadoTransaccion as PaymentReceiptUpdateRequest['estadoTransaccion'],
        observacionesTransaccion: transactionData.observacionesTransaccion || '',
      });
    }
    if (!open) {
      setFormError(null);
    }
  }, [transactionData, open, reset]);

  const handleFormSubmit = async (data: PaymentReceiptUpdateRequest) => {
    if (!isDirty) {
      setSnackbarMessage("No se realizaron cambios.");
      setSnackbarSeverity('info');
      setSnackbarOpen(true);
      onClose();
      return;
    }
    setLoading(true);
    setFormError(null);

    const payload: PaymentReceiptUpdateRequest = {
      fechaPagoCobro: data.fechaPagoCobro
        ? (typeof data.fechaPagoCobro === 'string' ? data.fechaPagoCobro : formatISO(data.fechaPagoCobro as Date, { representation: 'date' }))
        : null,
      metodoPago: data.metodoPago || undefined,
      referenciaTransaccion: data.referenciaTransaccion || null,
      estadoTransaccion: data.estadoTransaccion,
      observacionesTransaccion: data.observacionesTransaccion || null,
    };

    Object.keys(payload).forEach(key => {
      if ((payload as any)[key] === undefined) {
        delete (payload as any)[key];
      }
    });

    try {
      await updatePaymentReceipt(transactionData.idPagoCobro, payload);
      setSnackbarMessage(`Transacción #${transactionData.idPagoCobro} actualizada exitosamente.`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      onUpdated();
      onClose();
    } catch (err: any) {
      const apiError = err as ApiErrorResponseDTO;
      setFormError(apiError?.message || 'Error al actualizar la transacción.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    if (!loading) {
      onClose();
    }
  };
  const handleCloseSnackbar = () => setSnackbarOpen(false);

  const metodoPagoOptions = ['Efectivo', 'Transferencia Bancaria', 'Cheque', 'Tarjeta Crédito', 'Tarjeta Débito', 'PSE', 'Otro'];
  const estadoTransaccionOptions: Array<Exclude<PaymentReceiptUpdateRequest['estadoTransaccion'], undefined>> = ['Pendiente', 'Pagado', 'Cobrado'];

  if (!transactionData) return null;

  // Puedes definir formatCurrency si no lo tienes importado
  function formatCurrency(value: number) {
    return value.toLocaleString('es-CO', { style: 'currency', currency: 'COP' });
  }

  return (
    <>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
        <Dialog open={open} onClose={handleCloseModal} maxWidth="sm" fullWidth disableEscapeKeyDown={loading}>
          <DialogTitle>Editar {transactionData.tipoTransaccion} #{transactionData.idPagoCobro}</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {transactionData.tipoTransaccion === 'Cobro' && transactionData.ordenVenta ?
                `Asociado a OV #${transactionData.ordenVenta.idOrdenVenta} (${transactionData.ordenVenta.clienteNombre})` : ''}
              {transactionData.tipoTransaccion === 'Pago' && transactionData.ordenCompra ?
                `Asociado a OC #${transactionData.ordenCompra.idOrdenCompra} (${transactionData.ordenCompra.proveedorNombre})` : ''}
            </Typography>
            <Typography variant="h6" color="primary" gutterBottom>
              Monto: {formatCurrency(transactionData.montoTransaccion)} (No editable)
            </Typography>

            {formError && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{formError}</Alert>}
            <Box
              component="form"
              onSubmit={handleSubmit(handleFormSubmit)}
              noValidate
              sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}
            >
              <Controller
                name="fechaPagoCobro"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    label="Fecha Pago/Cobro"
                    value={field.value ? parseISO(String(field.value)) : null}
                    onChange={(date) => field.onChange(date)}
                    maxDate={new Date()}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        InputLabelProps: { shrink: true },
                        disabled: loading,
                        required: false,
                      }
                    }}
                    disabled={loading}
                  />
                )}
              />
              <Controller
                name="metodoPago"
                control={control}
                defaultValue={transactionData.metodoPago || ''}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    label="Método de Pago"
                    disabled={loading}
                  >
                    {metodoPagoOptions.map(option => (
                      <MenuItem key={option} value={option}>{option}</MenuItem>
                    ))}
                  </TextField>
                )}
              />
              <TextField
                fullWidth
                label="Referencia (Opcional)"
                {...register('referenciaTransaccion')}
                disabled={loading}
                inputProps={{ maxLength: 100 }}
              />
              <Controller
                name="estadoTransaccion"
                control={control}
                defaultValue={transactionData.estadoTransaccion as PaymentReceiptUpdateRequest['estadoTransaccion']}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    label="Estado Transacción"
                    disabled={loading}
                  >
                    {estadoTransaccionOptions.map(option =>
                      <MenuItem key={option} value={option} disabled={transactionData.estadoTransaccion === 'Anulado' && option !== 'Anulado'}>
                        {option}
                      </MenuItem>
                    )}
                    {transactionData.estadoTransaccion === 'Anulado' && <MenuItem value="Anulado" disabled>Anulado</MenuItem>}
                  </TextField>
                )}
              />
              <TextField
                fullWidth
                label="Observaciones (Opcional)"
                multiline
                rows={3}
                {...register('observacionesTransaccion')}
                disabled={loading}
                inputProps={{ maxLength: 500 }}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleCloseModal} color="inherit" disabled={loading}>Cancelar</Button>
            <Button
              type="submit"
              variant="contained"
              onClick={handleSubmit(handleFormSubmit)}
              disabled={loading || !isDirty || transactionData.estadoTransaccion === 'Anulado'}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </DialogActions>
        </Dialog>
      </LocalizationProvider>
      <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default PaymentReceiptEditModal;