/**
 * Define la estructura de una alerta de stock como llega desde el API del backend.
 */
export interface StockAlert {
  idAlerta: number;
  tipoItem: 'Insumo' | 'Producto';
  idItem: number;
  nombreItem: string;
  mensaje: string;
  nivelActual: number;
  umbralConfigurado: number;
  fechaCreacion: string; // La fecha llega como un string en formato ISO.
  estadoAlerta: 'Nueva' | 'Vista' | 'Resuelta';
}

/**
 * Define el payload para la solicitud de actualización del umbral de stock.
 */
export interface UpdateStockThresholdPayload {
  nuevoUmbral: number;
}
