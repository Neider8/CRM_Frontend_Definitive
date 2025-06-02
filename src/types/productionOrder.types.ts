// src/types/productionOrder.types.ts
import type { Page } from './page.types';
import type { PageableRequest } from './page.types';
import type { SalesOrderSummary } from './salesOrder.types'; // Para la orden de venta asociada
import type { EmpleadoSummary } from './employee.types'; // Para el empleado en la tarea (usa tu tipo existente)

// Basado en TareaProduccionCreateRequestDTO
export interface ProductionTaskCreateRequest {
  idOrdenProduccion: number;
  idEmpleado?: number | null;
  nombreTarea: string;
  duracionEstimadaTarea?: string | null; // Formato HH:MM:SS o similar que maneje LocalTime
  observacionesTarea?: string | null;
}

// Basado en TareaProduccionUpdateRequestDTO
export interface ProductionTaskUpdateRequest {
  idEmpleado?: number | null;
  nombreTarea?: string;
  fechaInicioTarea?: string | null; // LocalDateTime ISO
  fechaFinTarea?: string | null; // LocalDateTime ISO
  duracionEstimadaTarea?: string | null; // HH:MM:SS
  duracionRealTarea?: string | null; // HH:MM:SS
  estadoTarea?: 'Pendiente' | 'En Curso' | 'Completada' | 'Bloqueada';
  observacionesTarea?: string | null;
}

// Basado en TareaProduccionResponseDTO
export interface ProductionTaskDetails {
  idTareaProduccion: number;
  idOrdenProduccion: number;
  empleado?: EmpleadoSummary | null;
  nombreTarea: string;
  fechaInicioTarea?: string | null; // LocalDateTime
  fechaFinTarea?: string | null; // LocalDateTime
  duracionEstimadaTarea?: string | null; // LocalTime (string)
  duracionRealTarea?: string | null; // LocalTime (string)
  estadoTarea: string;
  observacionesTarea?: string | null;
}

// Basado en OrdenProduccionCreateRequestDTO
export interface ProductionOrderCreateRequest {
  idOrdenVenta: number;
  fechaInicioProduccion?: string | null; // LocalDate YYYY-MM-DD
  fechaFinEstimadaProduccion?: string | null; // LocalDate YYYY-MM-DD
  observacionesProduccion?: string | null;
  // Las tareas se gestionarán por separado después de crear la orden de producción
}

// Basado en OrdenProduccionUpdateRequestDTO (para cabecera)
export interface ProductionOrderHeaderUpdateRequest {
  fechaInicioProduccion?: string | null; // LocalDate YYYY-MM-DD
  fechaFinEstimadaProduccion?: string | null; // LocalDate YYYY-MM-DD
  fechaFinRealProduccion?: string | null; // LocalDate YYYY-MM-DD
  estadoProduccion?: 'Pendiente' | 'En Proceso' | 'Terminada' | 'Retrasada' | 'Anulada';
  observacionesProduccion?: string | null;
}

// Basado en OrdenProduccionResponseDTO
export interface ProductionOrderDetails {
  idOrdenProduccion: number;
  ordenVenta: SalesOrderSummary; // Usaremos OrdenVentaSummaryDTO
  fechaCreacion: string; // LocalDateTime ISO
  fechaInicioProduccion?: string | null; // LocalDate
  fechaFinEstimadaProduccion?: string | null; // LocalDate
  fechaFinRealProduccion?: string | null; // LocalDate
  estadoProduccion: string;
  observacionesProduccion?: string | null;
  fechaActualizacion?: string | null; // LocalDateTime
  tareas?: ProductionTaskDetails[] | null;
}

// Basado en OrdenProduccionSummaryDTO (si lo tuviéramos)
export interface ProductionOrderSummary {
    idOrdenProduccion: number;
    idOrdenVenta: number; // Para referencia rápida
    estadoProduccion: string;
    fechaCreacion: string;
    fechaFinEstimadaProduccion?: string | null;
}

export type PaginatedProductionOrders = Page<ProductionOrderDetails>; // O ProductionOrderSummary
export type ProductionOrderPageableRequest = PageableRequest;