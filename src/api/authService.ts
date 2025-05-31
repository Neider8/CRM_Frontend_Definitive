// src/api/authService.ts
import axiosInstance from './axiosInstance';
import type { LoginCredentials, AuthTokenPayload, RegisterPayload, UserInfo } from '../types/auth.types';
import type { ApiErrorResponseDTO } from '../types/error.types';

/**
 * Envía las credenciales de login al backend.
 * @param credentials - Nombre de usuario y contraseña.
 * @returns Promise<AuthTokenPayload> - La respuesta del token JWT del backend.
 */
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

/**
 * Envía los datos de registro de un nuevo usuario al backend.
 * Tu backend en AuthController para /register devuelve un UsuarioResponseDTO,
 * así que tipamos la respuesta esperada como UserInfo (nuestra interfaz frontend para UsuarioResponseDTO).
 * @param payload - Datos para el registro del nuevo usuario.
 * @returns Promise<UserInfo> - La información del usuario creado.
 */
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

// Podrías añadir otras funciones aquí, como:
// - refreshToken() si implementas refresh tokens.
// - forgotPassword(), resetPassword(), etc.