// src/types/employee.types.ts
import type { Page, PageableRequest } from './page.types';

// Basado en EmpleadoCreateRequestDTO del backend
export interface EmployeeCreateRequest {
  tipoDocumento: 'Cédula' | 'Otro';
  numeroDocumento: string;
  nombreEmpleado: string;
  cargoEmpleado?: string | null;
  areaEmpleado?: string | null;
  salarioEmpleado?: number | null; // En el backend es BigDecimal, en frontend usaremos number
  fechaContratacionEmpleado?: string | null; // Formato YYYY-MM-DD
}

// Basado en EmpleadoUpdateRequestDTO del backend
export interface EmployeeUpdateRequest {
  nombreEmpleado?: string;
  cargoEmpleado?: string | null;
  areaEmpleado?: string | null;
  salarioEmpleado?: number | null;
  fechaContratacionEmpleado?: string | null; // Formato YYYY-MM-DD
  // tipoDocumento y numeroDocumento no se actualizan según el DTO
}

// Resumen de empleado para usar en otras entidades (como tareas de producción)
export interface EmpleadoSummary {
  idEmpleado: number;
  nombreEmpleado: string;
  cargoEmpleado?: string | null;
}

// Basado en EmpleadoResponseDTO del backend
export interface EmployeeDetails {
  idEmpleado: number;
  tipoDocumento: string;
  numeroDocumento: string;
  nombreEmpleado: string;
  cargoEmpleado?: string | null;
  areaEmpleado?: string | null;
  salarioEmpleado?: number | null; // BigDecimal se mapea a number
  fechaContratacionEmpleado?: string | null; // LocalDate se mapea a string YYYY-MM-DD
  fechaCreacion: string; // LocalDateTime se mapea a string ISO
  fechaActualizacion?: string | null; // LocalDateTime se mapea a string ISO
  usuario?: {
    idUsuario: number;
    nombreUsuario: string;
    rolUsuario: string;
  };
}

// Para la lista paginada
export type PaginatedEmployees = Page<EmployeeDetails>;
export type EmployeePageableRequest = PageableRequest;