// src/features/dashboard/components/DashboardStats.tsx
import React, { useEffect, useState } from 'react';
import { getDashboardSummaryStats } from '../../../services/dashboardService'; 
import type { DashboardSummaryStats } from '../../../types/dashboard.types'; 
import { formatCurrency } from '../../../utils/formatting'; 

import { Loader2, Users, Package, ShoppingCart, Factory } from 'lucide-react'; 

const DashboardStats: React.FC = () => {
  const [stats, setStats] = useState<DashboardSummaryStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const fetchedStats = await getDashboardSummaryStats();
        setStats(fetchedStats);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
        setError("No se pudieron cargar las estadísticas del dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="ml-3 text-lg text-gray-600">Cargando estadísticas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-6 text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
      {/* Tarjeta de Clientes Totales */}
      <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="text-sm font-medium text-gray-700">Clientes Totales</h3>
          <Users className="h-5 w-5 text-gray-500" />
        </div>
        <div className="text-2xl font-bold text-gray-900 mt-2">{stats.totalClients}</div>
        <p className="text-xs text-gray-500 mt-1">Clientes registrados</p>
      </div>

      {/* Tarjeta de Productos Totales */}
      <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="text-sm font-medium text-gray-700">Productos Totales</h3>
          <Package className="h-5 w-5 text-gray-500" />
        </div>
        <div className="text-2xl font-bold text-gray-900 mt-2">{stats.totalProducts}</div>
        <p className="text-xs text-gray-500 mt-1">Productos en catálogo</p>
      </div>

      {/* Tarjeta de Ventas este Mes */}
      <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="text-sm font-medium text-gray-700">Ventas este Mes</h3>
          <ShoppingCart className="h-5 w-5 text-gray-500" />
        </div>
        <div className="text-2xl font-bold text-gray-900 mt-2">{stats.totalSalesThisMonth}</div>
        <p className="text-xs text-gray-500 mt-1">Órdenes de venta completadas</p>
      </div>

      {/* Tarjeta de Órdenes de Producción Pendientes */}
      <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="text-sm font-medium text-gray-700">Producción Pendiente</h3>
          <Factory className="h-5 w-5 text-gray-500" />
        </div>
        <div className="text-2xl font-bold text-gray-900 mt-2">{stats.totalProductionOrdersPending}</div>
        <p className="text-xs text-gray-500 mt-1">Órdenes de producción activas</p>
      </div>

      {/* Tarjeta de Valor de Ventas Recientes */}
      <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="text-sm font-medium text-gray-700">Ventas Recientes</h3>
          <ShoppingCart className="h-5 w-5 text-gray-500" />
        </div>
        <div className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(stats.recentSalesValue)}</div>
        <p className="text-xs text-gray-500 mt-1">Valor total (últimos 7 días)</p>
      </div>
    </div>
  );
};

export default DashboardStats;
