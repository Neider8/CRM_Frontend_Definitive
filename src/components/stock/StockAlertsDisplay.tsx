import React, { useEffect, useState } from 'react';
import { Box, Typography, Alert, AlertTitle, CircularProgress, IconButton, Collapse } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import { getActiveStockAlerts, markAlertAsViewed } from '../../services/stockAlertService'; // Asegúrate que la ruta es correcta
import type { StockAlert } from '../../types/stock.types'; // Asegúrate que la ruta es correcta
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const StockAlertsDisplay: React.FC = () => {
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = () => {
    setLoading(true);
    getActiveStockAlerts()
      .then(data => {
        // Mostraremos solo las alertas 'Nuevas' en esta sección del dashboard
        setAlerts(data.filter(a => a.estadoAlerta === 'Nueva'));
        setError(null);
      })
      .catch(err => {
        console.error("Error al obtener alertas de stock:", err);
        setError("No se pudieron cargar las alertas de stock.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAlerts();
    // No es necesario un polling aquí si el Header ya lo hace,
    // pero se mantiene para que el componente sea independiente.
    const intervalId = setInterval(fetchAlerts, 60000); // Refresca cada minuto
    return () => clearInterval(intervalId);
  }, []);

  const handleDismiss = (alertId: number) => {
    // Marcar como vista en el backend
    markAlertAsViewed(alertId).catch(err => console.error("Error al descartar alerta:", err));
    // Eliminar de la UI inmediatamente para una mejor experiencia de usuario
    setAlerts(currentAlerts => currentAlerts.filter(a => a.idAlerta !== alertId));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
        <CircularProgress size={20} sx={{ mr: 1 }} />
        <Typography variant="body2" color="text.secondary">Cargando alertas de stock...</Typography>
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (alerts.length === 0) {
    return (
      <Alert severity="success" variant="outlined">
        <AlertTitle>¡Todo en Orden!</AlertTitle>
        No hay alertas de stock urgentes en este momento.
      </Alert>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
            <WarningAmberIcon sx={{mr: 1, verticalAlign: 'middle'}}/>
            Alertas de Stock Urgentes
        </Typography>
      {alerts.map(alert => (
        <Collapse in={true} key={alert.idAlerta}>
          <Alert
            severity="warning"
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => handleDismiss(alert.idAlerta)}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
          >
            <AlertTitle>
              <strong>{alert.tipoItem}: Stock Bajo</strong> - <Typography variant="caption">{formatDistanceToNow(new Date(alert.fechaCreacion), { addSuffix: true, locale: es })}</Typography>
            </AlertTitle>
            {alert.mensaje}
          </Alert>
        </Collapse>
      ))}
    </Box>
  );
};

export default StockAlertsDisplay;