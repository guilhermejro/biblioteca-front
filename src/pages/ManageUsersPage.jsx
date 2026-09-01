import React, { useEffect, useState } from "react";
import api from "../api/api"; 
import styles from "./ManageUsersPage.module.css";

function ManageUsersPage() {
    const [users, setUsers] = useState([]);
    const [selectedUserLoans, setSelectedUserLoans] = useState(null);
    const [selectedUserName, setSelectedUserName] = useState("");
    const [loading, setLoading] = useState(true);
    const [modalLoading, setModalLoading] = useState(false);

    // --- ESTADOS PARA EDIÇÃO (Senha adicionada no objeto) ---
    const [editingUser, setEditingUser] = useState(null); 
    const [editForm, setEditForm] = useState({ name: "", email: "", password: "" });
    const [editLoading, setEditLoading] = useState(false);

    // 1. Carrega todos os usuários ao abrir a página (GET /users)
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get("/users");
            setUsers(response.data);
        } catch (error) {
            alert(error.response?.data?.error || "Erro ao carregar lista de usuários.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // 2. Carrega o histórico utilizando a rota de loans com filtros
    const handleViewLoans = async (id, name) => {
        try {
            setModalLoading(true);
            setSelectedUserName(name);
            setSelectedUserLoans([]); 
            
            const response = await api.get(`/loans`, { params: { member_id: id, limit: 100 } });
            const loansList = response.data.loans || (Array.isArray(response.data) ? response.data : []);
            setSelectedUserLoans(loansList);
        } catch (error) {
            alert(error.response?.data?.error || "Erro ao buscar histórico.");
            setSelectedUserLoans(null);
        } finally {
            setModalLoading(false);
        }
    };

    // 3. Atualiza o cargo do usuário no sistema (PUT /users/:id)
    const handleUpdateRole = async (id, currentRole, name) => {
        const newRole = currentRole === "member" ? "librarian" : "member";
        const roleText = newRole === "member" ? "Leitor" : "Bibliotecário";
        
        if (!window.confirm(`Tem certeza que deseja alterar o cargo de ${name} para "${roleText}"?`)) return;

        try {
            const response = await api.put(`/users/${id}`, { role: newRole });
            alert(response.data.message || "Cargo atualizado com sucesso!");
            
            setUsers(prevUsers => 
                prevUsers.map(user => user.id === id ? { ...user, role: newRole } : user)
            );
        } catch (error) {
            alert(error.response?.data?.error || "Não foi possível atualizar o cargo do usuário.");
        }
    };

    // --- Abre o modal de edição limpando a senha por segurança ---
    const handleOpenEditModal = (user) => {
        setEditingUser(user);
        setEditForm({ name: user.name, email: user.email, password: "" });
    };

    // --- Envia os dados atualizados para o backend (com tratamento para senha opcional) ---
    const handleSaveUserEdit = async (e) => {
        e.preventDefault();
        if (!editForm.name.trim() || !editForm.email.trim()) {
            alert("Por favor, preencha o nome e o e-mail.");
            return;
        }

        // Monta o corpo da requisição padrão
        const payload = {
            name: editForm.name,
            email: editForm.email
        };

        // Só envia o campo password se o bibliotecário digitou alguma coisa
        if (editForm.password.trim() !== "") {
            if (editForm.password.length < 6) {
                alert("A nova senha deve ter pelo menos 6 caracteres.");
                return;
            }
            payload.password = editForm.password;
        }

        try {
            setEditLoading(true);
            const response = await api.put(`/users/${editingUser.id}`, payload);

            alert(response.data.message || "Usuário atualizado com sucesso! 🎉");

            // Atualiza o estado local para sincronizar a tabela imediatamente
            setUsers(prevUsers => 
                prevUsers.map(user => user.id === editingUser.id ? { ...user, name: editForm.name, email: editForm.email } : user)
            );
            
            setEditingUser(null); // Fecha o modal
        } catch (error) {
            alert(error.response?.data?.error || "Não foi possível atualizar os dados do usuário.");
        } finally {
            setEditLoading(false);
        }
    };

    // 4. Remove o usuário do sistema (DELETE /users/:id)
    const handleDeleteUser = async (id, name) => {
        if (!window.confirm(`Tem certeza que deseja remover o usuário ${name}?`)) return;

        try {
            const response = await api.delete(`/users/${id}`);
            alert(response.data.message || "Usuário removido com sucesso!");
            setUsers(users.filter(user => user.id !== id));
        } catch (error) {
            alert(error.response?.data?.error || "Não foi possível remover o usuário.");
        }
    };

    if (loading) return <div className={styles.loading}>Carregando usuários...</div>;

    return (
        <div className={styles.container}>
            <h2>Gerenciamento de Usuários</h2>

            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nome</th>
                        <th>E-mail</th>
                        <th>Cargo</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>
                                <span className={user.role === "admin" || user.role === "librarian" ? styles.badgeStaff : styles.badgeMember}>
                                    {user.role === "librarian" ? "Bibliotecário" : user.role === "member" ? "Leitor" : user.role}
                                </span>
                            </td>
                            <td>
                                <div className={styles.actionGroup}>
                                    <button 
                                        className={styles.btnInfo} 
                                        onClick={() => handleViewLoans(user.id, user.name)}
                                        title="Ver Histórico de Empréstimos"
                                    >
                                        🔍 Histórico
                                    </button>
                                    
                                    <button 
                                        className={styles.btnEdit} 
                                        onClick={() => handleOpenEditModal(user)}
                                        title="Editar Informações do Usuário"
                                    >
                                        ✏️ Editar
                                    </button>

                                    <button 
                                        className={styles.btnToggleRole} 
                                        onClick={() => handleUpdateRole(user.id, user.role, user.name)}
                                        title="Alternar Permissão do Usuário"
                                    >
                                        🔄 Cargo
                                    </button>

                                    <button 
                                        className={styles.btnDelete} 
                                        onClick={() => handleDeleteUser(user.id, user.name)}
                                        title="Excluir Usuário"
                                    >
                                        🗑️ Excluir
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* --- MODAL DE EDIÇÃO DE CADASTRO COM SENHA --- */}
            {editingUser !== null && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h3>Editar Cadastro do Usuário</h3>
                        <p className={styles.subtitle}>Alterando dados de ID: {editingUser.id}</p>
                        
                        <form onSubmit={handleSaveUserEdit} className={styles.editForm}>
                            <div className={styles.formGroup}>
                                <label htmlFor="edit-name">Nome:</label>
                                <input 
                                    id="edit-name"
                                    type="text" 
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    disabled={editLoading}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="edit-email">E-mail:</label>
                                <input 
                                    id="edit-email"
                                    type="email" 
                                    value={editForm.email}
                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                    disabled={editLoading}
                                    required
                                />
                            </div>

                            {/* 🔥 CAMPO DE SENHA OPCIONAL ADICIONADO AQUI */}
                            <div className={styles.formGroup}>
                                <label htmlFor="edit-password">Nova Senha:</label>
                                <input 
                                    id="edit-password"
                                    type="password" 
                                    placeholder="Deixe em branco para não alterar"
                                    value={editForm.password}
                                    onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                                    disabled={editLoading}
                                />
                                <small className={styles.inputHelp}>Mínimo de 6 caracteres.</small>
                            </div>

                            <div className={styles.modalActions}>
                                <button 
                                    type="button" 
                                    className={styles.btnCancel} 
                                    onClick={() => setEditingUser(null)}
                                    disabled={editLoading}
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit" 
                                    className={styles.btnSave}
                                    disabled={editLoading}
                                >
                                    {editLoading ? "Salvando..." : "Salvar Alterações"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL DE HISTÓRICO DE EMPRÉSTIMOS */}
            {selectedUserLoans !== null && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h3>Histórico de {selectedUserName}</h3>
                        <button className={styles.btnCloseModal} onClick={() => setSelectedUserLoans(null)}>❌ Fechar</button>
                        
                        {modalLoading ? (
                            <p>Carregando histórico...</p>
                        ) : selectedUserLoans.length === 0 ? (
                            <p className={styles.noLoans}>Este usuário nunca pegou livros emprestados.</p>
                        ) : (
                            <div className={styles.modalTableContainer}>
                                <table className={styles.modalTable}>
                                    <thead>
                                        <tr>
                                            <th>Livro</th>
                                            <th>Data Empréstimo</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedUserLoans.map((loan) => {
                                            const bookTitle = loan.book_title || `Livro ID: ${loan.book_id}`;
                                            const loanDate = loan.loan_date;
                                            const statusLower = loan.status?.toLowerCase();

                                            return (
                                                <tr key={loan.id}>
                                                    <td>{bookTitle}</td>
                                                    <td>{loanDate ? new Date(loanDate).toLocaleDateString('pt-BR') : '---'}</td>
                                                    <td>
                                                        <span className={
                                                            statusLower === 'active' ? styles.statusActive : 
                                                            statusLower === 'overdue' ? styles.statusOverdue : 
                                                            styles.statusReturned
                                                        }>
                                                            {statusLower === 'active' && 'Em aberto'}
                                                            {statusLower === 'overdue' && 'Atrasado ⚠️'}
                                                            {statusLower === 'returned' && 'Devolvido'}
                                                            {statusLower === 'pending' && 'Pendente'}
                                                            {statusLower === 'rejected' && 'Recusado'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default ManageUsersPage;