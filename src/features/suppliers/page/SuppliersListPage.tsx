// src/features/suppliers/pages/SuppliersListPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
    Box, Typography, Button, Paper, TableContainer, Table, TableHead, TableRow,
    TableCell, TableBody, TablePagination, CircularProgress, Alert, IconButton, Tooltip, Snackbar, Container
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BusinessIcon from '@mui/icons-material/Business'; // Icono para proveedores
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { getAllSuppliers, deleteSupplier } from '../../../api/supplierService';
import type { SupplierDetails, SupplierPageableRequest, PaginatedSuppliers } from '../../../types/supplier.types';
import { useAuth } from '../../../contexts/AuthContext';
// import { format } from 'date-fns'; // No hay fechas en la tabla principal aquí
import ConfirmationDialog from '../../../components/common/ConfirmationDialog';

const SuppliersListPage: React.FC = () => {
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();
    const [suppliersPage, setSuppliersPage] = useState<PaginatedSuppliers | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [selectedSupplierIdToDelete, setSelectedSupplierIdToDelete] = useState<number | null>(null);
    const [selectedSupplierNameToDelete, setSelectedSupplierNameToDelete] = useState<string>('');

    const fetchSuppliers = useCallback(async (currentPage: number, currentRowsPerPage: number) => {
        setLoading(true);
        try {
            const params: SupplierPageableRequest = {
                page: currentPage,
                size: currentRowsPerPage,
                sort: 'nombreComercialProveedor,asc',
            };
            const data = await getAllSuppliers(params);
            setSuppliersPage(data);
        } catch (err: any) {
            setError(err.message || 'Error al cargar proveedores.');
            console.error("Error fetching suppliers:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSuppliers(page, rowsPerPage);
    }, [fetchSuppliers, page, rowsPerPage]);

    const handleChangePage = (event: unknown, newPage: number) => setPage(newPage);
    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleViewDetails = (supplierId: number) => navigate(`/proveedores/${supplierId}`);
    const handleEditSupplier = (supplierId: number) => navigate(`/proveedores/${supplierId}/editar`);

    const handleDeleteSupplierClick = (supplierId: number, supplierName: string) => {
        setSelectedSupplierIdToDelete(supplierId);
        setSelectedSupplierNameToDelete(supplierName);
        setOpenDeleteDialog(true);
    };

    const confirmDeleteSupplier = async () => {
        if (selectedSupplierIdToDelete) {
            setActionLoading(true);
            setError(null);
            try {
                await deleteSupplier(selectedSupplierIdToDelete);
                setOpenDeleteDialog(false);
                setSuccessMessage(`Proveedor '${selectedSupplierNameToDelete}' eliminado correctamente.`);
                fetchSuppliers(page, rowsPerPage);
            } catch (err: any) {
                setError(err.message || `Error al eliminar el proveedor '${selectedSupplierNameToDelete}'.`);
                setOpenDeleteDialog(false);
            } finally {
                setSelectedSupplierIdToDelete(null);
                setSelectedSupplierNameToDelete('');
                setActionLoading(false);
            }
        }
    };

    const handleCloseSnackbar = () => {
        setSuccessMessage(null);
        setError(null);
    };

    const canCreateSuppliers = currentUser?.rolUsuario === 'Administrador' || currentUser?.rolUsuario === 'Gerente';
    const canEditSuppliers = currentUser?.rolUsuario === 'Administrador' || currentUser?.rolUsuario === 'Gerente';
    const canDeleteSuppliers = currentUser?.rolUsuario === 'Administrador';
    const canViewSuppliers = currentUser?.rolUsuario === 'Administrador' || currentUser?.rolUsuario === 'Gerente';

    if (loading && !suppliersPage?.content.length && !error) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>;
    }
    if (!canViewSuppliers && !loading && !error) {
        return <Container maxWidth="md"><Alert severity="warning" sx={{mt:2}}>No tienes permiso para ver esta página.</Alert></Container>;
    }
    if (error && !suppliersPage?.content.length) {
        return <Container maxWidth="md"><Alert severity="error" sx={{mt:2}} onClose={handleCloseSnackbar}>{error}</Alert></Container>;
    }

    return (
        <Paper sx={{ width: '100%', overflow: 'hidden', p: {xs: 1, sm: 2} }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="h5" component="h1" sx={{display: 'flex', alignItems: 'center'}}>
                    <BusinessIcon sx={{mr:1}} /> Gestión de Proveedores
                </Typography>
                {canCreateSuppliers && (
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        component={RouterLink}
                        to="/proveedores/nuevo"
                    >
                        Nuevo Proveedor
                    </Button>
                )}
            </Box>
            {error && (suppliersPage?.content?.length ?? 0) > 0 && <Alert severity="error" sx={{ mb: 2 }} onClose={handleCloseSnackbar}>{error}</Alert>}
            {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my:2 }}><CircularProgress /></Box>}

            {!loading && suppliersPage && suppliersPage.content.length > 0 ? (
                <>
                    <TableContainer>
                        <Table stickyHeader size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell>Nombre Comercial</TableCell>
                                    <TableCell>NIT</TableCell>
                                    <TableCell>Teléfono</TableCell>
                                    <TableCell>Correo</TableCell>
                                    <TableCell>Contacto Principal</TableCell>
                                    <TableCell align="right">Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {suppliersPage.content.map((supplier: SupplierDetails) => (
                                    <TableRow hover key={supplier.idProveedor}>
                                        <TableCell>{supplier.idProveedor}</TableCell>
                                        <TableCell>{supplier.nombreComercialProveedor}</TableCell>
                                        <TableCell>{supplier.nitProveedor}</TableCell>
                                        <TableCell>{supplier.telefonoProveedor || 'N/A'}</TableCell>
                                        <TableCell>{supplier.correoProveedor || 'N/A'}</TableCell>
                                        <TableCell>{supplier.contactoPrincipalProveedor || 'N/A'}</TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="Ver Detalles">
                                                <IconButton onClick={() => handleViewDetails(supplier.idProveedor)} color="info" size="small">
                                                    <VisibilityIcon />
                                                </IconButton>
                                            </Tooltip>
                                            {canEditSuppliers && (
                                                <Tooltip title="Editar Proveedor">
                                                    <IconButton onClick={() => handleEditSupplier(supplier.idProveedor)} color="primary" size="small">
                                                        <EditIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                            {canDeleteSuppliers && (
                                                <Tooltip title="Eliminar Proveedor">
                                                    <IconButton onClick={() => handleDeleteSupplierClick(supplier.idProveedor, supplier.nombreComercialProveedor)} color="error" size="small" disabled={actionLoading}>
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
                        count={suppliersPage.totalElements}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        labelRowsPerPage="Filas por página:"
                        getItemAriaLabel={(type) => type === 'first' ? 'Primera página' : type === 'last' ? 'Última página' : type === 'next' ? 'Siguiente página' : 'Página anterior'}
                    />
                </>
            ) : (
                !loading && !error && <Typography sx={{mt: 2, textAlign: 'center'}}>No se encontraron proveedores.</Typography>
            )}

            <ConfirmationDialog
                open={openDeleteDialog}
                onClose={() => { if (!actionLoading) setOpenDeleteDialog(false); }}
                onConfirm={confirmDeleteSupplier}
                title="Confirmar Eliminación de Proveedor"
                message={`¿Estás seguro de que deseas eliminar al proveedor "${selectedSupplierNameToDelete}" (ID: ${selectedSupplierIdToDelete})?`}
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

export default SuppliersListPage;