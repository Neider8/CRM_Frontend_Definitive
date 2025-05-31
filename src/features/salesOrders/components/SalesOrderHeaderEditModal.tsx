// src/features/salesOrders/components/SalesOrderHeaderEditModal.tsx
import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  CircularProgress, Alert, Snackbar, MenuItem, Box, Typography, Stack
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale/es';
import type { SalesOrderHeaderUpdateRequest, SalesOrderDetails } from '../../../types/salesOrder.types';
import { updateSalesOrderHeader } from '../../../api/salesOrderService';
import type { ApiErrorResponseDTO } from '../../../types/error.types';
import { formatISO, parseISO } from 'date-fns';

interface SalesOrderHeaderEditModalProps {
  open: boolean;
  onClose: () => void;
  orderData: SalesOrderDetails;
  onOrderHeaderUpdated: () => void;
}

const SalesOrderHeaderEditModal: React.FC<SalesOrderHeaderEditModalProps> = ({
  open,
  onClose,
  orderData,
  onOrderHeaderUpdated,
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
    formState: { errors, isDirty },
    reset,
    setValue,
  } = useForm<SalesOrderHeaderUpdateRequest>({
    defaultValues: {}, // Se establecerá en useEffect
  });

  useEffect(() => {
    if (orderData && open) {
      reset({
        fechaEntregaEstimada: orderData.fechaEntregaEstimada ? orderData.fechaEntregaEstimada : null, // Ya es string ISO o null
        estadoOrden: orderData.estadoOrden as SalesOrderHeaderUpdateRequest['estadoOrden'],
        observacionesOrden: orderData.observacionesOrden || '',
      });
    }
    if (!open) {
        setFormError(null); // Limpiar errores cuando se cierra
    }
  }, [orderData, open, reset]);

  const handleFormSubmit: SubmitHandler<SalesOrderHeaderUpdateRequest> = async (data) => {
    if (!isDirty) {
      setSnackbarMessage("No se realizaron cambios.");
      setSnackbarSeverity('info');
      setSnackbarOpen(true);
      onClose();
      return;
    }
    setLoading(true);
    setFormError(null);

    const payload: SalesOrderHeaderUpdateRequest = {
      fechaEntregaEstimada: data.fechaEntregaEstimada
        ? formatISO(new Date(data.fechaEntregaEstimada), { representation: 'date' })
        : null,
      estadoOrden: data.estadoOrden,
      observacionesOrden: data.observacionesOrden || null,
    };

    try {
      await updateSalesOrderHeader(orderData.idOrdenVenta, payload);
      setSnackbarMessage('Cabecera de la orden actualizada exitosamente.');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      onOrderHeaderUpdated();
      onClose();
    } catch (err: any) {
      console.error("Error al actualizar cabecera de orden:", err);
      const apiError = err as ApiErrorResponseDTO;
      setFormError(apiError?.message || 'Error al actualizar la cabecera.');
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

  const allowedStates: Array<SalesOrderHeaderUpdateRequest['estadoOrden']> = ['Pendiente', 'Confirmada', 'En Producción', 'Entregada', 'Anulada'];

  return (
    <>
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Dialog open={open} onClose={handleCloseModal} maxWidth="sm" fullWidth disableEscapeKeyDown={loading}>
        <DialogTitle>Editar Cabecera de Orden de Venta #{orderData.idOrdenVenta}</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" gutterBottom>
            Cliente: <strong>{orderData.cliente.nombreCliente}</strong>
          </Typography>
          {formError && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{formError}</Alert>}
          <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Controller
              name="fechaEntregaEstimada"
              control={control}
              render={({ field, fieldState }) => (
                  <DatePicker
                    label="Fecha Entrega Estimada"
                    value={field.value ? parseISO(field.value) : null} // parseISO para convertir string a Date
                    onChange={(date) => field.onChange(date ? formatISO(date, { representation: 'date' }) : null)}
                    minDate={new Date(new Date().setDate(new Date().getDate() -1))} // Permite hoy
                    slotProps={{
                      textField: {
                          fullWidth: true,
                          error: !!fieldState.error,
                          helperText: fieldState.error?.message,
                          onBlur: field.onBlur, // Importante para que la validación yup se dispare
                          InputLabelProps: { shrink: true }
                        },
                      }}
                      disabled={loading}
                    />
                  )}
              />
            <TextField
              select
              required
              fullWidth
              id="estadoOrden"
              label="Estado de la Orden"
              {...register('estadoOrden', { required: 'El estado es requerido.' })}
              error={!!errors.estadoOrden}
              helperText={errors.estadoOrden?.message}
              disabled={loading}
            >
              {allowedStates.map((stateOption) => (
                <MenuItem key={stateOption} value={stateOption}>
                    {stateOption}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              id="observacionesOrden"
              label="Observaciones (Opcional)"
              multiline
              rows={3}
              {...register('observacionesOrden', { maxLength: { value: 1000, message: 'Máximo 1000 caracteres.' } })}
              error={!!errors.observacionesOrden}
              helperText={errors.observacionesOrden?.message}
              disabled={loading}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseModal} color="inherit" disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            onClick={handleSubmit(handleFormSubmit)}
            disabled={loading || !isDirty}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </DialogActions>
      </Dialog>
      </LocalizationProvider>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default SalesOrderHeaderEditModal;