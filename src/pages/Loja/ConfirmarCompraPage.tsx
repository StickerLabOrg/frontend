// src/pages/Loja/ConfirmarCompraPage.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import { AppLayout } from "../../layout/AppLayout";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Coins, Package } from "lucide-react";

type PacoteMeta = {
  nome: string;
  preco: number;
  qtd: number;
};

const PACOTES: Record<number, PacoteMeta> = {
  1: { nome: "Pacote Bronze", preco: 100, qtd: 5 },
  2: { nome: "Pacote Prata", preco: 250, qtd: 7 },
  3: { nome: "Pacote Ouro", preco: 500, qtd: 10 },
  4: { nome: "Pacote do Meu Time", preco: 200, qtd: 4 },
};

export function ConfirmarCompraPage() {
  const { pacoteId } = useParams<{ pacoteId: string }>();
  const navigate = useNavigate();

  const [saldo, setSaldo] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [processando, setProcessando] = useState(false);

  const pacote =
    pacoteId !== undefined ? PACOTES[Number(pacoteId)] : undefined;

  async function fetchPerfil() {
    try {
      setLoading(true);
      const token = localStorage.getItem("token") ?? "";
      const resp = await axios.get("http://localhost:8000/usuarios/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSaldo(resp.data.coins);
    } catch (err) {
      console.error("Erro ao carregar saldo:", err);
      setErro("Não foi possível carregar seu saldo no momento.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPerfil();
  }, []);

  function handleCancelar() {
    navigate("/loja");
  }

  async function handleConfirmar() {
    if (!pacoteId) return;
    try {
      setProcessando(true);
      setErro(null);

      const token = localStorage.getItem("token") ?? "";

      // ROTA CORRETA DO BACKEND
      const resp = await axios.post(
        `http://localhost:8000/colecao/comprar/${pacoteId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const tempId = resp.data.pacote_temp_id;
      navigate(`/loja/abrir?tempId=${tempId}`);
    } catch (err) {
      console.error("Erro ao confirmar compra:", err);
      setErro("Não foi possível concluir a compra. Tente novamente.");
    } finally {
      setProcessando(false);
    }
  }

  if (!pacote) {
    return (
      <AppLayout>
        <div className="max-w-xl mx-auto pt-16 text-center">
          <p className="text-red-400 text-lg">Pacote não encontrado.</p>
          <Button
            className="mt-4"
            onClick={() => navigate("/loja")}
          >
            Voltar para a Loja
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-xl mx-auto pt-16">
        <Card className="bg-white/5 border-white/10 rounded-2xl shadow-xl backdrop-blur-sm">
          <CardContent className="p-8 space-y-6 text-center">
            <Package className="w-12 h-12 text-emerald-400 mx-auto" />

            <h1 className="text-3xl font-bold">{pacote.nome}</h1>
            <p className="text-gray-300 text-sm">
              {pacote.qtd} figurinhas garantidas.
            </p>

            <div className="flex justify-center items-center gap-2 text-emerald-400 text-xl font-semibold pt-4">
              <Coins className="w-5 h-5" />
              {pacote.preco}
            </div>

            <div className="text-gray-400 text-sm">
              Saldo atual:{" "}
              {loading ? (
                "..."
              ) : (
                <span className="text-emerald-400 font-semibold">
                  {saldo} moedas
                </span>
              )}
            </div>

            {erro && (
              <p className="text-sm text-red-400 mt-2">{erro}</p>
            )}

            <div className="flex gap-4 pt-6">
              <Button
                onClick={handleCancelar}
                className="w-full bg-white/10 hover:bg-white/20 text-gray-200"
                disabled={processando}
              >
                Cancelar
              </Button>

              <Button
                onClick={handleConfirmar}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-semibold"
                disabled={processando || loading}
              >
                {processando ? "Processando..." : "Confirmar compra"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
