import React from "react";
import { Star, Quote, Building2, Trophy, Stethoscope, GraduationCap } from "lucide-react";

export function TestimonialsSection() {
  const reviews = [
    {
      author: "Rodrigo Almeida",
      role: "Diretor Comercial • AgroTech Transportes",
      icon: <Building2 className="w-5 h-5 text-amber-400" />,
      text: "Fizemos 80 camisas polo para nossa equipe comercial e administrativa. A qualidade do bordado é impecável e o tecido Piquet PV não deforma nem cria bolinhas após dezenas de lavagens. Transmitiu outra postura aos nossos clientes.",
      rating: 5,
    },
    {
      author: "Capitão Gabriel 'Biel'",
      role: "Atlética Pantanal F.C. • Futebol & Futsal",
      icon: <Trophy className="w-5 h-5 text-amber-400" />,
      text: "Os uniformes de time ficaram de outro nível! A sublimação total 4K é viva, não descasca e o tecido Dry Fit é super leve e não pesa no corpo durante os jogos. Sem falar na entrega que foi pontual para a estreia do campeonato.",
      rating: 5,
    },
    {
      author: "Dra. Camila Vasconcelos",
      role: "Clínica Integrada de Odontologia & Harmonização",
      icon: <Stethoscope className="w-5 h-5 text-amber-400" />,
      text: "Comprei os scrubs de Two Way e os jalecos de gabardine para todas as nossas profissionais. O caimento é perfeito, super elegante e o tecido tem uma elasticidade fantástica para os atendimentos longos. Super recomendo a GH!",
      rating: 5,
    },
    {
      author: "Profª Maristela Santos",
      role: "Coordenação Pedagógica • Colégio Horizonte",
      icon: <GraduationCap className="w-5 h-5 text-amber-400" />,
      text: "A durabilidade das camisetas e moletons escolares é impressionante. As mães elogiaram muito porque não desbota e a gola não esgarça. A GH virou nossa fornecedora exclusiva.",
      rating: 5,
    },
  ];

  return (
    <section className="py-20 lg:py-28 relative bg-[#090A0F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-4">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>Satisfação Comprovada</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-4">
            Quem Veste GH Camiseteria{" "}
            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent">
              Recomenda
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-300">
            Mais de 50.000 peças entregues com excelência técnica, pontualidade e satisfação de 100% dos nossos parceiros.
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {reviews.map((rev, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-[#0D0F17] border border-slate-800 p-6 sm:p-8 flex flex-col justify-between shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-slate-700" />
                </div>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed italic mb-6">
                  &ldquo;{rev.text}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                  {rev.icon}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{rev.author}</h4>
                  <p className="text-xs text-amber-400/90">{rev.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
