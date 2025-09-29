import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // <--- 1. IMPORTE O HOOK
import '../styles/Login.css';
import api from '../services/api'; 

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // <--- 2. INICIE O HOOK

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); 
    setError('');

    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    try {
      const response = await api.post('/token', formData);
      console.log('Login bem-sucedido!', response.data);
      localStorage.setItem('token', response.data.access_token);
      
      navigate('/'); // <--- 3. REDIRECIONE PARA A PÁGINA PRINCIPAL

    } catch (err) {
      console.error('Erro no login:', err);
      setError('E-mail ou senha inválidos. Tente novamente.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h1>HUB do Torcedor</h1>
        <p>Faça login para continuar</p>
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">E-mail</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="password">Senha</label>
            <input 
              type="password" 
              id="password" 
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          {error && <p className="error-message">{error}</p>}
          
          <button type="submit" className="login-button">
            Entrar
          </button>
        </form>

        <div className="form-links">
          <a href="#">Não tem uma conta? Cadastre-se</a>
          <a href="#">Esqueceu a Senha?</a>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;