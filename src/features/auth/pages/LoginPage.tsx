// src/features/auth/pages/LoginPage.tsx
import React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import LoginForm from '../components/LoginForm'; // Asegúrate de que este componente existe
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'; // Importa el icono
import Avatar from '@mui/material/Avatar';

const LoginPage: React.FC = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh', // Centrar verticalmente en toda la pantalla
        bgcolor: 'background.default', // Usar color de fondo del tema
        p: 2, // Padding general
      }}
    >
      <Paper elevation={6} sx={{ p: { xs: 2, sm: 3, md: 4 }, width: '100%', maxWidth: 450, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Iniciar Sesión
          </Typography>
        </Box>
        <LoginForm />
      </Paper>
    </Box>
  );
};

export default LoginPage;