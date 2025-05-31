// src/features/products/pages/BomItemCreatePage.tsx
import React from 'react';
import { Container, Typography, Box, Button, Paper, IconButton, Alert } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from 'react-router-dom';
// Importa el formulario que creaste para el modal (si lo vas a reutilizar aquí o adaptar)
import BomItemCreateForm from '../components/BomItemCreateModal'; // Asegúrate de que la ruta sea correcta

const BomItemCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { productId: productIdParam } = useParams<{ productId: string }>();
  const productId = productIdParam ? parseInt(productIdParam, 10) : null;

  const handleGoBack = () => {
    navigate(`/productos/${productId}`);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 2, display: 'flex', alignItems: 'center' }}>
        <IconButton onClick={handleGoBack} color="primary" sx={{ mr: 1 }} aria-label="Volver">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Añadir Insumo al BOM
        </Typography>
      </Box>
      {productId ? (
        <Paper elevation={3} sx={{ p: 3 }}>
          <BomItemCreateForm
            productId={productId}
            existingBomInsumoIds={[]} // Necesitarías pasar los IDs existentes aquí si reutilizas el componente
            onBomItemCreated={() => navigate(`/productos/${productId}`)} // Redirigir tras crear
            open={true} // Si reutilizas el modal como formulario, podrías necesitar esto
            onClose={() => {}} // Igual que arriba
          />
        </Paper>
      ) : (
        <Alert severity="error" sx={{ mt: 2 }}>ID de producto inválido.</Alert>
      )}
    </Container>
  );
};

export default BomItemCreatePage;