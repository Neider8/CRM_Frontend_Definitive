// src/features/auth/components/LoginForm.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Box, TextField, Button, CircularProgress, Alert, Typography } from '@mui/material';
import type { LoginCredentials } from '../../../types/auth.types';
import { loginUser } from '../../../api/authService';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import type { ApiErrorResponseDTO } from '../../../types/error.types';

const loginSchema = yup.object().shape({
  nombreUsuario: yup.string().required('El nombre de usuario es requerido.'),
  contrasena: yup.string().required('La contraseña es requerida.'),
});

const LoginForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard"; // Redirigir a dashboard o a la ruta previa

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>({
    resolver: yupResolver(loginSchema),
  });

  // ...existing code...
  const onSubmit: SubmitHandler<LoginCredentials> = async (data) => {
  setLoading(true);
  setError(null);
  try {
    const authTokenPayload = await loginUser(data);
    await auth.login(authTokenPayload); // Llama a la función login del AuthContext
    navigate(from, { replace: true });
  } catch (err: unknown) {
    console.error("Error de login:", err);
      if (
      err &&
      typeof err === 'object' &&
      'message' in err &&
      typeof (err as ApiErrorResponseDTO).message === 'string'
    ) {
      setError((err as ApiErrorResponseDTO).message);
    } else {
      setError('Error al iniciar sesión. Por favor, inténtalo de nuevo.');
    }
  } finally {
    setLoading(false);
  }
};
// ...existing code...

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <TextField
        margin="normal"
        required
        fullWidth
        id="nombreUsuario"
        label="Nombre de Usuario"
        autoComplete="username"
        autoFocus
        {...register('nombreUsuario')}
        error={!!errors.nombreUsuario}
        helperText={errors.nombreUsuario?.message}
        disabled={loading}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        label="Contraseña"
        type="password"
        id="contrasena"
        autoComplete="current-password"
        {...register('contrasena')}
        error={!!errors.contrasena}
        helperText={errors.contrasena?.message}
        disabled={loading}
      />
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : 'Iniciar Sesión'}
      </Button>
      <Typography variant="body2" align="center">
        ¿No tienes una cuenta?{' '}
        <RouterLink to="/register" style={{ textDecoration: 'none' }}>
          <Typography component="span" color="primary">
            Regístrate aquí
          </Typography>
        </RouterLink>
      </Typography>
    </Box>
  );
};

export default LoginForm;