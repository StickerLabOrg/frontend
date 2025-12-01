import { useEffect, useState } from "react";
import axios from "axios";
import { AppLayout } from "../../layout/AppLayout";
import { Card, CardContent } from "../../components/ui/card";

/* -------------------------------------------------------
   Tipos
------------------------------------------------------- */

type TabelaRow = {
  posicao: number;
  time_id: string;
  time_nome: string;
  escudo: string | null;
  pontos: number;
  jogos: number;
  vitorias: number;
  empates: number;
  derrotas: number;
  gols_pro: number;
  gols_contra: number;
  saldo: number;
};

/* -------------------------------------------------------
   Mapa de cores por time
------------------------------------------------------- */

const TEAM_COLORS: Record<string, string> = {
  Flamengo: "bg-red-600",
  Palmeiras: "bg-green-600",
  Cruzeiro: "bg-blue-600",
  "Vasco da Gama": "bg-gray-700",
  Botafogo: "bg-black",
  "São Paulo": "bg-red-500",
  Grêmio: "bg-sky-500",
  Internacional: "bg-red-700",
  Bahia: "bg-blue-500",
  Fortaleza: "bg-red-500",
  "Sport Club do Recife": "bg-yellow-500",
  Corinthians: "bg-black",
  Fluminense: "bg-green-700",
};

/* -------------------------------------------------------
   Helpers visuais
------------------------------------------------------- */

function getFaixaClass(posicao: number) {
  if (posicao <= 4) return "bg-emerald-900/40"; // G4
  if (posicao <= 6) return "bg-sky-900/40"; // Pré-liberta
  if (posicao >= 17) return "bg-red-900/40"; // Rebaixamento
  return "bg-transparent";
}

function getSaldoClass(saldo: number) {
  if (saldo > 0) return "text-emerald-400 font-semibold";
  if (saldo < 0) return "text-red-400 font-semibold";
  return "text-gray-200 font-semibold";
}

/* -------------------------------------------------------
   Página
------------------------------------------------------- */

export function ClassificacaoPage() {
  const [tabela, setTabela] = useState<TabelaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const leagueId = 4351;
  const season = 2025;

  async function fetchTabela() {
    try {
      setLoading(true);

      const response = await axios.get<TabelaRow[]>(
        "http://localhost:8000/partidas/tabela",
        {
          params: { league_id: leagueId, season: season },
        }
      );

      const ordenada = [...response.data].sort(
        (a, b) => a.posicao - b.posicao
      );

      setTabela(ordenada);
    } catch (err) {
      console.error("Erro ao carregar tabela:", err);
      setError("Não foi possível carregar a tabela.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTabela();
  }, []);

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto w-full">
        <h1 className="text-3xl font-bold text-primary mb-2">
          Classificação - Brasileirão {season}
        </h1>
        <p className="text-mutedForeground mb-6">
          Tabela oficial da temporada.
        </p>

        <Card className="bg-white/5 border border-white/10 rounded-2xl shadow-xl backdrop-blur-xl animate-fade-slide-up">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4 text-white">
              Tabela de Classificação
            </h2>

            {loading && <p className="text-gray-300">Carregando...</p>}
            {error && <p className="text-red-400">{error}</p>}

            {!loading && !error && (
              <>
                {/* ========================== */}
                {/* DESKTOP TABELA COMPLETA    */}
                {/* ========================== */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm text-gray-100">
                    <thead className="text-xs text-gray-400 border-b border-white/10">
                      <tr>
                        <th className="py-2 px-3 text-left w-8">#</th>
                        <th className="py-2 px-3 text-left">Time</th>
                        <th className="py-2 px-2 text-center">P</th>
                        <th className="py-2 px-2 text-center">J</th>
                        <th className="py-2 px-2 text-center">V</th>
                        <th className="py-2 px-2 text-center">E</th>
                        <th className="py-2 px-2 text-center">D</th>
                        <th className="py-2 px-2 text-center">GP</th>
                        <th className="py-2 px-2 text-center">GC</th>
                        <th className="py-2 px-2 text-center">SG</th>
                      </tr>
                    </thead>

                    <tbody>
                      {tabela.map((row, index) => {
                        const faixa = getFaixaClass(row.posicao);
                        const saldoClass = getSaldoClass(row.saldo);

                        return (
                          <tr
                            key={row.time_id}
                            className={`transition-all duration-150 ${faixa} border-b border-white/5 animate-fade-slide-up`}
                            style={{
                              animationDelay: `${index * 0.02}s`,
                            }}
                          >
                            <td className="py-2 px-3 text-gray-300">
                              {row.posicao}
                            </td>

                            <td className="py-2 px-3 flex items-center gap-3">
                              <div
                                className={`h-5 w-5 rounded-full border border-white/20 ${
                                  TEAM_COLORS[row.time_nome] ??
                                  "bg-white/20"
                                }`}
                              />
                              <span className="font-medium">
                                {row.time_nome}
                              </span>
                            </td>

                            <td className="py-2 px-2 text-center font-bold">
                              {row.pontos}
                            </td>
                            <td className="py-2 px-2 text-center">
                              {row.jogos}
                            </td>
                            <td className="py-2 px-2 text-center">
                              {row.vitorias}
                            </td>
                            <td className="py-2 px-2 text-center">
                              {row.empates}
                            </td>
                            <td className="py-2 px-2 text-center">
                              {row.derrotas}
                            </td>
                            <td className="py-2 px-2 text-center">
                              {row.gols_pro}
                            </td>
                            <td className="py-2 px-2 text-center">
                              {row.gols_contra}
                            </td>

                            <td
                              className={`py-2 px-2 text-center ${saldoClass}`}
                            >
                              {row.saldo > 0
                                ? `+${row.saldo}`
                                : row.saldo}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* ========================== */}
                {/* MOBILE - CARDS MODERNOS    */}
                {/* ========================== */}

                <div className="md:hidden mt-4 space-y-3">
                  {tabela.map((row, index) => {
                    const faixa = getFaixaClass(row.posicao);
                    const saldoClass = getSaldoClass(row.saldo);

                    return (
                      <div
                        key={row.time_id}
                        className={`
                          ${faixa}
                          rounded-xl p-4 border border-white/5 shadow-lg 
                          flex items-center justify-between
                          animate-fade-slide-up
                        `}
                        style={{
                          animationDelay: `${index * 0.03}s`,
                        }}
                      >
                        {/* POSIÇÃO */}
                        <div className="text-lg font-bold text-gray-200 w-8">
                          {row.posicao}
                        </div>

                        {/* TIME */}
                        <div className="flex-1 flex items-center gap-3">
                          <div
                            className={`h-5 w-5 rounded-full border border-white/20 ${
                              TEAM_COLORS[row.time_nome] ??
                              "bg-white/20"
                            }`}
                          />
                          <span className="font-medium text-sm">
                            {row.time_nome}
                          </span>
                        </div>

                        {/* PONTOS E SALDO */}
                        <div className="text-right">
                          <p className="text-emerald-400 font-bold">
                            {row.pontos} pts
                          </p>
                          <p
                            className={`text-xs ${saldoClass}`}
                          >
                            SG:{" "}
                            {row.saldo > 0
                              ? "+" + row.saldo
                              : row.saldo}
                          </p>
                          <p className="text-[11px] text-gray-400">
                            J: {row.jogos}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* LEGENDA */}
            <div className="mt-5 flex flex-wrap gap-4 text-xs text-gray-300">
              <div className="flex items-center gap-2">
                <span className="w-6 h-3 bg-emerald-700 rounded" />{" "}
                Libertadores (G4)
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-3 bg-sky-700 rounded" />{" "}
                Pré-Libertadores (5–6)
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-3 bg-red-800 rounded" />{" "}
                Rebaixamento (Z4)
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
