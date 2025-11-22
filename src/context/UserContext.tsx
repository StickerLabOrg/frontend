import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

type UserMetrics = {
  palpites: number;
  precisao: number;
  pontos: number;
  figurinhas: number;
  loading: boolean;
};

const UserContext = createContext<UserMetrics | null>(null);

// -----------------------------------------------------------
// PROVIDER REVISADO
// -----------------------------------------------------------
export function UserProvider({ children }: { children: React.ReactNode }) {
  const [metrics, setMetrics] = useState<UserMetrics>({
    palpites: 0,
    precisao: 0,
    pontos: 0,
    figurinhas: 0,
    loading: true,
  });

  async function loadUserData() {
    try {
      const token = localStorage.getItem("token") ?? "";

      if (!token) {
        console.warn("Nenhum token encontrado — métricas não podem ser carregadas.");
        setMetrics((prev) => ({ ...prev, loading: false }));
        return;
      }

      const auth = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      // -----------------------------------------
      // 1) RANKING
      // -----------------------------------------
      let palpites = 0;
      let precisao = 0;
      let pontos = 0;

      try {
        const rankingResp = await axios.get(
          "http://localhost:8000/ranking/geral",
          auth
        );

        const rankingList = rankingResp.data.ranking ?? rankingResp.data ?? [];

        const meuRegistro = rankingList.find((p: any) => p.is_you);

        palpites = meuRegistro?.palpites ?? 0;
        precisao = meuRegistro?.precisao ?? 0;
        pontos = meuRegistro?.pontos ?? 0;
      } catch (e) {
        console.warn("Não foi possível carregar ranking (token inválido ou erro no backend).");
      }

      // -----------------------------------------
      // 2) FIGURINHAS
      // -----------------------------------------
      let figurinhas = 0;

      try {
        const figsResp = await axios.get(
          "http://localhost:8000/colecao/minhas-figurinhas",
          auth
        );

        figurinhas = figsResp.data?.length ?? 0;
      } catch (e) {
        console.warn("Não foi possível carregar figurinhas.");
      }

      setMetrics({
        palpites,
        precisao,
        pontos,
        figurinhas,
        loading: false,
      });

    } catch (err) {
      console.error("Erro grave ao carregar métricas globais:", err);
      setMetrics((prev) => ({ ...prev, loading: false }));
    }
  }

  useEffect(() => {
    loadUserData();
  }, []);

  return (
    <UserContext.Provider value={metrics}>{children}</UserContext.Provider>
  );
}

// -----------------------------------------------------------
// HOOK
// -----------------------------------------------------------
export function useUserMetrics() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUserMetrics deve ser usado dentro do UserProvider");
  return ctx;
}
