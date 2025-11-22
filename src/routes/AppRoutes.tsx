// src/routes/AppRoutes.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { LoginPage } from "../pages/Auth/LoginPage";
import { RegisterPage } from "../pages/Auth/RegisterPage";
import { DashboardPage } from "../pages/Dashboard/DashboardPage";
import { ClassificacaoPage } from "../pages/Classificacao/ClassificacaoPage";
import { PerfilPage } from "../pages/Perfil/PerfilPage";
import { RankingPage } from "../pages/Ranking/RankingPage";

import { LojaPage } from "../pages/Loja/LojaPage";
import { ConfirmarCompraPage } from "../pages/Loja/ConfirmarCompraPage";
import { AbrirPacotePage } from "../pages/Loja/AbrirPacotePage";
import { ResultadoPacotePage } from "../pages/Loja/ResultadoPacotePage";

import { AlbumPage } from "../pages/Album/AlbumPage";

import { PrivateRoute } from "./PrivateRoute";

// *** IMPORTAÇÃO DA NOVA PÁGINA ***
import { PartidaPage } from "../pages/Partida/PartidaPage";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Dashboard */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />

        {/* Nova rota — Detalhes da Partida */}
        <Route
          path="/partida/:partidaId"
          element={
            <PrivateRoute>
              <PartidaPage />
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

        {/* Ranking */}
        <Route
          path="/ranking"
          element={
            <PrivateRoute>
              <RankingPage />
            </PrivateRoute>
          }
        />

        {/* Perfil */}
        <Route
          path="/perfil"
          element={
            <PrivateRoute>
              <PerfilPage />
            </PrivateRoute>
          }
        />

        {/* Loja principal */}
        <Route
          path="/loja"
          element={
            <PrivateRoute>
              <LojaPage />
            </PrivateRoute>
          }
        />

        {/* Fluxo de compra de pacotes */}
        <Route
          path="/loja/confirmar/:pacoteId"
          element={
            <PrivateRoute>
              <ConfirmarCompraPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/loja/abrir"
          element={
            <PrivateRoute>
              <AbrirPacotePage />
            </PrivateRoute>
          }
        />

        <Route
          path="/loja/resultado"
          element={
            <PrivateRoute>
              <ResultadoPacotePage />
            </PrivateRoute>
          }
        />

        {/* Álbum */}
        <Route
          path="/album"
          element={
            <PrivateRoute>
              <AlbumPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
