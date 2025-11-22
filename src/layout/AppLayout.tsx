// src/components/layout/AppLayout.tsx
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
 
type AppLayoutProps = {
  children: React.ReactNode;
};

/* ------------------------- MENU COM ÍCONES ------------------------- */
const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: "dashboard" },
  { label: "Meu Álbum", path: "/album", icon: "photo_library" },
  { label: "Classificação", path: "/classificacao", icon: "leaderboard" },
  { label: "Ranking", path: "/ranking", icon: "emoji_events" },
  { label: "Loja", path: "/store", icon: "storefront" },
  { label: "Perfil", path: "/perfil", icon: "person" },
];

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const coins = 1250;

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  return (
    <div className="flex min-h-screen bg-[#0D1117] text-white">

      {/* SIDEBAR FIXA */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-[#121826] flex flex-col justify-between border-r border-white/10">

        {/* Cabeçalho */}
        <div>
          <div className="px-6 py-5 border-b border-white/10">
            <h1 className="text-2xl font-semibold">Hub do Torcedor</h1>
            <p className="text-sm text-gray-400 mt-1">Olá, Torcedor</p>

            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-600/10 px-3 py-1">
              <span className="text-xs text-gray-300">Moedas</span>
              <span className="text-sm font-semibold text-emerald-400">{coins}</span>
            </div>
          </div>

          {/* MENU */}
          <nav className="mt-4 space-y-1 px-3">
            {navItems.map((item) => {
              const active = location.pathname === item.path;

              return (
                <Link key={item.path} to={item.path}>
                  <div
                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition
                      ${
                        active
                          ? "bg-emerald-500/20 text-emerald-400 font-semibold"
                          : "text-gray-300 hover:bg-white/5"
                      }
                    `}
                  >
                    {/* ÍCONE */}
                    <span className="material-symbols-outlined text-xl">
                      {item.icon}
                    </span>

                    {item.label}
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* BOTÃO DE SAIR (com ícone) */}
        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 w-full rounded-md px-3 py-2 text-sm transition"
          >
            <span className="material-symbols-outlined">logout</span>
            Sair
          </button>
        </div>

      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 ml-64 px-6 md:px-10 py-8 overflow-y-auto">
        {children}
      </main>

    </div>
  );
}
