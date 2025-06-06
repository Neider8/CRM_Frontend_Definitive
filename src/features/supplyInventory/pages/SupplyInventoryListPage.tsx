// src/features/supplyInventory/pages/SupplyInventoryListPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Button, Paper, TableContainer, Table, TableHead, TableRow,
  TableCell, TableBody, TablePagination, CircularProgress, Alert, IconButton, Tooltip, Link, Container
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import CategoryIcon from '@mui/icons-material/Category'; // Icono para insumos
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { getAllSupplyInventories } from '../../../api/supplyInventoryService';
import type { SupplyInventoryPageableRequest, PaginatedSupplyInventories } from '../../../types/inventory.types';
import { useAuth } from '../../../contexts/AuthContext';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { formatCurrency } from '../../../utils/formatting'; // Si necesitas formatear cantidades con decimales

const SupplyInventoryListPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [inventoryPage, setInventoryPage] = useState<PaginatedSupplyInventories | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchInventories = useCallback(async (currentPage: number, currentRowsPerPage: number) => {
    setLoading(true);
    setError(null);
    try {
      const params: SupplyInventoryPageableRequest = {
        page: currentPage,
        size: currentRowsPerPage,
        sort: 'insumo.nombreInsumo,asc', // Ordenar por nombre de insumo
      };
      const data = await getAllSupplyInventories(params);
      setInventoryPage(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar el inventario de insumos.');
      console.error("Error fetching supply inventories:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventories(page, rowsPerPage);
  }, [fetchInventories, page, rowsPerPage]);

  const handleChangePage = (event: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewDetails = (inventoryId: number) => {
    navigate(`/inventario-insumos/${inventoryId}`);
  };

  const handleRegisterMovement = (inventoryId: number) => {
    navigate(`/inventario-insumos/${inventoryId}/movimientos/nuevo`);
  };

  // Permisos según InventarioInsumoController
  const canManageInventory = currentUser?.rolUsuario === 'Administrador' || 
                             currentUser?.rolUsuario === 'Gerente' || 
                             currentUser?.rolUsuario === 'Operario';
  const canViewInventory = canManageInventory; // En este caso, ver y gestionar tienen los mismos roles

  if (loading && !inventoryPage?.content.length && !error) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>;
  }
  if (!canViewInventory && !loading && !error) {
     return <Container maxWidth="md"><Alert severity="warning" sx={{mt:2}}>No tienes permiso para ver esta página.</Alert></Container>;
  }
  if (error && !inventoryPage?.content.length) {
    return <Container maxWidth="md"><Alert severity="error" sx={{mt:2}}>{error}</Alert></Container>;
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', p: {xs: 1, sm: 2} }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h5" component="h1" sx={{display: 'flex', alignItems: 'center'}}>
          <CategoryIcon sx={{mr:1}} /> Inventario de Insumos
        </Typography>
        {canManageInventory && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            component={RouterLink}
            to="/inventario-insumos/nuevo"
          >
            Nuevo Registro Inventario
          </Button>
        )}
      </Box>

      {error && inventoryPage?.content && inventoryPage.content.length > 0 && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my:2 }}><CircularProgress /></Box>}

      {!loading && inventoryPage && inventoryPage.content.length > 0 ? (
        <>
          <TableContainer>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID Inv.</TableCell>
                  <TableCell>Insumo</TableCell>
                  <TableCell>Ubicación</TableCell>
                  <TableCell align="right">Stock Actual</TableCell>
                  <TableCell>Unidad</TableCell>
                  <TableCell>Última Actualización</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {inventoryPage.content.map((item) => (
                  <TableRow hover key={item.idInventarioInsumo}>
                    <TableCell>{item.idInventarioInsumo}</TableCell>
                    <TableCell>
                      <Link component={RouterLink} to={`/insumos/${item.insumo.idInsumo}`}>
                        {item.insumo.nombreInsumo}
                      </Link>
                    </TableCell>
                    <TableCell>{item.ubicacionInventario}</TableCell>
                    <TableCell align="right">
                      {/* Formatear con decimales si es necesario, tu backend DTO tiene scale 3 */}
                      {Number(item.cantidadStock).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 3 })}
                    </TableCell>
                    <TableCell>{item.insumo.unidadMedidaInsumo}</TableCell>
                    <TableCell>
                      {item.ultimaActualizacion ? format(parseISO(item.ultimaActualizacion), 'dd/MM/yyyy HH:mm', { locale: es }) : 'N/A'}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Ver Movimientos / Detalles">
                        <IconButton onClick={() => handleViewDetails(item.idInventarioInsumo)} color="info" size="small">
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      {canManageInventory && (
                        <Tooltip title="Registrar Movimiento">
                          <IconButton onClick={() => handleRegisterMovement(item.idInventarioInsumo)} color="secondary" size="small">
                            <SyncAltIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={inventoryPage.totalElements}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Filas por página:"
            getItemAriaLabel={(type) => type === 'first' ? 'Primera página' : type === 'last' ? 'Última página' : type === 'next' ? 'Siguiente página' : 'Página anterior'}
          />
        </>
      ) : (
         !loading && !error && <Typography sx={{mt: 2, textAlign: 'center'}}>No se encontraron registros de inventario de insumos.</Typography>
      )}
    </Paper>
  );
};

export default SupplyInventoryListPage;