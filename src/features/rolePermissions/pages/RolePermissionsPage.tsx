// src/features/rolePermissions/pages/RolePermissionsPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  Container, Typography, Box, Paper, Select, MenuItem, FormControl, InputLabel,
  CircularProgress, Alert, Checkbox,
  FormControlLabel, FormGroup, Snackbar
} from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import { useAuth } from '../../../contexts/AuthContext';
import type { SystemRole } from '../../../types/rolePermission.types';
import type { PermisoResponseDTO } from '../../../types/permission.types';
import { getAllPermissions } from '../../../api/permissionService';
import { getPermissionsForRole, assignPermissionToRole, removePermissionFromRole } from '../../../api/rolePermissionService';
import type { ApiErrorResponseDTO } from '../../../types/error.types';

const ROLES: SystemRole[] = ['Administrador', 'Gerente', 'Operario', 'Ventas']; // Roles fijos por ahora

const RolePermissionsPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [selectedRole, setSelectedRole] = useState<SystemRole | ''>('');
  const [allPermissions, setAllPermissions] = useState<PermisoResponseDTO[]>([]);
  const [rolePermissions, setRolePermissions] = useState<PermisoResponseDTO[]>([]);

  const [loadingAllPermissions, setLoadingAllPermissions] = useState(false);
  const [loadingRolePermissions, setLoadingRolePermissions] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Cargar todos los permisos disponibles una vez
  useEffect(() => {
    const fetchAllPermissions = async () => {
      setLoadingAllPermissions(true);
      try {
        const data = await getAllPermissions();
        setAllPermissions(data);
      } catch (err: any) {
        setError(err.message || 'Error al cargar la lista de todos los permisos.');
      } finally {
        setLoadingAllPermissions(false);
      }
    };
    fetchAllPermissions();
  }, []);

  // Cargar permisos del rol seleccionado
  const fetchPermissionsForSelectedRole = useCallback(async () => {
    if (selectedRole) {
      setLoadingRolePermissions(true);
      setError(null);
      try {
        const data = await getPermissionsForRole(selectedRole);
        setRolePermissions(data);
      } catch (err: any) {
        setError(err.message || `Error al cargar permisos para el rol ${selectedRole}.`);
        setRolePermissions([]);
      } finally {
        setLoadingRolePermissions(false);
      }
    } else {
      setRolePermissions([]);
    }
  }, [selectedRole]);

  useEffect(() => {
    fetchPermissionsForSelectedRole();
  }, [fetchPermissionsForSelectedRole]);

  const handleRoleChange = (event: any) => {
    setSelectedRole(event.target.value as SystemRole | '');
  };

  const handlePermissionToggle = async (permiso: PermisoResponseDTO, isAssigned: boolean) => {
    if (!selectedRole) return;
    setActionLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (isAssigned) {
        await removePermissionFromRole(selectedRole, permiso.idPermiso);
        setSuccessMessage(`Permiso '${permiso.nombrePermiso}' removido del rol '${selectedRole}'.`);
      } else {
        await assignPermissionToRole({ rolNombre: selectedRole, idPermiso: permiso.idPermiso });
        setSuccessMessage(`Permiso '${permiso.nombrePermiso}' asignado al rol '${selectedRole}'.`);
      }
      setSnackbarOpen(true);
      fetchPermissionsForSelectedRole();
    } catch (err: any) {
      const apiError = err as ApiErrorResponseDTO;
      setError(apiError?.message || 'Error al actualizar el permiso para el rol.');
      setSnackbarOpen(true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseSnackbar = () => setSnackbarOpen(false);

  if (currentUser?.rolUsuario !== 'Administrador') {
    return <Container><Alert severity="error" sx={{mt:2}}>Acceso Denegado. Esta sección es solo para Administradores.</Alert></Container>;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{display: 'flex', alignItems: 'center'}}>
        <SecurityIcon sx={{mr:1}} fontSize="large"/> Gestión de Roles y Permisos
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      <Paper elevation={3} sx={{ p: 3 }}>
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel id="select-role-label">Seleccionar Rol a Gestionar</InputLabel>
          <Select
            labelId="select-role-label"
            id="select-role"
            value={selectedRole}
            label="Seleccionar Rol a Gestionar"
            onChange={handleRoleChange}
          >
            <MenuItem value=""><em>-- Seleccione un Rol --</em></MenuItem>
            {ROLES.map(role => (
              <MenuItem key={role} value={role}>{role}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {loadingAllPermissions && <Box sx={{display:'flex', justifyContent:'center', my:2}}><CircularProgress /></Box>}

        {selectedRole && !loadingAllPermissions && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Permisos para el Rol: <strong>{selectedRole}</strong>
            </Typography>
            {loadingRolePermissions ? (
              <Box sx={{display:'flex', justifyContent:'center', my:2}}><CircularProgress size={30} /></Box>
            ) : (
              <FormGroup>
                {allPermissions.map(permiso => {
                  const isAssigned = rolePermissions.some(rp => rp.idPermiso === permiso.idPermiso);
                  return (
                    <FormControlLabel
                      key={permiso.idPermiso}
                      control={
                        <Checkbox
                          checked={isAssigned}
                          onChange={() => handlePermissionToggle(permiso, isAssigned)}
                          disabled={actionLoading}
                        />
                      }
                      label={`${permiso.nombrePermiso} (ID: ${permiso.idPermiso})`}
                      sx={{ mb: 1 }}
                    />
                  );
                })}
              </FormGroup>
            )}
            {allPermissions.length === 0 && !loadingAllPermissions && (
                <Typography color="text.secondary" sx={{mt:2}}>No hay permisos definidos en el sistema.</Typography>
            )}
          </Box>
        )}
      </Paper>
      <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleCloseSnackbar} severity={successMessage ? "success" : "error"} sx={{ width: '100%' }} variant="filled">
          {successMessage || error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default RolePermissionsPage;