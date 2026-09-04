import React, { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthForm from '../components/AuthForm';
import { AuthContext } from "../contexts/AuthContext";

function LoginPage() {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    // Estado da mensagem de feedback repassado ao AuthForm
    const [flashMessage, setFlashMessage] = useState({ text: '', type: '' });

    const handleLogin = async (data) => {
        setFlashMessage({ text: '', type: '' });

        try {
            await login({ email: data.email, password: data.password });
            
            setFlashMessage({
                text: 'Login feito com sucesso!',
                type: 'success'
            });

            setTimeout(() => {
                navigate('/catalogo');
            }, 1000);

        } catch (error) {
            console.error("Erro no login:", error);
            const errorMsg = error.response?.data?.message || 'Erro ao fazer login. Verifique suas credenciais.';
            
            setFlashMessage({
                text: errorMsg,
                type: 'error'
            });
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
            <AuthForm  
                title="Acessar Biblioteca"
                isRegister={false}
                onSubmitButton={handleLogin}
                flashMessage={flashMessage}
            />
            
            <div style={{ marginTop: '15px', textAlign: 'center', fontSize: '14px' }}>
                <span>Não tem uma conta? </span>
                <Link 
                    to="/register" 
                    style={{ 
                        color: '#85bcf7', 
                        textDecoration: 'none', 
                        fontWeight: 'bold' 
                    }}
                >
                    Cadastre-se aqui
                </Link>
            </div>
        </div>
    );
}

export default LoginPage;