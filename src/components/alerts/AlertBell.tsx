import React from 'react';
import { FaBell } from 'react-icons/fa'; // Ícono de campana de react-icons

interface AlertBellProps {
  newAlertsCount: number; 
  onClick: () => void;    // Función para abrir/cerrar el panel de alertas
}

const AlertBell: React.FC<AlertBellProps> = ({ newAlertsCount, onClick }) => {
  return (
    <button onClick={onClick} className="relative text-gray-600 hover:text-gray-800 focus:outline-none">
      <FaBell size={24} />
      {newAlertsCount > 0 && (
        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
          {newAlertsCount}
        </span>
      )}
    </button>
  );
};

export default AlertBell;