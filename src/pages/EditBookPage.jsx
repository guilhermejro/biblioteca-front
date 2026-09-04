import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import styles from './EditBookPage.module.css';

export default function EditBookPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        description: '',
        image_url: '',
        isbn: '',
        total_copies: 0,
        available: 0
    });

    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        api.get(`/books/${id}`)
            .then(res => {
                const livro = res.data?.data || res.data;
                setFormData({
                    title: livro.title || '',
                    author: livro.author || '',
                    description: livro.description || '',
                    image_url: livro.image_url || '',
                    isbn: livro.isbn || '',
                    total_copies: livro.total_copies ?? 0,
                    available: livro.available ?? 0
                });
                setLoading(false);
            })
            .catch(err => {
                console.error("Erro ao carregar livro:", err);
                const errorMsg = err.response?.data?.message || "Erro ao carregar dados do livro.";
                alert(errorMsg);
                navigate(-1);
            });
    }, [id, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUpdating(true);
        try {
            const payload = {
                title: formData.title,
                author: formData.author,
                description: formData.description,
                image_url: formData.image_url.trim() === '' ? null : formData.image_url,
                isbn: formData.isbn,
                total_copies: Number(formData.total_copies),
                available: Number(formData.available)
            };

            const response = await api.put(`/books/${id}`, payload);
            const successMsg = response.data?.message || 'Livro atualizado com sucesso!';
            alert(successMsg);
            
            navigate(`/livro/${id}`);
        } catch (error) {
            console.error("Erro ao atualizar livro:", error);
            const errorMsg = error.response?.data?.message || 'Erro ao atualizar livro.';
            alert(errorMsg);
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <p className={styles.loading}>Localizando ficha no arquivo...</p>;

    return (
        <div className={styles.stage}>
            <div className={styles.lampGlow} aria-hidden="true"></div>

            <div className={styles.tab}>ALTERAÇÃO DE REGISTRO</div>

            <div className={styles.container}>
                <div className={styles.perf} aria-hidden="true">
                    <span></span><span></span><span></span>
                </div>

                <h2 className={styles.title}>Editar Livro #{String(id).padStart(4, '0')}</h2>
                
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Título da Obra</label>
                        <input 
                            type="text" required
                            value={formData.title}
                            onChange={e => setFormData({...formData, title: e.target.value})}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Autoria</label>
                        <input 
                            type="text" required
                            value={formData.author}
                            onChange={e => setFormData({...formData, author: e.target.value})}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Código ISBN</label>
                        <input 
                            type="text"
                            value={formData.isbn}
                            onChange={e => setFormData({...formData, isbn: e.target.value})}
                        />
                    </div>

                    <div className={styles.inputRow}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Total de Exemplares</label>
                            <input 
                                type="number" min="0"
                                value={formData.total_copies}
                                onChange={e => setFormData({...formData, total_copies: e.target.value})}
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Exemplares Disponíveis</label>
                            <input 
                                type="number" min="0"
                                value={formData.available}
                                onChange={e => setFormData({...formData, available: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>URL da Capa (Imagem)</label>
                        <input 
                            type="text"
                            placeholder="https://exemplo.com/imagem.jpg"
                            value={formData.image_url}
                            onChange={e => setFormData({...formData, image_url: e.target.value})}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Descrição / Resenha</label>
                        <textarea 
                            rows="5"
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                        />
                    </div>

                    <div className={styles.actions}>
                        <button type="button" onClick={() => navigate(-1)} className={styles.btnCancel}>
                            [ CANCELAR ]
                        </button>
                        <button type="submit" disabled={updating} className={styles.btnSave}>
                            {updating ? 'ATUALIZANDO...' : '[ SALVAR ALTERAÇÕES ]'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}