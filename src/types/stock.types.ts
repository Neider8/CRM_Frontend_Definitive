// src/types/stock.types.ts

/**
 * Interfaz para representar una alerta de stock.
 * Corresponde al StockAlertDTO del backend.
 */
export interface StockAlert {
  idAlerta?: number; // Opcional, si la alerta es persistida en la DB y tiene un ID propio
  tipoItem: 'Insumo' | 'Producto'; // Cambiado de 'MateriaPrima' a 'Insumo' para coincidir con el backend
  idItem: number;
  nombreItem: string;
  mensaje: string;
  nivelActual: number; // Asumiendo que BigDecimal del backend se mapea a number en JSON
  umbralConfigurado: number; // Asumiendo que BigDecimal del backend se mapea a number en JSON
  fechaCreacion: string; // Formato ISO date string (ej. "2024-05-15T10:30:45.123Z")
  estadoAlerta?: 'Nueva' | 'Vista' | 'Resuelta'; // Opcional, si se gestiona el estado de la alerta
}

/**
 * Interfaz para el payload de actualización del umbral de stock.
 * Corresponde a ChangeThresholdRequestDTO o similar en el backend.
 */
export interface UpdateStockThresholdPayload {
  nuevoUmbral: number; // El nuevo valor del umbral
}
