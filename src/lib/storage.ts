import { ClientSession, Plan } from "./types";
import { startStep } from "./flow";

const SESSIONS_KEY = "regularizacion_sessions";
const ACTIVE_KEY = "regularizacion_active";

export function getAllSessions(): ClientSession[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(SESSIONS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveSession(session: ClientSession): void {
  const sessions = getAllSessions();
  const idx = sessions.findIndex((s) => s.id === session.id);
  if (idx >= 0) {
    sessions[idx] = session;
  } else {
    sessions.push(session);
  }
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export function getActiveSessionId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACTIVE_KEY);
}

export function setActiveSessionId(id: string | null): void {
  if (id) {
    localStorage.setItem(ACTIVE_KEY, id);
  } else {
    localStorage.removeItem(ACTIVE_KEY);
  }
}

export function getSession(id: string): ClientSession | null {
  return getAllSessions().find((s) => s.id === id) ?? null;
}

export function deleteSession(id: string): void {
  const sessions = getAllSessions().filter((s) => s.id !== id);
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  if (getActiveSessionId() === id) {
    localStorage.removeItem(ACTIVE_KEY);
  }
}

export function clearAllSessions(): void {
  localStorage.removeItem(SESSIONS_KEY);
  localStorage.removeItem(ACTIVE_KEY);
}

export function createNewSession(plan: Plan = "professional"): ClientSession {
  return {
    id: crypto.randomUUID(),
    plan,
    language: "ar",
    name: "",
    phone: "",
    pathway: null,
    currentStep: startStep,
    answers: {},
    documents: [],
    status: "in_progress",
    paymentStatus: "pending",
    serviceTier: null,
    amountPaid: 0,
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}
