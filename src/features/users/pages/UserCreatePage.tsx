// src/features/users/pages/UserCreatePage.tsx
import React, { useEffect } from 'react'; // Añadir useEffect
import { Container, Typography, Box, IconButton, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import UserCreateForm from '../components/UserCreateForm';
import { useNavigate, useLocation } from 'react-router-dom'; // Añadir useLocation
import { useAuth } from '../../../contexts/AuthContext';

const UserCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Para leer query params
  const { user: currentUser } = useAuth();

  // Leer parámetros de la URL para pre-llenar
  const queryParams = new URLSearchParams(location.search);
  const prefillEmployeeId = queryParams.get('idEmpleado');
  const prefillEmployeeName = queryParams.get('nombreEmpleado');

  if (currentUser?.rolUsuario !== 'Administrador') {
    return (
      <Container maxWidth="md">
        <Box sx={{ my: 4, textAlign: 'center' }}>
          <Typography variant="h5" color="error">Acceso Denegado</Typography>
          <Typography>No tienes permisos para crear usuarios.</Typography>
          <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mt: 2 }}>
            Volver
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 2, display: 'flex', alignItems: 'center' }}>
        <IconButton onClick={() => navigate(-1)} color="primary" sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Crear Nuevo Usuario
          {prefillEmployeeName && ` para ${decodeURIComponent(prefillEmployeeName)}`}
        </Typography>
      </Box>
      {/* Pasamos el idEmpleado pre-llenado al formulario si existe */}
      <UserCreateForm key={prefillEmployeeId} /* Añadir key para forzar re-render si cambia el prefill */
        initialEmployeeId={prefillEmployeeId ? parseInt(prefillEmployeeId, 10) : null}
      />
    </Container>
  );
};

export default UserCreatePage;