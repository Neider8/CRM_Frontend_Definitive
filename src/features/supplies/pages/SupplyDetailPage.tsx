// src/features/supplies/pages/SupplyDetailPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  Container, Typography, Box, CircularProgress, Alert, Paper, Button,
  Divider, IconButton, Tooltip, Snackbar, Chip, Stack, Avatar
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CategoryIcon from '@mui/icons-material/Category'; // Icono para insumo
import InfoIcon from '@mui/icons-material/Info';
import StraightenIcon from '@mui/icons-material/Straighten'; // Unidad de medida
import InventoryIcon from '@mui/icons-material/Inventory'; // Stock Mínimo

import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { getInsumoById, deleteInsumo } from '../../../api/supplyService';
import type { InsumoDetails } from '../../../types/supply.types';
import { useAuth } from '../../../contexts/AuthContext';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale/es';
import ConfirmationDialog from '../../../components/common/ConfirmationDialog';

const SupplyDetailPage: React.FC = () => {
  const { supplyId: supplyIdParam } = useParams<{ supplyId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [supply, setSupply] = useState<InsumoDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const supplyId = parseInt(supplyIdParam || '', 10);

  const fetchSupplyData = useCallback(async () => {
    if (supplyIdParam && !isNaN(supplyId)) {
      setLoading(true);
      setError(null);
      try {
        const data = await getInsumoById(supplyId);
        setSupply(data);
      } catch (err: any) {
        console.error("Error al cargar datos del insumo:", err);
        setError(err.message || 'No se pudo cargar la información del insumo.');
      } finally {
        setLoading(false);
      }
    } else {
      setError("ID de insumo inválido o no proporcionado.");
      setLoading(false);
    }
  }, [supplyIdParam, supplyId]);

  useEffect(() => {
    fetchSupplyData();
  }, [fetchSupplyData]);

  const handleDeleteClick = () => {
    setOpenDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (supply) {
      setActionLoading(true);
      setError(null);
      try {
        await deleteInsumo(supply.idInsumo);
        setSuccessMessage(`Insumo '${supply.nombreInsumo}' eliminado correctamente.`);
        setOpenDeleteDialog(false);
        setTimeout(() => navigate('/insumos'), 2000);
      } catch (err: any) {
        setError(err.message || `Error al eliminar el insumo '${supply.nombreInsumo}'.`);
        setOpenDeleteDialog(false);
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSuccessMessage(null);
    setError(null);
  };

  // Permisos basados en InsumoController
  const canEditSupply = currentUser?.rolUsuario === 'Administrador' || currentUser?.rolUsuario === 'Gerente';
  const canDeleteSupply = currentUser?.rolUsuario === 'Administrador';
  const canViewSupply = currentUser?.rolUsuario === 'Administrador' || currentUser?.rolUsuario === 'Gerente' || currentUser?.rolUsuario === 'Operario';


  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>;
  }

  if (!canViewSupply && !loading && !error) {
     return <Container maxWidth="md"><Alert severity="warning" sx={{mt:2}}>No tienes permiso para ver esta página.</Alert></Container>;
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>
        <Button onClick={() => navigate('/insumos')} sx={{ mt: 2 }}>Volver a la lista</Button>
      </Container>
    );
  }

  if (!supply) {
    return <Container maxWidth="md"><Alert severity="warning" sx={{ mt: 4 }}>Insumo no encontrado.</Alert></Container>;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap:1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => navigate(-1)} color="primary" sx={{ mr: 1 }} aria-label="Volver">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Detalle del Insumo
          </Typography>
        </Box>
        <Box>
          {canEditSupply && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<EditIcon />}
              component={RouterLink}
              to={`/insumos/${supply.idInsumo}/editar`}
              sx={{ mr: 1 }}
            >
              Editar Insumo
            </Button>
          )}
          {canDeleteSupply && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDeleteClick}
              disabled={actionLoading}
            >
              Eliminar Insumo
            </Button>
          )}
        </Box>
      </Box>

      {successMessage && <Alert severity="success" sx={{ mb: 2 }} onClose={handleCloseSnackbar}>{successMessage}</Alert>}
      {error && !loading && <Alert severity="error" sx={{mb:2}} onClose={handleCloseSnackbar}>{error}</Alert>}


      <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'flex-start', gap: 3 }}>
          <Box sx={{ width: { xs: '100%', md: '33.33%' }, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <Avatar sx={{ width: 100, height: 100, mb: 2, bgcolor: 'secondary.light' }}>
              <CategoryIcon fontSize="large" />
            </Avatar>
            <Typography variant="h5" component="h2" gutterBottom>
              {supply.nombreInsumo}
            </Typography>
            <Chip label={`ID: ${supply.idInsumo}`} size="small" sx={{ mb: 1 }} />
          </Box>

          <Box sx={{ width: { xs: '100%', md: '66.66%' } }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <InfoIcon sx={{ mr: 1 }} color="action" /> Información del Insumo
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={1.5}>
              <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{display:'flex', alignItems:'center'}}>Descripción:</Typography>
                <Typography variant="body1">{supply.descripcionInsumo || 'N/A'}</Typography></Box>
              <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{display:'flex', alignItems:'center'}}><StraightenIcon sx={{mr:0.5}} fontSize="inherit"/>Unidad de Medida:</Typography>
                <Typography variant="body1">{supply.unidadMedidaInsumo}</Typography></Box>
              <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{display:'flex', alignItems:'center'}}><InventoryIcon sx={{mr:0.5}} fontSize="inherit"/>Stock Mínimo:</Typography>
                <Typography variant="body1">{supply.stockMinimoInsumo ?? 'N/A'}</Typography></Box>
              <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                <Typography variant="body2" color="text.secondary">Fecha Creación:</Typography>
                <Typography variant="body1">{format(parseISO(supply.fechaCreacion), 'dd/MM/yyyy HH:mm', { locale: es })}</Typography></Box>
              {supply.fechaActualizacion && (
                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                  <Typography variant="body2" color="text.secondary">Última Actualización:</Typography>
                  <Typography variant="body1">{format(parseISO(supply.fechaActualizacion), 'dd/MM/yyyy HH:mm', { locale: es })}</Typography></Box>
              )}
            </Stack>
          </Box>
        </Box>
      </Paper>

      {/* Posibles secciones futuras:
          - Historial de movimientos de inventario para este insumo.
          - Productos que utilizan este insumo (BOM inverso).
          - Órdenes de compra donde se ha solicitado este insumo.
       */}

      <ConfirmationDialog
        open={openDeleteDialog}
        onClose={() => { if (!actionLoading) setOpenDeleteDialog(false); }}
        onConfirm={confirmDelete}
        title="Confirmar Eliminación de Insumo"
        message={`¿Estás seguro de que deseas eliminar el insumo "${supply.nombreInsumo}"? Esta acción puede afectar listas de materiales, órdenes de compra o inventario.`}
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

export default SupplyDetailPage;