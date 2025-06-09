// src/features/suppliers/components/SupplierEditForm.tsx
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import {
  Box, TextField, Button, CircularProgress, Alert, Typography, Paper, Snackbar
} from '@mui/material';
import type { SupplierDetails, SupplierUpdateRequest } from '../../../types/supplier.types'; // Importar tipos de PROVEEDORES
import { updateSupplier } from '../../../api/supplierService'; // Importar servicio de PROVEEDORES
import { useNavigate } from 'react-router-dom';
import type { ApiErrorResponseDTO } from '../../../types/error.types';

interface SupplierEditFormProps {
  supplierData: SupplierDetails; // <--- Este es el prop que espera SupplierEditPage
}

interface FormData extends SupplierUpdateRequest {} // Usar tipos de proveedor para el formulario

const SupplierEditForm: React.FC<SupplierEditFormProps> = ({ supplierData }) => {
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
    if (supplierData) {
      reset({
        nombreComercialProveedor: supplierData.nombreComercialProveedor || '',
        razonSocialProveedor: supplierData.razonSocialProveedor || '',
        nitProveedor: supplierData.nitProveedor || '',
        telefonoProveedor: supplierData.telefonoProveedor || '',
        correoProveedor: supplierData.correoProveedor || '',
        direccionProveedor: supplierData.direccionProveedor || '',
        contactoPrincipalProveedor: supplierData.contactoPrincipalProveedor || '',
        telefonoContactoPrincipal: supplierData.telefonoContactoPrincipal || '',
        correoContactoPrincipal: supplierData.correoContactoPrincipal || '',
        // Agrega aquí todos los campos que necesites para editar un proveedor
      });
    }
  }, [supplierData, reset]);

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

    // Asegúrate de que el payload coincida con SupplierUpdateRequest
    const payload: SupplierUpdateRequest = {
      nombreComercialProveedor: data.nombreComercialProveedor,
      razonSocialProveedor: data.razonSocialProveedor || null,
      nitProveedor: data.nitProveedor,
      telefonoProveedor: data.telefonoProveedor || null,
      correoProveedor: data.correoProveedor || null,
      direccionProveedor: data.direccionProveedor || null,
      contactoPrincipalProveedor: data.contactoPrincipalProveedor || null,
      telefonoContactoPrincipal: data.telefonoContactoPrincipal || null,
      correoContactoPrincipal: data.correoContactoPrincipal || null,
    };

    try {
      // Usar la función de actualización de PROVEEDORES
      const updatedSupplier = await updateSupplier(supplierData.idProveedor, payload); 
      setSnackbarMessage(`Proveedor '${updatedSupplier.nombreComercialProveedor}' actualizado exitosamente.`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      reset(payload); // Actualiza el formulario a los nuevos valores guardados
      setTimeout(() => {
        navigate(`/proveedores/${supplierData.idProveedor}`); // Volver a detalles del PROVEEDOR
      }, 2500);
    } catch (err: any) {
      console.error("Error al actualizar proveedor:", err);
      const apiError = err as ApiErrorResponseDTO;
      let displayError = 'Error al actualizar el proveedor.';
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

  return (
    <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, mt: 2 }}>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h6" gutterBottom>
          Editar Proveedor: {supplierData.nombreComercialProveedor} (ID: {supplierData.idProveedor})
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

        {/* Aquí irían los TextField y otros componentes de formulario específicos para PROVEEDORES */}
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
          fullWidth
          id="razonSocialProveedor"
          label="Razón Social (Opcional)"
          {...register('razonSocialProveedor')}
          error={!!errors.razonSocialProveedor}
          helperText={errors.razonSocialProveedor?.message}
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
          id="telefonoProveedor"
          label="Teléfono (Opcional)"
          {...register('telefonoProveedor')}
          error={!!errors.telefonoProveedor}
          helperText={errors.telefonoProveedor?.message}
          disabled={loading}
        />
        <TextField
          fullWidth
          id="correoProveedor"
          label="Correo (Opcional)"
          type="email"
          {...register('correoProveedor', { pattern: { value: /^\S+@\S+$/i, message: 'Formato de correo inválido' }})}
          error={!!errors.correoProveedor}
          helperText={errors.correoProveedor?.message}
          disabled={loading}
        />
        <TextField
          fullWidth
          id="direccionProveedor"
          label="Dirección (Opcional)"
          multiline
          rows={3}
          {...register('direccionProveedor')}
          error={!!errors.direccionProveedor}
          helperText={errors.direccionProveedor?.message}
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
        <TextField
          fullWidth
          id="telefonoContactoPrincipal"
          label="Teléfono Contacto Principal (Opcional)"
          {...register('telefonoContactoPrincipal')}
          error={!!errors.telefonoContactoPrincipal}
          helperText={errors.telefonoContactoPrincipal?.message}
          disabled={loading}
        />
        <TextField
          fullWidth
          id="correoContactoPrincipal"
          label="Correo Contacto Principal (Opcional)"
          type="email"
          {...register('correoContactoPrincipal', { pattern: { value: /^\S+@\S+$/i, message: 'Formato de correo inválido' }})}
          error={!!errors.correoContactoPrincipal}
          helperText={errors.correoContactoPrincipal?.message}
          disabled={loading}
        />


        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => navigate(`/proveedores/${supplierData.idProveedor}`)} // Volver a detalles del PROVEEDOR
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

export default SupplierEditForm;