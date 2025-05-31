// src/features/supplies/pages/SupplyEditPage.tsx
import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, CircularProgress, Alert, IconButton, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useParams, useNavigate } from 'react-router-dom';
import SupplyEditForm from '../components/SupplyEditForm';
import { getInsumoById } from '../../../api/supplyService';
import type { InsumoDetails } from '../../../types/supply.types';
import { useAuth } from '../../../contexts/AuthContext';

const SupplyEditPage: React.FC = () => {
  const { supplyId: supplyIdParam } = useParams<{ supplyId: string }>(); // Cambiado para ser específico
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [supplyData, setSupplyData] = useState<InsumoDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supplyId = parseInt(supplyIdParam || '', 10);

  useEffect(() => {
    if (supplyIdParam && !isNaN(supplyId)) {
      const fetchSupplyData = async () => {
        setLoading(true);
        setError(null);
        try {
          const data = await getInsumoById(supplyId);
          setSupplyData(data);
        } catch (err: any) {
          console.error("Error al cargar datos del insumo:", err);
          setError(err.message || 'No se pudo cargar la información del insumo.');
        } finally {
          setLoading(false);
        }
      };
      fetchSupplyData();
    } else {
      setError("No se proporcionó ID de insumo o es inválido.");
      setLoading(false);
    }
  }, [supplyIdParam, supplyId]);

  // Permisos basados en InsumoController
  const canEdit = currentUser?.rolUsuario === 'Administrador' || currentUser?.rolUsuario === 'Gerente';

  if (!canEdit && !loading) {
     return (
        <Container maxWidth="md">
            <Box sx={{ my: 4, textAlign: 'center' }}>
                <Typography variant="h5" color="error">Acceso Denegado</Typography>
                <Typography>No tienes permisos para editar insumos.</Typography>
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
        <Button onClick={() => navigate('/insumos')} sx={{ mt: 2 }}>Volver a la lista</Button>
      </Container>
    );
  }

  if (!supplyData) {
    return <Container maxWidth="md"><Alert severity="warning" sx={{ mt: 4 }}>Insumo no encontrado.</Alert></Container>;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 2, display: 'flex', alignItems: 'center' }}>
        <IconButton onClick={() => navigate(-1)} color="primary" sx={{ mr: 1 }} aria-label="Volver">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Editar Insumo
        </Typography>
      </Box>
      <SupplyEditForm supplyData={supplyData} />
    </Container>
  );
};

export default SupplyEditPage;