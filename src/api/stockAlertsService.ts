import axiosInstance from './axiosInstance';
import type { StockAlert } from '../types/stock.types';
import type { ApiErrorResponseDTO } from '../types/error.types';

const API_URL = '/stock-alerts';

// Un manejador de errores simplificado y reutilizable
const handleError = (error: unknown, fallbackMessage: string): never => {
    if (typeof error === 'object' && error !== null && 'response' in error) {
        const responseError = error as { response?: { data?: ApiErrorResponseDTO } };
        if (responseError.response?.data?.message) {
            throw new Error(responseError.response.data.message);
        }
    }
    throw new Error(fallbackMessage);
};

export const getActiveStockAlerts = async (): Promise<StockAlert[]> => {
  try {
    const response = await axiosInstance.get<StockAlert[]>(`${API_URL}/active`);
    return response.data;
  } catch (error: unknown) {
    handleError(error, 'Error desconocido al obtener las alertas de stock.');
    throw new Error('Error desconocido al obtener las alertas de stock.');
  }
};

export const markAlertAsViewed = async (alertId: number): Promise<void> => {
  try {
    // CORRECCIÓN: Cambiado de .put a .post para coincidir con el @PostMapping del backend
    await axiosInstance.post(`${API_URL}/${alertId}/view`);
  } catch (error: unknown) {
    handleError(error, 'Error desconocido al marcar la alerta como vista.');
  }
};

export const markAlertAsResolved = async (alertId: number): Promise<void> => {
  try {
    // CORRECCIÓN: Cambiado de .put a .post para coincidir con el @PostMapping del backend
    await axiosInstance.post(`${API_URL}/${alertId}/resolve`);
  } catch (error: unknown) {
    handleError(error, 'Error desconocido al resolver la alerta.');
  }
};

// --- Las funciones de actualizar umbral ya estaban bien ---
export const updateInsumoThreshold = async (insumoId: number, newThreshold: number): Promise<string> => {
    try {
        const response = await axiosInstance.put<string>(`${API_URL}/threshold/insumo/${insumoId}`, {
            nuevoUmbral: newThreshold,
        });
        return response.data;
    } catch (error: unknown) {
        handleError(error, `Error al actualizar el umbral para el insumo ID ${insumoId}.`);
        return '';
    }
};

export const updateProductoThreshold = async (productoId: number, newThreshold: number): Promise<string> => {
    try {
        const response = await axiosInstance.put<string>(`${API_URL}/threshold/producto/${productoId}`, {
            nuevoUmbral: newThreshold,
        });
        return response.data;
    } catch (error: unknown) {
        handleError(error, `Error al actualizar el umbral para el producto ID ${productoId}.`);
        return ''; 
    }
};