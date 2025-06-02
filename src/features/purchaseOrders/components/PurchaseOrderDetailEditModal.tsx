// src/features/purchaseOrders/components/PurchaseOrderDetailEditModal.tsx
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  CircularProgress, Alert, Snackbar, InputAdornment, Box, Typography, Stack
} from '@mui/material';
import type { PurchaseOrderDetailRequest, PurchaseOrderDetailDetails } from '../../../types/purchaseOrder.types';
import { updateDetailInPurchaseOrder } from '../../../api/purchaseOrderService';
import type { ApiErrorResponseDTO } from '../../../types/error.types';

// El insumo no se edita aquí, solo cantidad y precio de compra
interface PurchaseOrderDetailEditFormInputs {
  cantidadCompra: number;
  precioUnitarioCompra: number;
}

interface PurchaseOrderDetailEditModalProps {
  open: boolean;
  onClose: () => void;
  orderId: number;
  detailData: PurchaseOrderDetailDetails; // Datos del detalle de OC a editar
  onDetailUpdated: () => void; // Callback para refrescar
}

const PurchaseOrderDetailEditModal: React.FC<PurchaseOrderDetailEditModalProps> = ({
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
    setValue,
  } = useForm<PurchaseOrderDetailEditFormInputs>({
    defaultValues: { // Se establecerán en useEffect
        cantidadCompra: undefined,
        precioUnitarioCompra: undefined,
    },
  });

  useEffect(() => {
    if (detailData && open) {
      reset({
        cantidadCompra: Number(detailData.cantidadCompra),
        precioUnitarioCompra: Number(detailData.precioUnitarioCompra),
      });
    }
    if (!open) {
        setFormError(null);
    }
  }, [detailData, open, reset]);

  const handleFormSubmit: SubmitHandler<PurchaseOrderDetailEditFormInputs> = async (data) => {
    if (!isDirty) {
        setSnackbarMessage("No se realizaron cambios en el detalle.");
        setSnackbarSeverity('info');
        setSnackbarOpen(true);
        onClose();
        return;
    }
    setLoading(true);
    setFormError(null);

    // El DTO de backend DetalleOrdenCompraRequestDTO necesita idInsumo.
    const payload: PurchaseOrderDetailRequest = {
      idInsumo: detailData.insumo.idInsumo, // El ID del insumo no cambia en la edición del detalle
      cantidadCompra: Number(data.cantidadCompra),
      precioUnitarioCompra: Number(data.precioUnitarioCompra),
    };

    try {
      await updateDetailInPurchaseOrder(orderId, detailData.idDetalleCompra, payload);
      setSnackbarMessage('Detalle de la orden de compra actualizado exitosamente.');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      onDetailUpdated();
      onClose();
    } catch (err: any) {
      console.error("Error al actualizar detalle de la orden de compra:", err);
      const apiError = err as ApiErrorResponseDTO;
      setFormError(apiError?.message || 'Error al actualizar el detalle.');
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

  if (!detailData) return null;

  return (
    <>
      <Dialog open={open} onClose={handleCloseModal} maxWidth="xs" fullWidth disableEscapeKeyDown={loading}>
        <DialogTitle>Editar Detalle de Insumo en Orden de Compra</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" gutterBottom>
            Orden de Compra ID: <strong>{orderId}</strong>
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Insumo: <strong>{detailData.insumo.nombreInsumo}</strong> (ID: {detailData.insumo.idInsumo})
          </Typography>
          {formError && <Alert severity="error" sx={{ mb: 2, mt:1 }}>{formError}</Alert>}
          <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              required
              fullWidth
              autoFocus
              id="cantidadCompraEditDetailOC"
              label={`Cantidad (${detailData.insumo.unidadMedidaInsumo})`}
              type="number"
              InputProps={{ inputProps: { min: 0.001, step: "0.001" } }}
              {...register('cantidadCompra', { required: 'La cantidad es requerida.', valueAsNumber: true, min: 0.001, validate: value => value === undefined || value === null || /^\d+(\.\d{0,3})?$/.test(String(value)) || 'Máximo 3 decimales permitidos.' })}
              error={!!errors.cantidadCompra}
              helperText={errors.cantidadCompra?.message}
            />
            <TextField
              required
              fullWidth
              id="precioUnitarioCompraEditDetailOC"
              label="Precio Unit. Compra"
              type="number"
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                inputProps: { step: "0.01", min: 0 }
              }}
              {...register('precioUnitarioCompra', { required: 'El precio es requerido.', valueAsNumber: true, min: 0, validate: value => value === undefined || value === null || /^\d+(\.\d{0,2})?$/.test(String(value)) || 'Máximo 2 decimales permitidos.' })}
              error={!!errors.precioUnitarioCompra}
              helperText={errors.precioUnitarioCompra?.message}
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

export default PurchaseOrderDetailEditModal;