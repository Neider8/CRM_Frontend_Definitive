import { Container, Typography, Box, CircularProgress, Alert, IconButton, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useParams, useNavigate } from 'react-router-dom'; // <<-- LÍNEA CORREGIDA AQUÍ
import SupplierEditForm from '../components/SupplierEditForm'; // <<-- ASEGÚRATE DE QUE ESTA LÍNEA IMPORTE SupplierEditForm
import type { SupplierDetails } from '../../../types/supplier.types';
import { getSupplierById } from '../../../api/supplierService';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom'; // Importar Link de react-router-dom

const SupplierEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const supplierId = id ? parseInt(id, 10) : undefined; // Convertir a número o undefined

  const { data: supplier, isLoading, isError, error } = useQuery<SupplierDetails, Error>({
    queryKey: ['supplier', supplierId],
    queryFn: () => {
      if (!supplierId) {
        throw new Error('Supplier ID is undefined.');
      }
      return getSupplierById(supplierId);
    },
    enabled: supplierId !== undefined, // Solo ejecutar la query si supplierId está definido
  });

  useEffect(() => {
    if (!supplierId) {
      navigate('/suppliers'); // Redirigir si no hay ID válido
    }
  }, [supplierId, navigate]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          Error al cargar los datos del proveedor: {error?.message || 'Error desconocido'}
        </Alert>
        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/suppliers')}
          >
            Volver a la lista de proveedores
          </Button>
        </Box>
      </Container>
    );
  }

  if (!supplier) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="warning">Proveedor no encontrado.</Alert>
        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/suppliers')}
          >
            Volver a la lista de proveedores
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <IconButton component={RouterLink} to="/suppliers" aria-label="back">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" sx={{ ml: 1 }}>
          Editar Proveedor
        </Typography>
      </Box>
      <SupplierEditForm supplyDatadata={supplier} /> {/* Asegúrate de que 'supplier' no sea undefined aquí */}
    </Container>
  );
};

export default SupplierEditPage;