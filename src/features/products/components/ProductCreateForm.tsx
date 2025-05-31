// src/features/products/components/ProductCreateForm.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import {
  Box, TextField, Button, CircularProgress, Alert, Typography, Paper, Snackbar,
  InputAdornment, MenuItem
} from '@mui/material';
import type { ProductCreateRequest } from '../../../types/product.types';
import { createProduct } from '../../../api/productService';
import { useNavigate } from 'react-router-dom';
import type { ApiErrorResponseDTO } from '../../../types/error.types';

interface FormData extends ProductCreateRequest {
  // No campos adicionales
}

const ProductCreateForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch // Para observar el valor de costoProduccion
  } = useForm<FormData>({
    defaultValues: {
      referenciaProducto: '',
      nombreProducto: '',
      descripcionProducto: '',
      tallaProducto: '',
      colorProducto: '',
      tipoProducto: '',
      generoProducto: 'Unisex',
      costoProduccion: undefined, // Para que el placeholder funcione
      precioVenta: undefined,     // Para que el placeholder funcione
      unidadMedidaProducto: 'Unidad',
    }
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setLoading(true);
    setError(null);
    setSnackbarMessage('');

    const payload: ProductCreateRequest = {
      ...data,
      // Asegurarse que los opcionales vacíos se envíen como null si es necesario por el backend
      descripcionProducto: data.descripcionProducto || null,
      tallaProducto: data.tallaProducto || null,
      colorProducto: data.colorProducto || null,
      tipoProducto: data.tipoProducto || null,
      generoProducto: data.generoProducto || null,
      unidadMedidaProducto: data.unidadMedidaProducto || 'Unidad',
      costoProduccion: Number(data.costoProduccion), // Convertir a número explícitamente
      precioVenta: Number(data.precioVenta)       // Convertir a número explícitamente
    };

    try {
      const newProduct = await createProduct(payload);
      setSnackbarMessage(`Producto '${newProduct.nombreProducto}' creado exitosamente.`);
      setSnackbarOpen(true);
      reset();
      setTimeout(() => {
        navigate('/productos');
      }, 2500);
    } catch (err: any) {
      console.error("Error al crear producto:", err);
      const apiError = err as ApiErrorResponseDTO;
      let displayError = 'Error al crear el producto. Verifique los datos.';
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
  const unidadMedidaOptions = ['Unidad', 'Par', 'Docena', 'Metro', 'Centímetro', 'Rollo', 'Paquete', 'Set'];

  const costoProduccionValue = watch("costoProduccion");

  return (
    <Paper elevation={3} sx={{ p: { xs: 2, md: 3 } }}>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h6" gutterBottom>
          Registrar Nuevo Producto
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
          <TextField
            required
            fullWidth
            id="referenciaProducto"
            label="Referencia (SKU)"
            autoFocus
            {...register('referenciaProducto', { required: 'La referencia es requerida.' })}
            error={!!errors.referenciaProducto}
            helperText={errors.referenciaProducto?.message}
            disabled={loading}
          />
          <TextField
            required
            fullWidth
            id="nombreProducto"
            label="Nombre del Producto"
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
            label="Talla (Ej: S, M, L, XL, Única)"
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
            label="Tipo (Ej: Camisa, Pantalón, Falda)"
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
            defaultValue="Unisex"
            {...register('generoProducto')}
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
            label="Costo de Producción (COP)"
            type="number"
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
              inputProps: { step: "0.01", min: "0.01" }
            }}
            {...register('costoProduccion', {
              required: 'El costo de producción es requerido.',
              valueAsNumber: true,
              validate: value => !isNaN(value) && value > 0 || 'Costo debe ser un número mayor que 0.'
            })}
            error={!!errors.costoProduccion}
            helperText={errors.costoProduccion?.message}
            disabled={loading}
          />
          <TextField
            required
            fullWidth
            id="precioVenta"
            label="Precio de Venta (COP)"
            type="number"
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
              inputProps: { step: "0.01", min: "0.01" }
            }}
            {...register('precioVenta', {
              required: 'El precio de venta es requerido.',
              valueAsNumber: true,
              validate: value => {
                if (isNaN(value) || value <= 0) {
                  return 'Precio debe ser un número mayor que 0.';
                }
                if (value <= (costoProduccionValue || 0)) {
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
            defaultValue="Unidad"
            {...register('unidadMedidaProducto')}
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
            onClick={() => navigate('/productos')}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {loading ? 'Creando...' : 'Crear Producto'}
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

export default ProductCreateForm;