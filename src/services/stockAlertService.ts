import axiosInstance from '../api/axiosInstance'; // Asegúrate de que esta ruta a tu axiosInstance es correcta
import type { StockAlert, UpdateStockThresholdPayload } from '../types/stock.types';
import type { ApiErrorResponseDTO } from '../types/error.types';

const API_URL = '/stock-alerts'; // Base URL del controlador de alertas

/**
 * Obtiene las alertas de stock activas ('Nueva', 'Vista') desde el backend.
 * @returns Promise<StockAlert[]> - Una lista de alertas de stock.
 */
export const getActiveStockAlerts = async (): Promise<StockAlert[]> => {
  try {
    // CORRECCIÓN: El endpoint correcto es '/active'
    const response = await axiosInstance.get<StockAlert[]>(`${API_URL}/active`);
    return response.data;
  } catch (error: unknown) {
    console.error("Error fetching stock alerts:", error);
    if (
      typeof error === 'object' && error !== null && 'response' in error &&
      typeof (error as { response?: unknown }).response === 'object' &&
      (error as { response?: { data?: unknown } }).response !== null &&
      'data' in (error as { response: { data?: unknown } }).response
    ) {
      throw (error as { response: { data: ApiErrorResponseDTO } }).response.data;
    }
    throw new Error('Error desconocido al obtener las alertas de stock.');
  }
};

// --- IMPLEMENTACIÓN DE LAS FUNCIONES FALTANTES ---

/**
 * Marca una alerta específica como "Vista".
 * @param alertId - El ID de la alerta a marcar.
 * @returns Promise<void>
 */
export const markAlertAsViewed = async (alertId: number): Promise<void> => {
  try {
    await axiosInstance.put(`${API_URL}/${alertId}/view`);
  } catch (error: unknown) {
    console.error("Error al marcar la alerta como vista:", error);
    if (
        typeof error === 'object' && error !== null && 'response' in error &&
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
      await axiosInstance.put(`${API_URL}/${alertId}/resolve`);
    } catch (error: unknown) {
      console.error("Error al resolver la alerta:", error);
      if (
          typeof error === 'object' && error !== null && 'response' in error &&
          typeof (error as { response?: unknown }).response === 'object' &&
          (error as { response?: { data?: unknown } }).response !== null &&
          'data' in (error as { response: { data?: unknown } }).response
        ) {
          throw (error as { response: { data: ApiErrorResponseDTO } }).response.data;
        }
        throw new Error('Error desconocido al resolver la alerta.');
    }
  };

// --- Las funciones de actualizar umbral ya estaban bien, se mantienen ---

export const updateInsumoThreshold = async (
    idInsumo: number,
    payload: UpdateStockThresholdPayload
  ): Promise<string> => {
    try {
      const response = await axiosInstance.put<string>(`${API_URL}/threshold/insumo/${idInsumo}`, payload);
      return response.data;
    } catch (error: unknown) {
      console.error("Error updating insumo threshold:", error);
      if (
          typeof error === 'object' && error !== null && 'response' in error &&
          typeof (error as { response?: unknown }).response === 'object' &&
          (error as { response?: { data?: unknown } }).response !== null &&
          'data' in (error as { response: { data?: unknown } }).response
        ) {
          throw (error as { response: { data: ApiErrorResponseDTO } }).response.data;
        }
        throw new Error('Error desconocido al actualizar el umbral del insumo.');
    }
  };
  
  export const updateProductoThreshold = async (
    idProducto: number,
    payload: UpdateStockThresholdPayload
  ): Promise<string> => {
    try {
      const response = await axiosInstance.put<string>(`${API_URL}/threshold/producto/${idProducto}`, payload);
      return response.data;
    } catch (error: unknown) {
      console.error("Error updating producto terminado threshold:", error);
      if (
          typeof error === 'object' && error !== null && 'response' in error &&
          typeof (error as { response?: unknown }).response === 'object' &&
          (error as { response?: { data?: unknown } }).response !== null &&
          'data' in (error as { response: { data?: unknown } }).response
        ) {
          throw (error as { response: { data: ApiErrorResponseDTO } }).response.data;
        }
        throw new Error('Error desconocido al actualizar el umbral del producto.');
    }
  };