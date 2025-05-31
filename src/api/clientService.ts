// src/api/clientService.ts
import axiosInstance from './axiosInstance';
import type {
  ClientCreateRequest,
  ClientDetails,
  ClientUpdateRequest,
  PaginatedClients,
  ClientPageableRequest,
  ContactCreateRequest, // Este es el tipo de 'payload' que viene del formulario
  ContactDetails
  // ContactoClienteResponseDTO // Podrías tener un tipo específico para la respuesta
} from '../types/client.types';
import type { ApiErrorResponseDTO } from '../types/error.types';

const API_URL = '/clientes';

// --- Tus otras funciones de cliente (getAllClients, getClientById, etc.) ---
// (Asegúrate de que las URLs estén bien construidas con template literals como ya has notado)

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

/**
 * Añade un nuevo contacto a un cliente específico.
 * El backend espera que el 'idCliente' esté presente DENTRO del payload.
 */
export const addContactToClient = async (
  idCliente: number, // ID del cliente al que se asocia el contacto
  contactFormData: ContactCreateRequest // Datos del formulario del contacto (sin idCliente)
): Promise<ContactDetails> /* O el tipo de respuesta que devuelva tu backend, ej: ContactoClienteResponseDTO */ => {
  
  // 1. Preparamos el payload que SÍ incluye el idCliente, como espera el backend.
  const payloadParaBackend = {
    ...contactFormData, // Copiamos los datos del formulario (nombreContacto, cargo, etc.)
    idCliente: idCliente, // Añadimos el idCliente
  };

  try {
    // 2. Enviamos la solicitud POST con el payload modificado.
    const response = await axiosInstance.post<ContactDetails>(
      `${API_URL}/${idCliente}/contactos`, // URL del endpoint
      payloadParaBackend // Este es el cuerpo de la solicitud que ahora incluye idCliente
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
  contactFormData: ContactCreateRequest // Si la actualización también necesita idCliente en el body, se haría un ajuste similar aquí.
): Promise<ContactDetails> => {
  try {
    // NOTA: Si tu endpoint de ACTUALIZACIÓN también requiere idCliente en el payload,
    // deberías aplicar una lógica similar a la de addContactToClient:
    // const payloadParaBackend = { ...contactFormData, idCliente: idCliente };
    // y luego enviar payloadParaBackend en lugar de contactFormData.
    // Por ahora, lo dejo como estaba, asumiendo que el error solo es en la creación.
    const response = await axiosInstance.put<ContactDetails>(
      `${API_URL}/${idCliente}/contactos/${idContacto}`,
      contactFormData // Este payload podría necesitar ajuste si la validación del backend lo requiere.
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