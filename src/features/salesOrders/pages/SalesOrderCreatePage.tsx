// src/features/salesOrders/pages/SalesOrderCreatePage.tsx
import React from 'react';
import { Container, Typography, Box, IconButton, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SalesOrderCreateForm from '../components/SalesOrderCreateForm';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';

const SalesOrderCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const canCreate = currentUser?.rolUsuario === 'Administrador' || currentUser?.rolUsuario === 'Ventas';

  if (!canCreate) {
    return (
        <Container maxWidth="md">
            <Box sx={{ my: 4, textAlign: 'center' }}>
                <Typography variant="h5" color="error">Acceso Denegado</Typography>
                <Typography>No tienes permisos para crear órdenes de venta.</Typography>
                <Button variant="outlined" onClick={() => navigate(-1)} sx={{mt: 2}}>Volver</Button>
            </Box>
        </Container>
    );
  }

  return (
    <Container maxWidth="xl"> {/* xl para más espacio en formularios complejos */}
      <Box sx={{ my: 2, display: 'flex', alignItems: 'center' }}>
        <IconButton onClick={() => navigate(-1)} color="primary" sx={{ mr: 1 }} aria-label="Volver">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Nueva Orden de Venta
        </Typography>
      </Box>
      <SalesOrderCreateForm />
    </Container>
  );
};

export default SalesOrderCreatePage;