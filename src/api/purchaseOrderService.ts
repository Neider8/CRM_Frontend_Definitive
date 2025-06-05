// src/api/purchaseOrderService.ts
import axiosInstance from './axiosInstance';
import type {
  PurchaseOrderCreateRequest,
  PurchaseOrderDetails,
  PurchaseOrderHeaderUpdateRequest,
  PaginatedPurchaseOrders,
  PurchaseOrderPageableRequest,
  PurchaseOrderDetailRequest,
  PurchaseOrderDetailDetails
} from '../types/purchaseOrder.types';
import type { ApiErrorResponseDTO } from '../types/error.types';

const API_URL = '/ordenes-compra';

// Define a custom interface for Axios errors to ensure type safety
interface CustomAxiosError {
  isAxiosError?: boolean;
  response?: {
    data?: ApiErrorResponseDTO;
    status?: number;
  };
  message?: string;
}

/**
 * Helper function to extract API error message from an unknown error.
 * @param error The unknown error object.
 * @returns An ApiErrorResponseDTO or a generic Error object.
 */
const handleApiError = (error: unknown): ApiErrorResponseDTO | Error => {
  if (typeof error === 'object' && error !== null && 'isAxiosError' in error) {
    const axiosError = error as CustomAxiosError;
    if (axiosError.isAxiosError) {
      if (axiosError.response?.data) {
        return axiosError.response.data;
      }
      // Fallback for Axios errors without specific API response data
      return {
        timestamp: new Date().toISOString(),
        status: axiosError.response?.status || 500,
        error: "Error en la solicitud",
        message: axiosError.message || "Error desconocido en la comunicación con el servidor.",
        path: API_URL // or provide a more specific path if available
      };
    }
  }
  // Generic error handling for non-Axios errors
  if (error instanceof Error) {
    return new Error(error.message);
  }
  return new Error('Error desconocido.');
};


export const getAllPurchaseOrders = async (params?: PurchaseOrderPageableRequest): Promise<PaginatedPurchaseOrders> => {
  try {
    const response = await axiosInstance.get<PaginatedPurchaseOrders>(API_URL, { params });
    return response.data;
  } catch (error: unknown) { // Changed to unknown
    throw handleApiError(error);
  }
};

export const getPurchaseOrderById = async (id: number): Promise<PurchaseOrderDetails> => {
  try {
    const response = await axiosInstance.get<PurchaseOrderDetails>(`${API_URL}/${id}`);
    return response.data;
  } catch (error: unknown) { // Changed to unknown
    throw handleApiError(error);
  }
};

export const getPurchaseOrdersBySupplierId = async (idProveedor: number): Promise<PurchaseOrderDetails[]> => {
    try {
        const response = await axiosInstance.get<PurchaseOrderDetails[]>(`${API_URL}/proveedor/${idProveedor}`);
        return response.data;
    } catch (error: unknown) { // Changed to unknown
        throw handleApiError(error);
    }
};

export const createPurchaseOrder = async (payload: PurchaseOrderCreateRequest): Promise<PurchaseOrderDetails> => {
  try {
    const response = await axiosInstance.post<PurchaseOrderDetails>(API_URL, payload);
    return response.data;
  } catch (error: unknown) { // Changed to unknown
    throw handleApiError(error);
  }
};

export const updatePurchaseOrderHeader = async (id: number, payload: PurchaseOrderHeaderUpdateRequest): Promise<PurchaseOrderDetails> => {
  try {
    const response = await axiosInstance.put<PurchaseOrderDetails>(`${API_URL}/${id}`, payload);
    return response.data;
  } catch (error: unknown) { // Changed to unknown
    throw handleApiError(error);
  }
};

export const annulPurchaseOrder = async (id: number): Promise<void> => {
    try {
        await axiosInstance.post(`${API_URL}/${id}/anular`);
    } catch (error: unknown) { // Changed to unknown
        throw handleApiError(error);
    }
};

// --- Detalles de la Orden de Compra ---
export const addDetailToPurchaseOrder = async (idOrdenCompra: number, payload: PurchaseOrderDetailRequest): Promise<PurchaseOrderDetailDetails> => {
    try {
        const response = await axiosInstance.post<PurchaseOrderDetailDetails>(`${API_URL}/${idOrdenCompra}/detalles`, payload);
        return response.data;
    } catch (error: unknown) { // Changed to unknown
        throw handleApiError(error);
    }
};

export const updateDetailInPurchaseOrder = async (idOrdenCompra: number, idDetalleCompra: number, payload: PurchaseOrderDetailRequest): Promise<PurchaseOrderDetailDetails> => {
    try {
        const response = await axiosInstance.put<PurchaseOrderDetailDetails>(`${API_URL}/${idOrdenCompra}/detalles/${idDetalleCompra}`, payload);
        return response.data;
    } catch (error: unknown) { // Changed to unknown
        throw handleApiError(error);
    }
};

export const removeDetailFromPurchaseOrder = async (idOrdenCompra: number, idDetalleCompra: number): Promise<void> => {
    try {
        await axiosInstance.delete(`${API_URL}/${idOrdenCompra}/detalles/${idDetalleCompra}`);
    } catch (error: unknown) { // Changed to unknown
        throw handleApiError(error);
    }
};
