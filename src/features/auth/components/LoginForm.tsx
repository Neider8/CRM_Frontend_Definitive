import React, { useState } from 'react'; // Importar useState
import { Link, useNavigate } from 'react-router-dom';
import styles from '../pages/LoginPage.module.css';

import { loginUser } from '../../../api/authService';
import type { LoginCredentials } from '../../../types/auth.types';
import { useAuth } from '../../../contexts/AuthContext';

// --- INICIO DE CAMBIOS ---
import { IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
// --- FIN DE CAMBIOS ---


export const LoginForm = () => {
  const [credentials, setCredentials] = useState<LoginCredentials>({ nombreUsuario: '', contrasena: '' });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // --- INICIO DE CAMBIOS: Estado para visibilidad de contraseña ---
  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };
  // --- FIN DE CAMBIOS ---
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const authTokenPayload = await loginUser(credentials);
      await login(authTokenPayload);
      navigate('/dashboard', { replace: true });

    } catch (err: unknown) {
      console.error("Error capturado en el formulario:", err);
      if (err && typeof err === 'object' && 'message' in err && typeof (err as any).message === 'string') {
        setError((err as any).message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ocurrió un error inesperado.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.formWrapper}>
        <h1 className={styles.title}>Inicio de Sesion</h1>
        <p className={styles.subtitle}>Bienvenido</p>
        <form noValidate onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
                <input
                    type="text"
                    id="nombreUsuario"
                    name="nombreUsuario"
                    className={styles.inputField}
                    value={credentials.nombreUsuario}
                    onChange={handleChange}
                    placeholder="Nombre de usuario"
                    required
                    disabled={isLoading}
                />
            </div>
            {/* --- INICIO DE CAMBIOS: Campo de contraseña actualizado --- */}
            <div className={styles.passwordInputWrapper}>
                <input
                    type={showPassword ? 'text' : 'password'}
                    id="contrasena"
                    name="contrasena"
                    className={styles.inputField}
                    value={credentials.contrasena}
                    onChange={handleChange}
                    placeholder="Contraseña"
                    required
                    disabled={isLoading}
                />
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                  className={styles.passwordVisibilityIcon}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
            </div>
            {/* --- FIN DE CAMBIOS --- */}
            <Link to="/forgot-password" className={styles.forgotPasswordLink}>
                ¿Olvidaste contraseña?
            </Link>
            {error && <p className={styles.errorMessage}>{error}</p>}
            <button type="submit" className={styles.submitButton} disabled={isLoading}>
                {isLoading ? 'Ingresando...' : 'Acceder'}
            </button>
            <p className={styles.registerText}>
                ¿No tienes cuenta?{' '}
                <Link to="/register" className={styles.registerLink}>
                    Registrarse
                </Link>
            </p>
        </form>
    </div>
  );
};