// src/types/permission.types.ts

export interface PermisoResponseDTO {
  idPermiso: number;
  nombrePermiso: string;
  // descripcionPermiso?: string; // Si la añades en el backend
}

// Tipo para crear/actualizar permisos
export interface PermisoRequest {
  nombrePermiso: string;
  // descripcionPermiso?: string; // Si decides añadirlo al DTO y entidad del backend
}