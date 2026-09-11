"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Package,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Order } from "@/types/orders";

function SucessoContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      if (!orderId) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/pedidos/${orderId}`);
        const data = await res.json();
        if (data.success && data.order) {
          setOrder(data.order);
        }
      } catch {
        // Fallback silencioso
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [orderId]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8 text-center">
      {/* Ícone de Sucesso Animado */}
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shadow-inner">
        <CheckCircle2 className="h-10 w-10 animate-bounce" />
      </div>

      <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 mb-3">
        <Sparkles className="h-3.5 w-3.5 text-[#d4af37]" />
        Pagamento Validado & Pedido Confirmado
      </div>

      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
        Obrigado pela sua compra!
      </h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
        O pagamento do seu pedido foi processado e validado com sucesso pelo Mercado Pago.
      </p>

      {/* Card de Informações do Pedido */}
      {loading ? (
        <div className="py-12">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#d4af37]" />
        </div>
      ) : order ? (
        <Card className="mt-8 text-left border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-zinc-800">
              <div>
                <span className="text-xs text-slate-400 block">Nº DO PEDIDO</span>
                <span className="font-mono text-base font-bold text-slate-900 dark:text-[#d4af37]">
                  {order.order_number}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">STATUS</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                  <ShieldCheck className="h-3.5 w-3.5" /> Pago
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs text-slate-600 dark:text-zinc-400">
              <div>
                <span className="text-slate-400 block">Modelo do Uniforme:</span>
                <strong className="text-slate-900 dark:text-zinc-200">
                  {order.items?.[0]?.snapshot_data?.model_name || order.items?.[0]?.model_name || "Uniforme Personalizado"}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block">Quantidade de Peças:</span>
                <strong className="text-slate-900 dark:text-zinc-200">
                  {order.items?.[0]?.quantity || 1} peças
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block">Forma de Pagamento:</span>
                <strong className="text-slate-900 dark:text-zinc-200 uppercase">
                  {order.payment_method === "pix" ? "Pix Instantâneo" : order.payment_method === "credit_card" ? "Cartão de Crédito" : "Mercado Pago"}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block">Valor Total:</span>
                <strong className="text-slate-900 dark:text-[#d4af37] font-mono text-sm">
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(order.total_amount)}
                </strong>
              </div>
            </div>

            <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500 dark:bg-zinc-800/50 dark:text-zinc-400">
              💡 <strong>Próximos Passos:</strong> Nossa equipe técnica já recebeu a especificação exata do seu pedido com as cores, posições e grade de tamanhos aprovadas. Você pode acompanhar todas as atualizações de produção e envio pela sua área de cliente.
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Ações */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link href="/meus-pedidos" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto gap-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-[#d4af37] dark:text-zinc-950 font-bold px-6 h-11">
            <Package className="h-4 w-4" />
            Acompanhar em Meus Pedidos
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <Link href="/" className="w-full sm:w-auto">
          <Button variant="outline" className="w-full sm:w-auto h-11">
            Voltar à Loja
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function PagamentoSucessoPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#d4af37]" />
        </div>
      }
    >
      <SucessoContent />
    </Suspense>
  );
}
