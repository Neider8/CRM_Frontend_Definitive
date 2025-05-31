import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Box, TextField, Button, CircularProgress, Alert, Typography, MenuItem, Paper, Autocomplete, Snackbar
} from '@mui/material';
import type { UserInfo, UsuarioUpdateRequest } from '../../../types/user.types';
import { updateUsuarioAdmin } from '../../../api/userService';
import { getAllEmployees } from '../../../api/employeeService';
import type { EmployeeDetails } from '../../../types/employee.types';
import { useNavigate } from 'react-router-dom';
import type { ApiErrorResponseDTO } from '../../../types/error.types';

interface UserEditFormProps {
  userData: UserInfo;
}

interface UserEditFormInputs {
  rolUsuario: string;
  idEmpleado: EmployeeDetails | null;
}

const roles = ['Administrador', 'Gerente', 'Operario', 'Ventas'];

const UserEditForm: React.FC<UserEditFormProps> = ({ userData }) => {
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info'>('success');
  const [selectableEmployees, setSelectableEmployees] = useState<EmployeeDetails[]>([]);
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { isDirty }
  } = useForm<UserEditFormInputs>({
    defaultValues: {
      rolUsuario: userData.rolUsuario || '',
      idEmpleado: userData.empleado || null,
    }
  });

  useEffect(() => {
    const fetchAndSetEmployees = async () => {
      setFormLoading(true);
      try {
        const allEmployeesPage = await getAllEmployees({ size: 1000 });
        const filteredEmployees = allEmployeesPage.content.filter(emp =>
          !emp.usuario || (userData.empleado && emp.idEmpleado === userData.empleado.idEmpleado)
        );
        setSelectableEmployees(filteredEmployees);

        const currentAssociatedEmployee = userData.empleado
          ? allEmployeesPage.content.find(emp => emp.idEmpleado === userData.empleado!.idEmpleado) || null
          : null;

        reset({
          rolUsuario: userData.rolUsuario || '',
          idEmpleado: currentAssociatedEmployee,
        });
      } catch (err: any) {
        const apiError = err as ApiErrorResponseDTO;
        setError(apiError?.message || "No se pudieron cargar los empleados para selección. Por favor, intenta nuevamente más tarde.");
      } finally {
        setFormLoading(false);
      }
    };

    if (userData) {
      fetchAndSetEmployees();
    }
  }, [userData, reset]);

  // Validación manual
  const validate = (data: UserEditFormInputs) => {
    if (!roles.includes(data.rolUsuario)) {
      setError('El rol es requerido y debe ser válido.');
      return false;
    }
    if (data.idEmpleado && data.idEmpleado.idEmpleado <= 0) {
      setError('ID de empleado debe ser un número entero positivo si se selecciona.');
      return false;
    }
    setError(null);
    return true;
  };

  const onSubmit = async (data: UserEditFormInputs) => {
    if (!isDirty) {
      setSnackbarMessage("No se realizaron cambios.");
      setSnackbarSeverity('info');
      setSnackbarOpen(true);
      return;
    }
    if (!validate(data)) return;

    setLoading(true);
    setError(null);

    const payload: UsuarioUpdateRequest = {
      rolUsuario: data.rolUsuario,
      idEmpleado: data.idEmpleado ? data.idEmpleado.idEmpleado : null,
    };

    try {
      const updatedUser = await updateUsuarioAdmin(userData.idUsuario, payload);
      setSnackbarMessage(`Usuario '${updatedUser.nombreUsuario}' actualizado exitosamente.`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      const newAssociatedEmployee = selectableEmployees.find(emp => emp.idEmpleado === payload.idEmpleado) || null;
      reset({ rolUsuario: payload.rolUsuario, idEmpleado: newAssociatedEmployee });
      setTimeout(() => {
        navigate('/usuarios');
      }, 2000);
    } catch (err: any) {
      const apiError = err as ApiErrorResponseDTO;
      setError(apiError?.message || 'Error al actualizar el usuario.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  if (formLoading && !userData) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>;
  }

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Typography variant="h6" gutterBottom>
          Editar Usuario: {userData.nombreUsuario} (ID: {userData.idUsuario})
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{error}</Alert>}

        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            id="nombreUsuarioDisplay"
            label="Nombre de Usuario (No editable)"
            defaultValue={userData.nombreUsuario}
            InputProps={{ readOnly: true }}
            variant="filled"
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <Controller
            name="rolUsuario"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                select
                label="Rol de Usuario"
                required
                autoFocus // Añadido autoFocus aquí
                disabled={loading || formLoading}
                error={!!error && !roles.includes(field.value)}
                helperText={!!error && !roles.includes(field.value) ? error : ''}
              >
                {roles.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <Controller
            name="idEmpleado"
            control={control}
            render={({ field }) => (
              <Autocomplete
                {...field}
                options={selectableEmployees}
                loading={formLoading}
                getOptionLabel={(option) =>
                  option
                    ? `${option.nombreEmpleado} (ID: ${option.idEmpleado}) - ${option.usuario ? 'Asociado a ' + option.usuario.nombreUsuario : 'Disponible'}`
                    : ''
                }
                isOptionEqualToValue={(option, value) => option?.idEmpleado === value?.idEmpleado}
                value={field.value || null}
                onChange={(_, newValue) => field.onChange(newValue)}
                getOptionDisabled={(option) =>
                  option.usuario !== null &&
                  (!userData.empleado || option.idEmpleado !== userData.empleado.idEmpleado)
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Asociar Empleado (Opcional)"
                    error={!!error && !!field.value && field.value.idEmpleado <= 0 ? true : undefined}
                    helperText={!!error && field.value && field.value.idEmpleado <= 0 ? error : ''}
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
        </Box>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button variant="outlined" onClick={() => navigate(`/usuarios/${userData.idUsuario}`)} disabled={loading || formLoading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading || formLoading || !isDirty}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </Box>
      </Box>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Paper>
  );
};

export default UserEditForm;