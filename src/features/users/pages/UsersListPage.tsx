import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Snackbar,
  Skeleton, // Import Skeleton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { getAllUsuarios, deleteUsuarioAdmin } from '../../../api/userService';
import type { UserInfo } from '../../../types/user.types';
import type { Page } from '../../../types/page.types';
import type { PageableRequest } from '../../../types/page.types';
import { useAuth } from '../../../contexts/AuthContext';
import { format } from 'date-fns';
import ConfirmationDialog from '../../../components/common/ConfirmationDialog';

const UsersListPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [usersPage, setUsersPage] = useState<Page<UserInfo> | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedUserIdToDelete, setSelectedUserIdToDelete] = useState<number | null>(null);
  const [selectedUserNameToDelete, setSelectedUserNameToDelete] = useState<string>('');

  const fetchUsers = useCallback(
    async (currentPage: number, currentRowsPerPage: number) => {
      setLoading(true);
      try {
        const params: PageableRequest = {
          page: currentPage,
          size: currentRowsPerPage,
          sort: 'nombreUsuario,asc',
        };
        const data = await getAllUsuarios(params);
        setUsersPage(data);
      } catch (err: any) {
        setError(err.message || 'Error al cargar usuarios.');
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchUsers(page, rowsPerPage);
  }, [fetchUsers, page, rowsPerPage]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewDetails = (userId: number) => {
    navigate(`/usuarios/${userId}`);
  };

  const handleEditUser = (userId: number) => {
    navigate(`/usuarios/${userId}/editar`);
  };

  const handleDeleteUserClick = (userId: number, userName: string) => {
    setSelectedUserIdToDelete(userId);
    setSelectedUserNameToDelete(userName);
    setOpenDeleteDialog(true);
  };

  const confirmDeleteUser = async () => {
    if (selectedUserIdToDelete) {
      setActionLoading(true);
      setError(null);
      setSuccessMessage(null);
      try {
        await deleteUsuarioAdmin(selectedUserIdToDelete);
        setOpenDeleteDialog(false);
        setSuccessMessage(`Usuario '${selectedUserNameToDelete}' eliminado correctamente.`);
        fetchUsers(page, rowsPerPage);
      } catch (err: any) {
        setError(err.message || `Error al eliminar el usuario '${selectedUserNameToDelete}'.`);
        console.error('Error deleting user:', err);
        setOpenDeleteDialog(false);
      } finally {
        setSelectedUserIdToDelete(null);
        setSelectedUserNameToDelete('');
        setActionLoading(false);
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSuccessMessage(null);
    setError(null);
  };

  const canManageUsers = currentUser?.rolUsuario === 'Administrador';
  const canViewUsers = currentUser?.rolUsuario === 'Administrador' || currentUser?.rolUsuario === 'Gerente';

  // SkeletonRow para mostrar filas esqueleto durante la carga
  const SkeletonRow: React.FC = () => (
    <TableRow>
      <TableCell>
        <Skeleton variant="text" width={40} />
      </TableCell>
      <TableCell>
        <Skeleton variant="text" />
      </TableCell>
      <TableCell>
        <Skeleton variant="text" width={100} />
      </TableCell>
      <TableCell>
        <Skeleton variant="text" />
      </TableCell>
      <TableCell>
        <Skeleton variant="text" width={140} />
      </TableCell>
      <TableCell align="right">
        <Skeleton variant="circular" width={32} height={32} sx={{ display: 'inline-block', mx: 0.5 }} />
        <Skeleton variant="circular" width={32} height={32} sx={{ display: 'inline-block', mx: 0.5 }} />
      </TableCell>
    </TableRow>
  );

  // Mostrar skeleton si está cargando y aún no hay contenido ni error
  if (loading && !usersPage?.content.length && !error) {
    return (
      <Paper sx={{ width: '100%', overflow: 'hidden', p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h1">
            Gestión de Usuarios del Sistema
          </Typography>
          {canManageUsers && (
            <Button variant="contained" color="primary" startIcon={<AddIcon />} disabled>
              Nuevo Usuario
            </Button>
          )}
        </Box>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nombre de Usuario</TableCell>
                <TableCell>Rol</TableCell>
                <TableCell>Empleado Asociado</TableCell>
                <TableCell>Fecha Creación</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[...Array(rowsPerPage)].map((_, index) => (
                <SkeletonRow key={index} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={-1} // Total desconocido durante la carga
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={() => {}} // No hacer nada durante la carga
          onRowsPerPageChange={() => {}} // No hacer nada durante la carga
          labelRowsPerPage="Filas por página:"
        />
      </Paper>
    );
  }

  if (error && !canViewUsers) {
    return <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>;
  }

  if (!canViewUsers && !loading) {
    return <Alert severity="warning">No tienes permiso para ver esta página.</Alert>;
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h1">
          Gestión de Usuarios del Sistema
        </Typography>
        {canManageUsers && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            component={RouterLink}
            to="/usuarios/nuevo"
          >
            Nuevo Usuario
          </Button>
        )}
      </Box>

      {error && canViewUsers && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={handleCloseSnackbar}>
          {error}
        </Alert>
      )}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && usersPage && usersPage.content.length > 0 ? (
        <>
          <TableContainer>
            <Table stickyHeader aria-label="tabla de usuarios" size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Nombre de Usuario</TableCell>
                  <TableCell>Rol</TableCell>
                  <TableCell>Empleado Asociado</TableCell>
                  <TableCell>Fecha Creación</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {usersPage.content.map((usuario) => (
                  <TableRow hover role="checkbox" tabIndex={-1} key={usuario.idUsuario}>
                    <TableCell>{usuario.idUsuario}</TableCell>
                    <TableCell>{usuario.nombreUsuario}</TableCell>
                    <TableCell>{usuario.rolUsuario}</TableCell>
                    <TableCell>
                      {usuario.empleado
                        ? `${usuario.empleado.nombreEmpleado} (ID: ${usuario.empleado.idEmpleado})`
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {usuario.fechaCreacion
                        ? format(new Date(usuario.fechaCreacion), 'dd/MM/yyyy HH:mm')
                        : 'N/A'}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Ver Detalles">
                        <IconButton onClick={() => handleViewDetails(usuario.idUsuario)} color="info" size="small">
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      {canManageUsers && (
                        <>
                          <Tooltip title="Editar Usuario">
                            <IconButton onClick={() => handleEditUser(usuario.idUsuario)} color="primary" size="small">
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Cambiar Contraseña">
                            <IconButton
                              onClick={() => navigate(`/usuarios/${usuario.idUsuario}/cambiar-contrasena`)}
                              color="warning"
                              size="small"
                            >
                              <VpnKeyIcon />
                            </IconButton>
                          </Tooltip>
                          {currentUser?.idUsuario !== usuario.idUsuario && (
                            <Tooltip title="Eliminar Usuario">
                              <IconButton
                                onClick={() => handleDeleteUserClick(usuario.idUsuario, usuario.nombreUsuario)}
                                color="error"
                                size="small"
                                disabled={actionLoading}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={usersPage.totalElements}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Filas por página:"
          />
        </>
      ) : (
        !loading && (
          <Typography sx={{ mt: 2, textAlign: 'center' }}>No se encontraron usuarios.</Typography>
        )
      )}

      <ConfirmationDialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        onConfirm={confirmDeleteUser}
        title="Confirmar Eliminación"
        message={`¿Estás seguro de que deseas eliminar al usuario '${selectedUserNameToDelete}'? Esta acción no se puede deshacer.`}
      />

      <Snackbar
        open={!!successMessage}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        message={successMessage}
      />
    </Paper>
  );
};

export default UsersListPage;