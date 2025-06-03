// src/features/dashboard/components/SalesOrderStatusChart.tsx
import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import type { ChartOptions, ChartData } from 'chart.js';
import { Paper, Typography, Box } from '@mui/material';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface SalesOrderStatusChartProps {
  // En una aplicación real, pasarías los datos como props
  // data: { pendiente: number, confirmada: number, enProduccion: number, entregada: number, anulada: number };
}

const SalesOrderStatusChart: React.FC<SalesOrderStatusChartProps> = (/*props*/) => {
  // Datos simulados
  const data: ChartData<'bar'> = {
    labels: ['Pendiente', 'Confirmada', 'En Producción', 'Entregada', 'Anulada'],
    datasets: [
      {
        label: 'Cantidad de Órdenes de Venta',
        data: [12, 19, 7, 5, 2], // Datos de ejemplo
        backgroundColor: [
          'rgba(255, 159, 64, 0.7)', // Naranja
          'rgba(54, 162, 235, 0.7)', // Azul
          'rgba(153, 102, 255, 0.7)',// Púrpura
          'rgba(75, 192, 192, 0.7)', // Verde-Azul
          'rgba(255, 99, 132, 0.7)',  // Rojo
        ],
        borderColor: [
          'rgba(255, 159, 64, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Estado de Órdenes de Venta',
        font: {
            size: 16
        }
      },
      tooltip: {
        callbacks: {
            label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                    label += ': ';
                }
                if (context.parsed.y !== null) {
                    label += context.parsed.y;
                }
                return label;
            }
        }
      }
    },
    scales: {
        y: {
            beginAtZero: true,
            ticks: {
                stepSize: 1, // O ajusta según tus datos
            }
        }
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 2, height: {xs: 300, md: 350} }}>
      <Box sx={{ height: '100%'}}>
        <Bar options={options} data={data} />
      </Box>
    </Paper>
  );
};

export default SalesOrderStatusChart;