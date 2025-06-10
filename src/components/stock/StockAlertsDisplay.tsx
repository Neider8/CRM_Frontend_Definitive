// src/components/dashboard/StockAlertsDisplay.tsx

import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, List, ListItem, ListItemIcon, ListItemText, CircularProgress, Alert } from '@mui/material';
import { WarningAmber } from '@mui/icons-material';
import { getActiveStockAlerts } from '../../api/stockAlertsService';
import type { StockAlert } from '../../types/stock.types';

const StockAlertsDisplay: React.FC = () => {
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        const activeAlerts = await getActiveStockAlerts();
        setAlerts(activeAlerts.filter(a => a.estadoAlerta === 'Nueva'));
        setError(null);
      } catch (err) {
        setError('No se pudieron cargar las alertas de stock.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="div">
          Alertas de Stock Bajo
        </Typography>
        {alerts.length > 0 ? (
          <List>
            {alerts.map((alert) => (
              <ListItem key={alert.idAlerta}>
                <ListItemIcon>
                  <WarningAmber color="error" />
                </ListItemIcon>
                <ListItemText
                  primary={alert.nombreItem}
                  secondary={`Stock actual: ${alert.nivelActual} (Umbral: ${alert.umbralConfigurado})`}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography color="text.secondary" sx={{ mt: 2 }}>
            No hay alertas de stock bajo en este momento.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default StockAlertsDisplay;