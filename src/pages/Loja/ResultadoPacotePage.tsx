// src/pages/Loja/ResultadoPacotePage.tsx
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { AppLayout } from "../../layout/AppLayout";
import { Button } from "../../components/ui/button";
import { API_BASE } from "../../config/api";

export function ResultadoPacotePage() {
  const [params] = useSearchParams();
  const tempId = params.get("tempId");

  const navigate = useNavigate();

  const [pacote, setPacote] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function carregarPacote() {
    const token = localStorage.getItem("token") ?? "";

    const resp = await axios.get(
      `${API_BASE}/colecao/pacote/temp?pacote_temp_id=${tempId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setPacote(resp.data);
    setLoading(false);
  }

  useEffect(() => {
    carregarPacote();
  }, []);

  async function confirmar() {
    const token = localStorage.getItem("token") ?? "";

    await axios.post(
      `${API_BASE}/colecao/pacote/confirmar?pacote_temp_id=${tempId}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    navigate("/album");
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto pt-10">

        <h1 className="text-3xl font-bold text-center mb-6">Figurinhas Recebidas</h1>

        {loading ? (
          <p className="text-center text-gray-300">Carregando...</p>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {pacote.figurinhas.map((f: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-white/10 border border-white/20 rounded-xl p-4 text-center text-gray-200"
                >
                  <p className="font-bold">{f.nome}</p>
                  <p className="text-xs text-gray-300">{f.raridade}</p>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <Button
                onClick={confirmar}
                className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold px-10"
              >
                Adicionar ao Álbum
              </Button>
            </div>
          </>
        )}

      </div>
    </AppLayout>
  );
}
