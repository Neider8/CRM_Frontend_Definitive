// src/api/rolePermissionService.ts
import axiosInstance from './axiosInstance';
import type { RolePermissionAssignment, RolePermissionResponse } from '../types/rolePermission.types';
import type { PermisoResponseDTO } from '../types/permission.types';
import type { ApiErrorResponseDTO } from '../types/error.types';

const API_URL = '/roles-permisos';

export const getPermissionsForRole = async (rolNombre: string): Promise<PermisoResponseDTO[]> => {
  try {
    // Corrección: uso de template literal y encodeURIComponent
    const response = await axiosInstance.get<PermisoResponseDTO[]>(`${API_URL}/${encodeURIComponent(rolNombre)}/permisos`);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) { throw error.response.data as ApiErrorResponseDTO; }
    throw new Error(`Error al obtener permisos para el rol ${rolNombre}.`);
  }
};

export const assignPermissionToRole = async (payload: RolePermissionAssignment): Promise<RolePermissionResponse> => {
  try {
    const response = await axiosInstance.post<RolePermissionResponse>(API_URL, payload);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) { throw error.response.data as ApiErrorResponseDTO; }
    throw new Error('Error al asignar permiso al rol.');
  }
};

export const removePermissionFromRole = async (rolNombre: string, idPermiso: number): Promise<void> => {
  try {
    // Corrección: uso de template literal y encodeURIComponent
    await axiosInstance.delete(`${API_URL}/${encodeURIComponent(rolNombre)}/permisos/${idPermiso}`);
  } catch (error: any) {
    if (error.response?.data) { throw error.response.data as ApiErrorResponseDTO; }
    throw new Error(`Error al remover permiso del rol ${rolNombre}.`);
  }
};