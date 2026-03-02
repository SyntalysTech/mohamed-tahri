"use client";

import { useState, useEffect } from "react";
import { ClientSession } from "@/lib/types";
import { getAllSessions, deleteSession, clearAllSessions } from "@/lib/storage";
import Image from "next/image";
import Link from "next/link";
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Clock,
  Trash2,
  ArrowLeft,
  CreditCard,
  FileText,
  Phone,
  User,
  Filter,
  RefreshCw,
  TrendingUp,
  Crown,
  DollarSign,
  BarChart3,
  Zap,
  ExternalLink,
  X,
  ChevronRight,
} from "lucide-react";

type FilterStatus = "all" | ClientSession["status"];

const statusLabels: Record<ClientSession["status"], string> = {
  in_progress: "En curso",
  eligible: "Elegible",
  not_eligible: "No elegible",
  referred: "Derivado",
  completed: "Completado",
};

const statusStyles: Record<
  ClientSession["status"],
  { bg: string; text: string; icon: typeof Clock }
> = {
  in_progress: { bg: "bg-blue-50", text: "text-blue-700", icon: Clock },
  eligible: { bg: "bg-emerald-50", text: "text-emerald-700", icon: CheckCircle2 },
  not_eligible: { bg: "bg-red-50", text: "text-red-700", icon: AlertTriangle },
  referred: { bg: "bg-amber-50", text: "text-amber-700", icon: Scale },
  completed: { bg: "bg-emerald-50", text: "text-emerald-700", icon: CheckCircle2 },
};

const pathwayLabelsES: Record<string, string> = {
  quinta: "Transitoria 5a (Asilo)",
  sexta: "Transitoria 6a (General)",
};

const tierLabelsES: Record<string, string> = {
  pre_eval: "Pre-evaluacion (19€)",
  file_opening: "Apertura expediente (79€)",
  full_processing: "Tramitacion completa (399€)",
};

export default function Dashboard() {
  const [sessions, setSessions] = useState<ClientSession[]>([]);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [selected, setSelected] = useState<string | null>(null);

  const load = () =>
    setSessions(getAllSessions().sort((a, b) => b.updatedAt - a.updatedAt));

  useEffect(() => { load(); }, []);

  const filtered =
    filter === "all" ? sessions : sessions.filter((s) => s.status === filter);

  const counts = {
    all: sessions.length,
    in_progress: sessions.filter((s) => s.status === "in_progress").length,
    eligible: sessions.filter((s) => s.status === "eligible").length,
    not_eligible: sessions.filter((s) => s.status === "not_eligible").length,
    referred: sessions.filter((s) => s.status === "referred").length,
    completed: sessions.filter((s) => s.status === "completed").length,
  };

  // Premium analytics
  const premiumSessions = sessions.filter((s) => s.plan === "premium");
  const totalRevenue = sessions.reduce((acc, s) => acc + (s.amountPaid || 0), 0);
  const paidSessions = sessions.filter((s) => s.paymentStatus === "paid");
  const conversionRate =
    sessions.length > 0 ? Math.round((paidSessions.length / sessions.length) * 100) : 0;
  const tierBreakdown = {
    pre_eval: premiumSessions.filter((s) => s.serviceTier === "pre_eval").length,
    file_opening: premiumSessions.filter((s) => s.serviceTier === "file_opening").length,
    full_processing: premiumSessions.filter((s) => s.serviceTier === "full_processing").length,
  };
  const upsellAccepted = premiumSessions.filter((s) => s.answers.upsell === "accepted").length;
  const upsellOffered = premiumSessions.filter((s) => s.answers.upsell).length;
  const upsellRate = upsellOffered > 0 ? Math.round((upsellAccepted / upsellOffered) * 100) : 0;

  const handleDelete = (id: string) => {
    deleteSession(id);
    load();
    if (selected === id) setSelected(null);
  };

  const handleClearAll = () => {
    if (confirm("Eliminar TODOS los expedientes?")) {
      clearAllSessions();
      load();
      setSelected(null);
    }
  };

  const selectedSession = sessions.find((s) => s.id === selected);

  return (
    <div className="min-h-screen bg-mrt-950 text-mrt-100 overflow-hidden relative">
      {/* Background elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-b from-mrt-800/50 to-transparent rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-t from-gold-900/10 to-transparent rounded-full blur-[150px]"></div>
      </div>

      <div className="relative z-10 h-screen flex flex-col">
        {/* ── Header ── */}
        <header className="bg-mrt-950/80 backdrop-blur-md text-white px-4 sm:px-6 py-4 flex items-center justify-between gap-4 border-b border-mrt-800 shrink-0">
          <div className="flex items-center gap-4 min-w-0">
            <Link href="/" className="p-2 sm:p-2.5 bg-mrt-800 hover:bg-mrt-700 hover:shadow-[0_0_10px_rgba(255,255,255,0.1)] rounded-xl transition-all shrink-0 border border-mrt-700">
              <ArrowLeft size={18} />
            </Link>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-mrt-800 to-mrt-900 border border-mrt-700 flex items-center justify-center shrink-0 hidden sm:flex shadow-inner">
              <Image
                src="/logo.png"
                alt="MRT"
                width={24}
                height={20}
                className="invert opacity-90"
              />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-bold truncate bg-clip-text text-transparent bg-gradient-to-r from-white to-mrt-300 tracking-tight">Panel de Control</h1>
              <p className="text-[10px] sm:text-xs text-mrt-400 truncate uppercase tracking-widest font-semibold">
                Asesoria MRT
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <a
              href="https://www.asesoriamrt.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 sm:p-2.5 bg-mrt-900 hover:bg-mrt-800 border border-mrt-800 rounded-xl transition-all text-mrt-400 hover:text-white"
            >
              <ExternalLink size={16} />
            </a>
            <button onClick={load} className="p-2 sm:p-2.5 bg-mrt-900 hover:bg-mrt-800 border border-mrt-800 rounded-xl transition-all text-mrt-400 hover:text-white group">
              <RefreshCw size={16} className="group-hover:rotate-180 transition-transform duration-500" />
            </button>
            <button
              onClick={handleClearAll}
              className="p-2 sm:p-2.5 bg-red-950/30 hover:bg-red-900/50 border border-red-900/30 text-red-400 hover:text-red-300 hover:shadow-[0_0_10px_rgba(239,68,68,0.2)] rounded-xl transition-all"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </header>

        {/* ── Premium Revenue Strip ── */}
        <div className="flex-1 overflow-y-auto w-full">
          {premiumSessions.length > 0 && (
            <div className="px-4 sm:px-6 py-4 bg-gradient-to-r from-gold-900/20 via-mrt-900/50 to-mrt-900/30 border-b border-gold-900/30 backdrop-blur-md relative overflow-hidden">
              <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-gold-500/5 to-transparent pointer-events-none"></div>
              <div className="grid grid-cols-3 sm:flex sm:items-center gap-4 sm:gap-8 relative z-10 max-w-7xl mx-auto">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(229,173,66,0.15)]">
                    <DollarSign size={20} className="text-gold-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-[11px] text-gold-400/70 font-bold uppercase tracking-wider">Ingresos</p>
                    <p className="text-lg sm:text-2xl font-black text-white tracking-tight">{totalRevenue}€</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                    <TrendingUp size={20} className="text-emerald-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-[11px] text-emerald-400/70 font-bold uppercase tracking-wider">Conversion</p>
                    <p className="text-lg sm:text-2xl font-black text-white tracking-tight">{conversionRate}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
                    <Zap size={20} className="text-purple-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-[11px] text-purple-400/70 font-bold uppercase tracking-wider">Upsell</p>
                    <p className="text-lg sm:text-2xl font-black text-white tracking-tight">{upsellRate}%</p>
                  </div>
                </div>
                <div className="col-span-3 sm:col-span-1 flex items-center gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 sm:border-l border-mrt-800 sm:pl-8">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                    <BarChart3 size={20} className="text-blue-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-[11px] text-blue-400/70 font-bold uppercase tracking-wider mb-1">Por nivel</p>
                    <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-mrt-300 font-medium">
                      <span className="bg-mrt-800 border border-mrt-700 px-2 py-0.5 rounded-md">19€: <span className="text-white">{tierBreakdown.pre_eval}</span></span>
                      <span className="bg-mrt-800 border border-mrt-700 px-2 py-0.5 rounded-md">79€: <span className="text-white">{tierBreakdown.file_opening}</span></span>
                      <span className="bg-emerald-950 border border-emerald-800 text-emerald-400 px-2 py-0.5 rounded-md">399€: <span className="text-white">{tierBreakdown.full_processing}</span></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Stats Grid ── */}
          <div className="px-4 sm:px-6 py-4 sm:py-6 grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4 max-w-7xl mx-auto">
            {([
              { key: "all", label: "TOTAL", icon: Users, color: "text-mrt-400", border: "border-mrt-800", bg: "bg-mrt-900" },
              { key: "in_progress", label: "EN CURSO", icon: Clock, color: "text-blue-400", border: "border-blue-900/50", bg: "bg-blue-950/20" },
              { key: "eligible", label: "ELEGIBLES", icon: CheckCircle2, color: "text-emerald-400", border: "border-emerald-900/50", bg: "bg-emerald-950/20" },
              { key: "not_eligible", label: "NO ELEGIBLE", icon: AlertTriangle, color: "text-red-400", border: "border-red-900/50", bg: "bg-red-950/20" },
              { key: "referred", label: "DERIVADOS", icon: Scale, color: "text-amber-400", border: "border-amber-900/50", bg: "bg-amber-950/20" },
              { key: "completed", label: "COMPLETADOS", icon: CheckCircle2, color: "text-emerald-400", border: "border-emerald-900/50", bg: "bg-emerald-950/20" },
            ] as const).map(({ key, label, icon: Icon, color, border, bg }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`rounded-2xl border-2 p-3 sm:p-4 text-left transition-all duration-300 relative overflow-hidden group ${filter === key ? `border-mrt-500 shadow-[0_0_20px_rgba(255,255,255,0.05)] ${bg}` : `${border} bg-mrt-900/40 hover:bg-mrt-800/80`
                  }`}
              >
                {filter === key && <div className="absolute inset-x-0 bottom-0 h-0.5 bg-mrt-500"></div>}
                <div className="flex items-center gap-1.5 sm:gap-2 mb-2">
                  <Icon size={14} className={`sm:w-4 sm:h-4 ${color}`} />
                  <span className={`text-[9px] sm:text-[10px] font-bold tracking-wider truncate ${color}`}>{label}</span>
                </div>
                <span className="text-xl sm:text-3xl font-black text-white">{counts[key]}</span>
              </button>
            ))}
          </div>

          {/* ── Content: List + Detail ── */}
          <div className="px-4 sm:px-6 pb-6 sm:pb-8 flex gap-4 max-w-7xl mx-auto h-[calc(100vh-280px)]">
            {/* Session list */}
            <div className={`w-full overflow-y-auto pr-2 custom-scrollbar ${selected ? "hidden md:block md:w-1/2" : ""} transition-all`}>
              <div className="flex items-center gap-2 mb-3 sm:mb-4 px-1">
                <Filter size={14} className="text-mrt-500" />
                <span className="text-xs sm:text-sm font-semibold text-mrt-400 tracking-wide">
                  {filtered.length} EXPEDIENTE{filtered.length !== 1 ? "S" : ""}
                </span>
              </div>

              {filtered.length === 0 ? (
                <div className="bg-mrt-900/40 rounded-2xl border border-mrt-800/60 p-10 sm:p-16 text-center shadow-inner">
                  <div className="w-16 h-16 mx-auto bg-mrt-800/80 rounded-full flex items-center justify-center mb-4 border border-mrt-700/50">
                    <Users size={24} className="text-mrt-400" />
                  </div>
                  <p className="text-white font-semibold text-lg">No hay expedientes</p>
                  <p className="text-mrt-500 text-xs mt-2 max-w-xs mx-auto">
                    Los expedientes aparecerán aquí en tiempo real cuando los clientes interactúen con el chatbot.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filtered.map((s) => {
                    const st = statusStyles[s.status];
                    // Replace light bg strings provided by previous config with premium dark mode ones
                    let statusBg, statusText;
                    if (s.status === "eligible" || s.status === "completed") { statusBg = "bg-emerald-950/40 border border-emerald-900/50"; statusText = "text-emerald-400"; }
                    else if (s.status === "not_eligible") { statusBg = "bg-red-950/40 border border-red-900/50"; statusText = "text-red-400"; }
                    else if (s.status === "referred") { statusBg = "bg-amber-950/40 border border-amber-900/50"; statusText = "text-amber-400"; }
                    else { statusBg = "bg-blue-950/40 border border-blue-900/50"; statusText = "text-blue-400"; }

                    return (
                      <div
                        key={s.id}
                        onClick={() => setSelected(s.id)}
                        className={`bg-mrt-900/60 backdrop-blur-sm rounded-2xl border-2 p-4 cursor-pointer transition-all duration-300 ${selected === s.id ? "border-mrt-500 shadow-[0_0_20px_rgba(255,255,255,0.05)] bg-mrt-800/80" : "border-mrt-800/50 hover:border-mrt-600 hover:bg-mrt-800/40"
                          }`}
                      >
                        {/* Row 1: Name + status */}
                        <div className="flex items-center justify-between gap-3 mb-2.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`font-bold text-base truncate ${selected === s.id ? "text-white" : "text-mrt-100"}`}>
                              {s.name || "Cliente Sin Nombre"}
                            </span>
                            {s.plan === "premium" && <div className="bg-gold-500/10 p-1 rounded-md border border-gold-500/20"><Crown size={12} className="text-gold-400 shrink-0" /></div>}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-lg font-bold ${statusBg} ${statusText}`}>
                              <st.icon size={12} />
                              <span className="hidden sm:inline">{statusLabels[s.status]}</span>
                            </span>
                            <ChevronRight size={16} className={`sm:hidden ${selected === s.id ? "text-white" : "text-mrt-500"}`} />
                          </div>
                        </div>
                        {/* Row 2: Meta info */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-3 text-xs text-mrt-400 min-w-0 overflow-hidden font-medium">
                            <span className="flex items-center gap-1"><Clock size={12} className="text-mrt-500" /> {new Date(s.createdAt).toLocaleDateString()}</span>
                            {s.phone && (
                              <span className="hidden sm:flex items-center gap-1"><Phone size={12} className="text-mrt-500" />{s.phone}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {(s.amountPaid || 0) > 0 && (
                              <span className="text-[11px] font-black text-emerald-400 bg-emerald-950/40 border border-emerald-900/50 px-2 py-0.5 rounded-md">
                                +{s.amountPaid}€
                              </span>
                            )}
                            <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded-md border ${s.paymentStatus === "paid" ? "bg-emerald-950/40 text-emerald-400 border-emerald-900/50" : "bg-mrt-800/50 text-mrt-400 border-mrt-700/50"
                              }`}>
                              {s.paymentStatus === "paid" ? "Pagado" : "Pendiente"}
                            </span>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDelete(s.id); }}
                              className="p-1.5 bg-mrt-800/80 hover:bg-red-950/50 text-mrt-400 hover:text-red-400 border border-mrt-700 hover:border-red-900/50 rounded-lg transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── Detail panel ── */}
            {selectedSession && (
              <div className={`
                fixed inset-0 z-50 bg-mrt-950/95 backdrop-blur-xl overflow-y-auto
                md:static md:inset-auto md:z-auto md:w-1/2 md:rounded-2xl md:border md:border-mrt-800/60 md:bg-mrt-900/40 md:shadow-inner md:flex md:flex-col
              `}>
                {/* Detail header */}
                <div className="sticky top-0 bg-mrt-900/80 backdrop-blur-md z-10 flex items-center justify-between px-5 py-4 sm:px-6 sm:py-5 border-b border-mrt-800">
                  <h2 className="font-bold text-lg sm:text-xl text-white flex items-center gap-3">
                    <button onClick={() => setSelected(null)} className="md:hidden p-2 bg-mrt-800 hover:bg-mrt-700 rounded-xl text-white mr-1 border border-mrt-700">
                      <ArrowLeft size={18} />
                    </button>
                    Detalle del Expediente
                    {selectedSession.plan === "premium" && <div className="bg-gold-500/10 p-1.5 rounded-lg border border-gold-500/20"><Crown size={16} className="text-gold-400" /></div>}
                  </h2>
                  <button onClick={() => setSelected(null)} className="hidden md:flex p-2 bg-mrt-800 hover:bg-mrt-700 border border-mrt-700 rounded-xl text-mrt-300 hover:text-white transition-colors items-center justify-center">
                    <X size={18} />
                  </button>
                </div>

                <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar md:flex-1">
                  {/* Info grid */}
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
                    {[
                      { icon: User, label: "Nombre Completo", value: selectedSession?.name || "—" },
                      { icon: Phone, label: "Teléfono", value: selectedSession?.phone || "—" },
                      { icon: Scale, label: "Vía Legal", value: selectedSession?.pathway ? pathwayLabelsES[selectedSession.pathway] : "—" },
                      { icon: CreditCard, label: "Estado del Pago", value: selectedSession?.paymentStatus === "paid" ? `Completado ${selectedSession.amountPaid ? `(${selectedSession.amountPaid}€)` : ""}` : "Pendiente" },
                    ].map((item, idx) => (
                      <div key={item.label} className="bg-mrt-800/50 rounded-xl p-4 border border-mrt-700/50 shadow-inner">
                        <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-mrt-400 mb-1.5">
                          <item.icon size={14} className={idx === 3 && selectedSession?.paymentStatus === "paid" ? "text-emerald-400" : "text-mrt-500"} />{item.label}
                        </div>
                        <p className={`text-sm sm:text-base font-semibold truncate ${idx === 3 && selectedSession?.paymentStatus === "paid" ? "text-emerald-400" : "text-white"}`}>{item.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Premium info */}
                  {selectedSession?.plan === "premium" && (
                    <div className="mb-6 p-5 bg-gradient-to-br from-gold-900/20 to-mrt-800/20 rounded-xl border border-gold-900/50 shadow-inner relative overflow-hidden">
                      <div className="absolute -right-10 -top-10 w-32 h-32 bg-gold-500/10 rounded-full blur-2xl"></div>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-gold-400 mb-4 flex items-center gap-2">
                        <Crown size={14} /> Información Premium
                      </h3>
                      <div className="grid grid-cols-2 gap-4 relative z-10">
                        <div className="bg-mrt-900/50 p-3 rounded-lg border border-mrt-800/50">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-mrt-400 block mb-1">Cierre Automático Nivel:</span>
                          <p className="font-bold text-sm text-gold-300">
                            {selectedSession.serviceTier ? tierLabelsES[selectedSession.serviceTier] : "—"}
                          </p>
                        </div>
                        <div className="bg-mrt-900/50 p-3 rounded-lg border border-mrt-800/50">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-mrt-400 block mb-1">Estado Upsell (Recuperación):</span>
                          <p className={`font-bold text-sm ${selectedSession.answers?.upsell === "accepted" ? "text-emerald-400" : selectedSession.answers?.upsell === "declined" ? "text-red-400" : "text-mrt-300"}`}>
                            {selectedSession.answers?.upsell === "accepted" ? "Cerrado" : selectedSession.answers?.upsell === "declined" ? "Declinado" : "—"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Answers */}
                  {Object.keys(selectedSession?.answers || {}).length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-mrt-400 mb-3 ml-1">Respuestas Estructuradas</h3>
                      <div className="bg-mrt-800/30 border border-mrt-700/50 rounded-xl overflow-hidden shadow-inner">
                        {Object.entries(selectedSession!.answers).map(([key, val], idx) => (
                          <div key={key} className={`flex items-center justify-between text-xs px-4 py-3 ${idx !== 0 ? "border-t border-mrt-700/30" : ""} hover:bg-mrt-800/50 transition-colors`}>
                            <span className="text-mrt-400 font-mono text-[11px] truncate mr-4">{key}</span>
                            <span className="text-white font-medium text-right bg-mrt-900/50 px-2 py-1 rounded-md border border-mrt-700/50">{val}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Documents */}
                  {(selectedSession?.documents?.length ?? 0) > 0 && (
                    <div className="mb-6">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-mrt-400 mb-3 ml-1">Documentos Automatizados</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {selectedSession!.documents.map((doc, i) => (
                          <div key={i} className="flex items-center gap-3 text-xs bg-emerald-950/20 border border-emerald-900/30 text-emerald-300 rounded-xl px-4 py-3 hover:bg-emerald-950/40 transition-colors group cursor-pointer">
                            <div className="bg-emerald-900/50 p-1.5 rounded-lg group-hover:bg-emerald-800/50 transition-colors">
                              <FileText size={14} className="shrink-0 text-emerald-400" />
                            </div>
                            <span className="truncate font-medium">{doc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Chat logs */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-mrt-400 mb-3 ml-1 flex items-center gap-2">
                      <RefreshCw size={12} /> Log de Conversación
                    </h3>
                    <div className="space-y-3 bg-mrt-950 p-4 rounded-xl border border-mrt-800 shadow-inner">
                      {selectedSession?.messages?.map((msg) => (
                        <div key={msg.id} className={`flex flex-col ${msg.sender === "bot" ? "items-start" : "items-end"}`}>
                          <div className={`text-xs rounded-2xl px-4 py-2.5 max-w-[85%] ${msg.sender === "bot" ? "bg-mrt-800 text-mrt-200 rounded-tl-sm border border-mrt-700" : "bg-gradient-to-br from-mrt-700 to-mrt-800 border border-mrt-600 text-white rounded-tr-sm shadow-md"
                            }`}>
                            <div className="whitespace-pre-wrap break-words leading-relaxed">{msg.text}</div>
                          </div>
                          <span className="text-[9px] font-mono text-mrt-600 mt-1.5 px-1">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="px-4 sm:px-6 py-4 bg-mrt-950 text-mrt-600 text-[10px] sm:text-xs flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-mrt-800 font-medium tracking-wide shrink-0">
          <span>ASESORIA MRT CRM V2.0 PROTOTYPE</span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            SYSTEM ONLINE
          </span>
        </div>
      </div>
    </div>
  );
}
