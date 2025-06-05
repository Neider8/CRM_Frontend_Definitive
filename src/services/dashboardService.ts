// src/services/dashboardService.ts

import type { DashboardSummaryStats } from '../types/dashboard.types';
import axiosInstance from '../api/axiosInstance'; // Importar axiosInstance para llamadas reales
import type { ApiErrorResponseDTO } from '../types/error.types'; // Importar tipo de error

const API_BASE_URL = '/dashboard'; // Asumiendo un controlador base para el dashboard

/**
 * Obtiene estadísticas resumidas del dashboard desde el backend.
 * Realiza una llamada a la API real.
 * @returns Promise<DashboardSummaryStats> - Las estadísticas resumidas.
 */
export const getDashboardSummaryStats = async (): Promise<DashboardSummaryStats> => {
  try {
    // Asumiendo un endpoint para obtener las estadísticas generales del dashboard
    const response = await axiosInstance.get<DashboardSummaryStats>(`${API_BASE_URL}/summary-stats`);
    return response.data;
  } catch (error: unknown) {
    console.error("Error fetching dashboard summary stats:", error);
    let errorMessage = "Error desconocido al obtener las estadísticas del dashboard.";

    // Define a custom interface for Axios errors to ensure type safety
    interface CustomAxiosError {
      isAxiosError?: boolean;
      response?: {
        data?: ApiErrorResponseDTO;
        status?: number;
      };
      message?: string;
    }

    if (typeof error === 'object' && error !== null && 'isAxiosError' in error) {
      const axiosError = error as CustomAxiosError;
      if (axiosError.isAxiosError) {
        if (axiosError.response?.data && axiosError.response.data.message) {
          errorMessage = axiosError.response.data.message;
        } else if (axiosError.message) {
          errorMessage = axiosError.message;
        }
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    throw new Error(errorMessage); // Lanza un error con un mensaje más claro
  }
};
