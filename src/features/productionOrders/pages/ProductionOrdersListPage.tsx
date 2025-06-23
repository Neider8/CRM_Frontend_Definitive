// src/features/productionOrders/pages/ProductionOrdersListPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Button, Paper, TableContainer, Table, TableHead, TableRow,
  TableCell, TableBody, TablePagination, CircularProgress, Alert, IconButton, Tooltip, Chip, Container
} from '@mui/material';
import MuiLink from '@mui/material/Link';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { getAllProductionOrders } from '../../../api/productionOrderService';
import type { ProductionOrderPageableRequest, PaginatedProductionOrders } from '../../../types/productionOrder.types';
import { useAuth } from '../../../contexts/AuthContext';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale/es';

const ProductionOrdersListPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [productionOrdersPage, setProductionOrdersPage] = useState<PaginatedProductionOrders | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchProductionOrders = useCallback(async (currentPage: number, currentRowsPerPage: number) => {
    setLoading(true);
    setError(null);
    try {
      const params: ProductionOrderPageableRequest = {
        page: currentPage,
        size: currentRowsPerPage,
        sort: 'fechaCreacion,desc',
      };
      const data = await getAllProductionOrders(params);
      setProductionOrdersPage(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar órdenes de producción.');
      console.error("Error fetching production orders:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProductionOrders(page, rowsPerPage);
  }, [fetchProductionOrders, page, rowsPerPage]);

  const handleChangePage = (event: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewDetails = (orderId: number) => navigate(`/ordenes-produccion/${orderId}`);

  // Permisos basados en OrdenProduccionController
  const canCreateProductionOrders = currentUser?.rolUsuario === 'Administrador' || currentUser?.rolUsuario === 'Gerente';
  const canViewProductionOrders = currentUser?.rolUsuario === 'Administrador' || currentUser?.rolUsuario === 'Gerente' || currentUser?.rolUsuario === 'Operario';

  const getStatusChipColor = (status: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    switch (status?.toLowerCase()) {
        case 'pendiente': return 'warning';
        case 'en proceso': return 'info';
        case 'terminada': return 'success';
        case 'retrasada': return 'error';
        case 'anulada': return 'error';
        default: return 'default';
    }
  };
  
  if (loading && !productionOrdersPage?.content.length && !error) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>;
  }
  if (!canViewProductionOrders && !loading && !error) {
      return <Container maxWidth="md"><Alert severity="warning" sx={{mt:2}}>No tienes permiso para ver esta página.</Alert></Container>;
  }
  if (error && !productionOrdersPage?.content.length) {
    return <Container maxWidth="md"><Alert severity="error" sx={{mt:2}}>{error}</Alert></Container>;
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', p: {xs: 1, sm: 2} }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h5" component="h1" sx={{display: 'flex', alignItems: 'center'}}>
          <PrecisionManufacturingIcon sx={{mr:1}} /> Gestión de Órdenes de Producción
        </Typography>
        {canCreateProductionOrders && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            component={RouterLink}
            to="/ordenes-produccion/nuevo"
          >
            Nueva Orden de Producción
          </Button>
        )}
      </Box>

      {error && (productionOrdersPage?.content?.length ?? 0) > 0 && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my:2 }}><CircularProgress /></Box>}

      {!loading && productionOrdersPage && productionOrdersPage.content.length > 0 ? (
        <>
          <TableContainer>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID O.P.</TableCell>
                  <TableCell>ID O.V.</TableCell>
                  <TableCell>Cliente (O.V.)</TableCell>
                  <TableCell>Fecha Creación</TableCell>
                  <TableCell>Fin Estimado</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              
              {/* === INICIO DEL BLOQUE CORREGIDO === */}
              <TableBody>
                {productionOrdersPage.content.map((order) => (
                  <TableRow hover key={order.idOrdenProduccion}>
                    <TableCell>{order.idOrdenProduccion}</TableCell>
                    
                    {/* CELDA DE ID O.V. CORREGIDA */}
                    <TableCell>
                      {order.ordenVenta ? (
                        <MuiLink component={RouterLink} to={`/ordenes-venta/${order.ordenVenta.idOrdenVenta}`}>
                          {order.ordenVenta.idOrdenVenta}
                        </MuiLink>
                      ) : (
                        'N/A' // Muestra 'N/A' si no hay orden de venta
                      )}
                    </TableCell>

                    {/* CELDA DE CLIENTE CORREGIDA */}
                    <TableCell>{order.ordenVenta?.clienteNombre ?? 'N/A'}</TableCell>

                    <TableCell>{format(parseISO(order.fechaCreacion), 'dd/MM/yyyy HH:mm', { locale: es })}</TableCell>
                    <TableCell>{order.fechaFinEstimadaProduccion ? format(parseISO(order.fechaFinEstimadaProduccion), 'dd/MM/yyyy', { locale: es }) : 'N/A'}</TableCell>
                    <TableCell>
                      <Chip label={order.estadoProduccion} color={getStatusChipColor(order.estadoProduccion)} size="small" />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Ver Detalles y Tareas">
                        <IconButton onClick={() => handleViewDetails(order.idOrdenProduccion)} color="primary" size="small">
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              {/* === FIN DEL BLOQUE CORREGIDO === */}

            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={productionOrdersPage.totalElements}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Órdenes por página:"
            getItemAriaLabel={(type) => type === 'first' ? 'Primera página' : type === 'last' ? 'Última página' : type === 'next' ? 'Siguiente página' : 'Página anterior'}
          />
        </>
      ) : (
          !loading && !error && <Typography sx={{mt: 2, textAlign: 'center'}}>No se encontraron órdenes de producción.</Typography>
      )}
    </Paper>
  );
};

export default ProductionOrdersListPage;