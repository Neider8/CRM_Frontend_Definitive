// src/features/clients/components/ClientEditForm.tsx
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import {
  Box, TextField, Button, CircularProgress, Alert, Typography, MenuItem, Paper, Snackbar
} from '@mui/material';
import type { ClientUpdateRequest, ClientDetails } from '../../../types/client.types';
import { updateClient } from '../../../api/clientService';
import { useNavigate } from 'react-router-dom';
import type { ApiErrorResponseDTO } from '../../../types/error.types';

interface ClientEditFormProps {
  clientData: ClientDetails; // Datos del cliente a editar
}

const ClientEditForm: React.FC<ClientEditFormProps> = ({ clientData }) => {
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
  } = useForm<ClientUpdateRequest>({
    defaultValues: {
      tipoDocumento: clientData.tipoDocumento as ('NIT' | 'Cédula') || 'NIT',
      numeroDocumento: clientData.numeroDocumento || '',
      nombreCliente: clientData.nombreCliente || '',
      direccionCliente: clientData.direccionCliente || '',
      telefonoCliente: clientData.telefonoCliente || '',
      correoCliente: clientData.correoCliente || '',
    }
  });

  // Efecto para resetear el formulario si clientData cambia
  useEffect(() => {
    if (clientData) {
      reset({
        tipoDocumento: clientData.tipoDocumento as ('NIT' | 'Cédula') || 'NIT',
        numeroDocumento: clientData.numeroDocumento || '',
        nombreCliente: clientData.nombreCliente || '',
        direccionCliente: clientData.direccionCliente || '',
        telefonoCliente: clientData.telefonoCliente || '',
        correoCliente: clientData.correoCliente || '',
      });
    }
  }, [clientData, reset]);

  const onSubmit: SubmitHandler<ClientUpdateRequest> = async (data) => {
    if (!isDirty) {
      setSnackbarMessage("No se realizaron cambios.");
      setSnackbarSeverity('info');
      setSnackbarOpen(true);
      return;
    }

    setLoading(true);
    setError(null);
    setSnackbarMessage('');

    const payload: ClientUpdateRequest = {
      ...data,
      direccionCliente: data.direccionCliente || null,
      telefonoCliente: data.telefonoCliente || null,
      correoCliente: data.correoCliente || null,
    };

    try {
      const updatedClient = await updateClient(clientData.idCliente, payload);
      setSnackbarMessage(`Cliente '${updatedClient.nombreCliente}' actualizado exitosamente.`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      reset(payload); // Actualiza el formulario a los nuevos valores guardados
      setTimeout(() => {
        navigate(`/clientes/${clientData.idCliente}`); // Volver a la página de detalles del cliente
      }, 2500);
    } catch (err: any) {
      console.error("Error al actualizar cliente:", err);
      const apiError = err as ApiErrorResponseDTO;
      let displayError = 'Error al actualizar el cliente. Verifique los datos e inténtelo de nuevo.';
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
    <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, mt: 2 }}>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h6" gutterBottom>
          Editar Cliente: {clientData.nombreCliente} (ID: {clientData.idCliente})
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
          <TextField
            required
            fullWidth
            select
            id="tipoDocumento"
            label="Tipo de Documento"
            {...register('tipoDocumento', { required: 'El tipo de documento es requerido.' })}
            defaultValue={clientData.tipoDocumento}
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
            defaultValue={clientData.numeroDocumento}
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
          defaultValue={clientData.nombreCliente}
          error={!!errors.nombreCliente}
          helperText={errors.nombreCliente?.message}
          disabled={loading}
        />
        <TextField
          fullWidth
          id="direccionCliente"
          label="Dirección (Opcional)"
          {...register('direccionCliente')}
          defaultValue={clientData.direccionCliente}
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
          defaultValue={clientData.telefonoCliente}
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
          defaultValue={clientData.correoCliente}
          error={!!errors.correoCliente}
          helperText={errors.correoCliente?.message}
          disabled={loading}
        />

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => navigate(`/clientes/${clientData.idCliente}`)}
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

export default ClientEditForm;