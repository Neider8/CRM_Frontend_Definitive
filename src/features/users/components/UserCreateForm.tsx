import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Typography,
  MenuItem,
  Paper,
  Autocomplete
} from '@mui/material';
import type { RegisterPayload } from '../../../types/auth.types';
import { createUsuarioAdmin } from '../../../api/userService';
import { getAllEmployees } from '../../../api/employeeService';
import type { EmployeeDetails } from '../../../types/employee.types';
import { useNavigate } from 'react-router-dom';
import type { ApiErrorResponseDTO } from '../../../types/error.types';

interface UserCreateFormProps {
  initialEmployeeId?: number | null;
}

interface UserCreateFormInputs extends Omit<RegisterPayload, 'idEmpleado'> {
  idEmpleado: EmployeeDetails | null;
}

const UserCreateForm: React.FC<UserCreateFormProps> = ({ initialEmployeeId }) => {
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const navigate = useNavigate();
  const [availableEmployees, setAvailableEmployees] = useState<EmployeeDetails[]>([]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    register,
  } = useForm<UserCreateFormInputs>({
    defaultValues: {
      idEmpleado: null,
      nombreUsuario: '',
      contrasena: '',
      rolUsuario: 'Ventas',
    }
  });

  useEffect(() => {
    const fetchEmployees = async () => {
      setFormLoading(true);
      try {
        const allEmployeesPage = await getAllEmployees({ size: 1000 });
        const employeesWithoutUser = allEmployeesPage.content.filter(emp => !emp.usuario);
        setAvailableEmployees(employeesWithoutUser);

        if (initialEmployeeId) {
          const preselectedEmployee = allEmployeesPage.content.find(emp => emp.idEmpleado === initialEmployeeId);
          if (preselectedEmployee) {
            if (!preselectedEmployee.usuario) {
              setValue('idEmpleado', preselectedEmployee);
            } else {
              console.warn(`Empleado ID ${initialEmployeeId} ya tiene un usuario asociado, no se puede preseleccionar.`);
              setError(`El empleado con ID ${initialEmployeeId} ya tiene un usuario asociado.`);
            }
          }
        }
      } catch (err: any) {
        console.error("Error cargando empleados disponibles:", err);
        const apiError = err as ApiErrorResponseDTO;
        setError(apiError?.message || "No se pudieron cargar los empleados disponibles. Por favor, intenta nuevamente más tarde.");
      } finally {
        setFormLoading(false);
      }
    };
    fetchEmployees();
  }, [initialEmployeeId, setValue]);

  const onSubmit: SubmitHandler<UserCreateFormInputs> = async (data) => {
    setLoading(true);
    setError(null);
    setSnackbarMessage('');
    setSnackbarOpen(false);

    const payload: RegisterPayload = {
      nombreUsuario: data.nombreUsuario,
      contrasena: data.contrasena,
      rolUsuario: data.rolUsuario,
      idEmpleado: data.idEmpleado ? data.idEmpleado.idEmpleado : null,
    };

    try {
      const newUser = await createUsuarioAdmin(payload);
      setSnackbarMessage(`Usuario '${newUser.nombreUsuario}' creado exitosamente.`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      reset();
      setAvailableEmployees(prev => prev.filter(emp => emp.idEmpleado !== payload.idEmpleado));
      setTimeout(() => {
        navigate('/usuarios');
      }, 2000);
    } catch (err: any) {
      console.error("Error al crear usuario:", err);
      const apiError = err as ApiErrorResponseDTO;
      setError(apiError?.message || 'Error al crear el usuario. Por favor, inténtalo de nuevo.');
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

  const roles = ['Administrador', 'Gerente', 'Operario', 'Ventas'];

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Typography variant="h6" gutterBottom>
          Crear Nuevo Usuario
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {snackbarMessage && <Alert severity={snackbarSeverity} onClose={handleCloseSnackbar} sx={{ mb: 2 }}>{snackbarMessage}</Alert>}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            fullWidth
            id="nombreUsuario"
            label="Nombre de Usuario"
            required
            autoFocus
            {...register('nombreUsuario', {
              required: 'El nombre de usuario es requerido.',
              minLength: { value: 3, message: 'Mínimo 3 caracteres.' },
              maxLength: { value: 50, message: 'Máximo 50 caracteres.' }
            })}
            error={!!errors.nombreUsuario}
            helperText={errors.nombreUsuario?.message}
            disabled={loading || formLoading}
          />
          <TextField
            fullWidth
            id="contrasena"
            label="Contraseña Temporal"
            type="password"
            required
            {...register('contrasena', {
              required: 'La contraseña es requerida.',
              minLength: { value: 8, message: 'Mínimo 8 caracteres.' }
            })}
            error={!!errors.contrasena}
            helperText={errors.contrasena?.message}
            disabled={loading || formLoading}
          />
          <TextField
            fullWidth
            id="rolUsuario"
            select
            label="Rol de Usuario"
            required
            defaultValue="Ventas"
            {...register('rolUsuario', {
              required: 'El rol es requerido.'
            })}
            error={!!errors.rolUsuario}
            helperText={errors.rolUsuario?.message}
            disabled={loading || formLoading}
          >
            {roles.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
          <Controller
            name="idEmpleado"
            control={control}
            render={({ field }) => (
              <Autocomplete
                {...field}
                options={availableEmployees}
                getOptionLabel={(option) => `${option.nombreEmpleado} (ID: ${option.idEmpleado})`}
                isOptionEqualToValue={(option, value) => option.idEmpleado === value.idEmpleado}
                onChange={(_, newValue) => field.onChange(newValue)}
                loading={formLoading}
                disabled={loading || (!!initialEmployeeId && availableEmployees.some(emp => emp.idEmpleado === initialEmployeeId && emp.usuario !== null))}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Asociar Empleado (Opcional)"
                    error={!!errors.idEmpleado}
                    helperText={errors.idEmpleado?.message}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {formLoading ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            )}
          />
          {initialEmployeeId && availableEmployees.some(emp => emp.idEmpleado === initialEmployeeId && emp.usuario !== null) && (
            <Typography variant="caption" color="warning.main" sx={{ display: 'block', mt: 1 }}>
              El empleado ya tiene un usuario asociado.
            </Typography>
          )}
        </Box>
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button variant="outlined" onClick={() => navigate('/usuarios')} disabled={loading || formLoading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading || formLoading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {loading ? 'Creando...' : 'Crear Usuario'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default UserCreateForm;