// src/features/supplies/components/SupplyEditForm.tsx
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import {
  Box, TextField, Button, CircularProgress, Alert, Typography, Paper, Snackbar, MenuItem
} from '@mui/material';
import type { SupplyUpdateRequest, InsumoDetails } from '../../../types/supply.types';
import { updateInsumo } from '../../../api/supplyService';
import { useNavigate } from 'react-router-dom';
import type { ApiErrorResponseDTO } from '../../../types/error.types';

interface SupplyEditFormProps {
  supplyData: InsumoDetails;
}

interface FormData extends SupplyUpdateRequest {}

const SupplyEditForm: React.FC<SupplyEditFormProps> = ({ supplyData }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info'>('success');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<FormData>({
    defaultValues: {}, // Se setea en useEffect
  });

  useEffect(() => {
    if (supplyData) {
      reset({
        nombreInsumo: supplyData.nombreInsumo || '',
        descripcionInsumo: supplyData.descripcionInsumo || '',
        unidadMedidaInsumo: supplyData.unidadMedidaInsumo || 'Unidad',
        stockMinimoInsumo: supplyData.stockMinimoInsumo ?? 0,
      });
    }
  }, [supplyData, reset]);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    if (!isDirty) {
      setSnackbarMessage("No se realizaron cambios.");
      setSnackbarSeverity('info');
      setSnackbarOpen(true);
      return;
    }

    setLoading(true);
    setError(null);
    setSnackbarMessage('');

    const payload: SupplyUpdateRequest = {
      ...data,
      descripcionInsumo: data.descripcionInsumo || null,
      stockMinimoInsumo: data.stockMinimoInsumo ? Number(data.stockMinimoInsumo) : null,
    };

    try {
      const updatedSupply = await updateInsumo(supplyData.idInsumo, payload);
      setSnackbarMessage(`Insumo '${updatedSupply.nombreInsumo}' actualizado exitosamente.`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      reset(payload); // Actualiza el formulario a los nuevos valores guardados
      setTimeout(() => {
        navigate(`/insumos/${supplyData.idInsumo}`); // Volver a detalles del insumo
      }, 2500);
    } catch (err: any) {
      console.error("Error al actualizar insumo:", err);
      const apiError = err as ApiErrorResponseDTO;
      let displayError = 'Error al actualizar el insumo.';
      if (apiError && typeof apiError.message === 'string') {
        displayError = apiError.message;
        if (apiError.validationErrors) {
            const validationMessages = Object.values(apiError.validationErrors).join(' ');
            displayError += ` Detalles: ${validationMessages}`;
        }
      }
      setError(displayError);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => setSnackbarOpen(false);
  const unidadMedidaOptions = ['Unidad', 'Metro', 'Kilo', 'Litro', 'Rollo', 'Caja', 'Par', 'Docena'];

  return (
    <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, mt:2 }}>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h6" gutterBottom>
          Editar Insumo: {supplyData.nombreInsumo} (ID: {supplyData.idInsumo})
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

        <TextField
          required
          fullWidth
          id="nombreInsumo"
          label="Nombre del Insumo"
          autoFocus
          {...register('nombreInsumo', { required: 'El nombre del insumo es requerido.' })}
          error={!!errors.nombreInsumo}
          helperText={errors.nombreInsumo?.message}
          disabled={loading}
        />
        <TextField
          fullWidth
          id="descripcionInsumo"
          label="Descripción (Opcional)"
          multiline
          rows={3}
          {...register('descripcionInsumo')}
          error={!!errors.descripcionInsumo}
          helperText={errors.descripcionInsumo?.message}
          disabled={loading}
        />
        <TextField
          required
          fullWidth
          id="unidadMedidaInsumo"
          label="Unidad de Medida"
          select
          {...register('unidadMedidaInsumo', { required: 'La unidad de medida es requerida.' })}
          error={!!errors.unidadMedidaInsumo}
          helperText={errors.unidadMedidaInsumo?.message}
          disabled={loading}
        >
          {unidadMedidaOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          fullWidth
          id="stockMinimoInsumo"
          label="Stock Mínimo (Opcional)"
          type="number"
          InputProps={{ inputProps: { min: 0 } }}
          {...register('stockMinimoInsumo', { valueAsNumber: true })}
          error={!!errors.stockMinimoInsumo}
          helperText={errors.stockMinimoInsumo?.message}
          disabled={loading}
        />

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => navigate(`/insumos/${supplyData.idInsumo}`)} // Volver a detalles
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading || !isDirty}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </Box>
      </Box>
       <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default SupplyEditForm;