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

export const getAllPurchaseOrders = async (params?: PurchaseOrderPageableRequest): Promise<PaginatedPurchaseOrders> => {
  try {
    const response = await axiosInstance.get<PaginatedPurchaseOrders>(API_URL, { params });
    return response.data;
  } catch (error: any) {
    if (error.response?.data) { throw error.response.data as ApiErrorResponseDTO; }
    throw new Error('Error al obtener las órdenes de compra.');
  }
};

export const getPurchaseOrderById = async (id: number): Promise<PurchaseOrderDetails> => {
  try {
    // CORREGIDO: Uso correcto de template literals
    const response = await axiosInstance.get<PurchaseOrderDetails>(`${API_URL}/${id}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) { throw error.response.data as ApiErrorResponseDTO; }
    throw new Error(`Error al obtener la orden de compra ID ${id}.`);
  }
};

export const getPurchaseOrdersBySupplierId = async (idProveedor: number): Promise<PurchaseOrderDetails[]> => {
    try {
        // CORREGIDO: Uso correcto de template literals
        const response = await axiosInstance.get<PurchaseOrderDetails[]>(`${API_URL}/proveedor/${idProveedor}`);
        return response.data;
    } catch (error: any) {
        if (error.response?.data) { throw error.response.data as ApiErrorResponseDTO; }
        throw new Error(`Error al obtener las órdenes de compra para el proveedor ID ${idProveedor}.`);
    }
};

export const createPurchaseOrder = async (payload: PurchaseOrderCreateRequest): Promise<PurchaseOrderDetails> => {
  try {
    const response = await axiosInstance.post<PurchaseOrderDetails>(API_URL, payload);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) { throw error.response.data as ApiErrorResponseDTO; }
    throw new Error('Error al crear la orden de compra.');
  }
};

export const updatePurchaseOrderHeader = async (id: number, payload: PurchaseOrderHeaderUpdateRequest): Promise<PurchaseOrderDetails> => {
  try {
    // CORREGIDO: Uso correcto de template literals
    const response = await axiosInstance.put<PurchaseOrderDetails>(`${API_URL}/${id}`, payload);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) { throw error.response.data as ApiErrorResponseDTO; }
    throw new Error(`Error al actualizar la cabecera de la orden de compra ID ${id}.`);
  }
};

export const annulPurchaseOrder = async (id: number): Promise<void> => {
    try {
        // CORREGIDO: Uso correcto de template literals
        await axiosInstance.post(`${API_URL}/${id}/anular`);
    } catch (error: any) {
        if (error.response?.data) { throw error.response.data as ApiErrorResponseDTO; }
        throw new Error(`Error al anular la orden de compra ID ${id}.`);
    }
};

// --- Detalles de la Orden de Compra ---
export const addDetailToPurchaseOrder = async (idOrdenCompra: number, payload: PurchaseOrderDetailRequest): Promise<PurchaseOrderDetailDetails> => {
    try {
        // CORREGIDO: Uso correcto de template literals
        const response = await axiosInstance.post<PurchaseOrderDetailDetails>(`${API_URL}/${idOrdenCompra}/detalles`, payload);
        return response.data;
    } catch (error: any) {
        if (error.response?.data) { throw error.response.data as ApiErrorResponseDTO; }
        throw new Error('Error al añadir detalle a la orden de compra.');
    }
};

export const updateDetailInPurchaseOrder = async (idOrdenCompra: number, idDetalleCompra: number, payload: PurchaseOrderDetailRequest): Promise<PurchaseOrderDetailDetails> => {
    try {
        // CORREGIDO: Uso correcto de template literals
        const response = await axiosInstance.put<PurchaseOrderDetailDetails>(`${API_URL}/${idOrdenCompra}/detalles/${idDetalleCompra}`, payload);
        return response.data;
    } catch (error: any) {
        if (error.response?.data) { throw error.response.data as ApiErrorResponseDTO; }
        throw new Error(`Error al actualizar el detalle de compra ID ${idDetalleCompra}.`);
    }
};

export const removeDetailFromPurchaseOrder = async (idOrdenCompra: number, idDetalleCompra: number): Promise<void> => {
    try {
        // CORREGIDO: Uso correcto de template literals
        await axiosInstance.delete(`${API_URL}/${idOrdenCompra}/detalles/${idDetalleCompra}`);
    } catch (error: any) {
        if (error.response?.data) { throw error.response.data as ApiErrorResponseDTO; }
        throw new Error(`Error al eliminar el detalle de compra ID ${idDetalleCompra}.`);
    }
};