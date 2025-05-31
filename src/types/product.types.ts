// src/types/product.types.ts
import type { Page } from './page.types';
import type { PageableRequest } from './page.types';
import type { InsumoSummary } from './supply.types'; // Suponiendo que tienes un supply.types.ts para Insumos

// Basado en ProductoCreateRequestDTO
export interface ProductCreateRequest {
  referenciaProducto: string;
  nombreProducto: string;
  descripcionProducto?: string | null;
  tallaProducto?: string | null;
  colorProducto?: string | null;
  tipoProducto?: string | null;
  generoProducto?: string | null;
  costoProduccion: number; // BigDecimal se maneja como number en frontend
  precioVenta: number;     // BigDecimal se maneja como number en frontend
  unidadMedidaProducto?: string | null;
}

// Basado en ProductoUpdateRequestDTO
export interface ProductUpdateRequest {
  nombreProducto?: string;
  descripcionProducto?: string | null;
  tallaProducto?: string | null;
  colorProducto?: string | null;
  tipoProducto?: string | null;
  generoProducto?: string | null;
  costoProduccion?: number | null;
  precioVenta?: number | null;
  unidadMedidaProducto?: string | null;
  // referenciaProducto no se actualiza
}

// Basado en ProductoResponseDTO
export interface ProductDetails {
  idProducto: number;
  referenciaProducto: string;
  nombreProducto: string;
  descripcionProducto?: string | null;
  tallaProducto?: string | null;
  colorProducto?: string | null;
  tipoProducto?: string | null;
  generoProducto?: string | null;
  costoProduccion: number;
  precioVenta: number;
  unidadMedidaProducto?: string | null;
  fechaCreacion: string; // LocalDateTime
  fechaActualizacion?: string | null; // LocalDateTime
  // Aquí podríamos añadir el BOM (lista de InsumoPorProductoResponseDTO) más adelante
  // bom?: InsumoPorProductoDetails[];
}

// Basado en ProductoSummaryDTO
export interface ProductSummary {
  idProducto: number;
  referenciaProducto: string;
  nombreProducto: string;
  tallaProducto?: string | null;
  colorProducto?: string | null;
}

// Para la Lista de Materiales (BOM) - basado en InsumoPorProductoResponseDTO
export interface InsumoPorProductoDetails {
    idProducto: number;
    referenciaProducto: string;
    nombreProducto: string; // Nombre del producto padre
    idInsumo: number;
    nombreInsumo: string; // Nombre del insumo componente
    unidadMedidaInsumo: string;
    cantidadRequerida: number; // BigDecimal en backend
}

// Para crear/actualizar un item del BOM - basado en InsumoPorProductoRequestDTO
export interface InsumoPorProductoRequest {
    // idProducto no es necesario si se pasa en la URL
    idInsumo: number;
    cantidadRequerida: number; // BigDecimal en backend
    idProducto: number; // <-- Agregado para permitir el uso en el payload
}


export type PaginatedProducts = Page<ProductDetails>; // O ProductSummary si prefieres menos datos en la lista
export type ProductPageableRequest = PageableRequest;