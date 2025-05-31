// src/features/clients/components/ClientCreateForm.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import {
  Box, TextField, Button, CircularProgress, Alert, Typography, MenuItem, Paper, Snackbar
} from '@mui/material';
import type { ClientCreateRequest } from '../../../types/client.types';
import { createClient } from '../../../api/clientService';
import { useNavigate } from 'react-router-dom';
import type { ApiErrorResponseDTO } from '../../../types/error.types';

const ClientCreateForm: React.FC = () => {
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
  } = useForm<ClientCreateRequest>({
    defaultValues: {
      tipoDocumento: 'NIT',
      numeroDocumento: '',
      nombreCliente: '',
      direccionCliente: '',
      telefonoCliente: '',
      correoCliente: '',
    }
  });

  const onSubmit: SubmitHandler<ClientCreateRequest> = async (data) => {
    setLoading(true);
    setError(null);
    setSnackbarMessage('');

    const payload: ClientCreateRequest = {
      ...data,
      direccionCliente: data.direccionCliente || null,
      telefonoCliente: data.telefonoCliente || null,
      correoCliente: data.correoCliente || null,
    };

    try {
      const newClient = await createClient(payload);
      setSnackbarMessage(`Cliente '${newClient.nombreCliente}' creado exitosamente con ID: ${newClient.idCliente}.`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      reset();
      setTimeout(() => {
        navigate('/clientes');
      }, 2500);
    } catch (err: any) {
      console.error("Error al crear cliente:", err);
      const apiError = err as ApiErrorResponseDTO;
      let displayError = 'Error al crear el cliente. Verifique los datos e inténtelo de nuevo.';
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

  const tipoDocumentoOptions = ['NIT', 'Cédula'];
  const handleCloseSnackbar = () => setSnackbarOpen(false);

  return (
    <Paper elevation={3} sx={{ p: { xs: 2, md: 3 } }}>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h6" gutterBottom>
          Registrar Nuevo Cliente
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
          <TextField
            required
            fullWidth
            select
            id="tipoDocumento"
            label="Tipo de Documento"
            defaultValue="NIT"
            {...register('tipoDocumento', { required: 'El tipo de documento es requerido.' })}
            error={!!errors.tipoDocumento}
            helperText={errors.tipoDocumento?.message}
            disabled={loading}
          >
            {tipoDocumentoOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            required
            fullWidth
            id="numeroDocumento"
            label="Número de Documento"
            {...register('numeroDocumento', { required: 'El número de documento es requerido.' })}
            error={!!errors.numeroDocumento}
            helperText={errors.numeroDocumento?.message}
            disabled={loading}
          />
        </Box>

        <TextField
          required
          fullWidth
          id="nombreCliente"
          label="Nombre Completo o Razón Social"
          {...register('nombreCliente', { required: 'El nombre del cliente es requerido.' })}
          error={!!errors.nombreCliente}
          helperText={errors.nombreCliente?.message}
          disabled={loading}
        />
        <TextField
          fullWidth
          id="direccionCliente"
          label="Dirección (Opcional)"
          {...register('direccionCliente')}
          error={!!errors.direccionCliente}
          helperText={errors.direccionCliente?.message}
          disabled={loading}
        />
        <TextField
          fullWidth
          id="telefonoCliente"
          label="Teléfono (Opcional)"
          type="tel"
          {...register('telefonoCliente')}
          error={!!errors.telefonoCliente}
          helperText={errors.telefonoCliente?.message}
          disabled={loading}
        />
        <TextField
          fullWidth
          id="correoCliente"
          label="Correo Electrónico (Opcional)"
          type="email"
          {...register('correoCliente', { pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Formato de correo inválido.' } })}
          error={!!errors.correoCliente}
          helperText={errors.correoCliente?.message}
          disabled={loading}
        />

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/clientes')}
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
            {loading ? 'Creando...' : 'Crear Cliente'}
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

export default ClientCreateForm;