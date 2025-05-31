// src/features/products/pages/ProductDetailPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  Container, Typography, Box, CircularProgress, Alert, Paper, Button,
  Divider, IconButton, Tooltip, Snackbar, Chip, List, ListItem, ListItemText,
  TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Link as MuiLink, Stack, Avatar
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Inventory2Icon from '@mui/icons-material/Inventory2'; // Icono para producto
import InfoIcon from '@mui/icons-material/Info';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import StraightenIcon from '@mui/icons-material/Straighten'; // Unidad de medida
import CategoryIcon from '@mui/icons-material/Category'; // Tipo producto
import WcIcon from '@mui/icons-material/Wc'; // Género
import PaletteIcon from '@mui/icons-material/Palette'; // Color
import FormatSizeIcon from '@mui/icons-material/FormatSize'; // Talla
import ListAltIcon from '@mui/icons-material/ListAlt'; // Para BOM
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';


import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { getProductById, deleteProduct, getProductBOM, removeInsumoFromProductBOM } from '../../../api/productService';
import type { ProductDetails, InsumoPorProductoDetails } from '../../../types/product.types';
import { useAuth } from '../../../contexts/AuthContext';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale/es';
import ConfirmationDialog from '../../../components/common/ConfirmationDialog';
import { formatCurrency } from '../../../utils/formatting';
import BomItemCreateModal from '../components/BomItemCreateModal'; // Importar el nuevo modal
import BomItemEditModal from '../components/BomItemEditModal'; // Importar el nuevo modal

const ProductDetailPage: React.FC = () => {
  const { productId: productIdParam } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [bomItems, setBomItems] = useState<InsumoPorProductoDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false); // Para eliminar producto o item BOM
  const [bomLoading, setBomLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [openDeleteProductDialog, setOpenDeleteProductDialog] = useState(false);
  const [openDeleteBomItemDialog, setOpenDeleteBomItemDialog] = useState(false);
  const [selectedBomItemToDelete, setSelectedBomItemToDelete] = useState<InsumoPorProductoDetails | null>(null);

  const [openCreateBomItemModal, setOpenCreateBomItemModal] = useState(false); // Estado para el modal
  const [editingBomItem, setEditingBomItem] = useState<InsumoPorProductoDetails | null>(null); // Estado para el item a editar


  const productId = parseInt(productIdParam || '', 10);

  const fetchProductAndBOMData = useCallback(async () => {
    if (productIdParam && !isNaN(productId)) {
      setLoading(true);
      setBomLoading(true);
      setError(null);
      try {
        const productData = await getProductById(productId);
        setProduct(productData);
        const bomData = await getProductBOM(productId);
        setBomItems(bomData);
      } catch (err: any) {
        console.error("Error al cargar datos del producto y BOM:", err);
        setError(err.message || 'No se pudo cargar la información del producto o su BOM.');
      } finally {
        setLoading(false);
        setBomLoading(false);
      }
    } else {
      setError("ID de producto inválido o no proporcionado.");
      setLoading(false);
      setBomLoading(false);
    }
  }, [productIdParam, productId]);

  useEffect(() => {
    fetchProductAndBOMData();
  }, [fetchProductAndBOMData]);

  const handleDeleteProductClick = () => {
    setOpenDeleteProductDialog(true);
  };

  const confirmDeleteProduct = async () => {
    if (product) {
      setActionLoading(true);
      setError(null);
      try {
        await deleteProduct(product.idProducto);
        setSuccessMessage(`Producto '${product.nombreProducto}' eliminado correctamente.`);
        setOpenDeleteProductDialog(false);
        setTimeout(() => navigate('/productos'), 2000);
      } catch (err: any) {
        setError(err.message || `Error al eliminar el producto '${product.nombreProducto}'.`);
        setOpenDeleteProductDialog(false);
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleDeleteBomItemClick = (item: InsumoPorProductoDetails) => {
    setSelectedBomItemToDelete(item);
    setOpenDeleteBomItemDialog(true);
  };

  const confirmDeleteBomItem = async () => {
    if (selectedBomItemToDelete && product) {
      setActionLoading(true);
      setError(null);
      try {
        await removeInsumoFromProductBOM(product.idProducto, selectedBomItemToDelete.idInsumo);
        setSuccessMessage(`Insumo '${selectedBomItemToDelete.nombreInsumo}' eliminado del BOM correctamente.`);
        setOpenDeleteBomItemDialog(false);
        fetchProductAndBOMData(); // Recargar BOM
      } catch (err: any) {
        setError(err.message || `Error al eliminar el insumo '${selectedBomItemToDelete.nombreInsumo}' del BOM.`);
        setOpenDeleteBomItemDialog(false);
      } finally {
        setSelectedBomItemToDelete(null);
        setActionLoading(false);
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSuccessMessage(null);
    setError(null);
  };

  const handleBomItemCreated = () => {
    fetchProductAndBOMData(); // Recargar datos del producto y su BOM
  };

  const handleBomItemUpdated = () => {
    fetchProductAndBOMData(); // Recargar datos del producto y su BOM
    setEditingBomItem(null);  // Cierra el modal limpiando el estado
  };

  const handleEditBomItemClick = (item: InsumoPorProductoDetails) => {
    setEditingBomItem(item); // Establece el item a editar, lo que abrirá el modal
  };

  // Permisos según ProductoController
  const canEditProduct = currentUser?.rolUsuario === 'Administrador' || currentUser?.rolUsuario === 'Gerente';
  const canDeleteProduct = currentUser?.rolUsuario === 'Administrador';
  const canManageBOM = currentUser?.rolUsuario === 'Administrador' || currentUser?.rolUsuario === 'Gerente';
  const canViewProduct = !!currentUser;


  if (loading && !product) { // Loader principal mientras carga datos del producto
    return <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>;
  }

  if (!canViewProduct && !loading && !error) {
     return <Container maxWidth="md"><Alert severity="warning" sx={{mt:2}}>No tienes permiso para ver esta página.</Alert></Container>;
  }

  if (error && !product) { // Si hay error y no se cargó el producto
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>
        <Button onClick={() => navigate('/productos')} sx={{ mt: 2 }}>Volver a la lista</Button>
      </Container>
    );
  }

  if (!product) { // Si no está cargando, no hay error, pero no hay producto
    return <Container maxWidth="md"><Alert severity="warning" sx={{ mt: 4 }}>Producto no encontrado.</Alert></Container>;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap:1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => navigate(-1)} color="primary" sx={{ mr: 1 }} aria-label="Volver">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Detalle del Producto
          </Typography>
        </Box>
        <Box>
          {canEditProduct && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<EditIcon />}
              component={RouterLink}
              to={`/productos/${product.idProducto}/editar`}
              sx={{ mr: 1 }}
            >
              Editar Producto
            </Button>
          )}
          {canDeleteProduct && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDeleteProductClick}
              disabled={actionLoading}
            >
              Eliminar Producto
            </Button>
          )}
        </Box>
      </Box>

      {successMessage && <Alert severity="success" sx={{ mb: 2 }} onClose={handleCloseSnackbar}>{successMessage}</Alert>}
      {error && <Alert severity="error" sx={{mb:2}} onClose={handleCloseSnackbar}>{error}</Alert>}


      <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'flex-start', gap: 3 }}>
          <Box sx={{ width: { xs: '100%', md: '33.33%' }, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <Avatar sx={{ width: 100, height: 100, mb: 2, bgcolor: 'primary.main', fontSize: '2.5rem' }}>
              {product.nombreProducto.substring(0,2).toUpperCase()}
            </Avatar>
            <Typography variant="h5" component="h2" gutterBottom>
              {product.nombreProducto}
            </Typography>
            <Chip label={`Ref: ${product.referenciaProducto}`} sx={{ mb: 1 }} />
            <Typography variant="body1" color="text.secondary">
              ID: {product.idProducto}
            </Typography>
          </Box>

          <Box sx={{ width: { xs: '100%', md: '66.66%' } }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <InfoIcon sx={{ mr: 1 }} color="action" /> Información del Producto
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={1.5}>
              <Box><Typography variant="body2" color="text.secondary">Descripción:</Typography><Typography variant="body1">{product.descripcionProducto || 'N/A'}</Typography></Box>
              <Box sx={{ display: 'flex', gap: 2 }}><Typography variant="body2" color="text.secondary" sx={{display:'flex', alignItems:'center'}}><FormatSizeIcon sx={{mr:0.5}} fontSize="inherit"/>Talla:</Typography><Typography variant="body1">{product.tallaProducto || 'N/A'}</Typography></Box>
              <Box sx={{ display: 'flex', gap: 2 }}><Typography variant="body2" color="text.secondary" sx={{display:'flex', alignItems:'center'}}><PaletteIcon sx={{mr:0.5}} fontSize="inherit"/>Color:</Typography><Typography variant="body1">{product.colorProducto || 'N/A'}</Typography></Box>
              <Box sx={{ display: 'flex', gap: 2 }}><Typography variant="body2" color="text.secondary" sx={{display:'flex', alignItems:'center'}}><CategoryIcon sx={{mr:0.5}} fontSize="inherit"/>Tipo:</Typography><Typography variant="body1">{product.tipoProducto || 'N/A'}</Typography></Box>
              <Box sx={{ display: 'flex', gap: 2 }}><Typography variant="body2" color="text.secondary" sx={{display:'flex', alignItems:'center'}}><WcIcon sx={{mr:0.5}} fontSize="inherit"/>Género:</Typography><Typography variant="body1">{product.generoProducto || 'N/A'}</Typography></Box>
              <Box sx={{ display: 'flex', gap: 2 }}><Typography variant="body2" color="text.secondary" sx={{display:'flex', alignItems:'center'}}><StraightenIcon sx={{mr:0.5}} fontSize="inherit"/>Unidad Medida:</Typography><Typography variant="body1">{product.unidadMedidaProducto || 'Unidad'}</Typography></Box>
              <Box sx={{ display: 'flex', gap: 2 }}><Typography variant="body2" color="text.secondary" sx={{display:'flex', alignItems:'center'}}><AttachMoneyIcon sx={{mr:0.5}} fontSize="inherit"/>Costo Producción:</Typography><Typography variant="body1" fontWeight="bold">{formatCurrency(product.costoProduccion)}</Typography></Box>
              <Box sx={{ display: 'flex', gap: 2 }}><Typography variant="body2" color="text.secondary" sx={{display:'flex', alignItems:'center'}}><AttachMoneyIcon sx={{mr:0.5}} fontSize="inherit"/>Precio Venta:</Typography><Typography variant="body1" fontWeight="bold" color="success.dark">{formatCurrency(product.precioVenta)}</Typography></Box>
              <Box sx={{ display: 'flex', gap: 2 }}><Typography variant="body2" color="text.secondary">Fecha Creación:</Typography><Typography variant="body1">{format(parseISO(product.fechaCreacion), 'dd/MM/yyyy HH:mm')}</Typography></Box>
              {product.fechaActualizacion && <Box sx={{ display: 'flex', gap: 2 }}><Typography variant="body2" color="text.secondary">Última Actualización:</Typography><Typography variant="body1">{format(parseISO(product.fechaActualizacion), 'dd/MM/yyyy HH:mm')}</Typography></Box>}
            </Stack>
          </Box>
        </Box>
      </Paper>

      {/* Sección de Lista de Materiales (BOM) */}
      <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, mt: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h2" sx={{ display: 'flex', alignItems: 'center' }}>
            <ListAltIcon sx={{ mr: 1 }} /> Lista de Materiales (BOM)
          </Typography>
          {canManageBOM && (
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<AddCircleOutlineIcon />}
              onClick={() => setOpenCreateBomItemModal(true)}
            >
              Añadir Insumo al BOM
            </Button>
          )}
        </Box>
        <Divider sx={{ mb: 2 }} />
        {bomLoading && <Box sx={{display: 'flex', justifyContent: 'center', my: 2}}><CircularProgress size={30} /></Box>}
        {!bomLoading && bomItems.length > 0 ? (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID Insumo</TableCell>
                  <TableCell>Nombre Insumo</TableCell>
                  <TableCell>Cant. Requerida</TableCell>
                  <TableCell>Unidad</TableCell>
                  {canManageBOM && <TableCell align="right">Acciones</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {bomItems.map((item) => (
                  <TableRow key={`${item.idProducto}-${item.idInsumo}`}>
                    <TableCell>{item.idInsumo}</TableCell>
                    <TableCell>{item.nombreInsumo}</TableCell>
                    <TableCell>{Number(item.cantidadRequerida).toLocaleString(undefined, {minimumFractionDigits:0, maximumFractionDigits:3})}</TableCell>
                    <TableCell>{item.unidadMedidaInsumo}</TableCell>
                    {canManageBOM && (
                      <TableCell align="right">
                        <Tooltip title="Editar Cantidad en BOM">
                          <IconButton size="small" color="primary" onClick={() => handleEditBomItemClick(item)}>
                            <EditIcon fontSize="inherit"/>
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar Insumo del BOM">
                          <IconButton size="small" color="error" onClick={() => handleDeleteBomItemClick(item)} disabled={actionLoading}>
                            <DeleteIcon fontSize="inherit"/>
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          !bomLoading && <Typography color="text.secondary" sx={{textAlign: 'center', py:2}}>Este producto no tiene una lista de materiales definida.</Typography>
        )}
      </Paper>

      <ConfirmationDialog
        open={openDeleteProductDialog}
        onClose={() => { if (!actionLoading) setOpenDeleteProductDialog(false); }}
        onConfirm={confirmDeleteProduct}
        title="Confirmar Eliminación de Producto"
        message={`¿Estás seguro de que deseas eliminar el producto "${product.nombreProducto}"?`}
        confirmText="Eliminar"
        isLoading={actionLoading}
      />
      <ConfirmationDialog
        open={openDeleteBomItemDialog}
        onClose={() => { if (!actionLoading) setOpenDeleteBomItemDialog(false); }}
        onConfirm={confirmDeleteBomItem}
        title="Confirmar Eliminación de Insumo del BOM"
        message={`¿Estás seguro de que deseas eliminar el insumo "${selectedBomItemToDelete?.nombreInsumo}" del BOM de este producto?`}
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

      {/* Modales para crear/editar items del BOM (próximos pasos) */}
      {product && openCreateBomItemModal && (
          <BomItemCreateModal
            open={openCreateBomItemModal}
            onClose={() => setOpenCreateBomItemModal(false)}
            productId={product.idProducto}
            existingBomInsumoIds={bomItems.map(item => item.idInsumo)}
            onBomItemCreated={handleBomItemCreated}
          />
      )}
      {product && editingBomItem && (
          <BomItemEditModal
            open={!!editingBomItem}
            onClose={() => setEditingBomItem(null)}
            productId={product.idProducto}
            bomItemData={editingBomItem}
            onBomItemUpdated={handleBomItemUpdated}
          />
      )}

    </Container>
  );
};

export default ProductDetailPage;