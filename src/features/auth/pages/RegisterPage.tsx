// src/features/auth/pages/RegisterPage.tsx
import React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import RegisterForm from '../components/RegisterForm'; // Asegúrate de tener este componente creado
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined'; // Importa el icono
import Avatar from '@mui/material/Avatar';

const RegisterPage: React.FC = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh', // Centrar verticalmente
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Paper elevation={6} sx={{ p: { xs: 2, sm: 3, md: 4 }, width: '100%', maxWidth: 480, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
            <PersonAddOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Registro de Nuevo Usuario
          </Typography>
        </Box>
        <RegisterForm />
      </Paper>
    </Box>
  );
};

export default RegisterPage;