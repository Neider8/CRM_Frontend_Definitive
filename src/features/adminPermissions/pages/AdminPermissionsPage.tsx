// src/features/adminPermissions/pages/AdminPermissionsPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  Container, Typography, Box, Paper, Button, TableContainer, Table, TableHead, TableRow,
  TableCell, TableBody, CircularProgress, Alert, IconButton, Tooltip, Snackbar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ShieldIcon from '@mui/icons-material/Shield';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import type { PermisoResponseDTO } from '../../../types/permission.types';
import { getAllPermissions, deletePermission } from '../../../api/permissionService';
import ConfirmationDialog from '../../../components/common/ConfirmationDialog';
import PermissionCreateEditModal from '../components/PermissionCreateEditModal'; // Importar

const AdminPermissionsPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [permissions, setPermissions] = useState<PermisoResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedPermissionToDelete, setSelectedPermissionToDelete] = useState<PermisoResponseDTO | null>(null);

  const [editingPermission, setEditingPermission] = useState<PermisoResponseDTO | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchPermissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllPermissions();
      setPermissions(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar la lista de permisos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const handleDeleteClick = (permission: PermisoResponseDTO) => {
    setSelectedPermissionToDelete(permission);
    setOpenDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (selectedPermissionToDelete) {
      setActionLoading(true);
      setError(null);
      try {
        await deletePermission(selectedPermissionToDelete.idPermiso);
        setSuccessMessage(`Permiso '${selectedPermissionToDelete.nombrePermiso}' eliminado correctamente.`);
        setSnackbarOpen(true);
        fetchPermissions(); // Recargar
      } catch (err: any) {
        setError(err.message || `Error al eliminar el permiso.`);
        setSnackbarOpen(true);
      } finally {
        setOpenDeleteDialog(false);
        setSelectedPermissionToDelete(null);
        setActionLoading(false);
      }
    }
  };

  const handleOpenCreateModal = () => {
    setEditingPermission(null); // Asegurar que no haya datos de edición
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (permission: PermisoResponseDTO) => {
    setEditingPermission(permission);
    setIsCreateModalOpen(true); // Reutilizaremos el mismo modal para crear y editar
  };

  const handleModalClose = () => {
    setIsCreateModalOpen(false);
    setEditingPermission(null);
    fetchPermissions(); // Recargar por si hubo cambios
  };

  const handleCloseSnackbar = () => setSnackbarOpen(false);

  if (currentUser?.rolUsuario !== 'Administrador') {
    return <Container><Alert severity="error" sx={{mt:2}}>Acceso Denegado. Esta sección es solo para Administradores.</Alert></Container>;
  }

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>;

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1" sx={{display:'flex', alignItems:'center'}}>
          <ShieldIcon sx={{mr:1}} fontSize="large"/> Administrar Definiciones de Permisos
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateModal}
        >
          Nuevo Permiso
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      <Paper elevation={3}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{fontWeight:'bold'}}>ID</TableCell>
                <TableCell sx={{fontWeight:'bold'}}>Nombre del Permiso</TableCell>
                {/* Podrías añadir descripción si la implementas */}
                <TableCell align="right" sx={{fontWeight:'bold'}}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {permissions.length > 0 ? permissions.map((perm) => (
                <TableRow hover key={perm.idPermiso}>
                  <TableCell>{perm.idPermiso}</TableCell>
                  <TableCell component="th" scope="row">{perm.nombrePermiso}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Editar Permiso">
                      <IconButton onClick={() => handleOpenEditModal(perm)} color="primary" size="small">
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar Permiso">
                      <IconButton onClick={() => handleDeleteClick(perm)} color="error" size="small" disabled={actionLoading}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                    <TableCell colSpan={3} align="center">No hay permisos definidos.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <ConfirmationDialog
        open={openDeleteDialog}
        onClose={() => { if (!actionLoading) setOpenDeleteDialog(false); }}
        onConfirm={confirmDelete}
        title="Confirmar Eliminación de Permiso"
        message={selectedPermissionToDelete ? `¿Seguro que deseas eliminar el permiso "${selectedPermissionToDelete.nombrePermiso}" (ID: ${selectedPermissionToDelete.idPermiso})? Esta acción puede afectar los roles que lo tengan asignado.` : '¿Eliminar este permiso?'}
        confirmText="Eliminar"
        isLoading={actionLoading}
      />

      {/* Modal para Crear/Editar Permiso */}
      {isCreateModalOpen && (
        <PermissionCreateEditModal
          open={isCreateModalOpen}
          onClose={handleModalClose}
          existingPermission={editingPermission} // Pasa null si es creación
        />
      )}

      <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleCloseSnackbar} severity={successMessage ? "success" : "error"} sx={{ width: '100%' }} variant="filled">
          {successMessage || error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminPermissionsPage;