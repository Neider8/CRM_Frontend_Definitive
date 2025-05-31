import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import {
  Box, TextField, Button, CircularProgress, Alert, Typography, MenuItem, Paper,
  InputAdornment, Snackbar
} from '@mui/material';
import type { EmployeeCreateRequest } from '../../../types/employee.types';
import { createEmployee } from '../../../api/employeeService';
import { useNavigate } from 'react-router-dom';
import type { ApiErrorResponseDTO } from '../../../types/error.types';

interface FormData extends Omit<EmployeeCreateRequest, 'fechaContratacionEmpleado'> {
  fechaContratacionEmpleado?: string | null;
}

const EmployeeCreateForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<FormData>({
    defaultValues: {
      tipoDocumento: 'Cédula',
      numeroDocumento: '',
      nombreEmpleado: '',
      cargoEmpleado: '',
      areaEmpleado: '',
      salarioEmpleado: null,
      fechaContratacionEmpleado: null,
    }
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setLoading(true);
    setError(null);
    setSnackbarMessage('');

    const payload: EmployeeCreateRequest = {
      ...data,
      fechaContratacionEmpleado: data.fechaContratacionEmpleado
        ? new Date(data.fechaContratacionEmpleado).toISOString().split('T')[0]
        : null,
      salarioEmpleado: data.salarioEmpleado ? Number(data.salarioEmpleado) : null,
      cargoEmpleado: data.cargoEmpleado || null,
      areaEmpleado: data.areaEmpleado || null,
    };

    try {
      const newEmployee = await createEmployee(payload);
      setSnackbarMessage(`Empleado '${newEmployee.nombreEmpleado}' creado exitosamente con ID: ${newEmployee.idEmpleado}.`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      reset();
      setTimeout(() => {
        navigate('/empleados');
      }, 2500);
    } catch (err: any) {
      console.error("Error al crear empleado:", err);
      const apiError = err as ApiErrorResponseDTO;
      let displayError = 'Error al crear el empleado. Verifique los datos e inténtelo de nuevo.';
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

  const tipoDocumentoOptions = ['Cédula', 'Otro'];
  const handleCloseSnackbar = () => setSnackbarOpen(false);

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h6" gutterBottom>
          Registrar Nuevo Empleado
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

        <TextField
          required
          fullWidth
          select
          id="tipoDocumento"
          label="Tipo de Documento"
          defaultValue="Cédula"
          {...register('tipoDocumento')}
          error={!!errors.tipoDocumento}
          helperText={errors.tipoDocumento?.message}
          disabled={loading}
        >
          {tipoDocumentoOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          required
          fullWidth
          id="numeroDocumento"
          label="Número de Documento"
          autoFocus // Añadido autoFocus aquí
          {...register('numeroDocumento')}
          error={!!errors.numeroDocumento}
          helperText={errors.numeroDocumento?.message}
          disabled={loading}
        />

        <TextField
          required
          fullWidth
          id="nombreEmpleado"
          label="Nombre Completo del Empleado"
          {...register('nombreEmpleado')}
          error={!!errors.nombreEmpleado}
          helperText={errors.nombreEmpleado?.message}
          disabled={loading}
        />

        <TextField
          fullWidth
          id="cargoEmpleado"
          label="Cargo (Opcional)"
          {...register('cargoEmpleado')}
          error={!!errors.cargoEmpleado}
          helperText={errors.cargoEmpleado?.message}
          disabled={loading}
        />

        <TextField
          fullWidth
          id="areaEmpleado"
          label="Área (Opcional)"
          {...register('areaEmpleado')}
          error={!!errors.areaEmpleado}
          helperText={errors.areaEmpleado?.message}
          disabled={loading}
        />

        <TextField
          fullWidth
          id="salarioEmpleado"
          label="Salario (Opcional)"
          type="number"
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
            inputProps: { min: 0, step: "0.01" }
          }}
          {...register('salarioEmpleado', {
            setValueAs: (value) => value === '' ? null : parseFloat(value)
          })}
          error={!!errors.salarioEmpleado}
          helperText={errors.salarioEmpleado?.message}
          disabled={loading}
        />

        <TextField
          fullWidth
          id="fechaContratacionEmpleado"
          label="Fecha de Contratación (Opcional)"
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
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {loading ? 'Creando...' : 'Crear Empleado'}
          </Button>
        </Box>
      </Box>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
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

export default EmployeeCreateForm;