import styles from './LoginPage.module.css';
import { LoginForm } from '../components/LoginForm'; 
import logo from '../../../assets/logo.png';

const LoginPage = () => {
  return (
    <div className={styles.loginPageContainer}>
      {/* Panel izquierdo que centra el formulario */}
      <div className={styles.formPanel}>
        <LoginForm />
      </div>

      {/* Panel derecho con el logo */}
      <div className={styles.logoPanel}>
        <img src={logo} alt="Tech 360 Logo" className={styles.logo} />
      </div>
    </div>
  );
};

export default LoginPage;