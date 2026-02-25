export type Language = "darija" | "ar" | "dz" | "fr";

export type Plan = "professional" | "premium";

export type ServiceTier = "pre_eval" | "file_opening" | "full_processing";

export interface Translations {
  darija: string;
  ar: string;
  dz: string;
  fr: string;
}

export interface Message {
  id: string;
  sender: "bot" | "user";
  text: string;
  timestamp: number;
}

export interface FlowOption {
  label: Translations;
  value: string;
}

export interface FlowStep {
  id: string;
  message: Translations;
  inputType: "buttons" | "text" | "file" | "date" | "none";
  options?: FlowOption[];
  process: (
    value: string,
    session: ClientSession
  ) => { nextStep: string; updates?: Partial<ClientSession> };
}

export type ClientStatus =
  | "in_progress"
  | "eligible"
  | "not_eligible"
  | "referred"
  | "completed";

export type Pathway = "quinta" | "sexta" | null;

export interface ClientSession {
  id: string;
  plan: Plan;
  language: Language;
  name: string;
  phone: string;
  pathway: Pathway;
  currentStep: string;
  answers: Record<string, string>;
  documents: string[];
  status: ClientStatus;
  paymentStatus: "pending" | "paid";
  serviceTier: ServiceTier | null;
  amountPaid: number;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}
