import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Typography,
  Snackbar,
} from '@mui/material';
import type { ChangePasswordRequest } from '../../../types/user.types';
import { changeUserPassword } from '../../../api/userService';

interface ChangePasswordFormInputs extends ChangePasswordRequest {
  confirmNewPassword: string;
}

interface ChangePasswordFormProps {
  userId: number;
  userName: string;
  isOwnPasswordChange: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({
  userId,
  userName,
  isOwnPasswordChange,
  onSuccess,
  onCancel,
}) => {
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordFormInputs>({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const onSubmit: SubmitHandler<ChangePasswordFormInputs> = async (data) => {
    setLoading(true);
    setAlert(null);
    setSnackbarMessage('');
    setSnackbarOpen(false);

    const payload: ChangePasswordRequest = {
      currentPassword: data.currentPassword, // ✅ siempre se envía
      newPassword: data.newPassword,
    };

    try {
      const successMsgFromBackend = await changeUserPassword(userId, payload);
      setSnackbarMessage(
        successMsgFromBackend || `Contraseña para '${userName}' cambiada exitosamente.`
      );
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      reset();
      onSuccess?.();
    } catch (err: any) {
      setAlert({
        type: 'error',
        message: err?.message || `Error al cambiar la contraseña para '${userName}'.`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
      <Typography variant="subtitle1" gutterBottom>
        Cambiando contraseña para: <strong>{userName}</strong>
      </Typography>

      {alert && (
        <Alert severity={alert.type} sx={{ mb: 2 }}>
          {alert.message}
        </Alert>
      )}

      {/* ✅ currentPassword SIEMPRE visible */}
      <TextField
        margin="normal"
        required
        fullWidth
        label={
          isOwnPasswordChange ? 'Tu contraseña actual' : 'Contraseña actual del usuario'
        }
        type="password"
        id="currentPassword"
        autoComplete="current-password"
        autoFocus // <--- AÑADIR AQUÍ
        {...register('currentPassword')}
        error={!!errors.currentPassword}
        helperText={errors.currentPassword?.message}
        disabled={loading}
        sx={{ mb: 2 }}
      />

      <TextField
        margin="normal"
        required
        fullWidth
        label="Nueva Contraseña"
        type="password"
        id="newPassword"
        autoComplete="new-password"
        {...register('newPassword')}
        error={!!errors.newPassword}
        helperText={errors.newPassword?.message}
        disabled={loading}
        sx={{ mb: 2 }}
      />

      <TextField
        margin="normal"
        required
        fullWidth
        label="Confirmar Nueva Contraseña"
        type="password"
        id="confirmNewPassword"
        autoComplete="new-password"
        {...register('confirmNewPassword')}
        error={!!errors.confirmNewPassword}
        helperText={errors.confirmNewPassword?.message}
        disabled={loading}
        sx={{ mb: 2 }}
      />

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        {onCancel && (
          <Button variant="outlined" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
        )}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
        </Button>
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
    </Box>
  );
};

export default ChangePasswordForm;