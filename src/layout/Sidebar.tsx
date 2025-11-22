// src/layout/Sidebar.tsx
import { Link, useLocation } from "react-router-dom";
import { Home, Book, BarChart2, ShoppingBag, User, LogOut } from "lucide-react";
import axios from "axios";
import { useEffect, useState } from "react";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { pathname } = useLocation();

  const [userName, setUserName] = useState<string>("Torcedor");
  const [moedas, setMoedas] = useState<number>(0);

  const menu = [
    { label: "Dashboard", icon: <Home size={18} />, path: "/" },
    { label: "Meu Álbum", icon: <Book size={18} />, path: "/album" },
    { label: "Classificação", icon: <BarChart2 size={18} />, path: "/classificacao" },
    { label: "Ranking", icon: <BarChart2 size={18} />, path: "/ranking" },
    { label: "Loja", icon: <ShoppingBag size={18} />, path: "/loja" },
    { label: "Perfil", icon: <User size={18} />, path: "/perfil" },
  ];

  function isActive(path: string) {
    return pathname === path;
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    axios
      .get("http://localhost:8000/usuario/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((resp) => {
        const u = resp.data;

        const nome =
          u.nome ||
          u.username ||
          (u.email ? u.email.split("@")[0] : "Torcedor");

        setUserName(nome);
        setMoedas(u.coins ?? u.moedas ?? 0);
      })
      .catch(() => {});
  }, []);

  return (
    <>
      {/* OVERLAY — apenas no mobile */}
      <div
        className={`
          fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden
          transition-opacity
          ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
        onClick={onClose}
      />

      {/* SIDEBAR */}
      <aside
        className={`
          fixed top-0 left-0 h-screen w-64 bg-[#121826] shadow-xl shadow-black/40
          p-6 flex flex-col z-50 border-r border-white/5

          transform transition-transform duration-300
          md:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-green-400">Hub do Torcedor</h1>
          <p className="text-gray-400 mt-1">Olá, {userName}</p>

          <div className="mt-3 bg-[#1F293B] px-3 py-1 rounded-lg border border-white/10 text-green-400 font-semibold inline-block">
            Moedas: {moedas}
          </div>
        </div>

        {/* Menu */}
        <nav className="flex flex-col gap-1">
          {menu.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-lg
                transition-all
                ${
                  isActive(item.path)
                    ? "bg-green-500 text-black font-semibold"
                    : "text-gray-300 hover:bg-white/5 hover:text-white"
                }
              `}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Sair */}
        <button
          className="mt-auto flex items-center gap-2 text-red-400 hover:text-red-300"
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/login";
          }}
        >
          <LogOut size={18} /> Sair
        </button>
      </aside>
    </>
  );
}
