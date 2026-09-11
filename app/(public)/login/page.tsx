"use client";

import { useState } from "react";
import Link from "next/link";
import { Shirt, Lock, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <div className="flex min-h-[calc(100vh-16rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-md">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white mb-2">
            <Shirt className="h-6 w-6" />
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
          {/* Alternador de Modo */}
          <div className="flex rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setIsSignUp(false)}
              className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-all ${
                !isSignUp ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => setIsSignUp(true)}
              className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-all ${
                isSignUp ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Cadastrar
            </button>
          </div>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            {isSignUp && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nome Completo / Razão Social
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input placeholder="Seu nome ou nome da empresa" className="pl-9" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                E-mail Corporativo ou Pessoal
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input type="email" placeholder="seuemail@empresa.com" className="pl-9" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-slate-700">Senha</label>
                {!isSignUp && (
                  <a href="#" className="text-xs text-slate-500 hover:text-slate-900">
                    Esqueceu a senha?
                  </a>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input type="password" placeholder="••••••••" className="pl-9" />
              </div>
            </div>

            <Button type="submit" className="w-full">
              {isSignUp ? "Criar Conta" : "Entrar no Sistema"}
            </Button>
          </form>

          <div className="text-center pt-2">
            <Link href="/admin/dashboard" className="text-xs text-slate-500 hover:text-slate-800 underline">
              Acesso ao Painel Administrativo Interno →
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
