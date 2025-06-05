// src/services/stockAlertService.ts

import axiosInstance from '../api/axiosInstance'; // Asumiendo que tienes configurado tu axiosInstance
import type { StockAlert, UpdateStockThresholdPayload } from '../types/stock.types'; // Define estos tipos
import type { ApiErrorResponseDTO } from '../types/error.types'; // Importa el tipo de error para un mejor manejo

const API_URL = '/stock-alerts'; // Base URL del controlador de alertas

/**
 * Obtiene las alertas de stock activas desde el backend.
 * @returns Promise<StockAlert[]> - Una lista de alertas de stock.
 */
export const getActiveStockAlerts = async (): Promise<StockAlert[]> => {
  try {
    const response = await axiosInstance.get<StockAlert[]>(API_URL);
    return response.data;
  } catch (error: unknown) {
    // Manejo de errores similar al de authService.ts
    console.error("Error fetching stock alerts:", error);
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
 * Actualiza el umbral de stock para un insumo (materia prima).
 * @param idInsumo - ID del insumo.
 * @param payload - Objeto con el nuevo umbral.
 * @returns Promise<string> - Mensaje de éxito del backend.
 */
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
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof (error as { response?: unknown }).response === 'object' &&
        (error as { response?: { data?: unknown } }).response !== null &&
        'data' in (error as { response: { data?: unknown } }).response
    ) {
        throw (error as { response: { data: ApiErrorResponseDTO } }).response.data;
    }
    throw new Error('Error desconocido al actualizar el umbral del insumo.');
  }
};

/**
 * Actualiza el umbral de stock para un producto terminado.
 * @param idProducto - ID del producto terminado.
 * @param payload - Objeto con el nuevo umbral.
 * @returns Promise<string> - Mensaje de éxito del backend.
 */
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
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof (error as { response?: unknown }).response === 'object' &&
        (error as { response?: { data?: unknown } }).response !== null &&
        'data' in (error as { response: { data?: unknown } }).response
    ) {
        throw (error as { response: { data: ApiErrorResponseDTO } }).response.data;
    }
    throw new Error('Error desconocido al actualizar el umbral del producto.');
  }
};

// Agrega aquí más funciones si implementaste marcar alertas como vistas, etc.
// export const markAlertAsViewed = async (idAlerta: number, idUsuarioVista: number): Promise<void> => { ... }
// export const markAlertAsResolved = async (idAlerta: number, idUsuarioResuelve: number): Promise<void> => { ... }
