// src/pages/Loja/LojaPage.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import type { ReactNode } from "react";

import { AppLayout } from "../../layout/AppLayout";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { API_BASE } from "../../config/api";

import {
  Package,
  Gift,
  Trophy,
  Shield,
  Coins,
  Target,
  Star,
  Crown,
  X,
} from "lucide-react";

/* -------------------------------------------------------
   TIPOS
------------------------------------------------------- */

type Pacote = {
  id: number;
  nome: string;
  preco_moedas: number;
  quantidade_figurinhas: number;
  tipo: "bronze" | "prata" | "ouro" | "meu_time";
};

type UsuarioPerfil = {
  coins: number;
  time_do_coracao: string | null;
};

type FigurinhaSorteada = {
  id: number;
  numero: number;
  nome: string;
  posicao?: string | null;
  time?: string | null;
  raridade: "comum" | "rara" | "epica" | "lendaria";
  imagem_url?: string | null;
  nova: boolean;
};

type AbrirPacoteResponse = {
  pacote_id_temporario: number;
  figurinhas: FigurinhaSorteada[];
  novas: number;
  repetidas: number;
  raridades: { [key: string]: number };
  progresso_atual: number;
  moedas_restantes: number;
};

type AlbumResponse = {
  colecao_id: number;
  nome_colecao: string;
  ano: number;
  total_figurinhas: number;
  coletadas: number;
  progresso: number | null; // pode vir null do backend
  figurinhas: any[];
};

type ModalStep = "none" | "confirm" | "opening" | "reveal" | "summary";

/* -------------------------------------------------------
   DADOS ESTÁTICOS
------------------------------------------------------- */

const PACOTES: Pacote[] = [
  {
    id: 1,
    nome: "Pacote Bronze",
    preco_moedas: 100,
    quantidade_figurinhas: 5,
    tipo: "bronze",
  },
  {
    id: 2,
    nome: "Pacote Prata",
    preco_moedas: 250,
    quantidade_figurinhas: 7,
    tipo: "prata",
  },
  {
    id: 3,
    nome: "Pacote Ouro",
    preco_moedas: 500,
    quantidade_figurinhas: 10,
    tipo: "ouro",
  },
  {
    id: 4,
    nome: "Pacote do Meu Time",
    preco_moedas: 200,
    quantidade_figurinhas: 4,
    tipo: "meu_time",
  },
];

/* -------------------------------------------------------
   OVERLAY MODAL
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
            <X className="w-4 h-4" />
          </button>
        )}
        <div className="p-8">{children}</div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------
   HELPERS
------------------------------------------------------- */

function descricaoPrincipalDoPacote(pacote: Pacote): string {
  switch (pacote.tipo) {
    case "bronze":
      return "Pacote básico com figurinhas comuns";
    case "prata":
      return "Pacote intermediário com chance de raras";
    case "ouro":
      return "Pacote premium com figurinhas especiais";
    case "meu_time":
    default:
      return "Figurinhas exclusivas do seu time do coração";
  }
}

function descricaoSecundariaDoPacote(pacote: Pacote, timeCoracao: string) {
  switch (pacote.tipo) {
    case "bronze":
      return `${pacote.quantidade_figurinhas} figurinhas comuns`;
    case "prata":
      return `${pacote.quantidade_figurinhas} figurinhas (1 rara garantida)`;
    case "ouro":
      return `${pacote.quantidade_figurinhas} figurinhas (3 raras garantidas)`;
    case "meu_time":
    default:
      return `${pacote.quantidade_figurinhas} figurinhas do ${timeCoracao}`;
  }
}

function numeroFigurinhaFormatado(numero: number) {
  return `#${String(numero).padStart(3, "0")}`;
}

function calcularRarasPlus(raridades?: { [key: string]: number }): number {
  if (!raridades) return 0;
  const rara = raridades["rara"] ?? 0;
  const epica = raridades["epica"] ?? 0;
  const lendaria = raridades["lendaria"] ?? 0;
  return rara + epica + lendaria;
}

/* -------------------------------------------------------
   COMPONENTE PRINCIPAL
------------------------------------------------------- */

export function LojaPage() {
  const [usuario, setUsuario] = useState<UsuarioPerfil | null>(null);
  const [loadingPerfil, setLoadingPerfil] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  // fluxo dos modais
  const [modalStep, setModalStep] = useState<ModalStep>("none");
  const [pacoteSelecionado, setPacoteSelecionado] = useState<Pacote | null>(
    null
  );

  // estados da compra
  const [comprandoId, setComprandoId] = useState<number | null>(null);
  const [abrirDados, setAbrirDados] = useState<AbrirPacoteResponse | null>(
    null
  );
  const [albumResumo, setAlbumResumo] = useState<AlbumResponse | null>(null);
  const [confirmandoColecao, setConfirmandoColecao] = useState(false);

  async function fetchPerfil() {
    try {
      setLoadingPerfil(true);
      const token = localStorage.getItem("token") ?? "";
      const resp = await axios.get<UsuarioPerfil>(
        `${API_BASE}/usuarios/me`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsuario(resp.data);
    } catch (err) {
      console.error("Erro ao carregar perfil na Loja:", err);
      setErro("Não foi possível carregar seu saldo no momento.");
    } finally {
      setLoadingPerfil(false);
    }
  }

  useEffect(() => {
    fetchPerfil();
  }, []);

  const saldo = usuario?.coins ?? 0;
  const timeCoracao = usuario?.time_do_coracao ?? "seu time do coração";

  function abrirModalConfirmacao(pacote: Pacote) {
    if (saldo < pacote.preco_moedas) return;
    setPacoteSelecionado(pacote);
    setAbrirDados(null);
    setAlbumResumo(null);
    setErro(null);
    setModalStep("confirm");
  }

  function fecharTodosModais() {
    setModalStep("none");
    setPacoteSelecionado(null);
    setAbrirDados(null);
    setAlbumResumo(null);
    setComprandoId(null);
  }

  async function handleConfirmarCompra() {
    if (!pacoteSelecionado) return;

    try {
      setErro(null);
      setComprandoId(pacoteSelecionado.id);

      const token = localStorage.getItem("token") ?? "";

      const resp = await axios.post<AbrirPacoteResponse>(
        `${API_BASE}/colecao/comprar/${pacoteSelecionado.id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = resp.data;
      setAbrirDados(data);

      // atualiza saldo na UI
      setUsuario((prev) =>
        prev
          ? { ...prev, coins: data.moedas_restantes }
          : { coins: data.moedas_restantes, time_do_coracao: timeCoracao }
      );

      setModalStep("opening");

      setTimeout(() => {
        setModalStep("reveal");
      }, 900);
    } catch (err) {
      console.error("Erro ao comprar pacote:", err);
      setErro("Não foi possível concluir a compra. Tente novamente.");
      setModalStep("none");
    } finally {
      setComprandoId(null);
    }
  }

  async function handleInserirNaColecao() {
    if (!abrirDados) return;

    try {
      setConfirmandoColecao(true);
      setErro(null);

      const token = localStorage.getItem("token") ?? "";

      const resp = await axios.post<AlbumResponse>(
        `${API_BASE}/colecao/pacote/confirmar`,
        null,
        {
          params: { pacote_temp_id: abrirDados.pacote_id_temporario },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setAlbumResumo(resp.data);
      setModalStep("summary");
    } catch (err) {
      console.error("Erro ao confirmar pacote:", err);
      setErro("Não foi possível inserir as figurinhas na coleção.");
    } finally {
      setConfirmandoColecao(false);
    }
  }

  const rarasPlus = calcularRarasPlus(abrirDados?.raridades);

  // PROGRESSO SEGURO (evita erro do toFixed)
  const progressoAlbum: number = (() => {
    if (typeof albumResumo?.progresso === "number") {
      return albumResumo.progresso;
    }
    if (typeof abrirDados?.progresso_atual === "number") {
      return abrirDados.progresso_atual;
    }
    return 0;
  })();

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto w-full space-y-10">
        {/* CABEÇALHO */}
        <header className="flex items-center justify-between animate-fade-slide-up">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-emerald-400" />
            <div>
              <h1 className="text-4xl font-bold text-white">Loja de Pacotes</h1>
              <p className="text-gray-400 text-sm">
                Use suas moedas para desbloquear novos pacotes de figurinhas.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2 text-sm">
            <Coins className="w-4 h-4 text-emerald-400" />
            <span className="text-gray-200">
              <span className="font-semibold">Saldo:</span>{" "}
              <span className="text-emerald-400 font-bold">
                {loadingPerfil ? "..." : `${saldo} moedas`}
              </span>
            </span>
          </div>
        </header>

        {/* ERRO GLOBAL */}
        {erro && (
          <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/30 px-4 py-2 rounded-lg">
            {erro}
          </div>
        )}

        {/* CARDS DOS PACOTES */}
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {PACOTES.map((pacote) => {
            const semSaldo = saldo < pacote.preco_moedas;
            const isOuro = pacote.tipo === "ouro";
            const isMeuTime = pacote.tipo === "meu_time";

            const descricaoPrincipal = descricaoPrincipalDoPacote(pacote);
            const descricaoSecundaria = descricaoSecundariaDoPacote(
              pacote,
              timeCoracao
            );

            return (
              <Card
                key={pacote.id}
                className="
                  flex flex-col items-center text-center
                  bg-white/5 backdrop-blur-sm
                  border border-white/10 rounded-2xl
                  shadow-lg shadow-black/20
                  transition-all duration-300
                  hover:-translate-y-1 hover:bg-white/10
                "
              >
                {/* TAGS */}
                <div className="w-full flex justify-end pr-4 pt-3">
                  {pacote.tipo === "bronze" && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-900/40 text-amber-300 border border-amber-500/40">
                      Bronze
                    </span>
                  )}
                  {pacote.tipo === "prata" && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-700/50 text-gray-200 border border-slate-300/30">
                      Silver
                    </span>
                  )}
                  {isOuro && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-yellow-400 text-black border border-yellow-600/30 flex items-center gap-1 font-semibold">
                      <Crown className="w-3 h-3" />
                      Popular
                    </span>
                  )}
                  {isMeuTime && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500 text-black border border-emerald-600/30 font-semibold">
                      Meu Time
                    </span>
                  )}
                </div>

                {/* ÍCONE */}
                <div className="mt-4 flex items-center justify-center h-14 w-14 rounded-2xl bg-white/5 border border-white/10">
                  {pacote.tipo === "bronze" && (
                    <Package className="w-7 h-7 text-yellow-400" />
                  )}
                  {pacote.tipo === "prata" && (
                    <Gift className="w-7 h-7 text-slate-100" />
                  )}
                  {pacote.tipo === "ouro" && (
                    <Trophy className="w-7 h-7 text-yellow-300" />
                  )}
                  {pacote.tipo === "meu_time" && (
                    <Shield className="w-7 h-7 text-emerald-400" />
                  )}
                </div>

                {/* TÍTULO */}
                <h2 className="mt-4 text-lg font-semibold text-white">
                  {pacote.tipo === "meu_time"
                    ? "Pacote do Meu Time"
                    : pacote.nome}
                </h2>

                {/* DESCRIÇÃO */}
                <p className="text-xs text-gray-300 px-4 mt-1">
                  {descricaoPrincipal}
                </p>
                <p className="text-sm text-gray-100 px-4 mt-2">
                  {descricaoSecundaria}
                </p>

                {/* PREÇO */}
                <div className="mt-4 flex items-center justify-center gap-2 text-emerald-400">
                  <Coins className="w-4 h-4" />
                  <span className="text-lg font-bold">
                    {pacote.preco_moedas}
                  </span>
                </div>

                {/* BOTÃO */}
                <div className="mt-4 mb-6 w-full px-6">
                  <Button
                    disabled={semSaldo || comprandoId !== null}
                    onClick={() => abrirModalConfirmacao(pacote)}
                    className="
                      w-full bg-emerald-500 hover:bg-emerald-600 
                      text-black font-semibold rounded-xl
                      disabled:opacity-60 disabled:cursor-not-allowed
                    "
                  >
                    {semSaldo ? "Saldo insuficiente" : "Comprar"}
                  </Button>
                </div>
              </Card>
            );
          })}
        </section>

        {/* COMO CONSEGUIR MAIS MOEDAS */}
        <section>
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                Como conseguir mais moedas?
              </h2>

              <div className="grid gap-6 md:grid-cols-3">
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                    <Target className="w-5 h-5 text-emerald-400" />
                  </div>
                  <p className="font-semibold">Acerte Palpites</p>
                  <p className="text-xs text-gray-300 px-3">
                    Ganhe moedas ao acertar suas previsões de jogos.
                  </p>
                </div>

                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                    <Star className="w-5 h-5 text-emerald-400" />
                  </div>
                  <p className="font-semibold">Complete Álbuns</p>
                  <p className="text-xs text-gray-300 px-3">
                    Receba bônus especiais ao completar coleções.
                  </p>
                </div>

                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                    <Crown className="w-5 h-5 text-emerald-400" />
                  </div>
                  <p className="font-semibold">Ranking Semanal</p>
                  <p className="text-xs text-gray-300 px-3">
                    Prêmios extras para os melhores da semana.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* =====================================================================
            MODAIS
        ====================================================================== */}

        {/* MODAL 1 - CONFIRMAR COMPRA */}
        {modalStep === "confirm" && pacoteSelecionado && (
          <OverlayModal onClose={fecharTodosModais}>
            <div className="flex flex-col items-center text-center gap-6">
              <h2 className="text-2xl font-semibold text-white">
                Confirmar Compra
              </h2>

              <div className="flex flex-col items-center gap-3">
                <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                  {pacoteSelecionado.tipo === "bronze" && (
                    <Package className="w-9 h-9 text-yellow-400" />
                  )}
                  {pacoteSelecionado.tipo === "prata" && (
                    <Gift className="w-9 h-9 text-slate-100" />
                  )}
                  {pacoteSelecionado.tipo === "ouro" && (
                    <Trophy className="w-9 h-9 text-yellow-300" />
                  )}
                  {pacoteSelecionado.tipo === "meu_time" && (
                    <Shield className="w-9 h-9 text-emerald-400" />
                  )}
                </div>
                <div>
                  <p className="text-lg font-semibold">
                    {pacoteSelecionado.tipo === "meu_time"
                      ? "Pacote do Meu Time"
                      : pacoteSelecionado.nome}
                  </p>
                  <p className="text-sm text-gray-300 mt-1">
                    {descricaoSecundariaDoPacote(
                      pacoteSelecionado,
                      timeCoracao
                    )}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Coins className="w-4 h-4" />
                  <span className="text-lg font-bold">
                    {pacoteSelecionado.preco_moedas} moedas
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  Saldo atual:{" "}
                  <span className="font-semibold text-gray-200">
                    {saldo} moedas
                  </span>
                </p>
                <p className="text-xs text-gray-400">
                  Saldo após compra:{" "}
                  <span className="font-semibold text-emerald-400">
                    {saldo - pacoteSelecionado.preco_moedas} moedas
                  </span>
                </p>
              </div>

              <div className="flex gap-3 w-full justify-center mt-2">
                <Button
                  variant="outline"
                  onClick={fecharTodosModais}
                  className="bg-transparent border-white/20 text-gray-200 hover:bg-white/5"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleConfirmarCompra}
                  className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold"
                >
                  Confirmar Compra
                </Button>
              </div>
            </div>
          </OverlayModal>
        )}

        {/* MODAL 2 - ABRINDO PACOTE */}
        {modalStep === "opening" && pacoteSelecionado && (
          <OverlayModal>
            <div className="flex flex-col items-center text-center gap-6">
              <h2 className="text-2xl font-semibold text-white">
                Abrindo {pacoteSelecionado.nome}...
              </h2>

              <div className="flex flex-col items-center gap-4">
                <div className="h-20 w-20 rounded-3xl bg-white/5 border border-white/15 flex items-center justify-center animate-bounce">
                  <Package className="w-10 h-10 text-emerald-400" />
                </div>
                <p className="text-sm text-gray-300">
                  Preparando suas figurinhas...
                </p>
                <div className="flex gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse delay-150" />
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse delay-300" />
                </div>
              </div>
            </div>
          </OverlayModal>
        )}

        {/* MODAL 3 - REVELANDO FIGURINHAS */}
        {modalStep === "reveal" && abrirDados && pacoteSelecionado && (
          <OverlayModal onClose={fecharTodosModais}>
            <div className="flex flex-col gap-6">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-2">
                  Revelando suas figurinhas!
                </h2>
                <p className="text-sm text-gray-300">
                  Veja quem veio nesse pacote.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 max-h-72 overflow-y-auto px-2">
                {abrirDados.figurinhas.map((fig) => (
                  <div
                    key={fig.id}
                    className="bg-slate-800/80 border border-emerald-500/30 rounded-2xl py-4 px-4 flex flex-col items-center text-center"
                  >
                    <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center mb-3">
                      <Star className="w-5 h-5 text-emerald-400" />
                    </div>
                    <p className="font-semibold">{fig.nome}</p>
                    {fig.posicao && (
                      <p className="text-xs text-emerald-400 font-semibold">
                        {fig.posicao}
                      </p>
                    )}
                    {fig.time && (
                      <p className="text-xs text-gray-300 mt-1">{fig.time}</p>
                    )}
                    <p className="text-[11px] text-gray-400 mt-2">
                      {numeroFigurinhaFormatado(fig.numero)} •{" "}
                      {fig.raridade.toUpperCase()}
                    </p>
                    {fig.nova && (
                      <span className="mt-2 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        Nova na coleção
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-400">
                  Novas:{" "}
                  <span className="text-emerald-400 font-semibold">
                    {abrirDados.novas}
                  </span>{" "}
                  • Repetidas:{" "}
                  <span className="text-gray-200 font-semibold">
                    {abrirDados.repetidas}
                  </span>
                </p>

                <Button
                  onClick={handleInserirNaColecao}
                  disabled={confirmandoColecao}
                  className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold"
                >
                  {confirmandoColecao ? "Inserindo..." : "Inserir na coleção"}
                </Button>
              </div>
            </div>
          </OverlayModal>
        )}

        {/* MODAL 4 - PARABÉNS / PROGRESSO DO ÁLBUM */}
        {modalStep === "summary" && abrirDados && albumResumo && (
          <OverlayModal onClose={fecharTodosModais}>
            <div className="flex flex-col items-center text-center gap-6">
              <div>
                <h2 className="text-2xl font-semibold">
                  Parabéns! <span className="ml-1">🎉</span>
                </h2>
                <p className="text-sm text-gray-300 mt-2">
                  Você ganhou{" "}
                  <span className="font-semibold text-emerald-400">
                    {abrirDados.novas}
                  </span>{" "}
                  figurinhas novas!
                </p>
              </div>

              <div className="h-14 w-14 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Gift className="w-7 h-7 text-emerald-400" />
              </div>

              <div className="grid gap-4 md:grid-cols-3 w-full">
                <div className="bg-white/5 border border-white/10 rounded-xl py-3 px-4">
                  <p className="text-xs text-gray-300">Total de Figurinhas</p>
                  <p className="mt-2 text-2xl font-bold text-emerald-400">
                    {albumResumo.coletadas ?? 0}
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl py-3 px-4">
                  <p className="text-xs text-gray-300">Progresso do Álbum</p>
                  <p className="mt-2 text-2xl font-bold text-emerald-400">
                    {progressoAlbum.toFixed(1)}%
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl py-3 px-4">
                  <p className="text-xs text-gray-300">Novas Raras+</p>
                  <p className="mt-2 text-2xl font-bold text-emerald-400">
                    {rarasPlus}
                  </p>
                </div>
              </div>

              <Button
                onClick={() => {
                  fecharTodosModais();
                  fetchPerfil();
                }}
                className="mt-2 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold px-8"
              >
                Continuar
              </Button>
            </div>
          </OverlayModal>
        )}
      </div>
    </AppLayout>
  );
}
