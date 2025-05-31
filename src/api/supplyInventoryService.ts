// src/api/supplyInventoryService.ts
import axiosInstance from './axiosInstance';
import type {
  SupplyInventoryCreateRequest,
  SupplyInventoryDetails,
  SupplyMovementCreateRequest,
  SupplyMovementDetails,
  PaginatedSupplyInventories,
  SupplyInventoryPageableRequest,
  PaginatedSupplyMovements
} from '../types/inventory.types'; // O crea un supplyInventory.types.ts si prefieres
import type { ApiErrorResponseDTO } from '../types/error.types';

const API_URL = '/inventario-insumos';

export const getAllSupplyInventories = async (params?: SupplyInventoryPageableRequest): Promise<PaginatedSupplyInventories> => {
  try {
    const response = await axiosInstance.get<PaginatedSupplyInventories>(API_URL, { params });
    return response.data;
  } catch (error: any) {
    if (error.response?.data) { throw error.response.data as ApiErrorResponseDTO; }
    throw new Error('Error al obtener los registros de inventario de insumos.');
  }
};

export const getSupplyInventoryById = async (idInventarioInsumo: number): Promise<SupplyInventoryDetails> => {
  try {
    const response = await axiosInstance.get<SupplyInventoryDetails>(`${API_URL}/${idInventarioInsumo}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) { throw error.response.data as ApiErrorResponseDTO; }
    throw new Error(`Error al obtener el registro de inventario de insumo ID ${idInventarioInsumo}.`);
  }
};

export const getSupplyInventoryByInsumoAndLocation = async (idInsumo: number, ubicacion: string): Promise<SupplyInventoryDetails> => {
  try {
    const response = await axiosInstance.get<SupplyInventoryDetails>(`${API_URL}/insumo/${idInsumo}/ubicacion/${encodeURIComponent(ubicacion)}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) { throw error.response.data as ApiErrorResponseDTO; }
    throw new Error(`Error al obtener inventario para insumo ID ${idInsumo} en ubicación ${ubicacion}.`);
  }
};

export const getInventoriesByInsumoId = async (idInsumo: number): Promise<SupplyInventoryDetails[]> => {
  try {
    const response = await axiosInstance.get<SupplyInventoryDetails[]>(`${API_URL}/insumo/${idInsumo}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) { throw error.response.data as ApiErrorResponseDTO; }
    throw new Error(`Error al obtener los inventarios para el insumo ID ${idInsumo}.`);
  }
};


export const createSupplyInventory = async (payload: SupplyInventoryCreateRequest): Promise<SupplyInventoryDetails> => {
  try {
    const response = await axiosInstance.post<SupplyInventoryDetails>(API_URL, payload);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) { throw error.response.data as ApiErrorResponseDTO; }
    throw new Error('Error al crear el registro de inventario de insumo.');
  }
};

export const registerSupplyMovement = async (payload: SupplyMovementCreateRequest): Promise<SupplyMovementDetails> => {
  try {
    const response = await axiosInstance.post<SupplyMovementDetails>(`${API_URL}/movimientos`, payload);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) { throw error.response.data as ApiErrorResponseDTO; }
    throw new Error('Error al registrar el movimiento de inventario de insumo.');
  }
};

export const getMovementsBySupplyInventoryId = async (idInventarioInsumo: number, params?: SupplyInventoryPageableRequest): Promise<PaginatedSupplyMovements> => {
  try {
    const response = await axiosInstance.get<PaginatedSupplyMovements>(`${API_URL}/${idInventarioInsumo}/movimientos`, { params });
    return response.data;
  } catch (error: any) {
    if (error.response?.data) { throw error.response.data as ApiErrorResponseDTO; }
    throw new Error(`Error al obtener movimientos para el inventario de insumo ID ${idInventarioInsumo}.`);
  }
};

export const getCurrentStockForSupplyInventory = async (idInventarioInsumo: number): Promise<number> => { // El backend devuelve BigDecimal, lo casteamos a number
  try {
    const response = await axiosInstance.get<number>(`${API_URL}/${idInventarioInsumo}/stock`);
    return Number(response.data); // Asegurar que sea un número
  } catch (error: any) {
    if (error.response?.data) { throw error.response.data as ApiErrorResponseDTO; }
    throw new Error(`Error al obtener el stock actual para el inventario de insumo ID ${idInventarioInsumo}.`);
  }
};