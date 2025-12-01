import { useEffect, useState } from "react";
import axios from "axios";
import { AppLayout } from "../../layout/AppLayout";
import { Card, CardContent } from "../../components/ui/card";

type Time = {
  id: string;
  nome: string;
  escudo: string | null;
};

type Partida = {
  id_partida: string;
  liga_id: string;
  liga_nome: string | null;
  rodada: string | null;
  data: string | null;
  horario: string | null;
  estadio: string | null;
  status: string | null;
  time_casa: Time;
  time_fora: Time;
  placar_casa: number | null;
  placar_fora: number | null;
};

function formatarDataBR(dataISO?: string | null) {
  if (!dataISO) return "Data desconhecida";
  try {
    const data = new Date(dataISO);
    return data.toLocaleDateString("pt-BR");
  } catch {
    return dataISO;
  }
}

export function UltimosJogosPage() {
  const [partidas, setPartidas] = useState<Partida[]>([]);
  const [loading, setLoading] = useState(true);

  async function carregarPartidas() {
    setLoading(true);

    try {
      // 1 — tenta via backend normalmente (V2 + padrão do seu serviço)
      const resp = await axios.get(
        "http://localhost:8000/partidas/ultimos-resultados"
      );

      if (resp.data && resp.data.length > 0) {
        setPartidas(resp.data);
        return;
      }

      // 2 — FALLBACK V1 EVENTSLAST
      const apiKey = "362502";
      const leagueId = "4351";

      const urlLast = `https://www.thesportsdb.com/api/v1/json/${apiKey}/eventslast.php`;
      const rLast = await axios.get(urlLast, { params: { id: leagueId } });

      const lastEvents =
        rLast.data?.results ||
        rLast.data?.events ||
        [];

      if (lastEvents.length > 0) {
        const convertidos = lastEvents.map((ev: any) => ({
          id_partida: ev.idEvent,
          liga_id: ev.idLeague,
          liga_nome: ev.strLeague,
          rodada: ev.intRound,
          data: ev.dateEvent,
          horario: ev.strTime,
          estadio: ev.strVenue,
          status: ev.strStatus,
          time_casa: {
            id: ev.idHomeTeam,
            nome: ev.strHomeTeam,
            escudo: ev.strHomeTeamBadge,
          },
          time_fora: {
            id: ev.idAwayTeam,
            nome: ev.strAwayTeam,
            escudo: ev.strAwayTeamBadge,
          },
          placar_casa: ev.intHomeScore ?? null,
          placar_fora: ev.intAwayScore ?? null,
        }));

        setPartidas(convertidos);
        return;
      }

      // 3 — FALLBACK FINAL: pega últimos 10 jogos da liga
      const urlPast = `https://www.thesportsdb.com/api/v1/json/${apiKey}/eventspastleague.php`;
      const rPast = await axios.get(urlPast, { params: { id: leagueId } });

      const pastEvents =
        rPast.data?.events ||
        rPast.data?.results ||
        [];

      if (pastEvents.length > 0) {
        const ultimos10 = pastEvents.slice(-10);

        const convertidos = ultimos10.map((ev: any) => ({
          id_partida: ev.idEvent,
          liga_id: ev.idLeague,
          liga_nome: ev.strLeague,
          rodada: ev.intRound,
          data: ev.dateEvent,
          horario: ev.strTime,
          estadio: ev.strVenue,
          status: ev.strStatus,
          time_casa: {
            id: ev.idHomeTeam,
            nome: ev.strHomeTeam,
            escudo: ev.strHomeTeamBadge,
          },
          time_fora: {
            id: ev.idAwayTeam,
            nome: ev.strAwayTeam,
            escudo: ev.strAwayTeamBadge,
          },
          placar_casa: ev.intHomeScore ?? null,
          placar_fora: ev.intAwayScore ?? null,
        }));

        setPartidas(convertidos);
        return;
      }

      setPartidas([]);
    } catch (err) {
      console.error("Erro ao carregar últimos jogos:", err);
      setPartidas([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarPartidas();
  }, []);

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto w-full px-4 md:px-0">
        {/* Cabeçalho padrão Dashboard */}
        <h1 className="text-4xl font-bold text-emerald-400 mb-2">
          Últimos Jogos
        </h1>
        <p className="text-mutedForeground mb-8">
          Veja aqui os resultados mais recentes das partidas.
        </p>

        {loading && (
          <p className="text-gray-400 text-center">Carregando resultados...</p>
        )}

        <section className="space-y-6 pb-10">
          {partidas.map((p, index) => (
            <Card
              key={p.id_partida}
              style={{ animationDelay: `${index * 0.06}s` }}
              className="
                bg-white/5
                border border-white/10
                backdrop-blur-md
                shadow-xl shadow-black/40
                rounded-2xl
                text-white
                animate-fade-slide-up
                transition-all duration-300
                hover:shadow-emerald-500/20 hover:shadow-2xl hover:scale-[1.01]
              "
            >
              <CardContent
                className="
                  py-4 px-4 md:px-6
                  flex flex-col gap-4
                  sm:flex-row sm:items-center sm:justify-between
                "
              >
                {/* BLOCO DOS TIMES + PLACAR */}
                <div
                  className="
                    flex-1
                    flex flex-col gap-4
                    sm:flex-row sm:items-center sm:justify-center
                    sm:gap-10
                  "
                >
                  {/* CASA */}
                  <div className="flex items-center gap-3 sm:justify-end">
                    <img
                      src={p.time_casa.escudo ?? "/default-team.png"}
                      className="h-12 w-12 rounded-full object-cover"
                      onError={(e) =>
                        (e.currentTarget.src = "/default-team.png")
                      }
                    />
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm md:text-base">
                        {p.time_casa.nome}
                      </span>
                      <span className="text-xs text-gray-400">Casa</span>
                    </div>
                  </div>

                  {/* PLACAR */}
                  <div className="flex flex-col items-center justify-center min-w-[60px]">
                    <span className="text-3xl md:text-4xl font-bold">
                      {p.placar_casa ?? 0}{" "}
                      <span className="mx-1 text-2xl md:text-3xl">-</span>{" "}
                      {p.placar_fora ?? 0}
                    </span>
                  </div>

                  {/* VISITANTE */}
                  <div className="flex items-center gap-3 sm:justify-start">
                    <div className="flex flex-col text-right sm:text-left">
                      <span className="font-semibold text-sm md:text-base">
                        {p.time_fora.nome}
                      </span>
                      <span className="text-xs text-gray-400">Visitante</span>
                    </div>
                    <img
                      src={p.time_fora.escudo ?? "/default-team.png"}
                      className="h-12 w-12 rounded-full object-cover"
                      onError={(e) =>
                        (e.currentTarget.src = "/default-team.png")
                      }
                    />
                  </div>
                </div>

                {/* BLOCO DATA + STATUS */}
                <div
                  className="
                    flex flex-col items-center gap-2
                    sm:items-end sm:w-40
                  "
                >
                  {p.data && (
                    <span className="text-xs text-gray-300">
                      {formatarDataBR(p.data)}
                    </span>
                  )}

                  {p.status && (
                    <span
                      className="
                        text-[11px] px-4 py-1 rounded-full
                        bg-emerald-500/10 border border-emerald-500/50
                        text-emerald-300 font-medium
                      "
                    >
                      {p.status}
                    </span>
                  )}

                  {p.rodada && (
                    <span className="text-[11px] text-gray-400 mt-1">
                      Rodada {p.rodada}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {!loading && partidas.length === 0 && (
            <p className="text-gray-400 text-center mt-10">
              Nenhum jogo encontrado recentemente.
            </p>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
