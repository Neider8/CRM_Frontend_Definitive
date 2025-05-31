// src/features/supplyInventory/pages/SupplyInventoryCreatePage.tsx
import React from 'react';
import { Container, Typography, Box, IconButton, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SupplyInventoryCreateForm from '../components/SupplyInventoryCreateForm';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';

const SupplyInventoryCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  // Permisos según InventarioInsumoController
  const canCreate = currentUser?.rolUsuario === 'Administrador' || 
                    currentUser?.rolUsuario === 'Gerente' || 
                    currentUser?.rolUsuario === 'Operario';

  if (!canCreate) {
    return (
        <Container maxWidth="md">
            <Box sx={{ my: 4, textAlign: 'center' }}>
                <Typography variant="h5" color="error">Acceso Denegado</Typography>
                <Typography>No tienes permisos para crear registros de inventario de insumos.</Typography>
                <Button variant="outlined" onClick={() => navigate(-1)} sx={{mt: 2}}>
                    Volver
                </Button>
            </Box>
        </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 2, display: 'flex', alignItems: 'center' }}>
        <IconButton onClick={() => navigate(-1)} color="primary" sx={{ mr: 1 }} aria-label="Volver">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Nuevo Registro de Inventario (Insumo)
        </Typography>
      </Box>
      <SupplyInventoryCreateForm />
    </Container>
  );
};

export default SupplyInventoryCreatePage;