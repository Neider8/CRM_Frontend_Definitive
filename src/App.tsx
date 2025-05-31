import React from 'react';
import AppRouter from './routes/AppRouter';
import { useAuth } from './contexts/AuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';

function App() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Cargando aplicación...</Typography>
      </Box>
    );
  }

  return <AppRouter />;
}

export default App;
