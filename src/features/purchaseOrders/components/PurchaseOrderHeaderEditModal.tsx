// src/features/purchaseOrders/components/PurchaseOrderHeaderEditModal.tsx
import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
// yupResolver y yup eliminados
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  CircularProgress, Alert, Snackbar, MenuItem, Box, Typography
  // Grid eliminado
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale/es';
import type { PurchaseOrderHeaderUpdateRequest, PurchaseOrderDetails } from '../../../types/purchaseOrder.types';
import { updatePurchaseOrderHeader } from '../../../api/purchaseOrderService';
import type { ApiErrorResponseDTO } from '../../../types/error.types';
import { formatISO, parseISO, isValid, isBefore, startOfDay } from 'date-fns'; // isEqual no es necesario aquí

// purchaseOrderHeaderSchema eliminado

interface PurchaseOrderHeaderEditModalProps {
  open: boolean;
  onClose: () => void;
  orderData: PurchaseOrderDetails;
  onOrderHeaderUpdated: () => void;
}

const PurchaseOrderHeaderEditModal: React.FC<PurchaseOrderHeaderEditModalProps> = ({
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

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    getValues, // Para validación cruzada manual en onSubmit
    setError,  // Para establecer errores manualmente
    clearErrors, // Para limpiar errores
    trigger, // Para revalidar campos programáticamente
  } = useForm<PurchaseOrderHeaderUpdateRequest>({
    // resolver: yupResolver(purchaseOrderHeaderSchema) ELIMINADO
    defaultValues: {}, 
  });
  
  // Normalizamos las fechas para comparaciones consistentes (ignoran la hora)
  const todayNormalized = startOfDay(new Date());
  const yesterdayNormalized = startOfDay(new Date(new Date().setDate(new Date().getDate() -1)));

  useEffect(() => {
    if (orderData && open) {
      reset({
        // Los DatePickers esperan objetos Date o null, pero el tipo del formulario espera string | null | undefined.
        // Por lo tanto, pasamos los valores originales (string o null).
        fechaEntregaEstimadaCompra: orderData.fechaEntregaEstimadaCompra || null,
        fechaEntregaRealCompra: orderData.fechaEntregaRealCompra || null,
        estadoCompra: orderData.estadoCompra as PurchaseOrderHeaderUpdateRequest['estadoCompra'],
        observacionesCompra: orderData.observacionesCompra || '',
      });
      clearErrors(); // Limpiar errores de validaciones previas al abrir
      setFormError(null); // Limpiar error general del formulario
    }
    if (!open) { // Limpiar errores si el modal se cierra externamente
        setFormError(null);
        clearErrors();
    }
  }, [orderData, open, reset, clearErrors]);

  const handleFormSubmit: SubmitHandler<PurchaseOrderHeaderUpdateRequest> = async (data) => {
    if (!isDirty) {
      setSnackbarMessage("No se realizaron cambios.");
      setSnackbarSeverity('info');
      setSnackbarOpen(true);
      onClose();
      return;
    }
    setLoading(true);
    setFormError(null);
    clearErrors();

    // Validaciones manuales adicionales (como doble chequeo o para lógicas complejas)
    // Las 'rules' en Controller ya deberían haber manejado las validaciones principales
    let clientValidationFailed = false;
    const fechaEstimadaValue = data.fechaEntregaEstimadaCompra
      ? startOfDay(
          typeof data.fechaEntregaEstimadaCompra === 'string'
            ? parseISO(data.fechaEntregaEstimadaCompra)
            : (data.fechaEntregaEstimadaCompra as Date)
        )
      : null;
    const fechaRealValue = data.fechaEntregaRealCompra
      ? startOfDay(
          typeof data.fechaEntregaRealCompra === 'string'
            ? parseISO(data.fechaEntregaRealCompra)
            : (data.fechaEntregaRealCompra as Date)
        )
      : null;

    if (fechaEstimadaValue) {
        if (!isValid(fechaEstimadaValue)) {
             setError("fechaEntregaEstimadaCompra", { type: "manual", message: "Fecha estimada inválida." }); clientValidationFailed = true;
        } else if (isBefore(fechaEstimadaValue, yesterdayNormalized)) { 
            setError("fechaEntregaEstimadaCompra", { type: "manual", message: "Fecha de entrega estimada no puede ser pasada."}); clientValidationFailed = true;
        }
    }

    if (fechaRealValue) {
        if (!isValid(fechaRealValue)) {
             setError("fechaEntregaRealCompra", { type: "manual", message: "Fecha real inválida."}); clientValidationFailed = true;
        } else if (isBefore(todayNormalized, fechaRealValue)) { 
             setError("fechaEntregaRealCompra", { type: "manual", message: "La fecha de entrega real no puede ser futura."}); clientValidationFailed = true;
        }
        // Validación cruzada importante: fecha real no antes que estimada
        if (fechaEstimadaValue && isValid(fechaEstimadaValue) && isBefore(fechaRealValue, fechaEstimadaValue)) {
            setError("fechaEntregaRealCompra", { type: "manual", message: "La fecha real no puede ser anterior a la estimada."}); clientValidationFailed = true;
        }
    }

    if (!data.estadoCompra) { // Ya cubierto por rules.required
        setError("estadoCompra", { type: "manual", message: "El estado es requerido." }); clientValidationFailed = true;
    }
    if (data.observacionesCompra && data.observacionesCompra.length > 1000) { // Ya cubierto por register
        setError("observacionesCompra", { type: "manual", message: "Máximo 1000 caracteres." }); clientValidationFailed = true;
    }
    
    // Si hay errores (de rules o manuales), no continuar.
    if (clientValidationFailed || Object.keys(errors).length > 0) {
        setLoading(false);
        setFormError("Por favor, corrija los errores indicados en el formulario.");
        return;
    }

    const payload: PurchaseOrderHeaderUpdateRequest = {
      // Aseguramos que las fechas se envíen como YYYY-MM-DD string o null
      fechaEntregaEstimadaCompra: data.fechaEntregaEstimadaCompra
        ? formatISO(
            typeof data.fechaEntregaEstimadaCompra === 'string'
              ? parseISO(data.fechaEntregaEstimadaCompra)
              : data.fechaEntregaEstimadaCompra,
            { representation: 'date' }
          )
        : null,
      fechaEntregaRealCompra: data.fechaEntregaRealCompra
        ? formatISO(
            typeof data.fechaEntregaRealCompra === 'string'
              ? parseISO(data.fechaEntregaRealCompra)
              : data.fechaEntregaRealCompra,
            { representation: 'date' }
          )
        : null,
      estadoCompra: data.estadoCompra,
      observacionesCompra: data.observacionesCompra || null,
    };

    try {
      await updatePurchaseOrderHeader(orderData.idOrdenCompra, payload);
      setSnackbarMessage('Cabecera de la orden de compra actualizada exitosamente.');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      onOrderHeaderUpdated();
      onClose();
    } catch (err: any) {
      const backendErrorData = err.response?.data;
      console.error("Error al actualizar cabecera de orden de compra (datos del backend):", backendErrorData || err.message); 
      
      const apiError = backendErrorData as ApiErrorResponseDTO;
      let errorMessageToDisplay = "Error al actualizar la cabecera."; 

      if (apiError) {
        errorMessageToDisplay = apiError.message || errorMessageToDisplay;
        if (apiError.validationErrors && typeof apiError.validationErrors === 'object' && Object.keys(apiError.validationErrors).length > 0) {
          let specificFieldErrorsConcatenated = "";
          let successfullyMappedToFieldError = false;
          Object.entries(apiError.validationErrors).forEach(([field, message]) => {
            const messageStr = Array.isArray(message) ? message.join(', ') : String(message);
            const fieldKey = field as keyof PurchaseOrderHeaderUpdateRequest;
            if (fieldKey && control._fields[fieldKey]) { 
                 setError(fieldKey, { type: 'backend', message: messageStr });
                 successfullyMappedToFieldError = true;
            } else {
                specificFieldErrorsConcatenated += `\n- ${field}: ${messageStr}`;
            }
          });
          if (successfullyMappedToFieldError && !specificFieldErrorsConcatenated) {
            errorMessageToDisplay = "Error de validación del servidor. Revise los campos marcados.";
          } else if (specificFieldErrorsConcatenated) {
             errorMessageToDisplay = (apiError.message || "Error de validación del servidor:") + specificFieldErrorsConcatenated;
          } else if (Object.keys(apiError.validationErrors).length > 0 && !successfullyMappedToFieldError && !specificFieldErrorsConcatenated) {
             errorMessageToDisplay = apiError.message || "Errores de validación del servidor detectados.";
           }
        } else if (apiError.details && typeof apiError.details === 'string') {
            errorMessageToDisplay += ` Detalles: ${apiError.details}`;
        }
      } else if (err.message) {
        errorMessageToDisplay = err.message;
      }
      setFormError(errorMessageToDisplay);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCloseModal = () => {
    if (!loading) {
      onClose();
      clearErrors(); 
      setFormError(null);
    }
  };
  const handleCloseSnackbar = () => setSnackbarOpen(false);

  const allowedStates: Array<PurchaseOrderHeaderUpdateRequest['estadoCompra']> = ['Pendiente', 'Enviada', 'Recibida Parcial', 'Recibida Total', 'Anulada'];

  return (
    <>
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Dialog open={open} onClose={handleCloseModal} maxWidth="sm" fullWidth disableEscapeKeyDown={loading}>
        <DialogTitle>Editar Cabecera de Orden de Compra #{orderData.idOrdenCompra}</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" gutterBottom>
            Proveedor: <strong>{orderData.proveedor.nombreComercialProveedor}</strong>
          </Typography>
          {formError && <Alert severity="error" sx={{ mb: 2, mt: 1 }} onClose={() => setFormError(null)}>{formError}</Alert>}
          
          <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate sx={{ mt: 2 }}>
            {/* Layout con Box en lugar de Grid */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
              <Box sx={{ width: { xs: '100%', sm: '50%' } }}>
                <Controller
                  name="fechaEntregaEstimadaCompra"
                  control={control}
                  rules={{ // Validaciones basadas en el schema Yup original
                    validate: (value: string | null | undefined) => {
                      if (!value) return true; // Opcional y nullable
                      const dateValue = typeof value === 'string' ? parseISO(value) : value;
                      if (!isValid(dateValue)) return 'Fecha inválida.'; // typeError
                      return !isBefore(startOfDay(dateValue), yesterdayNormalized) ||
                             'Fecha de entrega estimada no puede ser pasada.';
                    }
                  }}
                  render={({ field, fieldState }) => (
                    <DatePicker
                      label="Fecha Entrega Estimada"
                      value={
                        typeof field.value === 'string'
                          ? (field.value ? parseISO(field.value) : null)
                          : field.value
                      }
                      onChange={(date: Date | null) => {
                        field.onChange(date); 
                        trigger("fechaEntregaRealCompra"); // Para revalidar fecha real
                      }}
                      minDate={new Date(new Date().setDate(new Date().getDate() -1))} // Guía visual
                      slotProps={{ 
                        textField: { 
                            fullWidth: true, 
                            error: !!fieldState.error || !!errors.fechaEntregaEstimadaCompra,
                            helperText: errors.fechaEntregaEstimadaCompra?.message || fieldState.error?.message,
                            InputLabelProps: { shrink: true }
                        },
                      }}
                      disabled={loading}
                    />
                  )}
                />
              </Box>
              <Box sx={{ width: { xs: '100%', sm: '50%' } }}>
                <Controller
                  name="fechaEntregaRealCompra"
                  control={control}
                  rules={{
                    validate: (value: string | null | undefined) => {
                        if (!value) return true; // Opcional
                        const dateValue = typeof value === 'string' ? parseISO(value) : value;
                        if (!isValid(dateValue)) return "Fecha real inválida."; // typeError

                        // .max(new Date(), 'La fecha de entrega real no puede ser futura.')
                        if (isBefore(todayNormalized, startOfDay(dateValue))) { // Si hoy es antes que la fecha seleccionada
                            return 'La fecha de entrega real no puede ser futura.';
                        }
                        // Validación cruzada (importante mantenerla por lógica de negocio)
                        const fechaEstimadaValueRaw = getValues("fechaEntregaEstimadaCompra") as string | null | undefined;
                        const fechaEstimadaValue = typeof fechaEstimadaValueRaw === 'string' ? parseISO(fechaEstimadaValueRaw) : fechaEstimadaValueRaw;
                        if (fechaEstimadaValue && isValid(fechaEstimadaValue) && isBefore(startOfDay(dateValue), startOfDay(fechaEstimadaValue))) {
                            return 'La fecha real no puede ser anterior a la estimada.';
                        }
                        return true;
                    }
                  }}
                  render={({ field, fieldState }) => {
                    const fechaEstimadaValue = getValues("fechaEntregaEstimadaCompra") as Date | null;
                    let minDateForRealPicker: Date | undefined = undefined;
                    if (fechaEstimadaValue && isValid(fechaEstimadaValue)) {
                        // Solo restringir visualmente si la fecha estimada no es futura
                        if (!isBefore(todayNormalized, startOfDay(fechaEstimadaValue))) {
                             minDateForRealPicker = fechaEstimadaValue;
                        }
                    }                  
                    return (
                        <DatePicker
                        label="Fecha Entrega Real"
                        value={
                          typeof field.value === 'string'
                            ? (field.value ? parseISO(field.value) : null)
                            : field.value
                        }
                        onChange={(date: Date | null) => {
                            field.onChange(date);
                        }}
                        maxDate={new Date()} // Guía visual
                        minDate={minDateForRealPicker} // Guía visual ajustada
                        slotProps={{
                            textField: { 
                                fullWidth: true, 
                                error: !!fieldState.error || !!errors.fechaEntregaRealCompra,
                                helperText: errors.fechaEntregaRealCompra?.message || fieldState.error?.message,
                                InputLabelProps: { shrink: true }
                            },
                        }}
                        disabled={loading}
                        />
                    );
                  }}
                />
              </Box>
            </Box>

            <Box sx={{ mb: 2 }}>
                <Controller
                  name="estadoCompra"
                  control={control}
                  rules={{ required: "El estado es requerido." }} // Replicando .required()
                  defaultValue={orderData.estadoCompra as PurchaseOrderHeaderUpdateRequest['estadoCompra']}
                  render={({ field }) => (
                      <TextField
                          {...field}
                          select
                          required // Para el asterisco visual
                          fullWidth
                          label="Estado de la Orden"
                          error={!!errors.estadoCompra}
                          helperText={errors.estadoCompra?.message}
                          disabled={loading}
                      >
                          {/* oneOf se maneja por las opciones del MenuItem */}
                          {allowedStates.map((stateOption) => (
                          <MenuItem key={stateOption} value={stateOption}>
                              {stateOption}
                          </MenuItem>
                          ))}
                      </TextField>
                  )}
                />
            </Box>

            <Box>
              <TextField
                fullWidth
                id="observacionesCompraEdit"
                label="Observaciones (Opcional)"
                multiline
                rows={3}
                {...register('observacionesCompra', { // Replicando .max(1000, ...)
                    maxLength: {value: 1000, message: "Las observaciones no pueden exceder los 1000 caracteres."}
                })}
                error={!!errors.observacionesCompra}
                helperText={errors.observacionesCompra?.message}
                disabled={loading}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseModal} color="inherit" disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            onClick={handleSubmit(handleFormSubmit)} 
            disabled={loading || !isDirty}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </DialogActions>
      </Dialog>
      </LocalizationProvider>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }} variant="filled">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default PurchaseOrderHeaderEditModal;