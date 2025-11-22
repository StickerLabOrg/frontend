// src/layout/AppLayout.tsx
import React from "react";
import { Sidebar } from "./Sidebar";

type AppLayoutProps = {
  children: React.ReactNode;
};

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen bg-[#0D1117] text-white">
      {/* Sidebar fixa à esquerda */}
      <Sidebar />

      {/* Conteúdo principal */}
      <main className="flex-1 ml-64 px-6 md:px-10 py-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
