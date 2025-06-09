import { Container, Typography, Box, CircularProgress, Alert, IconButton, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useParams, useNavigate } from 'react-router-dom';
import SupplierEditForm from '../components/SupplierEditForm'; // ASEGÚRATE DE QUE ESTA LÍNEA IMPORTE SupplierEditForm
import type { SupplierDetails } from '../../../types/supplier.types';
import { getSupplierById } from '../../../api/supplierService';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';

const SupplierEditPage = () => {
  // CORREGIDO: Usar 'supplierId' para coincidir con la ruta definida en AppRouter.tsx
  const { supplierId: idParam } = useParams<{ supplierId: string }>(); 
  const navigate = useNavigate();
  const supplierId = idParam ? parseInt(idParam, 10) : undefined; // Convertir a número o undefined

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
    // CORREGIDO: Redirigir a '/proveedores' para consistencia con las rutas en español
    if (!supplierId) {
      navigate('/proveedores'); 
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
            // CORREGIDO: Redirigir a '/proveedores'
            onClick={() => navigate('/proveedores')}
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
            // CORREGIDO: Redirigir a '/proveedores'
            onClick={() => navigate('/proveedores')}
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
        {/* CORREGIDO: Redirigir a '/proveedores' */}
        <IconButton component={RouterLink} to="/proveedores" aria-label="back"> 
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" sx={{ ml: 1 }}>
          Editar Proveedor
        </Typography>
      </Box>
      {/* CORREGIDO: Renombrar el prop a algo más convencional como 'supplierData' */}
      <SupplierEditForm supplierData={supplier} /> 
    </Container>
  );
};

export default SupplierEditPage;