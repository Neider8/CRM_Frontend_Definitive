// src/api/salesOrderService.ts
import axiosInstance from './axiosInstance';
import type {
  SalesOrderCreateRequest,
  SalesOrderDetails,
  SalesOrderHeaderUpdateRequest,
  PaginatedSalesOrders,
  SalesOrderPageableRequest,
  SalesOrderDetailRequest,
  SalesOrderDetailDetails
} from '../types/salesOrder.types';
import type { ApiErrorResponseDTO } from '../types/error.types';

const API_URL = '/ordenes-venta';

export const getAllSalesOrders = async (params?: SalesOrderPageableRequest): Promise<PaginatedSalesOrders> => {
  try {
    const response = await axiosInstance.get<PaginatedSalesOrders>(API_URL, { params });
    return response.data;
  } catch (error: any) {
    if (error.response?.data) { throw error.response.data as ApiErrorResponseDTO; }
    throw new Error('Error al obtener las órdenes de venta.');
  }
};

export const getSalesOrderById = async (id: number): Promise<SalesOrderDetails> => {
  try {
    const response = await axiosInstance.get<SalesOrderDetails>(`${API_URL}/${id}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) { throw error.response.data as ApiErrorResponseDTO; }
    throw new Error(`Error al obtener la orden de venta ID ${id}.`);
  }
};

export const getSalesOrdersByClientId = async (idCliente: number): Promise<SalesOrderDetails[]> => {
    try {
        const response = await axiosInstance.get<SalesOrderDetails[]>(`${API_URL}/cliente/${idCliente}`);
        return response.data;
    } catch (error: any) {
        if (error.response?.data) { throw error.response.data as ApiErrorResponseDTO; }
        throw new Error(`Error al obtener las órdenes de venta para el cliente ID ${idCliente}.`);
    }
};

export const createSalesOrder = async (payload: SalesOrderCreateRequest): Promise<SalesOrderDetails> => {
  try {
    const response = await axiosInstance.post<SalesOrderDetails>(API_URL, payload);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) { throw error.response.data as ApiErrorResponseDTO; }
    throw new Error('Error al crear la orden de venta.');
  }
};

export const updateSalesOrderHeader = async (id: number, payload: SalesOrderHeaderUpdateRequest): Promise<SalesOrderDetails> => {
  try {
    const response = await axiosInstance.put<SalesOrderDetails>(`${API_URL}/${id}`, payload);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) { throw error.response.data as ApiErrorResponseDTO; }
    throw new Error(`Error al actualizar la cabecera de la orden de venta ID ${id}.`);
  }
};

export const annulSalesOrder = async (id: number): Promise<void> => {
    try {
        await axiosInstance.post(`${API_URL}/${id}/anular`);
    } catch (error: any) {
        if (error.response?.data) { throw error.response.data as ApiErrorResponseDTO; }
        throw new Error(`Error al anular la orden de venta ID ${id}.`);
    }
};


// --- Detalles de la Orden de Venta ---
export const addDetailToSalesOrder = async (idOrdenVenta: number, payload: SalesOrderDetailRequest): Promise<SalesOrderDetailDetails> => {
    try {
        const response = await axiosInstance.post<SalesOrderDetailDetails>(`${API_URL}/${idOrdenVenta}/detalles`, payload);
        return response.data;
    } catch (error: any) {
        if (error.response?.data) { throw error.response.data as ApiErrorResponseDTO; }
        throw new Error('Error al añadir detalle a la orden de venta.');
    }
};

export const updateDetailInSalesOrder = async (idOrdenVenta: number, idDetalleVenta: number, payload: SalesOrderDetailRequest): Promise<SalesOrderDetailDetails> => {
    try {
        const response = await axiosInstance.put<SalesOrderDetailDetails>(`${API_URL}/${idOrdenVenta}/detalles/${idDetalleVenta}`, payload);
        return response.data;
    } catch (error: any) {
        if (error.response?.data) { throw error.response.data as ApiErrorResponseDTO; }
        throw new Error(`Error al actualizar el detalle ID ${idDetalleVenta}.`);
    }
};

export const removeDetailFromSalesOrder = async (idOrdenVenta: number, idDetalleVenta: number): Promise<void> => {
    try {
        await axiosInstance.delete(`${API_URL}/${idOrdenVenta}/detalles/${idDetalleVenta}`);
    } catch (error: any) {
        if (error.response?.data) { throw error.response.data as ApiErrorResponseDTO; }
        throw new Error(`Error al eliminar el detalle ID ${idDetalleVenta}.`);
    }
};