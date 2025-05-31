import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  Box, CircularProgress, Alert, Snackbar
} from '@mui/material';
import type { ContactCreateRequest, ContactDetails } from '../../../types/client.types'; // Reutilizamos ContactCreateRequest para el payload
import { updateClientContact } from '../../../api/clientService';
import type { ApiErrorResponseDTO } from '../../../types/error.types';

interface ContactEditModalProps {
  open: boolean;
  onClose: () => void;
  clientId: number;
  contactData: ContactDetails; // Datos del contacto a editar
  onContactUpdated: () => void; // Callback para refrescar
}

const ContactEditModal: React.FC<ContactEditModalProps> = ({
  open,
  onClose,
  clientId,
  contactData,
  onContactUpdated,
}) => {
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty }, // Usar isDirty
    reset,
  } = useForm<ContactCreateRequest>({ // El payload de actualización es el mismo que el de creación para contactos
    defaultValues: { // Se setean en useEffect
      nombreContacto: '',
      cargoContacto: '',
      telefonoContacto: '',
      correoContacto: '',
    },
  });

  useEffect(() => {
    if (contactData && open) { // Resetear cuando el modal se abre y hay datos
      reset({
        nombreContacto: contactData.nombreContacto || '',
        cargoContacto: contactData.cargoContacto || '',
        telefonoContacto: contactData.telefonoContacto || '',
        correoContacto: contactData.correoContacto || '',
      });
    }
  }, [contactData, open, reset]);


  const handleFormSubmit: SubmitHandler<ContactCreateRequest> = async (data) => {
    if (!isDirty) {
      setSnackbarMessage('No se realizaron cambios en el contacto.');
      setSnackbarOpen(true);
      onClose();
      return;
    }
    setLoading(true);
    setFormError(null);
    try {
      await updateClientContact(clientId, contactData.idContacto, data);
      setSnackbarMessage('Contacto actualizado exitosamente.');
      setSnackbarOpen(true);
      onContactUpdated();
      onClose();
    } catch (err: any) {
      console.error("Error al actualizar contacto:", err);
      const apiError = err as ApiErrorResponseDTO;
      setFormError(apiError?.message || 'Error al actualizar el contacto.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    if (!loading) {
      setFormError(null);
      onClose();
    }
  };

  const handleCloseSnackbar = () => setSnackbarOpen(false);

  return (
    <>
      <Dialog open={open} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Contacto: {contactData?.nombreContacto}</DialogTitle>
        <DialogContent>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              required
              fullWidth
              id="nombreContactoEdit" // ID diferente para evitar conflictos si ambos modales estuvieran en el DOM (aunque no es el caso)
              label="Nombre Completo del Contacto"
              autoFocus
              {...register('nombreContacto', { required: 'El nombre del contacto es requerido.' })}
              error={!!errors.nombreContacto}
              helperText={errors.nombreContacto?.message}
              disabled={loading}
            />
            <TextField
              fullWidth
              id="cargoContactoEdit"
              label="Cargo (Opcional)"
              {...register('cargoContacto')}
              error={!!errors.cargoContacto}
              helperText={errors.cargoContacto?.message}
              disabled={loading}
            />
            <TextField
              fullWidth
              id="telefonoContactoEdit"
              label="Teléfono (Opcional)"
              type="tel"
              {...register('telefonoContacto')}
              error={!!errors.telefonoContacto}
              helperText={errors.telefonoContacto?.message}
              disabled={loading}
            />
            <TextField
              fullWidth
              id="correoContactoEdit"
              label="Correo Electrónico (Opcional)"
              type="email"
              {...register('correoContacto', { pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Formato de correo inválido.' } })}
              error={!!errors.correoContacto}
              helperText={errors.correoContacto?.message}
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
            onClick={handleSubmit(handleFormSubmit)}
            variant="contained"
            color="primary"
            disabled={loading || !isDirty} // Deshabilitar si no hay cambios
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
        {/* Usar severity 'info' si el mensaje es 'No se realizaron cambios' */}
        <Alert onClose={handleCloseSnackbar} severity={snackbarMessage === 'No se realizaron cambios en el contacto.' ? 'info' : 'success'} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ContactEditModal;