import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import LogoImg from '../assets/Logo.avif';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { signed, logout, user } = useContext(AuthContext);

  if (!signed) return null;

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <Link to="./">
          <img src={LogoImg} alt="📚 Borrachalioteca" />
        </Link>
      </div>

      <div className={styles.links}>
        {signed ? (
          <>
            <Link to="/Catalogo" className={styles.navLink}>
              Acervo
            </Link>
            <Link to="/perfil" className={styles.navLink}>
              Meu Perfil
            </Link>
            
            {user?.role === 'librarian' && (
              <>
                <Link to="/admin/reservas" className={`${styles.navLink} ${styles.adminLink}`}>
                  📋 Aprovar Reservas
                </Link>
                <Link to="/admin/novo-bibliotecario" className={`${styles.navLink} ${styles.adminLink}`}>
                  Painel Admin
                </Link>
              </>
            )}

            <div className={styles.userBadge}>
              <span className={styles.welcome}>USUARIO: <b>{user?.name?.split(' ')[0]}</b></span>
              <button onClick={logout} className={styles.btnLogout}>[ SAIR ]</button>
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className={styles.navLink}>Entrar</Link>
            <Link to="/register" className={styles.btnRegister}>Criar Conta</Link>
          </>
        )}
      </div>
    </nav>
  );
}