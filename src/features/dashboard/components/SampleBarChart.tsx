// src/features/dashboard/components/SampleBarChart.tsx
import React from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import { Paper, Typography, Box, useTheme } from '@mui/material';

// Datos simulados para el gráfico
const chartData = [
  { month: 'Ene', sales: 4000 },
  { month: 'Feb', sales: 3000 },
  { month: 'Mar', sales: 5000 },
  { month: 'Abr', sales: 4500 },
  { month: 'May', sales: 6000 },
  { month: 'Jun', sales: 5500 },
];

const uData = chartData.map(item => item.sales);
const xLabels = chartData.map(item => item.month);

const SampleBarChart: React.FC = () => {
  const theme = useTheme();

  return (
    <Paper elevation={3} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom>
        Ventas Mensuales (Simulado)
      </Typography>
      <Box sx={{ width: '100%', flexGrow: 1, minHeight: 200 }}> {/* Asegura que el gráfico tenga espacio para crecer */}
        <BarChart
          series={[{ data: uData, label: 'Ventas ($)', color: theme.palette.primary.main }]}
          xAxis={[{ scaleType: 'band', data: xLabels }]}
          // Puedes personalizar más aspectos aquí, como yAxis, layout, etc.
          // height={220} // Ajusta la altura si es necesario, pero el Box con flexGrow debería ayudar
          margin={{ top: 30, bottom: 30, left: 50, right: 10 }} // Ajusta márgenes para labels
          slotProps={{
            legend: { position: { vertical: 'top', horizontal: 'center' } },
          }}
        />
      </Box>
    </Paper>
  );
};

export default SampleBarChart;