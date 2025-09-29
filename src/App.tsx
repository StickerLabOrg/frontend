import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/Login';
import DashboardPage from './pages/Dashboard';

// Função simples para verificar se o token existe
const isAuthenticated = () => {
  return localStorage.getItem('token') !== null;
};

// Componente para proteger rotas
const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  return isAuthenticated() ? children : <Navigate to="/login" />;
};


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* A rota de login será pública */}
        <Route path="/login" element={<LoginPage />} />

        {/* A rota principal (Dashboard) será protegida */}
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
  )
}

export default App;