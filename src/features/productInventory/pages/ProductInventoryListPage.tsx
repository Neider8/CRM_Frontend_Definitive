// src/features/productInventory/pages/ProductInventoryListPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Button, Paper, TableContainer, Table, TableHead, TableRow,
  TableCell, TableBody, TablePagination, CircularProgress, Alert, IconButton, Tooltip, Link, Container
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SyncAltIcon from '@mui/icons-material/SyncAlt'; // Para registrar movimiento
import WarehouseIcon from '@mui/icons-material/Warehouse';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { getAllProductInventories } from '../../../api/productInventoryService';
import type { ProductInventoryPageableRequest, PaginatedProductInventories } from '../../../types/inventory.types';
import { useAuth } from '../../../contexts/AuthContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { parseISO } from 'date-fns/parseISO';


const ProductInventoryListPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [inventoryPage, setInventoryPage] = useState<PaginatedProductInventories | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchInventories = useCallback(async (currentPage: number, currentRowsPerPage: number) => {
    setLoading(true);
    setError(null);
    try {
      const params: ProductInventoryPageableRequest = {
        page: currentPage,
        size: currentRowsPerPage,
        sort: 'producto.nombreProducto,asc', // O 'ubicacionInventario,asc'
      };
      const data = await getAllProductInventories(params);
      setInventoryPage(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar el inventario de productos.');
      console.error("Error fetching product inventories:", err);
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
    navigate(`/inventario-productos/${inventoryId}`); // Ruta para ver detalles y movimientos
  };

  const handleRegisterMovement = (inventoryId: number) => {
    navigate(`/inventario-productos/${inventoryId}/movimientos/nuevo`); // Ruta para registrar movimiento
  };

  // Permisos según InventarioProductoController
  const canManageInventory = currentUser?.rolUsuario === 'Administrador' || 
                             currentUser?.rolUsuario === 'Gerente' || 
                             currentUser?.rolUsuario === 'Operario';
  const canViewInventory = canManageInventory || currentUser?.rolUsuario === 'Ventas';


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
          <WarehouseIcon sx={{mr:1}} /> Inventario de Productos Terminados
        </Typography>
        {canManageInventory && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            component={RouterLink}
            to="/inventario-productos/nuevo" // Ruta para crear un nuevo registro de inventario (producto-ubicación)
          >
            Nuevo Registro Inventario
          </Button>
        )}
      </Box>

      {error && (inventoryPage?.content?.length ?? 0) > 0 && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my:2 }}><CircularProgress /></Box>}

      {!loading && inventoryPage && inventoryPage.content.length > 0 ? (
        <>
          <TableContainer>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID Inv.</TableCell>
                  <TableCell>Producto (Ref.)</TableCell>
                  <TableCell>Ubicación</TableCell>
                  <TableCell align="right">Stock Actual</TableCell>
                  <TableCell>Última Actualización</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {inventoryPage.content.map((item) => (
                  <TableRow hover key={item.idInventarioProducto}>
                    <TableCell>{item.idInventarioProducto}</TableCell>
                    <TableCell>
                      <Link component={RouterLink} to={`/productos/${item.producto.idProducto}`}>
                        {item.producto.nombreProducto} ({item.producto.referenciaProducto})
                      </Link>
                    </TableCell>
                    <TableCell>{item.ubicacionInventario}</TableCell>
                    <TableCell align="right">{item.cantidadStock}</TableCell>
                    <TableCell>
                      {item.ultimaActualizacion ? format(parseISO(item.ultimaActualizacion), 'dd/MM/yyyy HH:mm', { locale: es }) : 'N/A'}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Ver Movimientos / Detalles">
                        <IconButton onClick={() => handleViewDetails(item.idInventarioProducto)} color="info" size="small">
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      {canManageInventory && (
                        <Tooltip title="Registrar Movimiento">
                          <IconButton onClick={() => handleRegisterMovement(item.idInventarioProducto)} color="secondary" size="small">
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
         !loading && !error && <Typography sx={{mt: 2, textAlign: 'center'}}>No se encontraron registros de inventario de productos.</Typography>
      )}
    </Paper>
  );
};

export default ProductInventoryListPage;