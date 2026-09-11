import Link from "next/link";
import { ArrowRight, Sparkles, CheckCircle2, Shield, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white py-20 md:py-28 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800 mb-6">
              <Sparkles className="h-3.5 w-3.5 text-amber-600" />
              Tecnologia & Confecção Sob Medida
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Uniformes e Camisetas Personalizadas com Excelência.
            </h1>
            <p className="mt-6 text-lg text-slate-600 leading-relaxed">
              Desenvolva uniformes corporativos, industriais, esportivos e promocionais com tecidos de alta durabilidade, modelagem precisa e personalização de ponta.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/monte-seu-uniforme">
                <Button size="lg" className="gap-2">
                  Monte seu Uniforme
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/uniformes">
                <Button variant="outline" size="lg">
                  Ver Catálogo de Modelos
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Destaques / Benefícios */}
      <section className="py-16 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="pt-6">
                <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-900 mb-4">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-2">Acabamento Impecável</h3>
                <p className="text-sm text-slate-500">
                  Costuras reforçadas, tecidos confortáveis e estampas de alta durabilidade para o dia a dia.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-900 mb-4">
                  <Clock className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-2">Pontualidade na Entrega</h3>
                <p className="text-sm text-slate-500">
                  Acompanhamento em tempo real de cada etapa do processo produtivo do seu pedido.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-900 mb-4">
                  <Shield className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-2">Atendimento Corporativo</h3>
                <p className="text-sm text-slate-500">
                  Suporte especializado para pedidos por atacado, empresas, indústrias e eventos de qualquer porte.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Pronto para transformar a identidade da sua equipe?
          </h2>
          <p className="mt-3 text-base text-slate-600 max-w-2xl mx-auto">
            Acompanhe orçamentos rápidos e pedidos diretamente pela nossa plataforma online.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/monte-seu-uniforme">
              <Button size="lg">Iniciar Personalização</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
