// src/components/common/ConfirmationDialog.tsx
import React from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  CircularProgress,
 } from '@mui/material';

interface ConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
 onConfirm: () => void;
 title: string;
 message: string | React.ReactNode;
 confirmText?: string;
 cancelText?: string;
 isLoading?: boolean; // Para mostrar un loader en el botón de confirmar
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isLoading = false,
}) => {
  const handleDialogClose = () => {
    if (!isLoading) { // Solo permitir cerrar si no está cargando
      onClose();
    }
  };

     return (
<Dialog
open={open}
onClose={handleDialogClose} // Usar el wrapper para la lógica de isLoading
aria-labelledby="confirmation-dialog-title"
aria-describedby="confirmation-dialog-description"
disableEscapeKeyDown={isLoading} // Prevenir escape si está cargando
>
<DialogTitle id="confirmation-dialog-title">{title}</DialogTitle>
<DialogContent>
<DialogContentText id="confirmation-dialog-description">
{message}
</DialogContentText>
</DialogContent>
<DialogActions sx={{ px: 3, pb: 2 }}>
<Button onClick={handleDialogClose} color="inherit" disabled={isLoading}>
{cancelText}
</Button>
<Button
onClick={onConfirm}
color="error"
variant="contained"
autoFocus // Enfocar el botón de confirmar
disabled={isLoading}
>
{isLoading ? <CircularProgress size={24} color="inherit" /> : confirmText}
</Button>
</DialogActions>
</Dialog>
);
};

export default ConfirmationDialog;