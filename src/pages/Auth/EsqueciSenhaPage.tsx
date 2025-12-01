import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/card";

import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { API_BASE } from "../../config/api";

export function EsqueciSenhaPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const [msg, setMsg] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    setErro(null);

    try {
      await axios.post(`${API_BASE}/usuarios/esqueci-senha`, {
        email,
        nova_senha: novaSenha,
      });

      setMsg("Senha redefinida com sucesso! Você já pode fazer login.");
    } catch (err: any) {
      setErro(
        err?.response?.data?.detail ||
          "Erro ao tentar redefinir a senha. Verifique o e-mail informado."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-[400px] bg-white/5 border-white/10 shadow-xl shadow-black/40 backdrop-blur-md animate-fade-slide-up">
        <CardHeader>
          <CardTitle className="text-center text-primary text-2xl font-bold">
            Recuperar Senha
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleReset} className="space-y-5">
            
            {msg && (
              <p className="text-emerald-400 text-center font-medium">
                {msg}
              </p>
            )}

            {erro && (
              <p className="text-red-400 text-center font-medium">{erro}</p>
            )}

            {/* E-mail */}
            <div className="flex flex-col gap-1">
              <Label htmlFor="email">E-mail cadastrado</Label>
              <Input
                id="email"
                type="email"
                placeholder="Digite o e-mail da sua conta"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Nova senha */}
            <div className="flex flex-col gap-1">
              <Label htmlFor="novaSenha">Nova senha</Label>
              <Input
                id="novaSenha"
                type="password"
                placeholder="Digite uma nova senha"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                required
              />
            </div>

            {/* Botões */}
            <div className="flex flex-col gap-3 pt-2">
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Enviando..." : "Redefinir Senha"}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full text-gray-300 hover:text-white hover:bg-white/10"
                onClick={() => navigate("/login")}
              >
                Voltar ao Login
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
