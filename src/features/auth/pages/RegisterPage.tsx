// src/features/auth/pages/RegisterPage.tsx
import React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import RegisterForm from '../components/RegisterForm';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button'; // Solo si lo necesitas aquí

const RegisterPage: React.FC = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#fbf6ff',
        p: 2,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          width: '100%',
          maxWidth: 480,
          borderRadius: 2,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: '#5033d8' }}>
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
