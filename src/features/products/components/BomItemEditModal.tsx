// src/features/products/components/BomItemEditModal.tsx
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  Grid, CircularProgress, Alert, Snackbar, Typography, Box
} from '@mui/material';
import type { InsumoPorProductoRequest, InsumoPorProductoDetails } from '../../../types/product.types';
import { updateInsumoInProductBOM } from '../../../api/productService';
import type { ApiErrorResponseDTO } from '../../../types/error.types';

// Solo necesitamos validar la cantidad requerida para la edición
interface BomItemEditFormInputs {
    cantidadRequerida: number;
}

const bomItemEditSchema = yup.object().shape({
  cantidadRequerida: yup.number()
    .typeError('La cantidad debe ser un número.')
    .required('La cantidad requerida es obligatoria.')
    .min(0.001, 'La cantidad debe ser mayor que 0.'), // Misma precisión que en creación
});

interface BomItemEditModalProps {
  open: boolean;
  onClose: () => void;
  productId: number;
  bomItemData: InsumoPorProductoDetails; // Datos del ítem del BOM a editar
  onBomItemUpdated: () => void; // Callback para refrescar la lista
}

const BomItemEditModal: React.FC<BomItemEditModalProps> = ({
  open,
  onClose,
  productId,
  bomItemData,
  onBomItemUpdated,
}) => {
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info'>('success');


  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    setValue,
  } = useForm<BomItemEditFormInputs>({
    resolver: yupResolver(bomItemEditSchema),
    defaultValues: {
      cantidadRequerida: bomItemData?.cantidadRequerida || undefined,
    },
  });

  useEffect(() => {
    if (bomItemData && open) {
      setValue('cantidadRequerida', bomItemData.cantidadRequerida);
    }
  }, [bomItemData, open, setValue, reset]); // Añadido reset a las dependencias

  const handleFormSubmit: SubmitHandler<BomItemEditFormInputs> = async (data) => {
    if (!isDirty) {
        setSnackbarMessage('No se realizaron cambios en la cantidad.');
        setSnackbarSeverity('info');
        setSnackbarOpen(true);
        onClose(); // Cierra el modal si no hay cambios
        return;
    }
    setLoading(true);
    setFormError(null);

    // El DTO de backend InsumoPorProductoRequestDTO solo necesita idInsumo y cantidadRequerida.
    // idInsumo se pasa en la URL del endpoint PUT.
    const payload: InsumoPorProductoRequest = {
      idInsumo: bomItemData.idInsumo, // Aunque no se envía en el body del PUT, es útil tenerlo
      cantidadRequerida: Number(data.cantidadRequerida),
      idProducto: productId, // Agregado para cumplir con la interfaz
    };

    try {
      await updateInsumoInProductBOM(productId, bomItemData.idInsumo, payload);
      setSnackbarMessage('Cantidad del insumo en BOM actualizada exitosamente.');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      onBomItemUpdated();
      onClose(); // Cierra el modal
    } catch (err: any) {
      console.error("Error al actualizar insumo en BOM:", err);
      const apiError = err as ApiErrorResponseDTO;
      setFormError(apiError?.message || 'Error al actualizar el insumo en el BOM.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    if (!loading) {
      // reset(); // El useEffect ya maneja el reseteo al abrir/cambiar data
      setFormError(null);
      onClose();
    }
  };

  const handleCloseSnackbar = () => setSnackbarOpen(false);


  if (!bomItemData) return null; // No renderizar si no hay datos del item

  return (
    <>
      <Dialog open={open} onClose={handleCloseModal} maxWidth="xs" fullWidth>
        <DialogTitle>Editar Cantidad en BOM</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" gutterBottom>
            Producto: <strong>{bomItemData.nombreProducto}</strong> (ID: {productId})
          </Typography>
          <Typography variant="subtitle2" gutterBottom>
            Insumo: <strong>{bomItemData.nombreInsumo}</strong> (ID: {bomItemData.idInsumo})
          </Typography>
          {formError && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{formError}</Alert>}
          <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate sx={{ mt: 2 }}>
            <TextField
              required
              fullWidth
              autoFocus
              id="cantidadRequeridaEdit"
              label={`Nueva Cantidad Requerida (${bomItemData.unidadMedidaInsumo})`}
              type="number"
              InputProps={{
                inputProps: { step: "0.001", min: "0.001" }
              }}
              {...register('cantidadRequerida')}
              error={!!errors.cantidadRequerida}
              helperText={errors.cantidadRequerida?.message}
              disabled={loading}
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
            disabled={loading || !isDirty}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Guardando...' : 'Guardar Cantidad'}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default BomItemEditModal;