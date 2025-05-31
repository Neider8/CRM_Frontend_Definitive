// src/types/employee.types.ts
// import type { UsuarioSummary } from './auth.types'; // Reutilizamos UsuarioSummary si es necesario para el usuario asociado
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
  // usuario?: UsuarioSummary | null; // Usamos el UsuarioSummaryDTO que ya teníamos
  usuario?: {
    idUsuario: number;
    nombreUsuario: string;
    rolUsuario: string;
  };
}

// Para la lista paginada
export type PaginatedEmployees = Page<EmployeeDetails>;
export type EmployeePageableRequest = PageableRequest;