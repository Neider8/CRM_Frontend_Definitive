import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import {
  Box, TextField, Button, CircularProgress, Alert, Typography, MenuItem, Paper,
  InputAdornment, Snackbar
} from '@mui/material';
import type { EmployeeUpdateRequest, EmployeeDetails } from '../../../types/employee.types';
import { updateEmployee } from '../../../api/employeeService';
import { useNavigate } from 'react-router-dom';
import type { ApiErrorResponseDTO } from '../../../types/error.types';
import { formatISO } from 'date-fns';

interface EmployeeEditFormProps {
  employeeData: EmployeeDetails; // Datos del empleado a editar
}

interface FormData extends EmployeeUpdateRequest {
  fechaContratacionEmpleado?: string | null;
}

const EmployeeEditForm: React.FC<EmployeeEditFormProps> = ({ employeeData }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info'>('success');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    setValue, // Para actualizar campos dinámicamente
  } = useForm<FormData>({
    defaultValues: { // Cargar los datos existentes del empleado
      nombreEmpleado: employeeData.nombreEmpleado || '',
      cargoEmpleado: employeeData.cargoEmpleado || null,
      areaEmpleado: employeeData.areaEmpleado || null,
      salarioEmpleado: employeeData.salarioEmpleado ?? null, // Usar ?? para manejar 0
      fechaContratacionEmpleado: employeeData.fechaContratacionEmpleado || null,
    }
  });

  // Efecto para resetear el formulario si employeeData cambia
  useEffect(() => {
    if (employeeData) {
      reset({
        nombreEmpleado: employeeData.nombreEmpleado || '',
        cargoEmpleado: employeeData.cargoEmpleado || null,
        areaEmpleado: employeeData.areaEmpleado || null,
        salarioEmpleado: employeeData.salarioEmpleado ?? null,
        fechaContratacionEmpleado: employeeData.fechaContratacionEmpleado || null,
      });
    }
  }, [employeeData, reset]);


  const onSubmit: SubmitHandler<FormData> = async (data) => {
    if (!isDirty) {
      setSnackbarMessage("No se realizaron cambios.");
      setSnackbarSeverity('info');
      setSnackbarOpen(true);
      return;
    }

    setLoading(true);
    setError(null);
    setSnackbarMessage('');

    const payload: EmployeeUpdateRequest = {
      ...data,
      fechaContratacionEmpleado: data.fechaContratacionEmpleado || null,
      salarioEmpleado: data.salarioEmpleado ? Number(data.salarioEmpleado) : null,
      cargoEmpleado: data.cargoEmpleado || null,
      areaEmpleado: data.areaEmpleado || null,
    };

    try {
      const updatedEmployee = await updateEmployee(employeeData.idEmpleado, payload);
      setSnackbarMessage(`Empleado '${updatedEmployee.nombreEmpleado}' actualizado exitosamente.`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      reset(payload); // Actualiza el formulario a los nuevos valores guardados
      setTimeout(() => {
        navigate('/empleados');
      }, 2500);
    } catch (err: any) {
      console.error("Error al actualizar empleado:", err);
      const apiError = err as ApiErrorResponseDTO;
      let displayError = 'Error al actualizar el empleado. Verifique los datos e inténtelo de nuevo.';
      if (apiError && typeof apiError.message === 'string') {
        displayError = apiError.message;
        if (apiError.validationErrors) {
          const validationMessages = Object.values(apiError.validationErrors).join(' ');
          displayError += ` Detalles: ${validationMessages}`;
        }
      }
      setError(displayError);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => setSnackbarOpen(false);

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h6" gutterBottom>
          Editar Empleado: {employeeData.nombreEmpleado}
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

        <TextField
          fullWidth
          label="Tipo de Documento (No editable)"
          defaultValue={employeeData.tipoDocumento}
          InputProps={{ readOnly: true }}
          variant="filled"
        />
        <TextField
          fullWidth
          label="Número de Documento (No editable)"
          defaultValue={employeeData.numeroDocumento}
          InputProps={{ readOnly: true }}
          variant="filled"
        />

        <TextField
          required
          fullWidth
          label="Nombre Completo del Empleado"
          autoFocus // Añadido autoFocus aquí
          {...register('nombreEmpleado')}
          error={!!errors.nombreEmpleado}
          helperText={errors.nombreEmpleado?.message}
          disabled={loading}
        />
        <TextField
          fullWidth
          label="Cargo"
          {...register('cargoEmpleado')}
          error={!!errors.cargoEmpleado}
          helperText={errors.cargoEmpleado?.message}
          disabled={loading}
        />
        <TextField
          fullWidth
          label="Área"
          {...register('areaEmpleado')}
          error={!!errors.areaEmpleado}
          helperText={errors.areaEmpleado?.message}
          disabled={loading}
        />
        <TextField
          fullWidth
          label="Salario"
          type="number"
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
            inputProps: { min: 0, step: "0.01" }
          }}
          {...register('salarioEmpleado', {
            setValueAs: (value) => value === '' || value === null || value === undefined ? null : parseFloat(value)
          })}
          error={!!errors.salarioEmpleado}
          helperText={errors.salarioEmpleado?.message}
          disabled={loading}
        />
        <TextField
          fullWidth
          label="Fecha de Contratación"
          type="date"
          {...register('fechaContratacionEmpleado')}
          InputLabelProps={{ shrink: true }}
          error={!!errors.fechaContratacionEmpleado}
          helperText={errors.fechaContratacionEmpleado?.message}
          disabled={loading}
        />

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/empleados')}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading || !isDirty}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </Box>
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
    </Paper>
  );
};

export default EmployeeEditForm;