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
  "language_select", "welcome", "topic_choice", "general_topic", "asylum_check",
  "tq_in_spain", "tq_five_months", "tq_criminal", "tq_entry_ban", "tq_no_return", "tq_docs", "tq_eligible",
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
      className={`flex flex-col h-full w-full max-w-lg mx-auto bg-white rounded-2xl overflow-hidden border relative z-20 transition-all duration-500 ease-out ${isPremium
        ? "border-gold-500/40 shadow-[0_0_40px_-10px_rgba(229,173,66,0.3)] bg-gradient-to-b from-white to-gold-50/10"
        : "border-mrt-200 shadow-2xl"
        }`}
      dir={rtl ? "rtl" : "ltr"}
    >
      {/* ── Header ──────────────────────────────── */}
      <header
        className={`shrink-0 px-4 py-3 sm:py-3.5 flex items-center justify-between relative overflow-hidden text-white ${isPremium ? "bg-[#075E54]" : "bg-[#075E54]"
          }`}
      >
        {isPremium && (
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 pointer-events-none" />
        )}
        <div className="flex items-center gap-3 relative z-10 w-full">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden shrink-0 bg-white p-1`}
          >
            {/* WhatsApp official logo from wikimedia */}
            <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" className="w-full h-full object-contain" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-bold text-[15px] leading-tight flex items-center gap-2 truncate text-white">
              Asesoría MRT
              {isPremium && (
                <span className="text-[9px] bg-white/20 text-white px-2 py-0.5 rounded-full font-bold tracking-widest uppercase flex items-center gap-1 shrink-0">
                  <Crown size={10} /> Pro
                </span>
              )}
            </h1>
            <p className="text-[11px] text-[#d9fdd3] leading-tight font-normal tracking-wide truncate mt-0.5">
              Extranjería en General
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
      <div className="h-1 bg-mrt-100 shrink-0" >
        <div
          className={`h-full transition-all duration-500 ease-out animate-progress ${isPremium
            ? "bg-gradient-to-r from-gold-400 to-gold-500"
            : "bg-mrt-900"
            }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* ── Messages ────────────────────────────── */}
      <div
        className={`flex-1 overflow-y-auto px-4 sm:px-5 py-5 sm:py-6 space-y-4 sm:space-y-5 custom-scrollbar relative bg-[#efeae2]`
        }
        style={{ backgroundImage: `url("https://w0.peakpx.com/wallpaper/722/71/HD-wallpaper-whatsapp-background-pattern-texture.jpg")`, backgroundSize: '300px', backgroundBlendMode: 'soft-light' }}
      >
        {isPremium && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gold-500/10 rounded-full blur-[80px] pointer-events-none"></div>
        )}
        {
          session.messages.map((msg, idx) => (
            <div
              key={msg.id}
              className={`flex animate-fade-in-up relative z-10 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              style={{ animationDelay: `${Math.min(idx * 30, 200)}ms` }}
            >
              {msg.sender === "bot" && (
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mr-3 mt-1 shadow-sm bg-white`}>
                  <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="" className="w-6 h-6 object-contain" />
                </div>
              )}
              <div className={`max-w-[85%] sm:max-w-[80%] flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                <div
                  className={`px-3 py-2 text-[14px] leading-relaxed whitespace-pre-wrap shadow-[0_1px_0.5px_rgba(0,0,0,0.13)] ${msg.sender === "user"
                    ? `rounded-lg rounded-tr-none bg-[#d9fdd3] text-[#111b21]`
                    : `rounded-lg rounded-tl-none bg-white text-[#111b21]`
                    }`}
                >
                  {msg.text}
                </div>
                <div className={`text-[9px] sm:text-[10px] font-medium mt-1.5 px-1 ${msg.sender === "user" ? "text-mrt-400" : "text-mrt-400"}`}>
                  {formatTime(msg.timestamp)}
                </div>
              </div>
            </div>
          ))
        }

        {
          isTyping && (
            <div className="flex justify-start animate-fade-in-up relative z-10">
              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0 mr-2 sm:mr-3 mt-1 shadow-sm border ${isPremium ? "bg-gradient-to-br from-gold-100 to-white border-gold-200" : "bg-white border-mrt-200"
                }`}>
                <Image src="/logo.png" alt="" width={16} height={14} className="opacity-60" />
              </div>
              <div className={`bg-white border text-mrt-800 shadow-sm px-5 py-3 rounded-2xl rounded-tl-sm flex items-center h-[42px] sm:h-[46px] ${isPremium ? "border-gold-200/60" : "border-mrt-200"
                }`}>
                <div className="flex gap-1.5 items-center">
                  <span className={`w-1.5 h-1.5 rounded-full animate-bounce ${isPremium ? "bg-gold-400" : "bg-mrt-400"}`} style={{ animationDelay: "0ms" }} />
                  <span className={`w-1.5 h-1.5 rounded-full animate-bounce ${isPremium ? "bg-gold-400" : "bg-mrt-400"}`} style={{ animationDelay: "150ms" }} />
                  <span className={`w-1.5 h-1.5 rounded-full animate-bounce ${isPremium ? "bg-gold-400" : "bg-mrt-400"}`} style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )
        }

        <div ref={messagesEndRef} />
      </div>

      {/* ── Input area ──────────────────────────── */}
      {
        !isTerminal && (
          <div className={`shrink-0 border-t bg-white p-3 sm:p-4 z-20 relative ${isPremium ? "border-gold-200 shadow-[0_-10px_20px_-10px_rgba(229,173,66,0.1)]" : "border-mrt-100"}`}>
            {/* Buttons */}
            {currentStep?.inputType === "buttons" && currentStep.options && (
              <div className="flex flex-col gap-2.5">
                {currentStep.options.map((opt, i) => {
                  const isPrimary = isPremium && i === (currentStep.options!.length - 1) && currentStep.options!.length > 1;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => handleResponse(opt.value, opt.label[session.language])}
                      disabled={isTyping}
                      className={`w-full py-3 sm:py-3.5 px-4 sm:px-5 text-[13px] sm:text-sm font-semibold rounded-xl border-2 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] flex items-center justify-center gap-2 ${isPrimary
                        ? "border-gold-400 text-mrt-950 bg-gradient-to-r from-gold-100 to-gold-50 hover:from-gold-200 hover:to-gold-100 shadow-[0_4px_15px_-5px_rgba(229,173,66,0.3)] hover:shadow-[0_6px_20px_-5px_rgba(229,173,66,0.4)] transform hover:-translate-y-0.5"
                        : "border-mrt-200 text-mrt-900 bg-white hover:bg-mrt-50 hover:border-mrt-400 hover:shadow-md transform hover:-translate-y-0.5"
                        }`}
                    >
                      {isPrimary && <Crown size={16} className="text-gold-500" />}
                      {opt.label[session.language]}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Text input */}
            {(currentStep?.inputType === "text" || currentStep?.inputType === "date") && (
              <div className="flex gap-2.5 items-end">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isTyping}
                  placeholder={currentStep.inputType === "date" ? "DD/MM/YYYY" : "..."}
                  className={`flex-1 py-3.5 px-5 text-[13px] sm:text-sm rounded-xl border-2 focus:outline-none transition-all disabled:opacity-40 shadow-inner ${isPremium
                    ? "border-mrt-200 focus:border-gold-400 focus:ring-4 focus:ring-gold-400/10 bg-mrt-50/50"
                    : "border-mrt-200 focus:border-mrt-900 focus:ring-4 focus:ring-mrt-900/10 bg-mrt-50/50"
                    } ${currentStep.inputType === "date" ? "font-mono tracking-wider" : ""}`}
                  dir={currentStep.inputType === "date" ? "ltr" : rtl ? "rtl" : "ltr"}
                />
                <button
                  onClick={handleTextSubmit}
                  disabled={isTyping || !textInput.trim()}
                  className={`p-3.5 sm:px-5 sm:py-3.5 text-white rounded-xl transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 flex items-center justify-center shadow-md ${isPremium
                    ? "bg-gradient-to-br from-mrt-800 to-mrt-950 hover:from-mrt-700 hover:to-mrt-900 hover:shadow-lg"
                    : "bg-mrt-900 hover:bg-mrt-800"
                    }`}
                >
                  <span className="hidden sm:inline mr-2 font-semibold">Enviar</span>
                  <Send size={18} className={rtl ? "rotate-180" : ""} />
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
        )
      }

      {/* Terminal: restart */}
      {
        isTerminal && (
          <div className="shrink-0 border-t border-mrt-100 bg-white p-3 space-y-2">
            <button
              onClick={startNewSession}
              className={`w-full py-3 px-4 text-[13px] font-medium rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98] ${isPremium
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
        )
      }
    </div>
  );
}
