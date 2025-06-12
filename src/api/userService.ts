// src/api/userService.ts
import axiosInstance from './axiosInstance';
import type { UserInfo, RegisterPayload } from '../types/auth.types';
import type { UsuarioUpdateRequest, ChangePasswordRequest } from '../types/user.types';
import type { Page, PageableRequest } from '../types/page.types';
import type { ApiErrorResponseDTO } from '../types/error.types';

// Requiere: ROL_ADMINISTRADOR o ROL_GERENTE.
export const getAllUsuarios = async (params?: PageableRequest): Promise<Page<UserInfo>> => {
  try {
    const response = await axiosInstance.get<Page<UserInfo>>('/usuarios', { params });
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw error.response.data as ApiErrorResponseDTO;
    }
    throw new Error('Error al obtener la lista de usuarios.');
  }
};

// Accesible por el propio usuario, o por ROL_ADMINISTRADOR/ROL_GERENTE.
export const getUsuarioById = async (id: number): Promise<UserInfo> => {
  try {
    const response = await axiosInstance.get<UserInfo>(`/usuarios/${id}`);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw error.response.data as ApiErrorResponseDTO;
    }
    throw new Error(`Error al obtener el usuario con ID ${id}.`);
  }
};

// Accesible por el propio usuario, o por ROL_ADMINISTRADOR/ROL_GERENTE.
export const getUsuarioByNombreUsuario = async (nombreUsuario: string): Promise<UserInfo> => {
  try {
    const response = await axiosInstance.get<UserInfo>(`/usuarios/username/${nombreUsuario}`);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw error.response.data as ApiErrorResponseDTO;
    }
    throw new Error(`Error al obtener el usuario con nombre de usuario ${nombreUsuario}.`);
  }
};

// Crea un usuario (ruta de admin), reutilizando el tipo `RegisterPayload`. Requiere: ROL_ADMINISTRADOR.
export const createUsuarioAdmin = async (payload: RegisterPayload): Promise<UserInfo> => {
  try {
    const response = await axiosInstance.post<UserInfo>('/usuarios', payload);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw error.response.data as ApiErrorResponseDTO;
    }
    throw new Error('Error al crear el usuario.');
  }
};

// Actualiza un usuario. Accesible por el propio usuario (limitado) o por un ROL_ADMINISTRADOR.
export const updateUsuarioAdmin = async (id: number, payload: UsuarioUpdateRequest): Promise<UserInfo> => {
  try {
    const response = await axiosInstance.put<UserInfo>(`/usuarios/${id}`, payload);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw error.response.data as ApiErrorResponseDTO;
    }
    throw new Error(`Error al actualizar el usuario con ID ${id}.`);
  }
};

// Cambia la contraseña. El payload requiere `contrasenaActual` si el usuario lo hace por sí mismo.
// El backend responde con un string de confirmación.
export const changeUserPassword = async (idUsuario: number, payload: ChangePasswordRequest): Promise<string> => {
  try {
    const response = await axiosInstance.post<string>(`/usuarios/${idUsuario}/change-password`, payload);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw error.response.data as ApiErrorResponseDTO;
    }
    throw new Error(`Error al cambiar la contraseña del usuario con ID ${idUsuario}.`);
  }
};

// Elimina un usuario. Requiere: ROL_ADMINISTRADOR.
export const deleteUsuarioAdmin = async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/usuarios/${id}`);
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw error.response.data as ApiErrorResponseDTO;
    }
    throw new Error(`Error al eliminar el usuario con ID ${id}.`);
  }
};