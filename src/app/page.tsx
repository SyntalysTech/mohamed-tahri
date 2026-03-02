"use client";

import { useState } from "react";
import ChatBot from "@/components/ChatBot";
import { Plan } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  Crown,
  Briefcase,
  Check,
  X as XIcon,
  ArrowRight,
  Phone,
} from "lucide-react";

const features = [
  { label: "Flujo legal completo (Transitoria 5a + 6a)", pro: true, prem: true },
  { label: "Selector de idioma (Darija, Arabe, Argelino, Frances)", pro: true, prem: true },
  { label: "Filtrado automatico de requisitos legales", pro: true, prem: true },
  { label: "Subida de documentacion estructurada", pro: true, prem: true },
  { label: "CRM con estados automaticos", pro: true, prem: true },
  { label: "Derivacion a humano en casos sensibles", pro: true, prem: true },
  { label: "Pago simple (enlace unico)", pro: true, prem: false },
  { label: "3 niveles de monetizacion (19€ / 79€ / 399€)", pro: false, prem: true },
  { label: "Pasarela de pago tipo Stripe", pro: false, prem: true },
  { label: "Upsell automatico post-pago", pro: false, prem: true },
  { label: "Resumen automatico del expediente", pro: false, prem: true },
  { label: "Sistema de recuperacion y recordatorios", pro: false, prem: true },
  { label: "Dashboard con ingresos y conversion", pro: false, prem: true },
];

export default function Home() {
  const [plan, setPlan] = useState<Plan>("professional");
  const [showComparison, setShowComparison] = useState(false);

  return (
    <main className="h-screen flex flex-col bg-mrt-950 overflow-hidden relative">
      {/* Animated premium background effect */}
      {plan === "premium" && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -right-20 w-96 h-96 bg-gold-500/10 rounded-full blur-[100px] animate-pulse-slow"></div>
          <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: "1s" }}></div>
        </div>
      )}

      {/* ── Top bar ── */}
      <div className={`shrink-0 z-10 px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between border-b relative backdrop-blur-md ${plan === "premium" ? "bg-mrt-950/80 border-gold-900/40" : "bg-mrt-950 border-mrt-800"
        }`}>
        <div className="flex items-center gap-3">
          <div className={`relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl border ${plan === "premium" ? "bg-gradient-to-br from-mrt-800 to-mrt-900 border-gold-500/30" : "bg-mrt-800 border-mrt-700"
            }`}>
            <Image
              src="/logo.png"
              alt="Asesoria MRT"
              width={24}
              height={20}
              className={`invert ${plan === "premium" ? "drop-shadow-[0_0_8px_rgba(229,173,66,0.6)]" : "opacity-80"}`}
            />
          </div>
          <div className="hidden sm:block">
            <h1 className={`text-base font-bold leading-tight ${plan === "premium" ? "text-transparent bg-clip-text bg-gradient-to-r from-gold-300 to-gold-500" : "text-white"}`}>Asesoria MRT</h1>
            <p className="text-xs text-mrt-400 leading-tight">Regularizacion Extraordinaria</p>
          </div>
        </div>

        {/* Plan toggle */}
        <div className="flex bg-mrt-900/80 p-1 rounded-xl shadow-inner border border-mrt-800 relative z-10">
          <button
            onClick={() => { setPlan("professional"); setShowComparison(false); }}
            className={`relative flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-all duration-300 ${plan === "professional"
                ? "bg-white text-mrt-950 shadow-md"
                : "text-mrt-400 hover:text-white"
              }`}
          >
            <Briefcase size={14} />
            <span className="hidden sm:inline">Profesional</span>
          </button>
          <button
            onClick={() => setPlan("premium")}
            className={`relative flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-all duration-300 ${plan === "premium"
                ? "bg-gradient-to-r from-gold-400 to-gold-600 text-mrt-950 shadow-[0_0_15px_rgba(229,173,66,0.5)]"
                : "text-mrt-400 hover:text-gold-300"
              }`}
          >
            <Crown size={14} className={plan === "premium" ? "animate-bounce" : ""} style={{ animationDuration: "2s" }} />
            <span className="hidden sm:inline">Premium</span>
          </button>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 z-10">
          <button
            onClick={() => setShowComparison(!showComparison)}
            className={`text-xs px-3 py-2 rounded-lg font-medium transition-colors hidden sm:flex items-center gap-2 ${plan === "premium"
                ? "text-gold-400 bg-gold-900/20 hover:bg-gold-900/40 border border-gold-900/30"
                : "text-mrt-300 bg-mrt-800 hover:bg-mrt-700"
              }`}
          >
            {showComparison ? "Ocultar" : "Comparar Planes"}
          </button>
          <Link
            href="/dashboard"
            className={`flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-lg transition-all ${plan === "premium"
                ? "bg-gradient-to-r from-mrt-800 to-mrt-800 border border-gold-500/20 text-gold-100 hover:border-gold-500/50 hover:shadow-[0_0_15px_rgba(229,173,66,0.3)]"
                : "bg-mrt-800 text-white hover:bg-mrt-700"
              }`}
          >
            <LayoutDashboard size={14} />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
        </div>
      </div>

      {/* ── Feature strip ── */}
      <div
        className={`shrink-0 z-10 px-4 py-3 text-[11px] sm:text-xs border-b transition-all duration-500 backdrop-blur-sm ${plan === "premium"
            ? "bg-gradient-to-r from-gold-900/80 via-mrt-900/90 to-gold-900/80 border-gold-800/50 shadow-[0_4px_20px_-5px_rgba(229,173,66,0.3)]"
            : "bg-mrt-950 border-mrt-800"
          }`}
      >
        <div className="max-w-2xl mx-auto flex flex-wrap items-center justify-center sm:justify-between gap-x-4 gap-y-2">
          <div className="flex items-center gap-2 shrink-0">
            {plan === "premium" ? (
              <span className="flex items-center gap-1 text-gold-400 font-bold uppercase tracking-wider text-[10px] bg-gold-900/50 px-2 py-1 rounded-md border border-gold-700/50">
                <Crown size={12} /> Premium Edition
              </span>
            ) : (
              <span className="flex items-center gap-1 text-mrt-300 font-bold uppercase tracking-wider text-[10px] bg-mrt-800 px-2 py-1 rounded-md">
                <Briefcase size={12} /> Professional
              </span>
            )}
          </div>
          <div className="flex items-center flex-wrap justify-center gap-2 text-[10px] sm:text-[11px]">
            {plan === "professional" ? (
              <>
                <span className="bg-mrt-800 text-mrt-300 px-2.5 py-1 rounded-md border border-mrt-700">Flujo automatizado</span>
                <span className="bg-mrt-800 text-mrt-300 px-2.5 py-1 rounded-md border border-mrt-700">Multi-idioma</span>
                <span className="bg-mrt-800 text-mrt-300 px-2.5 py-1 rounded-md border border-mrt-700">CRM Basico</span>
              </>
            ) : (
              <>
                <span className="bg-gradient-to-r from-gold-500/20 to-gold-600/20 text-gold-300 px-3 py-1 rounded-md border border-gold-500/30 shadow-[0_0_10px_rgba(229,173,66,0.1)]">3 niveles de recargo monetario</span>
                <span className="bg-gradient-to-r from-gold-500/20 to-gold-600/20 text-gold-300 px-3 py-1 rounded-md border border-gold-500/30 shadow-[0_0_10px_rgba(229,173,66,0.1)]">Upsell</span>
                <span className="bg-gradient-to-r from-gold-500/20 to-gold-600/20 text-gold-300 px-3 py-1 rounded-md border border-gold-500/30 shadow-[0_0_10px_rgba(229,173,66,0.1)]">Recovery</span>
                <span className="bg-gradient-to-r from-gold-500/20 to-gold-600/20 text-gold-300 px-3 py-1 rounded-md border border-gold-500/30 shadow-[0_0_10px_rgba(229,173,66,0.1)] hidden md:inline">Analytics</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Comparison overlay ── */}
      <div className={`transition-all duration-500 ease-in-out z-20 ${showComparison ? "max-h-[60vh] opacity-100" : "max-h-0 opacity-0 overflow-hidden"}`}>
        <div className="bg-mrt-900 border-b border-mrt-800 p-4 sm:p-6 shadow-[inset_0_-10px_20px_-10px_rgba(0,0,0,0.5)] overflow-y-auto h-full">
          <div className="max-w-3xl mx-auto bg-mrt-950 rounded-2xl border border-mrt-800 p-1">
            <div className="grid grid-cols-[1fr,100px,100px] gap-0 text-xs text-white">
              <div className="font-semibold text-mrt-400 p-4 bg-mrt-900/50 rounded-tl-xl">FUNCIONALIDADES</div>
              <div className="font-bold text-center p-4 bg-mrt-900/50 flex flex-col items-center justify-center">
                <span className="text-white text-lg">2.200€</span>
                <span className="text-[9px] text-mrt-400 mt-1 uppercase tracking-wider">Profesional</span>
              </div>
              <div className="font-bold text-center p-4 bg-gradient-to-b from-gold-900/40 to-mrt-900/50 rounded-tr-xl border-b-2 border-gold-500/50 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(229,173,66,0.2)_50%,transparent_75%)] bg-[length:250%_250%,100%_100%] animate-shimmer" />
                <span className="text-gold-400 text-lg relative z-10">2.800€</span>
                <span className="text-[9px] text-gold-500/80 mt-1 uppercase tracking-wider font-bold relative z-10">Premium</span>
              </div>

              {features.map((f, i) => (
                <div key={f.label} className="contents group">
                  <div className={`p-4 border-t ${i === features.length - 1 ? "rounded-bl-xl" : ""} ${f.prem && !f.pro ? "text-gold-200 border-gold-900/30 bg-gold-900/5 group-hover:bg-gold-900/20" : "text-mrt-300 border-mrt-800 group-hover:bg-mrt-900/50"} transition-colors`}>
                    {f.label}
                  </div>
                  <div className={`flex justify-center items-center py-4 border-t border-mrt-800 ${f.prem && !f.pro ? "bg-mrt-900/20" : "group-hover:bg-mrt-900/50"} transition-colors`}>
                    {f.pro ? <Check size={18} className="text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]" /> : <XIcon size={16} className="text-mrt-700" />}
                  </div>
                  <div className={`flex justify-center items-center py-4 border-t border-gold-900/30 bg-gold-900/10 ${i === features.length - 1 ? "rounded-br-xl" : ""} group-hover:bg-gold-900/30 transition-colors`}>
                    {f.prem ? <Check size={18} className="text-gold-400 drop-shadow-[0_0_8px_rgba(229,173,66,0.6)]" /> : <XIcon size={16} className="text-mrt-700" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Chatbot container ── */}
      <div className="flex-1 overflow-hidden py-2 px-2 sm:py-6 sm:px-4 z-10 relative flex justify-center items-center bg-transparent">
        <div className={`w-full max-w-lg h-full max-h-[850px] relative transition-all duration-700 ${showComparison ? "scale-95 opacity-50" : "scale-100 opacity-100"}`}>
          {/* Awesome premium glow behind chatbot */}
          {plan === "premium" && (
            <div className="absolute inset-0 bg-gradient-to-br from-gold-500/20 via-transparent to-amber-500/20 blur-xl rounded-2xl pointer-events-none translate-y-2 scale-[1.02]"></div>
          )}
          <ChatBot key={plan} plan={plan} />
        </div>
      </div>

      {/* ── Footer strip ── */}
      <div className="shrink-0 bg-mrt-950 text-mrt-400 px-4 py-2 flex items-center justify-between text-[10px]">
        <div className="flex items-center gap-3">
          <span>asesoriamrt.com</span>
          <span className="text-mrt-700">|</span>
          <span className="flex items-center gap-1">
            <Phone size={9} />
            +34 747 498 536
          </span>
        </div>
        <span>El Vendrell, Tarragona</span>
      </div>
    </main>
  );
}
