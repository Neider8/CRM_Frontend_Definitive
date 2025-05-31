// src/features/supplyInventory/pages/SupplyInventoryDetailPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  Container, Typography, Box, CircularProgress, Alert, Paper, Button,
  Divider, IconButton, Tooltip, TableContainer, Table, TableHead, TableRow,
  TableCell, TableBody, TablePagination, Chip, Link as MuiLink, Stack
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import CategoryIcon from '@mui/icons-material/Category';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import HistoryIcon from '@mui/icons-material/History';
import NumbersIcon from '@mui/icons-material/Numbers';

import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { getSupplyInventoryById, getMovementsBySupplyInventoryId, getCurrentStockForSupplyInventory } from '../../../api/supplyInventoryService';
import type { SupplyInventoryDetails, SupplyMovementDetails, PaginatedSupplyMovements, SupplyInventoryPageableRequest } from '../../../types/inventory.types';
import { useAuth } from '../../../contexts/AuthContext';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale/es';
import SupplyMovementCreateModal from '../components/SupplyMovementCreateModal'; // Asegúrate que este import sea correcto

const SupplyInventoryDetailPage: React.FC = () => {
  const { inventoryId: inventoryIdParam } = useParams<{ inventoryId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [inventoryDetails, setInventoryDetails] = useState<SupplyInventoryDetails | null>(null);
  const [movementsPage, setMovementsPage] = useState<PaginatedSupplyMovements | null>(null);
  const [currentStock, setCurrentStock] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [movementsLoading, setMovementsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [movementsTablePage, setMovementsTablePage] = useState(0);
  const [movementsRowsPerPage, setMovementsRowsPerPage] = useState(5);

  // Estado para controlar la visibilidad del modal de registrar movimiento
  const [openRegisterMovementModal, setOpenRegisterMovementModal] = useState(false);

  const inventoryId = parseInt(inventoryIdParam || '', 10);

  const fetchInventoryAndMovements = useCallback(async (mvtPage = movementsTablePage, mvtRows = movementsRowsPerPage) => {
    if (inventoryIdParam && !isNaN(inventoryId)) {
      if (!inventoryDetails) setLoading(true);
      setMovementsLoading(true);
      setError(null);
      try {
        if (!inventoryDetails || inventoryDetails.idInventarioInsumo !== inventoryId) {
            const detailsData = await getSupplyInventoryById(inventoryId);
            setInventoryDetails(detailsData);
            const stockData = await getCurrentStockForSupplyInventory(inventoryId);
            setCurrentStock(stockData);
        } else {
             const stockData = await getCurrentStockForSupplyInventory(inventoryId);
             setCurrentStock(stockData);
        }

        const movementsParams: SupplyInventoryPageableRequest = { page: mvtPage, size: mvtRows, sort: 'fechaMovimiento,desc' };
        const movementsData = await getMovementsBySupplyInventoryId(inventoryId, movementsParams);
        setMovementsPage(movementsData);

      } catch (err: any) {
        console.error("Error al cargar datos del inventario de insumo y movimientos:", err);
        setError(err.message || 'No se pudo cargar la información del inventario o sus movimientos.');
      } finally {
        setLoading(false);
        setMovementsLoading(false);
      }
    } else {
      setError("ID de inventario de insumo inválido o no proporcionado.");
      setLoading(false);
      setMovementsLoading(false);
    }
  }, [inventoryIdParam, inventoryId, inventoryDetails, movementsTablePage, movementsRowsPerPage]);

  useEffect(() => {
    fetchInventoryAndMovements();
  }, [fetchInventoryAndMovements]);

  const handleChangeMovementsPage = (event: unknown, newPage: number) => {
    setMovementsTablePage(newPage);
  };

  const handleChangeMovementsRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setMovementsRowsPerPage(newRowsPerPage);
    setMovementsTablePage(0);
  };
  
  const handleMovementRegistered = () => {
    fetchInventoryAndMovements(); 
    // El modal se cierra desde su propia lógica onClose, que llama a setOpenRegisterMovementModal(false)
  };

  const canManageInventory = currentUser?.rolUsuario === 'Administrador' || 
                             currentUser?.rolUsuario === 'Gerente' || 
                             currentUser?.rolUsuario === 'Operario';
  const canViewInventory = canManageInventory;


  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>;
  }
  
  if (!canViewInventory && !loading && !error) {
     return (
        <Container maxWidth="md">
            <Box sx={{ my: 4, textAlign: 'center' }}>
                <Typography variant="h5" color="error">Acceso Denegado</Typography>
                <Typography>No tienes permiso para ver esta página.</Typography>
                <Button variant="outlined" onClick={() => navigate(-1)} sx={{mt: 2}}>Volver</Button>
            </Box>
        </Container>
    );
  }

  if (error && !inventoryDetails) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>
        <Button onClick={() => navigate('/inventario-insumos')} sx={{ mt: 2 }}>Volver a la lista</Button>
      </Container>
    );
  }

  if (!inventoryDetails) {
    return <Container maxWidth="md"><Alert severity="warning" sx={{ mt: 4 }}>Registro de inventario de insumo no encontrado.</Alert></Container>;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap:'wrap', gap:1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => navigate(-1)} color="primary" sx={{ mr: 1 }} aria-label="Volver">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Detalle de Inventario de Insumo
          </Typography>
        </Box>
        {canManageInventory && (
            <Button
              variant="contained"
              color="secondary"
              startIcon={<SyncAltIcon />}
              onClick={() => setOpenRegisterMovementModal(true)}
            >
              Registrar Movimiento
            </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <CategoryIcon sx={{mr:1}}/> Información del Registro de Inventario
        </Typography>
        <Divider sx={{mb:2}}/>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
          <Box sx={{ width: { xs: '100%', md: 'auto' } }}>
            <Typography variant="body2" color="text.secondary">ID Inventario:</Typography>
            <Typography variant="h6">{inventoryDetails.idInventarioInsumo}</Typography>
          </Box>
          <Box sx={{ width: { xs: '100%', md: 'auto' } }}>
            <Typography variant="body2" color="text.secondary" sx={{display: 'flex', alignItems: 'center'}}><CategoryIcon sx={{mr:0.5}} fontSize="inherit"/>Insumo:</Typography>
            <MuiLink component={RouterLink} to={`/insumos/${inventoryDetails.insumo.idInsumo}`} variant="h6">
                {inventoryDetails.insumo.nombreInsumo}
            </MuiLink>
          </Box>
          <Box sx={{ width: { xs: '100%', md: 'auto' } }}>
            <Typography variant="body2" color="text.secondary" sx={{display: 'flex', alignItems: 'center'}}><LocationOnIcon sx={{mr:0.5}} fontSize="inherit"/>Ubicación:</Typography>
            <Typography variant="h6">{inventoryDetails.ubicacionInventario}</Typography>
          </Box>
          <Box sx={{ width: { xs: '100%', md: 'auto' } }}>
             <Typography variant="body2" color="text.secondary" sx={{display:'flex', alignItems:'center'}}><NumbersIcon sx={{mr:0.5}} fontSize="inherit"/>Stock Actual:</Typography>
             <Chip
                label={`${currentStock !== null ? Number(currentStock).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 3 }) : Number(inventoryDetails.cantidadStock).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 3 })} ${inventoryDetails.insumo.unidadMedidaInsumo}`}
                color={currentStock !== null && currentStock <=0 ? "error" : "success"}
                sx={{fontSize: '1.1rem', px:1, py: 2, height: 'auto'}}
            />
          </Box>
          <Box sx={{ width: { xs: '100%', md: 'auto' } }}>
            <Typography variant="body2" color="text.secondary">Última Actualización:</Typography>
            <Typography variant="body1">
              {inventoryDetails.ultimaActualizacion ? format(parseISO(inventoryDetails.ultimaActualizacion), 'dd/MM/yyyy HH:mm:ss', { locale: es }) : 'N/A'}
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, mt: 3 }}>
        <Typography variant="h6" component="h2" sx={{ display: 'flex', alignItems: 'center', mb:2 }}>
          <HistoryIcon sx={{ mr: 1 }} /> Historial de Movimientos
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {movementsLoading && <Box sx={{display:'flex', justifyContent:'center', my:2}}><CircularProgress size={30}/></Box>}
        {!movementsLoading && movementsPage && movementsPage.content.length > 0 ? (
          <Stack direction="column" spacing={2}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>ID Mov.</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell align="right">Cantidad</TableCell>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Descripción</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {movementsPage.content.map((mov) => (
                    <TableRow key={mov.idMovimientoInsumo} sx={{bgcolor: mov.tipoMovimiento === 'Entrada' ? 'success.lightest' : 'error.lightest' }}>
                      <TableCell>{mov.idMovimientoInsumo}</TableCell>
                       <TableCell>
                        <Chip
                            label={mov.tipoMovimiento}
                            color={mov.tipoMovimiento === 'Entrada' ? 'success' : 'error'}
                            size="small"
                            variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">{Number(mov.cantidadMovimiento).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 3 })}</TableCell>
                      <TableCell>{format(parseISO(mov.fechaMovimiento), 'dd/MM/yyyy HH:mm', { locale: es })}</TableCell>
                      <TableCell>{mov.descripcionMovimiento || 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={movementsPage.totalElements}
              rowsPerPage={movementsRowsPerPage}
              page={movementsTablePage}
              onPageChange={handleChangeMovementsPage}
              onRowsPerPageChange={handleChangeMovementsRowsPerPage}
              labelRowsPerPage="Movs. por página:"
            />
          </Stack>
        ) : (
          !movementsLoading && <Typography color="text.secondary" sx={{textAlign: 'center', py:2}}>No hay movimientos registrados para este ítem de inventario de insumo.</Typography>
        )}
      </Paper>

      {/* Modal para registrar movimiento de insumo */}
      {inventoryDetails && inventoryDetails.insumo && currentStock !== null && (
        <SupplyMovementCreateModal
            open={openRegisterMovementModal}
            onClose={() => setOpenRegisterMovementModal(false)}
            inventoryId={inventoryDetails.idInventarioInsumo}
            insumoName={inventoryDetails.insumo.nombreInsumo}
            insumoUnidad={inventoryDetails.insumo.unidadMedidaInsumo}
            location={inventoryDetails.ubicacionInventario}
            currentStock={currentStock}
            onMovementRegistered={handleMovementRegistered}
        />
      )}
    </Container>
  );
};

export default SupplyInventoryDetailPage;