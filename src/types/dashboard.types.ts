// src/types/dashboard.types.ts

/**
 * Interfaz para los datos estadísticos resumidos del dashboard.
 * Representa las métricas clave que se mostrarán en la página de inicio.
 */
export interface DashboardSummaryStats {
  totalClients: number; // Número total de clientes
  totalProducts: number; // Número total de productos
  totalSalesThisMonth: number; // Cantidad total de ventas este mes
  totalProductionOrdersPending: number; // Órdenes de producción pendientes
  recentSalesValue: number; // Valor total de ventas recientes (ej. últimos 7 días)
  // Puedes añadir más métricas según las necesidades de tu CRM
}

// Puedes añadir más tipos relacionados con el dashboard si es necesario
