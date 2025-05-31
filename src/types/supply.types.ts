// src/types/supply.types.ts
import type { Page } from './page.types';
import type { PageableRequest } from './page.types';

// Basado en InsumoCreateRequestDTO
export interface SupplyCreateRequest {
  nombreInsumo: string;
  descripcionInsumo?: string | null;
  unidadMedidaInsumo: string;
  stockMinimoInsumo?: number | null; // Backend DTO es Integer
}

// Basado en InsumoUpdateRequestDTO
export interface SupplyUpdateRequest {
  nombreInsumo?: string;
  descripcionInsumo?: string | null;
  unidadMedidaInsumo?: string;
  stockMinimoInsumo?: number | null;
}

// Basado en InsumoResponseDTO (InsumoDetails ya lo teníamos)
export interface InsumoDetails {
  idInsumo: number;
  nombreInsumo: string;
  descripcionInsumo?: string | null;
  unidadMedidaInsumo: string;
  stockMinimoInsumo?: number | null; // Integer en backend
  fechaCreacion: string; // LocalDateTime
  fechaActualizacion?: string | null; // LocalDateTime
}

// Basado en InsumoSummaryDTO
export interface InsumoSummary {
  idInsumo: number;
  nombreInsumo: string;
  unidadMedidaInsumo: string;
}

export type PaginatedInsumos = Page<InsumoDetails>;
export type InsumoPageableRequest = PageableRequest;