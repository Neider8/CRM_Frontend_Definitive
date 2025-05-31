// src/features/supplyInventory/components/SupplyInventoryCreateForm.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import {
  Box, TextField, Button, CircularProgress, Alert, Typography, Paper, Snackbar, Autocomplete,
  InputAdornment
} from '@mui/material';
import type { SupplyInventoryCreateRequest } from '../../../types/inventory.types';
import type { InsumoSummary } from '../../../types/supply.types';
import { createSupplyInventory } from '../../../api/supplyInventoryService';
import { getAllInsumos } from '../../../api/supplyService'; // Para obtener la lista de insumos
import { useNavigate } from 'react-router-dom';
import type { ApiErrorResponseDTO } from '../../../types/error.types';

interface FormInputs {
  insumo: InsumoSummary | null;
  ubicacionInventario: string;
  cantidadStock: number;
}

const SupplyInventoryCreateForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const [insumosList, setInsumosList] = useState<InsumoSummary[]>([]);
  const [insumosLoading, setInsumosLoading] = useState(false);

  const navigate = useNavigate();

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<FormInputs>({
    defaultValues: {
      insumo: null,
      ubicacionInventario: '',
      cantidadStock: undefined,
    }
  });

  const selectedInsumo = watch('insumo');

  const fetchInsumos = useCallback(async () => {
    setInsumosLoading(true);
    try {
      const insumosPage = await getAllInsumos({ size: 1000 }); // O implementar búsqueda/paginación
      setInsumosList(insumosPage.content.map(i => ({
        idInsumo: i.idInsumo,
        nombreInsumo: i.nombreInsumo,
        unidadMedidaInsumo: i.unidadMedidaInsumo,
      })));
    } catch (err) {
      console.error("Error cargando insumos:", err);
      setFormError("No se pudieron cargar los insumos disponibles.");
    } finally {
      setInsumosLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInsumos();
  }, [fetchInsumos]);

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    if (!data.insumo) {
        setFormError("Por favor, seleccione un insumo.");
        return;
    }
    setLoading(true);
    setFormError(null);
    setSnackbarMessage('');

    const payload: SupplyInventoryCreateRequest = {
      idInsumo: data.insumo.idInsumo,
      ubicacionInventario: data.ubicacionInventario,
      cantidadStock: Number(data.cantidadStock),
    };

    try {
      const newInventoryRecord = await createSupplyInventory(payload);
      setSnackbarMessage(`Registro de inventario para '${newInventoryRecord.insumo.nombreInsumo}' en '${newInventoryRecord.ubicacionInventario}' creado.`);
      setSnackbarOpen(true);
      reset();
      setTimeout(() => {
        navigate('/inventario-insumos');
      }, 2500);
    } catch (err: any) {
      console.error("Error al crear registro de inventario de insumo:", err);
      const apiError = err as ApiErrorResponseDTO;
      let displayError = 'Error al crear el registro de inventario.';
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
    <Paper elevation={3} sx={{ p: { xs: 2, md: 3 } }}>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h6" gutterBottom>
          Nuevo Registro de Inventario de Insumo
        </Typography>
        {formError && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setFormError(null)}>{formError}</Alert>}

        <Box sx={{ mb: 2 }}>
          <Controller
            name="insumo"
            control={control}
            render={({ field }) => (
              <Autocomplete
                {...field}
                options={insumosList}
                loading={insumosLoading}
                getOptionLabel={(option) => option ? `${option.nombreInsumo} (ID: ${option.idInsumo}) - Unidad: ${option.unidadMedidaInsumo}` : ''}
                isOptionEqualToValue={(option, value) => option?.idInsumo === value?.idInsumo}
                onChange={(_, newValue) => field.onChange(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    label="Seleccionar Insumo"
                    error={!!errors.insumo}
                    helperText={errors.insumo?.message}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {insumosLoading ? <CircularProgress color="inherit" size={20} /> : null}
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
          autoFocus // Mover autoFocus aquí si es el primer campo que el usuario llena típicamente
          {...register('ubicacionInventario', { required: 'La ubicación es requerida.', maxLength: { value: 100, message: 'Máximo 100 caracteres.' } })}
          error={!!errors.ubicacionInventario}
          helperText={errors.ubicacionInventario?.message}
          disabled={loading || insumosLoading}
        />
        <TextField
          required
          fullWidth
          id="cantidadStock"
          label={`Stock Inicial ${selectedInsumo ? `(${selectedInsumo.unidadMedidaInsumo})` : ''}`}
          type="number"
          InputProps={{ inputProps: { min: 0, step: "0.001" } }} // step para 3 decimales
          {...register('cantidadStock', { required: 'La cantidad de stock inicial es requerida.', min: { value: 0, message: 'La cantidad no puede ser negativa.' }, validate: value => value === undefined || value === null || /^\d+(\.\d{0,3})?$/.test(String(value)) || 'Máximo 3 decimales permitidos.' })}
          error={!!errors.cantidadStock}
          helperText={errors.cantidadStock?.message}
          disabled={loading || insumosLoading || !selectedInsumo}
        />

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/inventario-insumos')}
            disabled={loading || insumosLoading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading || insumosLoading}
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

export default SupplyInventoryCreateForm;