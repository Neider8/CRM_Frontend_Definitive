// src/types/inventory.types.ts

import type { Page, PageableRequest } from './page.types';
import type { ProductSummary } from './product.types';
import type { InsumoSummary } from './supply.types';


// ==========================================
// == TIPOS PARA INVENTARIO DE PRODUCTOS ==
// ==========================================

// Se renombró de 'InventarioProducto' para consistencia con los imports
export interface ProductInventoryDetails {
  idInventarioProducto: number;
  ubicacionInventario: string;
  producto: ProductSummary;
  cantidadStock: number;
  ultimaActualizacion: string;
  umbralMinimoStock: number; 
}

// TIPO AÑADIDO - Faltaba en tu archivo
export interface ProductInventoryCreateRequest {
  ubicacionInventario: string;
  idProducto: number;
  cantidadStock: number;
}

// TIPO AÑADIDO - Faltaba en tu archivo
export interface ProductMovementCreateRequest {
  tipoMovimiento: 'Entrada' | 'Salida';
  idInventarioProducto: number;
  cantidadMovimiento: number;
  descripcionMovimiento?: string | null;
}

// TIPO AÑADIDO - Faltaba en tu archivo
export interface ProductMovementDetails {
  idMovimientoProducto: number;
  tipoMovimiento: string;
  inventarioProductoRef: {
    idInventarioProducto: number;
    ubicacionInventario: string;
    productoNombre: string;
  };
  cantidadMovimiento: number;
  fechaMovimiento: string;
  descripcionMovimiento?: string | null;
}

// --- Tipos Paginados para Productos (AÑADIDOS) ---
export type PaginatedProductInventories = Page<ProductInventoryDetails>;
export type PaginatedProductMovements = Page<ProductMovementDetails>;
export type ProductInventoryPageableRequest = PageableRequest;


// ========================================
// == TIPOS PARA INVENTARIO DE INSUMOS ==
// ========================================
// (Estos son los que ya tenías)

export interface InventarioInsumo {
  idInventarioInsumo: number;
  ubicacionInventario: string;
  insumo: InsumoSummary;
  cantidadStock: number;
  ultimaActualizacion: string;
  umbralMinimoStock: number;
}

export interface SupplyInventoryCreateRequest {
  ubicacionInventario: string;
  idInsumo: number;
  cantidadStock: number;
}

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

export type PaginatedSupplyInventories = Page<InventarioInsumo>;
export type PaginatedSupplyMovements = Page<SupplyMovementDetails>;
export type SupplyInventoryPageableRequest = PageableRequest;