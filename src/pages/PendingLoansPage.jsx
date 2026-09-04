import React, { useEffect, useState } from "react";
import { loanService } from "../api/api";
import styles from "./PendingLoansPage.module.css"; 

function PendingLoansPage() {
    const [pendingLoans, setPendingLoans] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadPendingLoans = async () => {
        try {
            setLoading(true);
            
            const response = await loanService.listLoans({ page: 1, limit: 50 });
            const allLoans = response.loans || (Array.isArray(response) ? response : []);
            
            const pending = allLoans.filter(loan => 
                loan.status?.toLowerCase() === 'pending'
            );
            
            setPendingLoans(pending);
        } catch (error) {
            console.error("Erro ao carregar reservas:", error);
            alert("Não foi possível carregar a lista de reservas.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPendingLoans();
    }, []);

    const handleApprove = async (loanId) => {
        if (!window.confirm("Tem certeza que deseja aprovar e ativar este empréstimo?")) {
            return;
        }

        try {
            await loanService.approveLoan(loanId);
            alert("Reserva aprovada e empréstimo ativado com sucesso!");
            setPendingLoans(prevLoans => prevLoans.filter(loan => loan.id !== loanId));
        } catch (error) {
            console.error("Erro ao aprovar:", error);
            const msg = error.response?.data?.error || "Erro ao aprovar o empréstimo.";
            alert(msg);
        }
    };

    const handleReject = async (loanId) => {
        if (!window.confirm("Tem certeza que deseja RECUSAR esta solicitação de reserva?")) {
            return;
        }

        try {
            await loanService.rejectLoan(loanId);
            alert("Solicitação de reserva recusada com sucesso.");
            setPendingLoans(prevLoans => prevLoans.filter(loan => loan.id !== loanId));
        } catch (error) {
            console.error("Erro ao recusar reserva:", error);
            const msg = error.response?.data?.error || "Erro ao recusar a reserva.";
            alert(msg);
        }
    };

    if (loading) {
        return (
            <div className={styles.stage}>
                <p className={styles.loading}>Consultando solicitações de reserva pendentes...</p>
            </div>
        );
    }

    return (
        <div className={styles.stage}>
            <div className={styles.lampGlow} aria-hidden="true"></div>

            <div className={styles.tab}>ARQUIVO DE REQUISIÇÕES</div>
            <div className={styles.archiveCard}>
                <div className={styles.perf} aria-hidden="true">
                    <span></span><span></span><span></span>
                </div>

                <div className={styles.cardHeader}>
                    <h2>📋 Solicitações Pendentes</h2>
                    <span className={styles.regNo}>SITUAÇÃO: <b>AGUARDANDO DESPACHO</b></span>
                </div>

                <hr className={styles.rule} />

                {pendingLoans.length === 0 ? (
                    <div className={styles.emptyState}>
                        <p className={styles.emptyText}>Nenhuma requisição de reserva aguardando análise no momento.</p>
                    </div>
                ) : (
                    <div className={styles.tableWrapper}>
                        <table className={styles.tableContainer}>
                            <thead>
                                <tr className={styles.tableHeader}>
                                    <th>CÓD.</th>
                                    <th>OBRA</th>
                                    <th>REQUISITANTE</th>
                                    <th>DATA DA PEDIDO</th>
                                    <th className={styles.textCenter}>DESPACHO</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingLoans.map((loan) => (
                                    <tr key={loan.id} className={styles.tableRow}>
                                        <td className={styles.tableCell}>#{String(loan.id).padStart(3, '0')}</td>
                                        <td className={`${styles.tableCell} ${styles.bookTitle}`}>
                                            {loan.book_title || loan.Book?.title || `Livro ID: ${loan.book_id}`}
                                        </td>
                                        <td className={styles.tableCell}>
                                            {loan.user_name || loan.member_name || loan.Member?.name || `Membro ID: ${loan.member_id}`}
                                        </td>
                                        <td className={styles.tableCell}>
                                            {loan.loan_date || loan.created_at || loan.createdAt 
                                                ? new Date(loan.loan_date || loan.created_at || loan.createdAt).toLocaleDateString('pt-BR') 
                                                : '---'}
                                        </td>
                                        <td className={`${styles.tableCell} ${styles.textCenter}`}>
                                            <div className={styles.actionGroup}>
                                                <button
                                                    onClick={() => handleApprove(loan.id)}
                                                    className={styles.approveButton}
                                                >
                                                    ✓ Aprovar
                                                </button>
                                                <button
                                                    onClick={() => handleReject(loan.id)}
                                                    className={styles.rejectButton}
                                                >
                                                    ✕ Recusar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PendingLoansPage;