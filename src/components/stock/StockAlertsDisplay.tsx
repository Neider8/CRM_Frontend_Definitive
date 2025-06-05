// src/components/stock/StockAlertsDisplay.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { getActiveStockAlerts } from '../../services/stockAlertService'; // Ajusta la ruta
import type { StockAlert as StockAlertType } from '../../types/stock.types'; // Ajusta la ruta
import { formatDate } from '../../utils/formatting'; // Asegúrate que la ruta a tus formatters sea correcta

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
// Iconos de MUI (o puedes usar lucide-react si ya lo tienes y prefieres)
import ReportProblemIcon from '@mui/icons-material/ReportProblem'; // Para alertas
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'; // Para "todo en orden"
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';


interface StockAlertsDisplayProps {
  autoRefreshInterval?: number; // en milisegundos
  initiallyExpanded?: boolean;
}

const StockAlertsDisplay: React.FC<StockAlertsDisplayProps> = ({ autoRefreshInterval, initiallyExpanded = true }) => {
  const [alerts, setAlerts] = useState<StockAlertType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<boolean>(initiallyExpanded);

  const fetchAlerts = useCallback(async () => {
    try {
      // No establecer loading a true aquí si es una actualización en segundo plano
      // setLoading(true);
      const activeAlerts = await getActiveStockAlerts();
      setAlerts(activeAlerts);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch stock alerts:", err);
      setError("No se pudieron cargar las alertas de stock. Intenta de nuevo más tarde.");
    } finally {
      setLoading(false); // Solo la primera vez o si hubo error
    }
  }, []);

  useEffect(() => {
    setLoading(true); // Carga inicial
    fetchAlerts();

    if (autoRefreshInterval && autoRefreshInterval > 0) {
      const intervalId = setInterval(() => {
        console.log("Actualizando alertas de stock en segundo plano...");
        fetchAlerts(); // No establece setLoading para actualizaciones en segundo plano
      }, autoRefreshInterval);
      return () => clearInterval(intervalId);
    }
  }, [fetchAlerts, autoRefreshInterval]);

  const handleToggleExpand = () => {
    setExpanded(!expanded);
  };

  if (loading && alerts.length === 0) { // Mostrar solo si es la carga inicial y no hay alertas previas
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
        <CircularProgress size={24} sx={{ mr: 2 }} />
        <Typography>Cargando alertas de stock...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        <AlertTitle>Error de Carga</AlertTitle>
        {error}
      </Alert>
    );
  }

  if (alerts.length === 0 && !loading) { // No mostrar si está cargando en segundo plano
    return (
      <Alert severity="success" icon={<CheckCircleOutlineIcon fontSize="inherit" />} sx={{ my: 2 }}>
        No hay alertas de stock activas en este momento. ¡Todo en orden!
      </Alert>
    );
  }

  return (
    <Box sx={{ my: 2, width: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 1,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          bgcolor: alerts.length > 0 ? 'warning.light' : 'background.paper',
          cursor: 'pointer',
        }}
        onClick={handleToggleExpand}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ReportProblemIcon sx={{ mr: 1, color: alerts.length > 0 ? 'warning.contrastText' : 'text.secondary' }} />
          <Typography variant="h6" component="div" sx={{ color: alerts.length > 0 ? 'warning.contrastText' : 'text.primary' }}>
            Alertas de Stock Bajo ({alerts.length})
          </Typography>
        </Box>
        <IconButton size="small">
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box sx={{ pt: 1 }}>
          {alerts.length === 0 && (
             <Alert severity="info" sx={{ mt: 1}}>No hay alertas activas para mostrar.</Alert>
          )}
          {alerts.map((alert, index) => (
            <Alert
              severity="warning" // O podrías usar "error" si lo consideras más crítico
              key={alert.idAlerta || `${alert.tipoItem}-${alert.idItem}-${index}`}
              sx={{ mb: 1 }}
            >
              <AlertTitle>
                ¡Stock Bajo! - {alert.nombreItem}
                <Typography variant="caption" component="span" sx={{ ml: 1 }}>
                  ({alert.tipoItem === 'Insumo' ? 'Materia Prima' : 'Producto Terminado'})
                </Typography>
              </AlertTitle>
              <Typography variant="body2">{alert.mensaje}</Typography>
              <Typography variant="body2">
                <strong>Stock Actual:</strong> {alert.nivelActual}
              </Typography>
              <Typography variant="body2">
                <strong>Umbral Mínimo:</strong> {alert.umbralConfigurado}
              </Typography>
              <Typography variant="caption" display="block" sx={{ mt: 0.5, color: 'text.secondary' }}>
                Registrado el: {formatDate(alert.fechaCreacion)}
              </Typography>
              {/* Aquí podrías añadir botones para acciones usando Button de MUI */}
            </Alert>
          ))}
        </Box>
      </Collapse>
    </Box>
  );
};

export default StockAlertsDisplay;