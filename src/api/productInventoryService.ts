// src/api/productInventoryService.ts

import axiosInstance from './axiosInstance';
import type {
<<<<<<< HEAD
  ProductInventoryCreateRequest,
  ProductInventoryDetails,
  ProductMovementCreateRequest,
  ProductMovementDetails,
  PaginatedProductInventories,
  ProductInventoryPageableRequest,
  PaginatedProductMovements
=======
  SupplyInventoryCreateRequest,
  SupplyMovementCreateRequest,
  SupplyInventoryPageableRequest
>>>>>>> 2a49766616649f063a915b51d41bddd2ac0eb837
} from '../types/inventory.types';
import type { ApiErrorResponseDTO } from '../types/error.types';

const API_URL = '/inventario-productos';

<<<<<<< HEAD
/**
 * Función de ayuda para manejar errores de API de forma centralizada.
 * Re-lanza un error estructurado del backend si existe, o uno genérico en caso contrario.
 * @param error El objeto de error capturado.
 * @param defaultMessage El mensaje de error a usar si no hay uno específico del API.
 */
const handleApiError = (error: any, defaultMessage: string): never => {
    if (error.response?.data) {
        throw error.response.data as ApiErrorResponseDTO;
    }
    throw new Error(defaultMessage);
};

// --- SERVICIOS DE INVENTARIO DE PRODUCTOS ---

export const getAllProductInventories = async (params?: ProductInventoryPageableRequest): Promise<PaginatedProductInventories> => {
    try {
        const response = await axiosInstance.get<PaginatedProductInventories>(API_URL, { params });
        return response.data;
    } catch (error: any) {
        handleApiError(error, 'Error al obtener los registros de inventario de productos.');
    }
};

export const getProductInventoryById = async (idInventarioProducto: number): Promise<ProductInventoryDetails> => {
    try {
        const response = await axiosInstance.get<ProductInventoryDetails>(`${API_URL}/${idInventarioProducto}`);
        return response.data;
    } catch (error: any) {
        handleApiError(error, `Error al obtener el registro de inventario de producto ID ${idInventarioProducto}.`);
    }
};

export const getProductInventoryByProductAndLocation = async (idProducto: number, ubicacion: string): Promise<ProductInventoryDetails> => {
    try {
        const response = await axiosInstance.get<ProductInventoryDetails>(`${API_URL}/producto/${idProducto}/ubicacion/${encodeURIComponent(ubicacion)}`);
        return response.data;
    } catch (error: any) {
        handleApiError(error, `Error al obtener inventario para producto ID ${idProducto} en ubicación ${ubicacion}.`);
    }
};

export const getInventoriesByProductId = async (idProducto: number): Promise<ProductInventoryDetails[]> => {
    try {
        const response = await axiosInstance.get<ProductInventoryDetails[]>(`${API_URL}/producto/${idProducto}`);
        return response.data;
    } catch (error: any) {
        handleApiError(error, `Error al obtener los inventarios para el producto ID ${idProducto}.`);
    }
};

export const createProductInventory = async (payload: ProductInventoryCreateRequest): Promise<ProductInventoryDetails> => {
    try {
        const response = await axiosInstance.post<ProductInventoryDetails>(API_URL, payload);
        return response.data;
    } catch (error: any) {
        handleApiError(error, 'Error al crear el registro de inventario de producto.');
    }
};

// --- SERVICIOS DE MOVIMIENTOS DE INVENTARIO ---

export const registerProductMovement = async (payload: ProductMovementCreateRequest): Promise<ProductMovementDetails> => {
    try {
        const response = await axiosInstance.post<ProductMovementDetails>(`${API_URL}/movimientos`, payload);
        return response.data;
    } catch (error: any) {
        handleApiError(error, 'Error al registrar el movimiento de inventario de producto.');
    }
};

export const getMovementsByProductInventoryId = async (idInventarioProducto: number, params?: ProductInventoryPageableRequest): Promise<PaginatedProductMovements> => {
    try {
        const response = await axiosInstance.get<PaginatedProductMovements>(`${API_URL}/${idInventarioProducto}/movimientos`, { params });
        return response.data;
    } catch (error: any) {
        handleApiError(error, `Error al obtener movimientos para el inventario de producto ID ${idInventarioProducto}.`);
    }
};

export const getCurrentStockForProductInventory = async (idInventarioProducto: number): Promise<number> => {
    try {
        const response = await axiosInstance.get<number>(`${API_URL}/${idInventarioProducto}/stock`);
        return response.data;
    } catch (error: any) {
        handleApiError(error, `Error al obtener el stock actual para el inventario de producto ID ${idInventarioProducto}.`);
    }
=======
// TODO: Replace 'any' with the correct type if available in inventory.types
export const getAllProductInventories = async (params?: SupplyInventoryPageableRequest): Promise<any> => {
  try {
    const response = await axiosInstance.get<any>(API_URL, { params });
    return response.data;
  } catch (error: any) {
    if (error.response?.data) { throw error.response.data as ApiErrorResponseDTO; }
    throw new Error('Error al obtener los registros de inventario de productos.');
  }
};

export const getProductInventoryById = async (idInventarioProducto: number): Promise<any> => {
  try {
    const response = await axiosInstance.get<any>(`${API_URL}/${idInventarioProducto}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) { throw error.response.data as ApiErrorResponseDTO; }
    throw new Error(`Error al obtener el registro de inventario de producto ID ${idInventarioProducto}.`);
  }
};

export const getProductInventoryByProductAndLocation = async (idProducto: number, ubicacion: string): Promise<any> => {
  try {
    const response = await axiosInstance.get<any>(`${API_URL}/producto/${idProducto}/ubicacion/${encodeURIComponent(ubicacion)}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) { throw error.response.data as ApiErrorResponseDTO; }
    throw new Error(`Error al obtener inventario para producto ID ${idProducto} en ubicación ${ubicacion}.`);
  }
};

export const getInventoriesByProductId = async (idProducto: number): Promise<any[]> => {
  try {
    const response = await axiosInstance.get<any[]>(`${API_URL}/producto/${idProducto}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) { throw error.response.data as ApiErrorResponseDTO; }
    throw new Error(`Error al obtener los inventarios para el producto ID ${idProducto}.`);
  }
};

export const createProductInventory = async (payload: SupplyInventoryCreateRequest): Promise<any> => {
  try {
    const response = await axiosInstance.post<any>(API_URL, payload);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) { throw error.response.data as ApiErrorResponseDTO; }
    throw new Error('Error al crear el registro de inventario de producto.');
  }
};

export const registerProductMovement = async (payload: SupplyMovementCreateRequest): Promise<any> => {
  try {
    const response = await axiosInstance.post<any>(`${API_URL}/movimientos`, payload);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) { throw error.response.data as ApiErrorResponseDTO; }
    throw new Error('Error al registrar el movimiento de inventario de producto.');
  }
};
// TODO: Replace 'any' with the correct type if available in inventory.types
export const getMovementsByProductInventoryId = async (idInventarioProducto: number, params?: SupplyInventoryPageableRequest): Promise<any> => {
  try {
    const response = await axiosInstance.get<any>(`${API_URL}/${idInventarioProducto}/movimientos`, { params });
    return response.data;
  } catch (error: any) {
    if (error.response?.data) { throw error.response.data as ApiErrorResponseDTO; }
    throw new Error(`Error al obtener movimientos para el inventario de producto ID ${idInventarioProducto}.`);
  }
};

export const getCurrentStockForProductInventory = async (idInventarioProducto: number): Promise<number> => {
  try {
    const response = await axiosInstance.get<number>(`${API_URL}/${idInventarioProducto}/stock`);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) { throw error.response.data as ApiErrorResponseDTO; }
    throw new Error(`Error al obtener el stock actual para el inventario de producto ID ${idInventarioProducto}.`);
  }
>>>>>>> 2a49766616649f063a915b51d41bddd2ac0eb837
};