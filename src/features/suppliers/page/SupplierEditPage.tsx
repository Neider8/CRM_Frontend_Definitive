// src/features/suppliers/pages/SupplierEditPage.tsx
import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, CircularProgress, Alert, IconButton, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useParams, useNavigate } from 'react-router-dom';
import SupplierEditForm from '../components/SupplierEditForm';
import { getSupplierById } from '../../../api/supplierService';
import type { SupplierDetails } from '../../../types/supplier.types';
import { useAuth } from '../../../contexts/AuthContext';

const SupplierEditPage: React.FC = () => {
  const { supplierId: supplierIdParam } = useParams<{ supplierId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [supplierData, setSupplierData] = useState<SupplierDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supplierId = parseInt(supplierIdParam || '', 10);

  useEffect(() => {
    if (supplierIdParam && !isNaN(supplierId)) {
      const fetchSupplierData = async () => {
        setLoading(true);
        setError(null);
        try {
          const data = await getSupplierById(supplierId);
          setSupplierData(data);
        } catch (err: any) {
          console.error("Error al cargar datos del proveedor:", err);
          setError(err.message || 'No se pudo cargar la información del proveedor.');
        } finally {
          setLoading(false);
        }
      };
      fetchSupplierData();
    } else {
      setError("No se proporcionó ID de proveedor o es inválido.");
      setLoading(false);
    }
  }, [supplierIdParam, supplierId]);

  // Permisos basados en ProveedorController: Admin, Gerente o PERMISO_EDITAR_PROVEEDORES
  const canEdit = currentUser?.rolUsuario === 'Administrador' || currentUser?.rolUsuario === 'Gerente';

  if (!canEdit) {
     return (
        <Container maxWidth="md">
            <Box sx={{ my: 4, textAlign: 'center' }}>
                <Typography variant="h5" color="error">Acceso Denegado</Typography>
                <Typography>No tienes permisos para editar proveedores.</Typography>
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
        <Button onClick={() => navigate('/proveedores')} sx={{ mt: 2 }}>Volver a la lista</Button>
      </Container>
    );
  }

  if (!supplierData) {
    return <Container maxWidth="md"><Alert severity="warning" sx={{ mt: 4 }}>Proveedor no encontrado.</Alert></Container>;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 2, display: 'flex', alignItems: 'center' }}>
        <IconButton onClick={() => navigate(-1)} color="primary" sx={{ mr: 1 }} aria-label="Volver">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Editar Proveedor
        </Typography>
      </Box>
      <SupplierEditForm supplierData={supplierData} />
    </Container>
  );
};

export default SupplierEditPage;