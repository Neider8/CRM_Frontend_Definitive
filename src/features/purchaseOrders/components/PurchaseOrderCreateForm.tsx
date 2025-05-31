// src/features/purchaseOrders/components/PurchaseOrderCreateForm.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller, useFieldArray, useWatch } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
// Yup y yupResolver eliminados
import {
  Box, TextField, Button, CircularProgress, Alert, Typography, Paper, Snackbar,
  Autocomplete, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, // Table* no se usan si no hay Grid, pero las mantengo por si las usas en otro lado. Si no, se pueden quitar.
  InputAdornment, Chip, Divider // Añadido Divider que se usa
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale/es';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import type { PurchaseOrderCreateRequest, PurchaseOrderDetailRequest } from '../../../types/purchaseOrder.types';
import type { SupplierSummary } from '../../../types/supplier.types';
import type { InsumoSummary } from '../../../types/supply.types';
// import type { InsumoDetails } from '../../../types/supply.types'; // No se usa directamente
import { createPurchaseOrder } from '../../../api/purchaseOrderService';
import { getAllSuppliers } from '../../../api/supplierService';
import { getAllInsumos } from '../../../api/supplyService'; // getInsumoById no se usa
import { useNavigate } from 'react-router-dom';
import type { ApiErrorResponseDTO } from '../../../types/error.types';
import { formatISO } from 'date-fns'; // format y parseISO no se usan directamente aquí
import { formatCurrency } from '../../../utils/formatting';

interface PurchaseOrderDetailFormInput extends PurchaseOrderDetailRequest {
  insumoName?: string;
  unidadMedida?: string;
  subtotal?: number; // Calculado en UI, no parte del esquema de datos directo
}

interface PurchaseOrderFormInputs extends Omit<PurchaseOrderCreateRequest, 'idProveedor' | 'detalles'> {
  proveedor: SupplierSummary | null;
  detalles: PurchaseOrderDetailFormInput[];
}

// Schemas de Yup eliminados

const PurchaseOrderCreateForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const [suppliers, setSuppliers] = useState<SupplierSummary[]>([]);
  const [suppliersLoading, setSuppliersLoading] = useState(false);
  const [insumos, setInsumos] = useState<InsumoSummary[]>([]);
  const [insumosLoading, setInsumosLoading] = useState(false);

  const navigate = useNavigate();

  const {
    control,
    register,
    handleSubmit,
    formState: { errors }, // errors seguirá funcionando para validaciones básicas de RHF o HTML5
    reset,
    setValue,
    watch
  } = useForm<PurchaseOrderFormInputs>({
    // resolver: yupResolver(purchaseOrderSchema) ELIMINADO
    defaultValues: {
      proveedor: null,
      fechaEntregaEstimadaCompra: null,
      observacionesCompra: '',
      detalles: [{ idInsumo: 0, cantidadCompra: 1, precioUnitarioCompra: 0, insumoName: '', unidadMedida: '' }],
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "detalles",
  });

  const watchedDetalles = useWatch({ control, name: "detalles" });

  useEffect(() => {
    const loadInitialData = async () => {
      setSuppliersLoading(true);
      setInsumosLoading(true);
      try {
        const suppliersPage = await getAllSuppliers({ size: 1000 });
        setSuppliers(suppliersPage.content);
        const insumosPage = await getAllInsumos({ size: 1000 });
        setInsumos(insumosPage.content.map(i => ({ idInsumo: i.idInsumo, nombreInsumo: i.nombreInsumo, unidadMedidaInsumo: i.unidadMedidaInsumo })));
      } catch (err) {
        console.error("Error cargando datos iniciales:", err);
        setFormError("Error al cargar proveedores o insumos.");
      } finally {
        setSuppliersLoading(false);
        setInsumosLoading(false);
      }
    };
    loadInitialData();
  }, []);

  const handleInsumoChange = (index: number, selectedInsumo: InsumoSummary | null) => {
    if (selectedInsumo) {
      setValue(`detalles.${index}.idInsumo`, selectedInsumo.idInsumo, { shouldValidate: true });
      setValue(`detalles.${index}.insumoName`, selectedInsumo.nombreInsumo);
      setValue(`detalles.${index}.unidadMedida`, selectedInsumo.unidadMedidaInsumo);
      setValue(`detalles.${index}.precioUnitarioCompra`, 0, { shouldValidate: true });
    } else {
      setValue(`detalles.${index}.idInsumo`, 0);
      setValue(`detalles.${index}.insumoName`, '');
      setValue(`detalles.${index}.unidadMedida`, '');
      setValue(`detalles.${index}.precioUnitarioCompra`, 0);
    }
  };

  const calculateTotals = useCallback(() => {
    return watchedDetalles?.reduce((acc, item) => {
        const qty = Number(item.cantidadCompra) || 0;
        const price = Number(item.precioUnitarioCompra) || 0;
        return acc + (qty * price);
    }, 0) || 0;
  }, [watchedDetalles]);

  const totalOrdenCompra = calculateTotals();

  const onSubmit: SubmitHandler<PurchaseOrderFormInputs> = async (data) => {
    if (!data.proveedor || data.proveedor.idProveedor === 0) { // Ajuste validación
        setFormError("Debe seleccionar un proveedor.");
        // También puedes usar setError de RHF aquí:
        // setError('proveedor', { type: 'manual', message: 'Debe seleccionar un proveedor.' });
        return;
    }
    if (!data.detalles || data.detalles.length === 0) {
        setFormError("Debe añadir al menos un insumo a la orden.");
        return;
    }
    if (data.detalles.some(d => !d.idInsumo || d.idInsumo === 0)) {
        setFormError("Todos los insumos deben ser seleccionados.");
        return;
    }
     if (data.detalles.some(d => d.cantidadCompra <= 0)) {
        setFormError("La cantidad de cada insumo debe ser mayor que 0.");
        return;
    }
    if (data.detalles.some(d => d.precioUnitarioCompra < 0)) { // Precio puede ser 0 si es bonificado, pero no negativo
        setFormError("El precio de cada insumo no puede ser negativo.");
        return;
    }


    setLoading(true);
    setFormError(null);
    setSnackbarMessage('');

    const payload: PurchaseOrderCreateRequest = {
      idProveedor: data.proveedor.idProveedor,
      fechaEntregaEstimadaCompra: data.fechaEntregaEstimadaCompra ? formatISO(new Date(data.fechaEntregaEstimadaCompra), { representation: 'date' }) : null,
      observacionesCompra: data.observacionesCompra || null,
      detalles: data.detalles.map(d => ({
        idInsumo: d.idInsumo,
        cantidadCompra: Number(d.cantidadCompra),
        precioUnitarioCompra: Number(d.precioUnitarioCompra),
      })),
    };

    try {
      const newOrder = await createPurchaseOrder(payload);
      setSnackbarMessage(`Orden de Compra #${newOrder.idOrdenCompra} creada exitosamente.`);
      setSnackbarOpen(true);
      reset();
      setTimeout(() => {
        navigate('/ordenes-compra');
      }, 2500);
    } catch (err: any) {
      console.error("Error al crear orden de compra:", err);
      const apiError = err as ApiErrorResponseDTO;
      let displayError = 'Error al crear la orden de compra.';
      if (apiError && typeof apiError.message === 'string') {
        displayError = apiError.message;
        if (apiError.validationErrors) {
            const validationMessages = Object.values(apiError.validationErrors).join(' ');
            displayError += ` Detalles: ${validationMessages}`;
        }
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
          Crear Nueva Orden de Compra
        </Typography>
        {formError && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setFormError(null)}>{formError}</Alert>}

        {/* Sección Cabecera: Proveedor y Fecha */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 2 }}>
          <Box sx={{ flexGrow: 1, width: { xs: '100%', md: '50%' } }}>
            <Controller
              name="proveedor"
              control={control}
              rules={{ required: "El proveedor es requerido" }} // Validación básica RHF
              render={({ field }) => (
                <Autocomplete
                  {...field}
                  options={suppliers}
                  loading={suppliersLoading}
                  getOptionLabel={(option) => option ? `${option.nombreComercialProveedor} (NIT: ${option.nitProveedor})` : ''}
                  isOptionEqualToValue={(option, value) => option?.idProveedor === value?.idProveedor}
                  onChange={(_, newValue) => field.onChange(newValue)}
                  renderInput={(params) => (
                    <TextField 
                        {...params} 
                        required 
                        label="Proveedor" 
                        error={!!errors.proveedor} 
                        helperText={errors.proveedor?.message} 
                    />
                  )}
                />
              )}
            />
          </Box>
          <Box sx={{ flexGrow: 1, width: { xs: '100%', md: '50%' } }}>
            <Controller
              name="fechaEntregaEstimadaCompra"
              control={control}
              render={({ field, fieldState }) => (
                <DatePicker
                  label="Fecha Entrega Estimada (Opcional)"
                  value={field.value ? new Date(field.value) : null}
                  onChange={(date) => field.onChange(date)}
                  minDate={new Date()} // Asegura que no sea pasada
                  slotProps={{
                    textField: { 
                        fullWidth: true, 
                        error: !!fieldState.error, 
                        helperText: fieldState.error?.message 
                    },
                  }}
                />
              )}
            />
          </Box>
        </Box>

        {/* Sección Observaciones */}
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label="Observaciones (Opcional)"
            multiline
            rows={2}
            {...register('observacionesCompra')}
          />
        </Box>

        <Divider sx={{ my: 2 }}><Chip label="Insumos a Comprar" /></Divider>

        {/* Sección Detalles de Insumos */}
        {fields.map((item, index) => (
          <Box 
            key={item.id} 
            sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' }, 
                gap: 1.5, 
                alignItems: { sm: 'flex-start' }, // Alinea elementos al inicio en pantallas sm y mayores
                mb: 2, 
                p: 1.5, 
                border: '1px dashed', 
                borderColor: 'divider', 
                borderRadius: 1 
            }}
          >
            {/* Autocomplete Insumo */}
            <Box sx={{ width: { xs: '100%', sm: 'calc(40% - 8px)' } }}> {/* Ajusta el ancho como necesites */}
              <Controller
                name={`detalles.${index}.idInsumo`}
                control={control}
                rules={{ validate: value => value !== 0 || "Debe seleccionar un insumo" }}
                render={({ field: controllerField }) => (
                    <Autocomplete
                      value={insumos.find(p => p.idInsumo === controllerField.value) || null}
                      onChange={(_, selectedInsumo) => {
                          handleInsumoChange(index, selectedInsumo);
                      }}
                      options={insumos}
                      loading={insumosLoading}
                      getOptionLabel={(option) => option ? `${option.nombreInsumo} (ID: ${option.idInsumo})` : ''}
                      isOptionEqualToValue={(option, value) => option?.idInsumo === value?.idInsumo}
                      renderInput={(params) => (
                          <TextField
                            {...params}
                            required
                            label={`Insumo #${index + 1}`}
                            error={!!errors.detalles?.[index]?.idInsumo}
                            helperText={errors.detalles?.[index]?.idInsumo?.message}
                          />
                      )}
                    />
                )}
                />
            </Box>
            
            {/* Cantidad */}
            <Box sx={{ width: { xs: 'calc(50% - 4px)', sm: 'calc(20% - 8px)'} }}>
              <TextField
                required
                fullWidth
                type="number"
                label="Cantidad"
                InputProps={{ inputProps: { min: 0.001, step: "0.001" } }}
                {...register(`detalles.${index}.cantidadCompra`, { 
                    valueAsNumber: true,
                    required: "Cantidad requerida",
                    min: { value: 0.001, message: "Cantidad > 0" }
                })}
                error={!!errors.detalles?.[index]?.cantidadCompra}
                helperText={errors.detalles?.[index]?.cantidadCompra?.message}
                disabled={!watchedDetalles?.[index]?.idInsumo}
              />
            </Box>

            {/* Precio Compra */}
            <Box sx={{ width: { xs: 'calc(50% - 4px)', sm: 'calc(20% - 8px)'} }}>
              <TextField
                required
                fullWidth
                type="number"
                label="Precio Compra"
                InputProps={{ 
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    inputProps: { step: "0.01", min: 0 } 
                }}
                {...register(`detalles.${index}.precioUnitarioCompra`, { 
                    valueAsNumber: true,
                    required: "Precio requerido",
                    min: { value: 0, message: "Precio >= 0" }
                })}
                error={!!errors.detalles?.[index]?.precioUnitarioCompra}
                helperText={errors.detalles?.[index]?.precioUnitarioCompra?.message}
                disabled={!watchedDetalles?.[index]?.idInsumo}
              />
            </Box>

            {/* Subtotal */}
            <Box sx={{ 
                width: { xs: '100%', sm: 'calc(15% - 8px)' }, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: { xs: 'flex-start', sm: 'center' }, 
                pt: { xs: 1, sm: '8px' } // Ajuste para alineación vertical
            }}>
              <Typography variant="body2" sx={{fontWeight:'bold'}}>
                Sub: {formatCurrency((watchedDetalles?.[index]?.cantidadCompra || 0) * (watchedDetalles?.[index]?.precioUnitarioCompra || 0))}
              </Typography>
            </Box>

            {/* Botón Eliminar */}
            <Box sx={{ 
                width: { xs: '100%', sm: 'calc(5% - 8px)' }, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'flex-end',
                pt: { xs: 0, sm: '0px' } // Ajuste para alineación vertical
            }}>
              {fields.length > 1 && (
                <IconButton onClick={() => remove(index)} color="error" size="small">
                  <RemoveCircleOutlineIcon />
                </IconButton>
              )}
            </Box>
            
            {/* Unidad de Medida (debajo del insumo) */}
            <Box sx={{ width: '100%', mt: {xs: 0, sm: -1}, mb:1 }}>
                {watchedDetalles?.[index]?.idInsumo && (
                    <Typography variant="caption" color="text.secondary">
                        Unidad: {watchedDetalles[index].unidadMedida || insumos.find(i => i.idInsumo === watchedDetalles[index].idInsumo)?.unidadMedidaInsumo || 'N/A'}
                    </Typography>
                )}
            </Box>
          </Box>
        ))}
        
        <Button
          type="button"
          startIcon={<AddCircleOutlineIcon />}
          onClick={() => append({ idInsumo: 0, cantidadCompra: 1, precioUnitarioCompra: 0, insumoName: '', unidadMedida: '' })}
          sx={{ mt: 1, mb:2 }}
        >
          Añadir Insumo
        </Button>

        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb:2 }}>
            <Typography variant="h6">Total Orden: {formatCurrency(totalOrdenCompra)}</Typography>
        </Box>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button variant="outlined" onClick={() => navigate('/ordenes-compra')} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {loading ? 'Creando...' : 'Crear Orden de Compra'}
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

export default PurchaseOrderCreateForm;