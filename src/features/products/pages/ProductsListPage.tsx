// src/features/products/pages/ProductsListPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Button, Paper, TableContainer, Table, TableHead, TableRow,
  TableCell, TableBody, TablePagination, CircularProgress, Alert, IconButton, Tooltip, Snackbar, Chip, Container
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Inventory2Icon from '@mui/icons-material/Inventory2'; // Icono para productos
import ListAltIcon from '@mui/icons-material/ListAlt'; // Icono para BOM

import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { getAllProducts, deleteProduct } from '../../../api/productService';
import type { ProductPageableRequest, PaginatedProducts } from '../../../types/product.types';
import { useAuth } from '../../../contexts/AuthContext';
import ConfirmationDialog from '../../../components/common/ConfirmationDialog';
import { formatCurrency } from '../../../utils/formatting'; // Crearemos esta utilidad

const ProductsListPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [productsPage, setProductsPage] = useState<PaginatedProducts | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedProductIdToDelete, setSelectedProductIdToDelete] = useState<number | null>(null);
  const [selectedProductNameToDelete, setSelectedProductNameToDelete] = useState<string>('');

  const fetchProducts = useCallback(async (currentPage: number, currentRowsPerPage: number) => {
    setLoading(true);
    try {
      const params: ProductPageableRequest = {
        page: currentPage,
        size: currentRowsPerPage,
        sort: 'nombreProducto,asc',
      };
      const data = await getAllProducts(params);
      setProductsPage(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar productos.');
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts(page, rowsPerPage);
  }, [fetchProducts, page, rowsPerPage]);

  const handleChangePage = (event: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewDetails = (productId: number) => navigate(`/productos/${productId}`);
  const handleEditProduct = (productId: number) => navigate(`/productos/${productId}/editar`);
  const handleManageBOM = (productId: number) => {
    navigate(`/productos/${productId}`); // Navegar a la página de detalles del producto
  };


  const handleDeleteProductClick = (productId: number, productName: string) => {
    setSelectedProductIdToDelete(productId);
    setSelectedProductNameToDelete(productName);
    setOpenDeleteDialog(true);
  };

  const confirmDeleteProduct = async () => {
    if (selectedProductIdToDelete) {
      setActionLoading(true);
      setError(null);
      try {
        await deleteProduct(selectedProductIdToDelete);
        setOpenDeleteDialog(false);
        setSuccessMessage(`Producto '${selectedProductNameToDelete}' eliminado correctamente.`);
        fetchProducts(page, rowsPerPage); // Recargar
      } catch (err: any) {
        setError(err.message || `Error al eliminar el producto '${selectedProductNameToDelete}'.`);
        setOpenDeleteDialog(false);
      } finally {
        setSelectedProductIdToDelete(null);
        setSelectedProductNameToDelete('');
        setActionLoading(false);
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSuccessMessage(null);
    setError(null);
  };

  // Permisos según ProductoController
  const canCreateProducts = currentUser?.rolUsuario === 'Administrador' || currentUser?.rolUsuario === 'Gerente'; // O permiso PERMISO_CREAR_PRODUCTOS
  const canEditProducts = currentUser?.rolUsuario === 'Administrador' || currentUser?.rolUsuario === 'Gerente'; // O PERMISO_EDITAR_PRODUCTOS
  const canDeleteProducts = currentUser?.rolUsuario === 'Administrador'; // O PERMISO_ELIMINAR_PRODUCTOS
  // Ver productos es para cualquier usuario autenticado según el controller
  const canViewProducts = !!currentUser;

  if (loading && !productsPage?.content.length && !error) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>; // Placeholder, Skeletons idealmente
  }
  if (!canViewProducts && !loading && !error) {
     return <Container maxWidth="md"><Alert severity="warning" sx={{mt:2}}>No tienes permiso para ver esta página.</Alert></Container>;
  }
   if (error && !productsPage?.content.length) {
    return <Container maxWidth="md"><Alert severity="error" sx={{mt:2}} onClose={handleCloseSnackbar}>{error}</Alert></Container>;
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', p: {xs: 1, sm: 2} }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h5" component="h1" sx={{display: 'flex', alignItems: 'center'}}>
          <Inventory2Icon sx={{mr:1}} /> Gestión de Productos Terminados
        </Typography>
        {canCreateProducts && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            component={RouterLink}
            to="/productos/nuevo"
          >
            Nuevo Producto
          </Button>
        )}
      </Box>

      {error && productsPage?.content && productsPage.content.length > 0 && <Alert severity="error" sx={{ mb: 2 }} onClose={handleCloseSnackbar}>{error}</Alert>}
      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my:2 }}><CircularProgress /></Box>}

      {!loading && productsPage && productsPage.content.length > 0 ? (
        <>
          <TableContainer>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Referencia</TableCell>
                  <TableCell>Nombre Producto</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Precio Venta</TableCell>
                  <TableCell align="center">BOM</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {productsPage.content.map((product) => (
                  <TableRow hover key={product.idProducto}>
                    <TableCell>{product.idProducto}</TableCell>
                    <TableCell>{product.referenciaProducto}</TableCell>
                    <TableCell>{product.nombreProducto}</TableCell>
                    <TableCell>{product.tipoProducto || 'N/A'}</TableCell>
                    <TableCell>{formatCurrency(product.precioVenta)}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Gestionar Lista de Materiales (BOM)">
                        <IconButton onClick={() => handleManageBOM(product.idProducto)} color="secondary" size="small">
                          <ListAltIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Ver Detalles">
                        <IconButton onClick={() => handleViewDetails(product.idProducto)} color="info" size="small">
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      {canEditProducts && (
                        <Tooltip title="Editar Producto">
                          <IconButton onClick={() => handleEditProduct(product.idProducto)} color="primary" size="small">
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      {canDeleteProducts && (
                        <Tooltip title="Eliminar Producto">
                          <IconButton onClick={() => handleDeleteProductClick(product.idProducto, product.nombreProducto)} color="error" size="small" disabled={actionLoading}>
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
            count={productsPage.totalElements}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Filas por página:"
            getItemAriaLabel={(type) => type === 'first' ? 'Primera página' : type === 'last' ? 'Última página' : type === 'next' ? 'Siguiente página' : 'Página anterior'}
          />
        </>
      ) : (
         !loading && !error && <Typography sx={{mt: 2, textAlign: 'center'}}>No se encontraron productos.</Typography>
      )}

      <ConfirmationDialog
        open={openDeleteDialog}
        onClose={() => { if (!actionLoading) setOpenDeleteDialog(false); }}
        onConfirm={confirmDeleteProduct}
        title="Confirmar Eliminación de Producto"
        message={`¿Estás seguro de que deseas eliminar el producto "${selectedProductNameToDelete}" (ID: ${selectedProductIdToDelete})? Esta acción puede afectar listas de materiales y órdenes.`}
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

export default ProductsListPage;