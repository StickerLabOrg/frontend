// src/pages/Dashboard/DashboardPage.tsx
import { useEffect, useState, } from "react";
import type { ReactNode } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import { AppLayout } from "../../layout/AppLayout";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useUserMetrics } from "../../context/UserContext";

/* -------------------------------------------------------
   TYPES
------------------------------------------------------- */

type Team = {
  id: string;
  nome: string;
  escudo: string;
};

type Match = {
  id_partida: string;
  time_casa: Team;
  time_fora: Team;
  data: string; // "2025-11-22"
  horario: string; // "22:30:00"
  status?: string;
};

type Palpite = {
  id: number;
  partida_id: string; // sempre string no front
  palpite_gols_casa: number;
  palpite_gols_visitante: number;
};

/* -------------------------------------------------------
   FORMATADOR DE DATA E HORA
------------------------------------------------------- */

function formatarDataHora(dataISO: string, horario: string) {
  try {
    const [year, month, day] = dataISO.split("-");
    const [h, m] = horario.split(":");

    const dataObj = new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(h),
      Number(m)
    );

    const dataBR = dataObj.toLocaleDateString("pt-BR");
    const horaBR = dataObj.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return `${dataBR} — ${horaBR}`;
  } catch {
    return "Data inválida";
  }
}

/* -------------------------------------------------------
   INFO DE STATUS + CONTADOR DA PARTIDA
------------------------------------------------------- */

function getMatchTimeInfo(match: Match, now: Date) {
  const start = new Date(`${match.data}T${match.horario}`);
  const diffMs = start.getTime() - now.getTime(); // positivo = futuro
  const durationMs = 2 * 60 * 60 * 1000; // 2h estimadas

  const isFuture = diffMs > 0;
  const isFinished = now.getTime() > start.getTime() + durationMs;

  const isLiveByTime = !isFinished && diffMs <= 0;

  const statusLower = match.status?.toLowerCase() || "";
  const isLiveByStatus =
    statusLower.includes("live") || statusLower.includes("ao vivo");

  const isLive = isLiveByTime || isLiveByStatus;

  let countdownText: string | null = null;
  let isSoon = false;

  if (isFuture) {
    const totalSeconds = Math.floor(diffMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const hh = String(hours).padStart(2, "0");
    const mm = String(minutes).padStart(2, "0");
    const ss = String(seconds).padStart(2, "0");

    countdownText = `${hh}:${mm}:${ss}`;
    isSoon = diffMs <= 10 * 60 * 1000;
  }

  return {
    isFuture,
    isLive,
    isFinished,
    countdownText,
    isSoon,
  };
}

/* -------------------------------------------------------
   MODAL GENÉRICO
------------------------------------------------------- */

function OverlayModal({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose?: () => void;
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-xl mx-4 bg-slate-900 rounded-2xl border border-white/10 shadow-2xl">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-200 transition-colors"
          >
            ✕
          </button>
        )}
        <div className="p-8">{children}</div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------
   COMPONENTE PRINCIPAL
------------------------------------------------------- */

export function DashboardPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [palpites, setPalpites] = useState<Palpite[]>([]);
  const [loading, setLoading] = useState(true);

  const [now, setNow] = useState<Date>(new Date());

  // Modal de palpite
  const [matchSelecionada, setMatchSelecionada] = useState<Match | null>(null);
  const [golsCasa, setGolsCasa] = useState<number>(0);
  const [golsFora, setGolsFora] = useState<number>(0);
  const [savingPalpite, setSavingPalpite] = useState(false);
  const [erroPalpite, setErroPalpite] = useState<string | null>(null);

  const navigate = useNavigate();

  const {
    palpites: totalPalpites,
    precisao,
    pontos,
    figurinhas,
    loading: loadingMetrics,
  } = useUserMetrics();

  /* ---------------------------------------------------
     BUSCAS
  --------------------------------------------------- */

  async function fetchMatches() {
    try {
      const response = await axios.get("http://localhost:8000/partidas/proximas");
      const partidasOrdenadas = response.data.sort(
        (a: Match, b: Match) =>
          new Date(`${a.data}T${a.horario}`).getTime() -
          new Date(`${b.data}T${b.horario}`).getTime()
      );
      setMatches(partidasOrdenadas);
    } catch (err) {
      console.error("Erro ao buscar partidas:", err);
    }
  }

  async function fetchPalpites() {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const r = await axios.get("http://localhost:8000/palpites/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const convertidos: Palpite[] = (r.data || []).map((p: any) => {
        // Caso padrão: backend já retorna palpite_gols_casa e palpite_gols_visitante
        if (
          typeof p.palpite_gols_casa === "number" &&
          typeof p.palpite_gols_visitante === "number"
        ) {
          return {
            id: p.id,
            partida_id: String(p.partida_id),
            palpite_gols_casa: p.palpite_gols_casa,
            palpite_gols_visitante: p.palpite_gols_visitante,
          };
        }

        // Fallback: se vier apenas "palpite": "2x1"
        if (typeof p.palpite === "string" && p.palpite.trim().length > 0) {
          const normalized = p.palpite.replace("-", "x").toLowerCase();
          const [gcStr, gfStr] = normalized.split("x");
          const gc = parseInt((gcStr || "0").trim(), 10);
          const gf = parseInt((gfStr || "0").trim(), 10);

          return {
            id: p.id,
            partida_id: String(p.partida_id),
            palpite_gols_casa: isNaN(gc) ? 0 : gc,
            palpite_gols_visitante: isNaN(gf) ? 0 : gf,
          };
        }

        // Nunca deve cair aqui, mas garante que não quebra a tela
        return {
          id: p.id,
          partida_id: String(p.partida_id),
          palpite_gols_casa: 0,
          palpite_gols_visitante: 0,
        };
      });

      setPalpites(convertidos);
    } catch (err) {
      console.error("Erro ao buscar palpites:", err);
    }
  }

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchMatches(), fetchPalpites()]).finally(() =>
      setLoading(false)
    );
  }, []);

  // Atualiza "now" a cada segundo para o contador
  useEffect(() => {
    const intervalId = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

  /* ---------------------------------------------------
     HELPERS DE PALPITE
  --------------------------------------------------- */

  function getPalpiteDaPartida(partidaId: string) {
    return palpites.find((p) => p.partida_id === String(partidaId));
  }

  /* ---------------------------------------------------
     NAVEGAÇÃO PARA DETALHES DA PARTIDA
  --------------------------------------------------- */

  function irParaDetalhesPartida(match: Match) {
    navigate(`/partida/${match.id_partida}`);
  }

  /* ---------------------------------------------------
     FLUXO DE PALPITE
  --------------------------------------------------- */

  function abrirModalPalpite(match: Match) {
    const palpiteExistente = getPalpiteDaPartida(match.id_partida);

    setMatchSelecionada(match);
    setGolsCasa(palpiteExistente ? palpiteExistente.palpite_gols_casa : 0);
    setGolsFora(palpiteExistente ? palpiteExistente.palpite_gols_visitante : 0);
    setErroPalpite(null);
  }

  function fecharModalPalpite() {
    setMatchSelecionada(null);
    setErroPalpite(null);
    setSavingPalpite(false);
  }

  async function salvarPalpiteNoBackend(
    partidaId: string,
    golsCasa: number,
    golsFora: number
  ) {
    const token = localStorage.getItem("token") ?? "";

    await axios.post(
      "http://localhost:8000/palpites/",
      {
        partida_id: Number(partidaId),
        palpite_gols_casa: golsCasa,
        palpite_gols_visitante: golsFora,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  }

  async function handleConfirmarPalpite() {
    if (!matchSelecionada) return;

    try {
      setSavingPalpite(true);
      setErroPalpite(null);

      const partidaId = matchSelecionada.id_partida;

      await salvarPalpiteNoBackend(partidaId, golsCasa, golsFora);

      // Recarrega palpites REAIS do backend
      await fetchPalpites();

      fecharModalPalpite();
    } catch (err) {
      console.error("Erro ao salvar palpite:", err);
      setErroPalpite("Não foi possível salvar seu palpite. Tente novamente.");
    } finally {
      setSavingPalpite(false);
    }
  }

  /* ---------------------------------------------------
     RENDER
  --------------------------------------------------- */

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto w-full px-4 md:px-0">
        {/* Cabeçalho */}
        <h1 className="text-4xl font-bold text-primary mb-2">Dashboard</h1>
        <p className="text-mutedForeground mb-8">
          Visão geral dos seus palpites e partidas futuras.
        </p>

        {/* MÉTRICAS DO USUÁRIO */}
        <section className="grid gap-4 sm:gap-6 grid-cols-2 md:grid-cols-4 mb-10">
          {[
            {
              titulo: "Total de Palpites",
              valor: loadingMetrics ? "-" : String(totalPalpites),
            },
            {
              titulo: "Taxa de Acerto",
              valor: loadingMetrics ? "-" : `${precisao}%`,
            },
            {
              titulo: "Pontos Ganhos",
              valor: loadingMetrics ? "-" : String(pontos),
            },
            {
              titulo: "Figurinhas coletadas",
              valor: loadingMetrics ? "-" : String(figurinhas),
            },
          ].map((item, idx) => (
            <Card
              key={idx}
              className="
                bg-white/5 
                border border-white/10
                backdrop-blur-lg
                shadow-lg shadow-black/40
                text-white h-[120px]
                rounded-2xl
                flex flex-col items-center justify-center text-center
                transform transition-all duration-300
                hover:scale-[1.02] hover:shadow-emerald-500/20 hover:shadow-xl
                animate-fade-slide-up
              "
              style={{ animationDelay: `${idx * 0.08}s` }}
            >
              <CardContent className="p-0 flex flex-col items-center justify-center">
                <p className="text-3xl md:text-4xl font-bold text-emerald-400 drop-shadow-sm leading-tight">
                  {item.valor}
                </p>
                <p className="text-xs md:text-sm text-gray-300 mt-1 font-medium">
                  {item.titulo}
                </p>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* LISTA DE PARTIDAS */}
        <h3 className="text-xl font-semibold mb-4">Próximas Partidas</h3>

        {loading && <p className="text-gray-300 mb-4">Carregando partidas...</p>}

        <section className="space-y-6 mb-10">
          {matches.map((match, index) => {
            const { isFuture, isLive, isFinished, countdownText, isSoon } =
              getMatchTimeInfo(match, now);

            const palpiteAtual = getPalpiteDaPartida(match.id_partida);
            const podePalpitar = isFuture;

            return (
              <div
                key={match.id_partida}
                style={{ animationDelay: `${index * 0.08}s` }}
                className="flex flex-col items-stretch animate-fade-slide-up"
              >
                {/* STATUS / CONTADOR */}
                <div className="flex justify-center mb-1">
                  {isLive && (
                    <span className="mb-1 text-xs font-semibold text-red-400">
                      AO VIVO
                    </span>
                  )}

                  {!isLive && isFuture && countdownText && (
                    <span
                      className={`mb-1 text-xs font-semibold tracking-wide ${
                        isSoon
                          ? "text-emerald-300 animate-pulse"
                          : "text-emerald-200"
                      }`}
                    >
                      {countdownText}
                    </span>
                  )}

                  {!isLive && !isFuture && isFinished && (
                    <span className="mb-1 text-xs font-medium text-gray-400">
                      Encerrado
                    </span>
                  )}
                </div>

                {/* CARD DA PARTIDA */}
                <Card
                  onClick={() => irParaDetalhesPartida(match)}
                  className="
                    bg-white/5
                    border border-white/10
                    backdrop-blur-md
                    shadow-xl shadow-black/40
                    text-white
                    rounded-xl
                    w-full
                    transition-all duration-300
                    hover:shadow-emerald-500/10
                    cursor-pointer
                  "
                >
                  <CardContent className="py-4 px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* Times */}
                    <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-6 md:gap-10">
                      {/* CASA */}
                      <div className="flex items-center gap-3">
                        <img
                          src={match.time_casa.escudo}
                          className="h-10 w-10 rounded-full object-cover"
                          onError={(e) =>
                            (e.currentTarget.src = "/default-team.png")
                          }
                        />
                        <div>
                          <p className="font-semibold text-sm md:text-base">
                            {match.time_casa.nome}
                          </p>
                          <p className="text-xs text-gray-300">Casa</p>
                        </div>
                      </div>

                      <span className="text-2xl md:text-3xl font-bold">VS</span>

                      {/* FORA */}
                      <div className="flex items-center gap-3">
                        <img
                          src={match.time_fora.escudo}
                          className="h-10 w-10 rounded-full object-cover"
                          onError={(e) =>
                            (e.currentTarget.src = "/default-team.png")
                          }
                        />
                        <div className="text-right">
                          <p className="font-semibold text-sm md:text-base">
                            {match.time_fora.nome}
                          </p>
                          <p className="text-xs text-gray-300">Visitante</p>
                        </div>
                      </div>
                    </div>

                    {/* DATA / PALPITE / BOTÃO */}
                    <div className="flex flex-col items-center md:items-end gap-2 w-full md:w-48">
                      <span className="text-xs text-gray-300 text-center md:text-right">
                        {formatarDataHora(match.data, match.horario)}
                      </span>

                      {palpiteAtual && (
                        <span
                          className="
                            text-[11px] px-3 py-0.5 
                            rounded-full 
                            bg-emerald-500/10 
                            border border-emerald-500/60 
                            text-emerald-300 
                            font-medium
                          "
                        >
                          Palpite: {palpiteAtual.palpite_gols_casa}x
                          {palpiteAtual.palpite_gols_visitante}
                        </span>
                      )}

                      <Button
                        disabled={!podePalpitar}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!podePalpitar) return;
                          abrirModalPalpite(match);
                        }}
                        className="
                          bg-emerald-500 hover:bg-emerald-600 
                          text-black font-semibold 
                          w-full md:w-[130px]
                          disabled:bg-gray-600 disabled:text-gray-300
                          text-sm
                        "
                      >
                        {palpiteAtual ? "Alterar Palpite" : "Fazer Palpite"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </section>

        {/* MODAL DE PALPITE */}
        {matchSelecionada && (
          <OverlayModal onClose={fecharModalPalpite}>
            <div className="flex flex-col items-center text-center gap-6">
              <h2 className="text-2xl font-semibold text-white">
                {getPalpiteDaPartida(matchSelecionada.id_partida)
                  ? "Alterar Palpite"
                  : "Fazer Palpite"}
              </h2>

              {/* Times */}
              <div className="flex items-center justify-center gap-10 md:gap-12">
                <div className="flex flex-col items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-rose-500 shadow-lg shadow-rose-500/40" />
                  <p className="font-semibold text-sm md:text-base">
                    {matchSelecionada.time_casa.nome}
                  </p>
                  <p className="text-xs text-gray-400">Casa</p>
                </div>

                <span className="text-xl md:text-2xl font-bold text-gray-200">
                  VS
                </span>

                <div className="flex flex-col items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/40" />
                  <p className="font-semibold text-sm md:text-base">
                    {matchSelecionada.time_fora.nome}
                  </p>
                  <p className="text-xs text-gray-400">Visitante</p>
                </div>
              </div>

              {/* Inputs de gols */}
              <div className="flex items-center justify-center gap-6">
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={golsCasa}
                  onChange={(e) =>
                    setGolsCasa(Math.max(0, Number(e.target.value || 0)))
                  }
                  className="
                    w-16 h-16 rounded-xl border 
                    border-emerald-500/60 bg-slate-900 text-center text-2xl
                    text-white outline-none
                    focus:ring-2 focus:ring-emerald-500
                  "
                />

                <span className="text-3xl font-bold text-gray-200">X</span>

                <input
                  type="number"
                  min={0}
                  max={20}
                  value={golsFora}
                  onChange={(e) =>
                    setGolsFora(Math.max(0, Number(e.target.value || 0)))
                  }
                  className="
                    w-16 h-16 rounded-xl border 
                    border-emerald-500/60 bg-slate-900 text-center text-2xl
                    text-white outline-none
                    focus:ring-2 focus:ring-emerald-500
                  "
                />
              </div>

              <p className="text-xs text-gray-400">
                {formatarDataHora(
                  matchSelecionada.data,
                  matchSelecionada.horario
                )}
              </p>

              {erroPalpite && (
                <p className="text-xs text-red-300">{erroPalpite}</p>
              )}

              <div className="flex gap-3 w-full justify-center mt-2">
                <Button
                  variant="outline"
                  onClick={fecharModalPalpite}
                  className="bg-transparent border-white/20 text-gray-200 hover:bg-white/5"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleConfirmarPalpite}
                  disabled={savingPalpite}
                  className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold"
                >
                  {savingPalpite ? "Salvando..." : "Confirmar Palpite"}
                </Button>
              </div>
            </div>
          </OverlayModal>
        )}
      </div>
    </AppLayout>
  );
}
