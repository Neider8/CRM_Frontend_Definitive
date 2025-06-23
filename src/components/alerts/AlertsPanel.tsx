import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale'; // Para formato de fecha en español
import type { StockAlert } from '../../types/stock.types';
import { markAlertAsViewed } from '../../api/stockAlertsService';

interface AlertsPanelProps {
  alerts: StockAlert[];
  onAlertClick: () => void;
}

const AlertsPanel: React.FC<AlertsPanelProps> = ({ alerts, onAlertClick }) => {

  const handleAlertClick = async (alertId: number) => {
    try {
      await markAlertAsViewed(alertId);
      // Notifica al componente padre para que actualice el estado y cierre el panel.
      onAlertClick();
    } catch (error) {
      console.error("Error al marcar la alerta como vista:", error);
    }
  };
  
  const newAlerts = alerts.filter(alert => alert.estadoAlerta === 'Nueva');

  return (
    <div className="absolute right-0 w-80 mt-2 p-2 bg-white rounded-lg shadow-xl z-20">
      <div className="font-bold text-lg mb-2 text-gray-800">Notificaciones</div>
      <div className="flex flex-col gap-2">
        {newAlerts.length > 0 ? (
          newAlerts.map((alert) => (
            <div
              key={alert.idAlerta}
              onClick={() => handleAlertClick(alert.idAlerta)}
              className="p-3 bg-blue-50 hover:bg-blue-100 rounded-md cursor-pointer border-l-4 border-blue-500"
            >
              <p className="font-semibold text-sm text-gray-700">{alert.mensaje}</p>
              <p className="text-xs text-gray-500 mt-1">
                {formatDistanceToNow(new Date(alert.fechaCreacion), { addSuffix: true, locale: es })}
              </p>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500 p-3">No tienes notificaciones nuevas.</p>
        )}
      </div>
    </div>
  );
};

export default AlertsPanel;