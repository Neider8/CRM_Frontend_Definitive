// src/features/productionOrders/pages/ProductionOrderDetailPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
    Container, Typography, Box, CircularProgress, Alert, Paper, Button,
    Divider, IconButton, Tooltip, TableContainer, Table, TableHead, TableRow,
    TableCell, TableBody, Chip, Link as MuiLink, Snackbar
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EventIcon from '@mui/icons-material/Event';
import InfoIcon from '@mui/icons-material/Info';
import CancelIcon from '@mui/icons-material/Cancel';

import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { getProductionOrderById, annulProductionOrder, removeTaskFromProductionOrder } from '../../../api/productionOrderService';
import type { ProductionOrderDetails, ProductionTaskDetails } from '../../../types/productionOrder.types';
import { useAuth } from '../../../contexts/AuthContext';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale/es';
import ConfirmationDialog from '../../../components/common/ConfirmationDialog';
import ProductionOrderHeaderEditModal from '../components/ProductionOrderHeaderEditModal';
import ProductionTaskCreateModal from '../components/ProductionTaskCreateModal';
import ProductionTaskEditModal from '../components/ProductionTaskEditModal';

const ProductionOrderDetailPage: React.FC = () => {
    const { orderId: orderIdParam } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();

    const [order, setOrder] = useState<ProductionOrderDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    const [openAnnulDialog, setOpenAnnulDialog] = useState(false);
    const [openDeleteTaskDialog, setOpenDeleteTaskDialog] = useState(false);
    const [selectedTaskToDelete, setSelectedTaskToDelete] = useState<ProductionTaskDetails | null>(null);
    const [openEditHeaderModal, setOpenEditHeaderModal] = useState(false);
    const [openCreateTaskModal, setOpenCreateTaskModal] = useState(false);
    const [editingTask, setEditingTask] = useState<ProductionTaskDetails | null>(null);

    const productionOrderId = parseInt(orderIdParam || '', 10);

    const fetchProductionOrder = useCallback(async () => {
        if (orderIdParam && !isNaN(productionOrderId)) {
            setLoading(true);
            setError(null);
            try {
                const data = await getProductionOrderById(productionOrderId);
                setOrder(data);
            } catch (err: any) {
                console.error("Error al cargar datos de la orden de producción:", err);
                setError(err.message || 'No se pudo cargar la información de la orden de producción.');
            } finally {
                setLoading(false);
            }
        } else {
            setError("ID de orden de producción inválido o no proporcionado.");
            setLoading(false);
        }
    }, [orderIdParam, productionOrderId]);

    useEffect(() => {
        fetchProductionOrder();
    }, [fetchProductionOrder]);

    const handleAnnulOrderClick = () => setOpenAnnulDialog(true);

    const confirmAnnulOrder = async () => {
        if (order) {
            setActionLoading(true);
            setError(null);
            try {
                await annulProductionOrder(order.idOrdenProduccion);
                setSuccessMessage(`Orden de Producción #${order.idOrdenProduccion} anulada correctamente.`);
                setSnackbarOpen(true);
                setOpenAnnulDialog(false);
                fetchProductionOrder();
            } catch (err: any) {
                setError(err.message || `Error al anular la orden de producción.`);
                setSnackbarOpen(true);
                setOpenAnnulDialog(false);
            } finally {
                setActionLoading(false);
            }
        }
    };

    const handleDeleteTaskClick = (task: ProductionTaskDetails) => {
        setSelectedTaskToDelete(task);
        setOpenDeleteTaskDialog(true);
    };

    const confirmDeleteTask = async () => {
        if (selectedTaskToDelete && order) {
            setActionLoading(true);
            setError(null);
            setSuccessMessage(null);
            try {
                await removeTaskFromProductionOrder(order.idOrdenProduccion, selectedTaskToDelete.idTareaProduccion);
                setSuccessMessage(`Tarea '${selectedTaskToDelete.nombreTarea}' eliminada de la orden de producción.`);
                setSnackbarOpen(true);
                fetchProductionOrder();
            } catch (err: any) {
                setError(err.message || `Error al eliminar la tarea.`);
                setSnackbarOpen(true);
            } finally {
                setOpenDeleteTaskDialog(false);
                setSelectedTaskToDelete(null);
                setActionLoading(false);
            }
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
        setSuccessMessage(null);
        setError(null);
    };
    
    const handleOrderHeaderUpdated = () => fetchProductionOrder();
    const handleTaskCreated = () => fetchProductionOrder();
    const handleTaskUpdated = () => fetchProductionOrder();

    const handleEditTaskClick = (task: ProductionTaskDetails) => {
        setEditingTask(task);
    };

    const canEditHeader = (status?: string) =>
        currentUser && status &&
        (currentUser.rolUsuario === 'Administrador' || currentUser.rolUsuario === 'Gerente') &&
        !['Anulada', 'Terminada'].includes(status);

    const canAnnul = (status?: string) =>
        currentUser && status &&
        (currentUser.rolUsuario === 'Administrador' || currentUser.rolUsuario === 'Gerente') &&
        !['Anulada', 'Terminada'].includes(status);

    const canManageTasks = (status?: string) =>
        currentUser && status &&
        (currentUser.rolUsuario === 'Administrador' || currentUser.rolUsuario === 'Gerente') &&
        !['Anulada', 'Terminada'].includes(status);

    const canView = currentUser?.rolUsuario === 'Administrador' || currentUser?.rolUsuario === 'Gerente' || currentUser?.rolUsuario === 'Operario';

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>;
    if (!canView && !loading && !error) return <Container maxWidth="md"><Alert severity="warning" sx={{mt:2}}>Acceso Denegado.</Alert></Container>;
    if (error && !order) return <Container maxWidth="md"><Alert severity="error" sx={{ mt: 4 }}>{error}</Alert><Button onClick={() => navigate('/ordenes-produccion')} sx={{mt:2}}>Volver</Button></Container>;
    if (!order) return <Container maxWidth="md"><Alert severity="warning" sx={{ mt: 4 }}>Orden de Producción no encontrada.</Alert></Container>;

    const getStatusChipColor = (status: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
        switch (status?.toLowerCase()) {
            case 'pendiente': return 'warning';
            case 'en proceso': return 'info';
            case 'terminada': return 'success';
            case 'retrasada': return 'error';
            case 'anulada': return 'error';
            case 'completada': return 'success';
            case 'bloqueada': return 'default';
            default: return 'default';
        }
    };

    return (
        <Container maxWidth="xl">
            <Box sx={{ my: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap:'wrap', gap:1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton onClick={() => navigate(-1)} color="primary" sx={{ mr: 1 }} aria-label="Volver atrás"><ArrowBackIcon /></IconButton>
                    <Typography variant="h4" component="h1">Detalle de Orden de Producción #{order.idOrdenProduccion}</Typography>
                </Box>
                <Box>
                    {canEditHeader(order.estadoProduccion) && (
                        <Button
                            variant="outlined"
                            color="primary"
                            startIcon={<EditIcon />}
                            onClick={() => setOpenEditHeaderModal(true)}
                            sx={{ mr: 1 }}
                        >
                            Editar Cabecera OP
                        </Button>
                    )}
                    {canAnnul(order.estadoProduccion) && (
                        <Button variant="outlined" color="error" startIcon={<CancelIcon />} onClick={handleAnnulOrderClick} disabled={actionLoading}>Anular OP</Button>
                    )}
                </Box>
            </Box>

            {(successMessage || error) &&
                <Snackbar open={snackbarOpen} autoHideDuration={5000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                    <Alert onClose={handleCloseSnackbar} severity={successMessage ? "success" : "error"} sx={{ width: '100%' }} variant="filled">
                        {successMessage || error}
                    </Alert>
                </Snackbar>
            }

            <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: {xs: 2, md: 3} }}>
                    {/* Columna Izquierda: Datos de la O.P. */}
                    <Box sx={{ width: { xs: '100%', md: 'calc(50% - 12px)' }, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography variant="h6" gutterBottom sx={{display:'flex', alignItems:'center'}}><InfoIcon sx={{mr:1}} color="action"/>Datos de la O.P.</Typography>
                        <Divider sx={{mb:1}}/>
                        <Typography variant="body2" component="span">ID O.P.: <Chip label={String(order.idOrdenProduccion)} size="small" variant="outlined" /></Typography>
                        <Typography variant="body2" component="span">Estado: <Chip label={order.estadoProduccion} color={getStatusChipColor(order.estadoProduccion)} size="small"/></Typography>
                        <Typography variant="body2" sx={{display:'flex', alignItems:'center'}}><EventIcon sx={{mr:0.5}} fontSize="inherit"/>Creada: {format(parseISO(order.fechaCreacion), 'dd/MM/yyyy HH:mm', { locale: es })}</Typography>
                        <Typography variant="body2" sx={{display:'flex', alignItems:'center'}}><EventIcon sx={{mr:0.5}} fontSize="inherit"/>Inicio Plan.: {order.fechaInicioProduccion ? format(parseISO(order.fechaInicioProduccion), 'dd/MM/yyyy', { locale: es }) : 'N/A'}</Typography>
                        <Typography variant="body2" sx={{display:'flex', alignItems:'center'}}><EventIcon sx={{mr:0.5}} fontSize="inherit"/>Fin Estimado: {order.fechaFinEstimadaProduccion ? format(parseISO(order.fechaFinEstimadaProduccion), 'dd/MM/yyyy', { locale: es }) : 'N/A'}</Typography>
                        <Typography variant="body2" sx={{display:'flex', alignItems:'center'}}><EventIcon sx={{mr:0.5}} fontSize="inherit"/>Fin Real: {order.fechaFinRealProduccion ? format(parseISO(order.fechaFinRealProduccion), 'dd/MM/yyyy', { locale: es }) : 'N/A'}</Typography>
                        <Box mt={1}>
                            <Typography variant="body2" component="div">Observaciones:</Typography>
                            <Typography component="div" variant="body1" sx={{whiteSpace:'pre-wrap', pl:0.5, borderLeft: '3px solid', borderColor: 'divider', fontStyle:'italic', color:'text.secondary'}}>
                                {order.observacionesProduccion || 'N/A'}
                            </Typography>
                        </Box>
                    </Box>

                    {/* === INICIO DEL BLOQUE CORREGIDO === */}
                    <Box sx={{ width: { xs: '100%', md: 'calc(50% - 12px)' }, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography variant="h6" gutterBottom sx={{display:'flex', alignItems:'center'}}><ShoppingCartIcon sx={{mr:1}} color="action"/>Orden de Venta Asociada</Typography>
                        <Divider sx={{mb:1}}/>
                        
                        {order.ordenVenta ? (
                            <>
                                <Typography variant="body2" component="span">ID O.V.:
                                    <MuiLink component={RouterLink} to={`/ordenes-venta/${order.ordenVenta.idOrdenVenta}`} sx={{ml:0.5, fontWeight:'bold'}}>
                                        #{order.ordenVenta.idOrdenVenta}
                                    </MuiLink>
                                </Typography>
                                <Typography variant="body2" component="span">Cliente: {order.ordenVenta.clienteNombre}</Typography>
                                <Typography variant="body2" component="span">Fecha Pedido O.V.: {format(parseISO(order.ordenVenta.fechaPedido), 'dd/MM/yyyy HH:mm', { locale: es })}</Typography>
                            </>
                        ) : (
                            <Typography variant="body2" color="text.secondary" sx={{mt:1}}>
                                No hay una orden de venta asociada a esta orden de producción.
                            </Typography>
                        )}
                    </Box>
                    {/* === FIN DEL BLOQUE CORREGIDO === */}
                    
                </Box>
            </Paper>

            {/* Sección de Tareas de Producción */}
            <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, mt: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" component="h2" sx={{display:'flex', alignItems:'center'}}><AssignmentIcon sx={{mr:1}}/>Tareas de Producción</Typography>
                    {canManageTasks(order.estadoProduccion) && (
                        <Button
                            variant="outlined"
                            startIcon={<AddCircleOutlineIcon />}
                            onClick={() => setOpenCreateTaskModal(true)}
                        >
                            Añadir Tarea
                        </Button>
                    )}
                </Box>
                <Divider sx={{mb:2}}/>
                {order.tareas && order.tareas.length > 0 ? (
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>ID Tarea</TableCell>
                                    <TableCell>Nombre Tarea</TableCell>
                                    <TableCell>Empleado</TableCell>
                                    <TableCell>Estado</TableCell>
                                    <TableCell>Inicio</TableCell>
                                    <TableCell>Fin</TableCell>
                                    {canManageTasks(order.estadoProduccion) && <TableCell align="right">Acciones</TableCell>}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {order.tareas.map(tarea => (
                                    <TableRow hover key={tarea.idTareaProduccion}>
                                        <TableCell>{tarea.idTareaProduccion}</TableCell>
                                        <TableCell>{tarea.nombreTarea}</TableCell>
                                        <TableCell>
                                            {tarea.empleado
                                                ? tarea.empleado.nombreEmpleado || 'No asignado'
                                                : 'No asignado'}
                                        </TableCell>
                                        <TableCell>
                                            <Chip label={tarea.estadoTarea} size="small" color={getStatusChipColor(tarea.estadoTarea)}/>
                                        </TableCell>
                                        <TableCell>
                                            {tarea.fechaInicioTarea ? format(parseISO(tarea.fechaInicioTarea), 'dd/MM/yy HH:mm', { locale: es }) : 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            {tarea.fechaFinTarea ? format(parseISO(tarea.fechaFinTarea), 'dd/MM/yy HH:mm', { locale: es }) : 'N/A'}
                                        </TableCell>
                                        {canManageTasks(order.estadoProduccion) && (
                                            <TableCell align="right">
                                                <Tooltip title="Editar Tarea">
                                                    <IconButton
                                                        size="small"
                                                        color="primary"
                                                        onClick={() => handleEditTaskClick(tarea)}
                                                    >
                                                        <EditIcon fontSize="inherit"/>
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Eliminar Tarea">
                                                    <IconButton size="small" color="error" onClick={() => handleDeleteTaskClick(tarea)} disabled={actionLoading}>
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
                    <Typography color="text.secondary" sx={{textAlign:'center', py:2}}>No hay tareas asignadas a esta orden de producción.</Typography>
                )}
            </Paper>

            <ConfirmationDialog
                open={openAnnulDialog}
                onClose={() => {if(!actionLoading)setOpenAnnulDialog(false)}}
                onConfirm={confirmAnnulOrder}
                title="Confirmar Anulación"
                message={`¿Anular Orden de Producción #${order.idOrdenProduccion}? Esta acción no se puede deshacer.`}
                isLoading={actionLoading}
                confirmText="Anular OP"
            />
            <ConfirmationDialog
                open={openDeleteTaskDialog}
                onClose={() => {if(!actionLoading)setOpenDeleteTaskDialog(false)}}
                onConfirm={confirmDeleteTask}
                title="Confirmar Eliminación de Tarea"
                message={selectedTaskToDelete ? `¿Seguro que deseas eliminar la tarea "${selectedTaskToDelete.nombreTarea}"? Esta acción no se puede deshacer.` : '¿Eliminar esta tarea?'}
                isLoading={actionLoading}
                confirmText="Eliminar Tarea"
            />

            {order && (
                <ProductionOrderHeaderEditModal
                    open={openEditHeaderModal}
                    onClose={() => setOpenEditHeaderModal(false)}
                    orderData={order}
                    onOrderHeaderUpdated={handleOrderHeaderUpdated}
                />
            )}

            {order && (
                <ProductionTaskCreateModal
                    open={openCreateTaskModal}
                    onClose={() => setOpenCreateTaskModal(false)}
                    orderProductionId={order.idOrdenProduccion}
                    onTaskCreated={handleTaskCreated}
                />
            )}
            
            {order && editingTask && (
                <ProductionTaskEditModal
                    open={!!editingTask}
                    onClose={() => setEditingTask(null)}
                    orderProductionId={order.idOrdenProduccion}
                    taskData={editingTask}
                    onTaskUpdated={handleTaskUpdated}
                />
            )}
        </Container>
    );
};

export default ProductionOrderDetailPage;