// src/features/employees/pages/EmployeesListPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Button, Paper, TableContainer, Table, TableHead, TableRow,
  TableCell, TableBody, TablePagination, CircularProgress, Alert, IconButton, Tooltip, Snackbar, Chip, Container
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd'; // Icono para asociar/ver usuario
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { getAllEmployees, deleteEmployee } from '../../../api/employeeService'; // Ajusta la ruta si es necesario
import type { EmployeePageableRequest, PaginatedEmployees, EmployeeDetails } from '../../../types/employee.types'; // Ajusta la ruta si es necesario
import { useAuth } from '../../../contexts/AuthContext'; // Ajusta la ruta si es necesario
// import { format } from 'date-fns'; // No se usa format en este archivo directamente, pero podría ser útil para fechas si se añaden.
import ConfirmationDialog from '../../../components/common/ConfirmationDialog'; // Ajusta la ruta si es necesario

const EmployeesListPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [employeesPage, setEmployeesPage] = useState<PaginatedEmployees | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedEmployeeIdToDelete, setSelectedEmployeeIdToDelete] = useState<number | null>(null);
  const [selectedEmployeeNameToDelete, setSelectedEmployeeNameToDelete] = useState<string>('');

  const fetchEmployees = useCallback(async (currentPage: number, currentRowsPerPage: number) => {
    setLoading(true);
    // setError(null); // Considera si quieres limpiar errores anteriores al reintentar.
    try {
      const params: EmployeePageableRequest = {
        page: currentPage,
        size: currentRowsPerPage,
        sort: 'nombreEmpleado,asc', // o el criterio de ordenación que prefieras
      };
      const data = await getAllEmployees(params);
      setEmployeesPage(data);
      setError(null); // Limpiar errores si la carga es exitosa
    } catch (err: any) {
      setError(err.message || 'Error al cargar empleados.');
      console.error("Error fetching employees:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees(page, rowsPerPage);
  }, [fetchEmployees, page, rowsPerPage]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewDetails = (employeeId: number) => {
    navigate(`/empleados/${employeeId}`);
  };

  const handleEditEmployee = (employeeId: number) => {
    navigate(`/empleados/${employeeId}/editar`);
  };

  const handleDeleteEmployeeClick = (employeeId: number, employeeName: string) => {
    setSelectedEmployeeIdToDelete(employeeId);
    setSelectedEmployeeNameToDelete(employeeName);
    setOpenDeleteDialog(true);
  };

  const confirmDeleteEmployee = async () => {
    if (selectedEmployeeIdToDelete) {
      setActionLoading(true);
      setError(null);
      setSuccessMessage(null);
      try {
        await deleteEmployee(selectedEmployeeIdToDelete);
        setOpenDeleteDialog(false);
        setSuccessMessage(`Empleado '${selectedEmployeeNameToDelete}' eliminado correctamente.`);
        fetchEmployees(page, rowsPerPage); // Recargar la lista
      } catch (err: any) {
        setError(err.message || `Error al eliminar el empleado '${selectedEmployeeNameToDelete}'.`);
        console.error("Error deleting employee:", err);
        setOpenDeleteDialog(false); // Cerrar diálogo incluso si hay error
      } finally {
        setSelectedEmployeeIdToDelete(null);
        setSelectedEmployeeNameToDelete('');
        setActionLoading(false);
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSuccessMessage(null);
    setError(null); // También limpiar errores al cerrar el snackbar si es un error general
  };

  const canCreateEmployees = currentUser?.rolUsuario === 'Administrador' || currentUser?.rolUsuario === 'Gerente';
  const canEditEmployees = currentUser?.rolUsuario === 'Administrador' || currentUser?.rolUsuario === 'Gerente';
  const canDeleteEmployees = currentUser?.rolUsuario === 'Administrador';
  const canViewEmployees = currentUser?.rolUsuario === 'Administrador' || currentUser?.rolUsuario === 'Gerente' || currentUser?.rolUsuario === 'Ventas' || currentUser?.rolUsuario === 'Operario'; // Ajusta según tus roles que pueden ver

  if (loading && !employeesPage) { // Mostrar loading solo si no hay datos previos
    return <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>;
  }

  if (!canViewEmployees && !loading) { // Si ya terminó de cargar y no tiene permisos
      return (
          <Container maxWidth="md">
              <Alert severity="error" sx={{mt: 2}}>No tienes permisos para ver la lista de empleados.</Alert>
              <Button onClick={() => navigate('/')} sx={{mt:1}}>Ir al inicio</Button>
          </Container>
      );
  }


  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', p: { xs: 1, sm: 2 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h5" component="h1">
          Gestión de Empleados
        </Typography>
        {canCreateEmployees && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            component={RouterLink}
            to="/empleados/nuevo"
          >
            Nuevo Empleado
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={handleCloseSnackbar}>{error}</Alert>}
      {/* Mostrar loading de forma más sutil si ya hay datos y se está recargando */}
      {loading && employeesPage && <Box sx={{ display: 'flex', justifyContent: 'center', my:2 }}><CircularProgress size={24} /></Box>}


      {!loading && !error && (!employeesPage || employeesPage.content.length === 0) ? (
         <Typography sx={{mt: 2, textAlign: 'center'}}>No se encontraron empleados.</Typography>
      ) : employeesPage && employeesPage.content.length > 0 ? (
        <>
          <TableContainer>
            <Table stickyHeader aria-label="tabla de empleados">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Nº Documento</TableCell>
                  <TableCell>Cargo</TableCell>
                  <TableCell>Área</TableCell>
                  <TableCell>Usuario Asociado</TableCell>
                  <TableCell align="right" sx={{minWidth: 150}}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {employeesPage.content.map((employee) => (
                  <TableRow hover role="checkbox" tabIndex={-1} key={employee.idEmpleado}>
                    <TableCell>{employee.idEmpleado}</TableCell>
                    <TableCell>{employee.nombreEmpleado}</TableCell>
                    <TableCell>{employee.numeroDocumento}</TableCell>
                    <TableCell>{employee.cargoEmpleado || 'N/A'}</TableCell>
                    <TableCell>{employee.areaEmpleado || 'N/A'}</TableCell>
                    <TableCell>
                      {employee.usuario ? (
                        <Tooltip title={`Usuario: ${employee.usuario.nombreUsuario} (Rol: ${employee.usuario.rolUsuario})`}>
                          <Chip
                            icon={<AssignmentIndIcon />}
                            label={employee.usuario.nombreUsuario}
                            size="small"
                            component={RouterLink}
                            to={`/usuarios/${employee.usuario.idUsuario}`}
                            clickable
                            color="secondary" // O el color que prefieras
                            variant="outlined"
                          />
                        </Tooltip>
                      ) : (
                        <Tooltip title="Asociar Usuario">
                          <Chip
                            icon={<AssignmentIndIcon />}
                            label="No asociado"
                            size="small"
                            onClick={() => {
                              // --- INICIO DEL CÓDIGO DE DIAGNÓSTICO ---
                              console.log('--- DIAGNÓSTICO DESDE EmployeesListPage ---');
                              console.log('ID del Empleado:', employee.idEmpleado);
                              console.log('Nombre Empleado en Frontend (antes de encodeURIComponent):', employee.nombreEmpleado);
                              // Opcional: para ver todo el objeto empleado tal como está en el frontend:
                              // console.log('Objeto completo del empleado en Frontend:', JSON.parse(JSON.stringify(employee)));
                              // --- FIN DEL CÓDIGO DE DIAGNÓSTICO ---
                              
                              navigate(`/usuarios/nuevo?idEmpleado=${employee.idEmpleado}&nombreEmpleado=${encodeURIComponent(employee.nombreEmpleado)}`);
                            }}
                            clickable
                            variant="outlined"
                          />
                        </Tooltip>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Ver Detalles">
                        <IconButton onClick={() => handleViewDetails(employee.idEmpleado)} color="info" size="small">
                          <VisibilityIcon fontSize="inherit" />
                        </IconButton>
                      </Tooltip>
                      {canEditEmployees && (
                        <Tooltip title="Editar Empleado">
                          <IconButton onClick={() => handleEditEmployee(employee.idEmpleado)} color="primary" size="small">
                            <EditIcon fontSize="inherit" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {canDeleteEmployees && (
                        <Tooltip title="Eliminar Empleado">
                          <IconButton onClick={() => handleDeleteEmployeeClick(employee.idEmpleado, employee.nombreEmpleado)} color="error" size="small" disabled={actionLoading}>
                            <DeleteIcon fontSize="inherit" />
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
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={employeesPage.totalElements}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Filas por página:"
            getItemAriaLabel={(type) => {
                if (type === 'first') return 'Primera página';
                if (type === 'last') return 'Última página';
                if (type === 'next') return 'Siguiente página';
                return 'Página anterior';
            }}
          />
        </>
      ) : null}

      <ConfirmationDialog
        open={openDeleteDialog}
        onClose={() => { if (!actionLoading) setOpenDeleteDialog(false); }}
        onConfirm={confirmDeleteEmployee}
        title="Confirmar Eliminación de Empleado"
        message={`¿Estás seguro de que deseas eliminar al empleado "${selectedEmployeeNameToDelete}" (ID: ${selectedEmployeeIdToDelete})? Esta acción también podría desvincularlo de su cuenta de usuario si existe.`}
        confirmText="Eliminar"
        isLoading={actionLoading}
      />
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }} variant="filled">
          {successMessage}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default EmployeesListPage;