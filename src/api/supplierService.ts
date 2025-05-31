// src/api/supplierService.ts
import axiosInstance from './axiosInstance';
import type {
  SupplierCreateRequest,
  SupplierDetails,
  SupplierUpdateRequest,
  PaginatedSuppliers,
  SupplierPageableRequest
} from '../types/supplier.types';
import type { ApiErrorResponseDTO } from '../types/error.types';

const API_URL = '/proveedores'; // Esta es la base para las rutas de este servicio

export const getAllSuppliers = async (params?: SupplierPageableRequest): Promise<PaginatedSuppliers> => {
  try {
    const response = await axiosInstance.get<PaginatedSuppliers>(API_URL, { params });
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) { throw error.response.data as ApiErrorResponseDTO; }
    throw new Error('Error al obtener la lista de proveedores.');
  }
};

export const getSupplierById = async (id: number): Promise<SupplierDetails> => {
  try {
    // ASEGÚRATE DE QUE ESTA LÍNEA ESTÉ ASÍ:
    const response = await axiosInstance.get<SupplierDetails>(`${API_URL}/${id}`);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) { throw error.response.data as ApiErrorResponseDTO; }
    throw new Error(`Error al obtener el proveedor con ID ${id}.`);
  }
};

export const getSupplierByNit = async (nit: string): Promise<SupplierDetails> => {
  try {
    // ASEGÚRATE DE QUE ESTA LÍNEA ESTÉ ASÍ:
    const response = await axiosInstance.get<SupplierDetails>(`${API_URL}/nit/${nit}`);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) { throw error.response.data as ApiErrorResponseDTO; }
    throw new Error(`Error al obtener el proveedor con NIT ${nit}.`);
  }
};

export const createSupplier = async (payload: SupplierCreateRequest): Promise<SupplierDetails> => {
  try {
    const response = await axiosInstance.post<SupplierDetails>(API_URL, payload);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) { throw error.response.data as ApiErrorResponseDTO; }
    throw new Error('Error al crear el proveedor.');
  }
};

export const updateSupplier = async (id: number, payload: SupplierUpdateRequest): Promise<SupplierDetails> => {
  try {
    // ASEGÚRATE DE QUE ESTA LÍNEA ESTÉ ASÍ:
    const response = await axiosInstance.put<SupplierDetails>(`${API_URL}/${id}`, payload);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) { throw error.response.data as ApiErrorResponseDTO; }
    throw new Error(`Error al actualizar el proveedor con ID ${id}.`);
  }
};

export const deleteSupplier = async (id: number): Promise<void> => {
  try {
    // ASEGÚRATE DE QUE ESTA LÍNEA ESTÉ ASÍ:
    await axiosInstance.delete(`${API_URL}/${id}`);
  } catch (error: any) {
    if (error.response && error.response.data) { throw error.response.data as ApiErrorResponseDTO; }
    throw new Error(`Error al eliminar el proveedor con ID ${id}.`);
  }
};