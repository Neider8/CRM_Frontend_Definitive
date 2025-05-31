// src/features/supplies/components/SupplyCreateForm.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import {
  Box, TextField, Button, CircularProgress, Alert, Typography, Paper, Snackbar, MenuItem
} from '@mui/material';
import type { SupplyCreateRequest } from '../../../types/supply.types';
import { createInsumo } from '../../../api/supplyService';
import { useNavigate } from 'react-router-dom';
import type { ApiErrorResponseDTO } from '../../../types/error.types';

interface FormData extends SupplyCreateRequest {}

const SupplyCreateForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    defaultValues: {
      nombreInsumo: '',
      descripcionInsumo: '',
      unidadMedidaInsumo: 'Unidad', // Valor por defecto común
      stockMinimoInsumo: 0,
    }
  });

  const onSubmit: SubmitHandler<SupplyCreateRequest> = async (data) => {
    setLoading(true);
    setError(null);
    setSnackbarMessage('');

    const payload: SupplyCreateRequest = {
      ...data,
      descripcionInsumo: data.descripcionInsumo || null,
      stockMinimoInsumo: data.stockMinimoInsumo ? Number(data.stockMinimoInsumo) : null,
    };

    try {
      const newSupply = await createInsumo(payload);
      setSnackbarMessage(`Insumo '${newSupply.nombreInsumo}' creado exitosamente.`);
      setSnackbarOpen(true);
      reset();
      setTimeout(() => {
        navigate('/insumos');
      }, 2500);
    } catch (err: any) {
      console.error("Error al crear insumo:", err);
      const apiError = err as ApiErrorResponseDTO;
      let displayError = 'Error al crear el insumo. Verifique los datos.';
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
    <Paper elevation={3} sx={{ p: { xs: 2, md: 3 } }}>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h6" gutterBottom>
          Registrar Nuevo Insumo
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
          defaultValue="Unidad"
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
            onClick={() => navigate('/insumos')}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {loading ? 'Creando...' : 'Crear Insumo'}
          </Button>
        </Box>
      </Box>
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
    </Paper>
  );
};

export default SupplyCreateForm;