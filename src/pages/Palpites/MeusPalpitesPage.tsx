import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import { AppLayout } from "../../layout/AppLayout";
import { Card, CardContent } from "../../components/ui/card";
import { ArrowRight, BadgeCheck, XCircle, Clock } from "lucide-react";

/* ---------------------------------------------
   TYPES
--------------------------------------------- */

type Team = {
  id?: string;
  nome: string;
  escudo: string | null;
};

type Resultado = {
  id_partida: string;
  status: string | null;

  time_casa: Team;
  time_fora: Team;

  placar_casa: number | null;
  placar_fora: number | null;

  data?: string | null;
  horario?: string | null;
};

type PalpiteApi = {
  id: number;
  partida_id: number | string;
  palpite_gols_casa: number;
  palpite_gols_visitante: number;
  acertou: boolean | null;
};

/* ---------------------------------------------
   STATUS LOGIC
--------------------------------------------- */

function getStatus(acertou: boolean | null, statusApi: string | null) {
  if (acertou === true)
    return {
      label: "Você acertou!",
      color: "text-emerald-400",
      icon: <BadgeCheck className="w-4 h-4 text-emerald-400" />,
    };

  if (acertou === false)
    return {
      label: "Não foi dessa vez!",
      color: "text-red-300",
      icon: <XCircle className="w-4 h-4 text-red-300" />,
    };

  if (statusApi && /match finished|full time|finished/i.test(statusApi))
    return {
      label: "Finalizado",
      color: "text-gray-300",
      icon: <Clock className="w-4 h-4 text-gray-300" />,
    };

  if (statusApi && /live|in play|half|1st|2nd|ao vivo/i.test(statusApi))
    return {
      label: "Ao vivo",
      color: "text-yellow-300",
      icon: <Clock className="w-4 h-4 text-yellow-300" />,
    };

  return {
    label: "Aguardando",
    color: "text-amber-200",
    icon: <Clock className="w-4 h-4 text-amber-200" />,
  };
}

/* ---------------------------------------------
   COMPONENTE PRINCIPAL
--------------------------------------------- */

export function MeusPalpitesPage() {
  const [palpites, setPalpites] = useState<PalpiteApi[]>([]);
  const [resultadosMap, setResultadosMap] = useState<Map<string, Resultado>>(
    new Map()
  );
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const API_BASE = import.meta.env.VITE_API_URL;

  async function processarPalpitesAutomatico() {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await axios.post(
        `${API_BASE}/palpites/processar-automatico`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch {}
  }

  useEffect(() => {
    async function carregarTudo() {
      try {
        setLoading(true);

        const token = localStorage.getItem("token");
        if (!token) return;

        await processarPalpitesAutomatico();

        const respPalpites = await axios.get<PalpiteApi[]>(
          `${API_BASE}/palpites/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const palps = respPalpites.data ?? [];
        setPalpites(palps);

        const ids = Array.from(new Set(palps.map((p) => String(p.partida_id))));

        const respostas = await Promise.all(
          ids.map((id) =>
            axios
              .get<Resultado | null>(`${API_BASE}/partidas/resultado/${id}`)
              .then((r) => r.data)
              .catch(() => null)
          )
        );

        const mapa = new Map<string, Resultado>();
        respostas.forEach((res, i) => {
          if (res) mapa.set(ids[i], res);
        });

        setResultadosMap(mapa);
      } finally {
        setLoading(false);
      }
    }

    carregarTudo();
  }, []);

  const lista = useMemo(
    () =>
      palpites
        .slice()
        .sort((a, b) => Number(b.id) - Number(a.id))
        .map((p) => ({
          palpite: p,
          resultado: resultadosMap.get(String(p.partida_id)) ?? null,
        })),
    [palpites, resultadosMap]
  );

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto w-full px-4 space-y-10">
        <header>
          <h1 className="text-4xl font-bold text-primary">Meus Palpites</h1>
          <p className="text-gray-400">Acompanhe seus palpites e desempenho.</p>
        </header>

        {loading && <p className="text-gray-300">Carregando...</p>}

        {!loading && lista.length === 0 && (
          <p className="text-gray-400">Você ainda não fez nenhum palpite.</p>
        )}

        {/* LISTA */}
        <section className="space-y-6 pb-10">
          {lista.map(({ palpite, resultado }) => {
            const status = getStatus(palpite.acertou, resultado?.status || null);

            return (
              <Card
                key={palpite.id}
                className="bg-white/5 border border-white/10 rounded-2xl shadow-xl"
              >
                <CardContent
                  className="
                    py-4 px-4 md:px-6
                    flex flex-col gap-6
                    sm:flex-row sm:items-center sm:justify-between
                  "
                >
                  {/* BLOCO DO TIME + PLACAR */}
                  <div
                    className="
                      flex flex-col sm:flex-row
                      items-center sm:items-center
                      gap-3 flex-1 overflow-hidden
                    "
                  >
                    {/* CASA */}
                    <div className="flex items-center gap-2 min-w-0">
                      <img
                        src={resultado?.time_casa?.escudo ?? ""}
                        className="h-10 w-10 object-contain"
                        onError={(e) => (e.currentTarget.style.opacity = "0")}
                      />
                      <span className="font-semibold text-white truncate">
                        {resultado?.time_casa?.nome ?? "Time Casa"}
                      </span>
                    </div>

                    {/* PLACAR */}
                    <div
                      className="
                        text-xl font-bold whitespace-nowrap
                        text-center
                        sm:text-left
                      "
                    >
                      {resultado?.placar_casa ?? "-"}{" "}
                      <span className="mx-1">x</span>{" "}
                      {resultado?.placar_fora ?? "-"}
                    </div>

                    {/* FORA */}
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-semibold text-white truncate">
                        {resultado?.time_fora?.nome ?? "Time Fora"}
                      </span>
                      <img
                        src={resultado?.time_fora?.escudo ?? ""}
                        className="h-10 w-10 object-contain"
                        onError={(e) => (e.currentTarget.style.opacity = "0")}
                      />
                    </div>
                  </div>

                  {/* BLOCO DO PALPITE */}
                  <div
                    className="
                      flex flex-col min-w-[120px]
                      text-center sm:text-right
                    "
                  >
                    <p className="text-sm text-gray-400">Seu palpite</p>
                    <p className="font-semibold text-emerald-300 text-lg">
                      {palpite.palpite_gols_casa} x {palpite.palpite_gols_visitante}
                    </p>

                    <div className="flex items-center gap-2 mt-1 text-sm justify-center sm:justify-end">
                      {status.icon}
                      <span className={status.color}>{status.label}</span>
                    </div>
                  </div>

                  {/* BOTÃO */}
                  <button
                    onClick={() => navigate(`/partida/${palpite.partida_id}`)}
                    className="
                      w-full sm:w-auto
                      flex items-center justify-center gap-2
                      px-4 py-2 rounded-lg
                      bg-primary text-black font-semibold
                      hover:bg-primary/80 transition
                    "
                  >
                    Ver partida
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </CardContent>
              </Card>
            );
          })}
        </section>
      </div>
    </AppLayout>
  );
}
