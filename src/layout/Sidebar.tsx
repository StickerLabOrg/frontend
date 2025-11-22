import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Book,
  BarChart2,
  ShoppingBag,
  User,
  LogOut,
} from "lucide-react";

export function Sidebar() {
  const { pathname } = useLocation();

  const menu = [
    { label: "Dashboard", icon: <Home size={18} />, path: "/" },
    { label: "Meu Álbum", icon: <Book size={18} />, path: "/album" },
    { label: "Classificação", icon: <BarChart2 size={18} />, path: "/classificacao" },
    { label: "Ranking", icon: <BarChart2 size={18} />, path: "/ranking" },
    { label: "Loja", icon: <ShoppingBag size={18} />, path: "/loja" },
    { label: "Perfil", icon: <User size={18} />, path: "/perfil" },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <aside className="h-screen w-64 bg-[#121826] text-white fixed left-0 top-0 flex flex-col p-6 gap-6 shadow-xl shadow-black/30">

      {/* HEADER → CLICA E VOLTA PARA O DASHBOARD */}
      <Link to="/" className="group select-none">
        <h1 className="text-2xl font-semibold tracking-tight group-hover:text-green-400 transition">
          Hub do Torcedor
        </h1>
        <p className="text-sm text-gray-400 mt-1 group-hover:text-gray-300">
          Olá, Torcedor
        </p>

        <div className="mt-3 bg-[#1F293B] py-1 px-2 w-max text-green-400 rounded border border-white/10 shadow-inner">
          Moedas <span className="font-bold">1250</span>
        </div>
      </Link>

      {/* MENU */}
      <nav className="flex-1 flex flex-col gap-1 mt-2">
        {menu.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`
              flex items-center gap-3 px-3 py-2 rounded-lg transition-all
              ${
                isActive(item.path)
                  ? "bg-green-500 text-black font-semibold shadow-md shadow-green-500/20"
                  : "text-gray-300 hover:bg-[#1F293B] hover:text-white"
              }
            `}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>

      {/* SAIR */}
      <button
        className="
          flex items-center gap-2 text-red-400 hover:text-red-300 
          transition-all px-2 py-1 rounded
          hover:bg-red-500/10
        "
        onClick={() => {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }}
      >
        <LogOut size={18} /> Sair
      </button>

    </aside>
  );
}
