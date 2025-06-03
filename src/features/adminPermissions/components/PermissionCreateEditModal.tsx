// src/features/adminPermissions/components/PermissionCreateEditModal.tsx
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  Grid, CircularProgress, Alert, Box
} from '@mui/material';
import type { PermisoRequest, PermisoResponseDTO } from '../../../types/permission.types';
import { createPermission, updatePermission } from '../../../api/permissionService';
import type { ApiErrorResponseDTO } from '../../../types/error.types';

const permissionSchema = yup.object().shape({
  nombrePermiso: yup.string().required('El nombre del permiso es requerido.')
    .matches(/^[A-Z_]+$/, "El nombre debe ser en MAYÚSCULAS y usar guiones bajos (ej. PERMISO_EJEMPLO)")
    .max(100, "Máximo 100 caracteres."),
  // descripcionPermiso: yup.string().optional().nullable().max(255),
});

interface PermissionCreateEditModalProps {
  open: boolean;
  onClose: () => void;
  existingPermission: PermisoResponseDTO | null; // Null para modo creación
}

const PermissionCreateEditModal: React.FC<PermissionCreateEditModalProps> = ({
  open,
  onClose,
  existingPermission,
}) => {
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const isEditMode = !!existingPermission;

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<PermisoRequest>({
    resolver: yupResolver(permissionSchema),
    defaultValues: {
      nombrePermiso: '',
      // descripcionPermiso: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (isEditMode && existingPermission) {
        reset({
          nombrePermiso: existingPermission.nombrePermiso,
          // descripcionPermiso: existingPermission.descripcionPermiso || '',
        });
      } else {
        reset({ nombrePermiso: '' /*, descripcionPermiso: ''*/ });
      }
    }
    if (!open) {
        setFormError(null);
    }
  }, [open, isEditMode, existingPermission, reset]);

  const handleFormSubmit: SubmitHandler<PermisoRequest> = async (data) => {
    if (!isEditMode && !isDirty && !data.nombrePermiso) { // Prevenir envío vacío en creación si isDirty no se activa
         setFormError("El nombre del permiso es requerido.");
         return;
    }
    if (isEditMode && !isDirty) {
        onClose(); // Cerrar si no hay cambios en modo edición
        return;
    }

    setLoading(true);
    setFormError(null);

    try {
      if (isEditMode && existingPermission) {
        await updatePermission(existingPermission.idPermiso, data);
      } else {
        await createPermission(data);
      }
      onClose(); // Cierra el modal y la página padre recargará la lista
    } catch (err: any) {
      console.error("Error al guardar permiso:", err);
      const apiError = err as ApiErrorResponseDTO;
      setFormError(apiError?.message || (isEditMode ? 'Error al actualizar.' : 'Error al crear.'));
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleCloseModal} maxWidth="xs" fullWidth disableEscapeKeyDown={loading}>
      <DialogTitle>{isEditMode ? 'Editar Permiso' : 'Crear Nuevo Permiso'}</DialogTitle>
      <DialogContent>
        {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
        <Box component="form" id="permission-form" onSubmit={handleSubmit(handleFormSubmit)} noValidate sx={{ mt: 1 }}>
          <TextField
            required
            fullWidth
            autoFocus
            margin="dense"
            id="nombrePermiso"
            label="Nombre del Permiso (ej. PERMISO_ACCION)"
            {...register('nombrePermiso')}
            error={!!errors.nombrePermiso}
            helperText={errors.nombrePermiso?.message || "Usar MAYÚSCULAS y guion bajo."}
            disabled={loading}
          />
          {/* <TextField
            fullWidth
            margin="dense"
            id="descripcionPermiso"
            label="Descripción (Opcional)"
            multiline
            rows={2}
            {...register('descripcionPermiso')}
            error={!!errors.descripcionPermiso}
            helperText={errors.descripcionPermiso?.message}
            disabled={loading}
          /> 
          */}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleCloseModal} color="inherit" disabled={loading}>Cancelar</Button>
        <Button
          type="submit"
          form="permission-form" // Asocia este botón con el form
          variant="contained"
          disabled={loading || (isEditMode && !isDirty)}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? (isEditMode ? 'Guardando...' : 'Creando...') : (isEditMode ? 'Guardar Cambios' : 'Crear Permiso')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PermissionCreateEditModal;