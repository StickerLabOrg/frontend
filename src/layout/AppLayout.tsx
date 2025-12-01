// src/layout/AppLayout.tsx
import { ReactNode, useState } from "react";
import { Sidebar } from "./Sidebar";
import { Menu } from "lucide-react";

type AppLayoutProps = {
  children: ReactNode;
};

export function AppLayout({ children }: AppLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen w-full flex bg-[#0D1117] text-white">

      {/* SIDEBAR */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* CONTEÚDO PRINCIPAL */}
      <div className="flex-1 min-h-screen md:ml-64 relative">

        {/* BOTÃO HAMBÚRGUER → PREMIUM EDITION */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="
            md:hidden
            fixed top-4 right-4 z-50
            backdrop-blur-md
            bg-white/10
            hover:bg-white/20
            border border-white/10
            p-3 rounded-xl
            transition-all duration-300 ease-out
            active:scale-90
            shadow-lg shadow-black/40
          "
        >
          <Menu size={22} className="text-white drop-shadow-md" />
        </button>

        {/* GRADIENTE DELICADO NO TOPO (efeito premium) */}
        <div
          className="
            absolute top-0 left-0 w-full h-20
            bg-gradient-to-b from-black/30 to-transparent
            pointer-events-none
            md:hidden
          "
        />

        {/* CONTEÚDO */}
        <main className="px-5 md:px-10 py-8 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
