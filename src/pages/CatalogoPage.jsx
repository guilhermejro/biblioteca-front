import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import styles from './CatalogoPage.module.css';

function CatalogoPage() {
    const navigate = useNavigate();

    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [search, setSearch] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limitPerPage = 50; 

    useEffect(() => {
        async function fetchBooks() {
            try {
                if (books.length === 0) setLoading(true);
                else setUpdating(true);
                
                const response = await api.get('/books', {
                    params: {
                        page: currentPage,
                        limit: limitPerPage,
                        search: search 
                    }
                });

                // Trata res.data.books, res.data.data (com paginação) ou res.data como array simples
                const payload = response.data;
                const booksList = payload.books || payload.data || (Array.isArray(payload) ? payload : []);
                const totalOfPages = payload.totalPages || payload.pagination?.totalPages || 1;

                setBooks(booksList);
                setTotalPages(totalOfPages);
            } catch (error) {
                console.error("Erro ao carregar livros:", error);
            } finally {
                setLoading(false);
                setUpdating(false);
            }
        }

        const delayDebounceFn = setTimeout(() => {
            fetchBooks();
        }, search ? 300 : 0);

        return () => clearTimeout(delayDebounceFn);

    }, [currentPage, search]); 

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        setCurrentPage(1);
    };

    if (loading) return <div className={styles.loading}>Consultando Arquivo...</div>;

    return (
        <div className={styles.stage}>
            <div className={styles.lampGlow} aria-hidden="true"></div>

            <header className={styles.header}>
                <div className={styles.tab}>CONSULTA AO ACERVO · 800</div>
                
                <div className={styles.searchBox}>
                    <label htmlFor="search" className={styles.searchLabel}>Busca por Título ou Autor</label>
                    <input
                        id="search"
                        type="text"
                        placeholder="Digite o termo para pesquisar..."
                        value={search}
                        onChange={handleSearchChange}
                        className={styles.searchBar}
                    />
                    {updating && <span className={styles.updatingText}>Buscando ficha...</span>}
                </div>
            </header>

            <div className={`${styles.grid} ${updating ? styles.gridUpdating : ''}`}>
                {books.length > 0 ? (
                    books.map((book, index) => (
                        <div key={book.id || index} className={styles.card}>
                            {/* Perfuração no topo de cada ficha */}
                            <div className={styles.perf} aria-hidden="true">
                                <span></span><span></span><span></span>
                            </div>

                            <div className={styles.cardHeader}>
                                <span className={styles.regNo}>
                                    REG. <b>#{String(book.id || index + 1).padStart(4, '0')}</b>
                                </span>
                            </div>

                            <Link to={`/livro/${book.id}`} className={styles.detailsLink}>
                                <div className={styles.imageWrapper}>
                                    <img
                                        src={book.image_url || 'https://placehold.co/200x300/f4ecd8/241d12?text=Sem+Capa'}
                                        alt={book.title}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://placehold.co/200x300/f4ecd8/241d12?text=Sem+Capa';
                                        }}
                                    />
                                </div>
                                <div className={styles.info}>
                                    <h3>{book.title}</h3>
                                    <p className={styles.author}>{book.author}</p>
                                </div>
                            </Link>

                            <hr className={styles.rule} />

                            <div className={styles.actions}>
                                <p className={styles.status}>
                                    Exemplares: <span className={book.available > 0 ? styles.inStock : styles.outOfStock}>
                                        {book.available} / {book.total_copies}
                                    </span>
                                </p>
                                <button
                                    className={styles.btnLoan}
                                    disabled={book.available === 0 || updating}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/livro/${book.id}`);
                                    }}
                                >
                                    {book.available > 0 ? 'Ver Detalhes / Solicitar' : 'Indisponível'}
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className={styles.empty}>Nenhuma ficha encontrada no acervo.</p>
                )}
            </div>

            {books.length > 0 && totalPages > 1 && (
                <div className={styles.paginationContainer}>
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1 || updating}
                        className={styles.pageBtn}
                    >
                        [ ◀ Ficha Anterior ]
                    </button>

                    <span className={styles.pageText}>
                        Gaveta <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
                    </span>

                    <button
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        disabled={currentPage >= totalPages || updating}
                        className={styles.pageBtn}
                    >
                        [ Próxima Ficha ▶ ]
                    </button>
                </div>
            )}
        </div>
    );
}

export default CatalogoPage;