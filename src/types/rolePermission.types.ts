// src/types/rolePermission.types.ts
import type { PermisoResponseDTO } from './permission.types'; // Asumiendo que tienes permission.types.ts

export interface RolePermissionAssignment {
  rolNombre: string;
  idPermiso: number;
}

export interface RolePermissionResponse extends RolePermissionAssignment {
  idRolPermiso: number;
  permiso: PermisoResponseDTO;
}

// Simplemente para la UI, si los roles son fijos:
export type SystemRole = 'Administrador' | 'Gerente' | 'Operario' | 'Ventas';