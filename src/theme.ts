import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import { red, blueGrey, deepPurple, amber } from '@mui/material/colors';

// Paleta de ejemplo
let theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Un azul clásico
      // light: '#42a5f5',
      // dark: '#1565c0',
    },
    secondary: {
      main: '#9c27b0', // Un púrpura
    },
    error: {
      main: red.A400,
    },
    warning: {
      main: amber[700],
    },
    info: {
      main: '#0288d1',
    },
    success: {
      main: '#2e7d32',
    },
    background: {
      default: '#f4f6f8', // Un gris muy claro para el fondo de la app
      paper: '#ffffff', // Fondo para Paper, Card, etc.
    },
    text: {
      primary: blueGrey[900],
      secondary: blueGrey[600],
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: '2.8rem', fontWeight: 500 },
    h2: { fontSize: '2.4rem', fontWeight: 500 },
    h3: { fontSize: '2.0rem', fontWeight: 500 },
    h4: { fontSize: '1.7rem', fontWeight: 500 }, // Ajustado para UserProfilePage
    h5: { fontSize: '1.4rem', fontWeight: 500 }, // Ajustado para títulos de página
    h6: { fontSize: '1.2rem', fontWeight: 500 }, // Ajustado para subtítulos o títulos de formulario
    subtitle1: { fontSize: '1rem' },
    body1: { fontSize: '1rem' }, // Texto principal
    body2: { fontSize: '0.875rem' }, // Texto secundario, helperText
    button: { textTransform: 'none', fontWeight: 500 }, // Evitar mayúsculas en botones
  },
  shape: {
    borderRadius: 8, // Bordes ligeramente más redondeados
  },
  components: {
    // Overrides globales para componentes MUI
    MuiButton: {
      styleOverrides: {
        root: {
          // minWidth: '120px', // Un ancho mínimo para botones
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          // backgroundImage: 'none', // Para asegurar que no herede gradientes raros si los hubiera
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          // boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)', // Una sombra más sutil
        },
      },
    },
  },
});

theme = responsiveFontSizes(theme);
export default theme;