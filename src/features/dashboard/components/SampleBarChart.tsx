// src/features/dashboard/components/SampleBarChart.tsx
import React from 'react';
import { Paper, Typography, Box } from '@mui/material';


const sampleData = [
  { name: 'Ene', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 600 },
  { name: 'Abr', value: 800 },
  { name: 'May', value: 500 },
  { name: 'Jun', value: 700 },
  { name: 'Jul', value: 0 },
];

const SampleBarChart: React.FC = () => {
  return (
    <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Ventas Mensuales
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'flex-end', height: 'calc(100% - 40px)', borderBottom: '1px solid #ccc', borderLeft: '1px solid #ccc', p:1 }}>
        {sampleData.map((dataPoint) => (
          <Box
            key={dataPoint.name}
            sx={{
              width: '12%', // Ancho de la barra
              backgroundColor: 'primary.main',
              mr: '2%', // Margen entre barras
              height: `${(dataPoint.value / 1000) * 100}%`, // Altura proporcional al valor (ajusta el divisor 1000 según tus datos)
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              alignItems: 'center',
              position: 'relative',
              minHeight: '10px' // Altura mínima para visibilidad
            }}
            title={`${dataPoint.name}: ${dataPoint.value}`}
          >
            <Typography variant="caption" sx={{ color: 'white', position: 'absolute', top: -20 }}>
              {dataPoint.value}
            </Typography>
            <Typography variant="caption" sx={{ position: 'absolute', bottom: -20 }}>
              {dataPoint.name}
            </Typography>
          </Box>
        ))}
      </Box>
       <Typography variant="caption" display="block" sx={{mt: 2, textAlign: 'center'}}>
        Este es un gráfico de barras
      </Typography>
    </Paper>
  );
};

export default SampleBarChart;