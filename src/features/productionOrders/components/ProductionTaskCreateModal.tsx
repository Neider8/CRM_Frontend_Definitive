// src/features/productionOrders/components/ProductionTaskCreateModal.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import {
    Dialog, DialogTitle, DialogContent, Button, TextField,
    CircularProgress, Alert, Snackbar, Autocomplete, Box
} from '@mui/material';
import type { ProductionTaskCreateRequest } from '../../../types/productionOrder.types';
import type { EmpleadoSummary } from '../../../types/employee.types';
import { addTaskToProductionOrder } from '../../../api/productionOrderService';
import { getAllEmployees } from '../../../api/employeeService'; // Para obtener lista de empleados
import type { ApiErrorResponseDTO } from '../../../types/error.types';

interface ProductionTaskFormInputs {
    nombreTarea: string;
    idEmpleado: EmpleadoSummary | null; // Autocomplete usa objeto
    duracionEstimadaTareaHoras?: number; // Separado para UI
    duracionEstimadaTareaMinutos?: number; // Separado para UI
    observacionesTarea?: string | null;
}

interface ProductionTaskCreateModalProps {
    open: boolean;
    onClose: () => void;
    orderProductionId: number;
    onTaskCreated: () => void; // Callback para refrescar
}

const ProductionTaskCreateModal: React.FC<ProductionTaskCreateModalProps> = ({
    open,
    onClose,
    orderProductionId,
    onTaskCreated,
}) => {
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
    const [employeesList, setEmployeesList] = useState<EmpleadoSummary[]>([]);
    const [employeesLoading, setEmployeesLoading] = useState(false);
    const [localNombreTarea, setLocalNombreTarea] = useState('');
    const [localIdEmpleado, setLocalIdEmpleado] = useState<EmpleadoSummary | null>(null);
    const [localDuracionEstimadaTareaHoras, setLocalDuracionEstimadaTareaHoras] = useState<number | undefined>(undefined);
    const [localDuracionEstimadaTareaMinutos, setLocalDuracionEstimadaTareaMinutos] = useState<number | undefined>(undefined);
    const [localObservacionesTarea, setLocalObservacionesTarea] = useState<string | null>(null);

    const {
        control,
        register,
        handleSubmit,
        formState: { },
        reset,
    } = useForm<ProductionTaskFormInputs>({
        defaultValues: {
            nombreTarea: '',
            idEmpleado: null,
            duracionEstimadaTareaHoras: undefined,
            duracionEstimadaTareaMinutos: undefined,
            observacionesTarea: '',
        },
    });

    const fetchEmployees = useCallback(async () => {
        if(open){
            setEmployeesLoading(true);
            setFormError(null);
            try {
            const employeesPage = await getAllEmployees({ size: 1000 }); // Ajustar paginación si es necesario
            setEmployeesList(employeesPage.content.map(emp => ({
                idEmpleado: emp.idEmpleado,
                nombreEmpleado: emp.nombreEmpleado,
                numeroDocumento: emp.numeroDocumento,
            })));
            } catch (err) {
            console.error("Error cargando empleados:", err);
            setFormError("No se pudieron cargar los empleados disponibles.");
            } finally {
            setEmployeesLoading(false);
            }
        }
    }, [open]);

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    useEffect(() => {
        if (!open) {
            reset(); // Resetear formulario cuando el modal se cierra
            setFormError(null);
            setValidationErrors({});
            setLocalNombreTarea('');
            setLocalIdEmpleado(null);
            setLocalDuracionEstimadaTareaHoras(undefined);
            setLocalDuracionEstimadaTareaMinutos(undefined);
            setLocalObservacionesTarea(null);
        } else {
            reset({
                nombreTarea: localNombreTarea,
                idEmpleado: localIdEmpleado,
                duracionEstimadaTareaHoras: localDuracionEstimadaTareaHoras,
                duracionEstimadaTareaMinutos: localDuracionEstimadaTareaMinutos,
                observacionesTarea: localObservacionesTarea,
            });
        }
    }, [open, reset, localNombreTarea, localIdEmpleado, localDuracionEstimadaTareaHoras, localDuracionEstimadaTareaMinutos, localObservacionesTarea]);

    const handleNombreTareaChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setLocalNombreTarea(event.target.value);
    };

    const handleEmpleadoChange = (_: any, newValue: EmpleadoSummary | null) => {
        setLocalIdEmpleado(newValue);
    };

    const handleDuracionEstimadaTareaHorasChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        // Si el campo está vacío, setea ""
        setLocalDuracionEstimadaTareaHoras(event.target.value === "" ? undefined : Number(event.target.value));
    };

    const handleDuracionEstimadaTareaMinutosChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setLocalDuracionEstimadaTareaMinutos(event.target.value === "" ? undefined : Number(event.target.value));
    };

    const handleObservacionesTareaChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setLocalObservacionesTarea(event.target.value);
    };

    const formatDuration = (hours?: number, minutes?: number): string | null => {
        const h = hours || 0;
        const m = minutes || 0;
        if (h === 0 && m === 0) return null; // Duración opcional
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;
    };

    const handleFormSubmit: SubmitHandler<ProductionTaskFormInputs> = async (data) => {
        if (!open) return;
        setLoading(true);
        setFormError(null);
        setValidationErrors({});

        const currentValidationErrors: { [key: string]: string } = {};
        if (!localNombreTarea) {
            currentValidationErrors.nombreTarea = 'El nombre de la tarea es requerido.';
        } else if (localNombreTarea.length > 100) {
            currentValidationErrors.nombreTarea = 'Máximo 100 caracteres.';
        }

        if (localDuracionEstimadaTareaHoras !== undefined && (isNaN(localDuracionEstimadaTareaHoras) || localDuracionEstimadaTareaHoras < 0 || !Number.isInteger(localDuracionEstimadaTareaHoras))) {
            currentValidationErrors.duracionEstimadaTareaHoras = 'Horas deben ser un número entero no negativo.';
        }

        if (localDuracionEstimadaTareaMinutos !== undefined && (isNaN(localDuracionEstimadaTareaMinutos) || localDuracionEstimadaTareaMinutos < 0 || localDuracionEstimadaTareaMinutos > 59 || !Number.isInteger(localDuracionEstimadaTareaMinutos))) {
            currentValidationErrors.duracionEstimadaTareaMinutos = 'Minutos deben ser un número entero entre 0 y 59.';
        }

        if ((localDuracionEstimadaTareaHoras === undefined || localDuracionEstimadaTareaHoras === 0) && (localDuracionEstimadaTareaMinutos === undefined || localDuracionEstimadaTareaMinutos === 0)) {
            // If both are 0, null or undefined, it's valid (duration optional)
        } else if ((localDuracionEstimadaTareaHoras === undefined || isNaN(localDuracionEstimadaTareaHoras) || localDuracionEstimadaTareaHoras < 0) &&
                   (localDuracionEstimadaTareaMinutos === undefined || isNaN(localDuracionEstimadaTareaMinutos) || localDuracionEstimadaTareaMinutos < 0 || localDuracionEstimadaTareaMinutos > 59)) {
            currentValidationErrors.duracionEstimada = 'Debe especificar al menos horas o minutos para la duración estimada.';
        }

        if (localObservacionesTarea && localObservacionesTarea.length > 500) {
            currentValidationErrors.observacionesTarea = 'Máximo 500 caracteres.';
        }

        setValidationErrors(currentValidationErrors);

        if (Object.keys(currentValidationErrors).length > 0) {
            setLoading(false);
            return;
        }

        const duracionEstimada = formatDuration(localDuracionEstimadaTareaHoras, localDuracionEstimadaTareaMinutos);

        const payload: ProductionTaskCreateRequest = {
            idOrdenProduccion: orderProductionId, // <--- AGREGADO
            idEmpleado: localIdEmpleado ? localIdEmpleado.idEmpleado : null,
            nombreTarea: localNombreTarea,
            duracionEstimadaTarea: duracionEstimada,
            observacionesTarea: localObservacionesTarea || null,
        };

        try {
            await addTaskToProductionOrder(orderProductionId, payload);
            setSnackbarMessage('Tarea de producción añadida exitosamente.');
            setSnackbarOpen(true);
            onTaskCreated();
            onClose();
        } catch (err: any) {
            console.error("Error al añadir tarea de producción:", err);
            const apiError = err as ApiErrorResponseDTO;
            setFormError(apiError?.message || 'Error al añadir la tarea.');
        } finally {
            setLoading(false);
        }
    };

    const handleCloseModal = () => {
        if (!loading) {
            onClose(); // El reset se maneja en useEffect
        }
    };
    const handleCloseSnackbar = () => setSnackbarOpen(false);

    return (
        <>
            <Dialog open={open} onClose={handleCloseModal} maxWidth="sm" fullWidth disableEscapeKeyDown={loading}>
                <DialogTitle>Añadir Nueva Tarea a O.P. #{orderProductionId}</DialogTitle>
                <DialogContent>
                    {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
                    <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate sx={{ mt: 1 }}>
                        <Box sx={{ mb: 2 }}>
                            <TextField
                                required
                                fullWidth
                                id="nombreTarea"
                                label="Nombre de la Tarea"
                                autoFocus
                                value={localNombreTarea}
                                onChange={handleNombreTareaChange}
                                error={!!validationErrors.nombreTarea}
                                helperText={validationErrors.nombreTarea}
                                disabled={loading}
                            />
                        </Box>
                        <Box sx={{ mb: 2 }}>
                            <Controller
                                name="idEmpleado"
                                control={control}
                                render={({ field }) => (
                                    <Autocomplete
                                        {...field}
                                        options={employeesList}
                                        loading={employeesLoading}
                                        getOptionLabel={(option) => option ? option.nombreEmpleado : ''}
                                        isOptionEqualToValue={(option, value) => option?.idEmpleado === value?.idEmpleado}
                                        onChange={handleEmpleadoChange}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Asignar Empleado (Opcional)"
                                                error={!!validationErrors.idEmpleado}
                                                helperText={validationErrors.idEmpleado}
                                                InputProps={{
                                                    ...params.InputProps,
                                                    endAdornment: (
                                                        <>
                                                            {employeesLoading ? <CircularProgress color="inherit" size={20} /> : null}
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
                        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                            <TextField
                                fullWidth
                                id="duracionEstimadaTareaHoras"
                                label="Duración Est. (Horas)"
                                type="number"
                                InputProps={{ inputProps: { min: 0, step: 1} }}
                                value={localDuracionEstimadaTareaHoras ?? ""} // <-- Solución: nunca undefined
                                onChange={handleDuracionEstimadaTareaHorasChange}
                                error={!!validationErrors.duracionEstimadaTareaHoras || !!validationErrors.duracionEstimada}
                                helperText={validationErrors.duracionEstimadaTareaHoras || validationErrors.duracionEstimada}
                                disabled={loading}
                            />
                            <TextField
                                fullWidth
                                id="duracionEstimadaTareaMinutos"
                                label="Duración Est. (Minutos)"
                                type="number"
                                InputProps={{ inputProps: { min: 0, max:59, step: 1} }}
                                value={localDuracionEstimadaTareaMinutos ?? ""} // <-- Solución: nunca undefined
                                onChange={handleDuracionEstimadaTareaMinutosChange}
                                error={!!validationErrors.duracionEstimadaTareaMinutos || !!validationErrors.duracionEstimada}
                                helperText={validationErrors.duracionEstimadaTareaMinutos || validationErrors.duracionEstimada}
                                disabled={loading}
                            />
                        </Box>
                        <TextField
                            fullWidth
                            id="observacionesTarea"
                            label="Observaciones (Opcional)"
                            multiline
                            rows={3}
                            value={localObservacionesTarea ?? ""} // <-- Solución: nunca null
                            onChange={handleObservacionesTareaChange}
                            error={!!validationErrors.observacionesTarea}
                            helperText={validationErrors.observacionesTarea}
                            disabled={loading}
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
                            <Button onClick={handleCloseModal} color="inherit" disabled={loading}>Cancelar</Button>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={loading || employeesLoading}
                                startIcon={loading ? <CircularProgress size={20} /> : null}
                            >
                                {loading ? 'Añadiendo...' : 'Añadir Tarea'}
                            </Button>
                        </Box>
                    </Box>
                </DialogContent>
            </Dialog>
            <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </>
    );
};

export default ProductionTaskCreateModal;