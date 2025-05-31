// src/features/salesOrders/components/SalesOrderCreateForm.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller, useFieldArray, useWatch } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import {
  Box, TextField, Button, CircularProgress, Alert, Typography, Paper, Snackbar,
  Autocomplete, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  InputAdornment, Stack, Divider, Chip
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale/es';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import type { SalesOrderCreateRequest, SalesOrderDetailRequest } from '../../../types/salesOrder.types';
import type { ClientSummary } from '../../../types/client.types';
import type { ProductSummary, ProductDetails } from '../../../types/product.types'; // Necesitamos ProductDetails para el precio
import { createSalesOrder } from '../../../api/salesOrderService';
import { getAllClients } from '../../../api/clientService';
import { getAllProducts, getProductById } from '../../../api/productService'; // Para obtener precio del producto
import { useNavigate } from 'react-router-dom';
import type { ApiErrorResponseDTO } from '../../../types/error.types';
import { formatISO } from 'date-fns';
import { formatCurrency } from '../../../utils/formatting';

interface SalesOrderDetailFormInput extends SalesOrderDetailRequest {
  productName?: string;
  subtotal?: number;
}

interface SalesOrderFormInputs extends Omit<SalesOrderCreateRequest, 'idCliente' | 'detalles'> {
  cliente: ClientSummary | null;
  detalles: SalesOrderDetailFormInput[];
}

const SalesOrderCreateForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const [clients, setClients] = useState<ClientSummary[]>([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [products, setProducts] = useState<ProductSummary[]>([]); // Solo summaries para el Autocomplete
  const [productsLoading, setProductsLoading] = useState(false);

  const navigate = useNavigate();

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    getValues,
    watch
  } = useForm<SalesOrderFormInputs>({
    defaultValues: {
      cliente: null,
      fechaEntregaEstimada: null,
      observacionesOrden: '',
      detalles: [{ idProducto: 0, cantidadProducto: 1, precioUnitarioVenta: 0 }], // Iniciar con una fila
    }
  });

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "detalles",
  });

  const watchedDetalles = useWatch({ control, name: "detalles" });

  // Cargar Clientes y Productos
  useEffect(() => {
    const loadInitialData = async () => {
      setClientsLoading(true);
      setProductsLoading(true);
      try {
        const clientsPage = await getAllClients({ size: 1000 }); // Simplificado, idealmente con búsqueda
        setClients(clientsPage.content);
        const productsPage = await getAllProducts({ size: 1000 });
        setProducts(productsPage.content.map(p => ({
            idProducto: p.idProducto,
            nombreProducto: p.nombreProducto,
            referenciaProducto: p.referenciaProducto,
            // No necesitamos precio aquí, lo cargaremos al seleccionar
        })));
      } catch (err) {
        console.error("Error cargando datos iniciales:", err);
        setFormError("Error al cargar clientes o productos.");
      } finally {
        setClientsLoading(false);
        setProductsLoading(false);
      }
    };
    loadInitialData();
  }, []);

  const handleProductChange = async (index: number, selectedProduct: ProductSummary | null) => {
    if (selectedProduct) {
      setValue(`detalles.${index}.idProducto`, selectedProduct.idProducto, { shouldValidate: true });
      setValue(`detalles.${index}.productName`, selectedProduct.nombreProducto);
      try {
        // Obtener detalles completos del producto para el precio de venta
        const productDetails = await getProductById(selectedProduct.idProducto);
        setValue(`detalles.${index}.precioUnitarioVenta`, productDetails.precioVenta, { shouldValidate: true });
      } catch (error) {
        console.error("Error al obtener precio del producto", error);
        setValue(`detalles.${index}.precioUnitarioVenta`, 0, { shouldValidate: true }); // O manejar error
      }
    } else {
      setValue(`detalles.${index}.idProducto`, 0, { shouldValidate: true }); // O null si el tipo lo permite
      setValue(`detalles.${index}.productName`, '');
      setValue(`detalles.${index}.precioUnitarioVenta`, 0, { shouldValidate: true });
    }
  };

  // Calcular subtotales y total general
  const calculateTotals = useCallback(() => {
    return watchedDetalles?.reduce((acc, item) => {
        const qty = Number(item.cantidadProducto) || 0;
        const price = Number(item.precioUnitarioVenta) || 0;
        const subtotal = qty * price;
        // Actualizar el subtotal visualmente en el item (si tienes un campo para ello)
        // Esto es solo para el cálculo del total, el subtotal por línea se muestra directamente
        return acc + subtotal;
    }, 0) || 0;
  }, [watchedDetalles]);

  const totalOrden = calculateTotals();

  const onSubmit: SubmitHandler<SalesOrderFormInputs> = async (data) => {
    if (!data.cliente) {
        setFormError("Debe seleccionar un cliente.");
        return;
    }
    setLoading(true);
    setFormError(null);
    setSnackbarMessage('');

    const payload: SalesOrderCreateRequest = {
      idCliente: data.cliente.idCliente,
      fechaEntregaEstimada: data.fechaEntregaEstimada ? formatISO(new Date(data.fechaEntregaEstimada), { representation: 'date' }) : null,
      observacionesOrden: data.observacionesOrden || null,
      detalles: data.detalles.map(d => ({
        idProducto: d.idProducto,
        cantidadProducto: Number(d.cantidadProducto),
        precioUnitarioVenta: d.precioUnitarioVenta ? Number(d.precioUnitarioVenta) : null,
      })),
    };

    try {
      const newOrder = await createSalesOrder(payload);
      setSnackbarMessage(`Orden de Venta #${newOrder.idOrdenVenta} creada exitosamente.`);
      setSnackbarOpen(true);
      reset();
      setTimeout(() => {
        navigate('/ordenes-venta');
      }, 2500);
    } catch (err: any) {
      console.error("Error al crear orden de venta:", err);
      const apiError = err as ApiErrorResponseDTO;
      let displayError = 'Error al crear la orden de venta.';
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
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Typography variant="h6" component="h2" gutterBottom>
          Crear Nueva Orden de Venta
        </Typography>
        {formError && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setFormError(null)}>{formError}</Alert>}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
          <Controller
            name="cliente"
            control={control}
            render={({ field }) => (
              <Autocomplete
                {...field}
                options={clients}
                loading={clientsLoading}
                getOptionLabel={(option) => option ? `${option.nombreCliente} (Doc: ${option.numeroDocumento})` : ''}
                isOptionEqualToValue={(option, value) => option?.idCliente === value?.idCliente}
                onChange={(_, newValue) => field.onChange(newValue)}
                renderInput={(params) => (
                  <TextField {...params} required label="Cliente" error={!!errors.cliente} helperText={errors.cliente?.message} />
                )}
              />
            )}
          />
          <Controller
            name="fechaEntregaEstimada"
            control={control}
            render={({ field, fieldState }) => (
              <DatePicker
                label="Fecha Entrega Estimada (Opcional)"
                value={field.value ? new Date(field.value) : null}
                onChange={(date) => field.onChange(date)}
                minDate={new Date()}
                slotProps={{
                  textField: { fullWidth: true, error: !!fieldState.error, helperText: fieldState.error?.message },
                }}
              />
            )}
          />
          <TextField
            fullWidth
            label="Observaciones (Opcional)"
            multiline
            rows={2}
            {...register('observacionesOrden')}
          />
        </Box>

        <Divider sx={{ my: 2 }}><Chip label="Detalles de la Orden" /></Divider>

        <Stack spacing={2}>
        {fields.map((item, index) => (
          <Box key={item.id} sx={{ display: 'flex', gap: 2, alignItems: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 1, p: 1 }}>
            <Controller
              name={`detalles.${index}.idProducto`}
              control={control}
              defaultValue={0}
              render={({ field: controllerField }) => (
                  <Autocomplete
                    value={products.find(p => p.idProducto === controllerField.value) || null}
                    onChange={(_, selectedProduct) => handleProductChange(index, selectedProduct)}
                    options={products}
                    loading={productsLoading}
                    getOptionLabel={(option) => option ? `${option.nombreProducto} (Ref: ${option.referenciaProducto})` : ''}
                    isOptionEqualToValue={(option, value) => option?.idProducto === value?.idProducto}
                    renderInput={(params) => (
                        <TextField {...params} required label={`Producto #${index + 1}`} error={!!errors.detalles?.[index]?.idProducto} helperText={errors.detalles?.[index]?.idProducto?.message} />
                    )}
                  />
              )}
            />
            <TextField
              required
              type="number"
              label="Cantidad"
              InputProps={{ inputProps: { min: 1, step: 1 } }}
              {...register(`detalles.${index}.cantidadProducto`, { valueAsNumber: true })}
              error={!!errors.detalles?.[index]?.cantidadProducto}
              helperText={errors.detalles?.[index]?.cantidadProducto?.message}
              sx={{ width: 120 }}
            />
            <TextField
              fullWidth
              type="number"
              label="Precio Unit."
              InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment>, inputProps: { step: "0.01", min: 0 } }}
              {...register(`detalles.${index}.precioUnitarioVenta`, { valueAsNumber: true })}
              error={!!errors.detalles?.[index]?.precioUnitarioVenta}
              helperText={errors.detalles?.[index]?.precioUnitarioVenta?.message}
              sx={{ width: 150 }}
            />
            <Typography variant="body2" sx={{ fontWeight: 'bold', width: 150, textAlign: 'right' }}>
              Subtotal: {formatCurrency((watchedDetalles?.[index]?.cantidadProducto || 0) * (watchedDetalles?.[index]?.precioUnitarioVenta || 0))}
            </Typography>
            {fields.length > 1 && (
              <IconButton onClick={() => remove(index)} color="error" size="small">
                <RemoveCircleOutlineIcon />
              </IconButton>
            )}
          </Box>
        ))}
        <Button
          type="button"
          startIcon={<AddCircleOutlineIcon />}
          onClick={() => append({ idProducto: 0, cantidadProducto: 1, precioUnitarioVenta: 0, productName: '', subtotal: 0 })}
          sx={{ mt: 1, mb: 2 }}
        >
          Añadir Producto
        </Button>
        </Stack>
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Total Orden: {formatCurrency(totalOrden)}</Typography>
        </Box>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button variant="outlined" onClick={() => navigate('/ordenes-venta')} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {loading ? 'Creando...' : 'Crear Orden de Venta'}
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

export default SalesOrderCreateForm;