// src/features/productionOrders/components/ProductionOrderHeaderEditModal.tsx
import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
    CircularProgress, Alert, Snackbar, MenuItem, Box, Typography
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale/es';
import type { ProductionOrderHeaderUpdateRequest } from '../../../types/productionOrder.types';
import type { ProductionOrderDetails } from '../../../types/productionOrder.types';
import { updateProductionOrderHeader } from '../../../api/productionOrderService';
import type { ApiErrorResponseDTO } from '../../../types/error.types';
import { formatISO, parseISO, isValid } from 'date-fns';

interface ProductionOrderHeaderEditModalProps {
    open: boolean;
    onClose: () => void;
    orderData: ProductionOrderDetails;
    onOrderHeaderUpdated: () => void;
}

const ProductionOrderHeaderEditModal: React.FC<ProductionOrderHeaderEditModalProps> = ({
    open,
    onClose,
    orderData,
    onOrderHeaderUpdated,
}) => {
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info'>('success');
    const [localFechaInicioProduccion, setLocalFechaInicioProduccion] = useState<Date | null>(null);
    const [localFechaFinEstimadaProduccion, setLocalFechaFinEstimadaProduccion] = useState<Date | null>(null);
    const [localFechaFinRealProduccion, setLocalFechaFinRealProduccion] = useState<Date | null>(null);
    const [localEstadoProduccion, setLocalEstadoProduccion] = useState<ProductionOrderHeaderUpdateRequest['estadoProduccion'] | ''>(orderData?.estadoProduccion as ProductionOrderHeaderUpdateRequest['estadoProduccion'] | '' || '');
    const [localObservacionesProduccion, setLocalObservacionesProduccion] = useState<string | null>(orderData?.observacionesProduccion || null);
    const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

    const {
        control,
        register,
        handleSubmit,
        formState: { isDirty },
        reset,
        watch, // Para observar fechas si es necesario para lógica condicional
        trigger, // Para re-validar
        getValues, // Para obtener valores para validaciones cruzadas
    } = useForm<ProductionOrderHeaderUpdateRequest>({
        defaultValues: {},
    });

    const watchedFechaInicio = watch('fechaInicioProduccion');
    const watchedFechaFinEstimada = watch('fechaFinEstimadaProduccion');


    useEffect(() => {
        if (orderData && open) {
            setLocalFechaInicioProduccion(orderData.fechaInicioProduccion ? parseISO(String(orderData.fechaInicioProduccion)) : null);
            setLocalFechaFinEstimadaProduccion(orderData.fechaFinEstimadaProduccion ? parseISO(String(orderData.fechaFinEstimadaProduccion)) : null);
            setLocalFechaFinRealProduccion(orderData.fechaFinRealProduccion ? parseISO(String(orderData.fechaFinRealProduccion)) : null);
            setLocalEstadoProduccion(orderData.estadoProduccion as ProductionOrderHeaderUpdateRequest['estadoProduccion'] || '');
            setLocalObservacionesProduccion(orderData.observacionesProduccion || null);
        }
        if (!open) {
            setFormError(null); // Limpiar errores cuando se cierra
            setValidationErrors({});
        }
    }, [orderData, open]);

    const handleFechaInicioProduccionChange = (date: Date | null) => {
        setLocalFechaInicioProduccion(date);
    };

    const handleFechaFinEstimadaProduccionChange = (date: Date | null) => {
        setLocalFechaFinEstimadaProduccion(date);
    };

    const handleFechaFinRealProduccionChange = (date: Date | null) => {
        setLocalFechaFinRealProduccion(date);
    };

    const handleEstadoProduccionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setLocalEstadoProduccion(event.target.value as ProductionOrderHeaderUpdateRequest['estadoProduccion']);
    };

    const handleObservacionesProduccionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setLocalObservacionesProduccion(event.target.value);
    };


    const handleFormSubmit = async () => {
        if (!open) return;

        const dataToValidate = {
            fechaInicioProduccion: localFechaInicioProduccion,
            fechaFinEstimadaProduccion: localFechaFinEstimadaProduccion,
            fechaFinRealProduccion: localFechaFinRealProduccion,
            estadoProduccion: localEstadoProduccion === '' ? undefined : localEstadoProduccion,
            observacionesProduccion: localObservacionesProduccion,
        };

        const currentValidationErrors: { [key: string]: string } = {};
        if (dataToValidate.fechaInicioProduccion && !isValid(dataToValidate.fechaInicioProduccion)) {
            currentValidationErrors.fechaInicioProduccion = 'Fecha de inicio inválida.';
        }
        if (dataToValidate.fechaFinEstimadaProduccion && !isValid(dataToValidate.fechaFinEstimadaProduccion)) {
            currentValidationErrors.fechaFinEstimadaProduccion = 'Fecha de fin estimada inválida.';
        }
        if (dataToValidate.fechaFinEstimadaProduccion && dataToValidate.fechaInicioProduccion && dataToValidate.fechaFinEstimadaProduccion <= dataToValidate.fechaInicioProduccion) {
            currentValidationErrors.fechaFinEstimadaProduccion = 'La fecha de fin estimada no puede ser anterior o igual a la fecha de inicio.';
        }
        if (dataToValidate.fechaFinRealProduccion && dataToValidate.fechaInicioProduccion && dataToValidate.fechaFinRealProduccion <= dataToValidate.fechaInicioProduccion) {
            currentValidationErrors.fechaFinRealProduccion = 'La fecha de fin real no puede ser anterior o igual a la fecha de inicio.';
        }
        if (dataToValidate.fechaFinRealProduccion && dataToValidate.fechaFinRealProduccion > new Date()) {
            currentValidationErrors.fechaFinRealProduccion = 'La fecha de fin real no puede ser futura.';
        }
        if (!dataToValidate.estadoProduccion) {
            currentValidationErrors.estadoProduccion = 'El estado es requerido.';
        }

        setValidationErrors(currentValidationErrors);

        if (Object.keys(currentValidationErrors).length > 0) {
            return;
        }


        const isFormDirty =
            (orderData.fechaInicioProduccion ? parseISO(String(orderData.fechaInicioProduccion))?.toISOString() : null) !== (localFechaInicioProduccion ? localFechaInicioProduccion.toISOString().split('T')[0] : null) ||
            (orderData.fechaFinEstimadaProduccion ? parseISO(String(orderData.fechaFinEstimadaProduccion))?.toISOString() : null) !== (localFechaFinEstimadaProduccion ? localFechaFinEstimadaProduccion.toISOString().split('T')[0] : null) ||
            (orderData.fechaFinRealProduccion ? parseISO(String(orderData.fechaFinRealProduccion))?.toISOString() : null) !== (localFechaFinRealProduccion ? localFechaFinRealProduccion.toISOString().split('T')[0] : null) ||
            orderData.estadoProduccion !== localEstadoProduccion ||
            orderData.observacionesProduccion !== localObservacionesProduccion;


        if (!isFormDirty) {
            setSnackbarMessage("No se realizaron cambios.");
            setSnackbarSeverity('info');
            setSnackbarOpen(true);
            onClose();
            return;
        }
        setLoading(true);
        setFormError(null);

        const payload: ProductionOrderHeaderUpdateRequest = {
            fechaInicioProduccion: localFechaInicioProduccion ? formatISO(localFechaInicioProduccion, { representation: 'date' }) : null,
            fechaFinEstimadaProduccion: localFechaFinEstimadaProduccion ? formatISO(localFechaFinEstimadaProduccion, { representation: 'date' }) : null,
            fechaFinRealProduccion: localFechaFinRealProduccion ? formatISO(localFechaFinRealProduccion, { representation: 'date' }) : null,
            estadoProduccion: localEstadoProduccion === '' ? undefined : localEstadoProduccion,
            observacionesProduccion: localObservacionesProduccion || null,
        };

        try {
            await updateProductionOrderHeader(orderData.idOrdenProduccion, payload);
            setSnackbarMessage('Cabecera de la O.P. actualizada exitosamente.');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            onOrderHeaderUpdated();
            onClose();
        } catch (err: any) {
            console.error("Error al actualizar cabecera de O.P.:", err);
            const apiError = err as ApiErrorResponseDTO;
            setFormError(apiError?.message || 'Error al actualizar la cabecera.');
        } finally {
            setLoading(false);
        }
    };

    const handleCloseModal = () => {
        if (!loading) {
            onClose();
        }
    };
    const handleCloseSnackbar = () => setSnackbarOpen(false);

    const allowedStates: Array<ProductionOrderHeaderUpdateRequest['estadoProduccion']> = ['Pendiente', 'En Proceso', 'Terminada', 'Retrasada', 'Anulada'];
    // Lógica para deshabilitar estados según el estado actual
    const isStateChangeDisabled = (currentState: string, newState: string | undefined) => {
        if (!newState) return false; // Si no se intenta cambiar, no está deshabilitado
        if (currentState === 'Terminada' && newState !== 'Terminada') return true;
        if (currentState === 'Anulada' && newState !== 'Anulada') return true;
        // Añadir más reglas si es necesario
        return false;
    };


    return (
        <>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                <Dialog open={open} onClose={handleCloseModal} maxWidth="sm" fullWidth disableEscapeKeyDown={loading}>
                    <DialogTitle>Editar Cabecera de Orden de Producción #{orderData.idOrdenProduccion}</DialogTitle>
                    <DialogContent>
                        <Typography variant="subtitle1" gutterBottom>
                            Orden de Venta Asoc.: <strong>#{orderData.ordenVenta.idOrdenVenta}</strong> ({orderData.ordenVenta.clienteNombre})
                        </Typography>
                        {formError && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{formError}</Alert>}
                        <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate sx={{ mt: 2 }}>
                            <Box sx={{ mb: 2 }}>
                                <DatePicker
                                    label="Fecha Inicio Producción"
                                    value={localFechaInicioProduccion}
                                    onChange={handleFechaInicioProduccionChange}
                                    slotProps={{ textField: { fullWidth: true, error: !!validationErrors.fechaInicioProduccion, helperText: validationErrors.fechaInicioProduccion, InputLabelProps: { shrink: true } } }}
                                    disabled={loading}
                                />
                            </Box>
                            <Box sx={{ mb: 2 }}>
                                <DatePicker
                                    label="Fecha Fin Estimada"
                                    value={localFechaFinEstimadaProduccion}
                                    onChange={handleFechaFinEstimadaProduccionChange}
                                    minDate={localFechaInicioProduccion || undefined}
                                    slotProps={{ textField: { fullWidth: true, error: !!validationErrors.fechaFinEstimadaProduccion, helperText: validationErrors.fechaFinEstimadaProduccion, InputLabelProps: { shrink: true } } }}
                                    disabled={loading || !localFechaInicioProduccion}
                                />
                            </Box>
                            <Box sx={{ mb: 2 }}>
                                <DatePicker
                                    label="Fecha Fin Real"
                                    value={localFechaFinRealProduccion}
                                    onChange={handleFechaFinRealProduccionChange}
                                    maxDate={new Date()}
                                    minDate={localFechaInicioProduccion ?? undefined}
                                    slotProps={{ textField: { fullWidth: true, error: !!validationErrors.fechaFinRealProduccion, helperText: validationErrors.fechaFinRealProduccion, InputLabelProps: { shrink: true } } }}
                                    disabled={loading}
                                />
                            </Box>
                            <Box sx={{ mb: 2 }}>
                                <TextField
                                    select
                                    required
                                    fullWidth
                                    label="Estado de la Orden"
                                    value={localEstadoProduccion}
                                    onChange={handleEstadoProduccionChange}
                                    error={!!validationErrors.estadoProduccion}
                                    helperText={validationErrors.estadoProduccion}
                                    disabled={loading || isStateChangeDisabled(orderData.estadoProduccion, localEstadoProduccion)}
                                >
                                    {allowedStates.map((stateOption) => (
                                        <MenuItem
                                            key={stateOption}
                                            value={stateOption}
                                            disabled={isStateChangeDisabled(orderData.estadoProduccion, stateOption)}
                                        >
                                            {stateOption}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Box>
                            <TextField
                                fullWidth
                                id="observacionesProduccionEdit"
                                label="Observaciones (Opcional)"
                                multiline
                                rows={3}
                                value={localObservacionesProduccion}
                                onChange={handleObservacionesProduccionChange}
                                disabled={loading}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2 }}>
                        <Button onClick={handleCloseModal} color="inherit" disabled={loading}>Cancelar</Button>
                        <Button
                            type="submit"
                            variant="contained"
                            onClick={handleFormSubmit}
                            disabled={loading}
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

export default ProductionOrderHeaderEditModal;