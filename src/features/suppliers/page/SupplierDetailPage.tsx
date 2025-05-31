// src/features/suppliers/pages/SupplierDetailPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  Container, Typography, Box, CircularProgress, Alert, Paper, Avatar, Button,
  Divider, IconButton, Tooltip, Snackbar, Chip, Link as MuiLink, Stack
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter'; // Icono para proveedor
import InfoIcon from '@mui/icons-material/Info';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ContactMailIcon from '@mui/icons-material/ContactMail'; // Para Contacto Principal

import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { getSupplierById, deleteSupplier } from '../../../api/supplierService';
import type { SupplierDetails } from '../../../types/supplier.types';
import { useAuth } from '../../../contexts/AuthContext';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale/es';
import ConfirmationDialog from '../../../components/common/ConfirmationDialog';

const SupplierDetailPage: React.FC = () => {
  const { supplierId: supplierIdParam } = useParams<{ supplierId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [supplier, setSupplier] = useState<SupplierDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const supplierId = parseInt(supplierIdParam || '', 10);

  const fetchSupplierData = useCallback(async () => {
    if (supplierIdParam && !isNaN(supplierId)) {
      setLoading(true);
      setError(null);
      try {
        const data = await getSupplierById(supplierId);
        setSupplier(data);
      } catch (err: any) {
        console.error("Error al cargar datos del proveedor:", err);
        setError(err.message || 'No se pudo cargar la información del proveedor.');
      } finally {
        setLoading(false);
      }
    } else {
      setError("ID de proveedor inválido o no proporcionado.");
      setLoading(false);
    }
  }, [supplierIdParam, supplierId]);

  useEffect(() => {
    fetchSupplierData();
  }, [fetchSupplierData]);

  const handleDeleteClick = () => {
    setOpenDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (supplier) {
      setActionLoading(true);
      setError(null);
      try {
        await deleteSupplier(supplier.idProveedor);
        setSuccessMessage(`Proveedor '${supplier.nombreComercialProveedor}' eliminado correctamente.`);
        setOpenDeleteDialog(false);
        setTimeout(() => navigate('/proveedores'), 2000); // Redirigir a la lista
      } catch (err: any) {
        setError(err.message || `Error al eliminar el proveedor '${supplier.nombreComercialProveedor}'.`);
        setOpenDeleteDialog(false);
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSuccessMessage(null);
    setError(null);
  }

  const canEditSupplier = currentUser?.rolUsuario === 'Administrador' || currentUser?.rolUsuario === 'Gerente';
  const canDeleteSupplier = currentUser?.rolUsuario === 'Administrador';
  const canViewSupplier = currentUser?.rolUsuario === 'Administrador' || currentUser?.rolUsuario === 'Gerente';


  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>;
  }

  if (!canViewSupplier && !loading && !error) {
     return <Container maxWidth="md"><Alert severity="warning" sx={{mt:2}}>No tienes permiso para ver esta página.</Alert></Container>;
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>
        <Button onClick={() => navigate('/proveedores')} sx={{ mt: 2 }}>Volver a la lista</Button>
      </Container>
    );
  }

  if (!supplier) {
    return <Container maxWidth="md"><Alert severity="warning" sx={{ mt: 4 }}>Proveedor no encontrado.</Alert></Container>;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap:1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => navigate(-1)} color="primary" sx={{ mr: 1 }} aria-label="Volver">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Detalle del Proveedor
          </Typography>
        </Box>
        <Box>
          {canEditSupplier && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<EditIcon />}
              component={RouterLink}
              to={`/proveedores/${supplier.idProveedor}/editar`}
              sx={{ mr: 1 }}
            >
              Editar Proveedor
            </Button>
          )}
          {canDeleteSupplier && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDeleteClick}
              disabled={actionLoading}
            >
              Eliminar Proveedor
            </Button>
          )}
        </Box>
      </Box>

      {successMessage && <Alert severity="success" sx={{ mb: 2 }} onClose={handleCloseSnackbar}>{successMessage}</Alert>}
      {error && !loading && <Alert severity="error" sx={{mb:2}} onClose={handleCloseSnackbar}>{error}</Alert>}


      <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'flex-start', gap: 3 }}>
          <Box sx={{ width: { xs: '100%', md: '33.33%' }, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <Avatar sx={{ width: 100, height: 100, mb: 2, bgcolor: 'primary.light' }}>
              <BusinessCenterIcon fontSize="large" />
            </Avatar>
            <Typography variant="h5" component="h2" gutterBottom>
              {supplier.nombreComercialProveedor}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              NIT: {supplier.nitProveedor}
            </Typography>
            {supplier.razonSocialProveedor && (
                <Typography variant="body2" color="text.secondary">
                    Razón Social: {supplier.razonSocialProveedor}
                </Typography>
            )}
          </Box>

          <Box sx={{ width: { xs: '100%', md: '66.66%' } }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <InfoIcon sx={{ mr: 1 }} color="action" /> Información General
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={1.5}>
                {supplier.direccionProveedor && (
                    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{display: 'flex', alignItems: 'center'}}><LocationOnIcon fontSize="inherit" sx={{mr:0.5}}/>Dirección:</Typography>
                        <Typography variant="body1">{supplier.direccionProveedor}</Typography>
                    </Box>
                )}
                {supplier.telefonoProveedor && (
                    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{display: 'flex', alignItems: 'center'}}><PhoneIcon fontSize="inherit" sx={{mr:0.5}}/>Teléfono:</Typography>
                        <Typography variant="body1">{supplier.telefonoProveedor}</Typography>
                    </Box>
                )}
                {supplier.correoProveedor && (
                    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{display: 'flex', alignItems: 'center'}}><EmailIcon fontSize="inherit" sx={{mr:0.5}}/>Correo Electrónico:</Typography>
                        <MuiLink href={`mailto:${supplier.correoProveedor}`} variant="body1" sx={{wordBreak: 'break-all'}}>{supplier.correoProveedor}</MuiLink>
                    </Box>
                )}
                {supplier.contactoPrincipalProveedor && (
                    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{display: 'flex', alignItems: 'center'}}><ContactMailIcon fontSize="inherit" sx={{mr:0.5}}/>Contacto Principal:</Typography>
                        <Typography variant="body1">{supplier.contactoPrincipalProveedor}</Typography>
                    </Box>
                )}
              <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                <Typography variant="body2" color="text.secondary">Fecha Creación:</Typography>
                <Typography variant="body1">{format(parseISO(supplier.fechaCreacion), 'dd/MM/yyyy HH:mm', { locale: es })}</Typography>
              </Box>
              {supplier.fechaActualizacion && (
                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                  <Typography variant="body2" color="text.secondary">Última Actualización:</Typography>
                  <Typography variant="body1">{format(parseISO(supplier.fechaActualizacion), 'dd/MM/yyyy HH:mm', { locale: es })}</Typography>
                </Box>
              )}
          </Stack>
          </Box>
        </Box>
      </Paper>

      {/* Aquí podrías añadir otras secciones relevantes para un proveedor, como:
          - Historial de Órdenes de Compra
          - Productos/Insumos que suministra (si se modela esa relación)
      */}

      <ConfirmationDialog
        open={openDeleteDialog}
        onClose={() => { if (!actionLoading) setOpenDeleteDialog(false); }}
        onConfirm={confirmDelete}
        title="Confirmar Eliminación de Proveedor"
        message={`¿Estás seguro de que deseas eliminar al proveedor "${supplier.nombreComercialProveedor}"?`}
        confirmText="Eliminar"
        isLoading={actionLoading}
      />
       <Snackbar
        open={!!successMessage && !error}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SupplierDetailPage;