// src/types/user.types.ts
import type { UserInfo as AuthUserInfo } from './auth.types';

// Extender AuthUserInfo para incluir 'habilitado'
// Esto asume que AuthUserInfo es la base para la información del usuario en el frontend
export interface UserInfo extends AuthUserInfo {
    habilitado: boolean; // Agregado: el estado de habilitación del usuario
}

// Basado en UsuarioUpdateRequestDTO del backend
export interface UsuarioUpdateRequest {
    idEmpleado?: number | null;
    rolUsuario?: string; // Hacemos opcional para la actualización parcial
    nombre?: string; // Si se planea actualizar desde el frontend
    apellido?: string; // Si se planea actualizar desde el frontend
    email?: string; // Si se planea actualizar desde el frontend
    telefono?: string; // Si se planea actualizar desde el frontend
    habilitado?: boolean; // Agregado: para habilitar/deshabilitar el usuario
}

// Basado en ChangePasswordRequestDTO del backend
export interface ChangePasswordRequest {
    currentPassword?: string; // Opcional si el admin lo cambia y el backend no lo requiere
    newPassword: string;
}

// Podríamos tener un UserAdminCreateRequest si difiere mucho de RegisterPayload
// export type UserAdminCreateRequest = RegisterPayload; // Por ahora, podemos reutilizar RegisterPayload

// Re-exportar UserInfo para conveniencia si se importa solo user.types.ts