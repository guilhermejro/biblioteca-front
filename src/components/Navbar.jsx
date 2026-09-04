import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import LogoImg from '../assets/Logo.avif';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { signed, logout, user } = useContext(AuthContext);
  const navigate = useNavigate();

  // early return para visitantes não autenticados
  if (!signed) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const firstName = user?.name ? user.name.split(' ')[0] : 'Leitor';

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        {/* Rota ajustada de './' para '/' */}
        <Link to="/">
          <img src={LogoImg} alt="Borrachalioteca" />
        </Link>
      </div>

      <div className={styles.links}>
        {/* Rota 'catalogo' em caixa baixa para manter o padrão REST no client */}
        <Link to="/catalogo" className={styles.navLink}>
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
          <span className={styles.welcome}>
            USUÁRIO: <b>{firstName}</b>
          </span>
          <button onClick={handleLogout} className={styles.btnLogout}>
            [ SAIR ]
          </button>
        </div>
      </div>
    </nav>
  );
}