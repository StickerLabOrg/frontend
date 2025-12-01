// src/components/Palpites/PalpiteModal.tsx
import { useState, useEffect } from "react";
import { X, Circle } from "lucide-react";

type Team = {
  id: string;
  nome: string;
  escudo: string;
};

export type Match = {
  id_partida: string;
  time_casa: Team;
  time_fora: Team;
  data: string;    // "2025-11-22"
  horario: string; // "16:00:00"
};

type PalpiteModalProps = {
  open: boolean;
  match: Match | null;
  initialGolsCasa?: number;
  initialGolsFora?: number;
  onClose: () => void;
  onConfirm: (golsCasa: number, golsFora: number) => void;
};

export function PalpiteModal({
  open,
  match,
  initialGolsCasa = 0,
  initialGolsFora = 0,
  onClose,
  onConfirm,
}: PalpiteModalProps) {
  const [golsCasa, setGolsCasa] = useState(initialGolsCasa);
  const [golsFora, setGolsFora] = useState(initialGolsFora);

  useEffect(() => {
    setGolsCasa(initialGolsCasa);
    setGolsFora(initialGolsFora);
  }, [initialGolsCasa, initialGolsFora, open]);

  if (!open || !match) return null;

  const dataHora = new Date(`${match.data}T${match.horario}`);
  const dataFormatada = dataHora.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const horaFormatada = dataHora.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  function handleConfirm() {
    if (golsCasa < 0 || golsFora < 0) return;
    onConfirm(golsCasa, golsFora);
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-xl mx-4 bg-slate-900 rounded-2xl border border-white/10 shadow-2xl">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 flex flex-col items-center gap-8">
          <h2 className="text-2xl font-semibold text-white">Fazer Palpite</h2>

          {/* Times */}
          <div className="flex items-center justify-center gap-10">
            {/* Casa */}
            <div className="flex flex-col items-center gap-2">
              <div className="h-12 w-12 rounded-full bg-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/40">
                <Circle className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-semibold text-white">
                {match.time_casa.nome}
              </span>
              <span className="text-xs text-gray-400">Casa</span>
            </div>

            <span className="text-xl font-semibold text-gray-300">VS</span>

            {/* Visitante */}
            <div className="flex flex-col items-center gap-2">
              <div className="h-12 w-12 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/40">
                <Circle className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-semibold text-white">
                {match.time_fora.nome}
              </span>
              <span className="text-xs text-gray-400">Visitante</span>
            </div>
          </div>

          {/* Inputs de gols */}
          <div className="flex items-center justify-center gap-6">
            <NumberBox
              value={golsCasa}
              onChange={(v) => setGolsCasa(v)}
              label="Casa"
              highlight
            />
            <span className="text-2xl font-semibold text-gray-200">X</span>
            <NumberBox value={golsFora} onChange={(v) => setGolsFora(v)} label="Visitante" />
          </div>

          {/* Data/hora */}
          <div className="text-xs text-gray-400">
            {dataFormatada} - {horaFormatada}
          </div>

          {/* Botões */}
          <div className="flex gap-3 w-full justify-center mt-2">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-lg border border-white/20 bg-transparent text-gray-100 text-sm hover:bg-white/5 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              className="px-6 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-black text-sm font-semibold transition-colors"
            >
              Confirmar Palpite
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

type NumberBoxProps = {
  value: number;
  onChange: (v: number) => void;
  label?: string;
  highlight?: boolean;
};

function NumberBox({ value, onChange, label, highlight }: NumberBoxProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`w-20 h-20 rounded-xl flex items-center justify-center border text-xl font-semibold ${
          highlight
            ? "border-emerald-400 bg-slate-900/60"
            : "border-white/20 bg-slate-900/40"
        }`}
      >
        <input
          type="number"
          min={0}
          value={value}
          onChange={(e) => onChange(Math.max(0, Number(e.target.value)))}
          className="w-full bg-transparent text-center outline-none text-white hide-number-input-arrows"
        />
      </div>
      {label && (
        <span className="text-xs text-gray-300 font-medium">{label}</span>
      )}
    </div>
  );
}
