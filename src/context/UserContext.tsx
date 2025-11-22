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
// PROVIDER
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
      const token = localStorage.getItem("token");

      const auth = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      // --- RANKING ---
      const rankingResp = await axios.get("http://localhost:8000/ranking/geral", auth);

      const userRank = rankingResp.data.ranking.find((p: any) => p.is_you === true);

      // --- FIGURINHAS ---
      const figsResp = await axios.get("http://localhost:8000/colecao/minhas-figurinhas", auth);

      setMetrics({
        palpites: userRank?.palpites ?? 0,
        precisao: userRank?.precisao ?? 0,
        pontos: userRank?.pontos ?? 0,
        figurinhas: figsResp.data.length ?? 0,
        loading: false,
      });

    } catch (err) {
      console.error("Erro ao carregar métricas globais:", err);
      setMetrics((prev) => ({ ...prev, loading: false }));
    }
  }

  useEffect(() => {
    loadUserData();
  }, []);

  return <UserContext.Provider value={metrics}>{children}</UserContext.Provider>;
}

// -----------------------------------------------------------
// HOOK
// -----------------------------------------------------------
export function useUserMetrics() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUserMetrics deve ser usado dentro do UserProvider");
  return ctx;
}
