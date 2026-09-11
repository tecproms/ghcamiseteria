"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, User, Phone, AlertCircle, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AuthService } from "@/services/auth.service";

function CadastroForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!fullName.trim()) {
      setErrorMessage("Por favor, preencha seu nome completo.");
      return;
    }
    if (password.length < 6) {
      setErrorMessage("A senha deve ter no mínimo 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("As senhas informadas não coincidem.");
      return;
    }

    setLoading(true);

    try {
      const data = await AuthService.signUp({
        email,
        password,
        fullName,
        phone,
        role: "cliente",
      });

      if (data.session) {
        setSuccessMessage("Cadastro concluído com sucesso! Entrando...");
        router.push(redirectTo || "/meus-pedidos");
        router.refresh();
      } else {
        setSuccessMessage(
          "Cadastro realizado com sucesso! Se a confirmação de e-mail estiver ativa, verifique sua caixa de entrada para ativar sua conta."
        );
      }
    } catch (err: unknown) {
      console.error("Erro no cadastro:", err);
      const errorMsg = err instanceof Error ? err.message : "Ocorreu um erro ao realizar o cadastro.";
      let message = errorMsg;
      if (message.includes("User already registered")) {
        message = "Este e-mail já está cadastrado. Tente fazer login ou recupere sua senha.";
      }
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-16rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-md">
        <CardHeader className="text-center pb-4">
          <div className="relative mx-auto h-14 w-14 mb-2 flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="GH Camiseteria"
              width={56}
              height={56}
              className="object-contain dark:hidden"
              priority
            />
            <Image
              src="/logo-dark.png"
              alt="GH Camiseteria"
              width={56}
              height={56}
              className="object-contain hidden dark:block"
              priority
            />
          </div>
          <CardTitle className="text-2xl">Crie sua Conta</CardTitle>
          <CardDescription>
            Cadastre-se na GH Camiseteria para criar orçamentos personalizados e acompanhar pedidos em tempo real.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {errorMessage && (
            <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/40 dark:border-red-900/60 p-3 text-xs text-red-800 dark:text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
              <div>
                <p className="font-semibold">{successMessage}</p>
                <Link href="/login" className="inline-flex items-center gap-1 mt-2 text-emerald-900 underline font-medium">
                  Ir para a página de Login <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          )}

          {!successMessage && (
            <form className="space-y-3.5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nome Completo / Razão Social
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Seu nome ou da sua empresa"
                    className="pl-9"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  E-mail Corporativo ou Pessoal
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seuemail@exemplo.com"
                    className="pl-9"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  WhatsApp / Celular (opcional)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(00) 00000-0000"
                    className="pl-9"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    required
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="pl-9"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Confirmar Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    required
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a senha"
                    className="pl-9"
                  />
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full mt-2">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Criando conta...
                  </span>
                ) : (
                  "Finalizar Cadastro"
                )}
              </Button>
            </form>
          )}

          <div className="text-center pt-3 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Já possui uma conta?{" "}
              <Link href="/login" className="font-semibold text-slate-900 hover:underline">
                Acesse aqui
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CadastroPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[50vh] items-center justify-center">Carregando...</div>}>
      <CadastroForm />
    </Suspense>
  );
}
