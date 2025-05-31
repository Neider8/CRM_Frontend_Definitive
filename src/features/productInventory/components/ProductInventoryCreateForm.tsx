// src/features/productInventory/components/ProductInventoryCreateForm.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import {
  Box, TextField, Button, CircularProgress, Alert, Typography, Paper, Snackbar, Autocomplete
} from '@mui/material';
import type { ProductInventoryCreateRequest } from '../../../types/inventory.types';
import type { ProductSummary } from '../../../types/product.types'; // Para el Autocomplete de productos
import { createProductInventory } from '../../../api/productInventoryService';
import { getAllProducts } from '../../../api/productService'; // Para obtener la lista de productos
import { useNavigate } from 'react-router-dom';
import type { ApiErrorResponseDTO } from '../../../types/error.types';

interface FormInputs {
  producto: ProductSummary | null;
  ubicacionInventario: string;
  cantidadStock: number;
}

const ProductInventoryCreateForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const [productsList, setProductsList] = useState<ProductSummary[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);

  const navigate = useNavigate();

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormInputs>({
    defaultValues: {
      producto: null,
      ubicacionInventario: '',
      cantidadStock: 0,
    }
  });

  const fetchProducts = useCallback(async () => {
    setProductsLoading(true);
    try {
      // Considerar paginación o búsqueda si hay muchos productos
      const productsPage = await getAllProducts({ size: 1000 });
      setProductsList(productsPage.content.map(p => ({
        idProducto: p.idProducto,
        nombreProducto: p.nombreProducto,
        referenciaProducto: p.referenciaProducto,
        // Añadir otros campos si son útiles para la selección
      })));
    } catch (err) {
      console.error("Error cargando productos:", err);
      setFormError("No se pudieron cargar los productos disponibles.");
    } finally {
      setProductsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);


  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    if (!data.producto) {
        setFormError("Por favor, seleccione un producto."); // Aunque yup debería atrapar esto
        return;
    }
    setLoading(true);
    setFormError(null);
    setSnackbarMessage('');

    const payload: ProductInventoryCreateRequest = {
      idProducto: data.producto.idProducto,
      ubicacionInventario: data.ubicacionInventario,
      cantidadStock: Number(data.cantidadStock),
    };

    try {
      const newInventoryRecord = await createProductInventory(payload);
      setSnackbarMessage(`Registro de inventario para '${newInventoryRecord.producto.nombreProducto}' en '${newInventoryRecord.ubicacionInventario}' creado.`);
      setSnackbarOpen(true);
      reset();
      setTimeout(() => {
        navigate('/inventario-productos');
      }, 2500);
    } catch (err: any) {
      console.error("Error al crear registro de inventario:", err);
      const apiError = err as ApiErrorResponseDTO;
      let displayError = 'Error al crear el registro de inventario.';
      if (apiError && typeof apiError.message === 'string') {
        displayError = apiError.message; // El backend podría devolver "DuplicateResourceException"
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
    <Paper elevation={3} sx={{ p: { xs: 2, md: 3 } }}>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h6" gutterBottom>
          Nuevo Registro de Inventario de Producto
        </Typography>
        {formError && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setFormError(null)}>{formError}</Alert>}

        <Box sx={{ mb: 2 }}>
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
                onChange={(_, newValue) => field.onChange(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
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
                      )
                    }}
                  />
                )}
              />
            )}
          />
        </Box>
        <TextField
          required
          fullWidth
          id="ubicacionInventario"
          label="Ubicación en Inventario"
          autoFocus
          {...register('ubicacionInventario', { required: 'La ubicación es requerida.', maxLength: { value: 100, message: 'Máximo 100 caracteres.' } })}
          error={!!errors.ubicacionInventario}
          helperText={errors.ubicacionInventario?.message}
          disabled={loading || productsLoading}
        />
        <TextField
          required
          fullWidth
          id="cantidadStock"
          label="Cantidad Stock Inicial"
          type="number"
          InputProps={{ inputProps: { min: 0, step: 1 } }}
          {...register('cantidadStock', { required: 'La cantidad de stock inicial es requerida.', min: { value: 0, message: 'La cantidad no puede ser negativa.' }, valueAsNumber: true, validate: value => Number.isInteger(value) || 'La cantidad debe ser un número entero.' })}
          error={!!errors.cantidadStock}
          helperText={errors.cantidadStock?.message}
          disabled={loading || productsLoading}
        />

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/inventario-productos')}
            disabled={loading || productsLoading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading || productsLoading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {loading ? 'Creando...' : 'Crear Registro'}
          </Button>
        </Box>
      </Box>
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
    </Paper>
  );
};

export default ProductInventoryCreateForm;