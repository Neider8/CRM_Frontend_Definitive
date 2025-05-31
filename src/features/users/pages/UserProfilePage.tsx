// src/features/users/pages/UserProfilePage.tsx
import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Paper,
  Avatar,
  Button,
  Divider,
  Chip,
  IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import WorkIcon from '@mui/icons-material/Work';
import InfoIcon from '@mui/icons-material/Info';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { getUsuarioById } from '../../../api/userService';
import type { UserInfo } from '../../../types/user.types';
import { useAuth } from '../../../contexts/AuthContext';
import { format } from 'date-fns';

const UserProfilePage: React.FC = () => {
  const { userId: userIdParam } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [viewedUser, setViewedUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userIdParam) {
      const fetchUserData = async () => {
        setLoading(true);
        setError(null);
        try {
          const id = parseInt(userIdParam, 10);
          if (isNaN(id)) throw new Error('ID de usuario inválido.');

          const canView =
            currentUser?.idUsuario === id ||
            currentUser?.rolUsuario === 'Administrador' ||
            currentUser?.rolUsuario === 'Gerente';

          if (!canView) throw new Error('No tienes permiso para ver este perfil.');

          const data = await getUsuarioById(id);
          setViewedUser(data);
        } catch (err: any) {
          setError(err.message || 'No se pudo cargar la información del usuario.');
        } finally {
          setLoading(false);
        }
      };
      fetchUserData();
    } else {
      setError('No se proporcionó ID de usuario.');
      setLoading(false);
    }
  }, [userIdParam, currentUser]);

  const canCurrentUserEdit =
    currentUser?.rolUsuario === 'Administrador' ||
    (currentUser?.rolUsuario === 'Gerente' && viewedUser?.rolUsuario !== 'Administrador') ||
    currentUser?.idUsuario === viewedUser?.idUsuario;

  const canAdminManage = currentUser?.rolUsuario === 'Administrador';

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
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
        <Button onClick={() => navigate('/usuarios')} sx={{ mt: 2 }}>
          Volver a la lista
        </Button>
      </Container>
    );
  }

  if (!viewedUser) {
    return (
      <Container maxWidth="md">
        <Alert severity="warning" sx={{ mt: 4 }}>
          Usuario no encontrado.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ pt: 2 }}>
      <Box sx={{ my: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => navigate(-1)} color="primary" sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4">Perfil de Usuario</Typography>
        </Box>
        {canCurrentUserEdit && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<EditIcon />}
            component={RouterLink}
            to={`/usuarios/${viewedUser.idUsuario}/editar`}
          >
            Editar Usuario
          </Button>
        )}
      </Box>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 4,
            alignItems: 'flex-start',
          }}
        >
          {/* Lado Izquierdo: Avatar e info breve */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar sx={{ width: 120, height: 120, mb: 2, fontSize: '3rem', bgcolor: 'primary.main' }}>
              {viewedUser.nombreUsuario.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="h5" gutterBottom>
              {viewedUser.nombreUsuario}
            </Typography>
            <Chip label={viewedUser.rolUsuario} color="secondary" sx={{ mb: 2 }} />

            {canAdminManage && currentUser?.idUsuario !== viewedUser.idUsuario && (
              <Button
                variant="outlined"
                color="warning"
                startIcon={<VpnKeyIcon />}
                component={RouterLink}
                to={`/usuarios/${viewedUser.idUsuario}/cambiar-contrasena`}
                sx={{ mt: 1, width: '100%' }}
              >
                Cambiar Contraseña
              </Button>
            )}

            {currentUser?.idUsuario === viewedUser.idUsuario && (
              <Button
                variant="outlined"
                color="warning"
                startIcon={<VpnKeyIcon />}
                component={RouterLink}
                to={`/perfil/cambiar-contrasena`}
                sx={{ mt: 1, width: '100%' }}
              >
                Cambiar Mi Contraseña
              </Button>
            )}
          </Box>

          {/* Lado Derecho: Detalles */}
          <Box sx={{ flex: 2 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <InfoIcon sx={{ mr: 1 }} color="action" /> Detalles de la Cuenta
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <InfoRow label="ID de Usuario:" value={viewedUser.idUsuario} />
              <InfoRow label="Nombre de Usuario:" value={viewedUser.nombreUsuario} />
              <InfoRow label="Rol:" value={viewedUser.rolUsuario} />
              <InfoRow
                label="Fecha de Creación:"
                value={
                  viewedUser.fechaCreacion
                    ? format(new Date(viewedUser.fechaCreacion), 'dd/MM/yyyy HH:mm:ss')
                    : 'N/A'
                }
              />
              <InfoRow
                label="Última Actualización:"
                value={
                  viewedUser.fechaActualizacion
                    ? format(new Date(viewedUser.fechaActualizacion), 'dd/MM/yyyy HH:mm:ss')
                    : 'N/A'
                }
              />
            </Box>

            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <WorkIcon sx={{ mr: 1 }} color="action" /> Información del Empleado Asociado
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {viewedUser.empleado ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <InfoRow label="ID de Empleado:" value={viewedUser.empleado.idEmpleado} />
                  <InfoRow label="Nombre del Empleado:" value={viewedUser.empleado.nombreEmpleado} />
                  <InfoRow label="Número de Documento:" value={viewedUser.empleado.numeroDocumento} />
                </Box>
              ) : (
                <Typography variant="body1" color="text.secondary">
                  Este usuario no está asociado a ningún empleado.
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

// Componente auxiliar para mostrar filas de información
const InfoRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', mb: 1 }}>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body1">{value}</Typography>
  </Box>
);

export default UserProfilePage;