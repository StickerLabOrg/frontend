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

      {/* SIDEBAR — fixa no desktop, drawer no mobile */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* CONTEÚDO PRINCIPAL */}
      <div className="flex-1 min-h-screen md:ml-64">

        {/* Botão hambúrguer apenas no mobile */}
        <button
          className="
            md:hidden fixed top-4 left-4 z-40
            bg-[#111827] border border-white/10 p-2 rounded-lg
            shadow-lg shadow-black/40
          "
          onClick={() => setIsSidebarOpen(true)}
        >
          <Menu size={20} />
        </button>

        {/* Conteúdo */}
        <main className="px-6 md:px-10 py-8">
          {children}
        </main>

      </div>
    </div>
  );
}
