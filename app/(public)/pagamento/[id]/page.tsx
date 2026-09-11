"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  QrCode,
  CreditCard,
  Copy,
  Check,
  Clock,
  ShieldCheck,
  AlertCircle,
  Loader2,
  ArrowLeft,
  ExternalLink,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Order, PixPaymentResponse, CardPreferenceResponse } from "@/types/orders";

export default function PagamentoPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Forma de pagamento selecionada
  const [selectedMethod, setSelectedMethod] = useState<"pix" | "credit_card">("pix");

  // Estados Pix
  const [pixData, setPixData] = useState<PixPaymentResponse | null>(null);
  const [loadingPix, setLoadingPix] = useState(false);
  const [copied, setCopied] = useState(false);
  const [payerCpf, setPayerCpf] = useState("");

  // Estados Cartão
  const [preferenceData, setPreferenceData] = useState<CardPreferenceResponse | null>(null);
  const [loadingCard, setLoadingCard] = useState(false);

  // 1. Carregar dados do pedido
  useEffect(() => {
    async function loadOrder() {
      if (!orderId) return;
      try {
        const res = await fetch(`/api/pedidos/${orderId}`);
        const data = await res.json();
        if (data.success && data.order) {
          setOrder(data.order);
          // Se já estiver pago, redireciona para tela de sucesso
          if (data.order.status === "PAID" || data.order.payment_status === "APPROVED") {
            router.push(`/pagamento/sucesso?order_id=${orderId}`);
          }
        } else {
          setError(data.error || "Pedido não encontrado.");
        }
      } catch {
        setError("Erro ao carregar dados do pedido.");
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [orderId, router]);

  // 2. Gerar Pix automaticamente ao abrir a aba de Pix
  useEffect(() => {
    async function initPix() {
      if (!order || selectedMethod !== "pix" || pixData || loadingPix) return;
      setLoadingPix(true);
      try {
        const res = await fetch("/api/pagamento/pix", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            order_id: order.id,
            payer_cpf: payerCpf || undefined,
          }),
        });
        const data = await res.json();
        if (data.success && data.payment) {
          setPixData(data.payment);
        }
      } catch {
        // Fallback silencioso
      } finally {
        setLoadingPix(false);
      }
    }
    initPix();
  }, [order, selectedMethod, pixData, loadingPix, payerCpf]);

  // 3. Gerar Preferência de Cartão ao abrir a aba de Cartão
  useEffect(() => {
    async function initCard() {
      if (!order || selectedMethod !== "credit_card" || preferenceData || loadingCard) return;
      setLoadingCard(true);
      try {
        const res = await fetch("/api/pagamento/preference", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order_id: order.id }),
        });
        const data = await res.json();
        if (data.success && data.preference) {
          setPreferenceData(data.preference);
        }
      } catch {
        // Fallback silencioso
      } finally {
        setLoadingCard(false);
      }
    }
    initCard();
  }, [order, selectedMethod, preferenceData, loadingCard]);

  // 4. Polling do status do pagamento a cada 3 segundos
  useEffect(() => {
    if (!orderId || order?.status === "PAID") return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/pagamento/status/${orderId}`);
        const data = await res.json();
        if (data.success && (data.status === "APPROVED" || data.order_status === "PAID")) {
          clearInterval(interval);
          router.push(`/pagamento/sucesso?order_id=${orderId}`);
        }
      } catch {
        // Erros de polling ignorados
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [orderId, order?.status, router]);

  const handleCopyPix = () => {
    if (!pixData?.qr_code) return;
    navigator.clipboard.writeText(pixData.qr_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#d4af37] mb-3" />
        <p className="text-sm text-slate-500">Carregando ambiente seguro de pagamento...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-xl p-6 py-20 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-rose-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Não foi possível carregar o pagamento</h2>
        <p className="mt-2 text-sm text-slate-500">{error || "Pedido não encontrado."}</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/meus-pedidos">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Meus Pedidos
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const firstItem = order.items?.[0];
  const snapshot = firstItem?.snapshot_data;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Voltar */}
      <div className="mb-6">
        <Link
          href="/meus-pedidos"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Meus Pedidos
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Coluna Esquerda: Formas de Pagamento */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Pagamento do Pedido
            </h1>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
              Ambiente criptografado com validação oficial via Mercado Pago.
            </p>
          </div>

          {/* Seletor de Método */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSelectedMethod("pix")}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer ${
                selectedMethod === "pix"
                  ? "border-[#d4af37] bg-amber-50/40 dark:bg-amber-950/20 text-slate-900 dark:text-white shadow-sm"
                  : "border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:border-slate-300"
              }`}
            >
              <QrCode className={`h-6 w-6 mb-1.5 ${selectedMethod === "pix" ? "text-[#d4af37]" : ""}`} />
              <span className="text-sm font-bold">Pix Instantâneo</span>
              <span className="text-[11px] text-emerald-600 font-semibold">Aprovação Imediata</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedMethod("credit_card")}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer ${
                selectedMethod === "credit_card"
                  ? "border-[#d4af37] bg-amber-50/40 dark:bg-amber-950/20 text-slate-900 dark:text-white shadow-sm"
                  : "border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:border-slate-300"
              }`}
            >
              <CreditCard className={`h-6 w-6 mb-1.5 ${selectedMethod === "credit_card" ? "text-[#d4af37]" : ""}`} />
              <span className="text-sm font-bold">Cartão de Crédito</span>
              <span className="text-[11px] text-slate-500">Até 12x no Mercado Pago</span>
            </button>
          </div>

          {/* Painel Pix */}
          {selectedMethod === "pix" && (
            <Card className="border-slate-200 dark:border-zinc-800 shadow-sm">
              <CardContent className="p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <QrCode className="h-5 w-5 text-[#d4af37]" />
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                      Pague via Pix em segundos
                    </h3>
                  </div>
                  <div className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
                    <Clock className="h-3.5 w-3.5 animate-pulse" />
                    <span>Aguardando pagamento</span>
                  </div>
                </div>

                {loadingPix ? (
                  <div className="py-12 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#d4af37] mb-2" />
                    <p className="text-xs text-slate-500">Gerando cobrança Pix no Mercado Pago...</p>
                  </div>
                ) : pixData ? (
                  <div className="space-y-4 text-center">
                    {/* Imagem do QR Code */}
                    <div className="mx-auto flex h-48 w-48 items-center justify-center rounded-xl border border-slate-200 bg-white p-2 shadow-inner dark:border-zinc-700">
                      {pixData.qr_code_base64 ? (
                        <Image
                          src={
                            pixData.qr_code_base64.startsWith("data:")
                              ? pixData.qr_code_base64
                              : `data:image/png;base64,${pixData.qr_code_base64}`
                          }
                          alt="QR Code Pix"
                          width={176}
                          height={176}
                          className="h-full w-full object-contain"
                          unoptimized
                        />
                      ) : (
                        <QrCode className="h-32 w-32 text-slate-400" />
                      )}
                    </div>

                    <p className="text-xs text-slate-600 dark:text-zinc-400 max-w-xs mx-auto">
                      Abra o aplicativo do seu banco, escolha <strong>Pix &gt; Pagar com QR Code</strong> ou use o código Copia e Cola abaixo:
                    </p>

                    {/* Copia e Cola */}
                    <div className="flex items-center gap-2">
                      <Input
                        readOnly
                        value={pixData.qr_code}
                        className="font-mono text-xs bg-slate-50 dark:bg-zinc-950 truncate select-all"
                      />
                      <Button
                        type="button"
                        onClick={handleCopyPix}
                        className={`gap-1.5 shrink-0 transition-all ${
                          copied
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                            : "bg-slate-900 hover:bg-slate-800 text-white dark:bg-[#d4af37] dark:text-zinc-950 font-semibold"
                        }`}
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        {copied ? "Copiado!" : "Copiar Pix"}
                      </Button>
                    </div>

                    <div className="rounded-lg bg-slate-50 p-3 text-left text-[11px] text-slate-500 dark:bg-zinc-900/60 dark:text-zinc-400 space-y-1">
                      <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-zinc-300">
                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                        Confirmação Automática por Webhook
                      </div>
                      <p>
                        Assim que o pagamento for concluído no seu banco, esta página será atualizada automaticamente sem necessidade de recarregar.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-sm text-slate-600 mb-3">Informe seu CPF para emissão da chave Pix:</p>
                    <div className="flex max-w-xs mx-auto gap-2">
                      <Input
                        value={payerCpf}
                        onChange={(e) => setPayerCpf(e.target.value)}
                        placeholder="000.000.000-00"
                        className="text-xs"
                      />
                      <Button
                        size="sm"
                        onClick={() => setPixData(null)}
                        className="bg-slate-900 text-white dark:bg-[#d4af37] dark:text-zinc-950 font-semibold"
                      >
                        Gerar
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Painel Cartão */}
          {selectedMethod === "credit_card" && (
            <Card className="border-slate-200 dark:border-zinc-800 shadow-sm">
              <CardContent className="p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-[#d4af37]" />
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                      Cartão de Crédito via Mercado Pago
                    </h3>
                  </div>
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                </div>

                <div className="space-y-4">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50 space-y-2 text-xs text-slate-600 dark:text-zinc-400">
                    <p className="font-medium text-slate-800 dark:text-zinc-200">
                      Segurança de Nível Bancário:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-[11px]">
                      <li>Parcelamento em até 12 vezes conforme regras da sua bandeira.</li>
                      <li>Nenhum dado do seu cartão é transmitido ou salvo nos nossos servidores.</li>
                      <li>A transação é processada em ambiente 100% criptografado do Mercado Pago.</li>
                    </ul>
                  </div>

                  {loadingCard ? (
                    <div className="py-6 text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#d4af37] mb-2" />
                      <p className="text-xs text-slate-500">Preparando checkout seguro do Mercado Pago...</p>
                    </div>
                  ) : preferenceData ? (
                    <div className="space-y-3">
                      <a
                        href={preferenceData.init_point}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full"
                      >
                        <Button className="w-full h-12 text-base gap-2 bg-[#009EE3] hover:bg-[#0082ba] text-white font-bold shadow-md">
                          Pagar com Mercado Pago
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </a>
                      <p className="text-center text-[11px] text-slate-400">
                        Você será direcionado para o ambiente do Mercado Pago e retornará automaticamente após pagar.
                      </p>
                    </div>
                  ) : (
                    <Button
                      onClick={() => setPreferenceData(null)}
                      className="w-full bg-slate-900 text-white dark:bg-[#d4af37] dark:text-zinc-950 font-semibold"
                    >
                      Iniciar Pagamento com Cartão
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Coluna Direita: Resumo do Pedido */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm sticky top-24">
            <CardContent className="p-6 space-y-5">
              <div className="border-b border-slate-100 pb-3 dark:border-zinc-800">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Resumo da Compra
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-mono text-base font-bold text-slate-900 dark:text-white">
                    {order.order_number}
                  </span>
                  {order.quote_number && (
                    <span className="text-xs text-slate-500">Orç: {order.quote_number}</span>
                  )}
                </div>
              </div>

              {/* Detalhes do item congelado */}
              <div className="space-y-3 text-xs text-slate-600 dark:text-zinc-400">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                    <Package className="h-5 w-5 text-slate-600 dark:text-zinc-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 dark:text-white truncate">
                      {snapshot?.model_name || firstItem?.model_name || "Uniforme Personalizado"}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Quantidade: {firstItem?.quantity} peças • Cor: {snapshot?.color?.name || "Padrão"}
                    </p>
                  </div>
                </div>

                {snapshot?.size_breakdown && Object.keys(snapshot.size_breakdown).length > 0 && (
                  <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-zinc-800/50">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold mb-1">
                      Grade Solicitada:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(snapshot.size_breakdown).map(([tam, qtd]) => (
                        <span
                          key={tam}
                          className="px-1.5 py-0.5 rounded bg-white dark:bg-zinc-800 text-[10px] font-mono border border-slate-200 dark:border-zinc-700"
                        >
                          <strong>{tam}:</strong> {qtd}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Totalizador financeiro */}
              <div className="border-t border-slate-100 pt-4 dark:border-zinc-800 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal:</span>
                  <span>
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                      order.total_amount + (order.discount_amount || 0)
                    )}
                  </span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Desconto Aplicado:</span>
                    <span>
                      -{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(order.discount_amount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-baseline border-t border-slate-100 pt-3 dark:border-zinc-800">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">Total a Pagar:</span>
                  <span className="text-2xl font-black text-slate-900 dark:text-[#d4af37]">
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(order.total_amount)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
