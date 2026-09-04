import React from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthForm from '../components/AuthForm';
import { authService } from "../services/authService";

function RegisterPage() {
    const navigate = useNavigate();

    const handleRegister = async (data) => {
        try {
            console.log("🚀 Dados enviados pelo formulário de registro:", data);
            const response = await authService.register(data); 
            
            const successMsg = response?.data?.message || response?.message || 'Cadastro realizado com sucesso! Agora faça seu login.';
            alert(successMsg);
            
            navigate('/login'); 
        } catch (error) {
            console.error("❌ Erro ao cadastrar:", error);
            const backendMessage = error.response?.data?.message || error.response?.data?.error || 'Erro ao cadastrar usuário.';
            alert(`Erro no cadastro: ${backendMessage}`);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
            <AuthForm 
               title="Criar Nova Conta"
               isRegister={true}
               onSubmitButton={handleRegister}
            />
            
            {/* Âncora para o usuário voltar para a tela de login */}
            <div style={{ marginTop: '15px', textAlign: 'center', fontSize: '14px' }}>
                <span>Já tem uma conta? </span>
                <Link 
                    to="/login" 
                    style={{ 
                        color: '#83bfff', 
                        textDecoration: 'none', 
                        fontWeight: 'bold' 
                    }}
                >
                    Faça login aqui
                </Link>
            </div>
        </div>
    );
}

export default RegisterPage;