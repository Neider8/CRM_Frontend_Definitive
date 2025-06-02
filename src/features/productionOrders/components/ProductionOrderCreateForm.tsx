import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Box, TextField, Button, CircularProgress, Alert, Typography, Paper, Snackbar, Autocomplete
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale/es';
import type { ProductionOrderCreateRequest } from '../../../types/productionOrder.types';
import type { SalesOrderSummary } from '../../../types/salesOrder.types';
import { createProductionOrder } from '../../../api/productionOrderService';
import { getAllSalesOrders } from '../../../api/salesOrderService';
import { useNavigate } from 'react-router-dom';
import type { ApiErrorResponseDTO } from '../../../types/error.types';
import { formatISO, parseISO, format } from 'date-fns';

interface ProductionOrderFormInputs {
  ordenVenta: SalesOrderSummary | null;
  fechaInicioProduccion?: Date | null;
  fechaFinEstimadaProduccion?: Date | null;
  observacionesProduccion?: string | null;
}

const ProductionOrderCreateForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [salesOrders, setSalesOrders] = useState<SalesOrderSummary[]>([]);
  const [salesOrdersLoading, setSalesOrdersLoading] = useState(false);

  const navigate = useNavigate();

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<ProductionOrderFormInputs>({
    defaultValues: {
      ordenVenta: null,
      fechaInicioProduccion: null,
      fechaFinEstimadaProduccion: null,
      observacionesProduccion: '',
    }
  });

  const watchedFechaInicio = watch('fechaInicioProduccion');

  const fetchSalesOrders = useCallback(async () => {
    setSalesOrdersLoading(true);
    try {
      const response = await getAllSalesOrders({ size: 1000, sort: 'fechaPedido,desc' });
      const confirmadas = response.content
        .filter(order => order.estadoOrden === 'Confirmada' || order.estadoOrden === 'En Producción')
        .map(order => ({
            idOrdenVenta: order.idOrdenVenta,
            clienteNombre: order.cliente.nombreCliente,
            fechaPedido: order.fechaPedido,
        }));
      setSalesOrders(confirmadas);
    } catch (err) {
      setFormError("Error al cargar órdenes de venta confirmadas.");
    } finally {
      setSalesOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSalesOrders();
  }, [fetchSalesOrders]);

  const onSubmit = async (data: ProductionOrderFormInputs) => {
    if (!data.ordenVenta) {
      setFormError("Debe seleccionar una orden de venta.");
      return;
    }
    setLoading(true);
    setFormError(null);
    setSnackbarMessage('');

    const payload: ProductionOrderCreateRequest = {
      idOrdenVenta: data.ordenVenta.idOrdenVenta,
      fechaInicioProduccion: data.fechaInicioProduccion ? formatISO(data.fechaInicioProduccion, { representation: 'date' }) : null,
      fechaFinEstimadaProduccion: data.fechaFinEstimadaProduccion ? formatISO(data.fechaFinEstimadaProduccion, { representation: 'date' }) : null,
      observacionesProduccion: data.observacionesProduccion || null,
    };

    try {
      const newProductionOrder = await createProductionOrder(payload);
      setSnackbarMessage(`Orden de Producción #${newProductionOrder.idOrdenProduccion} creada exitosamente.`);
      setSnackbarOpen(true);
      reset();
      setTimeout(() => {
        navigate('/ordenes-produccion');
      }, 2500);
    } catch (err: any) {
      const apiError = err as ApiErrorResponseDTO;
      let displayError = 'Error al crear la orden de producción.';
      if (apiError && typeof apiError.message === 'string') {
        displayError = apiError.message;
      }
      setFormError(displayError);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => setSnackbarOpen(false);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 3 } }}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Typography variant="h6" component="h2" gutterBottom>
            Crear Nueva Orden de Producción
          </Typography>
          {formError && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setFormError(null)}>{formError}</Alert>}

          <Box sx={{ mb: 2 }}>
            <Controller
              name="ordenVenta"
              control={control}
              rules={{ required: "La orden de venta es requerida." }}
              render={({ field }) => (
                <Autocomplete
                  {...field}
                  options={salesOrders}
                  loading={salesOrdersLoading}
                  getOptionLabel={(option) => option ? `OV #${option.idOrdenVenta} - ${option.clienteNombre} (${format(parseISO(option.fechaPedido), 'dd/MM/yy')})` : ''}
                  isOptionEqualToValue={(option, value) => option?.idOrdenVenta === value?.idOrdenVenta}
                  onChange={(_, newValue) => field.onChange(newValue)}
                  renderInput={(params) => (
                    <TextField 
                        {...params} 
                        required 
                        label="Seleccionar Orden de Venta (Confirmada)" 
                        error={!!errors.ordenVenta} 
                        helperText={errors.ordenVenta?.message} 
                        InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {salesOrdersLoading ? <CircularProgress color="inherit" size={20} /> : null}
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

          <Box sx={{ mb: 2 }}>
            <Controller
              name="fechaInicioProduccion"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="Fecha Inicio Producción (Opcional)"
                  value={field.value}
                  onChange={(date) => field.onChange(date)}
                  slotProps={{
                    textField: { 
                        fullWidth: true, 
                        InputLabelProps: { shrink: true } 
                    },
                  }}
                  disabled={loading}
                />
              )}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Controller
              name="fechaFinEstimadaProduccion"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="Fecha Fin Estimada Producción (Opcional)"
                  value={field.value}
                  onChange={(date) => field.onChange(date)}
                  minDate={watchedFechaInicio ? new Date(new Date(watchedFechaInicio).setDate(new Date(watchedFechaInicio).getDate() + 1)) : undefined}
                  slotProps={{
                    textField: { 
                        fullWidth: true, 
                        InputLabelProps: { shrink: true }
                    },
                  }}
                  disabled={loading || !watchedFechaInicio}
                />
              )}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              label="Observaciones (Opcional)"
              multiline
              rows={3}
              {...register('observacionesProduccion')}
              disabled={loading}
            />
          </Box>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button variant="outlined" onClick={() => navigate('/ordenes-produccion')} disabled={loading}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading || salesOrdersLoading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {loading ? 'Creando...' : 'Crear Orden de Producción'}
            </Button>
          </Box>
        </Box>
        <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Paper>
    </LocalizationProvider>
  );
};

export default ProductionOrderCreateForm;