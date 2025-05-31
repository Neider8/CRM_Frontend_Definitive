// src/features/products/pages/ProductEditPage.tsx
import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, CircularProgress, Alert, IconButton, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useParams, useNavigate } from 'react-router-dom';
import ProductEditForm from '../components/ProductEditForm';
import { getProductById } from '../../../api/productService';
import type { ProductDetails } from '../../../types/product.types';
import { useAuth } from '../../../contexts/AuthContext';

const ProductEditPage: React.FC = () => {
  const { productId: productIdParam } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [productData, setProductData] = useState<ProductDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const productId = parseInt(productIdParam || '', 10);

  useEffect(() => {
    if (productIdParam && !isNaN(productId)) {
      const fetchProductData = async () => {
        setLoading(true);
        setError(null);
        try {
          const data = await getProductById(productId);
          setProductData(data);
        } catch (err: any) {
          console.error("Error al cargar datos del producto:", err);
          setError(err.message || 'No se pudo cargar la información del producto.');
        } finally {
          setLoading(false);
        }
      };
      fetchProductData();
    } else {
      setError("No se proporcionó ID de producto o es inválido.");
      setLoading(false);
    }
  }, [productIdParam, productId]);

  // Permisos según ProductoController
  const canEdit = currentUser?.rolUsuario === 'Administrador' || currentUser?.rolUsuario === 'Gerente';

  if (!canEdit && !loading) { // Solo mostrar si ya no está cargando
     return (
        <Container maxWidth="md">
            <Box sx={{ my: 4, textAlign: 'center' }}>
                <Typography variant="h5" color="error">Acceso Denegado</Typography>
                <Typography>No tienes permisos para editar productos.</Typography>
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
        <Button onClick={() => navigate('/productos')} sx={{ mt: 2 }}>Volver a la lista</Button>
      </Container>
    );
  }

  if (!productData) {
    return <Container maxWidth="md"><Alert severity="warning" sx={{ mt: 4 }}>Producto no encontrado.</Alert></Container>;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 2, display: 'flex', alignItems: 'center' }}>
        <IconButton onClick={() => navigate(-1)} color="primary" sx={{ mr: 1 }} aria-label="Volver">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Editar Producto
        </Typography>
      </Box>
      <ProductEditForm productData={productData} />
    </Container>
  );
};

export default ProductEditPage;