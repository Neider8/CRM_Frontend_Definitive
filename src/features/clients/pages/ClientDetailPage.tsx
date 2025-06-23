// src/features/clients/pages/ClientDetailPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  Container, Typography, Box, CircularProgress, Alert, Paper, Avatar, Button,
  Divider, IconButton, Tooltip, List, ListItem, ListItemText, ListItemAvatar,
  Snackbar, Stack
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import BusinessIcon from '@mui/icons-material/Business';
import ContactPageIcon from '@mui/icons-material/ContactPage';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';

import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { getClientById, deleteClientContact } from '../../../api/clientService';
import type { ClientDetails, ContactDetails } from '../../../types/client.types';
import { useAuth } from '../../../contexts/AuthContext';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale/es';
import ConfirmationDialog from '../../../components/common/ConfirmationDialog';
import ContactCreateModal from '../components/ContactCreateModal';
import ContactEditModal from '../components/ContactEditModal';

const ClientDetailPage: React.FC = () => {
  const { clientId: clientIdParam } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [client, setClient] = useState<ClientDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [openDeleteContactDialog, setOpenDeleteContactDialog] = useState(false);
  const [selectedContactToDelete, setSelectedContactToDelete] = useState<ContactDetails | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [openCreateContactModal, setOpenCreateContactModal] = useState(false);
  const [editingContact, setEditingContact] = useState<ContactDetails | null>(null);

  const clientId = parseInt(clientIdParam || '', 10);

  const fetchClientData = useCallback(async () => {
    if (clientIdParam && !isNaN(clientId)) {
      setLoading(true);
      setError(null);
      try {
        const data = await getClientById(clientId);
        setClient(data);
      } catch (err: any) {
        console.error("Error al cargar datos del cliente:", err);
        setError(err.message || 'No se pudo cargar la información del cliente.');
      } finally {
        setLoading(false);
      }
    } else {
      setError("ID de cliente inválido o no proporcionado.");
      setLoading(false);
    }
  }, [clientIdParam, clientId]);

  useEffect(() => {
    fetchClientData();
  }, [fetchClientData]);

  const handleDeleteContactClick = (contact: ContactDetails) => {
    setSelectedContactToDelete(contact);
    setOpenDeleteContactDialog(true);
  };

  const confirmDeleteContact = async () => {
    if (selectedContactToDelete && client) {
      setActionLoading(true);
      setError(null);
      try {
        await deleteClientContact(client.idCliente, selectedContactToDelete.idContacto);
        setOpenDeleteContactDialog(false);
        setSuccessMessage(`Contacto '${selectedContactToDelete.nombreContacto}' eliminado correctamente.`);
        fetchClientData();
      } catch (err: any) {
        setError(err.message || `Error al eliminar el contacto '${selectedContactToDelete.nombreContacto}'.`);
        setOpenDeleteContactDialog(false);
      } finally {
        setSelectedContactToDelete(null);
        setActionLoading(false);
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSuccessMessage(null);
    setError(null);
  }

  const handleContactCreated = () => {
    fetchClientData();
  };

  const handleContactUpdated = () => {
    fetchClientData();
    setEditingContact(null);
  };

  const handleEditContactClick = (contact: ContactDetails) => {
    setEditingContact(contact);
  };

  const canEditClient = currentUser?.rolUsuario === 'Administrador' || currentUser?.rolUsuario === 'Ventas';
  const canManageContacts = canEditClient;

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>;
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>
        <Button onClick={() => navigate('/clientes')} sx={{ mt: 2 }}>Volver a la lista</Button>
      </Container>
    );
  }

  if (!client) {
    return <Container maxWidth="md"><Alert severity="warning" sx={{ mt: 4 }}>Cliente no encontrado.</Alert></Container>;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => navigate(-1)} color="primary" sx={{ mr: 1 }} aria-label="Volver">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Detalle del Cliente
          </Typography>
        </Box>
        {canEditClient && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<EditIcon />}
            component={RouterLink}
            to={`/clientes/${client.idCliente}/editar`}
          >
            Editar Cliente
          </Button>
        )}
      </Box>

      {successMessage && <Alert severity="success" sx={{ mb: 2 }} onClose={handleCloseSnackbar}>{successMessage}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={handleCloseSnackbar}>{error}</Alert>}

      <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'flex-start', gap: 3 }}>
          <Box sx={{ width: { xs: '100%', md: '33.33%' }, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <Avatar sx={{ width: 100, height: 100, mb: 2, bgcolor: 'primary.main' }}>
              <BusinessIcon fontSize="large" />
            </Avatar>
            <Typography variant="h5" component="h2" gutterBottom>
              {client.nombreCliente}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {client.tipoDocumento}: {client.numeroDocumento}
            </Typography>
          </Box>

          <Box sx={{ width: { xs: '100%', md: '66.66%' } }}>
            <Typography variant="h6" gutterBottom>Información General</Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={1.5}>
              <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ width: '40%' }}>Dirección:</Typography>
                <Typography variant="body1" sx={{ width: '60%' }}>{client.direccionCliente || 'N/A'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ width: '40%' }}>Teléfono:</Typography>
                <Typography variant="body1" sx={{ width: '60%' }}>{client.telefonoCliente || 'N/A'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ width: '40%' }}>Correo Electrónico:</Typography>
                <Typography variant="body1" sx={{ wordBreak: 'break-all', width: '60%' }}>{client.correoCliente || 'N/A'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ width: '40%' }}>Fecha Creación:</Typography>
                <Typography variant="body1" sx={{ width: '60%' }}>{format(parseISO(client.fechaCreacion), 'dd/MM/yyyy HH:mm', { locale: es })}</Typography>
              </Box>
              {client.fechaActualizacion && (
                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ width: '40%' }}>Última Actualización:</Typography>
                  <Typography variant="body1" sx={{ width: '60%' }}>{format(parseISO(client.fechaActualizacion), 'dd/MM/yyyy HH:mm', { locale: es })}</Typography>
                </Box>
              )}
            </Stack>
          </Box>
        </Box>
      </Paper>

      {/* Sección de Contactos */}
      <Paper elevation={3} sx={{ p: { xs: 2, md: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h2" sx={{ display: 'flex', alignItems: 'center' }}>
            <ContactPageIcon sx={{ mr: 1 }} /> Contactos del Cliente
          </Typography>
          {canManageContacts && (
            <Button
              variant="outlined"
              color="primary"
              startIcon={<AddCircleOutlineIcon />}
              onClick={() => setOpenCreateContactModal(true)}
            >
              Añadir Contacto
            </Button>
          )}
        </Box>
        <Divider sx={{ mb: 2 }} />
        {client.contactosCliente && client.contactosCliente.length > 0 ? (
          <List disablePadding>
            {client.contactosCliente.map((contact) => (
              <React.Fragment key={contact.idContacto}>
                <ListItem
                  secondaryAction={
                    canManageContacts && (
                      <>
                        <Tooltip title="Editar Contacto">
                          <IconButton edge="end" aria-label="edit" sx={{mr:0.5}} onClick={() => handleEditContactClick(contact)}>
                            <EditIcon fontSize="small"/>
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar Contacto">
                          <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteContactClick(contact)} disabled={actionLoading}>
                            <DeleteIcon fontSize="small"/>
                          </IconButton>
                        </Tooltip>
                      </>
                    )
                  }
                >
                  <ListItemAvatar>
                    <Avatar sx={{bgcolor: 'secondary.light'}}>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={contact.nombreContacto}
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.primary" sx={{ display: 'block' }}>
                         {contact.cargoContacto || 'Cargo no especificado'}
                        </Typography>
                        {contact.telefonoContacto && <><PhoneIcon fontSize="inherit" sx={{verticalAlign: 'middle', mr: 0.5}}/> {contact.telefonoContacto} <br/></>}
                        {contact.correoContacto && <><EmailIcon fontSize="inherit" sx={{verticalAlign: 'middle', mr: 0.5}}/> {contact.correoContacto}</>}
                      </>
                    }
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Typography color="text.secondary" sx={{textAlign: 'center', py:2}}>
            Este cliente aún no tiene contactos registrados.
          </Typography>
        )}
      </Paper>

      {/* Modal para crear contacto */}
      {client && (
        <ContactCreateModal
          open={openCreateContactModal}
          onClose={() => setOpenCreateContactModal(false)}
          clientId={client.idCliente}
          onContactCreated={handleContactCreated}
        />
      )}

      {/* Modal para editar contacto */}
      {editingContact && client && (
        <ContactEditModal
          open={!!editingContact}
          onClose={() => setEditingContact(null)}
          clientId={client.idCliente}
          contactData={editingContact}
          onContactUpdated={handleContactUpdated}
        />
      )}

      <ConfirmationDialog
        open={openDeleteContactDialog}
        onClose={() => { if (!actionLoading) setOpenDeleteContactDialog(false); }}
        onConfirm={confirmDeleteContact}
        title="Confirmar Eliminación de Contacto"
        message={`¿Estás seguro de que deseas eliminar al contacto "${selectedContactToDelete?.nombreContacto}"?`}
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
    </Container>
  );
};

export default ClientDetailPage;