// src/features/salesOrders/components/SalesOrderDetailEditModal.tsx
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  CircularProgress, Alert, Snackbar, InputAdornment, Box, Typography, Stack
} from '@mui/material';
import type { SalesOrderDetailRequest, SalesOrderDetailDetails } from '../../../types/salesOrder.types';
import { updateDetailInSalesOrder } from '../../../api/salesOrderService';
import type { ApiErrorResponseDTO } from '../../../types/error.types';

// El producto no se edita aquí, solo cantidad y precio
interface SalesOrderDetailEditFormInputs {
  cantidadProducto: number;
  precioUnitarioVenta?: number | null;
}

interface SalesOrderDetailEditModalProps {
  open: boolean;
  onClose: () => void;
  orderId: number;
  detailData: SalesOrderDetailDetails; // Datos del detalle a editar
  onDetailUpdated: () => void;
}

const SalesOrderDetailEditModal: React.FC<SalesOrderDetailEditModalProps> = ({
  open,
  onClose,
  orderId,
  detailData,
  onDetailUpdated,
}) => {
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info'>('success');


  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    setValue, // Para inicializar el formulario
  } = useForm<SalesOrderDetailEditFormInputs>({
    defaultValues: { // Se establecerán en useEffect
      cantidadProducto: 1,
      precioUnitarioVenta: undefined,
    },
  });

  useEffect(() => {
    if (detailData && open) {
      reset({
        cantidadProducto: detailData.cantidadProducto,
        precioUnitarioVenta: detailData.precioUnitarioVenta,
      });
    }
    if (!open) {
        setFormError(null);
    }
  }, [detailData, open, reset]);

  const handleFormSubmit: SubmitHandler<SalesOrderDetailEditFormInputs> = async (data) => {
    if (!isDirty) {
        setSnackbarMessage("No se realizaron cambios en el detalle.");
        setSnackbarSeverity('info');
        setSnackbarOpen(true);
        onClose();
        return;
    }
    setLoading(true);
    setFormError(null);

    // El DTO de backend necesita idProducto, lo tomamos de detailData
    const payload: SalesOrderDetailRequest = {
      idProducto: detailData.producto.idProducto, // ID del producto original, no se cambia
      cantidadProducto: Number(data.cantidadProducto),
      precioUnitarioVenta: data.precioUnitarioVenta ? Number(data.precioUnitarioVenta) : null,
    };

    try {
      await updateDetailInSalesOrder(orderId, detailData.idDetalleOrden, payload);
      setSnackbarMessage('Detalle de la orden actualizado exitosamente.');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      onDetailUpdated();
      onClose();
    } catch (err: any) {
      console.error("Error al actualizar detalle de la orden:", err);
      const apiError = err as ApiErrorResponseDTO;
      setFormError(apiError?.message || 'Error al actualizar el detalle.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    if (!loading) {
      onClose(); // El reset para la próxima apertura se maneja en useEffect
    }
  };
  const handleCloseSnackbar = () => setSnackbarOpen(false);

  if (!detailData) return null; // No renderizar si no hay datos del detalle

  return (
    <>
      <Dialog open={open} onClose={handleCloseModal} maxWidth="xs" fullWidth disableEscapeKeyDown={loading}>
        <DialogTitle>Editar Detalle de Producto en Orden</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" gutterBottom>
            Orden de Venta ID: <strong>{orderId}</strong>
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Producto: <strong>{detailData.producto.nombreProducto}</strong> (Ref: {detailData.producto.referenciaProducto})
          </Typography>
          {formError && <Alert severity="error" sx={{ mb: 2, mt:1 }}>{formError}</Alert>}
          <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              required
              fullWidth
              autoFocus
              id="cantidadProductoEditDetail"
              label="Cantidad"
              type="number"
              InputProps={{ inputProps: { min: 1, step: 1 } }}
              {...register('cantidadProducto', {
                required: 'La cantidad es requerida.',
                valueAsNumber: true,
                min: { value: 1, message: 'La cantidad debe ser al menos 1.' },
              })}
              error={!!errors.cantidadProducto}
              helperText={errors.cantidadProducto?.message}
              disabled={loading}
            />
            <TextField
              fullWidth
              id="precioUnitarioVentaEditDetail"
              label="Precio Unitario"
              type="number"
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                inputProps: { step: "0.01", min: 0 }
              }}
              {...register('precioUnitarioVenta', {
                valueAsNumber: true,
                min: { value: 0, message: 'El precio no puede ser negativo.' },
              })}
              error={!!errors.precioUnitarioVenta}
              helperText={errors.precioUnitarioVenta?.message || "Dejar vacío para usar precio del catálogo."}
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

export default SalesOrderDetailEditModal;