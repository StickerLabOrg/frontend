// src/pages/Loja/AbrirPacotePage.tsx
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { AppLayout } from "../../layout/AppLayout";
import { Button } from "../../components/ui/button";
import { API_BASE } from "../../config/api";


export function AbrirPacotePage() {
  const [params] = useSearchParams();
  const tempId = params.get("tempId");

  const navigate = useNavigate();

  const [animando, setAnimando] = useState(false);

  async function carregarPacote() {
    const token = localStorage.getItem("token") ?? "";

    try {
      await axios.get(
        `${API_BASE}/colecao/pacote/temp?pacote_temp_id=${tempId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error("Erro ao carregar pacote:", error);
    }
  }

  useEffect(() => {
    carregarPacote();
  }, []);

  function abrir() {
    setAnimando(true);

    setTimeout(() => {
      navigate(`/loja/resultado?tempId=${tempId}`);
    }, 3000);
  }

  return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center min-h-[70vh]">

        <h1 className="text-3xl font-bold mb-8">Abrir Pacote</h1>

        {!animando ? (
          <>
            <div className="w-40 h-56 bg-white/10 border border-white/20 rounded-xl shadow-xl backdrop-blur-sm flex items-center justify-center text-gray-200 text-xl font-semibold">
              PACOTE
            </div>

            <Button
              className="mt-8 bg-emerald-500 hover:bg-emerald-600 text-black font-bold px-10"
              onClick={abrir}
            >
              Abrir Pacote
            </Button>
          </>
        ) : (
          <div className="text-xl text-emerald-400 animate-pulse">
            Abrindo pacote...
          </div>
        )}

      </div>
    </AppLayout>
  );
}
