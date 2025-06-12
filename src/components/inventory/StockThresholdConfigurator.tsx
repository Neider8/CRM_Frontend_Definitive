import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, CircularProgress } from '@mui/material';
import { updateInsumoThreshold, updateProductoThreshold } from '../../api/stockAlertsService';

interface StockThresholdConfiguratorProps {
  itemId: number;
  itemType: 'Insumo' | 'Producto';
  currentThreshold: number;
  onThresholdUpdate: (newThreshold: number) => void;
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

  useEffect(() => {
    setThreshold(String(currentThreshold));
  }, [currentThreshold]);

  const handleUpdate = async () => {
    const numericThreshold = parseFloat(threshold);
    if (isNaN(numericThreshold) || numericThreshold < 0) {
      setError("El umbral debe ser un número positivo o cero.");
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      if (itemType === 'Insumo') {
        await updateInsumoThreshold(itemId, numericThreshold);
      } else {
        await updateProductoThreshold(itemId, numericThreshold);
      }
      onThresholdUpdate(numericThreshold);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'No se pudo actualizar el umbral.';
      console.error("Error updating threshold:", err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Configurar Umbral de Alerta
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>
        Recibirás una alerta cuando el stock en esta ubicación baje de este valor.
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
          helperText={error || `Umbral actual: ${currentThreshold}`}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={isLoading || parseFloat(threshold) === currentThreshold}
          sx={{ minWidth: 150 }}
        >
          {isLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Actualizar Umbral'
          )}
        </Button>
      </Box>
    </Box>
  );
};

export default StockThresholdConfigurator;