// src/types/user.types.ts
import type { UserInfo as AuthUserInfo } from './auth.types';
export type UserInfo = AuthUserInfo;

// Basado en UsuarioUpdateRequestDTO del backend
export interface UsuarioUpdateRequest {
  idEmpleado?: number | null;
  rolUsuario: string; // ← Ya no es opcional
  nombre?: string;
  apellido?: string;
  email?: string;
  telefono?: string;
}

// Basado en ChangePasswordRequestDTO del backend
export interface ChangePasswordRequest {
  currentPassword?: string; // Opcional si el admin lo cambia y el backend no lo requiere
  newPassword: string;
}

// Podríamos tener un UserAdminCreateRequest si difiere mucho de RegisterPayload
// export type UserAdminCreateRequest = RegisterPayload; // Por ahora, podemos reutilizar RegisterPayload

 // Re-exportar UserInfo para conveniencia si se importa solo user.types.ts