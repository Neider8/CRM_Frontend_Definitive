// src/types/page.types.ts

// Para los parámetros de solicitud de paginación
export interface PageableRequest {
  page?: number; // Número de página (basado en 0)
  size?: number; // Tamaño de la página
  sort?: string; // Campo por el que ordenar, seguido de ,asc o ,desc (ej: "nombreUsuario,asc")
}

// Estructura de la respuesta de paginación de Spring Data JPA
export interface Page<T> {
  content: T[];
  pageable: {
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
    offset: number;
    pageNumber: number;
    pageSize: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number; // Número de la página actual (basado en 0)
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  first: boolean;
  numberOfElements: number; // Número de elementos en la página actual
  empty: boolean;
}