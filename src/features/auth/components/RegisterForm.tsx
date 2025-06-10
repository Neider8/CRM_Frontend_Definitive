import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Typography,
  MenuItem,
  // --- INICIO DE CAMBIOS ---
  IconButton,
  InputAdornment
  // --- FIN DE CAMBIOS ---
} from '@mui/material';
// --- INICIO DE CAMBIOS ---
import { Visibility, VisibilityOff } from '@mui/icons-material';
// --- FIN DE CAMBIOS ---
import type { RegisterPayload } from '../../../types/auth.types';
import { registerUser } from '../../../api/authService';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

const registerSchema = yup.object({
  idEmpleado: yup
    .number()
    .nullable()
    .transform((value, originalValue) => originalValue === '' ? null : value)
    .typeError('ID de empleado debe ser un número')
    .default(null),
  nombreUsuario: yup
    .string()
    .required('El nombre de usuario es requerido.')
    .min(3, 'Mínimo 3 caracteres.')
    .max(50, 'Máximo 50 caracteres.'),
  contrasena: yup
    .string()
    .required('La contraseña es requerida.')
    .min(8, 'La contraseña debe tener al menos 8 caracteres.'),
  confirmarContrasena: yup
    .string()
    .oneOf([yup.ref('contrasena')], 'Las contraseñas deben coincidir.')
    .required('Confirmar contraseña es requerido.'),
  rolUsuario: yup
    .string()
    .required('El rol es requerido.')
    .oneOf(['Administrador', 'Gerente', 'Operario', 'Ventas'], 'Rol inválido.'),
}).required();

type RegisterFormInputs = yup.InferType<typeof registerSchema>;

const RegisterForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  // --- INICIO DE CAMBIOS: Estados para visibilidad de contraseña ---
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleClickShowConfirmPassword = () => setShowConfirmPassword((show) => !show);

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };
  // --- FIN DE CAMBIOS ---

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RegisterFormInputs>({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      idEmpleado: null,
      nombreUsuario: '',
      contrasena: '',
      confirmarContrasena: '',
      rolUsuario: 'Ventas',
    },
  });

  const onSubmit = async (data: RegisterFormInputs) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    const payload: RegisterPayload = {
      idEmpleado: data.idEmpleado ?? null,
      nombreUsuario: data.nombreUsuario,
      contrasena: data.contrasena,
      rolUsuario: data.rolUsuario,
    };

    try {
      await registerUser(payload);
      setSuccessMessage('¡Registro exitoso! Ahora puedes iniciar sesión.');
      reset();
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: unknown) {
      console.error('Error de registro:', err);
      if (err && typeof err === 'object' && err !== null && 'message' in err && typeof (err as { message: unknown }).message === 'string') {
        setError((err as { message: string }).message);
      } else {
        setError('Error durante el registro. Por favor, inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  const roles = ['Administrador', 'Gerente', 'Operario', 'Ventas'];

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

      <TextField
         margin="normal"
        fullWidth
        id="idEmpleado"
        label="ID de Empleado (Opcional)"
        type="number"
        {...register('idEmpleado')}
        error={!!errors.idEmpleado}
        helperText={errors.idEmpleado?.message}
        disabled={loading}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        id="nombreUsuario"
        label="Nombre de Usuario"
        autoComplete="username"
        {...register('nombreUsuario')}
        error={!!errors.nombreUsuario}
        helperText={errors.nombreUsuario?.message}
        disabled={loading}
      />
      {/* --- INICIO DE CAMBIOS: Campo de contraseña actualizado --- */}
      <TextField
        margin="normal"
        required
        fullWidth
        label="Contraseña"
        type={showPassword ? 'text' : 'password'}
        id="contrasena"
        autoComplete="new-password"
        {...register('contrasena')}
        error={!!errors.contrasena}
        helperText={errors.contrasena?.message}
        disabled={loading}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleClickShowPassword}
                onMouseDown={handleMouseDownPassword}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      {/* --- FIN DE CAMBIOS --- */}
      
      {/* --- INICIO DE CAMBIOS: Campo de confirmar contraseña actualizado --- */}
      <TextField
        margin="normal"
        required
        fullWidth
        label="Confirmar Contraseña"
        type={showConfirmPassword ? 'text' : 'password'}
        id="confirmarContrasena"
        autoComplete="new-password"
        {...register('confirmarContrasena')}
        error={!!errors.confirmarContrasena}
        helperText={errors.confirmarContrasena?.message}
        disabled={loading}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleClickShowConfirmPassword}
                onMouseDown={handleMouseDownPassword}
                edge="end"
              >
                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      {/* --- FIN DE CAMBIOS --- */}
      
      <TextField
        margin="normal"
        required
        fullWidth
        id="rolUsuario"
        select
        label="Rol de Usuario"
        {...register('rolUsuario')}
        error={!!errors.rolUsuario}
        helperText={errors.rolUsuario?.message}
        disabled={loading}
      >
        {roles.map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </TextField>
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : 'Registrar'}
      </Button>
      <Typography variant="body2" align="center">
        ¿Ya tienes una cuenta?{' '}
        <RouterLink to="/login" style={{ textDecoration: 'none' }}>
          <Typography component="span" color="primary">
            Inicia sesión aquí
          </Typography>
        </RouterLink>
      </Typography>
    </Box>
  );
};

export default RegisterForm;