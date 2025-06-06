/**
 * Representa la estructura de una alerta de stock que se recibe del backend.
 * Coincide con el StockAlertDTO de Java.
 */
export interface StockAlert {
  idAlerta: number;
  tipoItem: 'Insumo' | 'Producto';
  idItem: number;
  mensaje: string;
  nivelActual: number;
  umbralConfigurado: number;
  fechaCreacion: string;
  estadoAlerta: 'Nueva' | 'Vista' | 'Resuelta';
}

/**
 * Representa el payload para actualizar el umbral de stock.
 * Coincide con el UpdateStockThresholdDTO de Java.
 */
export interface UpdateStockThresholdPayload {
  nuevoUmbral: number; // Corresponde a BigDecimal en Java
}