// src/pages/Partida/PartidaPage.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

import { AppLayout } from "../../layout/AppLayout";
import { Card, CardContent } from "../../components/ui/card";
import { ArrowLeft, Clock, MapPin, Users } from "lucide-react";
import { API_BASE } from "../../config/api";


/* -------------------------------------------------------
   TIPOS
------------------------------------------------------- */

type TeamInfo = {
  id?: string;
  nome: string;
  escudo?: string | null;
};

type PartidaDetalhe = {
  id_partida: string;
  time_casa: TeamInfo;
  time_fora: TeamInfo;
  data: string;
  horario: string;
  status?: string | null;
  placar_casa?: number | null;
  placar_fora?: number | null;
  estadio?: string | null;
  cidade?: string | null;
  publico?: number | null;
};

/* -------------------------------------------------------
   HELPERS
------------------------------------------------------- */

function formatarDataLonga(dataISO: string) {
  try {
    const [year, month, day] = dataISO.split("-");
    const d = new Date(Number(year), Number(month) - 1, Number(day));
    return d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dataISO;
  }
}

function formatarHorario(horario: string) {
  try {
    const [h, m] = horario.split(":");
    const d = new Date();
    d.setHours(Number(h), Number(m), 0, 0);
    return d.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return horario;
  }
}

function getStatusInfo(partida: PartidaDetalhe | null) {
  if (!partida) {
    return { label: "Carregando...", classes: "bg-slate-600 text-slate-100" };
  }

  const raw = (partida.status || "").toLowerCase();

  if (["ft", "finished", "finalizado", "final"].some((s) => raw.includes(s))) {
    return {
      label: "Finalizado",
      classes: "bg-emerald-500 text-emerald-950",
    };
  }

  try {
    const start = new Date(`${partida.data}T${partida.horario}`);
    const now = new Date();
    const diffMs = start.getTime() - now.getTime();
    const durationMs = 2 * 60 * 60 * 1000;

    if (diffMs <= 0 && now.getTime() <= start.getTime() + durationMs) {
      return {
        label: "Ao vivo",
        classes: "bg-red-500 text-red-50",
      };
    }

    if (diffMs > 0) {
      return {
        label: "Em breve",
        classes: "bg-amber-500 text-amber-950",
      };
    }
  } catch {}

  return {
    label: "Indefinido",
    classes: "bg-slate-500 text-slate-100",
  };
}

/* -------------------------------------------------------
   COMPONENTE
------------------------------------------------------- */

type Aba = "resumo" | "estatisticas" | "escalacoes";

export function PartidaPage() {
  // CORRIGIDO AQUI
  const { event_id } = useParams<{ event_id: string }>();
  const navigate = useNavigate();

  const [partida, setPartida] = useState<PartidaDetalhe | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [abaAtiva, setAbaAtiva] = useState<Aba>("resumo");

  async function fetchPartidaDetalhes(id: string) {
    try {
      setLoading(true);
      setErro(null);

      const resp = await axios.get(
        `${API_BASE}/colecao/partidas/resultado/${id}`
      );

      let raw: any = resp.data;

      if (raw && Array.isArray(raw.events)) {
        raw = raw.events[0];
      } else if (raw && raw.event && !Array.isArray(raw.event)) {
        raw = raw.event;
      } else if (Array.isArray(raw)) {
        raw = raw[0];
      }

      const data = raw || {};

      const detalhe: PartidaDetalhe = {
        id_partida: String(data.idEvent ?? id),
        time_casa: {
          nome:
            data.time_casa?.nome ??
            data.time_casa_nome ??
            data.strHomeTeam ??
            "Time da Casa",
          escudo:
            data.time_casa?.escudo ??
            data.time_casa_escudo ??
            data.strHomeBadge ??
            null,
          id: data.time_casa?.id ?? data.idHomeTeam,
        },
        time_fora: {
          nome:
            data.time_fora?.nome ??
            data.time_fora_nome ??
            data.strAwayTeam ??
            "Time Visitante",
          escudo:
            data.time_fora?.escudo ??
            data.time_fora_escudo ??
            data.strAwayBadge ??
            null,
          id: data.time_fora?.id ?? data.idAwayTeam,
        },
        data: data.data ?? data.dateEvent ?? "",
        horario: data.horario ?? data.strTime ?? "",
        status: data.status ?? data.strStatus ?? null,
        placar_casa:
          data.placar_casa ??
          data.gols_casa ??
          (data.intHomeScore != null ? Number(data.intHomeScore) : null),
        placar_fora:
          data.placar_fora ??
          data.gols_fora ??
          (data.intAwayScore != null ? Number(data.intAwayScore) : null),
        estadio: data.estadio ?? data.strVenue ?? null,
        cidade: data.cidade ?? data.strCity ?? null,
        publico:
          data.publico ??
          (data.intAttendance != null ? Number(data.intAttendance) : null),
      };

      setPartida(detalhe);
    } catch (e) {
      console.error("Erro ao buscar detalhes da partida:", e);
      setErro("Não foi possível carregar os detalhes da partida.");
    } finally {
      setLoading(false);
    }
  }

  // CORRIGIDO AQUI
  useEffect(() => {
    if (event_id) {
      fetchPartidaDetalhes(event_id);
    } else {
      setLoading(false);
      setErro("Partida não encontrada.");
    }
  }, [event_id]);

  const statusInfo = getStatusInfo(partida);

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto w-full px-4 md:px-0">
        
        {/* Cabeçalho */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-white/5 text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-primary">
            Detalhes da Partida
          </h1>
        </div>

        {/* Card principal */}
        <Card className="bg-white/5 border border-white/10 rounded-2xl shadow-xl mb-8">
          <CardContent className="p-6 md:p-8">
            {loading ? (
              <p className="text-gray-300">Carregando informações...</p>
            ) : erro ? (
              <p className="text-red-300 text-sm">{erro}</p>
            ) : partida ? (
              <>
                {/* STATUS */}
                <div className="flex justify-center mb-4">
                  <span
                    className={`text-xs font-semibold px-4 py-1 rounded-full ${statusInfo.classes}`}
                  >
                    {statusInfo.label}
                  </span>
                </div>

                {/* TIMES E PLACAR */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-16 mb-6">
                  
                  {/* CASA */}
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-16 w-16 rounded-full bg-white/10 overflow-hidden flex items-center justify-center">
                      {partida.time_casa.escudo && (
                        <img
                          src={partida.time_casa.escudo}
                          alt={partida.time_casa.nome}
                          className="h-14 w-14 object-contain"
                          onError={(e) => {
                            e.currentTarget.src = "/default-team.png";
                          }}
                        />
                      )}
                    </div>
                    <p className="font-semibold text-lg">
                      {partida.time_casa.nome}
                    </p>
                  </div>

                  {/* PLACAR */}
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-4xl md:text-5xl font-bold">
                      {partida.placar_casa ?? "-"} <span className="mx-2">-</span>{" "}
                      {partida.placar_fora ?? "-"}
                    </p>
                    <p className="text-xs md:text-sm text-gray-300">
                      {partida.data
                        ? formatarDataLonga(partida.data)
                        : "Data indefinida"}
                    </p>
                  </div>

                  {/* FORA */}
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-16 w-16 rounded-full bg-white/10 overflow-hidden flex items-center justify-center">
                      {partida.time_fora.escudo && (
                        <img
                          src={partida.time_fora.escudo}
                          alt={partida.time_fora.nome}
                          className="h-14 w-14 object-contain"
                          onError={(e) => {
                            e.currentTarget.src = "/default-team.png";
                          }}
                        />
                      )}
                    </div>
                    <p className="font-semibold text-lg">
                      {partida.time_fora.nome}
                    </p>
                  </div>
                </div>

                {/* INFORMAÇÕES COMPLEMENTARES */}
                <div className="flex flex-wrap items-center justify-center gap-4 text-xs md:text-sm text-gray-300">
                  {partida.horario && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{formatarHorario(partida.horario)}</span>
                    </div>
                  )}

                  {partida.estadio && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {partida.estadio}
                        {partida.cidade ? `, ${partida.cidade}` : ""}
                      </span>
                    </div>
                  )}

                  {typeof partida.publico === "number" && (
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>
                        Público: {partida.publico.toLocaleString("pt-BR")}
                      </span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <p className="text-gray-300 text-sm">
                Nenhuma informação encontrada para esta partida.
              </p>
            )}
          </CardContent>
        </Card>

        {/* ABAS */}
        <div className="flex justify-center mb-4">
          <div className="inline-flex bg-slate-900/80 border border-white/10 rounded-full p-1">
            {[
              { id: "resumo", label: "Resumo" },
              { id: "estatisticas", label: "Estatísticas" },
              { id: "escalacoes", label: "Escalações" },
            ].map((aba) => (
              <button
                key={aba.id}
                onClick={() => setAbaAtiva(aba.id as Aba)}
                className={`px-4 py-1 text-xs md:text-sm rounded-full transition-all ${
                  abaAtiva === aba.id
                    ? "bg-emerald-500 text-emerald-950 font-semibold"
                    : "text-gray-300 hover:bg-white/5"
                }`}
              >
                {aba.label}
              </button>
            ))}
          </div>
        </div>

        {/* CONTEÚDO DAS ABAS */}
        <Card className="bg-white/5 border border-white/10 rounded-2xl shadow-xl">
          <CardContent className="p-5 md:p-6">

            {abaAtiva === "resumo" && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold mb-2">Resumo</h2>
                <p className="text-sm text-gray-300">
                  Em breve você poderá acompanhar aqui a timeline completa da partida.
                </p>
              </div>
            )}

            {abaAtiva === "estatisticas" && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold mb-2">Estatísticas</h2>
                <p className="text-sm text-gray-300">
                  Estatísticas detalhadas serão exibidas aqui assim que disponíveis.
                </p>
              </div>
            )}

            {abaAtiva === "escalacoes" && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold mb-2">Escalações</h2>
                <p className="text-sm text-gray-300">
                  As escalações dos times aparecerão aqui em breve.
                </p>
              </div>
            )}

          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
