// src/features/auth/components/LoginForm.tsx
import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Typography,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import { loginUser } from '../../../api/authService';
import { useAuth } from '../../../contexts/AuthContext';
import type { LoginCredentials } from '../../../types/auth.types';
import type { ApiErrorResponseDTO } from '../../../types/error.types';

const loginSchema = yup.object({
  nombreUsuario: yup.string().required('El nombre de usuario es requerido.'),
  contrasena: yup.string().required('La contraseña es requerida.'),
});

const LoginForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>({
    resolver: yupResolver(loginSchema),
    mode: 'onTouched',
  });

  const onSubmit: SubmitHandler<LoginCredentials> = useCallback(
    async (data) => {
      setLoading(true);
      setError(null);
      try {
        const authTokenPayload = await loginUser(data);
        await auth.login(authTokenPayload);
        navigate(from, { replace: true });
      } catch (err) {
        console.error('Error de login:', err);
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
    },
    [auth, navigate, from]
  );

  const handleClickShowPassword = useCallback(
    () => setShowPassword((show) => !show),
    []
  );

  const handleMouseDownPassword = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
    },
    []
  );

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      sx={{ mt: 1 }}
      autoComplete="off"
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
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
        type={showPassword ? 'text' : 'password'}
        id="contrasena"
        autoComplete="current-password"
        {...register('contrasena')}
        error={!!errors.contrasena}
        helperText={errors.contrasena?.message}
        disabled={loading}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="Mostrar u ocultar contraseña"
                onClick={handleClickShowPassword}
                onMouseDown={handleMouseDownPassword}
                edge="end"
                disabled={loading}
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
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