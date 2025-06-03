// src/api/permissionService.ts
import axiosInstance from './axiosInstance';
import type { PermisoResponseDTO, PermisoRequest } from '../types/permission.types'; // Asegúrate que PermisoRequest esté aquí
import type { ApiErrorResponseDTO } from '../types/error.types';

const API_URL = '/permisos';

export const getAllPermissions = async (): Promise<PermisoResponseDTO[]> => {
  try {
    // El backend devuelve List<PermisoResponseDTO>, no paginado
    const response = await axiosInstance.get<PermisoResponseDTO[]>(API_URL);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) { throw error.response.data as ApiErrorResponseDTO; }
    throw new Error('Error al obtener la lista de permisos.');
  }
};

export const getPermissionById = async (id: number): Promise<PermisoResponseDTO> => {
  try {
    const response = await axiosInstance.get<PermisoResponseDTO>(`${API_URL}/${id}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) { throw error.response.data as ApiErrorResponseDTO; }
    throw new Error(`Error al obtener el permiso ID ${id}.`);
  }
};

export const createPermission = async (payload: PermisoRequest): Promise<PermisoResponseDTO> => {
  try {
    const response = await axiosInstance.post<PermisoResponseDTO>(API_URL, payload);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) { throw error.response.data as ApiErrorResponseDTO; }
    throw new Error('Error al crear el permiso.');
  }
};

export const updatePermission = async (id: number, payload: PermisoRequest): Promise<PermisoResponseDTO> => {
  try {
    const response = await axiosInstance.put<PermisoResponseDTO>(`${API_URL}/${id}`, payload);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) { throw error.response.data as ApiErrorResponseDTO; }
    throw new Error(`Error al actualizar el permiso ID ${id}.`);
  }
};

export const deletePermission = async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(`${API_URL}/${id}`);
  } catch (error: any) {
    if (error.response?.data) { throw error.response.data as ApiErrorResponseDTO; }
    throw new Error(`Error al eliminar el permiso ID ${id}.`);
  }
};