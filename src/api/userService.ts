// src/api/userService.ts
import axiosInstance from './axiosInstance';
import type { UserInfo } from '../types/auth.types';
import type { RegisterPayload } from '../types/auth.types'; // Usaremos RegisterPayload para la creación por admin
import type { UsuarioUpdateRequest } from '../types/user.types'; // Crearemos este tipo
import type { ChangePasswordRequest } from '../types/user.types'; // Crearemos este tipo
import type { Page, PageableRequest } from '../types/page.types'; // Crearemos estos tipos
import type { ApiErrorResponseDTO } from '../types/error.types';

/**
 * Obtiene una lista paginada de todos los usuarios.
 * Requiere rol ADMINISTRADOR o GERENTE en el backend.
 */
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

/**
 * Obtiene un usuario por su ID.
 * Accesible por el propio usuario, o por ADMINISTRADOR/GERENTE.
 */
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

/**
 * Obtiene un usuario por su nombre de usuario.
 * Accesible por el propio usuario, o por ADMINISTRADOR/GERENTE.
 */
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

/**
 * Crea un nuevo usuario (ruta de administrador).
 * El backend espera un UsuarioCreateRequestDTO.
 * Reutilizamos RegisterPayload que tiene una estructura similar.
 * Requiere rol ADMINISTRADOR en el backend.
 */
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

/**
 * Actualiza la información de un usuario.
 * El backend espera un UsuarioUpdateRequestDTO.
 * Permite al propio usuario (limitado) o a un ADMINISTRADOR (más campos).
 */
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

/**
 * Cambia la contraseña de un usuario.
 * El backend espera un ChangePasswordRequestDTO.
 * Si el usuario cambia su propia contraseña, debe proporcionar la contraseña actual.
 * Un administrador podría no necesitar la contraseña actual (a verificar en el backend si es el caso).
 */
export const changeUserPassword = async (idUsuario: number, payload: ChangePasswordRequest): Promise<string> => {
  try {
    // El backend devuelve un string simple "Contraseña cambiada exitosamente."
    const response = await axiosInstance.post<string>(`/usuarios/${idUsuario}/change-password`, payload);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw error.response.data as ApiErrorResponseDTO;
    }
    throw new Error(`Error al cambiar la contraseña del usuario con ID ${idUsuario}.`);
  }
};

/**
 * Elimina un usuario por su ID.
 * Requiere rol ADMINISTRADOR en el backend.
 */
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