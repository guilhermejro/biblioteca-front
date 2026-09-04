import React, { useState } from "react";
import styles from './AuthForm.module.css';

function AuthForm({ title, isRegister, onSubmitButton }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState({ type: '', message: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFeedback({ type: '', message: '' });
        setLoading(true);

        const payload = isRegister ? { name, email, password } : { email, password };

        try {
            // O handler pai envia a requisição e retorna o JSON padronizado
            const res = await onSubmitButton(payload);

            if (res && !res.success) {
                setFeedback({ type: 'error', message: res.message || 'Erro ao processar requisição.' });
            } else if (res && res.success) {
                setFeedback({ type: 'success', message: res.message || 'Operação realizada com sucesso!' });
            }
        } catch (err) {
            setFeedback({ 
                type: 'error', 
                message: err.response?.data?.message || 'Falha na conexão com o servidor.' 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.stage}>
            <div className={styles.lampGlow} aria-hidden="true"></div>

            <div className={styles.tab}>
                {isRegister ? 'CADASTRO · 002' : 'ACERVO · 001'}
            </div>

            <div className={styles.card}>
                <div className={styles.perf} aria-hidden="true">
                    <span></span><span></span><span></span><span></span><span></span>
                </div>

                <div className={styles.cardHead}>
                    <div>
                        <h1>{title || "Biblioteca Central"}</h1>
                        <div className={styles.sub}>
                            {isRegister ? 'Criação de nova credencial' : 'Acesso ao acervo'}
                        </div>
                    </div>
                    <div className={styles.regNo}>
                        Ficha Nº<br /><b>{isRegister ? '0001' : '0002'}</b>
                    </div>
                </div>

                <hr className={styles.rule} />

                {feedback.message && (
                    <div className={feedback.type === 'error' ? styles.errorMessage : styles.successMessage}>
                        {feedback.message}
                    </div>
                )}

                <form onSubmit={handleSubmit} autoComplete="off">
                    {isRegister && (
                        <div className={styles.field}>
                            <label htmlFor="name">Nome completo</label>
                            <input 
                                id="name"
                                type="text"
                                placeholder="Digite seu nome..."
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={loading}
                                required 
                            />
                        </div>
                    )}

                    <div className={styles.field}>
                        <label htmlFor="email">E-mail</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="seu.email@exemplo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                            required
                        />
                    </div>
                    
                    <div className={styles.field}>
                        <label htmlFor="password">Senha</label>
                        <input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                            required
                        />
                    </div>

                    <button type="submit" className={styles.submit} disabled={loading}>
                        {loading ? 'Aguarde...' : (isRegister ? 'Cadastrar' : 'Entrar')}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AuthForm;