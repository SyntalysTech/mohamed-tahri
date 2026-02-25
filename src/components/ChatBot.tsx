"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Language, Message, ClientSession, Plan } from "@/lib/types";
import { getStep } from "@/lib/flow";
import {
  createNewSession,
  saveSession,
  getActiveSessionId,
  setActiveSessionId,
  getSession,
} from "@/lib/storage";
import Image from "next/image";
import {
  Send,
  Upload,
  RotateCcw,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Scale,
  X,
  Crown,
  Shield,
  Phone,
} from "lucide-react";

// ── Helpers ────────────────────────────────────────────────
function isRTL(lang: Language | null): boolean {
  return lang === "ar" || lang === "darija" || lang === "dz";
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Template fill for premium dynamic messages ─────────────
const tierLabels: Record<string, Record<Language, string>> = {
  pre_eval: { darija: "تقييم أولي", ar: "تقييم أولي", dz: "تقييم أولي", fr: "Pre-evaluation" },
  file_opening: { darija: "فتح ملف", ar: "فتح ملف", dz: "فتح ملف", fr: "Ouverture dossier" },
  full_processing: { darija: "تسوية كاملة", ar: "تسوية كاملة", dz: "تسوية كاملة", fr: "Traitement complet" },
};

const pathwayLabels: Record<string, Record<Language, string>> = {
  quinta: { darija: "الانتقالية الخامسة (لجوء)", ar: "الانتقالية الخامسة (لجوء)", dz: "الانتقالية الخامسة (لجوء)", fr: "Transitoire 5e (Asile)" },
  sexta: { darija: "الانتقالية السادسة (عامة)", ar: "الانتقالية السادسة (عامة)", dz: "الانتقالية السادسة (عامة)", fr: "Transitoire 6e (Generale)" },
};

function fillTemplate(text: string, session: ClientSession): string {
  const lang = session.language;
  const tierName = session.serviceTier ? (tierLabels[session.serviceTier]?.[lang] || session.serviceTier) : "—";
  const pwName = session.pathway ? (pathwayLabels[session.pathway]?.[lang] || session.pathway) : "—";
  const addReq = session.answers.additional_req || "—";
  return text
    .replace(/\{\{name\}\}/g, session.name || "—")
    .replace(/\{\{phone\}\}/g, session.phone || "—")
    .replace(/\{\{tier\}\}/g, tierName)
    .replace(/\{\{amount\}\}/g, String(session.amountPaid || 0))
    .replace(/\{\{pathway\}\}/g, pwName)
    .replace(/\{\{additional\}\}/g, addReq)
    .replace(/\{\{docs\}\}/g, String(session.documents.length))
    .replace(/\{\{payment\}\}/g, session.paymentStatus === "paid" ? "✅" : "⏳");
}

// ── Progress tracking ──────────────────────────────────────
const stepsOrder = [
  "language_select", "welcome", "phone", "asylum_check",
  "tq_in_spain", "tq_criminal", "tq_entry_ban", "tq_no_return", "tq_docs", "tq_eligible",
  "ts_presence", "ts_proof", "ts_five_months", "ts_entry_date", "ts_criminal", "ts_entry_ban",
  "ts_additional", "ts_work_docs", "ts_family_docs", "ts_vuln_docs", "ts_common_docs", "ts_eligible",
  "service_tier", "premium_payment", "premium_upsell", "case_summary", "recovery_info",
  "payment", "complete",
];

function getProgress(stepId: string): number {
  const idx = stepsOrder.indexOf(stepId);
  if (idx === -1) return 100;
  return Math.min(100, Math.round((idx / (stepsOrder.length - 1)) * 100));
}

// ── Component ──────────────────────────────────────────────
interface ChatBotProps {
  plan: Plan;
}

export default function ChatBot({ plan }: ChatBotProps) {
  const [session, setSession] = useState<ClientSession | null>(null);
  const [textInput, setTextInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isPremium = plan === "premium";

  // ── Init ─────────────────────────────────────────────────
  useEffect(() => {
    const activeId = getActiveSessionId();
    if (activeId) {
      const existing = getSession(activeId);
      if (existing && existing.plan === plan) {
        setSession(existing);
        return;
      }
    }
    startNewSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan]);

  const startNewSession = useCallback(() => {
    const newSession = createNewSession(plan);
    const step = getStep("language_select");
    if (step) {
      const msg: Message = {
        id: crypto.randomUUID(),
        sender: "bot",
        text: step.message.ar,
        timestamp: Date.now(),
      };
      newSession.messages = [msg];
    }
    setSession(newSession);
    setActiveSessionId(newSession.id);
    saveSession(newSession);
    setFileNames([]);
    setTextInput("");
  }, [plan]);

  // ── Scroll ───────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [session?.messages]);

  // ── Process response ─────────────────────────────────────
  const handleResponse = useCallback(
    (value: string, displayText?: string) => {
      if (!session) return;
      const step = getStep(session.currentStep);
      if (!step) return;

      const userMsg: Message = {
        id: crypto.randomUUID(),
        sender: "user",
        text: displayText || value,
        timestamp: Date.now(),
      };

      const { nextStep, updates } = step.process(value, session);
      const updatedSession: ClientSession = {
        ...session,
        ...updates,
        currentStep: nextStep,
        messages: [...session.messages, userMsg],
        updatedAt: Date.now(),
      };

      const lang = (updates?.language as Language) || updatedSession.language;
      setSession(updatedSession);
      setIsTyping(true);

      setTimeout(() => {
        const nextStepDef = getStep(nextStep);
        if (nextStepDef) {
          const rawText = nextStepDef.message[lang];
          const filledText = fillTemplate(rawText, updatedSession);
          const botMsg: Message = {
            id: crypto.randomUUID(),
            sender: "bot",
            text: filledText,
            timestamp: Date.now(),
          };
          const withBot: ClientSession = {
            ...updatedSession,
            language: lang,
            messages: [...updatedSession.messages, botMsg],
            updatedAt: Date.now(),
          };
          setSession(withBot);
          saveSession(withBot);
          setActiveSessionId(withBot.id);
        }
        setIsTyping(false);
      }, 500 + Math.random() * 500);

      setTextInput("");
      setFileNames([]);
    },
    [session]
  );

  // ── Handlers ─────────────────────────────────────────────
  const handleTextSubmit = () => {
    const val = textInput.trim();
    if (!val) return;
    handleResponse(val);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleTextSubmit();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const names = Array.from(files).map((f) => f.name);
    setFileNames((prev) => [...prev, ...names]);
  };

  const handleFilesSubmit = () => {
    if (fileNames.length === 0) return;
    handleResponse(fileNames.join(", "), `📎 ${fileNames.join(", ")}`);
  };

  const removeFile = (idx: number) => {
    setFileNames((prev) => prev.filter((_, i) => i !== idx));
  };

  // ── Render ───────────────────────────────────────────────
  if (!session) return null;

  const currentStep = getStep(session.currentStep);
  const rtl = isRTL(session.language);
  const isTerminal = currentStep?.inputType === "none";
  const progress = getProgress(session.currentStep);

  const statusConfig = {
    eligible: { icon: CheckCircle2, label: "ELEGIBLE", color: "text-emerald-400", bg: "bg-emerald-500/10" },
    not_eligible: { icon: AlertTriangle, label: "NO ELEGIBLE", color: "text-red-400", bg: "bg-red-500/10" },
    referred: { icon: Scale, label: "DERIVADO", color: "text-amber-400", bg: "bg-amber-500/10" },
    completed: { icon: CheckCircle2, label: "COMPLETADO", color: "text-emerald-400", bg: "bg-emerald-500/10" },
    in_progress: { icon: Shield, label: "EN CURSO", color: "text-blue-400", bg: "bg-blue-500/10" },
  };
  const sc = statusConfig[session.status];

  return (
    <div
      className={`flex flex-col h-full max-w-lg mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden border ${
        isPremium ? "border-gold-200 animate-pulse-glow" : "border-mrt-100"
      }`}
      dir={rtl ? "rtl" : "ltr"}
    >
      {/* ── Header ──────────────────────────────── */}
      <header
        className={`shrink-0 px-4 py-3 flex items-center justify-between ${
          isPremium
            ? "bg-gradient-to-r from-mrt-950 via-mrt-900 to-mrt-950"
            : "bg-mrt-950"
        } text-white`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center overflow-hidden ${
              isPremium ? "bg-gradient-to-br from-gold-400 to-gold-600 p-0.5" : "bg-mrt-800 p-0.5"
            }`}
          >
            <Image
              src="/logo.png"
              alt="MRT"
              width={32}
              height={26}
              className="invert drop-shadow-[0_0_1px_rgba(255,255,255,0.8)] rounded-full"
            />
          </div>
          <div>
            <h1 className="font-semibold text-[13px] leading-tight flex items-center gap-1.5">
              Asesoria MRT
              {isPremium && (
                <span className="text-[8px] bg-gold-500/20 text-gold-400 px-1.5 py-0.5 rounded-full font-bold tracking-widest">
                  PREMIUM
                </span>
              )}
            </h1>
            <p className="text-[10px] text-mrt-400 leading-tight">
              Regularizacion Extraordinaria
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {session.status !== "in_progress" && (
            <span
              className={`flex items-center gap-1 text-[9px] px-2 py-1 rounded-full font-semibold ${sc.bg} ${sc.color}`}
            >
              <sc.icon size={10} />
              {sc.label}
            </span>
          )}
          <a
            href="https://wa.me/34747498536"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            title="WhatsApp"
          >
            <Phone size={14} />
          </a>
          <button
            onClick={startNewSession}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            title="Nueva consulta"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </header>

      {/* ── Progress bar ────────────────────────── */}
      <div className="h-1 bg-mrt-100 shrink-0">
        <div
          className={`h-full transition-all duration-500 ease-out animate-progress ${
            isPremium
              ? "bg-gradient-to-r from-gold-400 to-gold-500"
              : "bg-mrt-900"
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* ── Messages ────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gradient-to-b from-mrt-50/50 to-white">
        {session.messages.map((msg, idx) => (
          <div
            key={msg.id}
            className={`flex animate-fade-in-up ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
            style={{ animationDelay: `${Math.min(idx * 30, 200)}ms` }}
          >
            {msg.sender === "bot" && (
              <div className="w-6 h-6 rounded-full bg-mrt-100 flex items-center justify-center shrink-0 mr-2 mt-1">
                <Image src="/logo.png" alt="" width={16} height={13} className="opacity-70" />
              </div>
            )}
            <div
              className={`max-w-[80%] px-4 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap ${
                msg.sender === "user"
                  ? `rounded-2xl rounded-br-sm ${
                      isPremium
                        ? "bg-gradient-to-br from-mrt-900 to-mrt-800"
                        : "bg-mrt-950"
                    } text-white`
                  : "rounded-2xl rounded-bl-sm bg-white text-mrt-800 border border-mrt-100 shadow-sm"
              }`}
            >
              {msg.text}
              <div
                className={`text-[9px] mt-1.5 ${
                  msg.sender === "user" ? "text-mrt-400" : "text-mrt-300"
                }`}
              >
                {formatTime(msg.timestamp)}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start animate-fade-in-up">
            <div className="w-6 h-6 rounded-full bg-mrt-100 flex items-center justify-center shrink-0 mr-2 mt-1">
              <Image src="/logo.png" alt="" width={16} height={13} className="opacity-70" />
            </div>
            <div className="bg-white border border-mrt-100 shadow-sm px-4 py-3 rounded-2xl rounded-bl-sm">
              <div className="flex gap-1.5">
                <span className="w-1.5 h-1.5 bg-mrt-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-mrt-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-mrt-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Input area ──────────────────────────── */}
      {!isTerminal && (
        <div className="shrink-0 border-t border-mrt-100 bg-white p-3">
          {/* Buttons */}
          {currentStep?.inputType === "buttons" && currentStep.options && (
            <div className="flex flex-col gap-2">
              {currentStep.options.map((opt, i) => (
                <button
                  key={opt.value}
                  onClick={() =>
                    handleResponse(opt.value, opt.label[session.language])
                  }
                  disabled={isTyping}
                  className={`w-full py-3 px-4 text-[13px] font-medium rounded-xl border-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] ${
                    isPremium && i === (currentStep.options!.length - 1) && currentStep.options!.length > 1
                      ? "border-gold-300 text-mrt-900 bg-gold-50 hover:bg-gold-100 hover:border-gold-400"
                      : "border-mrt-200 text-mrt-900 hover:bg-mrt-50 hover:border-mrt-400"
                  }`}
                >
                  {opt.label[session.language]}
                </button>
              ))}
            </div>
          )}

          {/* Text input */}
          {(currentStep?.inputType === "text" || currentStep?.inputType === "date") && (
            <div className="flex gap-2 items-end">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isTyping}
                placeholder={currentStep.inputType === "date" ? "DD/MM/YYYY" : "..."}
                className={`flex-1 py-3 px-4 text-[13px] rounded-xl border-2 border-mrt-200 focus:border-mrt-900 focus:outline-none transition-colors disabled:opacity-40 ${
                  currentStep.inputType === "date" ? "font-mono" : ""
                }`}
                dir={currentStep.inputType === "date" ? "ltr" : rtl ? "rtl" : "ltr"}
              />
              <button
                onClick={handleTextSubmit}
                disabled={isTyping || !textInput.trim()}
                className="p-3 bg-mrt-950 text-white rounded-xl hover:bg-mrt-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
              >
                <Send size={16} />
              </button>
            </div>
          )}

          {/* File upload */}
          {currentStep?.inputType === "file" && (
            <div className="space-y-2">
              {fileNames.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {fileNames.map((name, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 rounded-lg"
                    >
                      <FileText size={10} />
                      {name.length > 20 ? name.slice(0, 17) + "..." : name}
                      <button onClick={() => removeFile(i)} className="hover:text-red-500 ml-0.5">
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isTyping}
                  className="flex-1 py-3 px-4 text-[13px] rounded-xl border-2 border-dashed border-mrt-200 text-mrt-400 hover:border-mrt-400 hover:text-mrt-700 hover:bg-mrt-50 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  <Upload size={14} />
                  {rtl ? "إضافة ملفات" : "Ajouter des fichiers"}
                </button>
                {fileNames.length > 0 && (
                  <button
                    onClick={handleFilesSubmit}
                    disabled={isTyping}
                    className="py-3 px-5 text-[13px] font-medium rounded-xl bg-mrt-950 text-white hover:bg-mrt-800 transition-colors disabled:opacity-40 flex items-center gap-2 active:scale-95"
                  >
                    <Send size={14} />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Terminal: restart */}
      {isTerminal && (
        <div className="shrink-0 border-t border-mrt-100 bg-white p-3 space-y-2">
          <button
            onClick={startNewSession}
            className={`w-full py-3 px-4 text-[13px] font-medium rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98] ${
              isPremium
                ? "bg-gradient-to-r from-gold-400 to-gold-500 text-mrt-950 hover:from-gold-500 hover:to-gold-600"
                : "bg-mrt-950 text-white hover:bg-mrt-800"
            }`}
          >
            <RotateCcw size={14} />
            {session.language === "fr" ? "Nouvelle consultation" : "استشارة جديدة"}
          </button>
          <a
            href="https://wa.me/34747498536"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 text-[12px] rounded-xl border-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition-all flex items-center justify-center gap-2"
          >
            <Phone size={13} />
            {session.language === "fr" ? "Contacter par WhatsApp" : "تواصل عبر واتساب"}
          </a>
        </div>
      )}
    </div>
  );
}
