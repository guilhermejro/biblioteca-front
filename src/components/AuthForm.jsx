import React, { useState } from "react";
import styles from './AuthForm.module.css';

function AuthForm({ title, isRegister, onSubmitButton }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (isRegister) {
            onSubmitButton({ name, email, password });
        } else { 
            onSubmitButton({ email, password });
        }
    };

    return (
        <div className={styles.stage}>
            {/* Brilho da luminária superior */}
            <div className={styles.lampGlow} aria-hidden="true"></div>

            {/* Aba do fichário */}
            <div className={styles.tab}>
                {isRegister ? 'CADASTRO · 002' : 'ACERVO · 001'}
            </div>

            {/* Cartão principal / Ficha */}
            <div className={styles.card}>
                {/* Perfurações estilizadas */}
                <div className={styles.perf} aria-hidden="true">
                    <span></span><span></span><span></span><span></span><span></span>
                </div>

                {/* Cabeçalho */}
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

                {/* Formulário */}
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
                            required
                        />
                    </div>

                    <button type="submit" className={styles.submit}>
                        {isRegister ? 'Cadastrar' : 'Entrar'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AuthForm;