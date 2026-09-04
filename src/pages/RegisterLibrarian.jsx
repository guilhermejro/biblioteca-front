import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api"; 
import styles from './RegisterLibrarian.module.css';

function RegisterLibrarian() {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/register-librarian', formData);
            alert('Novo bibliotecário cadastrado com sucesso!');
            setFormData({ name: '', email: '', password: '' });
        } catch (error) {
            alert(error.response?.data?.error || 'Erro ao cadastrar. Você tem permissão de admin?');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.stage}>
            <div className={styles.lampGlow} aria-hidden="true"></div>

            <div className={styles.tab}>CADASTRO DE AUTORIDADE</div>
            <div className={styles.card}>
                <div className={styles.perf} aria-hidden="true">
                    <span></span><span></span><span></span>
                </div>

                <div className={styles.cardHeader}>
                    <h2>Novo Bibliotecário</h2>
                    <span className={styles.regNo}>REGISTRO DE ACESSO</span>
                </div>

                <div className={styles.adminActions}>
                    <Link to="/adicionar-livro" className={styles.btnLink}>
                        ➕ Adicionar Novo Livro
                    </Link>
                    <Link to="/gerenciar-usuarios" className={styles.btnLinkSecondary}>
                        👥 Gerenciar Usuários
                    </Link>
                </div>

                <hr className={styles.rule} />

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>NOME DO SERVIDOR</label>
                        <input 
                            type="text" 
                            placeholder="Nome completo" 
                            required
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>CORREIO ELETRÔNICO</label>
                        <input 
                            type="email" 
                            placeholder="email@biblioteca.com" 
                            required
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>CHAVE DE SEGURANÇA</label>
                        <input 
                            type="password" 
                            placeholder="••••••••" 
                            required
                            value={formData.password}
                            onChange={e => setFormData({...formData, password: e.target.value})}
                        />
                    </div>

                    <button type="submit" disabled={loading} className={styles.btnSubmit}>
                        {loading ? 'REGISTRANDO...' : '[ REGISTRAR BIBLIOTECÁRIO ]'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default RegisterLibrarian;