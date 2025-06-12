// src/api/authService.ts
import axiosInstance from './axiosInstance';
import type { LoginCredentials, AuthTokenPayload, RegisterPayload, UserInfo } from '../types/auth.types';
import type { ApiErrorResponseDTO } from '../types/error.types';

export const loginUser = async (credentials: LoginCredentials): Promise<AuthTokenPayload> => {
  try {
    const response = await axiosInstance.post<AuthTokenPayload>('/auth/login', credentials);
    return response.data;
  } catch (error: unknown) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'response' in error &&
      typeof (error as { response?: unknown }).response === 'object' &&
      (error as { response?: { data?: unknown } }).response !== null &&
      'data' in (error as { response: { data?: unknown } }).response
    ) {
      throw (error as { response: { data: ApiErrorResponseDTO } }).response.data;
    }
    throw new Error('Error desconocido durante el inicio de sesión.');
  }
};

// La respuesta del backend (UsuarioResponseDTO) se mapea a la interfaz UserInfo del frontend.
export const registerUser = async (payload: RegisterPayload): Promise<UserInfo> => {
  try {
    const response = await axiosInstance.post<UserInfo>('/auth/register', payload);
    return response.data;
  } catch (error: unknown) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'response' in error &&
      typeof (error as { response?: unknown }).response === 'object' &&
      (error as { response?: { data?: unknown } }).response !== null &&
      'data' in (error as { response: { data?: unknown } }).response
    ) {
      throw (error as { response: { data: ApiErrorResponseDTO } }).response.data;
    }
    throw new Error('Error desconocido durante el registro.');
  }
};