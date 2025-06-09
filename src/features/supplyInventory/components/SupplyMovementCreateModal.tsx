// src/features/supplyInventory/components/SupplyMovementCreateModal.tsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  Box, CircularProgress, Alert, Snackbar, MenuItem, Typography
} from '@mui/material';
import type { SupplyMovementCreateRequest } from '../../../types/inventory.types';
import { registerSupplyMovement } from '../../../api/supplyInventoryService';
import type { ApiErrorResponseDTO } from '../../../types/error.types';

interface SupplyMovementFormInputs {
  tipoMovimiento: 'Entrada' | 'Salida';
  cantidadMovimiento: number; // El input será number, pero se manejará como string para decimales
  descripcionMovimiento?: string | null;
}

interface SupplyMovementCreateModalProps {
  open: boolean;
  onClose: () => void;
  inventoryId: number; // ID del registro de inventario de Insumo
  insumoName: string;
  insumoUnidad: string; // Unidad de medida del insumo
  location: string;
  currentStock: number; // BigDecimal en backend, number aquí
  onMovementRegistered: () => void;
}

const SupplyMovementCreateModal: React.FC<SupplyMovementCreateModalProps> = ({
  open,
  onClose,
  inventoryId,
  insumoName,
  insumoUnidad,
  location,
  currentStock,
  onMovementRegistered,
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
  } = useForm<SupplyMovementFormInputs>({
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


  const handleFormSubmit: SubmitHandler<SupplyMovementFormInputs> = async (data) => {
    const cantidadMovimientoNum = Number(data.cantidadMovimiento);
    if (data.tipoMovimiento === 'Salida' && cantidadMovimientoNum > currentStock) {
      setFormError(`No se puede registrar una salida de ${cantidadMovimientoNum} ${insumoUnidad}. Stock actual: ${currentStock} ${insumoUnidad}.`);
      return;
    }

    setLoading(true);
    setFormError(null);

    const payload: SupplyMovementCreateRequest = {
      idInventarioInsumo: inventoryId,
      tipoMovimiento: data.tipoMovimiento,
      cantidadMovimiento: cantidadMovimientoNum,
      descripcionMovimiento: data.descripcionMovimiento || null,
    };

    try {
      await registerSupplyMovement(payload);
      setSnackbarMessage('Movimiento de inventario de insumo registrado exitosamente.');
      setSnackbarOpen(true);
      onMovementRegistered(); // Llama al callback para refrescar la lista y cerrar el modal
      onClose(); // Cierra el modal después de que el movimiento es exitoso
    } catch (err: any) {
      console.error("Error al registrar movimiento de insumo:", err);
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
        <DialogTitle>Registrar Movimiento de Inventario de Insumo</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" gutterBottom>
            Insumo: <strong>{insumoName}</strong> ({insumoUnidad})
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Ubicación: {location} | Stock Actual: {Number(currentStock).toLocaleString(undefined, {minimumFractionDigits:0, maximumFractionDigits:3})} {insumoUnidad}
          </Typography>
          {formError && <Alert severity="error" sx={{ mb: 2, mt:1 }}>{formError}</Alert>}
          <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              required
              fullWidth
              select
              id="tipoMovimientoInsumo"
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
              id="cantidadMovimientoInsumo"
              label={`Cantidad (${insumoUnidad})`}
              type="number"
              InputProps={{ inputProps: { min: 0.001, step: "0.001" } }} // Para 3 decimales
              {...register('cantidadMovimiento', {
                  required: 'La cantidad es requerida.',
                  valueAsNumber: true,
                  min: { value: 0.001, message: 'La cantidad debe ser mayor que 0.' },
                  validate: value => value === undefined || value === null || /^\d+(\.\d{0,3})?$/.test(String(value)) || 'Máximo 3 decimales permitidos.'
                })}
              error={!!errors.cantidadMovimiento
                  || (tipoMovimientoWatched === 'Salida' && watch('cantidadMovimiento') > currentStock)
              }
              helperText={
                errors.cantidadMovimiento?.message ||
                (tipoMovimientoWatched === 'Salida' && watch('cantidadMovimiento') > currentStock
                  ? `Máximo ${currentStock} ${insumoUnidad} para salida.`
                  : '')
              }
              disabled={loading}
            />
            <TextField
              fullWidth
              id="descripcionMovimientoInsumo"
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

export default SupplyMovementCreateModal;