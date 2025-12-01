// src/pages/Perfil/PerfilPage.tsx
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { API_BASE } from "../../config/api";

import { AppLayout } from "../../layout/AppLayout";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { ModalAlterarSenha } from "../Perfil/ModalAlterarSenha";

import {
  Target,
  Sticker,
  Activity,
  Sparkles,
  ChevronRight,
} from "lucide-react";

/* ------------------------------------------------------------------
   TIPOS
------------------------------------------------------------------- */

type PerfilResponse = {
  id: number;
  nome: string;
  email: string;
  time_do_coracao: string;
  coins: number;

  total_figurinhas: number;
  progresso_album: number;
  total_palpites: number;
  taxa_acerto: number;
};

/* ------------------------------------------------------------------
   COMPONENTE
------------------------------------------------------------------- */

export function PerfilPage() {
  const [perfil, setPerfil] = useState<PerfilResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  /* --------------------------------------------------------------
     CARREGA TODAS AS MÉTRICAS USANDO APENAS O FRONT-END
  ---------------------------------------------------------------- */
  async function fetchPerfil() {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        setError("Você precisa estar autenticado para ver o perfil.");
        setLoading(false);
        return;
      }

      // 1) INFO BÁSICA DO USUÁRIO
      const resp = await axios.get(`${API_BASE}/usuarios/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const base = resp.data;

      // 2) FIGURINHAS
      const figsResp = await axios.get(
        `${API_BASE}/colecao/minhas-figurinhas`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const figurinhas = figsResp.data ?? [];
      const totalFigurinhas = figurinhas.length;

      // 3) PROGRESSO DO ÁLBUM
      const albumResp = await axios.get(
        `${API_BASE}/colecao/album`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const progressoAlbum = albumResp.data?.progresso ?? 0;

      // 4) PALPITES (MESMO ENDPOINT DO DASHBOARD)
      const palpitesResp = await axios.get(
        `${API_BASE}/palpites`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const palpites = palpitesResp.data ?? [];
      const totalPalpites = palpites.length;

      const acertos = palpites.filter((p: any) => p.acertou === true).length;
      const taxaAcerto =
        totalPalpites > 0
          ? Number(((acertos / totalPalpites) * 100).toFixed(1))
          : 0;

      // 5) SET FINAL
      setPerfil({
        ...base,
        total_figurinhas: totalFigurinhas,
        progresso_album: progressoAlbum,
        total_palpites: totalPalpites,
        taxa_acerto: taxaAcerto,
      });
    } catch (err) {
      console.error("Erro ao carregar perfil:", err);
      setError("Não foi possível carregar seu perfil no momento.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPerfil();
  }, []);

  const avatarInicial = perfil?.nome?.[0]?.toUpperCase() ?? "T";

  // mini gráfico animado
  const desempenhoData = useMemo(() => {
    if (!perfil) return [20, 30, 40, 50, 60];

    const ac = perfil.taxa_acerto;
    const prog = perfil.progresso_album;

    return [
      Math.max(10, ac - 20),
      Math.max(10, ac - 5),
      Math.round((ac + prog) / 2),
      Math.min(95, ac + 3),
      Math.min(95, ac + 8),
    ];
  }, [perfil]);

  const svgPoints = useMemo(() => {
    const width = 260;
    const height = 80;
    const max = Math.max(...desempenhoData, 1);

    return desempenhoData
      .map((val, i) => {
        const x =
          desempenhoData.length === 1
            ? width / 2
            : (i / (desempenhoData.length - 1)) * width;
        const y = height - (val / max) * 60 - 10;
        return `${x},${y}`;
      })
      .join(" ");
  }, [desempenhoData]);

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto w-full space-y-8 px-3 md:px-0">
        <header className="animate-fade-slide-up">
          <h1 className="text-4xl font-bold text-primary mb-1">Meu Perfil</h1>
          <p className="text-mutedForeground">
            Visualize seus dados, estatísticas e progresso no álbum.
          </p>
        </header>

        {loading && <p className="text-gray-300">Carregando...</p>}
        {error && <p className="text-red-400">{error}</p>}

        {!loading && !error && perfil && (
          <>
            {/* CARD PRINCIPAL */}
            <Card className="bg-white/5 border border-white/10 rounded-2xl shadow-xl backdrop-blur-xl animate-fade-slide-up">
              <CardContent className="p-8 flex flex-col items-center gap-6">
                <div className="h-28 w-28 rounded-full bg-emerald-700/40 flex items-center justify-center text-4xl font-bold text-emerald-300 shadow-lg shadow-emerald-500/20 hover:scale-105 hover:shadow-emerald-500/40 transition-all duration-300">
                  {avatarInicial}
                </div>

                <div className="text-center space-y-1">
                  <h2 className="text-3xl font-semibold">{perfil.nome}</h2>
                  <p className="text-sm text-gray-300">{perfil.email}</p>

                  <p className="text-sm text-emerald-400 font-medium">
                    Time do Coração:{" "}
                    <span className="font-semibold">
                      {perfil.time_do_coracao}
                    </span>
                  </p>

                  <Button
                    onClick={() => setIsModalOpen(true)}
                    className="mt-2 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold"
                  >
                    Alterar Senha
                  </Button>
                </div>

                <div className="flex items-center justify-center gap-12 pt-4 flex-wrap">
                  <div className="text-center">
                    <Sticker className="mx-auto mb-1 text-emerald-400" />
                    <p className="text-xs text-gray-400">Figurinhas</p>
                    <p className="text-lg font-bold text-emerald-400">
                      {perfil.total_figurinhas}
                    </p>
                  </div>

                  <div className="text-center">
                    <Activity className="mx-auto mb-1 text-emerald-400" />
                    <p className="text-xs text-gray-400">Palpites</p>
                    <p className="text-lg font-bold text-emerald-400">
                      {perfil.total_palpites}
                    </p>
                  </div>

                  <div className="text-center">
                    <Target className="mx-auto mb-1 text-emerald-400" />
                    <p className="text-xs text-gray-400">Taxa de Acerto</p>
                    <p className="text-lg font-bold text-emerald-400">
                      {perfil.taxa_acerto.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CARTEIRA + DESEMPENHO */}
            <section className="grid gap-4 md:grid-cols-2 animate-fade-slide-up">
              <Card className="bg-white/5 border border-white/10 rounded-2xl shadow-md hover:bg-white/10 transition">
                <CardContent className="p-5">
                  <p className="text-xs uppercase tracking-wide text-gray-400">
                    Carteira Virtual
                  </p>
                  <p className="mt-2 text-3xl font-bold text-emerald-400">
                    {perfil.coins}
                  </p>
                  <p className="text-xs text-gray-400">
                    Moedas disponíveis na loja.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border border-white/10 rounded-2xl shadow-md hover:bg-white/10 transition">
                <CardContent className="p-5">
                  <p className="text-xs uppercase tracking-wide text-gray-400">
                    Desempenho Geral
                  </p>

                  <p className="mt-2 text-2xl font-bold text-emerald-400">
                    {perfil.taxa_acerto.toFixed(1)}%
                  </p>

                  <svg viewBox="0 0 260 80" className="w-full h-16 mt-2">
                    <line
                      x1="0"
                      y1="70"
                      x2="260"
                      y2="70"
                      stroke="rgba(148,163,184,0.35)"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                    <polyline
                      fill="none"
                      stroke="rgba(16,185,129,0.5)"
                      strokeWidth="3"
                      points={svgPoints}
                    />
                  </svg>
                </CardContent>
              </Card>
            </section>

            {/* ESTATÍSTICAS DETALHADAS */}
            <section className="space-y-3 animate-fade-slide-up">
              <h2 className="text-xl font-semibold text-white text-center">
                Estatísticas Detalhadas
              </h2>

              <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                <Card className="bg-white/5 rounded-xl shadow-sm hover:bg-white/10 transition">
                  <CardContent className="p-4 text-center space-y-1">
                    <p className="text-xs text-gray-400">Figurinhas</p>
                    <p className="text-xl font-bold text-emerald-400">
                      {perfil.total_figurinhas}
                    </p>
                    <p className="text-[11px] text-gray-500">Na coleção</p>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 rounded-xl shadow-sm hover:bg-white/10 transition">
                  <CardContent className="p-4 text-center space-y-1">
                    <p className="text-xs text-gray-400">Álbum</p>
                    <p className="text-xl font-bold text-emerald-400">
                      {perfil.progresso_album.toFixed(1)}%
                    </p>

                    <div className="w-full h-1 bg-white/10 rounded-full">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${perfil.progresso_album}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-gray-500">Progresso total</p>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 rounded-xl shadow-sm hover:bg-white/10 transition">
                  <CardContent className="p-4 text-center space-y-1">
                    <p className="text-xs text-gray-400">Palpites</p>
                    <p className="text-xl font-bold text-emerald-400">
                      {perfil.total_palpites}
                    </p>
                    <p className="text-[11px] text-gray-500">Total realizados</p>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 rounded-xl shadow-sm hover:bg-white/10 transition">
                  <CardContent className="p-4 text-center space-y-1">
                    <p className="text-xs text-gray-400">Acertos</p>
                    <p className="text-xl font-bold text-emerald-400">
                      {perfil.taxa_acerto.toFixed(1)}%
                    </p>
                    <p className="text-[11px] text-gray-500">Precisão</p>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* ATIVIDADE RECENTE */}
            <section className="space-y-2 animate-fade-slide-up">
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <h2 className="text-lg font-semibold">Atividade Recente</h2>
              </div>

              <Card className="bg-white/5 border border-white/10 rounded-xl">
                <CardContent className="p-4 space-y-2">
                  {[
                    "Acertou palpite importante no Brasileirão",
                    "Comprou Pacote Prata na loja",
                    "Coletou figurinha rara",
                  ].map((desc, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-sm border-b border-white/5 last:border-b-0 py-1"
                    >
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-400" />
                        <span>{desc}</span>
                      </div>

                      <div className="text-xs text-gray-400 flex items-center gap-1">
                        {idx === 0 ? "Hoje" : idx === 1 ? "Ontem" : "Há 2 dias"}
                        <ChevronRight className="w-3 h-3" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </section>
          </>
        )}

        <ModalAlterarSenha
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </AppLayout>
  );
}
