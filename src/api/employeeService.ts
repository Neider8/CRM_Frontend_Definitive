// src/api/employeeService.ts
import axiosInstance from './axiosInstance';
import type {
  EmployeeCreateRequest,
  EmployeeDetails,
  EmployeeUpdateRequest,
  PaginatedEmployees,
  EmployeePageableRequest
} from '../types/employee.types';
import type { ApiErrorResponseDTO } from '../types/error.types';

const API_URL = '/empleados';

// Requiere: ROL_ADMINISTRADOR, ROL_GERENTE o PERMISO_VER_EMPLEADOS.
export const getAllEmployees = async (params?: EmployeePageableRequest): Promise<PaginatedEmployees> => {
  try {
    const response = await axiosInstance.get<PaginatedEmployees>(API_URL, { params });
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw error.response.data as ApiErrorResponseDTO;
    }
    throw new Error('Error al obtener la lista de empleados.');
  }
};

// Requiere: ROL_ADMINISTRADOR, ROL_GERENTE, PERMISO_VER_EMPLEADOS, o ser el mismo usuario.
export const getEmployeeById = async (id: number): Promise<EmployeeDetails> => {
  try {
    const response = await axiosInstance.get<EmployeeDetails>(`${API_URL}/${id}`);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw error.response.data as ApiErrorResponseDTO;
    }
    throw new Error(`Error al obtener el empleado con ID ${id}.`);
  }
};

// Requiere: ROL_ADMINISTRADOR, ROL_GERENTE o PERMISO_VER_EMPLEADOS.
export const getEmployeeByDocumentNumber = async (numeroDocumento: string): Promise<EmployeeDetails> => {
  try {
    const response = await axiosInstance.get<EmployeeDetails>(`${API_URL}/documento/${numeroDocumento}`);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw error.response.data as ApiErrorResponseDTO;
    }
    throw new Error(`Error al obtener el empleado con documento ${numeroDocumento}.`);
  }
};

// Requiere: ROL_ADMINISTRADOR, ROL_GERENTE o PERMISO_CREAR_EMPLEADOS.
export const createEmployee = async (payload: EmployeeCreateRequest): Promise<EmployeeDetails> => {
  try {
    const response = await axiosInstance.post<EmployeeDetails>(API_URL, payload);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw error.response.data as ApiErrorResponseDTO;
    }
    throw new Error('Error al crear el empleado.');
  }
};

// Requiere: ROL_ADMINISTRADOR, ROL_GERENTE o PERMISO_EDITAR_EMPLEADOS.
export const updateEmployee = async (id: number, payload: EmployeeUpdateRequest): Promise<EmployeeDetails> => {
  try {
    const response = await axiosInstance.put<EmployeeDetails>(`${API_URL}/${id}`, payload);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw error.response.data as ApiErrorResponseDTO;
    }
    throw new Error(`Error al actualizar el empleado con ID ${id}.`);
  }
};

// Requiere: ROL_ADMINISTRADOR o PERMISO_ELIMINAR_EMPLEADOS.
export const deleteEmployee = async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(`${API_URL}/${id}`);
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw error.response.data as ApiErrorResponseDTO;
    }
    throw new Error(`Error al eliminar el empleado con ID ${id}.`);
  }
};