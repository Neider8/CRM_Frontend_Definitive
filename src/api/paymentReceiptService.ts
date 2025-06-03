// src/api/paymentReceiptService.ts
import axiosInstance from './axiosInstance';
import type {
  PaymentReceiptCreateRequest,
  PaymentReceiptDetails,
  PaymentReceiptUpdateRequest,
  PaginatedPaymentReceipts,
  PaymentReceiptPageableRequest
} from '../types/transaction.types';
import type { ApiErrorResponseDTO } from '../types/error.types';

const API_URL = '/pagos-cobros';

export const getAllPaymentReceipts = async (params?: PaymentReceiptPageableRequest): Promise<PaginatedPaymentReceipts> => {
  try {
    const response = await axiosInstance.get<PaginatedPaymentReceipts>(API_URL, { params });
    return response.data;
  } catch (error: any) {
    if (error.response?.data) { throw error.response.data as ApiErrorResponseDTO; }
    throw new Error('Error al obtener la lista de pagos y cobros.');
  }
};

export const getPaymentReceiptById = async (id: number): Promise<PaymentReceiptDetails> => {
  try {
    const response = await axiosInstance.get<PaymentReceiptDetails>(`${API_URL}/${id}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) { throw error.response.data as ApiErrorResponseDTO; }
    throw new Error(`Error al obtener el pago/cobro ID ${id}.`);
  }
};

export const getPaymentReceiptsByType = async (tipoTransaccion: 'Pago' | 'Cobro'): Promise<PaymentReceiptDetails[]> => {
  try {
    const response = await axiosInstance.get<PaymentReceiptDetails[]>(`${API_URL}/tipo/${tipoTransaccion}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) { throw error.response.data as ApiErrorResponseDTO; }
    throw new Error(`Error al obtener transacciones de tipo ${tipoTransaccion}.`);
  }
};

export const getReceiptsBySalesOrderId = async (idOrdenVenta: number): Promise<PaymentReceiptDetails[]> => {
  try {
    const response = await axiosInstance.get<PaymentReceiptDetails[]>(`${API_URL}/orden-venta/${idOrdenVenta}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) { throw error.response.data as ApiErrorResponseDTO; }
    throw new Error(`Error al obtener cobros para la orden de venta ID ${idOrdenVenta}.`);
  }
};

export const getPaymentsByPurchaseOrderId = async (idOrdenCompra: number): Promise<PaymentReceiptDetails[]> => {
  try {
    const response = await axiosInstance.get<PaymentReceiptDetails[]>(`${API_URL}/orden-compra/${idOrdenCompra}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) { throw error.response.data as ApiErrorResponseDTO; }
    throw new Error(`Error al obtener pagos para la orden de compra ID ${idOrdenCompra}.`);
  }
};

export const createPaymentReceipt = async (payload: PaymentReceiptCreateRequest): Promise<PaymentReceiptDetails> => {
  try {
    const response = await axiosInstance.post<PaymentReceiptDetails>(API_URL, payload);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) { throw error.response.data as ApiErrorResponseDTO; }
    throw new Error('Error al registrar el pago/cobro.');
  }
};

export const updatePaymentReceipt = async (id: number, payload: PaymentReceiptUpdateRequest): Promise<PaymentReceiptDetails> => {
  try {
    const response = await axiosInstance.put<PaymentReceiptDetails>(`${API_URL}/${id}`, payload);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) { throw error.response.data as ApiErrorResponseDTO; }
    throw new Error(`Error al actualizar el pago/cobro ID ${id}.`);
  }
};

export const annulPaymentReceipt = async (id: number): Promise<void> => {
  try {
    await axiosInstance.post(`${API_URL}/${id}/anular`);
  } catch (error: any) {
    if (error.response?.data) { throw error.response.data as ApiErrorResponseDTO; }
    throw new Error(`Error al anular el pago/cobro ID ${id}.`);
  }
};