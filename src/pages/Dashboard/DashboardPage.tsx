import { useEffect, useState } from "react";
import axios from "axios";
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
  data: string;     // "2025-11-22"
  horario: string;  // "22:30:00"
  status?: string;  // opcional: "live", "ao vivo", "final", etc.
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
  } catch (e) {
    return "Data inválida";
  }
}

/* -------------------------------------------------------
   INFO DE STATUS + CONTADOR DA PARTIDA
------------------------------------------------------- */

function getMatchTimeInfo(match: Match, now: Date) {
  const start = new Date(`${match.data}T${match.horario}`);
  const diffMs = start.getTime() - now.getTime(); // positivo = futuro
  const durationMs = 2 * 60 * 60 * 1000; // 2h de duração estimada

  const isFuture = diffMs > 0;
  const isFinished = now.getTime() > start.getTime() + durationMs;

  // Partida ao vivo pela hora
  const isLiveByTime = !isFinished && diffMs <= 0;

  // Partida ao vivo pelo backend (se vier status)
  const statusLower = match.status?.toLowerCase() || "";
  const isLiveByStatus =
    statusLower.includes("live") || statusLower.includes("ao vivo");

  const isLive = isLiveByTime || isLiveByStatus;

  // Se está no futuro, monta contador
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

    // Considera "em breve" se faltar menos de 10 minutos
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
   COMPONENTE
------------------------------------------------------- */

export function DashboardPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  // Relógio global para o contador (atualiza a cada 1s)
  const [now, setNow] = useState<Date>(new Date());

  // MÉTRICAS DO CONTEXTO
  const {
    palpites,
    precisao,
    pontos,
    figurinhas,
    loading: loadingMetrics,
  } = useUserMetrics();

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
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMatches();
  }, []);

  // Atualiza "now" a cada segundo para alimentar o contador
  useEffect(() => {
    const intervalId = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto w-full">

        {/* Cabeçalho */}
        <h1 className="text-4xl font-bold text-primary mb-2">Dashboard</h1>
        <p className="text-mutedForeground mb-8">
          Visão geral dos seus palpites e partidas futuras.
        </p>

        {/* MÉTRICAS DO USUÁRIO */}
        <section className="grid gap-6 md:grid-cols-4 mb-10">
          {[
            {
              titulo: "Total de Palpites",
              valor: loadingMetrics ? "-" : String(palpites),
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
                text-white h-[130px]
                rounded-2xl
                flex flex-col items-center justify-center text-center
                transform transition-all duration-300
                hover:scale-[1.02] hover:shadow-emerald-500/20 hover:shadow-xl
                animate-fade-slide-up
              "
              style={{ animationDelay: `${idx * 0.08}s` }}
            >
              <CardContent className="p-0 flex flex-col items-center justify-center">
                <p className="text-4xl font-bold text-emerald-400 drop-shadow-sm leading-tight">
                  {item.valor}
                </p>
                <p className="text-sm text-gray-300 mt-1 font-medium">
                  {item.titulo}
                </p>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* LISTA DE PARTIDAS */}
        <h3 className="text-xl font-semibold mb-4">Próximas Partidas</h3>

        {loading && <p className="text-gray-300">Carregando partidas...</p>}

        <section className="space-y-6">
          {matches.map((match, index) => {
            const { isFuture, isLive, isFinished, countdownText, isSoon } =
              getMatchTimeInfo(match, now);

            return (
              <div
                key={match.id_partida}
                style={{ animationDelay: `${index * 0.08}s` }}
                className="flex flex-col items-center animate-fade-slide-up"
              >
                {/* LINHA DE STATUS / CONTADOR - EXTERNO, ACIMA DO CARD */}
                {isLive && (
                  <span className="mb-1 text-xs font-semibold text-red-400">
                    AO VIVO
                  </span>
                )}

                {!isLive && isFuture && countdownText && (
                  <span
                    className={`
                      mb-1 text-xs font-semibold tracking-wide
                      ${
                        isSoon
                          ? "text-emerald-300 animate-pulse"
                          : "text-emerald-200"
                      }
                    `}
                  >
                    {countdownText}
                  </span>
                )}

                {!isLive && !isFuture && isFinished && (
                  <span className="mb-1 text-xs font-medium text-gray-400">
                    Encerrado
                  </span>
                )}

                {/* CARD DA PARTIDA */}
                <Card
                  className="
                    bg-white/5
                    border border-white/10
                    backdrop-blur-md
                    shadow-xl shadow-black/40
                    text-white h-[150px]
                    rounded-xl
                    w-full
                    transition-all duration-300
                    hover:shadow-emerald-500/10
                  "
                >
                  <CardContent className="py-4 px-6 flex flex-col md:flex-row items-center justify-between">

                    {/* Times */}
                    <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-10">

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
                          <p className="font-semibold">{match.time_casa.nome}</p>
                          <p className="text-xs text-gray-300">Casa</p>
                        </div>
                      </div>

                      {/* VS */}
                      <span className="text-3xl font-bold">VS</span>

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
                          <p className="font-semibold">{match.time_fora.nome}</p>
                          <p className="text-xs text-gray-300">Visitante</p>
                        </div>
                      </div>
                    </div>

                    {/* DATA / BOTÃO */}
                    <div className="flex flex-col items-center gap-2 w-40">
                      <span className="text-xs text-gray-300 text-center">
                        {formatarDataHora(match.data, match.horario)}
                      </span>

                      <Button className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold w-full">
                        Palpitar
                      </Button>
                    </div>

                  </CardContent>
                </Card>
              </div>
            );
          })}
        </section>

      </div>
    </AppLayout>
  );
}
