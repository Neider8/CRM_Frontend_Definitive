// src/features/employees/pages/EmployeeEditPage.tsx
import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, CircularProgress, Alert, IconButton, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useParams, useNavigate } from 'react-router-dom';
import EmployeeEditForm from '../components/EmployeeEditForm';
import { getEmployeeById } from '../../../api/employeeService';
import type { EmployeeDetails } from '../../../types/employee.types';
import { useAuth } from '../../../contexts/AuthContext';

const EmployeeEditPage: React.FC = () => {
  const { employeeId: employeeIdParam } = useParams<{ employeeId: string }>(); // Cambiado de userId a employeeId
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [employeeData, setEmployeeData] = useState<EmployeeDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const employeeId = parseInt(employeeIdParam || '', 10);

  useEffect(() => {
    if (employeeIdParam && !isNaN(employeeId)) {
      const fetchEmployeeData = async () => {
        setLoading(true);
        setError(null);
        try {
          const data = await getEmployeeById(employeeId);
          setEmployeeData(data);
        } catch (err: any) {
          console.error("Error al cargar datos del empleado:", err);
          setError(err.message || 'No se pudo cargar la información del empleado.');
        } finally {
          setLoading(false);
        }
      };
      fetchEmployeeData();
    } else {
      setError("No se proporcionó ID de empleado o es inválido.");
      setLoading(false);
    }
  }, [employeeIdParam, employeeId]);

  // Permisos según EmpleadoController
  const canEdit = currentUser?.rolUsuario === 'Administrador' || currentUser?.rolUsuario === 'Gerente';

  if (!canEdit) {
     return (
        <Container maxWidth="md">
            <Box sx={{ my: 4, textAlign: 'center' }}>
                <Typography variant="h5" color="error">Acceso Denegado</Typography>
                <Typography>No tienes permisos para editar empleados.</Typography>
                 <Button variant="outlined" onClick={() => navigate(-1)} sx={{mt: 2}}>
                    Volver
                </Button>
            </Box>
        </Container>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>
        <Button onClick={() => navigate('/empleados')} sx={{ mt: 2 }}>Volver a la lista</Button>
      </Container>
    );
  }

  if (!employeeData) {
    return <Container maxWidth="md"><Alert severity="warning" sx={{ mt: 4 }}>Empleado no encontrado.</Alert></Container>;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 2, display: 'flex', alignItems: 'center' }}>
        <IconButton onClick={() => navigate(-1)} color="primary" sx={{ mr: 1 }} aria-label="Volver">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Editar Empleado
        </Typography>
      </Box>
      <EmployeeEditForm employeeData={employeeData} />
    </Container>
  );
};

export default EmployeeEditPage;