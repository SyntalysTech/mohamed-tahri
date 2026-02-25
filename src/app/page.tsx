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
    <main className="h-screen flex flex-col bg-mrt-50">
      {/* ── Top bar ── */}
      <div className="shrink-0 bg-mrt-950 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Asesoria MRT"
            width={50}
            height={40}
            className="invert drop-shadow-[0_0_1px_rgba(255,255,255,0.8)]"
          />
          <div className="hidden sm:block">
            <h1 className="text-sm font-semibold leading-tight">Asesoria MRT</h1>
            <p className="text-[10px] text-mrt-400 leading-tight">Regularizacion Extraordinaria</p>
          </div>
        </div>

        {/* Plan toggle */}
        <div className="flex items-center bg-mrt-900 rounded-xl p-1 gap-1">
          <button
            onClick={() => setPlan("professional")}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-[11px] sm:text-xs font-semibold transition-all ${
              plan === "professional"
                ? "bg-white text-mrt-950 shadow-lg"
                : "text-mrt-400 hover:text-white hover:bg-mrt-800"
            }`}
          >
            <Briefcase size={12} />
            <span className="hidden sm:inline">Profesional</span> 2.200€
          </button>
          <button
            onClick={() => setPlan("premium")}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-[11px] sm:text-xs font-semibold transition-all ${
              plan === "premium"
                ? "bg-gradient-to-r from-gold-400 to-gold-500 text-mrt-950 shadow-lg"
                : "text-mrt-400 hover:text-gold-300 hover:bg-mrt-800"
            }`}
          >
            <Crown size={12} />
            <span className="hidden sm:inline">Premium</span> 2.800€
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowComparison(!showComparison)}
            className="text-[10px] text-mrt-400 hover:text-white px-2 py-1.5 rounded-lg hover:bg-mrt-800 transition-colors hidden sm:block"
          >
            {showComparison ? "Ocultar" : "Comparar"}
          </button>
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-[11px] text-mrt-400 hover:text-white px-2 py-1.5 rounded-lg hover:bg-mrt-800 transition-colors"
          >
            <LayoutDashboard size={13} />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
        </div>
      </div>

      {/* ── Feature strip ── */}
      <div
        className={`shrink-0 px-4 py-2 text-[11px] border-b transition-all ${
          plan === "premium"
            ? "bg-gradient-to-r from-gold-50 to-gold-100/50 border-gold-200 text-mrt-700"
            : "bg-white border-mrt-100 text-mrt-500"
        }`}
      >
        <div className="max-w-lg mx-auto flex flex-wrap items-center justify-center sm:justify-between gap-x-3 gap-y-1">
          <div className="flex items-center gap-1.5 shrink-0">
            {plan === "premium" && <Crown size={11} className="text-gold-500" />}
            <span className="font-semibold">
              {plan === "professional" ? "Profesional" : "Premium"}
            </span>
          </div>
          <div className="flex items-center flex-wrap justify-center gap-1.5 text-[10px]">
            {plan === "professional" ? (
              <>
                <span className="bg-mrt-100 px-2 py-0.5 rounded-full">Flujo legal</span>
                <span className="bg-mrt-100 px-2 py-0.5 rounded-full">Docs</span>
                <span className="bg-mrt-100 px-2 py-0.5 rounded-full">CRM</span>
              </>
            ) : (
              <>
                <span className="bg-gold-100 text-gold-700 px-2 py-0.5 rounded-full font-medium">3 precios</span>
                <span className="bg-gold-100 text-gold-700 px-2 py-0.5 rounded-full font-medium">Upsell</span>
                <span className="bg-gold-100 text-gold-700 px-2 py-0.5 rounded-full font-medium">Resumen</span>
                <span className="bg-gold-100 text-gold-700 px-2 py-0.5 rounded-full font-medium hidden sm:inline">Recovery</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Comparison overlay ── */}
      {showComparison && (
        <div className="shrink-0 bg-white border-b border-mrt-200 px-4 py-4 max-h-[50vh] overflow-y-auto">
          <div className="max-w-2xl mx-auto">
            <div className="grid grid-cols-[1fr,80px,80px] gap-2 text-xs">
              <div className="font-semibold text-mrt-500 pb-2">Funcionalidad</div>
              <div className="font-semibold text-center text-mrt-700 pb-2">2.200€</div>
              <div className="font-semibold text-center text-gold-600 pb-2">2.800€</div>
              {features.map((f) => (
                <div key={f.label} className="contents">
                  <div className="text-mrt-600 py-1.5 border-t border-mrt-100">{f.label}</div>
                  <div className="flex justify-center py-1.5 border-t border-mrt-100">
                    {f.pro ? (
                      <Check size={14} className="text-emerald-500" />
                    ) : (
                      <XIcon size={14} className="text-mrt-200" />
                    )}
                  </div>
                  <div className="flex justify-center py-1.5 border-t border-mrt-100">
                    {f.prem ? (
                      <Check size={14} className="text-gold-500" />
                    ) : (
                      <XIcon size={14} className="text-mrt-200" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Chatbot ── */}
      <div className="flex-1 overflow-hidden py-1 px-1 sm:py-2 sm:px-2">
        <ChatBot key={plan} plan={plan} />
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
