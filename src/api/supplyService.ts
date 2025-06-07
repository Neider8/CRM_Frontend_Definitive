import axiosInstance from './axiosInstance';
import type { PaginatedInsumos, InsumoPageableRequest, InsumoDetails, SupplyCreateRequest, SupplyUpdateRequest } from '../types/supply.types';
import type { ApiErrorResponseDTO } from '../types/error.types';

const API_URL = '/insumos';

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

export const getAllInsumos = async (params?: InsumoPageableRequest): Promise<PaginatedInsumos> => {
  try {
    const response = await axiosInstance.get<PaginatedInsumos>(API_URL, { params });
    return response.data;
  } catch (error: unknown) {
    handleError(error, 'Error al obtener la lista de insumos.');
    return undefined as never;
  }
};
export const getInsumoById = async (id: number): Promise<InsumoDetails> => {
    try {
        const response = await axiosInstance.get<InsumoDetails>(`${API_URL}/${id}`);
        return response.data;
    } catch (error: unknown) {
        handleError(error, `Error al obtener el insumo con ID ${id}.`);
        return undefined as never;
    }
};
export const getInsumoByNombre = async (nombre: string): Promise<InsumoDetails> => {
  try {
    const response = await axiosInstance.get<InsumoDetails>(`${API_URL}/nombre/${nombre}`);
    return response.data;
  } catch (error: unknown) {
    handleError(error, `Error al obtener el insumo con nombre ${nombre}.`);
    return undefined as never;
  }
};
export const createInsumo = async (payload: SupplyCreateRequest): Promise<InsumoDetails> => {
  try {
    const response = await axiosInstance.post<InsumoDetails>(API_URL, payload);
    return response.data;
  } catch (error: unknown) {
    handleError(error, 'Error al crear el insumo.');
    return undefined as never;
  }
};
export const updateInsumo = async (id: number, payload: SupplyUpdateRequest): Promise<InsumoDetails> => {
  try {
    const response = await axiosInstance.put<InsumoDetails>(`${API_URL}/${id}`, payload);
    return response.data;
  } catch (error: unknown) {
    handleError(error, `Error al actualizar el insumo con ID ${id}.`);
    return undefined as never;
  }
};

export const deleteInsumo = async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(`${API_URL}/${id}`);
  } catch (error: unknown) {
    handleError(error, `Error al eliminar el insumo con ID ${id}.`);
  }
};