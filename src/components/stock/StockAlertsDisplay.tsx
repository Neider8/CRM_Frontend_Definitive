import React, { useEffect, useState } from 'react';
import { Box, Typography, Alert, AlertTitle, CircularProgress, Collapse } from '@mui/material';
import { TransitionGroup } from 'react-transition-group';
import { getActiveStockAlerts } from '../../api/stockAlertsService'; // Asegúrate que esta ruta sea correcta
import type { StockAlert } from '../../types/stock.types'; // Importamos el tipo que acabamos de crear

const StockAlertsDisplay: React.FC = () => {
    const [alerts, setAlerts] = useState<StockAlert[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                // No reiniciar el loading en cada intervalo para una actualización más suave
                if (loading) setLoading(true);
                const activeAlerts = await getActiveStockAlerts();
                setAlerts(activeAlerts);
                setError(null);
            } catch (err) {
                console.error("Error al obtener alertas de stock:", err);
                setError("No se pudieron cargar las alertas de stock. Verifique la conexión con el servidor.");
            } finally {
                setLoading(false);
            }
        };

        fetchAlerts();
        const intervalId = setInterval(fetchAlerts, 60000); // Refresca cada 1 minuto

        return () => clearInterval(intervalId);
    }, []);

    const handleDismiss = (idToDismiss: number) => {
        setAlerts(currentAlerts => currentAlerts.filter(alert => alert.idAlerta !== idToDismiss));
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
                <CircularProgress size={24} />
                <Typography>Cargando alertas de stock...</Typography>
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    if (alerts.length === 0) {
        return <Alert severity="success">¡Excelente! No hay alertas de stock activas.</Alert>;
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
                Alertas de Stock Urgentes
            </Typography>
            <TransitionGroup>
                {alerts.map((alert, index) => (
                    // CORRECCIÓN: Se genera una clave robusta. Usa el idAlerta si existe, 
                    // de lo contrario, crea una clave única combinando otros datos y el índice.
                    // Esto soluciona el error "Encountered two children with the same key, null".
                    <Collapse key={alert.idAlerta ?? `${alert.tipoItem}-${alert.idItem}-${index}`}>
                        <Alert
                            severity="warning"
                            onClose={() => handleDismiss(alert.idAlerta)}
                            sx={{ mb: 2, alignItems: 'center' }}
                        >
                            <AlertTitle sx={{ fontWeight: 'bold' }}>
                                {alert.tipoItem}: Stock Bajo
                            </AlertTitle>
                            {alert.mensaje}
                        </Alert>
                    </Collapse>
                ))}
            </TransitionGroup>
        </Box>
    );
};

export default StockAlertsDisplay;
