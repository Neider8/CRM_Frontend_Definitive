// src/types/salesOrder.types.ts
import type { Page } from './page.types';
import type { PageableRequest } from './page.types';
import type { ClientSummary } from './client.types'; // Necesitamos el resumen del cliente
import type { ProductSummary } from './product.types'; // Necesitamos el resumen del producto

// Basado en DetalleOrdenVentaRequestDTO
export interface SalesOrderDetailRequest {
  idProducto: number;
  cantidadProducto: number;
  precioUnitarioVenta?: number | null; // BigDecimal en backend, number aquí
}

// Basado en DetalleOrdenVentaResponseDTO
export interface SalesOrderDetailDetails {
  idDetalleOrden: number;
  producto: ProductSummary;
  cantidadProducto: number;
  precioUnitarioVenta: number; // BigDecimal
  subtotalDetalle: number; // BigDecimal
}

// Basado en OrdenVentaCreateRequestDTO
export interface SalesOrderCreateRequest {
  idCliente: number;
  fechaEntregaEstimada?: string | null; // LocalDate YYYY-MM-DD
  observacionesOrden?: string | null;
  detalles: SalesOrderDetailRequest[];
}

// Basado en OrdenVentaUpdateRequestDTO (para cabecera)
export interface SalesOrderHeaderUpdateRequest {
  fechaEntregaEstimada?: string | null; // LocalDate YYYY-MM-DD
  estadoOrden?: 'Pendiente' | 'Confirmada' | 'En Producción' | 'Entregada' | 'Anulada';
  observacionesOrden?: string | null;
}

// Basado en OrdenVentaResponseDTO
export interface SalesOrderDetails {
  idOrdenVenta: number;
  cliente: ClientSummary;
  fechaPedido: string; // LocalDateTime ISO String
  fechaEntregaEstimada?: string | null; // LocalDate
  estadoOrden: string;
  totalOrden: number; // BigDecimal
  observacionesOrden?: string | null;
  fechaActualizacion?: string | null; // LocalDateTime
  detalles: SalesOrderDetailDetails[];
}

// Basado en OrdenVentaSummaryDTO
export interface SalesOrderSummary {
  idOrdenVenta: number;
  fechaPedido: string; // LocalDateTime
  clienteNombre: string; // Para referencia rápida
  // Podrías añadir estadoOrden y totalOrden si son útiles en el resumen
  estadoOrden?: string;
  totalOrden?: number;
}


export type PaginatedSalesOrders = Page<SalesOrderDetails>; // O SalesOrderSummary para la lista
export type SalesOrderPageableRequest = PageableRequest;