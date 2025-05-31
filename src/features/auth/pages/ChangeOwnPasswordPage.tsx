// src/features/auth/pages/ChangeOwnPasswordPage.tsx
import React from 'react';
import { Container, Typography, Box, IconButton, Paper, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import ChangePasswordForm from '../../users/components/ChangePasswordForm'; // Reutilizamos el mismo formulario
import { useAuth } from '../../../contexts/AuthContext';

const ChangeOwnPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser, logout } = useAuth();

  if (!currentUser) {
    // Esto no debería pasar si la ruta está protegida por AuthGuard
    navigate('/login');
    return null;
  }

  const handleSuccess = () => {
    // Considera si desloguear al usuario después de cambiar su propia contraseña
    // para que inicie sesión con la nueva. Es una práctica común.
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
          isOwnPasswordChange={true} // El usuario cambia su propia contraseña
          onSuccess={handleSuccess}
          onCancel={() => navigate(`/usuarios/${currentUser.idUsuario}`)} // Volver a su perfil
        />
      </Paper>
    </Container>
  );
};

export default ChangeOwnPasswordPage;