import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { useAuth } from "../../context/AuthContext";
import LogoHT from "../../assets/LOGO_HT.png";
import { API_BASE } from "../../config/api";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_BASE}/usuarios/login`,
        new URLSearchParams({
          username: email,
          password: senha,
        }),
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );

      const token = response.data.access_token;
      login(token);

      alert("Login realizado com sucesso!");
      navigate("/");
    } catch (error) {
      alert("Credenciais inválidas.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">

      <Card className="w-full max-w-[380px] bg-white/5 border-white/10 shadow-xl shadow-black/40 backdrop-blur-md animate-fade-slide-up">

        <CardHeader className="flex flex-col items-center gap-4">
          <img
            src={LogoHT}
            alt="Logo Hub do Torcedor"
            className="logo-ht w-24 h-24 object-contain transition-all duration-300"
          />

          <CardTitle className="text-primary text-3xl font-bold text-center">
            Hub do Torcedor
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-5">

            {/* Email */}
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="Digite seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Senha com Olhinho */}
            <div className="relative">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type={showPass ? "text" : "password"}
                placeholder="Digite sua senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                className="pr-10"
              />

              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-[36px] text-gray-400 hover:text-white"
              >
                {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <Button type="submit" className="w-full mt-2" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>

            {/* Cadastre-se */}
            <div className="text-center text-mutedForeground text-sm">
              Não tem conta?{" "}
              <span
                className="text-primary font-medium hover:opacity-80 cursor-pointer"
                onClick={() => navigate("/register")}
              >
                Cadastre-se
              </span>
            </div>

            {/* Esqueci minha senha */}
            <div className="text-center text-sm mt-1">
              <span
                className="text-emerald-400 hover:text-emerald-300 cursor-pointer"
                onClick={() => navigate("/esqueci-senha")}
              >
                Esqueci minha senha
              </span>
            </div>
          </form>
        </CardContent>

      </Card>

    </div>
  );
}
