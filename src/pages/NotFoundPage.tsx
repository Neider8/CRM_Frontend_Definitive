// src/pages/NotFoundPage.tsx
import React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { Link as RouterLink } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        textAlign: 'center',
        p: 3,
      }}
    >
      <Typography variant="h1" component="h1" gutterBottom>
        404
      </Typography>
      <Typography variant="h5" component="h2" gutterBottom>
        Página No Encontrada
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Lo sentimos, la página que buscas no existe o ha sido movida.
      </Typography>
      <Button component={RouterLink} to="/" variant="contained" color="primary">
        Volver al Inicio
      </Button>
    </Box>
  );
};

export default NotFoundPage;