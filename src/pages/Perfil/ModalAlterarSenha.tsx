import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import { X, Eye, EyeOff } from "lucide-react";
import { Button } from "../../components/ui/button";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function ModalAlterarSenha({ isOpen, onClose }: Props) {
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [mensagem, setMensagem] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const [showAtual, setShowAtual] = useState(false);
  const [showNova, setShowNova] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);

  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      const token = localStorage.getItem("token");
      if (!token) return;

      axios
        .get("http://localhost:8000/usuarios/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setUserId(res.data.id))
        .catch(() => setErro("Erro ao carregar usuário."));
    }
  }, [isOpen]);

  async function alterarSenha() {
    setErro(null);
    setMensagem(null);

    if (novaSenha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token || !userId) {
        setErro("Não autenticado.");
        return;
      }

      const body = {
        usuario_id: userId,
        senha_atual: senhaAtual,
        nova_senha: novaSenha,
      };

      await axios.post(
        "http://localhost:8000/usuarios/alterar-senha",
        body,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMensagem("Senha alterada com sucesso!");
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");
    } catch (error: any) {
      const msg =
        error?.response?.data?.msg ||
        error?.response?.data?.detail ||
        "Erro ao alterar senha.";
      setErro(String(msg));
    }
  }

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#14181f] w-full max-w-md rounded-2xl p-6 shadow-xl border border-white/10 animate-fade-slide-up">

        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Alterar Senha</h2>
          <button onClick={onClose}>
            <X className="text-gray-300 hover:text-white" />
          </button>
        </div>

        {mensagem && (
          <p className="text-emerald-400 text-center mb-4 font-medium">
            {mensagem}
          </p>
        )}

        {erro && (
          <p className="text-red-400 text-center mb-4 font-medium">
            {erro}
          </p>
        )}

        {/* Senha atual */}
        <div className="relative">
          <input
            type={showAtual ? "text" : "password"}
            placeholder="Senha atual"
            value={senhaAtual}
            onChange={(e) => setSenhaAtual(e.target.value)}
            className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white"
          />
          <button
            className="absolute right-3 top-3 text-gray-300"
            onClick={() => setShowAtual(!showAtual)}
          >
            {showAtual ? <EyeOff /> : <Eye />}
          </button>
        </div>

        {/* Nova senha */}
        <div className="relative mt-3">
          <input
            type={showNova ? "text" : "password"}
            placeholder="Nova senha"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white"
          />
          <button
            className="absolute right-3 top-3 text-gray-300"
            onClick={() => setShowNova(!showNova)}
          >
            {showNova ? <EyeOff /> : <Eye />}
          </button>
        </div>

        {/* Confirmar senha */}
        <div className="relative mt-3">
          <input
            type={showConfirmar ? "text" : "password"}
            placeholder="Confirmar nova senha"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white"
          />
          <button
            className="absolute right-3 top-3 text-gray-300"
            onClick={() => setShowConfirmar(!showConfirmar)}
          >
            {showConfirmar ? <EyeOff /> : <Eye />}
          </button>
        </div>

        {/* Botões */}
        <div className="flex justify-between mt-6">
          <Button
            variant="ghost"
            className="bg-gray-700 hover:bg-gray-600 text-white"
            onClick={onClose}
          >
            Cancelar
          </Button>

          <Button
            className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold"
            onClick={alterarSenha}
          >
            Confirmar
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
