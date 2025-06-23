// src/features/auth/pages/ChangeOwnPasswordPage.tsx
import React from 'react';
import { Container, Typography, Box, IconButton, Paper } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import ChangePasswordForm from '../../users/components/ChangePasswordForm';
import { useAuth } from '../../../contexts/AuthContext';

const ChangeOwnPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser, logout } = useAuth();

  if (!currentUser) {
    // Guarda de seguridad: no debería ocurrir si la ruta está protegida.
    navigate('/login');
    return null;
  }

  const handleSuccess = () => {
    // Práctica de seguridad: forzar logout tras cambiar la contraseña.
    alert("Contraseña cambiada exitosamente. Por favor, inicie sesión de nuevo.");
    logout();
    navigate('/login');
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 2, display: 'flex', alignItems: 'center' }}>
        <IconButton onClick={() => navigate(-1)} color="primary" sx={{ mr: 1 }} aria-label="Volver">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" component="h1">
          Cambiar Mi Contraseña
        </Typography>
      </Box>
        <Paper elevation={3} sx={{p:3}}>
        <ChangePasswordForm
          userId={currentUser.idUsuario}
          userName={currentUser.nombreUsuario}
          isOwnPasswordChange={true}
          onSuccess={handleSuccess}
          onCancel={() => navigate(`/usuarios/${currentUser.idUsuario}`)}
        />
      </Paper>
    </Container>
  );
};

export default ChangeOwnPasswordPage;