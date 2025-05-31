// src/pages/HomePage.tsx
import React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

const HomePage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard Principal
      </Typography>
      <Typography paragraph>
        Bienvenido a CRMTech360. Este es el dashboard principal.
      </Typography>
      {/* Aquí irán los componentes del dashboard */}
    </Box>
  );
};

export default HomePage;