import { BrowserRouter, Routes, Route } from "react-router-dom";

import { LoginPage } from "../pages/Auth/LoginPage";
import { RegisterPage } from "../pages/Auth/RegisterPage";
import { DashboardPage } from "../pages/Dashboard/DashboardPage";
import { ClassificacaoPage } from "../pages/Classificacao/ClassificacaoPage"; 
import { PrivateRoute } from "./PrivateRoute";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Rotas privadas */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />

        {/* Classificação */}
        <Route
          path="/classificacao"
          element={
            <PrivateRoute>
              <ClassificacaoPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
