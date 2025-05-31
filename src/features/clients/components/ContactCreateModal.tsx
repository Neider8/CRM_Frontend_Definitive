// src/features/clients/components/ContactCreateModal.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  Box, CircularProgress, Alert, Snackbar, Slide
} from '@mui/material';
import type { ContactCreateRequest } from '../../../types/client.types';
import { addContactToClient } from '../../../api/clientService';
import type { ApiErrorResponseDTO } from '../../../types/error.types';
import type { TransitionProps } from '@mui/material/transitions';

const SlideTransition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface ContactCreateModalProps {
  open: boolean;
  onClose: () => void;
  clientId: number;
  onContactCreated: () => void;
}

const ContactCreateModal: React.FC<ContactCreateModalProps> = ({
  open,
  onClose,
  clientId,
  onContactCreated,
}) => {
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ContactCreateRequest>({
    defaultValues: { nombreContacto: '', cargoContacto: '', telefonoContacto: '', correoContacto: '' },
  });

  const handleFormSubmit: SubmitHandler<ContactCreateRequest> = async (data) => {
    setLoading(true);
    setFormError(null);
    try {
      const payload: ContactCreateRequest = { ...data };
      await addContactToClient(clientId, payload);
      setSnackbarMessage('Contacto añadido exitosamente.');
      setSnackbarOpen(true);
      reset();
      onContactCreated();
      onClose();
    } catch (err: any) {
      console.error("Error al añadir contacto:", err);
      const apiError = err as ApiErrorResponseDTO;
      setFormError(apiError?.message || 'Error al añadir el contacto.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    if (!loading) {
      reset();
      setFormError(null);
      onClose();
    }
  };

  const handleCloseSnackbar = () => setSnackbarOpen(false);

  return (
    <>
      <Dialog
        open={open}
        onClose={handleCloseModal}
        TransitionComponent={SlideTransition} // Añadir transición
        keepMounted // Recomendado con transiciones
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Añadir Nuevo Contacto</DialogTitle>
        <DialogContent>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField required fullWidth id="nombreContacto" label="Nombre Completo del Contacto" autoFocus {...register('nombreContacto', { required: 'El nombre del contacto es requerido.' })} error={!!errors.nombreContacto} helperText={errors.nombreContacto?.message} disabled={loading} />
            <TextField fullWidth id="cargoContacto" label="Cargo (Opcional)" {...register('cargoContacto')} error={!!errors.cargoContacto} helperText={errors.cargoContacto?.message} disabled={loading} />
            <TextField fullWidth id="telefonoContacto" label="Teléfono (Opcional)" type="tel" {...register('telefonoContacto')} error={!!errors.telefonoContacto} helperText={errors.telefonoContacto?.message} disabled={loading} />
            <TextField fullWidth id="correoContacto" label="Correo Electrónico (Opcional)" type="email" {...register('correoContacto', { pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Formato de correo inválido.' } })} error={!!errors.correoContacto} helperText={errors.correoContacto?.message} disabled={loading} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseModal} color="inherit" disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" color="primary" onClick={handleSubmit(handleFormSubmit)} disabled={loading} startIcon={loading ? <CircularProgress size={20} /> : null}>
            {loading ? 'Guardando...' : 'Añadir Contacto'}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ContactCreateModal;