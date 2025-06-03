// src/features/dashboard/components/ProductTypeDistributionChart.tsx
import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';
import type { ChartOptions, ChartData } from 'chart.js';
import { Paper, Typography, Box } from '@mui/material';

ChartJS.register(
    ArcElement, 
    Tooltip, 
    Legend,
    Title
);

interface ProductTypeDistributionChartProps {
    // data: { tipoA: number, tipoB: number, ... }
}

const ProductTypeDistributionChart: React.FC<ProductTypeDistributionChartProps> = (/*props*/) => {
  const data: ChartData<'doughnut'> = {
    labels: ['Camisas', 'Pantalones', 'Chaquetas', 'Vestidos', 'Accesorios'],
    datasets: [
      {
        label: 'Distribución de Productos por Tipo',
        data: [300, 150, 100, 80, 120], // Datos de ejemplo
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      title: {
        display: true,
        text: 'Distribución de Productos por Tipo',
        font: {
            size: 16
        }
      },
    },
  };

  return (
    <Paper elevation={3} sx={{ p: 2, height: {xs: 300, md: 350} }}>
       <Box sx={{ height: '100%'}}>
        <Doughnut data={data} options={options} />
      </Box>
    </Paper>
  );
};

export default ProductTypeDistributionChart;