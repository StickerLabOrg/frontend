// src/pages/Perfil/PerfilPage.tsx
import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import { AppLayout } from "../../layout/AppLayout";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";

import {
  Wallet2,
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
  total_figurinhas: number;
  progresso_album: number; // 0–100
  total_palpites: number;
  taxa_acerto: number; // 0–100
  coins: number;
};

/* ------------------------------------------------------------------
   COMPONENTE
------------------------------------------------------------------- */

export function PerfilPage() {
  const [perfil, setPerfil] = useState<PerfilResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

      const resp = await axios.get<PerfilResponse>(
        "http://localhost:8000/usuarios/me",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setPerfil(resp.data);
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
  const nome = perfil?.nome ?? "Torcedor";
  const email = perfil?.email ?? "seuemail@exemplo.com";
  const timeCoracao = perfil?.time_do_coracao ?? "Time não definido";

  // Mini gráfico fake
  const desempenhoData = useMemo(() => {
    if (!perfil) return [20, 30, 40, 50, 60];
    const base = Math.max(10, Math.min(90, perfil.taxa_acerto));
    const prog = Math.max(5, Math.min(95, perfil.progresso_album));

    return [
      Math.max(10, base - 25),
      Math.max(10, base - 10),
      Math.round((base + prog) / 2),
      Math.min(100, base + 5),
      Math.min(100, base + 10),
    ];
  }, [perfil]);

  const svgPoints = useMemo(() => {
    const width = 260;
    const height = 80;
    const maxVal = Math.max(...desempenhoData, 1);

    return desempenhoData
      .map((val, index) => {
        const x =
          desempenhoData.length === 1
            ? width / 2
            : (index / (desempenhoData.length - 1)) * width;
        const y = height - (val / maxVal) * 60 - 10;
        return `${x},${y}`;
      })
      .join(" ");
  }, [desempenhoData]);

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto w-full space-y-8">
        {/* TÍTULO */}
        <header className="animate-fade-slide-up">
          <h1 className="text-4xl font-bold text-primary mb-1">Meu Perfil</h1>
          <p className="text-mutedForeground">
            Visualize seus dados, estatísticas e atividade recente.
          </p>
        </header>

        {/* LOADING / ERROR */}
        {loading && <p className="text-gray-300">Carregando...</p>}
        {error && !loading && <p className="text-red-400">{error}</p>}

        {!loading && !error && perfil && (
          <>
            {/* CARD PRINCIPAL */}
            <Card className="bg-white/5 border border-white/10 rounded-2xl shadow-xl backdrop-blur-xl animate-fade-slide-up">
              <CardContent className="p-8 flex flex-col items-center gap-6">
                
                {/* Avatar animado */}
                <div
                  className="
                    h-28 w-28 rounded-full bg-emerald-700/40 
                    flex items-center justify-center
                    text-4xl font-bold text-emerald-300
                    shadow-lg shadow-emerald-500/20

                    cursor-pointer
                    transition-all duration-300
                    hover:scale-105 hover:shadow-emerald-500/40
                    hover:rotate-3

                    animate-[pulse_3s_ease-in-out_infinite]
                  "
                >
                  {avatarInicial}
                </div>

                {/* Infos */}
                <div className="text-center space-y-1">
                  <h2 className="text-3xl font-semibold">{nome}</h2>
                  <p className="text-sm text-gray-300">{email}</p>
                  <p className="text-sm text-emerald-400 font-medium">
                    Time do Coração:{" "}
                    <span className="font-semibold">{timeCoracao}</span>
                  </p>

                  <Button className="mt-2 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold">
                    Alterar Senha
                  </Button>
                </div>

                {/* MINI RESUMO */}
                <div className="flex items-center justify-center gap-12 pt-4">
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

            {/* CARDS PRINCIPAIS (MELHORADOS) */}
            <section className="grid gap-4 md:grid-cols-2 animate-fade-slide-up">
              
              <Card className="
                bg-white/5 border border-white/10 rounded-2xl shadow-md 
                transition-all duration-300
                hover:bg-white/10 hover:shadow-emerald-500/20 hover:scale-[1.03]
              ">
                <CardContent className="p-5">
                  <p className="text-xs uppercase tracking-wide text-gray-400">
                    Carteira Virtual
                  </p>
                  <p className="mt-2 text-3xl font-bold text-emerald-400">
                    {perfil.coins}
                  </p>
                  <p className="text-xs text-gray-400">
                    Moedas disponíveis para usar na loja.
                  </p>
                </CardContent>
              </Card>

              <Card className="
                bg-white/5 border border-white/10 rounded-2xl shadow-md 
                transition-all duration-300
                hover:bg-white/10 hover:shadow-emerald-500/20 hover:scale-[1.03]
              ">
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
                      stroke="rgba(148, 163, 184, 0.35)"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                    <polyline
                      fill="none"
                      stroke="rgba(16, 185, 129, 0.5)"
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
                
                {/* CARD PADRÃO (AGORA COM HOVER) */}
                {[
                  {
                    label: "Figurinhas",
                    valor: perfil.total_figurinhas,
                    desc: "Total na coleção.",
                  },
                  {
                    label: "Progresso do Álbum",
                    valor: perfil.progresso_album.toFixed(1) + "%",
                    desc: "Continue colecionando!",
                    barra: true,
                  },
                  {
                    label: "Palpites",
                    valor: perfil.total_palpites,
                    desc: "Total de palpites feitos.",
                  },
                  {
                    label: "Taxa de acerto",
                    valor: perfil.taxa_acerto.toFixed(1) + "%",
                    desc: "Desempenho geral.",
                  },
                ].map((card, i) => (
                  <Card
                    key={i}
                    className="
                      bg-white/5 border border-white/10 rounded-xl shadow-sm
                      transition-all duration-300
                      hover:bg-white/10 hover:shadow-md hover:shadow-emerald-500/20 hover:scale-[1.03]
                    "
                  >
                    <CardContent className="p-4 text-center space-y-1">
                      <p className="text-xs text-gray-400">{card.label}</p>
                      <p className="text-xl font-bold text-emerald-400">
                        {card.valor}
                      </p>

                      {card.barra && (
                        <div className="w-full h-1 bg-white/10 rounded-full">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${perfil.progresso_album}%` }}
                          />
                        </div>
                      )}

                      <p className="text-[11px] text-gray-500">{card.desc}</p>
                    </CardContent>
                  </Card>
                ))}
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
                        {idx === 0 ? "Hoje" : idx === 1 ? "Ontem" : "2 dias atrás"}
                        <ChevronRight className="w-3 h-3" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </section>
          </>
        )}
      </div>
    </AppLayout>
  );
}
