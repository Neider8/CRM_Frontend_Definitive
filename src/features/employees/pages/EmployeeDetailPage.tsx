// src/features/employees/pages/EmployeeDetailPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  Container, Typography, Box, CircularProgress, Alert, Paper, Avatar, Button,
  Divider, Chip, IconButton, Tooltip, Stack
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import InfoIcon from '@mui/icons-material/Info';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { getEmployeeById, deleteEmployee } from '../../../api/employeeService';
import type { EmployeeDetails } from '../../../types/employee.types';
import { useAuth } from '../../../contexts/AuthContext';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import ConfirmationDialog from '../../../components/common/ConfirmationDialog';

const EmployeeDetailPage: React.FC = () => {
  const { employeeId: employeeIdParam } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [employee, setEmployee] = useState<EmployeeDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const employeeId = parseInt(employeeIdParam || '', 10);

  useEffect(() => {
    if (employeeIdParam && !isNaN(employeeId)) {
      const fetchEmployeeData = async () => {
        setLoading(true);
        setError(null);
        try {
          const data = await getEmployeeById(employeeId);
          setEmployee(data);
        } catch (err: any) {
          console.error("Error al cargar datos del empleado:", err);
          setError(err.message || 'No se pudo cargar la información del empleado.');
        } finally {
          setLoading(false);
        }
      };
      fetchEmployeeData();
    } else {
      setError("ID de empleado inválido o no proporcionado.");
      setLoading(false);
    }
  }, [employeeIdParam, employeeId]);

  const handleDeleteClick = () => {
    setOpenDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (employee) {
      setActionLoading(true);
      setError(null);
      try {
        await deleteEmployee(employee.idEmpleado);
        setSuccessMessage(`Empleado '${employee.nombreEmpleado}' eliminado correctamente.`);
        setOpenDeleteDialog(false);
        setTimeout(() => navigate('/empleados'), 2000);
      } catch (err: any) {
        setError(err.message || `Error al eliminar el empleado '${employee.nombreEmpleado}'.`);
        setOpenDeleteDialog(false);
      } finally {
        setActionLoading(false);
      }
    }
  };

  const canEdit = currentUser?.rolUsuario === 'Administrador' || currentUser?.rolUsuario === 'Gerente';
  const canDelete = currentUser?.rolUsuario === 'Administrador';

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>;
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>
        <Button onClick={() => navigate('/empleados')} sx={{ mt: 2 }}>Volver a la lista</Button>
      </Container>
    );
  }

  if (!employee) {
    return (
        <Container maxWidth="md">
            <Alert severity="warning" sx={{ mt: 4 }}>
                Empleado no encontrado o no se pudo cargar la información.
            </Alert>
            <Button onClick={() => navigate('/empleados')} sx={{ mt: 2 }}>Volver a la lista</Button>
        </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => navigate(-1)} color="primary" sx={{ mr: 1 }} aria-label="Volver">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Detalle del Empleado
          </Typography>
        </Box>
        <Box>
          {canEdit && (
            <Button
              variant="outlined"
              color="primary"
              startIcon={<EditIcon />}
              component={RouterLink}
              to={`/empleados/${employee.idEmpleado}/editar`}
              sx={{ mr: 1 }}
            >
              Editar
            </Button>
          )}
          {canDelete && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDeleteClick}
              disabled={actionLoading}
            >
              Eliminar
            </Button>
          )}
        </Box>
      </Box>

      {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

      <Paper elevation={3} sx={{ p: { xs: 2, md: 3 } }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          <Box sx={{ width: { xs: '100%', md: '33.33%' }, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <Avatar sx={{ width: 120, height: 120, mb: 2, fontSize: '3rem', bgcolor: 'primary.light' }}>
              <PersonIcon fontSize="inherit" />
            </Avatar>
            <Typography variant="h5" component="h2" gutterBottom>
              {employee.nombreEmpleado}
            </Typography>
            <Chip label={`ID: ${employee.idEmpleado}`} size="small" sx={{ mb: 1 }} />
            <Typography variant="body1" color="text.secondary">
              {employee.cargoEmpleado || 'Cargo no especificado'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {employee.areaEmpleado || 'Área no especificada'}
            </Typography>
          </Box>

          <Box sx={{ width: { xs: '100%', md: '66.67%' } }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <InfoIcon sx={{ mr: 1 }} color="action" /> Información Personal y Laboral
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={1.5}>
              <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ width: '40%' }}>Tipo Documento:</Typography>
                <Typography variant="body1" sx={{ width: '60%' }}>{employee.tipoDocumento}</Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ width: '40%' }}>Nº Documento:</Typography>
                <Typography variant="body1" sx={{ width: '60%' }}>{employee.numeroDocumento}</Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ width: '40%' }}>Salario:</Typography>
                <Typography variant="body1" sx={{ width: '60%' }}>{employee.salarioEmpleado ? `$${employee.salarioEmpleado.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ width: '40%' }}>Fecha Contratación:</Typography>
                <Typography variant="body1" sx={{ width: '60%' }}>{employee.fechaContratacionEmpleado ? format(parseISO(employee.fechaContratacionEmpleado), 'dd/MM/yyyy', { locale: es }) : 'N/A'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ width: '40%' }}>Fecha Creación Registro:</Typography>
                <Typography variant="body1" sx={{ width: '60%' }}>{format(new Date(employee.fechaCreacion), 'dd/MM/yyyy HH:mm', { locale: es})}</Typography>
              </Box>
              {employee.fechaActualizacion && (
                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ width: '40%' }}>Última Actualización:</Typography>
                  <Typography variant="body1" sx={{ width: '60%' }}>{format(new Date(employee.fechaActualizacion), 'dd/MM/yyyy HH:mm', { locale: es})}</Typography>
                </Box>
              )}
            </Stack>

            {employee.usuario && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <AccountCircleIcon sx={{ mr: 1 }} color="action" /> Cuenta de Usuario Asociada
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ width: '40%' }}>ID Usuario:</Typography>
                    <Typography variant="body1" sx={{ width: '60%' }}>{employee.usuario.idUsuario}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ width: '40%' }}>Nombre de Usuario:</Typography>
                    <Button component={RouterLink} to={`/usuarios/${employee.usuario.idUsuario}`} size="small" sx={{ textTransform: 'none', p: 0, justifyContent: 'flex-start', width: '60%' }}>
                      {employee.usuario.nombreUsuario}
                    </Button>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ width: '40%' }}>Rol de Usuario:</Typography>
                    <Typography variant="body1" sx={{ width: '60%' }}>{employee.usuario.rolUsuario}</Typography>
                  </Box>
                </Stack>
              </Box>
            )}

            {!employee.usuario && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <AccountCircleIcon sx={{ mr: 1 }} color="action" /> Cuenta de Usuario
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                  Este empleado no tiene una cuenta de usuario asociada.
                </Typography>
                {(currentUser?.rolUsuario === 'Administrador') && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AssignmentIndIcon />}
                    onClick={() => {
                      console.log('Valor de employee.nombreEmpleado ANTES de navegar:', employee.nombreEmpleado);
                      navigate(`/usuarios/nuevo?idEmpleado=${employee.idEmpleado}&nombreEmpleado=${encodeURIComponent(employee.nombreEmpleado)}`);
                    }}
                  >
                    Crear y Asociar Usuario
                  </Button>
                )}
              </Box>
            )}
          </Box>
        </Box>
      </Paper>

      <ConfirmationDialog
        open={openDeleteDialog}
        onClose={() => { if (!actionLoading) setOpenDeleteDialog(false); }}
        onConfirm={confirmDelete}
        title="Confirmar Eliminación de Empleado"
        message={`¿Estás seguro de que deseas eliminar al empleado "${employee.nombreEmpleado}"? Esto también podría desvincularlo de su cuenta de usuario.`}
        confirmText="Eliminar"
        isLoading={actionLoading}
      />
    </Container>
  );
};

export default EmployeeDetailPage;