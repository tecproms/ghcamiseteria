export interface Product {
  id: string;
  name: string;
  category: "polos" | "sociais" | "times" | "jalecos" | "scrubs" | "escolares" | "camisetas";
  categoryLabel: string;
  badge?: string;
  image: string;
  summary: string;
  description: string;
  fabrics: string[];
  techniques: string[];
  sizes: string;
  colors: string[];
  segments: string[];
  minOrder?: number;
}

export interface CategoryTab {
  id: string;
  label: string;
  iconName: string;
  description: string;
}

export const CATEGORIES: CategoryTab[] = [
  { id: "todas", label: "Todos os Modelos", iconName: "Sparkles", description: "Explore nossa linha completa de uniformes e peças sob medida" },
  { id: "polos", label: "Polos Corporativas", iconName: "Shirt", description: "Elegância casual e presença profissional para empresas e equipes" },
  { id: "sociais", label: "Camisas Sociais", iconName: "Briefcase", description: "Alfaiataria executiva nobre para escritórios e atendimento" },
  { id: "times", label: "Uniformes de Times", iconName: "Trophy", description: "Sublimação total esportiva de alta performance e respirabilidade" },
  { id: "jalecos", label: "Jalecos Médicos", iconName: "Stethoscope", description: "Sofisticação, caimento impecável e postura para a área da saúde" },
  { id: "scrubs", label: "Pijamas Cirúrgicos", iconName: "HeartPulse", description: "Conforto térmico, mobilidade e bolsos utilitários em Two Way" },
  { id: "escolares", label: "Uniformes Escolares", iconName: "GraduationCap", description: "Máxima resistência ao uso diário e lavagens frequentes" },
  { id: "camisetas", label: "Camisetas & Eventos", iconName: "Tag", description: "Ideal para eventos promocionais, prestadores e equipes operacionais" },
];

export const PRODUCTS: Product[] = [
  {
    id: "polo-corporativa-ouro",
    name: "Camisa Polo Corporativa Premium Friso Ouro",
    category: "polos",
    categoryLabel: "Polo Corporativa",
    badge: "Mais Pedido",
    image: "/images/catalog/polos-corporativas.jpg",
    summary: "A polo mais escolhida por empresas que prezam por elegância, caimento impecável e durabilidade.",
    description: "Confeccionada com gola e punhos em retilínea encorpada e frisos contrastantes em ouro ou na cor da sua marca. Costuras duplas reforçadas ombro a ombro e peitilho estruturado com botões nobres. Não deforma e não perde o brilho mesmo após dezenas de lavagens.",
    fabrics: ["Piquet PV Nobre (50% Poliéster / 50% Viscose Anti-pilling)", "Piquet 100% Algodão Penteado"],
    techniques: ["Bordado Computadorizado de Alta Densidade", "DTF Ultra HD para Brasões Detalhados"],
    sizes: "Masculino: P ao EXG4 | Feminino Baby Look: P ao GG | Infantil: 2 ao 16",
    colors: ["Preto com Frisos Dourados", "Azul Marinho com Branco", "Branco com Marinho", "Grafite Chumbo", "Verde Petróleo", "Bordô / Vinho"],
    segments: ["Empresas", "Comércio", "Supervisores", "Concessionárias", "Eventos Corporativos"],
    minOrder: 10,
  },
  {
    id: "camisa-social-executiva",
    name: "Camisa Social Executiva Manga Longa & Curta",
    category: "sociais",
    categoryLabel: "Camisa Social",
    badge: "Linha Alfaiataria",
    image: "/images/catalog/camisas-sociais.jpg",
    summary: "Corte de alfaiataria fina, colarinho estruturado e tecido leve para ambientes climatizados e recepções.",
    description: "Desenvolvida para valorizar a postura e transmitir credibilidade imediata. Colarinho com entretela importada que não amassa, punhos reguláveis, modelagem comfort ou slim fit sob medida para homens e mulheres.",
    fabrics: ["Tricoline com Elastano (conforto elástico)", "Maquinetado Fio Nobre", "Oxfordine de Alta Praticidade"],
    techniques: ["Bordado Computadorizado no Peito, Bolso ou Gola"],
    sizes: "Masculino: 1 ao 7 | Feminino Acinturado: 36 ao 52",
    colors: ["Preto Black Elegance", "Azul Bebê Clássico", "Branco Alvo", "Azul Marinho Real", "Cinza Prata"],
    segments: ["Recepção", "Advocacia", "Clínicas", "Vendas", "Diretoria & Gerência"],
    minOrder: 10,
  },
  {
    id: "uniforme-time-futebol",
    name: "Uniforme Esportivo Sublimação Total (Futebol & Futsal)",
    category: "times",
    categoryLabel: "Esportivo & Times",
    badge: "Sublimação Total 4K",
    image: "/images/catalog/uniformes-times.jpg",
    summary: "Conjunto completo profissional (camisa, calção e meião opcional) com design 100% exclusivo.",
    description: "Tecnologia têxtil esportiva com fibras que transportam o suor para fora do tecido, mantendo a pele seca e o uniforme leve até o último minuto de jogo. Cores vibrantes com proteção contra raios solares UV50+.",
    fabrics: ["Dry Fit com Proteção UV50+", "Dry Colmeia Aerodinâmico", "Dry Furadinho nas Laterais Ventiladas"],
    techniques: ["Sublimação Digital Total em Alta Definição", "Escudo em Patch Termocolante ou Bordado", "Numeração e Nomes Individuais"],
    sizes: "Adulto: PP ao EXG3 | Infantil: 04 ao 16 anos",
    colors: ["Arte 100% Personalizada: Desenvolvemos o visual exclusivo do seu time"],
    segments: ["Futebol de Campo", "Futsal", "Vôlei", "Atléticas Universitárias", "Corridas de Rua"],
    minOrder: 10,
  },
  {
    id: "jaleco-clinico-nobrez",
    name: "Jaleco Clínico de Alta Elegância & Postura",
    category: "jalecos",
    categoryLabel: "Jalecos & Saúde",
    badge: "Saúde & Estética",
    image: "/images/catalog/jalecos-saude.jpg",
    summary: "Toque suave, caimento estruturado e acabamento sofisticado para médicos, dentistas e esteticistas.",
    description: "Desenvolvido com modelagem pensada na ergonomia e elegância no atendimento clínico. Bolsos estratégicos para instrumentos, celular e canetas, com opção de gola padre, gola esporte, botões cobertos ou zíper dourado/prata.",
    fabrics: ["Gabardine Premium Importada (Toque de Seda)", "Two Way com Elastano", "Oxfordine Leve"],
    techniques: ["Bordado Computadorizado de Brasão, Nome e Especialidade"],
    sizes: "Feminino Acinturado: PP ao EXG2 | Masculino Estruturado: PP ao EXG3",
    colors: ["Branco Neve Clínico", "Preto Elegance", "Azul Marinho", "Nude Rosé", "Verde Eucalipto", "Cinza Titânio"],
    segments: ["Médicos & Cirurgiões", "Dentistas & Odontologia", "Estética & Harmonização", "Biomedicina & Laboratórios"],
    minOrder: 5,
  },
  {
    id: "scrub-pijama-cirurgico",
    name: "Pijama Cirúrgico Scrub Confort Spandex",
    category: "scrubs",
    categoryLabel: "Pijamas Cirúrgicos / Scrubs",
    badge: "Ultra Mobilidade",
    image: "/images/catalog/pijamas-cirurgicos-scrubs.jpg",
    summary: "O queridinho dos plantões: tecido flexível com elastano, não amassa e não esquenta durante o trabalho.",
    description: "Conjunto ergonômico composto por blusa com decote em V anatômico e calça com elástico reforçado no cós, cordão de ajuste e bolsos utilitários estilo cargo nas pernas para estetoscópio e acessórios.",
    fabrics: ["Two Way Spandex com 5% Elastano (Secagem Instantânea)", "Gabardine Silk Macia"],
    techniques: ["Bordado Delicado de Identificação Profissional", "DTF Termocolante Discreto"],
    sizes: "Unissex & Feminino Slim: PP ao EXG3",
    colors: ["Azul Royal Hospitalar", "Azul Marinho", "Verde Cirúrgico", "Vinho Marsala", "Preto Black", "Lilás Lavanda"],
    segments: ["Hospitais", "Centros Cirúrgicos", "Clínicas Veterinárias", "Odontologia", "Enfermagem"],
    minOrder: 5,
  },
  {
    id: "uniforme-escolar-resistente",
    name: "Uniforme Escolar Completo Anti-Desbotamento",
    category: "escolares",
    categoryLabel: "Uniformes Escolares",
    badge: "Ultra Resistente",
    image: "/images/catalog/uniformes-escolares.jpg",
    summary: "Conforto para o aprendizado e resistência comprovada para dezenas de lavagens durante todo o ano letivo.",
    description: "Desenvolvemos o conjunto completo para colégios, redes de ensino e turmas de formandos. Costuras reforçadas com fio de alta tenacidade, tintura reativa que preserva as cores vivas e tecidos confortáveis para o clima quente.",
    fabrics: ["Malha Poliviscose PV Malwee (Não desbota, não faz bolinha)", "Piquet Escolar Confort", "Moletom 3 Cabos Flanelado", "Tactel com Forro"],
    techniques: ["Serigrafia Especial Anti-Craquelamento", "Bordado Computadorizado Institucional"],
    sizes: "Maternal: 1 ao 3 anos | Infantil: 4 ao 14 anos | Juvenil & Adulto: PP ao EXG3",
    colors: ["Combinações personalizadas com frisos e golas conforme o manual do colégio"],
    segments: ["Escolas Particulares & Públicas", "Creches & Berçários", "Cursos & Faculdades", "Turmas de Terceirão"],
    minOrder: 15,
  },
  {
    id: "camiseta-profissional-operacional",
    name: "Camiseta Profissional Dia a Dia & Promocional",
    category: "camisetas",
    categoryLabel: "Camisetas Profissionais",
    badge: "Custo-Benefício Campeão",
    image: "/images/catalog/camisetas-profissionais.jpg",
    summary: "A camiseta coringa para equipes de campo, obras, logística, eventos, entregas e comércios.",
    description: "Modelagem tradicional unissex com costura reforçada de ombro a ombro e reforço na gola para manter o caimento alinhado. Perfeita para empresas com equipes numerosas que necessitam de uniformes duráveis e econômicos.",
    fabrics: ["100% Algodão Penteado Fio 30.1 Menegotti", "Malha PV Poliviscose", "Dry Fit Poliéster Leve"],
    techniques: ["Serigrafia / Silk-screen em Alto Volume", "DTF Digital Fotográfico"],
    sizes: "Unissex: PP ao EXG4 | Baby Look Feminina: P ao GG | Infantil: 4 ao 16",
    colors: ["Mais de 30 opções de cores sólidas e mesclas em catálogo"],
    segments: ["Prestadores de Serviço", "Logística & Transporte", "Instalações & Manutenção", "Promotores & Feiras", "Oficinas"],
    minOrder: 15,
  },
  {
    id: "coordenado-empresarial-black-gold",
    name: "Kit Coordenação Visual Corporativa Completa",
    category: "polos",
    categoryLabel: "Linha Corporativa",
    badge: "Solução Completa",
    image: "/images/catalog/empresa-proposta.jpg",
    summary: "Padronize todos os setores da sua empresa com harmonia visual entre diretoria, vendas e operação.",
    description: "Um projeto completo desenvolvido pela GH Camiseteria onde combinamos camisas sociais para executivos, polos para recepção/comercial e camisetas para a operação, todos seguindo rigorosamente a identidade visual e as cores da sua marca.",
    fabrics: ["Mix Coordenado: Piquet PV (50% Poliéster / 50% Viscose) + Tricoline Social + Algodão 30.1"],
    techniques: ["Bordados padronizados em escala", "Aplicações de etiquetas personalizadas"],
    sizes: "Grade mista sob medida para todo o quadro de funcionários",
    colors: ["Paleta personalizada baseada no manual da sua marca"],
    segments: ["Indústrias", "Redes de Franquias", "Escritórios Corporativos", "Concessionárias", "Construtoras"],
    minOrder: 20,
  },
];

export const TECHNIQUES = [
  {
    id: "bordado",
    title: "Bordado Computadorizado",
    tagline: "Sofisticação e durabilidade eterna",
    description: "Máquinas industriais eletrônicas de alta velocidade aplicam fios resistentes que não soltam nem perdem a cor. Ideal para logos em polos, camisas sociais, jalecos e bonés.",
    bestFor: "Polos corporativas, camisas sociais, jalecos e calças",
    pros: ["Relevo nobre e toque elegante", "Resiste a lavagens industriais", "Valoriza a marca corporativa"],
  },
  {
    id: "sublimacao",
    title: "Sublimação Total Digital",
    tagline: "Cores vivas sem limites de estampas",
    description: "A tinta passa do estado sólido para gasoso e se funde com as fibras de poliéster. Toque zero, não racha, não descasca e mantém a respirabilidade original do tecido.",
    bestFor: "Camisas de futebol, times, atléticas, ciclismo e abadás",
    pros: ["Impressão fotográfica de ponta a ponta", "Zero relevo (toque imperceptível)", "Não obstrui os poros do tecido Dry"],
  },
  {
    id: "serigrafia",
    title: "Serigrafia / Silk-screen",
    tagline: "Máxima economia para grandes quantidades",
    description: "Técnica tradicional com matrizes e tintas especiais à base d'água ou plastisol. Proporciona cores sólidas de alto impacto e excelente custo-benefício para lotes médios e grandes.",
    bestFor: "Camisetas promocionais, eventos, uniformes escolares e operacionais",
    pros: ["Custo reduzido para volumes maiores", "Alta cobertura de cor em tecidos escuros", "Excelente durabilidade diária"],
  },
  {
    id: "dtf",
    title: "DTF (Direct to Film) Ultra HD",
    tagline: "Precisão microscópica e degradês perfeitos",
    description: "Tecnologia de ponta em estamparia digital onde a arte é impressa em filme especial com pó termofusível e transferida a quente. Permite reproduzir fotos, degradês e sombras em qualquer cor de tecido.",
    bestFor: "Estampas coloridas complexas, pequenas tiragens e brasões detalhados",
    pros: ["Fidelidade máxima às cores originais", "Aplicável em algodão, poliéster e mistos", "Bordas perfeitas sem contorno rígido"],
  },
];

export const FABRICS_GUIDE = [
  {
    name: "Piquet PV Nobre (50/50)",
    composition: "50% Poliéster / 50% Viscose",
    description: "Tecido nobre de toque macio e caimento alinhado para polos corporativas. A união de 50% poliéster com 50% viscose confere alta durabilidade, estabilidade que não deforma e tratamento anti-pilling que não cria bolinhas.",
    usage: "Polos corporativas, uniformes executivos e eventos nobres.",
  },
  {
    name: "Dry Fit com Proteção UV50+",
    composition: "100% Poliéster Microfibra Tecnológica",
    description: "Fibras inteligentes de rápida absorção e evaporação do suor. Bloqueio solar certificado UV50+, ideal para atividades sob o sol e práticas esportivas intensas.",
    usage: "Camisas de times, uniformes esportivos, equipes de rua e logística externa.",
  },
  {
    name: "Algodão 100% Penteado Fio 30.1",
    composition: "100% Algodão Natural Selecionado",
    description: "Fibras longas penteadas que eliminam impurezas. Toque super macio, alta respirabilidade e sensação fresca contra a pele durante o dia inteiro.",
    usage: "Camisetas casuais, eventos premium, brindes corporativos e moda.",
  },
  {
    name: "Gabardine Premium de Alta Densidade",
    composition: "Polyester Twill com toque acetinado",
    description: "Tecido encorpado que não amassa com facilidade e mantém um caimento impecável. Possui visual semibrilhoso elegante e toque macio similar à seda.",
    usage: "Jalecos médicos, odontológicos, estética e vestuário de apresentação.",
  },
  {
    name: "Two Way com Spandex / Elastano",
    composition: "95% Poliéster / 5% Elastano",
    description: "Tecido bi-elástico que acompanha os movimentos do corpo sem repuxar. Secagem rápida após a lavagem e não precisa passar a ferro.",
    usage: "Pijamas cirúrgicos (Scrubs), calças operacionais e jalecos flexíveis.",
  },
  {
    name: "Poliviscose PV (Malha Fria)",
    composition: "67% Poliéster / 33% Viscose",
    description: "Excelente resistência mecânica, toque agradável e secagem rápida. Praticamente não amassa e mantém a cor viva por muito mais tempo.",
    usage: "Uniformes escolares, camisetas promocionais de alta rotatividade.",
  },
];

export const COMPANY_INFO = {
  name: "GH Camiseteria",
  tagline: "Sua ideia, do seu jeito.",
  subtitle: "Uniformes em Geral",
  phoneFormatted: "(67) 99601-4295",
  phoneRaw: "5567996014295",
  whatsappUrl: "https://wa.me/5567996014295",
  instagram: "@ghcamiseteria",
  instagramUrl: "https://instagram.com/ghcamiseteria",
  city: "Campo Grande - MS",
  delivery: "Envio rápido para todo o Mato Grosso do Sul e Brasil",
  hours: "Segunda a Sexta: 08:00 às 18:00 | Sábado: 08:00 às 12:00",
};
