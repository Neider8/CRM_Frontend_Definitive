// src/features/purchaseOrders/pages/PurchaseOrderCreatePage.tsx
import React from 'react';
import { Container, Typography, Box, IconButton, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PurchaseOrderCreateForm from '../components/PurchaseOrderCreateForm';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';

const PurchaseOrderCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  // Permisos según OrdenCompraController
  const canCreate = currentUser?.rolUsuario === 'Administrador' || currentUser?.rolUsuario === 'Gerente';

  if (!canCreate) {
    return (
        <Container maxWidth="md">
            <Box sx={{ my: 4, textAlign: 'center' }}>
                <Typography variant="h5" color="error">Acceso Denegado</Typography>
                <Typography>No tienes permisos para crear órdenes de compra.</Typography>
                <Button variant="outlined" onClick={() => navigate(-1)} sx={{mt: 2}}>Volver</Button>
            </Box>
        </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 2, display: 'flex', alignItems: 'center' }}>
        <IconButton onClick={() => navigate(-1)} color="primary" sx={{ mr: 1 }} aria-label="Volver">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Nueva Orden de Compra
        </Typography>
      </Box>
      <PurchaseOrderCreateForm />
    </Container>
  );
};

export default PurchaseOrderCreatePage;