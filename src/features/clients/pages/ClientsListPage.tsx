// src/features/clients/pages/ClientsListPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Button, Paper, TableContainer, Table, TableHead, TableRow,
  TableCell, TableBody, TablePagination, CircularProgress, Alert, IconButton, Tooltip, Snackbar, Chip, Container
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ContactsIcon from '@mui/icons-material/Contacts';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { getAllClients, deleteClient } from '../../../api/clientService';
import type { ClientPageableRequest } from '../../../types/client.types';
import type { PaginatedClients } from '../../../types/client.types';
import { useAuth } from '../../../contexts/AuthContext';
import { format } from 'date-fns';
import ConfirmationDialog from '../../../components/common/ConfirmationDialog';

const ClientsListPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [clientsPage, setClientsPage] = useState<PaginatedClients | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedClientIdToDelete, setSelectedClientIdToDelete] = useState<number | null>(null);
  const [selectedClientNameToDelete, setSelectedClientNameToDelete] = useState<string>('');

  const fetchClients = useCallback(async (currentPage: number, currentRowsPerPage: number) => {
    setLoading(true);
    try {
      const params: ClientPageableRequest = {
        page: currentPage,
        size: currentRowsPerPage,
        sort: 'nombreCliente,asc',
      };
      const data = await getAllClients(params);
      setClientsPage(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar clientes.');
      console.error("Error fetching clients:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients(page, rowsPerPage);
  }, [fetchClients, page, rowsPerPage]);

  const handleChangePage = (event: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewDetails = (clientId: number) => navigate(`/clientes/${clientId}`);
  const handleEditClient = (clientId: number) => navigate(`/clientes/${clientId}/editar`);
  const handleManageContacts = (clientId: number) => {
    navigate(`/clientes/${clientId}`); // Cambiado para ir a la página de detalles del cliente
  };


  const handleDeleteClientClick = (clientId: number, clientName: string) => {
    setSelectedClientIdToDelete(clientId);
    setSelectedClientNameToDelete(clientName);
    setOpenDeleteDialog(true);
  };

  const confirmDeleteClient = async () => {
    if (selectedClientIdToDelete) {
      setActionLoading(true);
      setError(null);
      try {
        await deleteClient(selectedClientIdToDelete);
        setOpenDeleteDialog(false);
        setSuccessMessage(`Cliente '${selectedClientNameToDelete}' eliminado correctamente.`);
        fetchClients(page, rowsPerPage); // Recargar
      } catch (err: any) {
        setError(err.message || `Error al eliminar el cliente '${selectedClientNameToDelete}'.`);
        setOpenDeleteDialog(false);
      } finally {
        setSelectedClientIdToDelete(null);
        setSelectedClientNameToDelete('');
        setActionLoading(false);
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSuccessMessage(null);
    setError(null); // También limpia errores al cerrar el snackbar
  };

  // Permisos basados en ClienteController
  const canCreateClients = currentUser?.rolUsuario === 'Administrador' || currentUser?.rolUsuario === 'Ventas';
  const canEditClients = currentUser?.rolUsuario === 'Administrador' || currentUser?.rolUsuario === 'Ventas';
  const canDeleteClients = currentUser?.rolUsuario === 'Administrador';
  const canViewClients = currentUser?.rolUsuario === 'Administrador' || currentUser?.rolUsuario === 'Gerente' || currentUser?.rolUsuario === 'Ventas';

  if (loading && !clientsPage?.content.length && !error) {
    // Implementar Skeletons si se desea
    return <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>;
  }
  if (!canViewClients && !loading && !error) { // Si ya terminó de cargar y no tiene permiso
    return <Container maxWidth="md"><Alert severity="warning" sx={{mt:2}}>No tienes permiso para ver esta página.</Alert></Container>;
  }
  if (error && !clientsPage?.content.length) { // Si hubo un error y no hay clientes para mostrar
    return <Container maxWidth="md"><Alert severity="error" sx={{mt:2}} onClose={handleCloseSnackbar}>{error}</Alert></Container>;
  }


  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', p: {xs: 1, sm: 2} }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h5" component="h1">
          Gestión de Clientes
        </Typography>
        {canCreateClients && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            component={RouterLink}
            to="/clientes/nuevo"
          >
            Nuevo Cliente
          </Button>
        )}
      </Box>

      {error && (clientsPage?.content?.length ?? 0) > 0 && <Alert severity="error" sx={{ mb: 2 }} onClose={handleCloseSnackbar}>{error}</Alert>}

      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my:2 }}><CircularProgress /></Box>}

      {!loading && clientsPage && clientsPage.content.length > 0 ? (
        <>
          <TableContainer>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Nombre Cliente</TableCell>
                  <TableCell>Nº Documento</TableCell>
                  <TableCell>Teléfono</TableCell>
                  <TableCell>Correo</TableCell>
                  <TableCell>Contactos</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {clientsPage.content.map((client) => (
                  <TableRow hover key={client.idCliente}>
                    <TableCell>{client.idCliente}</TableCell>
                    <TableCell>{client.nombreCliente}</TableCell>
                    <TableCell>{client.numeroDocumento}</TableCell>
                    <TableCell>{client.telefonoCliente || 'N/A'}</TableCell>
                    <TableCell>{client.correoCliente || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip
                        icon={<ContactsIcon />}
                        label={`${client.contactosCliente?.length || 0}`}
                        size="small"
                        onClick={() => handleManageContacts(client.idCliente)}
                        clickable
                        color={ (client.contactosCliente?.length || 0) > 0 ? "secondary" : "default"}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Ver Detalles">
                        <IconButton onClick={() => handleViewDetails(client.idCliente)} color="info" size="small">
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      {canEditClients && (
                        <Tooltip title="Editar Cliente">
                          <IconButton onClick={() => handleEditClient(client.idCliente)} color="primary" size="small">
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      {canDeleteClients && (
                        <Tooltip title="Eliminar Cliente">
                          <IconButton onClick={() => handleDeleteClientClick(client.idCliente, client.nombreCliente)} color="error" size="small" disabled={actionLoading}>
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
            count={clientsPage.totalElements}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Filas por página:"
              getItemAriaLabel={(type) => type === 'first' ? 'Primera página' : type === 'last' ? 'Última página' : type === 'next' ? 'Siguiente página' : 'Página anterior'}
          />
        </>
      ) : (
        !loading && !error && <Typography sx={{mt: 2, textAlign: 'center'}}>No se encontraron clientes.</Typography>
      )}

      <ConfirmationDialog
        open={openDeleteDialog}
        onClose={() => { if (!actionLoading) setOpenDeleteDialog(false); }}
        onConfirm={confirmDeleteClient}
        title="Confirmar Eliminación de Cliente"
        message={`¿Estás seguro de que deseas eliminar al cliente "${selectedClientNameToDelete}" (ID: ${selectedClientIdToDelete})? Esta acción también eliminará sus contactos y órdenes asociadas (según la configuración de la BD).`}
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

export default ClientsListPage;