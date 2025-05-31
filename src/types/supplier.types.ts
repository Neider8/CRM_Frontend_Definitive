// src/types/supplier.types.ts
import type { Page, PageableRequest } from './page.types';

// Basado en ProveedorCreateRequestDTO
export interface SupplierCreateRequest {
  nombreComercialProveedor: string;
  razonSocialProveedor?: string | null;
  nitProveedor: string;
  direccionProveedor?: string | null;
  telefonoProveedor?: string | null;
  correoProveedor?: string | null;
  contactoPrincipalProveedor?: string | null;
}

// Basado en ProveedorUpdateRequestDTO
export interface SupplierUpdateRequest {
  nombreComercialProveedor?: string;
  razonSocialProveedor?: string | null;
  // nitProveedor no se actualiza según el DTO de backend
  direccionProveedor?: string | null;
  telefonoProveedor?: string | null;
  correoProveedor?: string | null;
  contactoPrincipalProveedor?: string | null;
}

// Basado en ProveedorResponseDTO
export interface SupplierDetails {
  idProveedor: number;
  nombreComercialProveedor: string;
  razonSocialProveedor?: string | null;
  nitProveedor: string;
  direccionProveedor?: string | null;
  telefonoProveedor?: string | null;
  correoProveedor?: string | null;
  contactoPrincipalProveedor?: string | null;
  fechaCreacion: string; // LocalDateTime
  fechaActualizacion?: string | null; // LocalDateTime
}

// Basado en ProveedorSummaryDTO
export interface SupplierSummary {
  idProveedor: number;
  nitProveedor: string;
  nombreComercialProveedor: string;
}

export type PaginatedSuppliers = Page<SupplierDetails>;
export type SupplierPageableRequest = PageableRequest;