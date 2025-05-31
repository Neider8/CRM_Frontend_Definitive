// src/types/auth.types.ts

// Basado en JwtResponseDTO del backend
export interface AuthTokenPayload {
  token: string;
  type?: string; // 'Bearer'
  idUsuario: number;
  nombreUsuario: string;
  rolUsuario: string; // O podrías definir un Enum si los roles son fijos
}

// Basado en LoginRequestDTO del backend
export interface LoginCredentials {
  nombreUsuario: string;
  contrasena: string;
}

// Basado en UsuarioCreateRequestDTO del backend
export interface RegisterPayload {
  idEmpleado?: number | null;
  nombreUsuario: string;
  contrasena: string;
  rolUsuario: string;
}

// Para la información del usuario que se podría guardar en el contexto/estado global
// Basado en UsuarioResponseDTO y EmpleadoSummaryDTO
export interface EmpleadoSummary {
  idEmpleado: number;
  numeroDocumento: string;
  nombreEmpleado: string;
}

export interface UserInfo {
  idUsuario: number;
  nombreUsuario: string;
  rolUsuario: string;
  fechaCreacion?: string; // Las fechas LocalDateTime se recibirán como strings ISO
  fechaActualizacion?: string;
  empleado?: EmpleadoSummary | null;
  // Podrías añadir permisos si los obtienes y los necesitas en el frontend
  // permisos?: string[];
}