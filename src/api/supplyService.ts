// src/api/supplyService.ts (o insumoService.ts)
import axiosInstance from './axiosInstance';
import type { PaginatedInsumos, InsumoPageableRequest, InsumoDetails, SupplyCreateRequest, SupplyUpdateRequest } from '../types/supply.types';
import type { ApiErrorResponseDTO } from '../types/error.types';

const API_URL = '/insumos';

export const getAllInsumos = async (params?: InsumoPageableRequest): Promise<PaginatedInsumos> => {
  try {
    const response = await axiosInstance.get<PaginatedInsumos>(API_URL, { params });
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) { throw error.response.data as ApiErrorResponseDTO; }
    throw new Error('Error al obtener la lista de insumos.');
  }
};

export const getInsumoById = async (id: number): Promise<InsumoDetails> => {
    try {
        const response = await axiosInstance.get<InsumoDetails>(`${API_URL}/${id}`);
        return response.data;
    } catch (error: any) {
        if (error.response && error.response.data) { throw error.response.data as ApiErrorResponseDTO; }
        throw new Error(`Error al obtener el insumo con ID ${id}.`);
    }
};

export const getInsumoByNombre = async (nombre: string): Promise<InsumoDetails> => {
  try {
    const response = await axiosInstance.get<InsumoDetails>(`${API_URL}/nombre/${nombre}`);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) { throw error.response.data as ApiErrorResponseDTO; }
    throw new Error(`Error al obtener el insumo con nombre ${nombre}.`);
  }
};

export const createInsumo = async (payload: SupplyCreateRequest): Promise<InsumoDetails> => {
  try {
    const response = await axiosInstance.post<InsumoDetails>(API_URL, payload);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) { throw error.response.data as ApiErrorResponseDTO; }
    throw new Error('Error al crear el insumo.');
  }
};

export const updateInsumo = async (id: number, payload: SupplyUpdateRequest): Promise<InsumoDetails> => {
  try {
    const response = await axiosInstance.put<InsumoDetails>(`${API_URL}/${id}`, payload);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) { throw error.response.data as ApiErrorResponseDTO; }
    throw new Error(`Error al actualizar el insumo con ID ${id}.`);
  }
};

export const deleteInsumo = async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(`${API_URL}/${id}`);
  } catch (error: any) {
    if (error.response && error.response.data) { throw error.response.data as ApiErrorResponseDTO; }
    throw new Error(`Error al eliminar el insumo con ID ${id}.`);
  }
};