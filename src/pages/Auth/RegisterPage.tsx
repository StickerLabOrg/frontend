import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";

export function RegisterPage() {
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [time, setTime] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:8000/usuarios/", {
        nome,
        email,
        password: senha,
        time_do_coracao: time,
      });

      alert("Conta criada com sucesso! Faça login.");
      navigate("/login");

    } catch (error: any) {
      console.error(error);
      alert("Erro ao criar conta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-[380px]">
        <CardHeader>
          <CardTitle className="text-center text-primary text-2xl font-semibold">
            Criar Conta
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            
            <div>
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                type="text"
                placeholder="Seu nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>

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

            <div>
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                placeholder="Digite sua senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="time">Time do coração</Label>
              <Input
                id="time"
                type="text"
                placeholder="Ex: São Paulo"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full mt-2" disabled={loading}>
              {loading ? "Cadastrando..." : "Cadastrar"}
            </Button>

            <div className="text-center text-mutedForeground text-sm">
              Já tem conta?{" "}
              <span
                className="text-primary font-medium hover:opacity-80 cursor-pointer"
                onClick={() => navigate("/login")}
              >
                Entrar
              </span>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}
