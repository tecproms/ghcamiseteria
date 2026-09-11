"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, User, Phone, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AuthService } from "@/services/auth.service";
import { isRoleAdminOrManager } from "@/types/auth";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo");
  const queryError = searchParams.get("error");

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    queryError === "unauthorized_admin"
      ? "Acesso restrito. Sua conta de cliente não possui permissão para acessar a área administrativa."
      : null
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (isSignUp) {
        if (!fullName.trim()) {
          throw new Error("Por favor, informe seu nome completo.");
        }
        if (password.length < 6) {
          throw new Error("A senha deve ter pelo menos 6 caracteres.");
        }

        const data = await AuthService.signUp({
          email,
          password,
          fullName,
          phone,
          role: "cliente",
        });

        if (data.session) {
          setSuccessMessage("Conta criada com sucesso! Redirecionando...");
          router.push(redirectTo || "/meus-pedidos");
          router.refresh();
        } else {
          setSuccessMessage(
            "Conta criada com sucesso! Se a confirmação de e-mail estiver ativa, verifique sua caixa de entrada para confirmar o acesso."
          );
          setIsSignUp(false);
        }
      } else {
        const data = await AuthService.signIn(email, password);

        if (data.user) {
          const profile = await AuthService.getProfile(data.user.id);
          const isAdmin = isRoleAdminOrManager(profile?.role);

          if (redirectTo && !redirectTo.startsWith("/login")) {
            router.push(redirectTo);
          } else if (isAdmin) {
            router.push("/admin/dashboard");
          } else {
            router.push("/meus-pedidos");
          }
          router.refresh();
        }
      }
    } catch (err: unknown) {
      console.error("Erro na autenticação:", err);
      const errorMsg = err instanceof Error ? err.message : "Ocorreu um erro ao processar sua solicitação.";
      let message = errorMsg;
      if (message.includes("Invalid login credentials")) {
        message = "E-mail ou senha incorretos. Verifique suas credenciais.";
      } else if (message.includes("User already registered")) {
        message = "Este e-mail já está cadastrado. Faça login ou recupere sua senha.";
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
              className="object-contain"
              priority
            />
          </div>
          <CardTitle className="text-2xl">
            {isSignUp ? "Criar Conta na GH Camiseteria" : "Acesse sua Conta"}
          </CardTitle>
          <CardDescription>
            {isSignUp
              ? "Cadastre sua empresa para solicitar orçamentos e gerenciar pedidos"
              : "Entre para acompanhar a produção e histórico de pedidos"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Alertas de Erro e Sucesso */}
          {errorMessage && (
            <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Alternador de Modo */}
          <div className="flex rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(false);
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-all ${
                !isSignUp ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(true);
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-all ${
                isSignUp ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Cadastrar
            </button>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {isSignUp && (
              <>
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
                      placeholder="Seu nome ou nome da empresa"
                      className="pl-9"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    WhatsApp / Telefone (opcional)
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
              </>
            )}

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
                  placeholder="seuemail@empresa.com"
                  className="pl-9"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-slate-700">Senha</label>
                {!isSignUp && (
                  <Link
                    href="/recuperar-senha"
                    className="text-xs text-slate-500 hover:text-slate-900 transition-colors"
                  >
                    Esqueceu a senha?
                  </Link>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9"
                />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isSignUp ? "Criando conta..." : "Entrando..."}
                </span>
              ) : isSignUp ? (
                "Criar Conta"
              ) : (
                "Entrar no Sistema"
              )}
            </Button>
          </form>

          <div className="text-center pt-2">
            <Link
              href="/admin/dashboard"
              className="text-xs text-slate-500 hover:text-slate-800 underline transition-colors"
            >
              Acesso ao Painel Administrativo Interno →
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[50vh] items-center justify-center">Carregando...</div>}>
      <LoginForm />
    </Suspense>
  );
}

