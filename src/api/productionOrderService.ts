// src/api/productionOrderService.ts
import axiosInstance from './axiosInstance';
import type {
  ProductionOrderCreateRequest,
  ProductionOrderDetails,
  ProductionOrderHeaderUpdateRequest,
  PaginatedProductionOrders,
  ProductionOrderPageableRequest,
  ProductionTaskCreateRequest,
  ProductionTaskDetails,
  ProductionTaskUpdateRequest
} from '../types/productionOrder.types';
import type { ApiErrorResponseDTO } from '../types/error.types';

const API_URL = '/ordenes-produccion';

export const getAllProductionOrders = async (params?: ProductionOrderPageableRequest): Promise<PaginatedProductionOrders> => {
  try {
    const response = await axiosInstance.get<PaginatedProductionOrders>(API_URL, { params });
    return response.data;
  } catch (error: any) {
    if (error.response?.data) { throw error.response.data as ApiErrorResponseDTO; }
    throw new Error('Error al obtener las órdenes de producción.');
  }
};

export const getProductionOrderById = async (id: number): Promise<ProductionOrderDetails> => {
  try {
    const response = await axiosInstance.get<ProductionOrderDetails>(`${API_URL}/${id}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) { throw error.response.data as ApiErrorResponseDTO; }
    throw new Error(`Error al obtener la orden de producción ID ${id}.`);
  }
};

export const getProductionOrdersBySalesOrderId = async (idOrdenVenta: number): Promise<ProductionOrderDetails[]> => {
    try {
        const response = await axiosInstance.get<ProductionOrderDetails[]>(`${API_URL}/por-orden-venta/${idOrdenVenta}`);
        return response.data;
    } catch (error: any) {
        if (error.response?.data) { throw error.response.data as ApiErrorResponseDTO; }
        throw new Error(`Error al obtener órdenes de producción para la orden de venta ID ${idOrdenVenta}.`);
    }
};

export const createProductionOrder = async (payload: ProductionOrderCreateRequest): Promise<ProductionOrderDetails> => {
  try {
    const response = await axiosInstance.post<ProductionOrderDetails>(API_URL, payload);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) { throw error.response.data as ApiErrorResponseDTO; }
    throw new Error('Error al crear la orden de producción.');
  }
};

export const updateProductionOrderHeader = async (id: number, payload: ProductionOrderHeaderUpdateRequest): Promise<ProductionOrderDetails> => {
  try {
    const response = await axiosInstance.put<ProductionOrderDetails>(`${API_URL}/${id}`, payload);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) { throw error.response.data as ApiErrorResponseDTO; }
    throw new Error(`Error al actualizar la cabecera de la orden de producción ID ${id}.`);
  }
};

export const annulProductionOrder = async (id: number): Promise<void> => {
    try {
        await axiosInstance.post(`${API_URL}/${id}/anular`);
    } catch (error: any) {
        if (error.response?.data) { throw error.response.data as ApiErrorResponseDTO; }
        throw new Error(`Error al anular la orden de producción ID ${id}.`);
    }
};

// --- Tareas de Producción ---

export const addTaskToProductionOrder = async (idOrdenProduccion: number, payload: ProductionTaskCreateRequest): Promise<ProductionTaskDetails> => {
    try {
        const response = await axiosInstance.post<ProductionTaskDetails>(`${API_URL}/${idOrdenProduccion}/tareas`, payload);
        return response.data;
    } catch (error: any) {
        if (error.response?.data) { throw error.response.data as ApiErrorResponseDTO; }
        throw new Error('Error al añadir tarea a la orden de producción.');
    }
};

export const updateTaskInProductionOrder = async (
    idOrdenProduccion: number,
    idTarea: number,
    payload: ProductionTaskUpdateRequest
): Promise<ProductionTaskDetails> => {
    try {
        const cleanPayload = Object.fromEntries(
            Object.entries(payload).filter(([_, v]) => v !== null && v !== undefined)
        );
        console.log('Payload limpio enviado a PUT tarea:', cleanPayload);
        const response = await axiosInstance.put<ProductionTaskDetails>(
            `${API_URL}/${idOrdenProduccion}/tareas/${idTarea}`,
            cleanPayload
        );
        return response.data;
    } catch (error: any) {
        if (error.response?.data) { throw error.response.data as ApiErrorResponseDTO; }
        throw new Error(`Error al actualizar la tarea ID ${idTarea}.`);
    }
};

export const removeTaskFromProductionOrder = async (idOrdenProduccion: number, idTarea: number): Promise<void> => {
    try {
        await axiosInstance.delete(`${API_URL}/${idOrdenProduccion}/tareas/${idTarea}`);
    } catch (error: any) {
        if (error.response?.data) { throw error.response.data as ApiErrorResponseDTO; }
        throw new Error(`Error al eliminar la tarea ID ${idTarea}.`);
    }
};