// src/api/productService.ts
import axiosInstance from './axiosInstance';
import type {
  ProductCreateRequest,
  ProductDetails,
  ProductUpdateRequest,
  PaginatedProducts,
  ProductPageableRequest,
  InsumoPorProductoRequest,
  InsumoPorProductoDetails
} from '../types/product.types';
import type { ApiErrorResponseDTO } from '../types/error.types';

const API_URL = '/productos';

export const getAllProducts = async (params?: ProductPageableRequest): Promise<PaginatedProducts> => {
  try {
    const response = await axiosInstance.get<PaginatedProducts>(API_URL, { params });
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) { throw error.response.data as ApiErrorResponseDTO; }
    throw new Error('Error al obtener la lista de productos.');
  }
};

export const getProductById = async (id: number): Promise<ProductDetails> => {
  try {
    const response = await axiosInstance.get<ProductDetails>(`${API_URL}/${id}`);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) { throw error.response.data as ApiErrorResponseDTO; }
    throw new Error(`Error al obtener el producto con ID ${id}.`);
  }
};

export const getProductByReference = async (referencia: string): Promise<ProductDetails> => {
  try {
    const response = await axiosInstance.get<ProductDetails>(`${API_URL}/referencia/${referencia}`);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) { throw error.response.data as ApiErrorResponseDTO; }
    throw new Error(`Error al obtener el producto con referencia ${referencia}.`);
  }
};

export const createProduct = async (payload: ProductCreateRequest): Promise<ProductDetails> => {
  try {
    const response = await axiosInstance.post<ProductDetails>(API_URL, payload);
    return response.data;
  } catch (error: any)
{
    if (error.response && error.response.data) { throw error.response.data as ApiErrorResponseDTO; }
    throw new Error('Error al crear el producto.');
  }
};

export const updateProduct = async (id: number, payload: ProductUpdateRequest): Promise<ProductDetails> => {
  try {
    const response = await axiosInstance.put<ProductDetails>(`${API_URL}/${id}`, payload);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) { throw error.response.data as ApiErrorResponseDTO; }
    throw new Error(`Error al actualizar el producto con ID ${id}.`);
  }
};

export const deleteProduct = async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(`${API_URL}/${id}`);
  } catch (error: any) {
    if (error.response && error.response.data) { throw error.response.data as ApiErrorResponseDTO; }
    throw new Error(`Error al eliminar el producto con ID ${id}.`);
  }
};

// --- Funciones para la Lista de Materiales (BOM) ---

export const getProductBOM = async (idProducto: number): Promise<InsumoPorProductoDetails[]> => {
    try {
        const response = await axiosInstance.get<InsumoPorProductoDetails[]>(`${API_URL}/${idProducto}/bom`);
        return response.data;
    } catch (error: any) {
        if (error.response && error.response.data) { throw error.response.data as ApiErrorResponseDTO; }
        throw new Error(`Error al obtener el BOM del producto ID ${idProducto}.`);
    }
};

export const addInsumoToProductBOM = async (idProducto: number, payload: InsumoPorProductoRequest): Promise<InsumoPorProductoDetails> => {
    try {
        const response = await axiosInstance.post<InsumoPorProductoDetails>(`${API_URL}/${idProducto}/bom`, payload);
        return response.data;
    } catch (error: any) {
        if (error.response && error.response.data) { throw error.response.data as ApiErrorResponseDTO; }
        throw new Error(`Error al añadir insumo al BOM del producto ID ${idProducto}.`);
    }
};

// Actualiza un insumo en el BOM. Reconstruye el payload para satisfacer las validaciones del DTO del backend.
export const updateInsumoInProductBOM = async (
    idProductoPath: number,
    idInsumoPath: number,
    formData: { cantidadRequerida: number }
): Promise<InsumoPorProductoDetails> => {

    const backendDtoPayload: InsumoPorProductoRequest = {
        idProducto: idProductoPath,
        idInsumo: idInsumoPath,
        cantidadRequerida: formData.cantidadRequerida
    };

    try {
        const response = await axiosInstance.put<InsumoPorProductoDetails>(
            `${API_URL}/${idProductoPath}/bom/${idInsumoPath}`,
            backendDtoPayload
        );
        return response.data;
    } catch (error: any) {
        if (error.response && error.response.data) { throw error.response.data as ApiErrorResponseDTO; }
        throw new Error(`Error al actualizar insumo ID ${idInsumoPath} en BOM del producto ID ${idProductoPath}.`);
    }
};

export const removeInsumoFromProductBOM = async (idProducto: number, idInsumo: number): Promise<void> => {
    try {
        await axiosInstance.delete(`${API_URL}/${idProducto}/bom/${idInsumo}`);
    } catch (error: any) {
        if (error.response && error.response.data) { throw error.response.data as ApiErrorResponseDTO; }
        throw new Error(`Error al eliminar insumo ID ${idInsumo} del BOM del producto ID ${idProducto}.`);
    }
};