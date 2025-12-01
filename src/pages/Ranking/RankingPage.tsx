import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../../config/api";
import { AppLayout } from "../../layout/AppLayout";
import { Card, CardContent } from "../../components/ui/card";
import { Crown } from "lucide-react";

/* -------------------------------------------------------
   TIPOS
------------------------------------------------------- */

type RankingRow = {
  usuario: string;
  pontos: number;
  precisao: number;
  palpites: number;
  is_you?: boolean;
};

type Periodo = "semanal" | "mensal" | "geral";

/* -------------------------------------------------------
   COMPONENTE
------------------------------------------------------- */

export function RankingPage() {
  const [periodo, setPeriodo] = useState<Periodo>("geral");
  const [ranking, setRanking] = useState<RankingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchRanking(p: Periodo) {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token") ?? "";
      const resp = await axios.get(
        `${API_BASE}/ranking/${p}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const lista = resp.data?.ranking ?? resp.data ?? [];

      const normalizada: RankingRow[] = lista.map((item: any, i: number) => ({
        usuario: item.usuario ?? item.nome ?? `Usuário ${i + 1}`,
        pontos: Number(item.pontos ?? 0),
        precisao: Number(item.precisao ?? 0),
        palpites: Number(item.palpites ?? 0),
        is_you: Boolean(item.is_you),
      }));

      setRanking(normalizada);
    } catch {
      setError("Não foi possível carregar o ranking.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRanking(periodo);
  }, [periodo]);

  const tabs = [
    { label: "Semanal", value: "semanal" as Periodo },
    { label: "Mensal", value: "mensal" as Periodo },
    { label: "Geral", value: "geral" as Periodo },
  ];

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto w-full space-y-6">

        {/* TÍTULO */}
        <header className="flex items-center gap-3 animate-fade-slide-up">
          <Crown className="w-9 h-9 text-emerald-400" />
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-primary">
              Ranking de Palpiteiros
            </h1>
            <p className="text-mutedForeground text-sm">
              Veja sua colocação entre os torcedores.
            </p>
          </div>
        </header>

        {/* CARD PRINCIPAL */}
        <Card className="bg-white/5 border border-white/10 rounded-2xl shadow-xl backdrop-blur-xl animate-fade-slide-up">
          <CardContent className="p-0">

            {/* TABS */}
            <div className="flex justify-center pt-4 pb-3">
              <div className="inline-flex bg-black/30 border border-white/10 rounded-full p-1">
                {tabs.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setPeriodo(t.value)}
                    className={`
                      px-6 py-2 text-sm rounded-full transition-all
                      ${
                        periodo === t.value
                          ? "bg-emerald-500 text-black font-semibold shadow-md shadow-emerald-500/30"
                          : "text-gray-300 hover:bg-white/5"
                      }
                    `}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* LOADING / ERRO */}
            {loading && (
              <p className="text-gray-300 text-center py-6">Carregando...</p>
            )}

            {error && (
              <p className="text-red-400 text-center py-6">{error}</p>
            )}

            {/* ============================= */}
            {/* TABELA DESKTOP               */}
            {/* ============================= */}
            {!loading && !error && (
              <div className="hidden md:block overflow-x-auto pb-4">
                <table className="w-full text-sm text-gray-100">
                  <thead className="text-xs text-gray-400 border-y border-white/10">
                    <tr>
                      <th className="py-3 px-4 text-left w-20">#</th>
                      <th className="py-3 px-4 text-left">Usuário</th>
                      <th className="py-3 px-4 text-right">Pontos</th>
                      <th className="py-3 px-4 text-right">Precisão</th>
                      <th className="py-3 px-4 text-right">Palpites</th>
                    </tr>
                  </thead>

                  <tbody>
                    {ranking.map((r, i) => {
                      const pos = i + 1;
                      const isYou = r.is_you;

                      return (
                        <tr
                          key={i}
                          className={`
                            border-b border-white/5 transition-all duration-150
                            ${isYou ? "bg-emerald-700/40 hover:bg-emerald-700/60" : "hover:bg-white/5"}
                            animate-fade-slide-up
                          `}
                          style={{ animationDelay: `${i * 0.02}s` }}
                        >
                          {/* POSIÇÃO */}
                          <td className="py-3 px-4">
                            {i < 3 ? (
                              <Crown
                                className={`
                                  w-5 h-5
                                  ${i === 0 ? "text-yellow-300" : ""}
                                  ${i === 1 ? "text-gray-300" : ""}
                                  ${i === 2 ? "text-amber-300" : ""}
                                `}
                              />
                            ) : (
                              <span className="text-gray-400">#{pos}</span>
                            )}
                          </td>

                          {/* USUÁRIO */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`
                                  h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold
                                  ${isYou ? "bg-emerald-500 text-black" : "bg-emerald-700/50 text-emerald-200"}
                                `}
                              >
                                {r.usuario.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-medium">
                                {isYou ? `${r.usuario} (Você)` : r.usuario}
                              </span>
                            </div>
                          </td>

                          <td className="py-3 px-4 text-right font-semibold">{r.pontos}</td>
                          <td className="py-3 px-4 text-right">{r.precisao.toFixed(1)}%</td>
                          <td className="py-3 px-4 text-right">{r.palpites}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* ============================= */}
            {/* MOBILE - CARDS MODERNOS       */}
            {/* ============================= */}
            {!loading && !error && (
              <div className="md:hidden p-4 space-y-3">
                {ranking.map((r, i) => {
                  const pos = i + 1;
                  const isYou = r.is_you;

                  return (
                    <div
                      key={i}
                      className={`
                        p-4 rounded-xl border border-white/10 shadow-lg 
                        flex items-center justify-between
                        ${isYou ? "bg-emerald-800/40" : "bg-white/5"}
                        animate-fade-slide-up
                      `}
                      style={{ animationDelay: `${i * 0.03}s` }}
                    >
                      {/* POSIÇÃO */}
                      <div className="w-10 flex justify-center">
                        {i < 3 ? (
                          <Crown
                            className={`
                              w-6 h-6
                              ${i === 0 ? "text-yellow-300" : ""}
                              ${i === 1 ? "text-gray-300" : ""}
                              ${i === 2 ? "text-amber-300" : ""}
                            `}
                          />
                        ) : (
                          <span className="text-gray-400 font-semibold">#{pos}</span>
                        )}
                      </div>

                      {/* USUÁRIO */}
                      <div className="flex-1 px-3">
                        <p className="font-semibold">
                          {isYou ? `${r.usuario} (Você)` : r.usuario}
                        </p>
                        <p className="text-xs text-gray-400">
                          {r.palpites} palpites • {r.precisao.toFixed(1)}%
                        </p>
                      </div>

                      {/* PONTOS */}
                      <div className="text-right font-bold text-emerald-400">
                        {r.pontos} pts
                      </div>
                    </div>
                  );
                })}

                {ranking.length === 0 && (
                  <p className="text-center py-4 text-gray-400">
                    Nenhum dado disponível.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
