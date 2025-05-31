// src/features/products/components/BomItemCreateModal.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  Box, CircularProgress, Alert, Snackbar, Autocomplete
} from '@mui/material';
import type { InsumoPorProductoRequest } from '../../../types/product.types';
import type { InsumoSummary } from '../../../types/supply.types';
import { addInsumoToProductBOM } from '../../../api/productService';
import { getAllInsumos } from '../../../api/supplyService';
import type { ApiErrorResponseDTO } from '../../../types/error.types';

interface BomItemFormInputs {
    insumo: InsumoSummary | null;
    cantidadRequerida?: number;
}

interface BomItemCreateModalProps {
  open: boolean;
  onClose: () => void;
  productId: number;
  existingBomInsumoIds: number[];
  onBomItemCreated: () => void;
}

const BomItemCreateModal: React.FC<BomItemCreateModalProps> = ({
  open,
  onClose,
  productId,
  existingBomInsumoIds,
  onBomItemCreated,
}) => {
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const [insumosList, setInsumosList] = useState<InsumoSummary[]>([]);
  const [insumosLoading, setInsumosLoading] = useState(false);

  const [insumoSeleccionado, setInsumoSeleccionado] = useState<InsumoSummary | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    register, // <-- Agregado aquí
  } = useForm<BomItemFormInputs>({
    defaultValues: {
      insumo: null,
      cantidadRequerida: undefined,
    },
  });

  const fetchInsumosCallback = useCallback(async () => {
    if (open) {
        setInsumosLoading(true);
        setFormError(null);
        try {
          const insumosPage = await getAllInsumos({ size: 1000 });
          const availableInsumos = insumosPage.content
            .filter(insumo => !existingBomInsumoIds.includes(insumo.idInsumo))
            .map(i => ({ idInsumo: i.idInsumo, nombreInsumo: i.nombreInsumo, unidadMedidaInsumo: i.unidadMedidaInsumo }));
          setInsumosList(availableInsumos);
        } catch (err) {
          console.error("Error cargando insumos:", err);
          setFormError("No se pudieron cargar los insumos disponibles.");
        } finally {
          setInsumosLoading(false);
        }
    }
  }, [open, existingBomInsumoIds]);

  useEffect(() => {
    fetchInsumosCallback();
  }, [fetchInsumosCallback]);

  useEffect(() => {
    if (!open) {
      reset({
        insumo: null,
        cantidadRequerida: undefined,
      });
      setFormError(null);
    }
  }, [open, reset]);


  const handleFormSubmit: SubmitHandler<BomItemFormInputs> = async (data) => {
    if (!data.insumo) {
      setFormError("Por favor, seleccione un insumo.");
      return;
    }
    setLoading(true);
    setFormError(null);

    const payload: InsumoPorProductoRequest = {
      idInsumo: data.insumo.idInsumo,
      cantidadRequerida: Number(data.cantidadRequerida),
      idProducto: productId, // Añadir el idProducto al payload
    };

    try {
      await addInsumoToProductBOM(productId, payload);
      setSnackbarMessage('Insumo añadido al BOM exitosamente.');
      setSnackbarOpen(true);
      onBomItemCreated();
      onClose();
    } catch (err: any) {
      console.error("Error al añadir insumo al BOM:", err);
      const apiError = err as ApiErrorResponseDTO;
      setFormError(apiError?.message || 'Error al añadir el insumo al BOM.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCloseSnackbar = () => setSnackbarOpen(false);

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth disableEscapeKeyDown={loading}>
        <DialogTitle>Añadir Insumo a Lista de Materiales (BOM)</DialogTitle>
        <DialogContent>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate sx={{ mt: 1 }}>
            <Box sx={{ mb: 2 }}>
              <Controller
                name="insumo"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    value={field.value}
                    onChange={(_, newValue) => {
                      setInsumoSeleccionado(newValue);
                      field.onChange(newValue);
                    }}
                    options={insumosList}
                    loading={insumosLoading}
                    getOptionLabel={(option) => option ? `${option.nombreInsumo} (ID: ${option.idInsumo})` : ''}
                    isOptionEqualToValue={(option, value) => option?.idInsumo === value?.idInsumo}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Seleccionar Insumo"
                        required
                        error={!!errors.insumo}
                        helperText={errors.insumo?.message}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                                {insumosLoading ? <CircularProgress color="inherit" size={20} /> : null}
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
              <TextField
                required
                fullWidth
                id="cantidadRequerida"
                label={`Cantidad Requerida ${insumoSeleccionado ? `(${insumoSeleccionado.unidadMedidaInsumo || ''})` : ''}`}
                type="number"
                InputProps={{
                  inputProps: { step: "0.001", min: "0.001" }
                }}
                {...register('cantidadRequerida', {
                  required: 'La cantidad es requerida.',
                  valueAsNumber: true,
                  validate: value =>
                    typeof value === 'number' && !isNaN(value) && value > 0
                      ? true
                      : 'La cantidad debe ser un número mayor que 0.'
                })}
                error={!!errors.cantidadRequerida}
                helperText={errors.cantidadRequerida?.message}
                disabled={loading || insumosLoading || !insumoSeleccionado}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} color="inherit" disabled={loading || insumosLoading}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit(handleFormSubmit)}
            disabled={loading || insumosLoading || !insumoSeleccionado}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Añadiendo...' : 'Añadir al BOM'}
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
};export default BomItemCreateModal;