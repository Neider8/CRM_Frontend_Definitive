// src/features/productionOrders/components/ProductionTaskEditModal.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
// Se eliminan las importaciones de yup y yupResolver
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  CircularProgress, Alert, Snackbar, Autocomplete, Box, MenuItem, Typography
} from '@mui/material';
import { LocalizationProvider, DateTimePicker, TimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'; // Se mantiene AdapterDateFns
import { es } from 'date-fns/locale/es';
import type { ProductionTaskUpdateRequest, ProductionTaskDetails } from '../../../types/productionOrder.types';
import type { EmpleadoSummary } from '../../../types/employee.types';
import { updateTaskInProductionOrder } from '../../../api/productionOrderService';
import { getAllEmployees } from '../../../api/employeeService';
import type { ApiErrorResponseDTO } from '../../../types/error.types';
import { format, parseISO, isValid } from 'date-fns';

interface ProductionTaskEditFormInputs extends Omit<ProductionTaskUpdateRequest, 'idEmpleado' | 'duracionEstimadaTarea' | 'duracionRealTarea' | 'fechaInicioTarea' | 'fechaFinTarea'> {
  idEmpleado: EmpleadoSummary | null;
  fechaInicioTarea?: Date | null;
  fechaFinTarea?: Date | null;
  duracionEstimadaTareaObj?: Date | null;
  duracionRealTareaObj?: Date | null;
  // Se añade estadoTarea al tipo del formulario para que RHF lo maneje
  estadoTarea?: 'Pendiente' | 'En Curso' | 'Completada' | 'Bloqueada' | undefined;
}

// Helpers para tiempo (sin cambios)
const timeStringToDate = (timeString: string | null | undefined): Date | null => {
    if (!timeString) return null;
    const parts = timeString.split(':').map(Number);
    if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        const date = new Date(0); 
        date.setHours(parts[0], parts[1], parts.length > 2 && !isNaN(parts[2]) ? parts[2] : 0, 0);
        return date;
    }
    return null;
};
const dateToTimeString = (date: Date | null | undefined): string | null => {
    if (!date || !isValid(date)) return null;
    return format(date, 'HH:mm:ss');
};

interface ProductionTaskEditModalProps {
  open: boolean;
  onClose: () => void;
  orderProductionId: number;
  taskData: ProductionTaskDetails;
  onTaskUpdated: () => void;
}

const ProductionTaskEditModal: React.FC<ProductionTaskEditModalProps> = ({
  open,
  onClose,
  orderProductionId,
  taskData,
  onTaskUpdated,
}) => {
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null); // Para errores generales del API
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info'>('success');

  const [employeesList, setEmployeesList] = useState<EmpleadoSummary[]>([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);

  const {
    control,
    handleSubmit, // handleSubmit de RHF se sigue usando para el <form>
    formState: { errors, isDirty }, // 'errors' ahora se poblará manualmente con setError
    reset,
    watch, 
    trigger,
    getValues,
    setError, // Para establecer errores manualmente
    clearErrors, // Para limpiar errores
  } = useForm<ProductionTaskEditFormInputs>({
    // No se usa yupResolver
    defaultValues: {
        nombreTarea: '',
        idEmpleado: null,
        fechaInicioTarea: null,
        fechaFinTarea: null,
        duracionEstimadaTareaObj: null,
        duracionRealTareaObj: null,
        estadoTarea: undefined,
        observacionesTarea: '',
    },
  });

  const watchedFechaInicio = watch('fechaInicioTarea');

  const fetchEmployees = useCallback(async () => {
    if(open){
        setEmployeesLoading(true);
        try {
        const employeesPage = await getAllEmployees({ size: 1000 });
        setEmployeesList(employeesPage.content.map(emp => ({
            idEmpleado: emp.idEmpleado,
            nombreEmpleado: emp.nombreEmpleado,
            numeroDocumento: emp.numeroDocumento,
        })));
        } catch (err) {
        console.error("Error cargando empleados:", err);
        } finally {
        setEmployeesLoading(false);
        }
    }
  }, [open]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  useEffect(() => {
    if (taskData && open) {
      const employeeSummary = taskData.empleado && employeesList.length > 0
        ? employeesList.find(e => e.idEmpleado === taskData.empleado!.idEmpleado) || null 
        : null;

      reset({
        nombreTarea: taskData.nombreTarea || '',
        idEmpleado: employeeSummary,
        fechaInicioTarea: taskData.fechaInicioTarea ? parseISO(taskData.fechaInicioTarea) : null,
        fechaFinTarea: taskData.fechaFinTarea ? parseISO(taskData.fechaFinTarea) : null,
        duracionEstimadaTareaObj: timeStringToDate(taskData.duracionEstimadaTarea),
        duracionRealTareaObj: timeStringToDate(taskData.duracionRealTarea),
        estadoTarea: taskData.estadoTarea as ProductionTaskUpdateRequest['estadoTarea'],
        observacionesTarea: taskData.observacionesTarea || '',
      });
    }
    if (!open) {
        setFormError(null);
        clearErrors(); // Limpiar errores de RHF al cerrar
        reset({ 
            nombreTarea: '', idEmpleado: null, fechaInicioTarea: null, fechaFinTarea: null,
            duracionEstimadaTareaObj: null, duracionRealTareaObj: null, estadoTarea: undefined, observacionesTarea: ''
        });
    }
  }, [taskData, open, reset, employeesList, clearErrors]);

  useEffect(() => {
    if(watchedFechaInicio && getValues('fechaFinTarea')){
        trigger('fechaFinTarea'); // Esto podría no ser necesario sin Yup para validación cruzada automática
    }
  },[watchedFechaInicio, getValues, trigger]);

  // Función de validación manual
  const validateFormData = (data: ProductionTaskEditFormInputs): boolean => {
    clearErrors(); // Limpiar errores existentes
    let isValidForm = true;

    if (!data.nombreTarea || data.nombreTarea.trim() === '') {
      setError('nombreTarea', { type: 'manual', message: 'El nombre de la tarea es requerido.' });
      isValidForm = false;
    } else if (data.nombreTarea.length > 100) {
      setError('nombreTarea', { type: 'manual', message: 'Máximo 100 caracteres.' });
      isValidForm = false;
    }

    if (data.fechaInicioTarea && !isValid(data.fechaInicioTarea)) {
        setError('fechaInicioTarea', { type: 'manual', message: 'Fecha de inicio inválida.' });
        isValidForm = false;
    }
    if (data.fechaFinTarea && !isValid(data.fechaFinTarea)) {
        setError('fechaFinTarea', { type: 'manual', message: 'Fecha de fin inválida.' });
        isValidForm = false;
    }
    if (data.fechaInicioTarea && data.fechaFinTarea && isValid(data.fechaInicioTarea) && isValid(data.fechaFinTarea) && isBefore(data.fechaFinTarea, data.fechaInicioTarea)) {
      setError('fechaFinTarea', { type: 'manual', message: 'La fecha de fin no puede ser anterior a la fecha de inicio.' });
      isValidForm = false;
    }

    if (data.observacionesTarea && data.observacionesTarea.length > 500) {
      setError('observacionesTarea', { type: 'manual', message: 'Máximo 500 caracteres.' });
      isValidForm = false;
    }
    // Aquí podrías añadir más validaciones si es necesario

    return isValidForm;
  };

  const handleFormSubmitInternal: SubmitHandler<ProductionTaskEditFormInputs> = async (data) => {
    if (!isDirty) {
      setSnackbarMessage("No se realizaron cambios en la tarea.");
      setSnackbarSeverity('info');
      setSnackbarOpen(true);
      onClose();
      return;
    }

    // Ejecutar validación manual
    if (!validateFormData(data)) {
        return; // Detener si hay errores de validación
    }

    setLoading(true);
    setFormError(null);

    const payload: ProductionTaskUpdateRequest = {
      nombreTarea: data.nombreTarea,
      idEmpleado: data.idEmpleado ? data.idEmpleado.idEmpleado : null,
      fechaInicioTarea: data.fechaInicioTarea && isValid(data.fechaInicioTarea) ? format(data.fechaInicioTarea, "yyyy-MM-dd'T'HH:mm:ss") : null,
      fechaFinTarea: data.fechaFinTarea && isValid(data.fechaFinTarea) ? format(data.fechaFinTarea, "yyyy-MM-dd'T'HH:mm:ss") : null,
      duracionEstimadaTarea: dateToTimeString(data.duracionEstimadaTareaObj),
      duracionRealTarea: dateToTimeString(data.duracionRealTareaObj),
      estadoTarea: data.estadoTarea,
      observacionesTarea: data.observacionesTarea || null,
    };
    
    Object.keys(payload).forEach(key => {
        const K = key as keyof ProductionTaskUpdateRequest;
        if (payload[K] === undefined) {
          delete payload[K];
        }
      });

    try {
      await updateTaskInProductionOrder(orderProductionId, taskData.idTareaProduccion, payload);
      setSnackbarMessage('Tarea de producción actualizada exitosamente.');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      onTaskUpdated();
      onClose();
    } catch (err: any) {
      console.error("Error al actualizar tarea:", err);
      const apiError = err as ApiErrorResponseDTO;
      setFormError(apiError?.message || 'Error al actualizar la tarea.');
      if (apiError?.validationErrors) {
        Object.entries(apiError.validationErrors).forEach(([field, message]) => {
            setError(field as keyof ProductionTaskEditFormInputs, {type: 'server', message});
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => { if (!loading) onClose(); };
  const handleCloseSnackbar = () => setSnackbarOpen(false);
  const estadoTareaOptions: Array<NonNullable<ProductionTaskUpdateRequest['estadoTarea']>> = ['Pendiente', 'En Curso', 'Completada', 'Bloqueada'];

  if (!taskData && open) return <Dialog open={open} onClose={onClose}><DialogContent><CircularProgress/></DialogContent></Dialog>;
  if (!taskData) return null;

  return (
    <>
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Dialog open={open} onClose={handleCloseModal} maxWidth="md" fullWidth disableEscapeKeyDown={loading}>
        <DialogTitle>Editar Tarea de Producción (ID: {taskData.idTareaProduccion})</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle2" gutterBottom>
            Orden de Producción: #{orderProductionId}
          </Typography>
          {formError && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{formError}</Alert>}
          
          <Box component="form" onSubmit={handleSubmit(handleFormSubmitInternal)} noValidate sx={{ mt: 2 }}>
            {/* Fila 1: Nombre Tarea y Estado */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
              <Box sx={{ flex: { sm: 8 } }}>
                <Controller
                  name="nombreTarea"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} required fullWidth autoFocus label="Nombre de la Tarea" error={!!errors.nombreTarea} helperText={errors.nombreTarea?.message} disabled={loading}/>
                  )}
                />
              </Box>
              <Box sx={{ flex: { sm: 4 } }}>
                <Controller
                    name="estadoTarea"
                    control={control}
                    render={({ field }) => (
                        <TextField {...field} select fullWidth label="Estado Tarea" error={!!errors.estadoTarea} helperText={errors.estadoTarea?.message} disabled={loading}>
                            {estadoTareaOptions.map((option) => ( <MenuItem key={option} value={option}>{option}</MenuItem> ))}
                        </TextField>
                    )}
                />
              </Box>
            </Box>

            {/* Fila 2: Empleado */}
            <Box sx={{ mb: 2 }}>
              <Controller
                name="idEmpleado"
                control={control}
                render={({ field }) => (
                  <Autocomplete {...field} options={employeesList} loading={employeesLoading}
                    getOptionLabel={(option) => option ? option.nombreEmpleado : ''}
                    isOptionEqualToValue={(option, value) => option?.idEmpleado === value?.idEmpleado}
                    onChange={(_, newValue) => field.onChange(newValue)}
                    value={field.value || null} // Asegurar que no sea undefined para Autocomplete
                    renderInput={(params) => (
                      <TextField {...params} label="Asignar Empleado (Opcional)" error={!!errors.idEmpleado} helperText={errors.idEmpleado?.message?.toString()} 
                          InputProps={{ ...params.InputProps, endAdornment: (<>{employeesLoading ? <CircularProgress color="inherit" size={20} /> : null}{params.InputProps.endAdornment}</>)}}
                      />
                    )}
                  />
                )}
              />
            </Box>

            {/* Fila 3: Fechas Inicio y Fin */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Controller name="fechaInicioTarea" control={control}
                  render={({ field, fieldState }) => (
                    <DateTimePicker label="Fecha Inicio Real" value={field.value} onChange={(date) => {field.onChange(date); trigger("fechaFinTarea");}} 
                        ampm={false}
                        slotProps={{ textField: { fullWidth: true, error: !!fieldState.error || !!errors.fechaInicioTarea, helperText: errors.fechaInicioTarea?.message || fieldState.error?.message, InputLabelProps:{shrink:true} } }}  disabled={loading}/>
                  )}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Controller name="fechaFinTarea" control={control}
                  render={({ field, fieldState }) => (
                    <DateTimePicker label="Fecha Fin Real" value={field.value} onChange={(date) => field.onChange(date)} 
                        minDateTime={getValues("fechaInicioTarea") || undefined}
                        slotProps={{ textField: { fullWidth: true, error: !!fieldState.error || !!errors.fechaFinTarea, helperText: errors.fechaFinTarea?.message || fieldState.error?.message, InputLabelProps:{shrink:true} } }} disabled={loading}/>
                  )}
                />
              </Box>
            </Box>

            {/* Fila 4: Duraciones */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Controller name="duracionEstimadaTareaObj" control={control}
                  render={({ field, fieldState }) => (
                    <TimePicker label="Duración Estimada (HH:MM)" value={field.value} onChange={(time) => field.onChange(time)} ampm={false} views={['hours', 'minutes']}
                        slotProps={{ textField: { fullWidth: true, error: !!fieldState.error || !!errors.duracionEstimadaTareaObj, helperText: errors.duracionEstimadaTareaObj?.message || fieldState.error?.message, InputLabelProps:{shrink:true} } }} disabled={loading} />
                  )}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Controller name="duracionRealTareaObj" control={control}
                  render={({ field, fieldState }) => (
                    <TimePicker label="Duración Real (HH:MM)" value={field.value} onChange={(time) => field.onChange(time)} ampm={false} views={['hours', 'minutes']}
                        slotProps={{ textField: { fullWidth: true, error: !!fieldState.error|| !!errors.duracionRealTareaObj, helperText: errors.duracionRealTareaObj?.message || fieldState.error?.message, InputLabelProps:{shrink:true} } }} disabled={loading} />
                  )}
                />
              </Box>
            </Box>
            
            {/* Fila 5: Observaciones */}
            <Box sx={{ mb: 2 }}>
              <Controller
                name="observacionesTarea"
                control={control}
                render={({ field }) => (
                    <TextField {...field} fullWidth label="Observaciones (Opcional)" multiline rows={3} error={!!errors.observacionesTarea} helperText={errors.observacionesTarea?.message} disabled={loading}/>
                )}
               />
            </Box>
            {/* DialogActions se moverá fuera del <Box component="form"> para que el submit del form lo active el botón */}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseModal} color="inherit" disabled={loading}>Cancelar</Button>
          <Button 
            variant="contained" 
            onClick={handleSubmit(handleFormSubmitInternal)} // handleSubmit aquí
            disabled={loading || !isDirty} 
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </DialogActions>
      </Dialog>
      </LocalizationProvider>
      <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};
export default ProductionTaskEditModal;

// Implementación de isBefore usando date-fns
function isBefore(fechaFinTarea: Date, fechaInicioTarea: Date) {
  // Devuelve true si fechaFinTarea es antes que fechaInicioTarea
  return fechaFinTarea.getTime() < fechaInicioTarea.getTime();
}

