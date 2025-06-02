import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  CircularProgress, Alert, Snackbar, Autocomplete, InputAdornment, Box
} from '@mui/material';
import type { PurchaseOrderDetailRequest } from '../../../types/purchaseOrder.types';
import type { InsumoSummary } from '../../../types/supply.types';
import { addDetailToPurchaseOrder } from '../../../api/purchaseOrderService';
import { getAllInsumos } from '../../../api/supplyService';
import type { ApiErrorResponseDTO } from '../../../types/error.types';

interface PurchaseOrderDetailAddModalProps {
  open: boolean;
  onClose: () => void;
  orderId: number;
  existingInsumoIdsInOrder: number[];
  onDetailAdded: () => void;
}

const PurchaseOrderDetailAddModal: React.FC<PurchaseOrderDetailAddModalProps> = ({
  open,
  onClose,
  orderId,
  existingInsumoIdsInOrder,
  onDetailAdded,
}) => {
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const [insumosList, setInsumosList] = useState<InsumoSummary[]>([]);
  const [insumosLoading, setInsumosLoading] = useState(false);

  // Form state
  const [insumo, setInsumo] = useState<InsumoSummary | null>(null);
  const [cantidadCompra, setCantidadCompra] = useState<string>('');
  const [precioUnitarioCompra, setPrecioUnitarioCompra] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  const fetchInsumos = useCallback(async () => {
    if (open) {
      setInsumosLoading(true);
      setFormError(null);
      try {
        const insumosPage = await getAllInsumos({ size: 1000 });
        const availableInsumos = insumosPage.content
          .filter(i => !existingInsumoIdsInOrder.includes(i.idInsumo))
          .map(i => ({
            idInsumo: i.idInsumo,
            nombreInsumo: i.nombreInsumo,
            unidadMedidaInsumo: i.unidadMedidaInsumo
          }));
        setInsumosList(availableInsumos);
      } catch (err) {
        setFormError("No se pudieron cargar los insumos disponibles.");
      } finally {
        setInsumosLoading(false);
      }
    }
  }, [open, existingInsumoIdsInOrder]);

  useEffect(() => {
    fetchInsumos();
  }, [fetchInsumos]);

  useEffect(() => {
    if (!open) {
      setInsumo(null);
      setCantidadCompra('');
      setPrecioUnitarioCompra('');
      setFormError(null);
      setFieldErrors({});
    }
  }, [open]);

  const validate = () => {
    const errors: { [key: string]: string } = {};
    if (!insumo) errors.insumo = 'Debe seleccionar un insumo.';
    if (!cantidadCompra) errors.cantidadCompra = 'La cantidad es requerida.';
    else if (isNaN(Number(cantidadCompra)) || Number(cantidadCompra) <= 0) errors.cantidadCompra = 'La cantidad debe ser mayor que 0.';
    else if (!/^\d+(\.\d{1,3})?$/.test(cantidadCompra)) errors.cantidadCompra = 'Máximo 3 decimales permitidos.';
    if (!precioUnitarioCompra) errors.precioUnitarioCompra = 'El precio de compra es requerido.';
    else if (isNaN(Number(precioUnitarioCompra)) || Number(precioUnitarioCompra) < 0) errors.precioUnitarioCompra = 'El precio no puede ser negativo.';
    else if (!/^\d+(\.\d{1,2})?$/.test(precioUnitarioCompra)) errors.precioUnitarioCompra = 'Máximo 2 decimales permitidos.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!validate()) return;

    setLoading(true);
    const payload: PurchaseOrderDetailRequest = {
      idInsumo: insumo!.idInsumo,
      cantidadCompra: Number(cantidadCompra),
      precioUnitarioCompra: Number(precioUnitarioCompra),
    };

    try {
      await addDetailToPurchaseOrder(orderId, payload);
      setSnackbarMessage('Insumo añadido a la orden de compra exitosamente.');
      setSnackbarOpen(true);
      onDetailAdded();
      onClose();
    } catch (err: any) {
      const apiError = err as ApiErrorResponseDTO;
      setFormError(apiError?.message || 'Error al añadir el insumo a la orden.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    if (!loading) onClose();
  };
  const handleCloseSnackbar = () => setSnackbarOpen(false);

  return (
    <>
      <Dialog open={open} onClose={handleCloseModal} maxWidth="sm" fullWidth disableEscapeKeyDown={loading}>
        <DialogTitle>Añadir Insumo a Orden de Compra #{orderId}</DialogTitle>
        <DialogContent>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          <Box component="form" onSubmit={handleFormSubmit} noValidate sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Autocomplete
              value={insumo}
              onChange={(_, newValue) => setInsumo(newValue)}
              options={insumosList}
              loading={insumosLoading}
              getOptionLabel={(option) => option ? `${option.nombreInsumo} (ID: ${option.idInsumo})` : ''}
              isOptionEqualToValue={(option, value) => option?.idInsumo === value?.idInsumo}
              renderInput={(params) => (
                <TextField
                  {...params}
                  required
                  autoFocus
                  label="Seleccionar Insumo"
                  error={!!fieldErrors.insumo}
                  helperText={fieldErrors.insumo}
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
            <TextField
              required
              label={`Cantidad ${insumo ? `(${insumo.unidadMedidaInsumo})` : ''}`}
              type="number"
              inputProps={{ min: 0.001, step: "0.001" }}
              value={cantidadCompra}
              onChange={e => setCantidadCompra(e.target.value)}
              error={!!fieldErrors.cantidadCompra}
              helperText={fieldErrors.cantidadCompra}
              disabled={loading || insumosLoading || !insumo}
            />
            <TextField
              required
              label="Precio Unit. Compra"
              type="number"
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                inputProps: { step: "0.01", min: 0 }
              }}
              value={precioUnitarioCompra}
              onChange={e => setPrecioUnitarioCompra(e.target.value)}
              error={!!fieldErrors.precioUnitarioCompra}
              helperText={fieldErrors.precioUnitarioCompra}
              disabled={loading || insumosLoading || !insumo}
            />
            <DialogActions sx={{ px: 0, pb: 0 }}>
              <Button onClick={handleCloseModal} color="inherit" disabled={loading}>
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading || insumosLoading || !insumo}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading ? 'Añadiendo...' : 'Añadir Insumo'}
              </Button>
            </DialogActions>
          </Box>
        </DialogContent>
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

export default PurchaseOrderDetailAddModal;