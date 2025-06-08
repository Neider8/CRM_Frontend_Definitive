import type { Page, PageableRequest } from './page.types';
import type { ProductSummary } from './product.types';
import type { InsumoSummary } from './supply.types';

// INVENTARIO DE INSUMOS
export interface InventarioInsumo {
  idInventarioInsumo: number;
  ubicacionInventario: string;
  insumo: InsumoSummary;
  cantidadStock: number;
  ultimaActualizacion: string; // Es un LocalDateTime en backend
  umbralMinimoStock: number; // Campo clave para las alertas
}

// INVENTARIO DE PRODUCTOS
export interface InventarioProducto {
  idInventarioProducto: number;
  ubicacionInventario: string;
  producto: ProductSummary;
  cantidadStock: number;
  ultimaActualizacion: string;
  umbralMinimoStock: number; 
}

// --- Tipos para Peticiones de Creación ---
export interface SupplyInventoryCreateRequest {
  ubicacionInventario: string;
  idInsumo: number;
  cantidadStock: number;
}

// --- Tipos para Movimientos ---
export interface SupplyMovementCreateRequest {
  tipoMovimiento: 'Entrada' | 'Salida';
  idInventarioInsumo: number;
  cantidadMovimiento: number;
  descripcionMovimiento?: string | null;
}

export interface SupplyMovementDetails {
  idMovimientoInsumo: number;
  tipoMovimiento: string;
  inventarioInsumoRef: {
    idInventarioInsumo: number;
    ubicacionInventario: string;
    insumoNombre: string;
  };
  cantidadMovimiento: number;
  fechaMovimiento: string;
  descripcionMovimiento?: string | null;
}

// --- Tipos Paginados ---
export type PaginatedSupplyInventories = Page<InventarioInsumo>;
export type PaginatedSupplyMovements = Page<SupplyMovementDetails>;
export type SupplyInventoryPageableRequest = PageableRequest;