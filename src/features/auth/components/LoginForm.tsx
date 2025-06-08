import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // 1. Importa useNavigate
import styles from '../pages/LoginPage.module.css';

import { loginUser } from '../../../api/authService';
import type { LoginCredentials, AuthTokenPayload } from '../../../types/auth.types';
import { useAuth } from '../../../contexts/AuthContext'; // 2. Importa tu hook de autenticación

export const LoginForm = () => {
  const [credentials, setCredentials] = useState<LoginCredentials>({ nombreUsuario: '', contrasena: '' });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate(); // 3. Inicializa el hook de navegación
  const { login } = useAuth();    // 4. Obtén la función 'login' de tu contexto

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
      
      // 5. Llama a la función 'login' de tu contexto. 
      // Esta función debería guardar el token y actualizar el estado global del usuario.
      await login(authTokenPayload);

      // 6. Navega al dashboard "al modo React", sin recargar la página.
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

  // El JSX no cambia en absoluto
  return (
    <div className={styles.formWrapper}>
        {/* ... Tu JSX del formulario va aquí ... */}
        {/* (es idéntico al de la respuesta anterior) */}
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
            <div className={styles.inputGroup}>
                <input
                    type="password"
                    id="contrasena"
                    name="contrasena"
                    className={styles.inputField}
                    value={credentials.contrasena}
                    onChange={handleChange}
                    placeholder="Contraseña"
                    required
                    disabled={isLoading}
                />
            </div>
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