// src/features/auth/components/RegisterForm.tsx
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
  IconButton,
  InputAdornment,
  FormControlLabel,
  Checkbox,
  Link,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormHelperText,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import type { RegisterPayload } from '../../../types/auth.types';
import { registerUser } from '../../../api/authService';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

const registerSchema = yup.object({
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
  terminos: yup
    .boolean()
    .oneOf([true], 'Debes aceptar los términos y condiciones para continuar.')
    .required(),
}).required();

type RegisterFormInputs = yup.InferType<typeof registerSchema>;

const RegisterForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [openTermsDialog, setOpenTermsDialog] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleClickShowConfirmPassword = () => setShowConfirmPassword((show) => !show);
  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<RegisterFormInputs>({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      nombreUsuario: '',
      contrasena: '',
      confirmarContrasena: '',
      rolUsuario: 'Ventas',
      terminos: false,
    },
  });

  const handleOpenTermsDialog = () => setOpenTermsDialog(true);
  const handleCloseTermsDialog = () => setOpenTermsDialog(false);

  const handleAcceptTerms = () => {
    setValue('terminos', true, { shouldValidate: true });
    handleCloseTermsDialog();
  };


  const onSubmit = async (data: RegisterFormInputs) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    const payload: RegisterPayload = {
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

  const roles = ['Gerente', 'Operario', 'Ventas'];

  return (
    <>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

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
        <FormControlLabel
          control={
            <Checkbox
              {...register('terminos')}
              checked={watch('terminos')} 
              color="primary"
            />
          }
          label={
            <Typography variant="body2">
              Acepto los{' '}
              <Link component="button" type="button" onClick={handleOpenTermsDialog} sx={{ verticalAlign: 'baseline', color: '#5033d8' }}>
                Términos y Condiciones
              </Link>
            </Typography>
          }
          sx={{ mt: 1, display: 'flex' }}
        />
        {errors.terminos && (
          <FormHelperText error sx={{ ml: '14px' }}>
            {errors.terminos.message}
          </FormHelperText>
        )}


        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={loading}
          sx={{
            mt: 3,
            mb: 2,
            backgroundColor: '#5033d8',
            '&:hover': {
              backgroundColor: '#3f27b1',
            },
          }}
        >
          {loading ? <CircularProgress size={24} /> : 'Registrar'}
        </Button>

        <Typography variant="body2" align="center">
          ¿Ya tienes una cuenta?{' '}
          <RouterLink to="/login" style={{ textDecoration: 'none' }}>
            <Typography component="span" sx={{ color: '#5033d8', fontWeight: 500 }}>
              Inicia sesión aquí
            </Typography>
          </RouterLink>
        </Typography>
      </Box>
      <Dialog
        open={openTermsDialog}
        onClose={handleCloseTermsDialog}
        aria-labelledby="terms-dialog-title"
      >
        <DialogTitle id="terms-dialog-title">Términos y Condiciones</DialogTitle>
        <DialogContent>
          <DialogContentText component="div" tabIndex={-1}>
            <Typography variant="h6" gutterBottom>1. Aceptación de los Términos</Typography>
            <Typography variant="body2" paragraph>
              Al registrarse y utilizar este servicio, usted acepta y se compromete a cumplir con los términos y condiciones aquí establecidos.
            </Typography>
            <Typography variant="h6" gutterBottom>2. Responsabilidad de la Cuenta</Typography>
            <Typography variant="body2" paragraph>
              Usted es responsable de mantener la confidencialidad de su contraseña y de todas las actividades que ocurran bajo su cuenta.
            </Typography>
            <Typography variant="h6" gutterBottom>3. Uso Aceptable</Typography>
            <Typography variant="body2" paragraph>
              El uso de esta plataforma para fines ilegales o no autorizados está estrictamente prohibido.
            </Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTermsDialog}>Cerrar</Button>
          <Button onClick={handleAcceptTerms} variant="contained" autoFocus sx={{ backgroundColor: '#5033d8', '&:hover': { backgroundColor: '#3f27b1' } }}>
            Aceptar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default RegisterForm;