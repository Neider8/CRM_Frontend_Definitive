// src/features/products/components/ProductEditForm.tsx
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import {
  Box, TextField, Button, CircularProgress, Alert, Typography, Paper, Snackbar,
  InputAdornment, MenuItem
} from '@mui/material';
import type { ProductUpdateRequest, ProductDetails } from '../../../types/product.types';
import { updateProduct } from '../../../api/productService';
import { useNavigate } from 'react-router-dom';
import type { ApiErrorResponseDTO } from '../../../types/error.types';

interface ProductEditFormProps {
  productData: ProductDetails;
}

interface FormData extends ProductUpdateRequest {
  // No campos adicionales
}

const ProductEditForm: React.FC<ProductEditFormProps> = ({ productData }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info'>('success');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch
  } = useForm<ProductUpdateRequest>({
    defaultValues: {}, // Se setea en useEffect
  });

  useEffect(() => {
    if (productData) {
      reset({
        nombreProducto: productData.nombreProducto || '',
        descripcionProducto: productData.descripcionProducto || '',
        tallaProducto: productData.tallaProducto || '',
        colorProducto: productData.colorProducto || '',
        tipoProducto: productData.tipoProducto || '',
        generoProducto: productData.generoProducto || 'Unisex',
        costoProduccion: productData.costoProduccion ?? undefined,
        precioVenta: productData.precioVenta ?? undefined,
        unidadMedidaProducto: productData.unidadMedidaProducto || 'Unidad',
      });
    }
  }, [productData, reset]);

  const onSubmit: SubmitHandler<ProductUpdateRequest> = async (data) => {
    if (!isDirty) {
      setSnackbarMessage("No se realizaron cambios.");
      setSnackbarSeverity('info');
      setSnackbarOpen(true);
      return;
    }

    setLoading(true);
    setError(null);
    setSnackbarMessage('');

    const payload: ProductUpdateRequest = {
      ...data,
      descripcionProducto: data.descripcionProducto || null,
      tallaProducto: data.tallaProducto || null,
      colorProducto: data.colorProducto || null,
      tipoProducto: data.tipoProducto || null,
      generoProducto: data.generoProducto || null,
      unidadMedidaProducto: data.unidadMedidaProducto || 'Unidad',
      costoProduccion: data.costoProduccion ? Number(data.costoProduccion) : null,
      precioVenta: data.precioVenta ? Number(data.precioVenta) : null,
    };

    try {
      const updatedProduct = await updateProduct(productData.idProducto, payload);
      setSnackbarMessage(`Producto '${updatedProduct.nombreProducto}' actualizado exitosamente.`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      reset(payload); // Actualiza el formulario a los nuevos valores guardados
      setTimeout(() => {
        navigate(`/productos/${productData.idProducto}`); // Volver a detalles del producto
      }, 2500);
    } catch (err: any) {
      console.error("Error al actualizar producto:", err);
      const apiError = err as ApiErrorResponseDTO;
      let displayError = 'Error al actualizar el producto.';
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

  const handleCloseSnackbar = () => setSnackbarOpen(false);
  const generoOptions = ['Hombre', 'Mujer', 'Unisex', 'Niño', 'Niña', 'Otro'];
  const unidadMedidaOptions = ['Unidad', 'Par', 'Docena', 'Metro', 'Kilo', 'Rollo', 'Caja'];
  const costoProduccionValue = watch("costoProduccion");

  return (
    <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, mt: 2 }}>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h6" gutterBottom>
          Editar Producto: {productData.nombreProducto} (Ref: {productData.referenciaProducto})
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
          <TextField
            fullWidth
            label="Referencia (SKU) (No editable)"
            defaultValue={productData.referenciaProducto}
            InputProps={{ readOnly: true }}
            variant="filled"
          />
          <TextField
            required
            fullWidth
            id="nombreProducto"
            label="Nombre del Producto"
            autoFocus
            {...register('nombreProducto', { required: 'El nombre es requerido.' })}
            error={!!errors.nombreProducto}
            helperText={errors.nombreProducto?.message}
            disabled={loading}
          />
        </Box>

        <TextField
          fullWidth
          id="descripcionProducto"
          label="Descripción (Opcional)"
          multiline
          rows={3}
          {...register('descripcionProducto')}
          error={!!errors.descripcionProducto}
          helperText={errors.descripcionProducto?.message}
          disabled={loading}
        />

        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
          <TextField
            fullWidth
            id="tallaProducto"
            label="Talla"
            {...register('tallaProducto')}
            error={!!errors.tallaProducto}
            helperText={errors.tallaProducto?.message}
            disabled={loading}
          />
          <TextField
            fullWidth
            id="colorProducto"
            label="Color Principal"
            {...register('colorProducto')}
            error={!!errors.colorProducto}
            helperText={errors.colorProducto?.message}
            disabled={loading}
          />
          <TextField
            fullWidth
            id="tipoProducto"
            label="Tipo"
            {...register('tipoProducto')}
            error={!!errors.tipoProducto}
            helperText={errors.tipoProducto?.message}
            disabled={loading}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
          <TextField
            fullWidth
            id="generoProducto"
            label="Género"
            select
            {...register('generoProducto')} // defaultValue se maneja en el reset
            error={!!errors.generoProducto}
            helperText={errors.generoProducto?.message}
            disabled={loading}
          >
            {generoOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            required
            fullWidth
            id="costoProduccion"
            label="Costo de Producción"
            type="number"
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
              inputProps: { step: "0.01", min: "0.01" }
            }}
            {...register('costoProduccion', {
              required: 'El costo es requerido.',
              valueAsNumber: true,
              validate: value =>
                typeof value === 'number' && !isNaN(value) && value > 0
                  ? true
                  : 'Costo debe ser un número mayor que 0.'
            })}
            error={!!errors.costoProduccion}
            helperText={errors.costoProduccion?.message}
            disabled={loading}
          />
          <TextField
            required
            fullWidth
            id="precioVenta"
            label="Precio de Venta"
            type="number"
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
              inputProps: { step: "0.01", min: "0.01" }
            }}
            {...register('precioVenta', {
              required: 'El precio es requerido.',
              valueAsNumber: true,
              validate: value => {
                if (typeof value !== 'number' || isNaN(value) || value <= 0) {
                  return 'Precio debe ser un número mayor que 0.';
                }
                if (value <= (watch('costoProduccion') || 0)) {
                  return 'El precio de venta debe ser mayor que el costo de producción.';
                }
                return true;
              }
            })}
            error={!!errors.precioVenta}
            helperText={errors.precioVenta?.message}
            disabled={loading}
          />
          <TextField
            fullWidth
            id="unidadMedidaProducto"
            label="Unidad de Medida"
            select
            {...register('unidadMedidaProducto')} // defaultValue se maneja en el reset
            error={!!errors.unidadMedidaProducto}
            helperText={errors.unidadMedidaProducto?.message}
            disabled={loading}
          >
            {unidadMedidaOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => navigate(`/productos/${productData.idProducto}`)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading || !isDirty}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </Box>
      </Box>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
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

export default ProductEditForm;