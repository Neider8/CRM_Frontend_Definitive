// src/api/clientService.ts
import axiosInstance from './axiosInstance';
import type {
  ClientCreateRequest,
  ClientDetails,
  ClientUpdateRequest,
  PaginatedClients,
  ClientPageableRequest,
  ContactCreateRequest,
  ContactDetails
} from '../types/client.types';
import type { ApiErrorResponseDTO } from '../types/error.types';

const API_URL = '/clientes';


export const getAllClients = async (params?: ClientPageableRequest): Promise<PaginatedClients> => {
  try {
    const response = await axiosInstance.get<PaginatedClients>(API_URL, { params });
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) { throw error.response.data as ApiErrorResponseDTO; }
    throw new Error('Error al obtener la lista de clientes.');
  }
};

export const getClientById = async (id: number): Promise<ClientDetails> => {
  try {
    const response = await axiosInstance.get<ClientDetails>(`${API_URL}/${id}`);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) { throw error.response.data as ApiErrorResponseDTO; }
    throw new Error(`Error al obtener el cliente con ID ${id}.`);
  }
};

export const getClientByDocumentNumber = async (numeroDocumento: string): Promise<ClientDetails> => {
  try {
    const response = await axiosInstance.get<ClientDetails>(`${API_URL}/documento/${numeroDocumento}`);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) { throw error.response.data as ApiErrorResponseDTO; }
    throw new Error(`Error al obtener el cliente con documento ${numeroDocumento}.`);
  }
};

export const createClient = async (clientData: ClientCreateRequest): Promise<ClientDetails> => {
  try {
    const response = await axiosInstance.post<ClientDetails>(API_URL, clientData);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) { throw error.response.data as ApiErrorResponseDTO; }
    throw new Error('Error al crear el cliente.');
  }
};

export const updateClient = async (id: number, clientData: ClientUpdateRequest): Promise<ClientDetails> => {
  try {
    const response = await axiosInstance.put<ClientDetails>(`${API_URL}/${id}`, clientData);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) { throw error.response.data as ApiErrorResponseDTO; }
    throw new Error(`Error al actualizar el cliente con ID ${id}.`);
  }
};

export const deleteClient = async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(`${API_URL}/${id}`);
  } catch (error: any) {
    if (error.response && error.response.data) { throw error.response.data as ApiErrorResponseDTO; }
    throw new Error(`Error al eliminar el cliente con ID ${id}.`);
  }
};

// --- Funciones para Contactos del Cliente ---

export const getContactsByClientId = async (idCliente: number): Promise<ContactDetails[]> => {
  try {
    const response = await axiosInstance.get<ContactDetails[]>(`${API_URL}/${idCliente}/contactos`);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) { throw error.response.data as ApiErrorResponseDTO; }
    throw new Error(`Error al obtener los contactos del cliente ID ${idCliente}.`);
  }
};

// Añade un contacto a un cliente, inyectando `idCliente` en el payload para cumplir con la validación del backend.
export const addContactToClient = async (
  idCliente: number,
  contactFormData: ContactCreateRequest
): Promise<ContactDetails> => {

  const payloadParaBackend = {
    ...contactFormData,
    idCliente: idCliente,
  };

  try {
    const response = await axiosInstance.post<ContactDetails>(
      `${API_URL}/${idCliente}/contactos`,
      payloadParaBackend
    );
    return response.data;
  } catch (error: any) {
    console.error("Error detallado al añadir contacto:", error.response?.data || error.message);
    if (error.response && error.response.data) {
      throw error.response.data as ApiErrorResponseDTO;
    }
    throw new Error('Error al añadir contacto al cliente.');
  }
};

export const updateClientContact = async (
  idCliente: number,
  idContacto: number,
  contactFormData: ContactCreateRequest
): Promise<ContactDetails> => {
  try {
    // Nota: El payload de actualización podría requerir el `idCliente` al igual que la función de creación.
    const response = await axiosInstance.put<ContactDetails>(
      `${API_URL}/${idCliente}/contactos/${idContacto}`,
      contactFormData
    );
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) { throw error.response.data as ApiErrorResponseDTO; }
    throw new Error(`Error al actualizar el contacto ID ${idContacto}.`);
  }
};

export const deleteClientContact = async (idCliente: number, idContacto: number): Promise<void> => {
  try {
    await axiosInstance.delete(`${API_URL}/${idCliente}/contactos/${idContacto}`);
  } catch (error: any) {
    if (error.response && error.response.data) { throw error.response.data as ApiErrorResponseDTO; }
    throw new Error(`Error al eliminar el contacto ID ${idContacto}.`);
  }
};