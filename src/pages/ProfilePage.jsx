import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { loanService } from "../api/api";
import styles from './ProfilePage.module.css';

function ProfilePage() {
    const { user } = useContext(AuthContext);
    const [myLoans, setMyLoans] = useState([]);
    const [loadingLoans, setLoadingLoans] = useState(true);

    const [currentPage, setCurrentPage] = useState(1);
    const [hasMoreItems, setHasMoreItems] = useState(false);
    const limitPerPage = 10;

    useEffect(() => {
        async function fetchMyLoans() {
            if (!user) return;
            try {
                setLoadingLoans(true);

                const params = {
                    page: currentPage,
                    limit: limitPerPage
                };

                if (user.role?.toLowerCase() === 'member') {
                    params.member_id = user.id;
                }

                const response = await loanService.listLoans(params);

                const allLoans = response.loans || (Array.isArray(response) ? response : []);

                let filteredLoans = [];
                if (user.role?.toLowerCase() === 'librarian') {
                    filteredLoans = allLoans;
                } else {
                    filteredLoans = allLoans.filter(loan => {
                        const loanUserId = loan.member_id || loan.user_id || loan.userId;
                        return String(loanUserId) === String(user.id);
                    });
                }

                setMyLoans(filteredLoans);

                if (response.totalPages) {
                    setHasMoreItems(currentPage < response.totalPages);
                } else {
                    setHasMoreItems(allLoans.length >= limitPerPage);
                }

            } catch (error) {
                console.error("Erro ao buscar histórico de empréstimos:", error);
                setMyLoans([]);
                setHasMoreItems(false);
            } finally {
                setLoadingLoans(false);
            }
        }
        fetchMyLoans();
    }, [user?.id, user?.role, currentPage]);

    const renderStatusBadge = (status) => {
        const currentStatus = status?.toLowerCase();
        if (currentStatus === 'pending') return <span className={`${styles.badge} ${styles.pending}`}>PENDENTE</span>;
        if (currentStatus === 'active') return <span className={`${styles.badge} ${styles.active}`}>EM DIA</span>;
        if (currentStatus === 'returned') return <span className={`${styles.badge} ${styles.returned}`}>DEVOLVIDO</span>;
        if (currentStatus === 'overdue') return <span className={`${styles.badge} ${styles.overdue}`}>EM ATRASO</span>;
        return <span className={styles.badge}>{status?.toUpperCase()}</span>;
    };

    const handleReturnLoan = async (loanId) => {
        const confirmReturn = window.confirm("Deseja confirmar a devolução deste livro?");
        if (!confirmReturn) return;

        try {
            const response = await loanService.returnLoan(loanId);
            alert(response.data?.message || response.message || "Devolução registrada com sucesso!");

            setMyLoans(prevLoans =>
                prevLoans.map(loan =>
                    loan.id === loanId ? { ...loan, status: 'returned' } : loan
                )
            );
        } catch (error) {
            console.error("Erro ao registrar devolução:", error);
            alert(error.response?.data?.error || "Erro ao registrar devolução.");
        }
    };

    if (!user) return <p className={styles.loading}>Localizando ficha do leitor...</p>;

    return (
        <div className={styles.stage}>
            <div className={styles.lampGlow} aria-hidden="true"></div>

            {/* Cartão de Perfil do Usuário */}
            <div className={styles.tab}>REGISTRO DE MATRÍCULA</div>
            <div className={styles.profileCard}>
                <div className={styles.perf} aria-hidden="true">
                    <span></span><span></span><span></span>
                </div>
                <div className={styles.cardHeader}>
                    <h2>Ficha do Leitor</h2>
                    <span className={styles.regNo}>MATRÍCULA <b>#{String(user.id || '1').padStart(4, '0')}</b></span>
                </div>
                <hr className={styles.rule} />
                <div className={styles.profileDetails}>
                    <p><span>NOME:</span> <b>{user.name}</b></p>
                    <p><span>CORREIO:</span> <b>{user.email}</b></p>
                    <p><span>CATEGORIA:</span> <b>{user.role === 'librarian' ? 'Bibliotecário' : 'Leitor'}</b></p>
                </div>
            </div>

            {/* Seção da Tabela de Empréstimos */}
            <div className={styles.loansSection}>
                <div className={styles.sectionHeader}>
                    <h3>
                        {user.role === 'librarian' ? '📋 Painel Geral de Empréstimos & Reservas' : '📚 Livros em Posse & Histórico'}
                    </h3>
                </div>

                {loadingLoans ? (
                    <p className={styles.loading}>Consultando livros registrados...</p>
                ) : myLoans.length === 0 ? (
                    <p className={styles.emptyText}>
                        {user.role === 'librarian' ? 'Nenhum empréstimo registrado no sistema.' : 'Nenhum registro encontrado nesta ficha.'}
                    </p>
                ) : (
                    <>
                        <div className={styles.tableWrapper}>
                            <table className={styles.loansTable}>
                                <thead>
                                    <tr>
                                        <th>OBRA</th>
                                        {user.role === 'librarian' && <th>LEITOR</th>}
                                        <th>RETIRADA</th>
                                        <th>DEVOLUÇÃO</th>
                                        <th>SITUAÇÃO</th>
                                        {user.role === 'librarian' && <th>AÇÕES</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {myLoans.map((loan) => {
                                        const dataRetirada = loan.loan_date;
                                        const dataDevolucao = loan.return_date;
                                        const nomeUsuario = loan.user_name || `ID: ${loan.user_id || loan.member_id}`;
                                        const currentStatus = loan.status?.toLowerCase();

                                        return (
                                            <tr key={loan.id} className={currentStatus === 'overdue' ? styles.overdueRow : ''}>
                                                <td className={styles.bookTitle}>{loan.book_title}</td>

                                                {user.role === 'librarian' && <td>{nomeUsuario}</td>}

                                                <td>{dataRetirada ? new Date(dataRetirada).toLocaleDateString('pt-BR') : '---'}</td>
                                                <td>{dataDevolucao ? new Date(dataDevolucao).toLocaleDateString('pt-BR') : '---'}</td>
                                                <td>{renderStatusBadge(loan.status)}</td>

                                                {user.role === 'librarian' && (
                                                    <td>
                                                        {currentStatus === 'active' || currentStatus === 'overdue' ? (
                                                            <button
                                                                className={styles.returnBtn}
                                                                onClick={() => handleReturnLoan(loan.id)}
                                                            >
                                                                ↩ Devolver
                                                            </button>
                                                        ) : (
                                                            <span className={styles.disabledText}>Sem ações</span>
                                                        )}
                                                    </td>
                                                )}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className={styles.paginationContainer}>
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className={styles.pageBtn}
                            >
                                [ ◀ Página Anterior ]
                            </button>

                            <span className={styles.pageText}>
                                Folha <strong>{currentPage}</strong>
                            </span>

                            <button
                                onClick={() => setCurrentPage(prev => prev + 1)}
                                disabled={!hasMoreItems}
                                className={styles.pageBtn}
                            >
                                [ Próxima Página ▶ ]
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default ProfilePage;