// src/features/users/pages/UserChangePasswordAdminPage.tsx
import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, CircularProgress, Alert, IconButton, Button, Paper } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useParams, useNavigate } from 'react-router-dom';
import ChangePasswordForm from '../components/ChangePasswordForm';
import { getUsuarioById } from '../../../api/userService'; // Para obtener el nombre del usuario
import type { UserInfo } from '../../../types/user.types';
import { useAuth } from '../../../contexts/AuthContext';

const UserChangePasswordAdminPage: React.FC = () => {
  const { userId: userIdParam } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [targetUser, setTargetUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId = parseInt(userIdParam || '', 10);

  useEffect(() => {
    if (userIdParam && !isNaN(userId)) {
      const fetchTargetUserData = async () => {
        setLoading(true);
        setError(null);
        try {
          const data = await getUsuarioById(userId);
          setTargetUser(data);
        } catch (err: any) {
          console.error("Error al cargar datos del usuario objetivo:", err);
          setError(err.message || 'No se pudo cargar la información del usuario objetivo.');
        } finally {
          setLoading(false);
        }
      };
      fetchTargetUserData();
    } else {
      setError("ID de usuario inválido o no proporcionado.");
      setLoading(false);
    }
  }, [userIdParam, userId]);

  if (currentUser?.rolUsuario !== 'Administrador') {
    return (
      <Container maxWidth="sm"><Alert severity="error" sx={{ mt: 4 }}>Acceso Denegado: Solo administradores pueden realizar esta acción.</Alert></Container>
    );
  }

  if (currentUser?.idUsuario === userId) {
      return (
      <Container maxWidth="sm"><Alert severity="warning" sx={{ mt: 4 }}>Un administrador no puede cambiar su propia contraseña desde esta interfaz. Use la opción de perfil.</Alert></Container>
    );
  }

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>;
  }

  if (error || !targetUser) {
    return <Container maxWidth="sm"><Alert severity="error" sx={{ mt: 4 }}>{error || 'Usuario objetivo no encontrado.'}</Alert></Container>;
  }

  const handleSuccess = () => {
    setTimeout(() => {
      navigate(`/usuarios/${userId}`); // Volver al perfil del usuario o a la lista
    }, 2000);
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 2, display: 'flex', alignItems: 'center' }}>
        <IconButton onClick={() => navigate(-1)} color="primary" sx={{ mr: 1 }} aria-label="Volver">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" component="h1">
          Cambiar Contraseña (Admin)
        </Typography>
      </Box>
      <Paper elevation={3} sx={{p:3}}>
        <ChangePasswordForm
          userId={targetUser.idUsuario}
          userName={targetUser.nombreUsuario}
          isOwnPasswordChange={false} // El admin está cambiando la de otro
          onSuccess={handleSuccess}
          onCancel={() => navigate(`/usuarios/${userId}`)} // O a /usuarios
        />
      </Paper>
    </Container>
  );
};

export default UserChangePasswordAdminPage;