import React from 'react';
import { formatDistanceToNow } from 'date-fns'; // Para mostrar fechas relativas como "hace 5 minutos"
import { es } from 'date-fns/locale'; // Para que el texto esté en español
import type { StockAlert } from '../../types/stock.types';
import { markAlertAsViewed } from '../../api/stockAlertsService';

interface AlertsPanelProps {
  alerts: StockAlert[];      // Recibe la lista completa de alertas
  onAlertClick: () => void; // Función para actualizar el estado después de un clic
}

const AlertsPanel: React.FC<AlertsPanelProps> = ({ alerts, onAlertClick }) => {

  const handleAlertClick = async (alertId: number) => {
    try {
      await markAlertAsViewed(alertId);
      // Aquí podrías agregar navegación a la página del producto/insumo
      console.log(`Alerta ${alertId} marcada como vista.`);
      onAlertClick(); // Llama a la función del padre para que vuelva a cargar las alertas
    } catch (error) {
      console.error("Error al marcar la alerta como vista:", error);
    }
  };
  
  // Filtrar solo las alertas nuevas para mostrar
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