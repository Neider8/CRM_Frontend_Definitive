import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';

import { AuthProvider } from './contexts/AuthContext';
import { BrowserRouter as Router } from 'react-router-dom';

// --- NUEVAS IMPORTACIONES PARA REACT-QUERY ---
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// --- CREAR UNA INSTANCIA DE QueryClient ---
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          {/* --- ENVOLVER LA APP CON QueryClientProvider --- */}
          <QueryClientProvider client={queryClient}>
            <App />
          </QueryClientProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  </React.StrictMode>
);