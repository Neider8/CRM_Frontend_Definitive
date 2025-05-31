// src/features/employees/pages/EmployeeCreatePage.tsx
import React from 'react';
import { Container, Typography, Box, IconButton, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EmployeeCreateForm from '../components/EmployeeCreateForm';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext'; // Para control de acceso

const EmployeeCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  // Verificar permisos (Admin o Gerente según EmpleadoController)
  const canCreate = currentUser?.rolUsuario === 'Administrador' || currentUser?.rolUsuario === 'Gerente';

  if (!canCreate) {
    return (
        <Container maxWidth="md">
            <Box sx={{ my: 4, textAlign: 'center' }}>
                <Typography variant="h5" color="error">Acceso Denegado</Typography>
                <Typography>No tienes permisos para crear empleados.</Typography>
                <Button variant="outlined" onClick={() => navigate(-1)} sx={{mt: 2}}>
                    Volver
                </Button>
            </Box>
        </Container>
    );
  }

  return (
    <Container maxWidth="lg"> {/* Un poco más ancho para formularios más grandes */}
      <Box sx={{ my: 2, display: 'flex', alignItems: 'center' }}>
        <IconButton onClick={() => navigate(-1)} color="primary" sx={{ mr: 1 }} aria-label="Volver">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Registrar Nuevo Empleado
        </Typography>
      </Box>
      <EmployeeCreateForm />
    </Container>
  );
};

export default EmployeeCreatePage;