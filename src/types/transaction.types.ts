// src/types/transaction.types.ts
import type { Page } from './page.types';
import type { PageableRequest } from './page.types';
import type { SalesOrderSummary } from './salesOrder.types';   // Resumen de Orden de Venta
import type { PurchaseOrderSummary } from './purchaseOrder.types'; // Resumen de Orden de Compra

// Basado en PagoCobroCreateRequestDTO
export interface PaymentReceiptCreateRequest {
  tipoTransaccion: 'Pago' | 'Cobro';
  idOrdenVenta?: number | null; // Requerido si tipoTransaccion es 'Cobro'
  idOrdenCompra?: number | null; // Requerido si tipoTransaccion es 'Pago'
  fechaPagoCobro: string; // LocalDate YYYY-MM-DD
  metodoPago: string;
  montoTransaccion: number; // BigDecimal en backend, number aquí
  referenciaTransaccion?: string | null;
  estadoTransaccion: 'Pendiente' | 'Pagado' | 'Cobrado' | 'Anulado'; // 'Vencido' usualmente se maneja por lógica
  observacionesTransaccion?: string | null;
}

// Basado en PagoCobroUpdateRequestDTO
export interface PaymentReceiptUpdateRequest {
  fechaPagoCobro?: string | null; // LocalDate
  metodoPago?: string;
  referenciaTransaccion?: string | null;
  estadoTransaccion?: 'Pendiente' | 'Pagado' | 'Cobrado' | 'Anulado';
  observacionesTransaccion?: string | null;
  // No se permite cambiar tipo, monto, ni orden asociada
}

// Basado en PagoCobroResponseDTO
export interface PaymentReceiptDetails {
  idPagoCobro: number;
  tipoTransaccion: string;
  ordenVenta?: SalesOrderSummary | null;
  ordenCompra?: PurchaseOrderSummary | null;
  fechaRegistroTransaccion: string; // LocalDateTime ISO String
  fechaPagoCobro: string; // LocalDate YYYY-MM-DD
  metodoPago: string;
  montoTransaccion: number; // BigDecimal
  referenciaTransaccion?: string | null;
  estadoTransaccion: string;
  observacionesTransaccion?: string | null;
  fechaActualizacion?: string | null; // LocalDateTime
}

export type PaginatedPaymentReceipts = Page<PaymentReceiptDetails>;
export type PaymentReceiptPageableRequest = PageableRequest;