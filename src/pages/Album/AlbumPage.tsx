// src/pages/Album/AlbumPage.tsx
import { useEffect, useState } from "react";
import axios from "axios";

import { AppLayout } from "../../layout/AppLayout";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { API_BASE } from "../../config/api";

import {
  Settings2,
  RefreshCw,
  PlusCircle,
  Trash2,
  ImageOff,
  Star,
} from "lucide-react";

/* -------------------------------------------------------
   TIPOS (alinhados ao backend)
------------------------------------------------------- */

type FigurinhaAlbum = {
  id: number;
  numero: number;
  nome: string;
  posicao: string | null;
  time: string | null;
  raridade: "comum" | "rara" | "epica" | "lendaria";
  imagem_url: string | null;
  possui: boolean;
  quantidade: number;
};

type AlbumResponse = {
  colecao_id: number;
  nome_colecao: string;
  ano: number;
  total_figurinhas: number;
  coletadas: number;
  progresso: number; // 0–100
  figurinhas: FigurinhaAlbum[];
};

/* -------------------------------------------------------
   HELPERS DE ESTILO / TEXTO
------------------------------------------------------- */

function numeroFigurinhaFormatado(numero: number) {
  return `#${String(numero).padStart(3, "0")}`;
}

function raridadeClasses(r: FigurinhaAlbum["raridade"]) {
  switch (r) {
    case "rara":
      return "bg-emerald-500/15 text-emerald-300 border border-emerald-500/40";
    case "epica":
      return "bg-purple-500/15 text-purple-200 border border-purple-500/40";
    case "lendaria":
      return "bg-yellow-500/15 text-yellow-200 border border-yellow-500/40";
    case "comum":
    default:
      return "bg-slate-800/80 text-slate-200 border border-slate-500/30";
  }
}

function raridadeLabel(r: FigurinhaAlbum["raridade"]) {
  switch (r) {
    case "rara":
      return "Rara";
    case "epica":
      return "Épica";
    case "lendaria":
      return "Lendária";
    case "comum":
    default:
      return "Comum";
  }
}

/* -------------------------------------------------------
   COMPONENTE
------------------------------------------------------- */

export function AlbumPage() {
  const [album, setAlbum] = useState<AlbumResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [showActions, setShowActions] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);

  async function fetchAlbum() {
    try {
      setLoading(true);
      setErro(null);

      const token = localStorage.getItem("token") ?? "";

      const resp = await axios.get<AlbumResponse>(
        `${API_BASE}/colecao/album`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setAlbum(resp.data);
    } catch (err: any) {
      console.error("Erro ao carregar álbum:", err);

      const status = err?.response?.status;

      if (status === 404) {
        // usuário ainda não tem álbum criado
        setAlbum(null);
      } else {
        setErro("Não foi possível carregar seu álbum no momento.");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAlbum();
  }, []);

  /* ---------------------------------------------------
     AÇÕES DO ÁLBUM (Criar / Resetar / Deletar)
  ---------------------------------------------------- */

  async function handleCriarAlbum() {
    try {
      setProcessingAction(true);
      setErro(null);

      const token = localStorage.getItem("token") ?? "";

      await axios.post(
        `${API_BASE}/colecao/album/criar`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchAlbum();
      setShowActions(false);
    } catch (err) {
      console.error("Erro ao criar álbum:", err);
      setErro("Não foi possível criar o álbum.");
    } finally {
      setProcessingAction(false);
    }
  }

  async function handleResetarAlbum() {
    if (!album) return;

    const confirmar = window.confirm(
      "Tem certeza que deseja resetar o álbum? Você continuará com as figurinhas, mas o progresso será reiniciado."
    );
    if (!confirmar) return;

    try {
      setProcessingAction(true);
      setErro(null);

      const token = localStorage.getItem("token") ?? "";

      await axios.post(
        `${API_BASE}/colecao/album/resetar`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchAlbum();
      setShowActions(false);
    } catch (err) {
      console.error("Erro ao resetar álbum:", err);
      setErro("Não foi possível resetar o álbum.");
    } finally {
      setProcessingAction(false);
    }
  }

  async function handleDeletarAlbum() {
    if (!album) return;

    const confirmar = window.confirm(
      "Tem certeza que deseja DELETAR o álbum? Essa ação não pode ser desfeita."
    );
    if (!confirmar) return;

    try {
      setProcessingAction(true);
      setErro(null);

      const token = localStorage.getItem("token") ?? "";

      await axios.delete(
        `${API_BASE}/colecao/album/${album.colecao_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAlbum(null);
      setShowActions(false);
    } catch (err) {
      console.error("Erro ao deletar álbum:", err);
      setErro("Não foi possível deletar o álbum.");
    } finally {
      setProcessingAction(false);
    }
  }

  const progresso = album ? album.progresso : 0;
  const total = album ? album.total_figurinhas : 0;
  const coletadas = album ? album.coletadas : 0;

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto w-full space-y-8">
        {/* HEADER -------------------------------------------------------- */}
        <header className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white">Minha Coleção</h1>
            <p className="text-sm text-gray-400 mt-1">
              Acompanhe o progresso do seu álbum de figurinhas.
            </p>
          </div>

          <button
            onClick={() => setShowActions(true)}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-200 hover:bg-white/10 transition-colors"
          >
            <Settings2 className="w-4 h-4 text-emerald-400" />
            <span>Opções do Álbum</span>
          </button>
        </header>

        {/* ERRO GLOBAL --------------------------------------------------- */}
        {erro && (
          <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/30 px-4 py-2 rounded-lg">
            {erro}
          </div>
        )}

        {/* SE NÃO TIVER ÁLBUM AINDA ------------------------------------- */}
        {!loading && !album && (
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
            <CardContent className="p-8 flex flex-col items-center text-center gap-4">
              <div className="h-12 w-12 rounded-full bg-emerald-500/15 flex items-center justify-center">
                <PlusCircle className="w-6 h-6 text-emerald-400" />
              </div>
              <h2 className="text-xl font-semibold">Você ainda não tem álbum</h2>
              <p className="text-sm text-gray-300 max-w-md">
                Crie seu primeiro álbum para começar a colecionar figurinhas,
                acompanhar o progresso e desbloquear recompensas.
              </p>
              <Button
                onClick={handleCriarAlbum}
                disabled={processingAction}
                className="mt-2 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold px-6"
              >
                {processingAction ? "Criando..." : "Criar Álbum"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* SE TIVER ÁLBUM ------------------------------------------------ */}
        {album && (
          <>
            {/* PROGRESSO ------------------------------------------------- */}
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">
                    Progresso da Coleção
                  </h2>
                  <span className="text-sm text-emerald-400 font-semibold">
                    {coletadas} / {total}
                  </span>
                </div>

                <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${progresso}%` }}
                  />
                </div>

                <p className="text-xs text-gray-400">
                  {progresso.toFixed(1)}% completo • Álbum{" "}
                  <span className="font-semibold text-gray-200">
                    {album.nome_colecao}
                  </span>{" "}
                  ({album.ano})
                </p>
              </CardContent>
            </Card>

            {/* GRID DE FIGURINHAS --------------------------------------- */}
            <section className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {album.figurinhas.map((fig) => {
                const possui = fig.possui && fig.quantidade > 0;
                const isRepetida = possui && fig.quantidade > 1;

                if (!possui) {
                  // CARD VAZIO (com "?")
                  return (
                    <div
                      key={fig.id}
                      className="rounded-2xl bg-slate-900/70 border border-white/5 h-56 flex flex-col items-center justify-center text-gray-500"
                    >
                      <div className="text-4xl mb-2">?</div>
                      <p className="text-[11px] text-gray-500">
                        {numeroFigurinhaFormatado(fig.numero)}
                      </p>
                    </div>
                  );
                }

                // CARD COM FIGURINHA
                return (
                  <div
                    key={fig.id}
                    className="rounded-2xl bg-slate-900/90 border border-emerald-500/25 h-56 flex flex-col items-center justify-between py-4 px-3 shadow-lg shadow-black/20"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="h-9 w-9 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        {fig.imagem_url ? (
                          // se um dia vier imagem real
                          <img
                            src={fig.imagem_url}
                            alt={fig.nome}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <ImageOff className="w-5 h-5 text-emerald-400" />
                        )}
                      </div>

                      <div
                        className={`text-[11px] px-2 py-0.5 rounded-full flex items-center gap-1 ${raridadeClasses(
                          fig.raridade
                        )}`}
                      >
                        <Star className="w-3 h-3" />
                        <span>{raridadeLabel(fig.raridade)}</span>
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center text-center px-2">
                      <p className="text-sm font-semibold text-white">
                        {fig.nome}
                      </p>
                      {fig.posicao && (
                        <p className="text-xs text-emerald-400 font-semibold mt-1">
                          {fig.posicao}
                        </p>
                      )}
                      {fig.time && (
                        <p className="text-xs text-gray-300 mt-1">
                          {fig.time}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between w-full mt-2 text-[11px]">
                      <span className="text-gray-400">
                        {numeroFigurinhaFormatado(fig.numero)}
                      </span>
                      {isRepetida && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          x{fig.quantidade}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </section>
          </>
        )}

        {/* PAINEL DE AÇÕES (ENGRENAGEM) --------------------------------- */}
        {showActions && (
          <div className="fixed inset-0 z-40 bg-black/60 flex justify-end">
            <div className="h-full w-full max-w-sm bg-slate-900 border-l border-white/10 p-6 flex flex-col gap-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-white">
                  Opções do Álbum
                </h2>
                <button
                  onClick={() => setShowActions(false)}
                  className="text-gray-400 hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              <div className="flex flex-col gap-3 text-sm">
                <button
                  onClick={handleCriarAlbum}
                  disabled={processingAction}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-100 disabled:opacity-60"
                >
                  <PlusCircle className="w-5 h-5 text-emerald-400" />
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Criar Álbum</span>
                    <span className="text-xs text-gray-400">
                      Comece uma nova coleção do zero.
                    </span>
                  </div>
                </button>

                <button
                  onClick={handleResetarAlbum}
                  disabled={processingAction || !album}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-100 disabled:opacity-60"
                >
                  <RefreshCw className="w-5 h-5 text-emerald-400" />
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Resetar Álbum</span>
                    <span className="text-xs text-gray-400">
                      Zera o progresso mantendo suas figurinhas.
                    </span>
                  </div>
                </button>

                <button
                  onClick={handleDeletarAlbum}
                  disabled={processingAction || !album}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/40 text-red-200 disabled:opacity-60"
                >
                  <Trash2 className="w-5 h-5" />
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Deletar Álbum</span>
                    <span className="text-xs text-red-200/80">
                      Remove totalmente o álbum atual.
                    </span>
                  </div>
                </button>
              </div>

              {processingAction && (
                <p className="text-xs text-gray-400 mt-2">
                  Processando ação... aguarde.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
