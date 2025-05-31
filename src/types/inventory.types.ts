// src/types/inventory.types.ts
import type { Page } from './page.types';
import type { PageableRequest } from './page.types';
import type { ProductSummary } from './product.types'; // Necesitamos el resumen del producto
import type { InsumoSummary } from './supply.types'; // Necesitamos el resumen del insumo

// --- Tipos para Inventario de Productos (ya existentes) ---
// Basado en InventarioProductoCreateRequestDTO
export interface ProductInventoryCreateRequest {
  ubicacionInventario: string;
  idProducto: number;
  cantidadStock: number; // Cantidad inicial
}

// Basado en InventarioProductoResponseDTO
export interface ProductInventoryDetails {
  idInventarioProducto: number;
  ubicacionInventario: string;
  producto: ProductSummary; // Usamos el resumen del producto
  cantidadStock: number;
  ultimaActualizacion: string; // LocalDateTime
}

// Basado en InventarioProductoRefDTO (para movimientos)
export interface ProductInventoryRef {
  idInventarioProducto: number;
  ubicacionInventario: string;
  productoReferencia: string; // Referencia del producto
}

// Basado en MovimientoInventarioProductoCreateRequestDTO
export interface ProductMovementCreateRequest {
  tipoMovimiento: 'Entrada' | 'Salida';
  idInventarioProducto: number; // A qué registro de inventario afecta
  cantidadMovimiento: number;
  descripcionMovimiento?: string | null;
}

// Basado en MovimientoInventarioProductoResponseDTO
export interface ProductMovementDetails {
  idMovimientoProducto: number;
  tipoMovimiento: string;
  inventarioProductoRef: ProductInventoryRef; // Referencia al inventario
  cantidadMovimiento: number;
  fechaMovimiento: string; // LocalDateTime
  descripcionMovimiento?: string | null;
}

export type PaginatedProductInventories = Page<ProductInventoryDetails>;
export type ProductInventoryPageableRequest = PageableRequest;
export type PaginatedProductMovements = Page<ProductMovementDetails>;

// --- NUEVOS Tipos para Inventario de Insumos ---
// Basado en InventarioInsumoCreateRequestDTO
export interface SupplyInventoryCreateRequest {
  ubicacionInventario: string;
  idInsumo: number;
  cantidadStock: number; // En backend es BigDecimal, en frontend usaremos number
}

// Basado en InventarioInsumoResponseDTO
export interface SupplyInventoryDetails {
  idInventarioInsumo: number;
  ubicacionInventario: string;
  insumo: InsumoSummary; // Usamos el resumen del insumo
  cantidadStock: number; // BigDecimal en backend
  ultimaActualizacion: string; // LocalDateTime
}

// Basado en InventarioInsumoRefDTO (para movimientos)
export interface SupplyInventoryRef {
  idInventarioInsumo: number;
  ubicacionInventario: string;
  insumoNombre: string; // Nombre del insumo para referencia rápida
}

// Basado en MovimientoInventarioInsumoCreateRequestDTO
export interface SupplyMovementCreateRequest {
  tipoMovimiento: 'Entrada' | 'Salida';
  idInventarioInsumo: number;
  cantidadMovimiento: number; // BigDecimal en backend
  descripcionMovimiento?: string | null;
}

// Basado en MovimientoInventarioInsumoResponseDTO
export interface SupplyMovementDetails {
  idMovimientoInsumo: number;
  tipoMovimiento: string;
  inventarioInsumoRef: SupplyInventoryRef;
  cantidadMovimiento: number; // BigDecimal en backend
  fechaMovimiento: string; // LocalDateTime
  descripcionMovimiento?: string | null;
}

export type PaginatedSupplyInventories = Page<SupplyInventoryDetails>;
export type SupplyInventoryPageableRequest = PageableRequest; // Puede ser el mismo que ProductInventoryPageableRequest
export type PaginatedSupplyMovements = Page<SupplyMovementDetails>;