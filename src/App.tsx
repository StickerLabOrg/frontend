import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/Login';
import DashboardPage from './pages/Dashboard';
import './styles/global.css'; // Importa estilos globais

// Função para verificar se o token existe
const isAuthenticated = () => {
  return localStorage.getItem('token') !== null;
};

// Componente para proteger rotas
const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  return isAuthenticated() ? children : <Navigate to="/login" />;
};

function App() {
  const [user, setUser] = useState(null);

  // Esta função será chamada pelo Login.tsx
  const handleLogin = () => {
    // Por enquanto, apenas simula a busca de dados do usuário
    if (isAuthenticated()) {
      setUser({ nome: "Usuário Logado" }); // Define um usuário mock
    }
  };

  // Simula a busca de dados do usuário se a página for recarregada
  useEffect(() => {
    if (isAuthenticated()) {
      handleLogin();
    }
  }, []);

  return (
    <BrowserRouter> {/* O Roteador DEVE estar aqui fora */}
      <Routes>
        <Route 
          path="/login" 
          element={<LoginPage onLogin={handleLogin} />} // Passa a função para o Login
        />
        <Route 
          path="/" 
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

