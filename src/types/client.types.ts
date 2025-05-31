// src/types/client.types.ts
import type { Page } from './page.types';
import type { PageableRequest } from './page.types';

// Basado en ContactoClienteRequestDTO
export interface ContactCreateRequest {
  // idCliente no es necesario aquí si se envía como parte de la URL o el servicio lo maneja
  nombreContacto: string;
  cargoContacto?: string | null;
  telefonoContacto?: string | null;
  correoContacto?: string | null;
}

// Basado en ContactoClienteResponseDTO
export interface ContactDetails {
  idContacto: number;
  // idCliente?: number; // Podría incluirse si se obtiene el contacto de forma aislada
  nombreContacto: string;
  cargoContacto?: string | null;
  telefonoContacto?: string | null;
  correoContacto?: string | null;
}

// Basado en ClienteRequestDTO
export interface ClientCreateRequest {
  tipoDocumento: 'NIT' | 'Cédula';
  numeroDocumento: string;
  nombreCliente: string;
  direccionCliente?: string | null;
  telefonoCliente?: string | null;
  correoCliente?: string | null;
  // Los contactos se gestionarán por separado después de crear el cliente
}

// Basado en ClienteRequestDTO para la actualización (similar a la creación)
export type ClientUpdateRequest = ClientCreateRequest;

// Basado en ClienteResponseDTO
export interface ClientDetails {
  idCliente: number;
  tipoDocumento: string;
  numeroDocumento: string;
  nombreCliente: string;
  direccionCliente?: string | null;
  telefonoCliente?: string | null;
  correoCliente?: string | null;
  fechaCreacion: string; // LocalDateTime
  fechaActualizacion?: string | null; // LocalDateTime
  contactosCliente?: ContactDetails[] | null; // En el DTO de backend es un Set, aquí lo manejaremos como array
}

// Basado en ClienteSummaryDTO
export interface ClientSummary {
  idCliente: number;
  numeroDocumento: string;
  nombreCliente: string;
}

export type PaginatedClients = Page<ClientDetails>; // Usaremos ClientDetails para la lista también para tener los contactos
export type ClientPageableRequest = PageableRequest;