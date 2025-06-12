// src/features/productInventory/components/ProductMovementCreateModal.tsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  Box, CircularProgress, Alert, Snackbar, MenuItem, Typography
} from '@mui/material';
import type { SupplyMovementCreateRequest } from '../../../types/inventory.types';
import { registerProductMovement } from '../../../api/productInventoryService';
import type { ApiErrorResponseDTO } from '../../../types/error.types';

interface ProductMovementFormInputs {
  tipoMovimiento: 'Entrada' | 'Salida';
  cantidadMovimiento: number;
  descripcionMovimiento?: string | null;
}

interface ProductMovementCreateModalProps {
  open: boolean;
  onClose: () => void;
  inventoryId: number; // ID del registro de inventario (InventarioProducto)
  productName: string;
  location: string;
  currentStock: number;
  onMovementRegistered: () => void; // Callback para refrescar datos en la página de detalles O la lista
}

const ProductMovementCreateModal: React.FC<ProductMovementCreateModalProps> = ({
  open,
  onClose,
  inventoryId,
  productName,
  location,
  currentStock,
  onMovementRegistered, // Aquí está el callback
}) => {
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ProductMovementFormInputs>({
    defaultValues: {
      tipoMovimiento: 'Salida',
      cantidadMovimiento: undefined,
      descripcionMovimiento: '',
    },
  });

  const tipoMovimientoWatched = watch('tipoMovimiento');
  const cantidadMovimientoWatched = watch('cantidadMovimiento');

  useEffect(() => {
    if (open) {
      reset({
        tipoMovimiento: 'Salida',
        cantidadMovimiento: undefined,
        descripcionMovimiento: '',
      });
    }
    setFormError(null);
  }, [open, reset]);


  const handleFormSubmit: SubmitHandler<ProductMovementFormInputs> = async (data) => {
    if (data.tipoMovimiento === 'Salida' && data.cantidadMovimiento > currentStock) {
      setFormError(`No se puede registrar una salida de ${data.cantidadMovimiento} unidades. Stock actual: ${currentStock}.`);
      return;
    }

    setLoading(true);
    setFormError(null);

    const payload: SupplyMovementCreateRequest = {
      inventarioProductoId: inventoryId,
      tipoMovimiento: data.tipoMovimiento,
      cantidadMovimiento: Number(data.cantidadMovimiento),
      descripcionMovimiento: data.descripcionMovimiento || null,
    };

    try {
      await registerProductMovement(payload);
      setSnackbarMessage('Movimiento de inventario registrado exitosamente.');
      setSnackbarOpen(true);
      onMovementRegistered(); // Llama al callback para refrescar la lista y cerrar el modal
    } catch (err: any) {
      console.error("Error al registrar movimiento:", err);
      const apiError = err as ApiErrorResponseDTO;
      setFormError(apiError?.message || 'Error al registrar el movimiento.');
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

  return (
    <>
      <Dialog open={open} onClose={handleCloseModal} maxWidth="sm" fullWidth disableEscapeKeyDown={loading}>
        <DialogTitle>Registrar Movimiento de Inventario</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" gutterBottom>
            Producto: <strong>{productName}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Ubicación: {location} | Stock Actual: {currentStock} unidades
          </Typography>
          {formError && <Alert severity="error" sx={{ mb: 2, mt:1 }}>{formError}</Alert>}
          <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              required
              fullWidth
              select
              id="tipoMovimiento"
              label="Tipo de Movimiento"
              defaultValue="Salida"
              {...register('tipoMovimiento', { required: 'El tipo de movimiento es requerido.' })}
              error={!!errors.tipoMovimiento}
              helperText={errors.tipoMovimiento?.message}
              disabled={loading}
            >
              <MenuItem value="Entrada">Entrada</MenuItem>
              <MenuItem value="Salida">Salida</MenuItem>
            </TextField>
            <TextField
              required
              fullWidth
              id="cantidadMovimiento"
              label="Cantidad"
              type="number"
              InputProps={{ inputProps: { min: 1, step: 1 } }}
              {...register('cantidadMovimiento', {
                  required: 'La cantidad es requerida.',
                  valueAsNumber: true,
                  min: { value: 1, message: 'La cantidad debe ser al menos 1.' },
                  validate: value => Number.isInteger(value) || 'La cantidad debe ser un número entero.',
                })}
              error={!!errors.cantidadMovimiento
                  || (tipoMovimientoWatched === 'Salida' && watch('cantidadMovimiento') > currentStock)
              }
              helperText={
                errors.cantidadMovimiento?.message ||
                (tipoMovimientoWatched === 'Salida' && watch('cantidadMovimiento') > currentStock
                  ? `Máximo ${currentStock} para salida.`
                  : '')
              }
              disabled={loading}
            />
            <TextField
              fullWidth
              id="descripcionMovimiento"
              label="Descripción / Motivo (Opcional)"
              multiline
              rows={2}
              {...register('descripcionMovimiento', { maxLength: { value: 500, message: 'Máximo 500 caracteres.' } })}
              error={!!errors.descripcionMovimiento}
              helperText={errors.descripcionMovimiento?.message}
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
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Registrando...' : 'Registrar Movimiento'}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ProductMovementCreateModal;