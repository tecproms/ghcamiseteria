"use client";

// app/admin/configuracoes/page.tsx
// Tela Administrativa de Configurações Gerais do Sistema
// GH Camiseteria & Uniformes Personalizados

import React, { useEffect, useState } from "react";
import {
  Settings,
  Bot,
  CreditCard,
  Phone,
  Globe,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Zap,
  Loader2,
  ShieldCheck,
  Server,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { SystemSettingItem } from "@/services/settings.service";

export default function AdminConfiguracoesPage() {
  const [settings, setSettings] = useState<SystemSettingItem[]>([]);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [showSecret, setShowSecret] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Estado do teste da Groq
  const [testingGroq, setTestingGroq] = useState(false);
  const [groqTestResult, setGroqTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/admin/configuracoes");
      const data = await res.json();
      if (data.success && Array.isArray(data.settings)) {
        setSettings(data.settings);
        const initialVals: Record<string, string> = {};
        data.settings.forEach((s: SystemSettingItem) => {
          initialVals[s.key] = s.value || "";
        });
        setFormValues(initialVals);
      } else {
        setErrorMsg(data.error || "Erro ao carregar configurações.");
      }
    } catch {
      setErrorMsg("Falha de comunicação com o servidor ao carregar configurações.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleInputChange = (key: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const toggleShowSecret = (key: string) => {
    setShowSecret((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/admin/configuracoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: formValues }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg("Configurações salvas e aplicadas com sucesso no sistema!");
        if (data.settings) {
          setSettings(data.settings);
        }
        setTimeout(() => setSuccessMsg(null), 5000);
      } else {
        setErrorMsg(data.error || "Erro ao salvar alterações.");
      }
    } catch {
      setErrorMsg("Falha ao salvar configurações.");
    } finally {
      setSaving(false);
    }
  };

  const handleTestGroq = async () => {
    setTestingGroq(true);
    setGroqTestResult(null);
    try {
      const res = await fetch("/api/admin/configuracoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "test_groq",
          apiKey: formValues["GROQ_API_KEY"],
          model: formValues["GROQ_MODEL"],
        }),
      });
      const data = await res.json();
      setGroqTestResult(data);
    } catch {
      setGroqTestResult({ success: false, message: "Erro de comunicação ao testar a Groq." });
    } finally {
      setTestingGroq(false);
    }
  };

  const getSetting = (key: string) => settings.find((s) => s.key === key);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-[#d4af37] text-xs font-semibold mb-2">
            <Settings className="h-3.5 w-3.5" />
            Parâmetros & Integrações
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Configurações do Sistema
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
            Gerencie chaves de IA, pagamentos Mercado Pago, WhatsApp e domínio diretamente pelo painel.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => handleSave()}
            disabled={saving || loading}
            className="gap-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-[#d4af37] dark:text-zinc-950 dark:hover:bg-[#c59b27] font-semibold shadow-sm"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Salvar Alterações
          </Button>
        </div>
      </div>

      {/* Alertas de Sucesso / Erro */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3 text-emerald-800 dark:text-emerald-300 text-sm font-medium">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 flex items-center gap-3 text-red-800 dark:text-red-300 text-sm font-medium">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#d4af37]" />
          <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
            Carregando parâmetros do sistema...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {/* Card 1: Inteligência Artificial (Groq) */}
          <Card className="border border-slate-200 dark:border-zinc-800 shadow-xs">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Inteligência Artificial (Groq Cloud)</CardTitle>
                    <CardDescription>
                      Controla o Consultor Virtual conversacional e a compilação inteligente de uniformes.
                    </CardDescription>
                  </div>
                </div>
                <div className="shrink-0">
                  {getSetting("GROQ_API_KEY")?.maskedValue ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                      <ShieldCheck className="h-3 w-3" /> Configurado
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                      Não configurado
                    </span>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-2">
              {/* GROQ_API_KEY */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center justify-between">
                  <span>Chave de API (Groq API Key)</span>
                  {getSetting("GROQ_API_KEY")?.maskedValue && (
                    <span className="text-[11px] font-mono text-slate-400 dark:text-zinc-500">
                      Atual: {getSetting("GROQ_API_KEY")?.maskedValue}
                    </span>
                  )}
                </label>
                <div className="relative">
                  <Input
                    type={showSecret["GROQ_API_KEY"] ? "text" : "password"}
                    placeholder={
                      getSetting("GROQ_API_KEY")?.maskedValue || "gsk_exemplo_sua_chave_groq_aqui..."
                    }
                    value={formValues["GROQ_API_KEY"] || ""}
                    onChange={(e) => handleInputChange("GROQ_API_KEY", e.target.value)}
                    className="pr-10 font-mono text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowSecret("GROQ_API_KEY")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                  >
                    {showSecret["GROQ_API_KEY"] ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 dark:text-zinc-500">
                  Obtenha gratuitamente sua chave no console da Groq em{" "}
                  <a
                    href="https://console.groq.com/keys"
                    target="_blank"
                    rel="noreferrer"
                    className="underline text-blue-600 hover:text-blue-500"
                  >
                    console.groq.com/keys
                  </a>
                  .
                </p>
              </div>

              {/* GROQ_MODEL */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  Modelo de IA (Groq Model)
                </label>
                <Input
                  type="text"
                  placeholder="openai/gpt-oss-120b"
                  value={formValues["GROQ_MODEL"] || ""}
                  onChange={(e) => handleInputChange("GROQ_MODEL", e.target.value)}
                  className="font-mono text-sm"
                />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[11px] text-slate-400 dark:text-zinc-500">Modelos recomendados:</span>
                  {[
                    "openai/gpt-oss-120b",
                    "llama-3.3-70b-versatile",
                    "llama-3.1-8b-instant",
                    "mixtral-8x7b-32768",
                  ].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => handleInputChange("GROQ_MODEL", m)}
                      className="text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700"
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Teste de conexão */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleTestGroq}
                  disabled={testingGroq}
                  className="gap-2 shrink-0 h-9"
                >
                  {testingGroq ? (
                    <Loader2 className="h-4 w-4 animate-spin text-[#d4af37]" />
                  ) : (
                    <Zap className="h-4 w-4 text-[#d4af37]" />
                  )}
                  Testar Conexão com a IA
                </Button>

                {groqTestResult && (
                  <div
                    className={`text-xs font-medium flex items-center gap-1.5 ${
                      groqTestResult.success
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {groqTestResult.success ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    <span>{groqTestResult.message}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Pagamentos Online (Mercado Pago) */}
          <Card className="border border-slate-200 dark:border-zinc-800 shadow-xs">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Pagamentos Online (Mercado Pago)</CardTitle>
                    <CardDescription>
                      Processamento automático de Pix com QR Code dinâmico e Checkout transparente para cartão.
                    </CardDescription>
                  </div>
                </div>
                <div className="shrink-0">
                  {getSetting("MERCADO_PAGO_ACCESS_TOKEN")?.maskedValue ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                      <ShieldCheck className="h-3 w-3" /> Configurado
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                      Não configurado
                    </span>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center justify-between">
                  <span>Access Token de Produção (Mercado Pago)</span>
                  {getSetting("MERCADO_PAGO_ACCESS_TOKEN")?.maskedValue && (
                    <span className="text-[11px] font-mono text-slate-400 dark:text-zinc-500">
                      Atual: {getSetting("MERCADO_PAGO_ACCESS_TOKEN")?.maskedValue}
                    </span>
                  )}
                </label>
                <div className="relative">
                  <Input
                    type={showSecret["MERCADO_PAGO_ACCESS_TOKEN"] ? "text" : "password"}
                    placeholder={
                      getSetting("MERCADO_PAGO_ACCESS_TOKEN")?.maskedValue ||
                      "APP_USR-seu_token_de_producao_aqui..."
                    }
                    value={formValues["MERCADO_PAGO_ACCESS_TOKEN"] || ""}
                    onChange={(e) => handleInputChange("MERCADO_PAGO_ACCESS_TOKEN", e.target.value)}
                    className="pr-10 font-mono text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowSecret("MERCADO_PAGO_ACCESS_TOKEN")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                  >
                    {showSecret["MERCADO_PAGO_ACCESS_TOKEN"] ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 dark:text-zinc-500 flex items-center gap-1">
                  <HelpCircle className="h-3 w-3" />
                  Obtenha em Mercado Pago Developers &gt; Suas Aplicações &gt; Credenciais de Produção.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Atendimento & WhatsApp */}
          <Card className="border border-slate-200 dark:border-zinc-800 shadow-xs">
            <CardHeader>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">Atendimento & WhatsApp</CardTitle>
                  <CardDescription>
                    Número e canais utilizados no botão &ldquo;Compartilhar no WhatsApp&rdquo; e atendimento humano.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* NEXT_PUBLIC_WHATSAPP_NUMBER */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    WhatsApp Comercial (DDI + DDD + Número)
                  </label>
                  <Input
                    type="text"
                    placeholder="5511999999999"
                    value={formValues["NEXT_PUBLIC_WHATSAPP_NUMBER"] || ""}
                    onChange={(e) => handleInputChange("NEXT_PUBLIC_WHATSAPP_NUMBER", e.target.value)}
                    className="text-sm font-mono"
                  />
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500">
                    Apenas dígitos (ex: 5511999999999 para São Paulo).
                  </p>
                </div>

                {/* SUPPORT_EMAIL */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    E-mail Oficial de Atendimento
                  </label>
                  <Input
                    type="email"
                    placeholder="contato@ghcamiseteria.com.br"
                    value={formValues["SUPPORT_EMAIL"] || ""}
                    onChange={(e) => handleInputChange("SUPPORT_EMAIL", e.target.value)}
                    className="text-sm"
                  />
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500">
                    Exibido nos orçamentos e rodapé de propostas.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Domínio & Servidor */}
          <Card className="border border-slate-200 dark:border-zinc-800 shadow-xs">
            <CardHeader>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
                  <Globe className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">Domínio & Identidade da Loja</CardTitle>
                  <CardDescription>
                    Endereço público do site e identificação da marca nas notificações.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* NEXT_PUBLIC_APP_URL */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    URL da Aplicação (Domínio ou IP da VPS)
                  </label>
                  <Input
                    type="text"
                    placeholder="https://ghcamiseteria.com.br"
                    value={formValues["NEXT_PUBLIC_APP_URL"] || ""}
                    onChange={(e) => handleInputChange("NEXT_PUBLIC_APP_URL", e.target.value)}
                    className="text-sm font-mono"
                  />
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500">
                    Utilizada na geração de links públicos e webhooks de pagamento.
                  </p>
                </div>

                {/* COMPANY_NAME */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Nome da Empresa / Marca
                  </label>
                  <Input
                    type="text"
                    placeholder="GH Camiseteria & Uniformes"
                    value={formValues["COMPANY_NAME"] || ""}
                    onChange={(e) => handleInputChange("COMPANY_NAME", e.target.value)}
                    className="text-sm"
                  />
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500">
                    Identificação impressa nos relatórios e cartões de orçamento.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dica Informativa VPS */}
          <div className="p-4 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-start gap-3">
            <Server className="h-5 w-5 text-slate-500 dark:text-zinc-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
              <strong className="text-slate-900 dark:text-white font-semibold">
                Sincronização Instantânea com a VPS:
              </strong>{" "}
              Ao salvar as configurações acima, elas são aplicadas de forma imediata no banco de dados e entram em vigor instantaneamente no sistema, sem a necessidade de editar arquivos <code>.env</code> no terminal do servidor ou reiniciar o processo do PM2.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
