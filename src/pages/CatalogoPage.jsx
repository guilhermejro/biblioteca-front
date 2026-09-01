import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import styles from './CatalogoPage.module.css';

function CatalogoPage() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false); // 🔥 Novo estado para transições suaves
    const [search, setSearch] = useState('');

    // ── Estados para controle de Paginação ──────────────────────────────────
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1); // 🔥 Sincronizado com o seu backend
    const limitPerPage = 50; 

    // 1. Busca os livros no backend aplicando paginação e busca
    useEffect(() => {
        async function fetchBooks() {
            try {
                // Se for a primeira carga, usa o loading principal. Se for paginação/busca, usa o updating.
                if (books.length === 0) setLoading(true);
                else setUpdating(true);
                
                const response = await api.get('/books', {
                    params: {
                        page: currentPage,
                        limit: limitPerPage,
                        search: search 
                    }
                });

                // Extrai os dados envelopados na estrutura que seu Model entrega
                const booksList = response.data.books || [];
                const totalOfPages = response.data.totalPages || 1;

                setBooks(booksList);
                setTotalPages(totalOfPages);
            } catch (error) {
                console.error("Erro ao carregar livros:", error);
                alert("Erro ao carregar o acervo.");
            } finally {
                setLoading(false);
                setUpdating(false); // 🔥 Desliga o indicador de transição
            }
        }

        const delayDebounceFn = setTimeout(() => {
            fetchBooks();
        }, search ? 300 : 0);

        return () => clearTimeout(delayDebounceFn);

    }, [currentPage, search]); 

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        setCurrentPage(1); // Reseta para a página 1 ao buscar
    };

    // Loading principal: Só aparece na primeira abertura da página
    if (loading) return <div className={styles.loading}>Carregando acervo...</div>;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Acervo Borrachalioteca</h1>
                <div className={styles.searchContainer}>
                    <input
                        type="text"
                        placeholder="Pesquisar por título ou autor..."
                        value={search}
                        onChange={handleSearchChange}
                        className={styles.searchBar}
                    />
                    {/* Indicador visual discreto perto da busca de que o app está trabalhando */}
                    {updating && <span className={styles.updatingText}>Atualizando...</span>}
                </div>
            </header>

            <div className={`${styles.grid} ${updating ? styles.gridUpdating : ''}`}>
                {books.length > 0 ? (
                    books.map(book => (
                        <div key={book.id} className={styles.card}>
                            <Link to={`/livro/${book.id}`} className={styles.detailsLink}>
                                <div className={styles.imageWrapper}>
                                    <img
                                        src={book.image_url || 'https://picsum.photos/seed/picsum/200/300'}
                                        alt={book.title}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://placehold.co/200x300?text=Sem+Capa';
                                        }}
                                    />
                                </div>
                                <div className={styles.info}>
                                    <h3>{book.title}</h3>
                                    <p className={styles.author}>{book.author}</p>
                                </div>
                            </Link>

                            <div className={styles.actions}>
                                <p className={styles.status}>
                                    Disponível: <span className={book.available > 0 ? styles.inStock : styles.outOfStock}>
                                        {book.available} / {book.total_copies}
                                    </span>
                                </p>
                                <button
                                    className={styles.btnLoan}
                                    disabled={book.available === 0 || updating}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // Lógica de empréstimo aqui
                                    }}
                                >
                                    {book.available > 0 ? 'Solicitar Empréstimo' : 'Indisponível'}
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className={styles.empty}>Nenhum livro encontrado.</p>
                )}
            </div>

            {/* ── COMPONENTE DE PAGINAÇÃO CORRIGIDO ────────────────────────────────── */}
            {books.length > 0 && (
                <div className={styles.paginationContainer}>
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1 || updating}
                        className={styles.pageBtn}
                    >
                        ◀ Anterior
                    </button>

                    <span className={styles.pageText}>
                        Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
                    </span>

                    <button
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        disabled={currentPage >= totalPages || updating}
                        className={styles.pageBtn}
                    >
                        Próxima ▶
                    </button>
                </div>
            )}
        </div>
    );
}

export default CatalogoPage;