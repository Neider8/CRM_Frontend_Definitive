// src/features/clients/pages/ClientEditPage.tsx
import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, CircularProgress, Alert, IconButton, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useParams, useNavigate } from 'react-router-dom';
import ClientEditForm from '../components/ClientEditForm';
import { getClientById } from '../../../api/clientService';
import type { ClientDetails } from '../../../types/client.types';
import { useAuth } from '../../../contexts/AuthContext';

const ClientEditPage: React.FC = () => {
  const { clientId: clientIdParam } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [clientData, setClientData] = useState<ClientDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clientId = parseInt(clientIdParam || '', 10);

  useEffect(() => {
    if (clientIdParam && !isNaN(clientId)) {
      const fetchClientData = async () => {
        setLoading(true);
        setError(null);
        try {
          const data = await getClientById(clientId);
          setClientData(data);
        } catch (err: any) {
          console.error("Error al cargar datos del cliente:", err);
          setError(err.message || 'No se pudo cargar la información del cliente.');
        } finally {
          setLoading(false);
        }
      };
      fetchClientData();
    } else {
      setError("No se proporcionó ID de cliente o es inválido.");
      setLoading(false);
    }
  }, [clientIdParam, clientId]);

  // Permisos basados en ClienteController: Admin, Ventas o PERMISO_EDITAR_CLIENTES
  const canEdit = currentUser?.rolUsuario === 'Administrador' || currentUser?.rolUsuario === 'Ventas';

  if (!canEdit) {
     return (
        <Container maxWidth="md">
            <Box sx={{ my: 4, textAlign: 'center' }}>
                <Typography variant="h5" color="error">Acceso Denegado</Typography>
                <Typography>No tienes permisos para editar clientes.</Typography>
                 <Button variant="outlined" onClick={() => navigate(-1)} sx={{mt: 2}}>
                    Volver
                </Button>
            </Box>
        </Container>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>
        <Button onClick={() => navigate('/clientes')} sx={{ mt: 2 }}>Volver a la lista</Button>
      </Container>
    );
  }

  if (!clientData) {
    return <Container maxWidth="md"><Alert severity="warning" sx={{ mt: 4 }}>Cliente no encontrado.</Alert></Container>;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 2, display: 'flex', alignItems: 'center' }}>
        <IconButton onClick={() => navigate(-1)} color="primary" sx={{ mr: 1 }} aria-label="Volver">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Editar Cliente
        </Typography>
      </Box>
      <ClientEditForm clientData={clientData} />
    </Container>
  );
};

export default ClientEditPage;