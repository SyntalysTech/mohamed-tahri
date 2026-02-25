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
    <div className="min-h-screen bg-mrt-50">
      {/* ── Header ── */}
      <header className="bg-mrt-950 text-white px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <Link href="/" className="p-1.5 sm:p-2 hover:bg-white/10 rounded-lg transition-colors shrink-0">
            <ArrowLeft size={18} />
          </Link>
          <Image
            src="/logo.png"
            alt="MRT"
            width={44}
            height={35}
            className="invert drop-shadow-[0_0_1px_rgba(255,255,255,0.8)] hidden sm:block"
          />
          <div className="min-w-0">
            <h1 className="text-sm sm:text-lg font-semibold truncate">Panel de Control</h1>
            <p className="text-[10px] sm:text-xs text-mrt-400 truncate">
              Asesoria MRT
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-3 shrink-0">
          <a
            href="https://www.asesoriamrt.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 sm:p-2 hover:bg-white/10 rounded-lg transition-colors text-mrt-400 hover:text-white"
            title="asesoriamrt.com"
          >
            <ExternalLink size={14} />
          </a>
          <button onClick={load} className="p-1.5 sm:p-2 hover:bg-white/10 rounded-lg transition-colors" title="Actualizar">
            <RefreshCw size={14} className="sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={handleClearAll}
            className="p-1.5 sm:p-2 hover:bg-red-500/20 text-red-300 rounded-lg transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </header>

      {/* ── Premium Revenue Strip ── */}
      {premiumSessions.length > 0 && (
        <div className="px-3 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-mrt-950/5 to-gold-100/50 border-b border-gold-200">
          <div className="grid grid-cols-3 sm:flex sm:items-center gap-3 sm:gap-6">
            {/* Ingresos */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-gold-100 flex items-center justify-center shrink-0">
                <DollarSign size={14} className="text-gold-600" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] sm:text-[10px] text-mrt-500 font-medium">Ingresos</p>
                <p className="text-base sm:text-xl font-bold text-mrt-900">{totalRevenue}€</p>
              </div>
            </div>
            {/* Conversion */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                <TrendingUp size={14} className="text-emerald-600" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] sm:text-[10px] text-mrt-500 font-medium">Conversion</p>
                <p className="text-base sm:text-xl font-bold text-mrt-900">{conversionRate}%</p>
              </div>
            </div>
            {/* Upsell */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                <Zap size={14} className="text-purple-600" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] sm:text-[10px] text-mrt-500 font-medium">Upsell</p>
                <p className="text-base sm:text-xl font-bold text-mrt-900">{upsellRate}%</p>
              </div>
            </div>
            {/* Tier breakdown - hidden on very small, shown on sm+ */}
            <div className="col-span-3 sm:col-span-1 flex items-center gap-2 pt-1 sm:pt-0 border-t sm:border-t-0 sm:border-l border-mrt-200 sm:pl-6">
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                <BarChart3 size={14} className="text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] sm:text-[10px] text-mrt-500 font-medium">Por nivel</p>
                <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] text-mrt-700">
                  <span className="bg-mrt-100 px-1.5 py-0.5 rounded">19€: {tierBreakdown.pre_eval}</span>
                  <span className="bg-mrt-100 px-1.5 py-0.5 rounded">79€: {tierBreakdown.file_opening}</span>
                  <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-medium">399€: {tierBreakdown.full_processing}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Stats Grid ── */}
      <div className="px-3 sm:px-6 py-3 sm:py-4 grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3">
        {([
          { key: "all", label: "Total", icon: Users, color: "text-mrt-600" },
          { key: "in_progress", label: "En curso", icon: Clock, color: "text-blue-600" },
          { key: "eligible", label: "Elegibles", icon: CheckCircle2, color: "text-emerald-600" },
          { key: "not_eligible", label: "No elegible", icon: AlertTriangle, color: "text-red-600" },
          { key: "referred", label: "Derivados", icon: Scale, color: "text-amber-600" },
          { key: "completed", label: "Completados", icon: CheckCircle2, color: "text-emerald-600" },
        ] as const).map(({ key, label, icon: Icon, color }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`bg-white rounded-xl border-2 p-2 sm:p-3 text-left transition-all hover:shadow-md ${
              filter === key ? "border-mrt-900 shadow-md" : "border-transparent"
            }`}
          >
            <div className="flex items-center gap-1 sm:gap-2 mb-0.5 sm:mb-1">
              <Icon size={12} className={`sm:w-3.5 sm:h-3.5 ${color}`} />
              <span className="text-[10px] sm:text-xs text-mrt-500 truncate">{label}</span>
            </div>
            <span className="text-lg sm:text-2xl font-bold text-mrt-900">{counts[key]}</span>
          </button>
        ))}
      </div>

      {/* ── Content: List + Detail ── */}
      <div className="px-3 sm:px-6 pb-4 sm:pb-6 flex gap-4">
        {/* Session list */}
        <div className={`w-full ${selected ? "hidden md:block md:w-1/2" : ""} transition-all`}>
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <Filter size={14} className="text-mrt-400" />
            <span className="text-xs sm:text-sm text-mrt-500">
              {filtered.length} expediente{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          {filtered.length === 0 ? (
            <div className="bg-white rounded-xl border border-mrt-100 p-8 sm:p-12 text-center">
              <Users size={32} className="mx-auto text-mrt-200 mb-3 sm:w-10 sm:h-10" />
              <p className="text-mrt-500 text-sm">No hay expedientes</p>
              <p className="text-mrt-400 text-[11px] sm:text-xs mt-1">
                Apareceran cuando los clientes usen el chatbot
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((s) => {
                const st = statusStyles[s.status];
                return (
                  <div
                    key={s.id}
                    onClick={() => setSelected(s.id)}
                    className={`bg-white rounded-xl border-2 p-3 sm:p-4 cursor-pointer transition-all hover:shadow-md ${
                      selected === s.id ? "border-mrt-900 shadow-md" : "border-transparent hover:border-mrt-200"
                    }`}
                  >
                    {/* Row 1: Name + status */}
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-semibold text-sm text-mrt-900 truncate">
                          {s.name || "Sin nombre"}
                        </span>
                        {s.plan === "premium" && <Crown size={12} className="text-gold-500 shrink-0" />}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${st.bg} ${st.text}`}>
                          <st.icon size={10} />
                          <span className="hidden sm:inline">{statusLabels[s.status]}</span>
                        </span>
                        <ChevronRight size={14} className="text-mrt-300 sm:hidden" />
                      </div>
                    </div>
                    {/* Row 2: Meta info */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-[11px] text-mrt-400 min-w-0 overflow-hidden">
                        <span>{new Date(s.createdAt).toLocaleDateString()}</span>
                        {s.phone && (
                          <span className="hidden sm:flex items-center gap-1"><Phone size={10} />{s.phone}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {(s.amountPaid || 0) > 0 && (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                            {s.amountPaid}€
                          </span>
                        )}
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          s.paymentStatus === "paid" ? "bg-emerald-50 text-emerald-700" : "bg-mrt-100 text-mrt-500"
                        }`}>
                          {s.paymentStatus === "paid" ? "Pagado" : "Pend."}
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(s.id); }}
                          className="p-1 hover:bg-red-50 text-mrt-300 hover:text-red-500 rounded-lg transition-colors"
                        >
                          <Trash2 size={13} />
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
            fixed inset-0 z-50 bg-white overflow-y-auto
            md:static md:inset-auto md:z-auto md:w-1/2 md:rounded-xl md:border md:border-mrt-100 md:max-h-[calc(100vh-220px)] md:overflow-y-auto md:sticky md:top-4
          `}>
            {/* Detail header */}
            <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-4 py-3 sm:px-5 sm:py-4 border-b border-mrt-100 md:border-b-0">
              <h2 className="font-semibold text-base sm:text-lg text-mrt-900 flex items-center gap-2">
                <button onClick={() => setSelected(null)} className="md:hidden p-1 hover:bg-mrt-100 rounded-lg text-mrt-400 mr-1">
                  <ArrowLeft size={18} />
                </button>
                Detalle
                {selectedSession.plan === "premium" && <Crown size={16} className="text-gold-500" />}
              </h2>
              <button onClick={() => setSelected(null)} className="hidden md:block p-1.5 hover:bg-mrt-100 rounded-lg text-mrt-400">
                <X size={16} />
              </button>
            </div>

            <div className="px-4 pb-6 sm:px-5">
              {/* Info grid */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-5">
                {[
                  { icon: User, label: "Nombre", value: selectedSession.name || "—" },
                  { icon: Phone, label: "Telefono", value: selectedSession.phone || "—" },
                  { icon: Scale, label: "Via legal", value: selectedSession.pathway ? pathwayLabelsES[selectedSession.pathway] : "—" },
                  { icon: CreditCard, label: "Pago", value: selectedSession.paymentStatus === "paid" ? `Pagado ${selectedSession.amountPaid ? `(${selectedSession.amountPaid}€)` : ""}` : "Pendiente" },
                ].map((item) => (
                  <div key={item.label} className="bg-mrt-50 rounded-lg p-2.5 sm:p-3">
                    <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-mrt-500 mb-0.5 sm:mb-1">
                      <item.icon size={11} />{item.label}
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-mrt-900 truncate">{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Premium info */}
              {selectedSession.plan === "premium" && (
                <div className="mb-4 sm:mb-5 p-2.5 sm:p-3 bg-gradient-to-r from-gold-50 to-mrt-50 rounded-lg border border-gold-200">
                  <h3 className="text-[11px] sm:text-xs font-semibold text-gold-600 mb-1.5 sm:mb-2 flex items-center gap-1">
                    <Crown size={11} />Info Premium
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-[11px] sm:text-xs">
                    <div>
                      <span className="text-mrt-500">Nivel:</span>
                      <p className="font-medium text-mrt-900">
                        {selectedSession.serviceTier ? tierLabelsES[selectedSession.serviceTier] : "—"}
                      </p>
                    </div>
                    <div>
                      <span className="text-mrt-500">Upsell:</span>
                      <p className="font-medium text-mrt-900">
                        {selectedSession.answers.upsell === "accepted" ? "Aceptado" : selectedSession.answers.upsell === "declined" ? "Rechazado" : "—"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Answers */}
              {Object.keys(selectedSession.answers).length > 0 && (
                <div className="mb-4 sm:mb-5">
                  <h3 className="text-xs sm:text-sm font-semibold text-mrt-700 mb-2">Respuestas</h3>
                  <div className="space-y-1.5">
                    {Object.entries(selectedSession.answers).map(([key, val]) => (
                      <div key={key} className="flex items-center justify-between text-[11px] sm:text-xs bg-mrt-50 rounded-lg px-2.5 sm:px-3 py-2">
                        <span className="text-mrt-500 font-mono truncate mr-2">{key}</span>
                        <span className="text-mrt-800 font-medium text-right shrink-0">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Documents */}
              {selectedSession.documents.length > 0 && (
                <div className="mb-4 sm:mb-5">
                  <h3 className="text-xs sm:text-sm font-semibold text-mrt-700 mb-2">Documentos</h3>
                  <div className="space-y-1.5">
                    {selectedSession.documents.map((doc, i) => (
                      <div key={i} className="flex items-center gap-2 text-[11px] sm:text-xs bg-emerald-50 text-emerald-700 rounded-lg px-2.5 sm:px-3 py-2">
                        <FileText size={12} className="shrink-0" /><span className="truncate">{doc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat */}
              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-mrt-700 mb-2">Chat</h3>
                <div className="space-y-2 max-h-60 sm:max-h-80 overflow-y-auto">
                  {selectedSession.messages.map((msg) => (
                    <div key={msg.id} className={`text-[11px] sm:text-xs rounded-lg px-2.5 sm:px-3 py-2 ${
                      msg.sender === "bot" ? "bg-mrt-50 text-mrt-700" : "bg-mrt-950 text-white ml-4 sm:ml-6"
                    }`}>
                      <div className="whitespace-pre-wrap break-words">{msg.text}</div>
                      <div className="text-[9px] mt-1 text-mrt-400">
                        {new Date(msg.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="px-3 sm:px-6 py-2.5 sm:py-3 bg-mrt-950 text-mrt-500 text-[10px] flex flex-col sm:flex-row items-center justify-between gap-1">
        <span>Asesoria MRT — asesoriamrt.com</span>
        <span>+34 747 498 536 — El Vendrell, Tarragona</span>
      </div>
    </div>
  );
}
