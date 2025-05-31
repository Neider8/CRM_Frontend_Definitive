// src/features/users/pages/UserEditPage.tsx
import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, CircularProgress, Alert, IconButton, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useParams, useNavigate } from 'react-router-dom';
import UserEditForm from '../components/UserEditForm';
import { getUsuarioById } from '../../../api/userService';
import type { UserInfo } from '../../../types/user.types';
import { useAuth } from '../../../contexts/AuthContext';

const UserEditPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [userData, setUserData] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      const fetchUserData = async () => {
        setLoading(true);
        setError(null);
        try {
          const id = parseInt(userId, 10);
          if (isNaN(id)) {
            throw new Error("ID de usuario inválido.");
          }
          const data = await getUsuarioById(id);
          setUserData(data);
        } catch (err: any) {
          console.error("Error al cargar datos del usuario:", err);
          setError(err.message || 'No se pudo cargar la información del usuario.');
        } finally {
          setLoading(false);
        }
      };
      fetchUserData();
    } else {
      setError("No se proporcionó ID de usuario.");
      setLoading(false);
    }
  }, [userId]);

  if (currentUser?.rolUsuario !== 'Administrador') {
     return (
        <Container maxWidth="md">
            <Box sx={{ my: 4, textAlign: 'center' }}>
                <Typography variant="h5" color="error">Acceso Denegado</Typography>
                <Typography>No tienes permisos para editar usuarios.</Typography>
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
        <Button onClick={() => navigate('/usuarios')} sx={{ mt: 2 }}>Volver a la lista</Button>
      </Container>
    );
  }

  if (!userData) {
    return <Alert severity="warning" sx={{ mt: 4 }}>Usuario no encontrado.</Alert>;
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 2, display: 'flex', alignItems: 'center' }}>
        <IconButton onClick={() => navigate(-1)} color="primary" sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Editar Usuario
        </Typography>
      </Box>
      <UserEditForm userData={userData} />
    </Container>
  );
};

export default UserEditPage;