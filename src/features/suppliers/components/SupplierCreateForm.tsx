// src/features/suppliers/components/SupplierCreateForm.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import {
  Box, TextField, Button, CircularProgress, Alert, Typography, Paper, Snackbar
} from '@mui/material';
import type { SupplierCreateRequest } from '../../../types/supplier.types';
import { createSupplier } from '../../../api/supplierService';
import { useNavigate } from 'react-router-dom';
import type { ApiErrorResponseDTO } from '../../../types/error.types';

interface FormData extends SupplierCreateRequest {}

const SupplierCreateForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    defaultValues: {
      nombreComercialProveedor: '',
      razonSocialProveedor: '',
      nitProveedor: '',
      direccionProveedor: '',
      telefonoProveedor: '',
      correoProveedor: '',
      contactoPrincipalProveedor: '',
    }
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setLoading(true);
    setError(null);
    setSnackbarMessage('');

    const payload: SupplierCreateRequest = {
      ...data,
      razonSocialProveedor: data.razonSocialProveedor || null,
      direccionProveedor: data.direccionProveedor || null,
      telefonoProveedor: data.telefonoProveedor || null,
      correoProveedor: data.correoProveedor || null,
      contactoPrincipalProveedor: data.contactoPrincipalProveedor || null,
    };

    try {
      const newSupplier = await createSupplier(payload);
      setSnackbarMessage(`Proveedor '${newSupplier.nombreComercialProveedor}' creado exitosamente.`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      reset();
      setTimeout(() => {
        navigate('/proveedores');
      }, 2500);
    } catch (err: any) {
      console.error("Error al crear proveedor:", err);
      const apiError = err as ApiErrorResponseDTO;
      let displayError = 'Error al crear el proveedor. Verifique los datos e inténtelo de nuevo.';
      if (apiError && typeof apiError.message === 'string') {
        displayError = err.message;
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

  return (
    <Paper elevation={3} sx={{ p: { xs: 2, md: 3 } }}>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h6" gutterBottom>
          Registrar Nuevo Proveedor
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

        <TextField
          required
          fullWidth
          id="nombreComercialProveedor"
          label="Nombre Comercial"
          autoFocus
          {...register('nombreComercialProveedor', { required: 'El nombre comercial es requerido.' })}
          error={!!errors.nombreComercialProveedor}
          helperText={errors.nombreComercialProveedor?.message}
          disabled={loading}
        />
        <TextField
          required
          fullWidth
          id="nitProveedor"
          label="NIT"
          {...register('nitProveedor', { required: 'El NIT es requerido.' })}
          error={!!errors.nitProveedor}
          helperText={errors.nitProveedor?.message}
          disabled={loading}
        />
        <TextField
          fullWidth
          id="razonSocialProveedor"
          label="Razón Social (Opcional)"
          {...register('razonSocialProveedor')}
          error={!!errors.razonSocialProveedor}
          helperText={errors.razonSocialProveedor?.message}
          disabled={loading}
        />
        <TextField
          fullWidth
          id="direccionProveedor"
          label="Dirección (Opcional)"
          {...register('direccionProveedor')}
          error={!!errors.direccionProveedor}
          helperText={errors.direccionProveedor?.message}
          disabled={loading}
        />
        <TextField
          fullWidth
          id="telefonoProveedor"
          label="Teléfono (Opcional)"
          type="tel"
          {...register('telefonoProveedor')}
          error={!!errors.telefonoProveedor}
          helperText={errors.telefonoProveedor?.message}
          disabled={loading}
        />
        <TextField
          fullWidth
          id="correoProveedor"
          label="Correo Electrónico (Opcional)"
          type="email"
          {...register('correoProveedor', { pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Formato de correo inválido.' } })}
          error={!!errors.correoProveedor}
          helperText={errors.correoProveedor?.message}
          disabled={loading}
        />
        <TextField
          fullWidth
          id="contactoPrincipalProveedor"
          label="Contacto Principal (Opcional)"
          {...register('contactoPrincipalProveedor')}
          error={!!errors.contactoPrincipalProveedor}
          helperText={errors.contactoPrincipalProveedor?.message}
          disabled={loading}
        />

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/proveedores')}
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
            {loading ? 'Creando...' : 'Crear Proveedor'}
          </Button>
        </Box>
      </Box>
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
    </Paper>
  );
};

export default SupplierCreateForm;