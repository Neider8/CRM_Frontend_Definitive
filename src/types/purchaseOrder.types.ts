// src/types/purchaseOrder.types.ts
import type { Page } from './page.types';
import type { PageableRequest } from './page.types';
import type { SupplierSummary } from './supplier.types'; // Importa el tipo correcto
import type { InsumoSummary } from './supply.types';    // Importa como tipo InsumoSummary

// Basado en DetalleOrdenCompraRequestDTO
export interface PurchaseOrderDetailRequest {
  idInsumo: number;
  cantidadCompra: number; // Integer en backend
  precioUnitarioCompra: number; // BigDecimal en backend, number aquí
}

// Basado en DetalleOrdenCompraResponseDTO
export interface PurchaseOrderDetailDetails {
  idDetalleCompra: number;
  insumo: InsumoSummary; // Usaremos InsumoSummaryDTO
  cantidadCompra: number;
  precioUnitarioCompra: number; // BigDecimal
  subtotalCompra: number; // BigDecimal
}

// Basado en OrdenCompraCreateRequestDTO
export interface PurchaseOrderCreateRequest {
  idProveedor: number;
  fechaEntregaEstimadaCompra?: string | null; // LocalDate YYYY-MM-DD
  observacionesCompra?: string | null;
  detalles: PurchaseOrderDetailRequest[];
}

// Basado en OrdenCompraUpdateRequestDTO (para cabecera)
export interface PurchaseOrderHeaderUpdateRequest {
  fechaEntregaEstimadaCompra?: string | null; // LocalDate YYYY-MM-DD
  fechaEntregaRealCompra?: string | null; // LocalDate YYYY-MM-DD
  estadoCompra?: 'Pendiente' | 'Enviada' | 'Recibida Parcial' | 'Recibida Total' | 'Anulada';
  observacionesCompra?: string | null;
}

// Basado en OrdenCompraResponseDTO
export interface PurchaseOrderDetails {
  idOrdenCompra: number;
  proveedor: SupplierSummary; // Usar SupplierSummary, no ProveedorSummaryDTO
  fechaPedidoCompra: string; // LocalDateTime ISO String
  fechaEntregaEstimadaCompra?: string | null; // LocalDate
  fechaEntregaRealCompra?: string | null; // LocalDate
  estadoCompra: string;
  totalCompra: number; // BigDecimal
  observacionesCompra?: string | null;
  fechaActualizacion?: string | null; // LocalDateTime
  detalles: PurchaseOrderDetailDetails[];
}

// Basado en OrdenCompraSummaryDTO (si lo tuviéramos, de momento usamos PurchaseOrderDetails)
 export interface PurchaseOrderSummary {
   idOrdenCompra: number;
   fechaPedidoCompra: string;
   proveedorNombre: string;
   estadoCompra?: string;
   totalCompra?: number;
   fechaEntregaEstimadaCompra?: string | null;
   fechaEntregaRealCompra?: string | null;
   observacionesCompra?: string | null;}

export type PaginatedPurchaseOrders = Page<PurchaseOrderDetails>;
export type PurchaseOrderPageableRequest = PageableRequest;