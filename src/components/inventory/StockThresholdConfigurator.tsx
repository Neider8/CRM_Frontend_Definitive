// src/components/inventory/StockThresholdConfigurator.tsx
import React, { useState, useEffect } from 'react';
import { updateInsumoThreshold, updateProductoThreshold } from '../../services/stockAlertService';
import type { UpdateStockThresholdPayload } from '../../types/stock.types';
import type { ApiErrorResponseDTO } from '../../types/error.types'; // Importar el tipo de DTO de error
// REMOVED: import { AxiosError } from 'axios'; // Se ha eliminado esta importación para evitar el error

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
// Para notificaciones, si usas un sistema de Snackbar de MUI, lo integrarías aquí.
// import { useSnackbar } from 'notistack'; // Ejemplo si usas notistack

interface StockThresholdConfiguratorProps {
  itemId: number;
  itemType: 'Insumo' | 'Producto';
  currentThreshold: number;
  onThresholdUpdate?: (newThreshold: number) => void;
}

const StockThresholdConfigurator: React.FC<StockThresholdConfiguratorProps> = ({
  itemId,
  itemType,
  currentThreshold,
  onThresholdUpdate,
}) => {
  const [threshold, setThreshold] = useState<string>(String(currentThreshold));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  // const { enqueueSnackbar } = useSnackbar(); // Ejemplo

  useEffect(() => {
    setThreshold(String(currentThreshold));
  }, [currentThreshold]);

  const handleUpdate = async () => {
    const numericThreshold = parseFloat(threshold);
    if (isNaN(numericThreshold) || numericThreshold < 0) {
      setError("El umbral debe ser un número positivo o cero.");
      // enqueueSnackbar("El umbral debe ser un número positivo o cero.", { variant: 'error' });
      return;
    }
    setError(null);
    setIsLoading(true);

    const payload: UpdateStockThresholdPayload = { nuevoUmbral: numericThreshold };
    try {
      let message: string;
      if (itemType === 'Insumo') {
        message = await updateInsumoThreshold(itemId, payload);
      } else {
        message = await updateProductoThreshold(itemId, payload);
      }
      // enqueueSnackbar(message || "Umbral actualizado correctamente.", { variant: 'success' });
      console.log(message || "Umbral actualizado correctamente."); // Reemplaza con tu sistema de notificación
      if (onThresholdUpdate) onThresholdUpdate(numericThreshold);
    } catch (err: unknown) { // CAMBIO CLAVE: Usamos 'unknown' en lugar de 'any'
      console.error("Error updating threshold:", err);
      let errorMessage = "No se pudo actualizar el umbral.";

      // Definimos una interfaz para el error de Axios para un tipado más seguro
      interface CustomAxiosError {
        isAxiosError?: boolean;
        response?: {
          data?: ApiErrorResponseDTO;
        };
        message?: string;
      }

      // Se utiliza una comprobación de tipo para 'isAxiosError'
      if (typeof err === 'object' && err !== null && 'isAxiosError' in err) {
        const axiosError = err as CustomAxiosError; // Casteamos a nuestra interfaz para acceder a 'response'
        if (axiosError.isAxiosError) {
          const apiError = axiosError.response?.data;
          if (apiError && apiError.message) {
            errorMessage = apiError.message;
          } else if (axiosError.message) {
            errorMessage = axiosError.message; // Mensaje de error de Axios (ej. "Network Error")
          }
        }
      } else if (err instanceof Error) {
        // Es un error estándar de JavaScript
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      // enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, mt: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        Configurar Umbral Mínimo de Stock
      </Typography>
      <Box component="form" noValidate autoComplete="off" onSubmit={(e) => { e.preventDefault(); handleUpdate(); }}>
        <TextField
          label="Nuevo Umbral"
          type="number"
          value={threshold}
          onChange={(e) => setThreshold(e.target.value)}
          InputProps={{ inputProps: { min: 0, step: "0.01" } }}
          fullWidth
          margin="normal"
          disabled={isLoading}
          error={!!error}
          helperText={error}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleUpdate}
          disabled={isLoading || parseFloat(threshold) === currentThreshold}
          startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {isLoading ? 'Actualizando...' : 'Actualizar Umbral'}
        </Button>
      </Box>
    </Box>
  );
};

export default StockThresholdConfigurator;
