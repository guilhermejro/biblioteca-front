import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import styles from './BookDetailsPage.module.css';

export default function BookDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    // Estados do Livro e UI
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(false);

    // Estados para o Autocomplete de Usuários (Librarian)
    const [searchTerm, setSearchTerm] = useState(''); 
    const [usersList, setUsersList] = useState([]);     
    const [showDropdown, setShowDropdown] = useState(false); 
    const [selectedMemberId, setSelectedMemberId] = useState(''); 

    const user = JSON.parse(localStorage.getItem('@Library:user')) || {};

    // 1. Busca os detalhes do livro ao montar o componente
    useEffect(() => {
        api.get(`/books/${id}`)
            .then(res => setBook(res.data))
            .catch(err => console.error("Erro ao buscar livro:", err));
    }, [id]);

    // 2. Efeito de Busca Preditiva (Autocomplete) por Nome
    useEffect(() => {
        if (searchTerm.trim().length < 2) {
            setUsersList([]);
            setShowDropdown(false);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            try {
                const response = await api.get('/users');
                const filtered = response.data.filter(u =>
                    u.name.toLowerCase().includes(searchTerm.toLowerCase())
                );
                setUsersList(filtered);
                setShowDropdown(true);
            } catch (err) {
                console.error("Erro ao buscar usuários por nome:", err);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const handleDelete = async () => {
        const confirmDelete = window.confirm("Tem certeza que deseja remover este livro do acervo?");
        if (confirmDelete) {
            try {
                await api.delete(`/books/${id}`);
                alert("Livro removido com sucesso!");
                navigate('/catalogo');
            } catch (err) {
                const errorMsg = err.response?.data?.error || "Erro ao remover o livro.";
                alert(errorMsg);
                console.error("Erro ao deletar:", err);
            }
        }
    };

    const handleLoan = async () => {
        try {
            setLoading(true);

            // ── FLUXO 1: SE FOR LEITOR (MEMBER) ──
            if (user.role?.toLowerCase() === 'member') {
                const payload = {
                    book_id: Number(id),
                    days: 14
                };

                const response = await api.post('/loans', payload);
                alert(response.data?.message || 'Solicitação de reserva enviada com sucesso!');
                window.location.reload();
                return;
            }

            // ── FLUXO 2: SE FOR BIBLIOTECÁRIO (LIBRARIAN) ──
            if (user.role?.toLowerCase() === 'librarian') {
                if (!selectedMemberId) {
                    alert('Por favor, selecione um membro válido da lista sugerida antes de prosseguir.');
                    setLoading(false);
                    return;
                }

                const payload = {
                    book_id: Number(id),
                    bookId: Number(id),
                    user_id: Number(selectedMemberId),
                    userId: Number(selectedMemberId),
                    member_id: Number(selectedMemberId)
                };

                const response = await api.post('/loans', payload);
                alert(response.data?.message || 'Empréstimo registrado com sucesso!');
                window.location.reload();
            }

        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || err.response?.data?.message || 'Erro ao processar a requisição.');
        } finally {
            setLoading(false);
        }
    };

    if (!book) return (
        <div className={styles.stage}>
            <p className={styles.loading}>Localizando registro no acervo...</p>
        </div>
    );

    const isLibrarian = user?.role?.toLowerCase() === 'librarian';

    return (
        <div className={styles.stage}>
            <div className={styles.lampGlow} aria-hidden="true"></div>

            <div className={styles.tab}>REGISTRO DE ACERVO</div>
            <div className={styles.bookCard}>
                <div className={styles.perf} aria-hidden="true">
                    <span></span><span></span><span></span>
                </div>

                <div className={styles.layoutGrid}>
                    <div className={styles.imageSection}>
                        <img src={book.image_url || 'https://placehold.co/400x600'} alt={book.title} />
                    </div>

                    <div className={styles.infoSection}>
                        <h1 className={styles.title}>{book.title}</h1>
                        <p className={styles.author}>por <b>{book.author}</b></p>

                        <div className={styles.metadata}>
                            <div className={styles.metaItem}>
                                <span>SITUAÇÃO</span>
                                <b className={book.available > 0 ? styles.available : styles.unavailable}>
                                    {book.available > 0 ? 'Disponível para Empréstimo' : 'Indisponível (Fila Activa)'}
                                </b>
                            </div>
                            <div className={styles.metaItem}>
                                <span>EXEMPLARES</span>
                                <b>{book.available} Unidades</b>
                            </div>
                        </div>

                        <div className={styles.description}>
                            <p>{book.description || "Nenhuma resenha/descrição cadastrada para este volume."}</p>
                        </div>

                        {/* SELEÇÃO DE MEMBRO (Librarian) */}
                        {isLibrarian && (
                            <div className={styles.searchContainer}>
                                <label className={styles.label}>LEITOR REQUISITANTE:</label>
                                <input
                                    type="text"
                                    placeholder="Digite o nome para pesquisar..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setSelectedMemberId(''); 
                                    }}
                                    onFocus={() => searchTerm.length >= 2 && setShowDropdown(true)}
                                    className={styles.searchInput}
                                />

                                {showDropdown && usersList.length > 0 && (
                                    <ul className={styles.dropdown}>
                                        {usersList.map((u) => (
                                            <li
                                                key={u.id}
                                                onClick={() => {
                                                    setSelectedMemberId(u.id); 
                                                    setSearchTerm(u.name);     
                                                    setShowDropdown(false);    
                                                }}
                                                className={styles.dropdownItem}
                                            >
                                                {u.name} <span className={styles.memberId}>(ID: #{String(u.id).padStart(3, '0')})</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                {showDropdown && searchTerm.length >= 2 && usersList.length === 0 && (
                                    <div className={styles.noResults}>
                                        Nenhum registro encontrado
                                    </div>
                                )}
                            </div>
                        )}

                        <hr className={styles.rule} />

                        <div className={styles.buttonGroup}>
                            <button
                                className={styles.btnLoan}
                                disabled={loading || (isLibrarian && book.available <= 0)}
                                onClick={handleLoan}
                            >
                                {loading ? 'PROCESSANDO...' : (
                                    isLibrarian
                                        ? '[ EFETIVAR EMPRÉSTIMO ]'
                                        : '[ SOLICITAR LIVRO ]'
                                )}
                            </button>

                            {isLibrarian && (
                                <button
                                    className={styles.btnEdit}
                                    onClick={() => navigate(`/editar-livro/${id}`)}
                                >
                                    Editar
                                </button>
                            )}

                            {isLibrarian && (
                                <button
                                    className={styles.btnDelete}
                                    onClick={handleDelete}
                                >
                                    Remover
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}