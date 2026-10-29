"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Product, CATEGORIES } from "@/data/catalog";
import {
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  LogOut,
  Upload,
  Search,
  Sparkles,
  ShieldCheck,
  Tag,
  Shirt,
  X,
  Check,
  AlertCircle,
  Loader2,
  Layers,
  Database,
  ArrowUpRight,
  Eye,
} from "lucide-react";

const CATEGORY_OPTIONS = [
  { id: "polos", label: "Polo Corporativa" },
  { id: "sociais", label: "Camisa Social" },
  { id: "times", label: "Esportivo & Times" },
  { id: "jalecos", label: "Jalecos & Saúde" },
  { id: "scrubs", label: "Pijamas Cirúrgicos / Scrubs" },
  { id: "escolares", label: "Uniformes Escolares" },
  { id: "camisetas", label: "Camisetas & Eventos" },
];

const INITIAL_FORM: Omit<Product, "id"> & { id?: string } = {
  name: "",
  category: "polos",
  categoryLabel: "Polo Corporativa",
  badge: "",
  image: "",
  summary: "",
  description: "",
  fabrics: ["Piquet PV Nobre (50% Poliéster / 50% Viscose)", "100% Algodão Penteado"],
  techniques: ["Bordado Computadorizado"],
  sizes: "P ao EXG4",
  colors: ["Preto", "Branco", "Azul Marinho"],
  segments: ["Empresas", "Eventos"],
  minOrder: 10,
};

export default function AdminDashboardPage() {
  const router = useRouter();

  // State
  const [authChecking, setAuthChecking] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("todas");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [saveLoading, setSaveLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Upload State
  const [uploadLoading, setUploadLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tag inputs helper
  const [tagInputs, setTagInputs] = useState({
    fabric: "",
    technique: "",
    color: "",
    segment: "",
  });

  // Delete Dialog State
  const [deleteProductItem, setDeleteProductItem] = useState<Product | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // 1. Check Auth
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/admin/auth/check");
        const data = await res.json();
        if (!data.authenticated) {
          router.push("/admin/login");
        } else {
          setAuthChecking(false);
          loadProducts();
        }
      } catch {
        router.push("/admin/login");
      }
    }
    checkAuth();
  }, [router]);

  // 2. Load Products
  async function loadProducts() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/products", { cache: "no-store" });
      const data = await res.json();
      if (Array.isArray(data)) {
        setProducts(data);
      }
    } catch (err) {
      console.error("Falha ao carregar produtos:", err);
    } finally {
      setLoading(false);
    }
  }

  // 3. Logout
  async function handleLogout() {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } catch (e) {
      console.error(e);
    }
    router.push("/admin/login");
  }

  // 4. Open Modal for Create
  function handleOpenCreate() {
    setModalMode("create");
    setFormData({
      ...INITIAL_FORM,
      image: "/images/brand/logo-gh.png",
    });
    setFormError(null);
    setModalOpen(true);
  }

  // 5. Open Modal for Edit
  function handleOpenEdit(product: Product) {
    setModalMode("edit");
    setFormData({
      id: product.id,
      name: product.name,
      category: product.category,
      categoryLabel: product.categoryLabel,
      badge: product.badge || "",
      image: product.image,
      summary: product.summary,
      description: product.description,
      fabrics: product.fabrics ? [...product.fabrics] : [],
      techniques: product.techniques ? [...product.techniques] : [],
      sizes: product.sizes || "P ao EXG",
      colors: product.colors ? [...product.colors] : [],
      segments: product.segments ? [...product.segments] : [],
      minOrder: product.minOrder || 10,
    });
    setFormError(null);
    setModalOpen(true);
  }

  // 6. Handle Image File Upload
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadLoading(true);
    setFormError(null);

    const data = new FormData();
    data.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: data,
      });
      const result = await res.json();

      if (!res.ok) {
        setFormError(result.error || "Erro ao fazer upload da imagem.");
      } else if (result.url) {
        setFormData((prev) => ({ ...prev, image: result.url }));
      }
    } catch {
      setFormError("Erro de comunicação ao enviar imagem.");
    } finally {
      setUploadLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  // 7. Save Product (Create / Update)
  async function handleSaveProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError("O nome da peça é obrigatório.");
      return;
    }
    if (!formData.category) {
      setFormError("Selecione uma categoria.");
      return;
    }

    setSaveLoading(true);
    setFormError(null);

    try {
      const catObj = CATEGORY_OPTIONS.find((c) => c.id === formData.category);
      const payload = {
        ...formData,
        categoryLabel: catObj ? catObj.label : formData.category,
        minOrder: Number(formData.minOrder) || 10,
      };

      let res: Response;
      if (modalMode === "create") {
        res = await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`/api/admin/products/${formData.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const resData = await res.json();
      if (!res.ok) {
        setFormError(resData.error || "Erro ao salvar produto.");
        setSaveLoading(false);
        return;
      }

      // Sucesso
      setModalOpen(false);
      await loadProducts();
    } catch {
      setFormError("Erro de conexão ao salvar produto.");
    } finally {
      setSaveLoading(false);
    }
  }

  // 8. Delete Product
  async function handleDeleteConfirm() {
    if (!deleteProductItem) return;

    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/products/${deleteProductItem.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDeleteProductItem(null);
        await loadProducts();
      } else {
        alert("Erro ao excluir produto.");
      }
    } catch {
      alert("Erro ao comunicar com o servidor.");
    } finally {
      setDeleteLoading(false);
    }
  }

  // Tag Add / Remove helpers
  const addTag = (field: "fabrics" | "techniques" | "colors" | "segments", inputKey: keyof typeof tagInputs) => {
    const val = tagInputs[inputKey].trim();
    if (!val) return;
    if (!formData[field].includes(val)) {
      setFormData((prev) => ({ ...prev, [field]: [...prev[field], val] }));
    }
    setTagInputs((prev) => ({ ...prev, [inputKey]: "" }));
  };

  const removeTag = (field: "fabrics" | "techniques" | "colors" | "segments", index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  // Filtered Products for Table
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = categoryFilter === "todas" || p.category === categoryFilter;
      const q = search.toLowerCase().trim();
      if (!q) return matchCat;

      const matchText =
        p.name.toLowerCase().includes(q) ||
        p.categoryLabel.toLowerCase().includes(q) ||
        (p.badge && p.badge.toLowerCase().includes(q)) ||
        (p.summary && p.summary.toLowerCase().includes(q)) ||
        (p.fabrics && p.fabrics.some((f) => f.toLowerCase().includes(q)));

      return matchCat && matchText;
    });
  }, [products, categoryFilter, search]);

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#07090E] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto" />
          <p className="text-xs text-slate-400 font-medium">Verificando credenciais...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 pb-20">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#090B12]/95 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative w-36 h-10 shrink-0">
                <Image
                  src="/images/brand/logo-gh.png"
                  alt="GH Camiseteria"
                  fill
                  priority
                  className="object-contain"
                />
              </div>
            </Link>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              Gestão do Catálogo
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Link to public site */}
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Ver Site Ao Vivo</span>
            </Link>

            {/* New Product Button */}
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-950 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 hover:from-amber-200 hover:to-amber-400 shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Novo Produto</span>
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-slate-400 hover:text-rose-400 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 transition-colors"
              title="Sair do Painel"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Stats & Info Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-5 rounded-2xl bg-[#0D0F17] border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">
                Total no Catálogo
              </p>
              <h3 className="text-2xl font-black text-white">{products.length}</h3>
              <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                <span>●</span> Prontos para exibição
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Shirt className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0D0F17] border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">
                Categorias Ativas
              </p>
              <h3 className="text-2xl font-black text-white">
                {new Set(products.map((p) => p.category)).size}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">Linhas de vestuário</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Layers className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0D0F17] border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">
                Peças em Destaque
              </p>
              <h3 className="text-2xl font-black text-white">
                {products.filter((p) => Boolean(p.badge)).length}
              </h3>
              <p className="text-[11px] text-amber-400 mt-1">Com selos promocionais</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Sparkles className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0D0F17] border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">
                Banco de Dados
              </p>
              <h3 className="text-base font-bold text-white">PostgreSQL Ativo</h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Transacional + Espelho em Disco
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Database className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="rounded-2xl bg-[#0D0F17] border border-slate-800 p-4 mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Categories Tab Pill Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <button
              onClick={() => setCategoryFilter("todas")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap ${
                categoryFilter === "todas"
                  ? "bg-amber-400 text-slate-950"
                  : "bg-slate-900 text-slate-400 hover:text-white"
              }`}
            >
              Todas ({products.length})
            </button>
            {CATEGORY_OPTIONS.map((cat) => {
              const count = products.filter((p) => p.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap ${
                    categoryFilter === cat.id
                      ? "bg-amber-400 text-slate-950"
                      : "bg-slate-900 text-slate-400 hover:text-white"
                  }`}
                >
                  {cat.label} ({count})
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full lg:w-72 shrink-0">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/80"
            />
          </div>
        </div>

        {/* Products Table / Grid */}
        <div className="rounded-2xl bg-[#0D0F17] border border-slate-800 overflow-hidden shadow-xl">
          {loading ? (
            <div className="p-12 text-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto mb-2" />
              <p className="text-xs">Carregando catálogo...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4">
                <Shirt className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-white mb-1">Nenhum produto encontrado</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
                Não encontramos produtos correspondentes ao filtro. Deseja adicionar uma nova peça?
              </p>
              <button
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Novo Produto</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-4">Foto</th>
                    <th className="py-3.5 px-4">Nome da Peça</th>
                    <th className="py-3.5 px-4">Categoria</th>
                    <th className="py-3.5 px-4">Destaque</th>
                    <th className="py-3.5 px-4">Tecidos & Técnicas</th>
                    <th className="py-3.5 px-4 text-center">Mínimo</th>
                    <th className="py-3.5 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredProducts.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-900/40 transition-colors group"
                    >
                      {/* Thumbnail */}
                      <td className="py-3 px-4">
                        <div className="relative w-14 h-16 rounded-lg overflow-hidden bg-slate-950 border border-slate-800 shrink-0">
                          <Image
                            src={p.image || "/images/brand/logo-gh.png"}
                            alt={p.name}
                            fill
                            className="object-cover object-top"
                          />
                        </div>
                      </td>

                      {/* Name & Summary */}
                      <td className="py-3 px-4 max-w-xs">
                        <h4 className="font-bold text-white text-sm group-hover:text-amber-300 transition-colors line-clamp-1">
                          {p.name}
                        </h4>
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                          {p.summary || "Sem resumo cadastrado."}
                        </p>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-900 border border-slate-800 text-slate-300">
                          {p.categoryLabel || p.category}
                        </span>
                      </td>

                      {/* Badge */}
                      <td className="py-3 px-4">
                        {p.badge ? (
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-400/15 border border-amber-500/30 text-amber-300">
                            {p.badge}
                          </span>
                        ) : (
                          <span className="text-slate-600 text-[10px]">—</span>
                        )}
                      </td>

                      {/* Fabrics */}
                      <td className="py-3 px-4 max-w-[200px]">
                        <div className="flex flex-wrap gap-1">
                          {p.fabrics && p.fabrics.slice(0, 1).map((f, i) => (
                            <span
                              key={i}
                              className="px-1.5 py-0.5 rounded text-[10px] bg-slate-900 text-slate-300 border border-slate-800 truncate max-w-[140px]"
                            >
                              {f.split("(")[0]}
                            </span>
                          ))}
                          {p.techniques && p.techniques[0] && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/20 truncate max-w-[100px]">
                              {p.techniques[0].split(" ")[0]}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Min Order */}
                      <td className="py-3 px-4 text-center font-bold text-white">
                        {p.minOrder || 10} un
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 rounded-lg text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
                            title="Editar Produto"
                          >
                            <Pencil className="w-3.5 h-3.5 text-amber-400" />
                          </button>
                          <button
                            onClick={() => setDeleteProductItem(p)}
                            className="p-1.5 rounded-lg text-slate-300 hover:text-rose-400 bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
                            title="Excluir Produto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* CREATE / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-3xl my-8 rounded-2xl bg-[#0D0F17] border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  {modalMode === "create" ? <Plus className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {modalMode === "create" ? "Adicionar Peça ao Catálogo" : "Editar Peça do Catálogo"}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    As alterações são salvas diretamente no mostruário público.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-900 border border-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto p-6 space-y-6">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-rose-300 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Top Row: Photo Upload + Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Image Upload Area */}
                <div className="md:col-span-5 space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Foto do Produto
                  </label>
                  <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-slate-950 border-2 border-dashed border-slate-800 hover:border-amber-500/50 transition-colors group flex flex-col items-center justify-center">
                    {formData.image ? (
                      <>
                        <Image
                          src={formData.image}
                          alt="Prévia"
                          fill
                          className="object-cover object-top"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 text-center">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-400 text-slate-950 mb-2 shadow-lg"
                          >
                            Trocar Imagem
                          </button>
                          <span className="text-[10px] text-slate-300">
                            JPG, PNG ou WebP até 15MB
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="p-4 text-center space-y-2">
                        <Upload className="w-8 h-8 text-amber-400 mx-auto" />
                        <p className="text-xs font-bold text-white">Carregar Foto</p>
                        <p className="text-[10px] text-slate-500">JPG, PNG ou WebP</p>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="mt-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-amber-300 border border-amber-500/30"
                        >
                          Selecionar Arquivo
                        </button>
                      </div>
                    )}

                    {uploadLoading && (
                      <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
                        <span className="text-xs text-white">Enviando imagem...</span>
                      </div>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={handleFileUpload}
                  />

                  {/* Manual URL input option */}
                  <div className="pt-1">
                    <input
                      type="text"
                      placeholder="Ou cole a URL da imagem..."
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 placeholder-slate-600 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Basic Fields */}
                <div className="md:col-span-7 space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Nome da Peça / Modelo *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Camisa Polo Corporativa Premium Friso Ouro"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                        Categoria *
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => {
                          const cat = e.target.value as Product["category"];
                          const match = CATEGORY_OPTIONS.find((c) => c.id === cat);
                          setFormData({
                            ...formData,
                            category: cat,
                            categoryLabel: match ? match.label : cat,
                          });
                        }}
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400"
                      >
                        {CATEGORY_OPTIONS.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                        Pedido Mínimo (un)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.minOrder}
                        onChange={(e) => setFormData({ ...formData, minOrder: Number(e.target.value) })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Selo de Destaque (Badge)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Mais Pedido, Linha Ouro, Sublimação 4K"
                      value={formData.badge}
                      onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Resumo Curto (chamada do card)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Frase curta para atrair o cliente no catálogo..."
                      value={formData.summary}
                      onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Grade de Tamanhos
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Masculino: P ao EXG4 | Feminino: P ao GG"
                      value={formData.sizes}
                      onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* Full Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Descrição Completa da Peça
                </label>
                <textarea
                  rows={3}
                  placeholder="Detalhes completos sobre costura, gola, durabilidade, caimento e indicações..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Tag Managers Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* Fabrics Tag Manager */}
                <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-amber-400">
                    Opções de Tecidos
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Novo tecido..."
                      value={tagInputs.fabric}
                      onChange={(e) => setTagInputs({ ...tagInputs, fabric: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addTag("fabrics", "fabric");
                        }
                      }}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="button"
                      onClick={() => addTag("fabrics", "fabric")}
                      className="px-3 py-1.5 rounded-lg bg-amber-400 text-slate-950 font-bold text-xs"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {formData.fabrics.map((f, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] bg-slate-900 text-slate-300 border border-slate-800"
                      >
                        <span>{f}</span>
                        <button
                          type="button"
                          onClick={() => removeTag("fabrics", i)}
                          className="text-slate-500 hover:text-rose-400"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Techniques Tag Manager */}
                <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-amber-400">
                    Técnicas de Personalização
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ex: Bordado Computadorizado..."
                      value={tagInputs.technique}
                      onChange={(e) => setTagInputs({ ...tagInputs, technique: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addTag("techniques", "technique");
                        }
                      }}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="button"
                      onClick={() => addTag("techniques", "technique")}
                      className="px-3 py-1.5 rounded-lg bg-amber-400 text-slate-950 font-bold text-xs"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {formData.techniques.map((t, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] bg-slate-900 text-slate-300 border border-slate-800"
                      >
                        <span>{t}</span>
                        <button
                          type="button"
                          onClick={() => removeTag("techniques", i)}
                          className="text-slate-500 hover:text-rose-400"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Colors Tag Manager */}
                <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-amber-400">
                    Cores Disponíveis
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ex: Preto com Ouro..."
                      value={tagInputs.color}
                      onChange={(e) => setTagInputs({ ...tagInputs, color: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addTag("colors", "color");
                        }
                      }}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="button"
                      onClick={() => addTag("colors", "color")}
                      className="px-3 py-1.5 rounded-lg bg-amber-400 text-slate-950 font-bold text-xs"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {formData.colors.map((c, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] bg-slate-900 text-slate-300 border border-slate-800"
                      >
                        <span>{c}</span>
                        <button
                          type="button"
                          onClick={() => removeTag("colors", i)}
                          className="text-slate-500 hover:text-rose-400"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Segments Tag Manager */}
                <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-amber-400">
                    Segmentos Indicados
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ex: Empresas, Clínicas..."
                      value={tagInputs.segment}
                      onChange={(e) => setTagInputs({ ...tagInputs, segment: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addTag("segments", "segment");
                        }
                      }}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="button"
                      onClick={() => addTag("segments", "segment")}
                      className="px-3 py-1.5 rounded-lg bg-amber-400 text-slate-950 font-bold text-xs"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {formData.segments.map((s, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] bg-slate-900 text-slate-300 border border-slate-800"
                      >
                        <span>{s}</span>
                        <button
                          type="button"
                          onClick={() => removeTag("segments", i)}
                          className="text-slate-500 hover:text-rose-400"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={saveLoading}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 transition-colors"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={saveLoading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 hover:from-amber-200 hover:to-amber-400 shadow-md shadow-amber-500/20 transition-all disabled:opacity-50"
                >
                  {saveLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>{modalMode === "create" ? "Adicionar ao Catálogo" : "Salvar Alterações"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {deleteProductItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-[#0D0F17] border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-bold text-white mb-1">Excluir Produto?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tem certeza que deseja excluir{" "}
                <span className="text-amber-300 font-semibold">&ldquo;{deleteProductItem.name}&rdquo;</span> do catálogo?
                Esta ação removerá a peça imediatamente do site.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteProductItem(null)}
                disabled={deleteLoading}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-600/20 transition-all disabled:opacity-50"
              >
                {deleteLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Excluindo...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Sim, Excluir</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
