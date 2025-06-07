import axiosInstance from './axiosInstance';
import type {
  SupplyInventoryCreateRequest,
  InventarioInsumo,
  SupplyMovementCreateRequest,
  SupplyMovementDetails,
  PaginatedSupplyInventories,
  SupplyInventoryPageableRequest,
  PaginatedSupplyMovements
} from '../types/inventory.types';
import type { ApiErrorResponseDTO } from '../types/error.types';

const API_URL = '/inventario-insumos';

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

export const getAllSupplyInventories = async (params?: SupplyInventoryPageableRequest): Promise<PaginatedSupplyInventories> => {
  try {
    const response = await axiosInstance.get<PaginatedSupplyInventories>(API_URL, { params });
    return response.data;
  } catch (error: unknown) {
    handleError(error, 'Error al obtener los registros de inventario de insumos.');
    return undefined as never;
  }
};
export const getInventoriesByInsumoId = async (idInsumo: number): Promise<InventarioInsumo[]> => {
  try {
    const response = await axiosInstance.get<InventarioInsumo[]>(`${API_URL}/insumo/${idInsumo}`);
    return response.data;
  } catch (error: unknown) {
    handleError(error, `Error al obtener los inventarios para el insumo ID ${idInsumo}.`);
    return undefined as never;
  }
};
export const getSupplyInventoryById = async (idInventarioInsumo: number): Promise<InventarioInsumo> => {
  try {
    const response = await axiosInstance.get<InventarioInsumo>(`${API_URL}/${idInventarioInsumo}`);
    return response.data;
  } catch (error: unknown) {
    handleError(error, `Error al obtener el registro de inventario ID ${idInventarioInsumo}.`);
    return undefined as never;
  }
};
export const createSupplyInventory = async (payload: SupplyInventoryCreateRequest): Promise<InventarioInsumo> => {
  try {
    const response = await axiosInstance.post<InventarioInsumo>(API_URL, payload);
    return response.data;
  } catch (error: unknown) {
    handleError(error, 'Error al crear el registro de inventario.');
    return undefined as never;
  }
};
export const registerSupplyMovement = async (payload: SupplyMovementCreateRequest): Promise<SupplyMovementDetails> => {
  try {
    const response = await axiosInstance.post<SupplyMovementDetails>(`${API_URL}/movimientos`, payload);
    return response.data;
  } catch (error: unknown) {
    handleError(error, 'Error al registrar el movimiento de inventario.');
    return undefined as never;
  }
};
export const getMovementsBySupplyInventoryId = async (idInventarioInsumo: number, params?: SupplyInventoryPageableRequest): Promise<PaginatedSupplyMovements> => {
  try {
    const response = await axiosInstance.get<PaginatedSupplyMovements>(`${API_URL}/${idInventarioInsumo}/movimientos`, { params });
    return response.data;
  } catch (error: unknown) {
    handleError(error, `Error al obtener movimientos para el inventario ID ${idInventarioInsumo}.`);
    return undefined as never;
  }
};
export const getCurrentStockForSupplyInventory = async (idInventarioInsumo: number): Promise<number> => {
  try {
    const response = await axiosInstance.get<number>(`${API_URL}/${idInventarioInsumo}/stock`);
    return Number(response.data);
  } catch (error: unknown) {
    handleError(error, `Error al obtener el stock actual para el inventario ID ${idInventarioInsumo}.`);
    return undefined as never;
  }
};