// src/api/productInventoryService.ts
import axiosInstance from './axiosInstance';
import type {
  SupplyInventoryCreateRequest,
  SupplyMovementCreateRequest,
  SupplyInventoryPageableRequest
} from '../types/inventory.types';
import type { ApiErrorResponseDTO } from '../types/error.types';

const API_URL = '/inventario-productos';

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
};