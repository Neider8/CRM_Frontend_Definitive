// src/features/supplies/pages/SuppliesListPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Button, Paper, TableContainer, Table, TableHead, TableRow,
  TableCell, TableBody, TablePagination, CircularProgress, Alert, IconButton, Tooltip, Snackbar, Container
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CategoryIcon from '@mui/icons-material/Category'; // Icono para insumos
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { getAllInsumos, deleteInsumo } from '../../../api/supplyService'; // Cambiado a supplyService
import type { SupplyCreateRequest, PaginatedInsumos } from '../../../types/supply.types'; // <-- CAMBIO AQUÍ
import { useAuth } from '../../../contexts/AuthContext';
import ConfirmationDialog from '../../../components/common/ConfirmationDialog';
import { format } from 'date-fns'; // Para fechas si las muestras

const SuppliesListPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [suppliesPage, setSuppliesPage] = useState<PaginatedInsumos | null>(null); // <-- CAMBIO AQUÍ
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedSupplyIdToDelete, setSelectedSupplyIdToDelete] = useState<number | null>(null);
  const [selectedSupplyNameToDelete, setSelectedSupplyNameToDelete] = useState<string>('');

  const fetchSupplies = useCallback(async (currentPage: number, currentRowsPerPage: number) => {
    setLoading(true);
    try {
      const params: { page: number; size: number; sort?: string } = {
        page: currentPage,
        size: currentRowsPerPage,
        sort: 'nombreInsumo,asc',
      };
      const data = await getAllInsumos(params);
      setSuppliesPage(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar insumos.');
      console.error("Error fetching supplies:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSupplies(page, rowsPerPage);
  }, [fetchSupplies, page, rowsPerPage]);

  const handleChangePage = (event: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewDetails = (supplyId: number) => navigate(`/insumos/${supplyId}`);
  const handleEditSupply = (supplyId: number) => navigate(`/insumos/${supplyId}/editar`);

  const handleDeleteSupplyClick = (supplyId: number, supplyName: string) => {
    setSelectedSupplyIdToDelete(supplyId);
    setSelectedSupplyNameToDelete(supplyName);
    setOpenDeleteDialog(true);
  };

  const confirmDeleteSupply = async () => {
    if (selectedSupplyIdToDelete) {
      setActionLoading(true);
      setError(null);
      try {
        await deleteInsumo(selectedSupplyIdToDelete);
        setOpenDeleteDialog(false);
        setSuccessMessage(`Insumo '${selectedSupplyNameToDelete}' eliminado correctamente.`);
        fetchSupplies(page, rowsPerPage); // Recargar
      } catch (err: any) {
        setError(err.message || `Error al eliminar el insumo '${selectedSupplyNameToDelete}'.`);
        setOpenDeleteDialog(false);
      } finally {
        setSelectedSupplyIdToDelete(null);
        setSelectedSupplyNameToDelete('');
        setActionLoading(false);
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSuccessMessage(null);
    setError(null);
  };

  // Permisos basados en InsumoController
  const canCreateSupplies = currentUser?.rolUsuario === 'Administrador' || currentUser?.rolUsuario === 'Gerente';
  const canEditSupplies = currentUser?.rolUsuario === 'Administrador' || currentUser?.rolUsuario === 'Gerente';
  const canDeleteSupplies = currentUser?.rolUsuario === 'Administrador';
  const canViewSupplies = currentUser?.rolUsuario === 'Administrador' || currentUser?.rolUsuario === 'Gerente' || currentUser?.rolUsuario === 'Operario';

  if (loading && !suppliesPage?.content.length && !error) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>;
  }
  if (!canViewSupplies && !loading && !error) {
     return <Container maxWidth="md"><Alert severity="warning" sx={{mt:2}}>No tienes permiso para ver esta página.</Alert></Container>;
  }
   if (error && !suppliesPage?.content.length) {
    return <Container maxWidth="md"><Alert severity="error" sx={{mt:2}} onClose={handleCloseSnackbar}>{error}</Alert></Container>;
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', p: {xs: 1, sm: 2} }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h5" component="h1" sx={{display: 'flex', alignItems: 'center'}}>
          <CategoryIcon sx={{mr:1}} /> Gestión de Insumos
        </Typography>
        {canCreateSupplies && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            component={RouterLink}
            to="/insumos/nuevo"
          >
            Nuevo Insumo
          </Button>
        )}
      </Box>

      {error && (suppliesPage?.content?.length ?? 0) > 0 && <Alert severity="error" sx={{ mb: 2 }} onClose={handleCloseSnackbar}>{error}</Alert>}
      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my:2 }}><CircularProgress /></Box>}

      {!loading && suppliesPage && suppliesPage.content.length > 0 ? (
        <>
          <TableContainer>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Nombre Insumo</TableCell>
                  <TableCell>Unidad Medida</TableCell>
                  <TableCell>Stock Mínimo</TableCell>
                  {/* <TableCell>Fecha Creación</TableCell> */}
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {suppliesPage.content.map((supply) => (
                  <TableRow hover key={supply.idInsumo}>
                    <TableCell>{supply.idInsumo}</TableCell>
                    <TableCell>{supply.nombreInsumo}</TableCell>
                    <TableCell>{supply.unidadMedidaInsumo}</TableCell>
                    <TableCell>{supply.stockMinimoInsumo ?? 'N/A'}</TableCell>
                    {/* <TableCell>{format(parseISO(supply.fechaCreacion), 'dd/MM/yyyy')}</TableCell> */}
                    <TableCell align="right">
                      <Tooltip title="Ver Detalles">
                        <IconButton onClick={() => handleViewDetails(supply.idInsumo)} color="info" size="small">
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      {canEditSupplies && (
                        <Tooltip title="Editar Insumo">
                          <IconButton onClick={() => handleEditSupply(supply.idInsumo)} color="primary" size="small">
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      {canDeleteSupplies && (
                        <Tooltip title="Eliminar Insumo">
                          <IconButton onClick={() => handleDeleteSupplyClick(supply.idInsumo, supply.nombreInsumo)} color="error" size="small" disabled={actionLoading}>
                            <DeleteIcon />
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
            count={suppliesPage.totalElements}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Filas por página:"
             getItemAriaLabel={(type) => type === 'first' ? 'Primera página' : type === 'last' ? 'Última página' : type === 'next' ? 'Siguiente página' : 'Página anterior'}
          />
        </>
      ) : (
         !loading && !error && <Typography sx={{mt: 2, textAlign: 'center'}}>No se encontraron insumos.</Typography>
      )}

      <ConfirmationDialog
        open={openDeleteDialog}
        onClose={() => { if (!actionLoading) setOpenDeleteDialog(false); }}
        onConfirm={confirmDeleteSupply}
        title="Confirmar Eliminación de Insumo"
        message={`¿Estás seguro de que deseas eliminar el insumo "${selectedSupplyNameToDelete}" (ID: ${selectedSupplyIdToDelete})? Esta acción puede afectar listas de materiales (BOMs), órdenes de compra o inventario.`}
        confirmText="Eliminar"
        isLoading={actionLoading}
      />
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default SuppliesListPage;