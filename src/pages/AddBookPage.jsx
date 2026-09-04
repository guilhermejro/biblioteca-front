import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import styles from './AddBookPage.module.css';

export default function AddBookPage() {
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        description: '',
        image_url: '',
        isbn: '',
        total_copies: 1
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const payload = {
                ...formData,
                total_copies: Number(formData.total_copies)
            };

            const response = await api.post('/books', payload);
            
            // Captura a mensagem padronizada do backend (res.data.message)
            const successText = response.data?.message || 'REGISTRO CATALOGADO COM SUCESSO!';
            setMessage({ type: 'success', text: successText });
            
            setFormData({ title: '', author: '', description: '', image_url: '', isbn: '', total_copies: 1 });
        } catch (error) {
            console.error(error);
            
            // Leitura ajustada para 'message' conforme o contrato da API
            const errorText = error.response?.data?.message || 'FALHA NO CADASTRO. VERIFIQUE OS DADOS.';
            setMessage({ 
                type: 'error', 
                text: errorText 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.stage}>
            <div className={styles.lampGlow} aria-hidden="true"></div>

            <div className={styles.tab}>ENTRADA DE ACERVO</div>
            <div className={styles.card}>
                <div className={styles.perf} aria-hidden="true">
                    <span></span><span></span><span></span>
                </div>

                <div className={styles.cardHeader}>
                    <h2>Novo Livro</h2>
                    <span className={styles.regNo}>CATÁLOGO OFICIAL</span>
                </div>

                <div className={styles.adminActions}>
                    <Link to="/gerenciar-usuarios" className={styles.btnLinkSecondary}>
                        👥 Gerenciar Usuários
                    </Link>
                    <Link to="/admin/novo-bibliotecario" className={styles.btnLinkSecondary}>
                        👤 Cadastrar Bibliotecário
                    </Link>
                </div>

                <hr className={styles.rule} />

                {message.text && (
                    <div className={message.type === 'success' ? styles.success : styles.error}>
                        [{message.text}]
                    </div>
                )}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>TÍTULO DA OBRA</label>
                        <input
                            type="text" 
                            required
                            placeholder="Nome completo do livro"
                            value={formData.title}
                            disabled={loading}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>AUTORIA</label>
                        <input
                            type="text" 
                            required
                            placeholder="Nome do autor ou entidade"
                            value={formData.author}
                            disabled={loading}
                            onChange={e => setFormData({ ...formData, author: e.target.value })}
                        />
                    </div>

                    <div className={styles.gridTwoCols}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>CÓDIGO ISBN</label>
                            <input
                                type="text"
                                placeholder="978-85-..."
                                value={formData.isbn || ''} 
                                disabled={loading}
                                onChange={e => setFormData({ ...formData, isbn: e.target.value })}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>EXEMPLARES</label>
                            <input
                                type="number" 
                                min="1" 
                                required
                                value={formData.total_copies}
                                disabled={loading}
                                onChange={e => setFormData({ ...formData, total_copies: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>URL DA CAPA (IMAGEM)</label>
                        <input
                            type="text"
                            placeholder="https://exemplo.com/imagem.jpg"
                            value={formData.image_url}
                            disabled={loading}
                            onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>DESCRIÇÃO / SINOPSE</label>
                        <textarea
                            rows="4"
                            placeholder="Resumo ou observações do acervo..."
                            value={formData.description}
                            disabled={loading}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <button type="submit" disabled={loading} className={styles.btnSubmit}>
                        {loading ? 'CATALOGANDO...' : '[ CADASTRAR LIVRO ]'}
                    </button>
                </form>
            </div>
        </div>
    );
}