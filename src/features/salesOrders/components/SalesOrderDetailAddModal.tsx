// src/features/salesOrders/components/SalesOrderDetailAddModal.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  CircularProgress, Alert, Snackbar, Autocomplete, InputAdornment, Box, Stack
} from '@mui/material';
import type { SalesOrderDetailRequest } from '../../../types/salesOrder.types';
import type { ProductSummary, ProductDetails } from '../../../types/product.types';
import { addDetailToSalesOrder } from '../../../api/salesOrderService';
import { getAllProducts, getProductById } from '../../../api/productService';
import type { ApiErrorResponseDTO } from '../../../types/error.types';

interface SalesOrderDetailAddFormInputs {
  producto: ProductSummary | null;
  cantidadProducto: number;
  precioUnitarioVenta?: number | null;
}

interface SalesOrderDetailAddModalProps {
  open: boolean;
  onClose: () => void;
  orderId: number;
  existingProductIdsInOrder: number[]; // Para evitar añadir el mismo producto dos veces (opcional, el backend podría manejarlo)
  onDetailAdded: () => void;
}

const SalesOrderDetailAddModal: React.FC<SalesOrderDetailAddModalProps> = ({
  open,
  onClose,
  orderId,
  existingProductIdsInOrder,
  onDetailAdded,
}) => {
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const [productsList, setProductsList] = useState<ProductSummary[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<SalesOrderDetailAddFormInputs>({
    defaultValues: {
      producto: null,
      cantidadProducto: 1,
      precioUnitarioVenta: undefined,
    },
  });

  const selectedProductForPrice = watch('producto');

  const fetchProducts = useCallback(async () => {
    if (open) {
        setProductsLoading(true);
        setFormError(null);
        try {
        const productsPage = await getAllProducts({ size: 1000 }); // O paginación
        const availableProducts = productsPage.content
            .filter(p => !existingProductIdsInOrder.includes(p.idProducto)) // Excluir productos ya en la orden
            .map(p => ({
                idProducto: p.idProducto,
                nombreProducto: p.nombreProducto,
                referenciaProducto: p.referenciaProducto,
                // No necesitamos talla ni color aquí, pero podrían ser útiles para el getOptionLabel
            }));
        setProductsList(availableProducts);
        } catch (err) {
        console.error("Error cargando productos:", err);
        setFormError("No se pudieron cargar los productos disponibles.");
        } finally {
        setProductsLoading(false);
        }
    }
  }, [open, existingProductIdsInOrder]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Autocompletar precio cuando se selecciona un producto
  useEffect(() => {
    if (selectedProductForPrice) {
      const fetchProductPrice = async () => {
        try {
          const productDetails = await getProductById(selectedProductForPrice.idProducto);
          setValue('precioUnitarioVenta', productDetails.precioVenta, { shouldValidate: true });
        } catch (error) {
          console.error("Error al obtener precio del producto:", error);
          setValue('precioUnitarioVenta', undefined); // O 0, o manejar error
        }
      };
      fetchProductPrice();
    } else {
        setValue('precioUnitarioVenta', undefined); // Limpiar si no hay producto
    }
  }, [selectedProductForPrice, setValue]);

  // Resetear formulario cuando el modal se cierra
  useEffect(() => {
    if (!open) {
      reset({
        producto: null,
        cantidadProducto: 1,
        precioUnitarioVenta: undefined,
      });
      setFormError(null);
    }
  }, [open, reset]);


  const handleFormSubmit: SubmitHandler<SalesOrderDetailAddFormInputs> = async (data) => {
    if (!data.producto) {
      setFormError("Seleccione un producto."); // Aunque yup debería manejarlo
      return;
    }
    setLoading(true);
    setFormError(null);

    const payload: SalesOrderDetailRequest = {
      idProducto: data.producto.idProducto,
      cantidadProducto: Number(data.cantidadProducto),
      precioUnitarioVenta: data.precioUnitarioVenta ? Number(data.precioUnitarioVenta) : null,
    };

    try {
      await addDetailToSalesOrder(orderId, payload);
      setSnackbarMessage('Producto añadido a la orden exitosamente.');
      setSnackbarOpen(true);
      onDetailAdded();
      onClose();
    } catch (err: any) {
      console.error("Error al añadir detalle a la orden:", err);
      const apiError = err as ApiErrorResponseDTO;
      setFormError(apiError?.message || 'Error al añadir el producto a la orden.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    if (!loading) {
      onClose(); // El reset se maneja en el useEffect
    }
  };
  const handleCloseSnackbar = () => setSnackbarOpen(false);

  return (
    <>
      <Dialog open={open} onClose={handleCloseModal} maxWidth="sm" fullWidth disableEscapeKeyDown={loading}>
        <DialogTitle>Añadir Producto a Orden de Venta #{orderId}</DialogTitle>
        <DialogContent>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Controller
              name="producto"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  {...field}
                  options={productsList}
                  loading={productsLoading}
                  getOptionLabel={(option) => option ? `${option.nombreProducto} (Ref: ${option.referenciaProducto})` : ''}
                  isOptionEqualToValue={(option, value) => option?.idProducto === value?.idProducto}
                  value={field.value || null}
                  onChange={(_, newValue) => field.onChange(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      required
                      autoFocus
                      label="Seleccionar Producto"
                      error={!!errors.producto}
                      helperText={errors.producto?.message}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {productsLoading ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                />
              )}
            />
            <TextField
              required
              fullWidth
              id="cantidadProductoAdd"
              label="Cantidad"
              type="number"
              InputProps={{ inputProps: { min: 1, step: 1 } }}
              {...register('cantidadProducto', { valueAsNumber: true, min: { value: 1, message: 'La cantidad debe ser al menos 1.' } })}
              error={!!errors.cantidadProducto}
              helperText={errors.cantidadProducto?.message}
            />
            <TextField
              fullWidth
              id="precioUnitarioVentaAdd"
              label="Precio Unitario (Opcional)"
              type="number"
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                inputProps: { step: "0.01", min: 0 }
              }}
              {...register('precioUnitarioVenta', { valueAsNumber: true, min: { value: 0, message: 'El precio no puede ser negativo.' } })}
              error={!!errors.precioUnitarioVenta}
              helperText={errors.precioUnitarioVenta?.message ? String(errors.precioUnitarioVenta.message) : 'Si se deja vacío, se usará el precio del producto.'}
              disabled={loading || productsLoading}
            />
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
            disabled={loading || productsLoading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Añadiendo...' : 'Añadir Producto'}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default SalesOrderDetailAddModal;