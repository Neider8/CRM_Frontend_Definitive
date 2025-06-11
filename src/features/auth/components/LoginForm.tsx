import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Typography,
  IconButton,
  InputAdornment,
  Paper,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

import { loginUser } from '../../../api/authService';
import type { LoginCredentials } from '../../../types/auth.types';
import { useAuth } from '../../../contexts/AuthContext';

export const LoginForm: React.FC = () => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    nombreUsuario: '',
    contrasena: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const authTokenPayload = await loginUser(credentials);
      await login(authTokenPayload);
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      console.error('Error capturado en el formulario:', err);
      if (err && typeof err === 'object' && 'message' in err && typeof (err as any).message === 'string') {
        setError((err as any).message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocurrió un error inesperado.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 4,
        maxWidth: 500,
        mx: 'auto',
        mt: 8,
        borderRadius: 3,
        backgroundColor: '#fff',
      }}
    >
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Typography variant="h4" align="center" gutterBottom>
          Inicio de Sesión
        </Typography>
        <Typography variant="subtitle1" align="center" gutterBottom>
          Bienvenido
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <TextField
          margin="normal"
          required
          fullWidth
          id="nombreUsuario"
          label="Nombre de Usuario"
          name="nombreUsuario"
          autoComplete="username"
          value={credentials.nombreUsuario}
          onChange={handleChange}
          disabled={isLoading}
        />

        <TextField
          margin="normal"
          required
          fullWidth
          name="contrasena"
          label="Contraseña"
          type={showPassword ? 'text' : 'password'}
          id="contrasena"
          autoComplete="current-password"
          value={credentials.contrasena}
          onChange={handleChange}
          disabled={isLoading}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                  size="small"
                  sx={{ padding: 0 }}
                >
                  {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{
            mt: 3,
            mb: 2,
            backgroundColor: '#5033d8',
            '&:hover': {
              backgroundColor: '#3f27b1',
            },
          }}
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={20} /> : 'Acceder'}
        </Button>

        <Typography variant="body2" align="center">
          ¿No tienes una cuenta?{' '}
          <RouterLink to="/register" style={{ textDecoration: 'none' }}>
            <Typography component="span" color="primary" fontWeight={500}>
              Regístrate aquí
            </Typography>
          </RouterLink>
        </Typography>
      </Box>
    </Paper>
  );
};
