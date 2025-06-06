import axiosInstance from './axiosInstance'; // Usando tu instancia de Axios configurada
import type { StockAlert } from '../types/stock.types'; // El tipo que acabamos de crear
import type { ApiErrorResponseDTO } from '../types/error.types'; // Asumiendo que tienes un tipo para errores

/**
 * Obtiene todas las alertas de stock activas ('Nueva', 'Vista').
 * @returns Promise<StockAlert[]> - Una lista de las alertas activas.
 */
export const getActiveStockAlerts = async (): Promise<StockAlert[]> => {
  try {
    const response = await axiosInstance.get<StockAlert[]>('/stock-alerts/active');
    return response.data;
  } catch (error: unknown) {
    // Replicamos el manejo de errores de tus otros servicios para consistencia
    if (
      typeof error === 'object' &&
      error !== null &&
      'response' in error &&
      typeof (error as { response?: unknown }).response === 'object' &&
      (error as { response?: { data?: unknown } }).response !== null &&
      'data' in (error as { response: { data?: unknown } }).response
    ) {
      throw (error as { response: { data: ApiErrorResponseDTO } }).response.data;
    }
    throw new Error('Error desconocido al obtener las alertas de stock.');
  }
};

/**
 * Marca una alerta específica como "Vista".
 * @param alertId - El ID de la alerta a marcar.
 * @returns Promise<void>
 */
export const markAlertAsViewed = async (alertId: number): Promise<void> => {
  try {
    // Hacemos un PUT al endpoint correspondiente. No esperamos contenido en la respuesta.
    await axiosInstance.put(`/stock-alerts/${alertId}/view`);
  } catch (error: unknown) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'response' in error &&
      typeof (error as { response?: unknown }).response === 'object' &&
      (error as { response?: { data?: unknown } }).response !== null &&
      'data' in (error as { response: { data?: unknown } }).response
    ) {
      throw (error as { response: { data: ApiErrorResponseDTO } }).response.data;
    }
    throw new Error('Error desconocido al marcar la alerta como vista.');
  }
};

/**
 * Marca una alerta específica como "Resuelta".
 * @param alertId - El ID de la alerta a resolver.
 * @returns Promise<void>
 */
export const markAlertAsResolved = async (alertId: number): Promise<void> => {
  try {
    // Hacemos un PUT al endpoint correspondiente.
    await axiosInstance.put(`/stock-alerts/${alertId}/resolve`);
  } catch (error: unknown) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'response' in error &&
      typeof (error as { response?: unknown }).response === 'object' &&
      (error as { response?: { data?: unknown } }).response !== null &&
      'data' in (error as { response: { data?: unknown } }).response
    ) {
      throw (error as { response: { data: ApiErrorResponseDTO } }).response.data;
    }
    throw new Error('Error desconocido al resolver la alerta.');
  }
};