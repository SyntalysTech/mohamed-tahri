import { FlowStep, ClientSession, Translations } from "./types";

// ─── HELPERS ──────────────────────────────────────────────────
const t = (
  darija: string,
  ar: string,
  dz: string,
  fr: string
): Translations => ({ darija, ar, dz, fr });

// ─── FLOW STEPS ───────────────────────────────────────────────
export const flowSteps: Record<string, FlowStep> = {
  // ════════════════════════════════════════════════════════════
  //  0. LANGUAGE SELECT
  // ════════════════════════════════════════════════════════════
  language_select: {
    id: "language_select",
    message: t(
      "مرحبا بيك! ختار اللغة ديالك 👇",
      "مرحباً! اختر اللغة من فضلك 👇",
      "مرحبا بيك! اختار اللغة تاعك 👇",
      "Bienvenue ! Choisissez votre langue 👇"
    ),
    inputType: "buttons",
    options: [
      { label: t("الدارجة 🇲🇦", "الدارجة 🇲🇦", "الدارجة 🇲🇦", "Darija 🇲🇦"), value: "darija" },
      { label: t("العربية الفصحى", "العربية الفصحى", "العربية الفصحى", "Arabe standard"), value: "ar" },
      { label: t("الجزائرية 🇩🇿", "الجزائرية 🇩🇿", "الجزائرية 🇩🇿", "Algérien 🇩🇿"), value: "dz" },
      { label: t("Français 🇫🇷", "Français 🇫🇷", "Français 🇫🇷", "Français 🇫🇷"), value: "fr" },
    ],
    process: (value, _session) => ({
      nextStep: "welcome",
      updates: { language: value as ClientSession["language"] },
    }),
  },

  // ════════════════════════════════════════════════════════════
  //  1. WELCOME + NAME
  // ════════════════════════════════════════════════════════════
  welcome: {
    id: "welcome",
    message: t(
      "مرحبا بيك فمكتبنا! 🏛️\n\nكنساعدوك فموضوع التسوية الاستثنائية ديال الوضعية فإسبانيا.\n\nعافاك عطينا سميتك الكاملة:",
      "مرحباً بك في مكتبنا! 🏛️\n\nنساعدك في موضوع التسوية الاستثنائية للوضعية في إسبانيا.\n\nمن فضلك أعطنا اسمك الكامل:",
      "مرحبا بيك في مكتبنا! 🏛️\n\nنعاونوك في موضوع التسوية الاستثنائية تاع الوضعية في اسبانيا.\n\nعطينا اسمك الكامل:",
      "Bienvenue dans notre cabinet ! 🏛️\n\nNous vous aidons pour la régularisation exceptionnelle en Espagne.\n\nVeuillez nous donner votre nom complet :"
    ),
    inputType: "text",
    process: (value, _session) => ({
      nextStep: "phone",
      updates: { name: value.trim() },
    }),
  },

  phone: {
    id: "phone",
    message: t(
      "شكرا! دابا عطينا رقم الهاتف ديالك (واتساب):",
      "شكراً! الآن أعطنا رقم هاتفك (واتساب):",
      "شكرا! دابا عطينا رقم تليفونك (واتساب):",
      "Merci ! Maintenant donnez-nous votre numéro de téléphone (WhatsApp) :"
    ),
    inputType: "text",
    process: (value, _session) => ({
      nextStep: "asylum_check",
      updates: { phone: value.trim() },
    }),
  },

  // ════════════════════════════════════════════════════════════
  //  2. ASYLUM CHECK — Quinta vs Sexta
  // ════════════════════════════════════════════════════════════
  asylum_check: {
    id: "asylum_check",
    message: t(
      "واش قدمتي طلب لجوء (حماية دولية) قبل 1 يناير 2026؟",
      "هل قدمت طلب حماية دولية (لجوء) قبل 1 يناير 2026؟",
      "واش قدمت طلب لجوء (حماية دولية) قبل 1 جانفي 2026؟",
      "Avez-vous déposé une demande de protection internationale (asile) avant le 1er janvier 2026 ?"
    ),
    inputType: "buttons",
    options: [
      { label: t("نعم ✅", "نعم ✅", "نعم ✅", "Oui ✅"), value: "yes" },
      { label: t("لا ❌", "لا ❌", "لا ❌", "Non ❌"), value: "no" },
    ],
    process: (value, _session) => {
      if (value === "yes") {
        return { nextStep: "tq_in_spain", updates: { pathway: "quinta" as const, answers: { ..._session.answers, asylum: "yes" } } };
      }
      return { nextStep: "ts_presence", updates: { pathway: "sexta" as const, answers: { ..._session.answers, asylum: "no" } } };
    },
  },

  // ════════════════════════════════════════════════════════════
  //  TRANSITORIA QUINTA (Asylum seekers)
  // ════════════════════════════════════════════════════════════
  tq_in_spain: {
    id: "tq_in_spain",
    message: t(
      "واش نتا دابا فإسبانيا؟ 🇪🇸",
      "هل أنت موجود حالياً داخل إسبانيا؟ 🇪🇸",
      "واش راك دابا في اسبانيا؟ 🇪🇸",
      "Êtes-vous actuellement en Espagne ? 🇪🇸"
    ),
    inputType: "buttons",
    options: [
      { label: t("نعم ✅", "نعم ✅", "نعم ✅", "Oui ✅"), value: "yes" },
      { label: t("لا ❌", "لا ❌", "لا ❌", "Non ❌"), value: "no" },
    ],
    process: (value, session) => {
      if (value === "no") {
        return { nextStep: "not_eligible_not_in_spain", updates: { status: "not_eligible" as const, answers: { ...session.answers, in_spain: "no" } } };
      }
      return { nextStep: "tq_five_months", updates: { answers: { ...session.answers, in_spain: "yes" } } };
    },
  },

  tq_five_months: {
    id: "tq_five_months",
    message: t(
      "واش بقيتي فإسبانيا بشكل متواصل 5 شهور على الأقل قبل ما تدفع الطلب؟",
      "هل أقمت في إسبانيا بشكل مستمر لمدة 5 أشهر على الأقل قبل تقديم الطلب؟",
      "واش بقيت في اسبانيا بشكل متواصل 5 أشهر على الأقل قبل ما تدفع؟",
      "Avez-vous résidé en Espagne de manière continue pendant au moins 5 mois avant la demande ?"
    ),
    inputType: "buttons",
    options: [
      { label: t("نعم ✅", "نعم ✅", "نعم ✅", "Oui ✅"), value: "yes" },
      { label: t("لا ❌", "لا ❌", "لا ❌", "Non ❌"), value: "no" },
      { label: t("ما نعرفش ❓", "لا أعرف ❓", "ما نعرفش ❓", "Je ne sais pas ❓"), value: "unknown" },
    ],
    process: (value, session) => {
      if (value === "no") {
        return { nextStep: "not_eligible_yet", updates: { answers: { ...session.answers, five_months: "no" } } };
      }
      return { nextStep: "tq_criminal", updates: { answers: { ...session.answers, five_months: value } } };
    },
  },

  tq_criminal: {
    id: "tq_criminal",
    message: t(
      "واش عندك سوابق عدلية فإسبانيا أو فشي بلاد خرا عشتي فيها فهاد 5 سنين اللخرا؟",
      "هل لديك سوابق جنائية في إسبانيا أو في أي بلد أقمت فيه خلال آخر 5 سنوات؟",
      "واش عندك سوابق قضائية في اسبانيا ولا في شي بلاد خرا عشت فيها في 5 سنين لخرانيين؟",
      "Avez-vous un casier judiciaire en Espagne ou dans un pays où vous avez résidé ces 5 dernières années ?"
    ),
    inputType: "buttons",
    options: [
      { label: t("لا، ما عنديش ✅", "لا، ليس لدي ✅", "لا، ما عنديش ✅", "Non ✅"), value: "no" },
      { label: t("نعم ⚠️", "نعم ⚠️", "نعم ⚠️", "Oui ⚠️"), value: "yes" },
      { label: t("ما نعرفش ❓", "لا أعرف ❓", "ما نعرفش ❓", "Je ne sais pas ❓"), value: "unknown" },
    ],
    process: (value, session) => {
      if (value === "yes" || value === "unknown") {
        return { nextStep: "refer_human_criminal", updates: { status: "referred" as const, answers: { ...session.answers, criminal: value } } };
      }
      return { nextStep: "tq_entry_ban", updates: { answers: { ...session.answers, criminal: "no" } } };
    },
  },

  tq_entry_ban: {
    id: "tq_entry_ban",
    message: t(
      "واش عندك قرار منع دخول لإسبانيا ولا مسجل كمرفوض فشينغن؟",
      "هل لديك قرار منع دخول إلى إسبانيا أو أنت مُسجَّل كمرفوض في فضاء شنغن؟",
      "واش عندك قرار منع دخول لإسبانيا ولا مسجل كمرفوض في شنغن؟",
      "Avez-vous une interdiction d'entrée en Espagne ou êtes-vous signalé dans l'espace Schengen ?"
    ),
    inputType: "buttons",
    options: [
      { label: t("لا ✅", "لا ✅", "لا ✅", "Non ✅"), value: "no" },
      { label: t("نعم ⚠️", "نعم ⚠️", "نعم ⚠️", "Oui ⚠️"), value: "yes" },
      { label: t("ما نعرفش ❓", "لا أعرف ❓", "ما نعرفش ❓", "Je ne sais pas ❓"), value: "unknown" },
    ],
    process: (value, session) => {
      if (value === "yes") {
        return { nextStep: "refer_human_ban", updates: { status: "referred" as const, answers: { ...session.answers, entry_ban: value } } };
      }
      return { nextStep: "tq_no_return", updates: { answers: { ...session.answers, entry_ban: value } } };
    },
  },

  tq_no_return: {
    id: "tq_no_return",
    message: t(
      "واش وقعتي من قبل على تعهد بعدم الرجوع لإسبانيا؟",
      "هل وقّعت سابقاً على تعهد بعدم العودة إلى إسبانيا؟",
      "واش وقعت من قبل على تعهد بلي ما ترجعش لإسبانيا؟",
      "Avez-vous signé un engagement de non-retour en Espagne ?"
    ),
    inputType: "buttons",
    options: [
      { label: t("لا ✅", "لا ✅", "لا ✅", "Non ✅"), value: "no" },
      { label: t("نعم ⚠️", "نعم ⚠️", "نعم ⚠️", "Oui ⚠️"), value: "yes" },
      { label: t("ما نعرفش ❓", "لا أعرف ❓", "ما نعرفش ❓", "Je ne sais pas ❓"), value: "unknown" },
    ],
    process: (value, session) => {
      if (value === "yes") {
        return { nextStep: "refer_human_noreturn", updates: { status: "referred" as const, answers: { ...session.answers, no_return: value } } };
      }
      return { nextStep: "tq_docs", updates: { answers: { ...session.answers, no_return: value } } };
    },
  },

  tq_docs: {
    id: "tq_docs",
    message: t(
      "مزيان! 📎 دابا خاصك تصيفط لينا هاد الوثائق:\n\n1️⃣ نسخة من طلب اللجوء\n2️⃣ جواز السفر كامل (PDF)\n3️⃣ شهادة السوابق من بلادك\n4️⃣ دليل الإقامة 5 شهور فإسبانيا\n\nصيفط الملفات واحد واحد:",
      "ممتاز! 📎 الآن أرسل لنا الوثائق التالية:\n\n1️⃣ نسخة من طلب الحماية الدولية\n2️⃣ جواز السفر كامل (PDF)\n3️⃣ شهادة السوابق من بلدك\n4️⃣ دليل الإقامة لمدة 5 أشهر في إسبانيا\n\nأرسل الملفات واحداً تلو الآخر:",
      "مليح! 📎 دابا لازم تبعثلنا هاد الوثائق:\n\n1️⃣ نسخة من طلب اللجوء\n2️⃣ جواز السفر كامل (PDF)\n3️⃣ شهادة السوابق من بلادك\n4️⃣ دليل الإقامة 5 أشهر في اسبانيا\n\nابعث الملفات وحدة وحدة:",
      "Parfait ! 📎 Envoyez-nous maintenant les documents :\n\n1️⃣ Copie de la demande d'asile\n2️⃣ Passeport complet (PDF)\n3️⃣ Casier judiciaire de votre pays\n4️⃣ Preuve de résidence de 5 mois\n\nEnvoyez les fichiers un par un :"
    ),
    inputType: "file",
    process: (_value, session) => ({
      nextStep: "tq_eligible",
      updates: { documents: [...session.documents, _value] },
    }),
  },

  tq_eligible: {
    id: "tq_eligible",
    message: t(
      "✅ بحسب المعلومات اللي عطيتينا، الملف ديالك كيبان مؤهل عبر المسطرة الانتقالية الخامسة.\n\n📌 معلومات مهمة:\n• غادي تاخد إذن مؤقت للخدمة مع بداية المعالجة\n• إجراء الترحيل إن وجد غادي يتوقف تلقائياً\n• الإذن صالح لمدة سنة\n• خاصك تطلب بطاقة الإقامة (TIE) فالشهر اللي بعد القبول\n\nالملف ديالك غادي يتراجع من طرف مستشار قانوني خلال 24-48 ساعة.",
      "✅ بحسب المعلومات المقدمة، ملفك يبدو مؤهلاً عبر الإجراء الانتقالي الخامس.\n\n📌 معلومات مهمة:\n• ستحصل على إذن مؤقت للعمل عند قبول الطلب\n• سيتوقف إجراء الترحيل تلقائياً إن وُجد\n• الإذن صالح لمدة سنة واحدة\n• يجب طلب بطاقة الإقامة (TIE) خلال الشهر التالي للقبول\n\nسيتم مراجعة ملفك من طرف مستشار قانوني خلال 24-48 ساعة.",
      "✅ حسب المعلومات اللي عطيتنا، الملف تاعك يبان مؤهل عبر الإجراء الانتقالي الخامس.\n\n📌 معلومات مهمة:\n• غادي تاخد إذن مؤقت للخدمة وقت بداية المعالجة\n• إجراء الترحيل إلا كان غادي يتوقف أوتوماتيك\n• الإذن صالح لعام\n• لازم تطلب بطاقة الإقامة (TIE) في الشهر اللي يجي بعد القبول\n\nالملف تاعك غادي يتراجع من طرف مستشار قانوني في 24-48 ساعة.",
      "✅ D'après les informations fournies, votre dossier semble éligible via la Disposition Transitoire Cinquième.\n\n📌 Informations importantes :\n• Vous recevrez un permis de travail provisoire dès l'admission\n• La procédure d'expulsion sera automatiquement suspendue si elle existe\n• L'autorisation est valable 1 an\n• Vous devrez demander la carte de séjour (TIE) dans le mois suivant l'approbation\n\nVotre dossier sera examiné par un conseiller juridique sous 24-48h."
    ),
    inputType: "buttons",
    options: [
      {
        label: t("متابعة للدفع 💳", "متابعة للدفع 💳", "متابعة للدفع 💳", "Continuer vers le paiement 💳"),
        value: "pay",
      },
    ],
    process: (_value, session) => ({
      nextStep: session.plan === "premium" ? "service_tier" : "payment",
      updates: { status: "eligible" as const },
    }),
  },

  // ════════════════════════════════════════════════════════════
  //  TRANSITORIA SEXTA (General regularization)
  // ════════════════════════════════════════════════════════════
  ts_presence: {
    id: "ts_presence",
    message: t(
      "واش كنتي فإسبانيا قبل 1 يناير 2026؟ 🇪🇸",
      "هل كنت متواجداً في إسبانيا قبل 1 يناير 2026؟ 🇪🇸",
      "واش كنت في اسبانيا قبل 1 جانفي 2026؟ 🇪🇸",
      "Étiez-vous en Espagne avant le 1er janvier 2026 ? 🇪🇸"
    ),
    inputType: "buttons",
    options: [
      { label: t("نعم ✅", "نعم ✅", "نعم ✅", "Oui ✅"), value: "yes" },
      { label: t("لا ❌", "لا ❌", "لا ❌", "Non ❌"), value: "no" },
    ],
    process: (value, session) => {
      if (value === "no") {
        return { nextStep: "not_eligible_date", updates: { status: "not_eligible" as const, answers: { ...session.answers, presence: "no" } } };
      }
      return { nextStep: "ts_proof", updates: { answers: { ...session.answers, presence: "yes" } } };
    },
  },

  ts_proof: {
    id: "ts_proof",
    message: t(
      "كيفاش تقدر تثبت بلي كنتي فإسبانيا قبل 1 يناير 2026؟\n\nختار:",
      "كيف يمكنك إثبات أنك كنت في إسبانيا قبل 1 يناير 2026؟\n\nاختر:",
      "كيفاش تقدر تثبت بلي كنت في اسبانيا قبل 1 جانفي 2026؟\n\nاختار:",
      "Comment pouvez-vous prouver votre présence en Espagne avant le 1er janvier 2026 ?\n\nChoisissez :"
    ),
    inputType: "buttons",
    options: [
      { label: t("تذكرة طيران ✈️", "تذكرة طيران ✈️", "تذكرة طيران ✈️", "Billet d'avion ✈️"), value: "flight" },
      { label: t("ختم جواز السفر 🛂", "ختم جواز السفر 🛂", "ختم جواز السفر 🛂", "Tampon passeport 🛂"), value: "stamp" },
      { label: t("فاتورة شراء 🧾", "فاتورة شراء 🧾", "فاتورة شراء 🧾", "Facture d'achat 🧾"), value: "receipt" },
      { label: t("شهادة سكن (Padrón) 📄", "شهادة سكن (Padrón) 📄", "شهادة سكن (Padrón) 📄", "Certificat Padrón 📄"), value: "padron" },
    ],
    process: (value, session) => ({
      nextStep: "ts_five_months",
      updates: { answers: { ...session.answers, proof_type: value } },
    }),
  },

  ts_five_months: {
    id: "ts_five_months",
    message: t(
      "واش بقيتي فإسبانيا بشكل متواصل 5 شهور على الأقل؟",
      "هل أقمت في إسبانيا بشكل مستمر لمدة 5 أشهر على الأقل؟",
      "واش بقيت في اسبانيا بشكل متواصل 5 أشهر على الأقل؟",
      "Avez-vous résidé en Espagne de manière continue pendant au moins 5 mois ?"
    ),
    inputType: "buttons",
    options: [
      { label: t("نعم ✅", "نعم ✅", "نعم ✅", "Oui ✅"), value: "yes" },
      { label: t("لا ❌", "لا ❌", "لا ❌", "Non ❌"), value: "no" },
      { label: t("ما نعرفش ❓", "لا أعرف ❓", "ما نعرفش ❓", "Je ne sais pas ❓"), value: "unknown" },
    ],
    process: (value, session) => {
      if (value === "no") {
        return { nextStep: "not_eligible_yet", updates: { answers: { ...session.answers, five_months: "no" } } };
      }
      if (value === "unknown") {
        return { nextStep: "ts_entry_date", updates: { answers: { ...session.answers, five_months: "unknown" } } };
      }
      return { nextStep: "ts_criminal", updates: { answers: { ...session.answers, five_months: "yes" } } };
    },
  },

  ts_entry_date: {
    id: "ts_entry_date",
    message: t(
      "فوقاش دخلتي لإسبانيا؟ (مثلا: 15/09/2025)",
      "متى دخلت إسبانيا؟ (مثال: 15/09/2025)",
      "وقتاش دخلت لإسبانيا؟ (مثلا: 15/09/2025)",
      "Quand êtes-vous entré en Espagne ? (exemple : 15/09/2025)"
    ),
    inputType: "text",
    process: (value, session) => {
      const parts = value.split("/");
      let monthsPassed = 0;
      if (parts.length === 3) {
        const entered = new Date(+parts[2], +parts[1] - 1, +parts[0]);
        const now = new Date();
        monthsPassed =
          (now.getFullYear() - entered.getFullYear()) * 12 +
          (now.getMonth() - entered.getMonth());
      }
      if (monthsPassed >= 5) {
        return { nextStep: "ts_criminal", updates: { answers: { ...session.answers, entry_date: value, five_months: "calculated_yes" } } };
      }
      return { nextStep: "not_eligible_yet", updates: { answers: { ...session.answers, entry_date: value, five_months: "calculated_no" } } };
    },
  },

  ts_criminal: {
    id: "ts_criminal",
    message: t(
      "واش عندك سوابق عدلية فهاد 5 سنين اللخرا؟",
      "هل لديك سوابق جنائية خلال آخر 5 سنوات؟",
      "واش عندك سوابق قضائية في 5 سنين لخرانيين؟",
      "Avez-vous un casier judiciaire ces 5 dernières années ?"
    ),
    inputType: "buttons",
    options: [
      { label: t("لا ✅", "لا ✅", "لا ✅", "Non ✅"), value: "no" },
      { label: t("نعم ⚠️", "نعم ⚠️", "نعم ⚠️", "Oui ⚠️"), value: "yes" },
      { label: t("ما نعرفش ❓", "لا أعرف ❓", "ما نعرفش ❓", "Je ne sais pas ❓"), value: "unknown" },
    ],
    process: (value, session) => {
      if (value === "yes" || value === "unknown") {
        return { nextStep: "refer_human_criminal", updates: { status: "referred" as const, answers: { ...session.answers, criminal: value } } };
      }
      return { nextStep: "ts_entry_ban", updates: { answers: { ...session.answers, criminal: "no" } } };
    },
  },

  ts_entry_ban: {
    id: "ts_entry_ban",
    message: t(
      "واش عندك منع دخول ولا قرار ترحيل ولا تعهد بعدم الرجوع؟",
      "هل لديك منع دخول أو قرار ترحيل أو تعهد بعدم العودة؟",
      "واش عندك منع دخول ولا قرار ترحيل ولا تعهد بلي ما ترجعش؟",
      "Avez-vous une interdiction d'entrée, un ordre d'expulsion ou un engagement de non-retour ?"
    ),
    inputType: "buttons",
    options: [
      { label: t("لا ✅", "لا ✅", "لا ✅", "Non ✅"), value: "no" },
      { label: t("نعم ⚠️", "نعم ⚠️", "نعم ⚠️", "Oui ⚠️"), value: "yes" },
      { label: t("ما نعرفش ❓", "لا أعرف ❓", "ما نعرفش ❓", "Je ne sais pas ❓"), value: "unknown" },
    ],
    process: (value, session) => {
      if (value === "yes") {
        return { nextStep: "refer_human_ban", updates: { status: "referred" as const, answers: { ...session.answers, entry_ban: value } } };
      }
      return { nextStep: "ts_additional", updates: { answers: { ...session.answers, entry_ban: value } } };
    },
  },

  ts_additional: {
    id: "ts_additional",
    message: t(
      "خاصك تحقق شرط واحد على الأقل من هادو:\n\n1️⃣ خدمتي فإسبانيا ولا عندك عقد خدمة\n2️⃣ كتعيش مع عائلتك (ولادك كيقراو...)\n3️⃣ وضعية غير قانونية (بدون أوراق = حالة هشاشة)\n\nختار:",
      "يجب أن تستوفي شرطاً واحداً على الأقل:\n\n1️⃣ عملت في إسبانيا أو لديك عقد عمل\n2️⃣ تعيش مع عائلتك (أطفال يدرسون...)\n3️⃣ وضعية غير قانونية (بدون أوراق = هشاشة)\n\nاختر:",
      "لازم تحقق شرط واحد على الأقل:\n\n1️⃣ خدمت في اسبانيا ولا عندك عقد خدمة\n2️⃣ تعيش مع عائلتك (ولادك يقراو...)\n3️⃣ وضعية غير قانونية (حراڤ = هشاشة)\n\nاختار:",
      "Vous devez remplir au moins une condition :\n\n1️⃣ Vous avez travaillé en Espagne ou avez un contrat\n2️⃣ Vous vivez avec votre famille (enfants scolarisés...)\n3️⃣ Sans papiers (Situation irrégulière = Vulnérabilité)\n\nChoisissez :"
    ),
    inputType: "buttons",
    options: [
      { label: t("خدمة / عقد 💼", "عمل / عقد 💼", "خدمة / عقد 💼", "Travail / Contrat 💼"), value: "work" },
      { label: t("عائلة 👨‍👩‍👧‍👦", "عائلة 👨‍👩‍👧‍👦", "عائلة 👨‍👩‍👧‍👦", "Famille 👨‍👩‍👧‍👦"), value: "family" },
      { label: t("بدون أوراق / هشاشة 🤝", "بدون أوراق / هشاشة 🤝", "حراڤ / هشاشة 🤝", "Sans papiers / Vulnérabilité 🤝"), value: "vulnerability" },
    ],
    process: (value, session) => {
      const nextMap: Record<string, string> = {
        work: "ts_work_docs",
        family: "ts_family_docs",
        vulnerability: "ts_vuln_docs",
      };
      return { nextStep: nextMap[value] || "ts_work_docs", updates: { answers: { ...session.answers, additional_req: value } } };
    },
  },

  ts_work_docs: {
    id: "ts_work_docs",
    message: t(
      "📎 صيفط لينا واحد من هادو:\n• عقد خدمة\n• إثبات خدمة\n• Vida laboral (إلا عندك)",
      "📎 أرسل لنا واحداً مما يلي:\n• عقد عمل\n• إثبات عمل\n• Vida laboral (إن وُجدت)",
      "📎 ابعثلنا واحد من هادو:\n• عقد خدمة\n• إثبات خدمة\n• Vida laboral (إلا عندك)",
      "📎 Envoyez-nous l'un des documents suivants :\n• Contrat de travail\n• Preuve d'emploi\n• Vida laboral (si disponible)"
    ),
    inputType: "file",
    process: (_value, session) => ({
      nextStep: "ts_common_docs",
      updates: { documents: [...session.documents, _value] },
    }),
  },

  ts_family_docs: {
    id: "ts_family_docs",
    message: t(
      "📎 صيفط لينا:\n• شهادة مدرسية ديال الولاد\n• Empadronamiento\n• وثيقة تثبت صلة القرابة",
      "📎 أرسل لنا:\n• شهادة مدرسية للأطفال\n• شهادة السكن (Empadronamiento)\n• وثيقة تثبت صلة القرابة",
      "📎 ابعثلنا:\n• شهادة مدرسية تاع الأولاد\n• Empadronamiento\n• وثيقة تثبت صلة القرابة",
      "📎 Envoyez-nous :\n• Certificat scolaire des enfants\n• Empadronamiento\n• Document prouvant le lien de parenté"
    ),
    inputType: "file",
    process: (_value, session) => ({
      nextStep: "ts_common_docs",
      updates: { documents: [...session.documents, _value] },
    }),
  },

  ts_vuln_docs: {
    id: "ts_vuln_docs",
    message: t(
      "📎 القانون الجديد كيعتبر الوضعية بدون أوراق حالة هشاشة بوحدها! إلا عندك تقرير من الخدمات الاجتماعية صيفطو، متوفرش؟ ماشي مشكل، التواجد غير القانوني كافي.",
      "📎 القانون الجديد يعتبر الوضعية بدون أوراق (Irregular) حالة هشاشة تلقائياً! أرسل تقرير الخدمات الاجتماعية إن وجد، وإن لم يوجد، فوضعك غير القانوني يكفي.",
      "📎 القانون الجديد يعتبر بلي كي تكون حراڤ هي حالة هشاشة بروحها! ابعث تقرير الخدمات الاجتماعية إلا كاين، ولا ماكاش، وضعك يكفي.",
      "📎 La nouvelle loi considère la situation « sans papiers » comme une vulnérabilité en soi ! Envoyez un rapport si vous en avez un, sinon votre statut irrégulier suffit."
    ),
    inputType: "file",
    process: (_value, session) => ({
      nextStep: "ts_common_docs",
      updates: { documents: [...session.documents, _value] },
    }),
  },

  ts_common_docs: {
    id: "ts_common_docs",
    message: t(
      "📋 دابا صيفط لينا الوثائق الأساسية:\n\n1️⃣ جواز السفر كامل (PDF)\n2️⃣ دليل أنك كنتي فإسبانيا قبل 1/1/2026\n   (تذكرة، ختم، فاتورة، تقرير طبي...)\n3️⃣ دليل الإقامة 5 شهور\n4️⃣ شهادة السوابق من بلادك",
      "📋 الآن أرسل لنا الوثائق الأساسية:\n\n1️⃣ جواز السفر كامل (PDF)\n2️⃣ دليل وجودك في إسبانيا قبل 1/1/2026\n   (تذكرة، ختم، فاتورة، تقرير طبي...)\n3️⃣ دليل الإقامة لمدة 5 أشهر\n4️⃣ شهادة السوابق من بلدك",
      "📋 دابا ابعثلنا الوثائق الأساسية:\n\n1️⃣ جواز السفر كامل (PDF)\n2️⃣ دليل أنك كنت في اسبانيا قبل 1/1/2026\n   (تذكرة، ختم، فاتورة، تقرير طبي...)\n3️⃣ دليل الإقامة 5 أشهر\n4️⃣ شهادة السوابق من بلادك",
      "📋 Envoyez maintenant les documents de base :\n\n1️⃣ Passeport complet (PDF)\n2️⃣ Preuve de présence avant le 1/1/2026\n   (billet, tampon, facture, rapport médical...)\n3️⃣ Preuve de résidence de 5 mois\n4️⃣ Casier judiciaire de votre pays"
    ),
    inputType: "file",
    process: (_value, session) => ({
      nextStep: "ts_eligible",
      updates: { documents: [...session.documents, _value] },
    }),
  },

  ts_eligible: {
    id: "ts_eligible",
    message: t(
      "✅ الملف ديالك مؤهل مبدئياً!\n\n📌 معلومات مهمة:\n• غادي تاخد إذن مؤقت للخدمة\n• إجراء الترحيل غادي يتوقف تلقائياً\n• الإذن صالح لمدة عام\n• خاصك تطلب TIE فالشهر اللي بعد القبول\n• آخر أجل للتقديم: 30 يونيو 2026\n\nالملف غادي يتراجع خلال 24-48 ساعة.",
      "✅ ملفك مؤهل مبدئياً!\n\n📌 معلومات مهمة:\n• ستحصل على إذن مؤقت للعمل\n• سيتوقف إجراء الترحيل تلقائياً\n• الإذن صالح لمدة سنة واحدة\n• يجب طلب TIE خلال الشهر التالي للقبول\n• آخر أجل للتقديم: 30 يونيو 2026\n\nسيتم مراجعة ملفك خلال 24-48 ساعة.",
      "✅ الملف تاعك مؤهل مبدئياً!\n\n📌 معلومات مهمة:\n• غادي تاخد إذن مؤقت للخدمة\n• إجراء الترحيل غادي يتوقف أوتوماتيك\n• الإذن صالح لعام\n• لازم تطلب TIE في الشهر اللي بعد القبول\n• آخر أجل للتقديم: 30 جوان 2026\n\nالملف غادي يتراجع في 24-48 ساعة.",
      "✅ Votre dossier est pré-éligible !\n\n📌 Informations importantes :\n• Vous recevrez un permis de travail provisoire\n• La procédure d'expulsion sera suspendue automatiquement\n• L'autorisation est valable 1 an\n• Vous devrez demander la TIE dans le mois suivant l'approbation\n• Date limite de dépôt : 30 juin 2026\n\nVotre dossier sera examiné sous 24-48h."
    ),
    inputType: "buttons",
    options: [
      {
        label: t("متابعة للدفع 💳", "متابعة للدفع 💳", "متابعة للدفع 💳", "Continuer vers le paiement 💳"),
        value: "pay",
      },
    ],
    process: (_value, session) => ({
      nextStep: session.plan === "premium" ? "service_tier" : "payment",
      updates: { status: "eligible" as const },
    }),
  },

  // ════════════════════════════════════════════════════════════
  //  PREMIUM: SERVICE TIER SELECTION (3-level monetization)
  // ════════════════════════════════════════════════════════════
  service_tier: {
    id: "service_tier",
    message: t(
      "🎯 مبروك! الملف ديالك مؤهل.\n\nختار مستوى الخدمة اللي بغيتي:\n\n1️⃣ تقييم أولي — 19€\nتحليل أولي للملف + تقرير مبسط\n\n2️⃣ فتح ملف — 79€\nتقييم + مراجعة قانونية + تنظيم الوثائق\n\n3️⃣ تسوية كاملة — 399€\nكل شيء: المراجعة + التقديم + المتابعة حتى النهاية",
      "🎯 مبروك! ملفك مؤهل.\n\nاختر مستوى الخدمة:\n\n1️⃣ تقييم أولي — 19€\nتحليل أولي للملف + تقرير مبسط\n\n2️⃣ فتح ملف — 79€\nتقييم + مراجعة قانونية + تنظيم الوثائق\n\n3️⃣ تسوية كاملة — 399€\nكل شيء: المراجعة + التقديم + المتابعة حتى النهاية",
      "🎯 مبروك! الملف تاعك مؤهل.\n\nاختار مستوى الخدمة:\n\n1️⃣ تقييم أولي — 19€\nتحليل أولي للملف + تقرير مبسط\n\n2️⃣ فتح ملف — 79€\nتقييم + مراجعة قانونية + تنظيم الوثائق\n\n3️⃣ تسوية كاملة — 399€\nكلش: المراجعة + التقديم + المتابعة حتى النهاية",
      "🎯 Félicitations ! Votre dossier est éligible.\n\nChoisissez votre niveau de service :\n\n1️⃣ Pré-évaluation — 19€\nAnalyse initiale + rapport simplifié\n\n2️⃣ Ouverture de dossier — 79€\nÉvaluation + révision juridique + organisation des documents\n\n3️⃣ Traitement complet — 399€\nTout inclus : révision + dépôt + suivi jusqu'à la fin"
    ),
    inputType: "buttons",
    options: [
      { label: t("تقييم أولي — 19€", "تقييم أولي — 19€", "تقييم أولي — 19€", "Pré-évaluation — 19€"), value: "pre_eval" },
      { label: t("فتح ملف — 79€ ⭐", "فتح ملف — 79€ ⭐", "فتح ملف — 79€ ⭐", "Ouverture dossier — 79€ ⭐"), value: "file_opening" },
      { label: t("تسوية كاملة — 399€ 🔥", "تسوية كاملة — 399€ 🔥", "تسوية كاملة — 399€ 🔥", "Traitement complet — 399€ 🔥"), value: "full_processing" },
    ],
    process: (value, session) => {
      const prices: Record<string, number> = { pre_eval: 19, file_opening: 79, full_processing: 399 };
      return {
        nextStep: "premium_payment",
        updates: {
          serviceTier: value as ClientSession["serviceTier"],
          amountPaid: prices[value] || 0,
          answers: { ...session.answers, service_tier: value },
        },
      };
    },
  },

  // ════════════════════════════════════════════════════════════
  //  PREMIUM: ENHANCED PAYMENT (Stripe-like)
  // ════════════════════════════════════════════════════════════
  premium_payment: {
    id: "premium_payment",
    message: t(
      "💳 ملخص الطلب:\n━━━━━━━━━━━━━━━━\n📋 الخدمة: {{tier}}\n💰 المبلغ: {{amount}}€\n━━━━━━━━━━━━━━━━\n\n🏦 تحويل بنكي:\nIBAN: ES23 0182 8149 7102 0193 8018\n\n📱 Bizum: 612 491 755\n\n⚠️ صيفط الإيصال + سميتك على واتساب:\n📲 +34 747 498 536",
      "💳 ملخص الطلب:\n━━━━━━━━━━━━━━━━\n📋 الخدمة: {{tier}}\n💰 المبلغ: {{amount}}€\n━━━━━━━━━━━━━━━━\n\n🏦 تحويل بنكي:\nIBAN: ES23 0182 8149 7102 0193 8018\n\n📱 Bizum: 612 491 755\n\n⚠️ أرسل الإيصال + اسمك على واتساب:\n📲 +34 747 498 536",
      "💳 ملخص الطلب:\n━━━━━━━━━━━━━━━━\n📋 الخدمة: {{tier}}\n💰 المبلغ: {{amount}}€\n━━━━━━━━━━━━━━━━\n\n🏦 تحويل بنكي:\nIBAN: ES23 0182 8149 7102 0193 8018\n\n📱 Bizum: 612 491 755\n\n⚠️ ابعث الإيصال + اسمك على واتساب:\n📲 +34 747 498 536",
      "💳 Resume de la commande :\n━━━━━━━━━━━━━━━━\n📋 Service : {{tier}}\n💰 Montant : {{amount}}€\n━━━━━━━━━━━━━━━━\n\n🏦 Virement :\nIBAN : ES23 0182 8149 7102 0193 8018\n\n📱 Bizum : 612 491 755\n\n⚠️ Envoyez le recu + votre nom par WhatsApp :\n📲 +34 747 498 536"
    ),
    inputType: "buttons",
    options: [
      { label: t("💳 ادفع دابا", "💳 ادفع الآن", "💳 ادفع دابا", "💳 Payer maintenant"), value: "paid" },
    ],
    process: (_value, session) => ({
      nextStep: session.serviceTier === "pre_eval" ? "premium_upsell" : "case_summary",
      updates: { paymentStatus: "paid" as const },
    }),
  },

  // ════════════════════════════════════════════════════════════
  //  PREMIUM: UPSELL (if they chose pre_eval, suggest upgrade)
  // ════════════════════════════════════════════════════════════
  premium_upsell: {
    id: "premium_upsell",
    message: t(
      "✅ تم الدفع!\n\nتقريرك الأولي غادي يوصلك خلال 24 ساعة.\n\n💡 هل تعرف؟ مع خدمة «التسوية الكاملة» كنتكلفو بكلشي من الألف للياء.\n\nبغيتي تنقل للخدمة الكاملة؟ غادي نحسبو ليك الفرق فقط (380€).",
      "✅ تم الدفع!\n\nتقريرك الأولي سيصلك خلال 24 ساعة.\n\n💡 هل تعلم؟ مع خدمة «التسوية الكاملة» نتكفل بكل شيء من الألف إلى الياء.\n\nهل تريد الانتقال للخدمة الكاملة؟ سنحسب لك الفرق فقط (380€).",
      "✅ تم الدفع!\n\nتقريرك الأولي غادي يوصلك في 24 ساعة.\n\n💡 واش تعرف؟ مع خدمة «التسوية الكاملة» نتكلفو بكلش من الألف للياء.\n\nتحب تنقل للخدمة الكاملة؟ نحسبولك الفرق برك (380€).",
      "✅ Paiement reçu !\n\nVotre rapport initial vous parviendra sous 24h.\n\n💡 Le saviez-vous ? Avec le service «Traitement complet», nous nous occupons de tout de A à Z.\n\nSouhaitez-vous passer au service complet ? Nous ne comptons que la différence (380€)."
    ),
    inputType: "buttons",
    options: [
      { label: t("نعم، نقلني للكاملة! 🔥", "نعم، انقلني للكاملة! 🔥", "نعم، نقلني للكاملة! 🔥", "Oui, passez-moi au complet ! 🔥"), value: "upgrade" },
      { label: t("لا شكرا، التقييم كافي", "لا شكراً، التقييم كافٍ", "لا شكرا، التقييم كافي", "Non merci, l'évaluation suffit"), value: "no" },
    ],
    process: (value, session) => {
      if (value === "upgrade") {
        return {
          nextStep: "case_summary",
          updates: {
            serviceTier: "full_processing" as const,
            amountPaid: 399,
            answers: { ...session.answers, upsell: "accepted" },
          },
        };
      }
      return { nextStep: "case_summary", updates: { answers: { ...session.answers, upsell: "declined" } } };
    },
  },

  // ════════════════════════════════════════════════════════════
  //  PREMIUM: AUTO CASE SUMMARY
  // ════════════════════════════════════════════════════════════
  case_summary: {
    id: "case_summary",
    message: t(
      "📊 ملخص الملف التلقائي:\n━━━━━━━━━━━━━━━━━━━━━━\n👤 الاسم: {{name}}\n📞 الهاتف: {{phone}}\n⚖️ المسار: {{pathway}}\n📋 الشرط الإضافي: {{additional}}\n📎 الوثائق: {{docs}} ملف(ات)\n💳 الدفع: {{payment}}\n━━━━━━━━━━━━━━━━━━━━━━\n\n✅ تم إنشاء الملخص تلقائياً وإرساله للفريق القانوني.",
      "📊 ملخص الملف التلقائي:\n━━━━━━━━━━━━━━━━━━━━━━\n👤 الاسم: {{name}}\n📞 الهاتف: {{phone}}\n⚖️ المسار: {{pathway}}\n📋 الشرط الإضافي: {{additional}}\n📎 الوثائق: {{docs}} ملف(ات)\n💳 الدفع: {{payment}}\n━━━━━━━━━━━━━━━━━━━━━━\n\n✅ تم إنشاء الملخص تلقائياً وإرساله للفريق القانوني.",
      "📊 ملخص الملف الأوتوماتيكي:\n━━━━━━━━━━━━━━━━━━━━━━\n👤 الاسم: {{name}}\n📞 التليفون: {{phone}}\n⚖️ المسار: {{pathway}}\n📋 الشرط الإضافي: {{additional}}\n📎 الوثائق: {{docs}} ملف(ات)\n💳 الدفع: {{payment}}\n━━━━━━━━━━━━━━━━━━━━━━\n\n✅ تم إنشاء الملخص أوتوماتيكياً وتبعث للفريق القانوني.",
      "📊 Résumé automatique du dossier :\n━━━━━━━━━━━━━━━━━━━━━━\n👤 Nom : {{name}}\n📞 Téléphone : {{phone}}\n⚖️ Voie : {{pathway}}\n📋 Condition supplémentaire : {{additional}}\n📎 Documents : {{docs}} fichier(s)\n💳 Paiement : {{payment}}\n━━━━━━━━━━━━━━━━━━━━━━\n\n✅ Résumé généré automatiquement et envoyé à l'équipe juridique."
    ),
    inputType: "buttons",
    options: [
      { label: t("تمام ✅", "حسناً ✅", "مليح ✅", "Compris ✅"), value: "ok" },
    ],
    process: () => ({
      nextStep: "recovery_info",
    }),
  },

  // ════════════════════════════════════════════════════════════
  //  PREMIUM: RECOVERY / FOLLOW-UP INFO
  // ════════════════════════════════════════════════════════════
  recovery_info: {
    id: "recovery_info",
    message: t(
      "🔔 تذكير: غادي نبعثو ليك رسائل متابعة أوتوماتيكية:\n\n⏰ بعد 24 ساعة: تحديث حالة الملف\n⏰ بعد 48 ساعة: إلا ناقص شي وثيقة\n⏰ بعد 7 أيام: تحديث تقدم الإجراءات\n\nما تنسوناش تشوفو الرسائل! 📩\n\nشكرا بزاف على ثقتك! 🤝",
      "🔔 تنبيه: سنرسل لك رسائل متابعة تلقائية:\n\n⏰ بعد 24 ساعة: تحديث حالة الملف\n⏰ بعد 48 ساعة: إذا نقصت وثيقة\n⏰ بعد 7 أيام: تحديث تقدم الإجراءات\n\nلا تنسَ متابعة رسائلنا! 📩\n\nشكراً جزيلاً على ثقتك! 🤝",
      "🔔 تذكير: غادي نبعثولك رسائل متابعة أوتوماتيكية:\n\n⏰ بعد 24 ساعة: تحديث حالة الملف\n⏰ بعد 48 ساعة: إلا ناقص شي وثيقة\n⏰ بعد 7 أيام: تحديث تقدم الإجراءات\n\nما تنساش تشوف الرسائل! 📩\n\nشكرا بزاف على ثقتك! 🤝",
      "🔔 Rappel : nous vous enverrons des messages de suivi automatiques :\n\n⏰ Après 24h : mise à jour de l'état du dossier\n⏰ Après 48h : si un document manque\n⏰ Après 7 jours : mise à jour de l'avancement\n\nN'oubliez pas de consulter nos messages ! 📩\n\nMerci beaucoup pour votre confiance ! 🤝"
    ),
    inputType: "none",
    process: () => ({ nextStep: "recovery_info", updates: { status: "completed" as const } }),
  },

  // ════════════════════════════════════════════════════════════
  //  STANDARD: PAYMENT
  // ════════════════════════════════════════════════════════════
  payment: {
    id: "payment",
    message: t(
      "💳 باش نبداو الإجراءات، خلص رسوم الخدمة:\n\n🏦 تحويل بنكي:\nIBAN: ES23 0182 8149 7102 0193 8018\n\n📱 Bizum: 612 491 755\n\n⚠️ من بعد الدفع صيفط الإيصال مع سميتك على:\n📲 واتساب: +34 747 498 536\n\nمن بعد التأكيد غادي نتواصلو معاك مباشرة.",
      "💳 لبدء الإجراءات، ادفع رسوم الخدمة:\n\n🏦 تحويل بنكي:\nIBAN: ES23 0182 8149 7102 0193 8018\n\n📱 Bizum: 612 491 755\n\n⚠️ بعد الدفع أرسل الإيصال مع اسمك إلى:\n📲 واتساب: +34 747 498 536\n\nبعد التأكيد سنتواصل معك مباشرة.",
      "💳 باش نبداو الإجراءات، خلص رسوم الخدمة:\n\n🏦 تحويل بنكي:\nIBAN: ES23 0182 8149 7102 0193 8018\n\n📱 Bizum: 612 491 755\n\n⚠️ بعد الدفع ابعث الإيصال مع اسمك على:\n📲 واتساب: +34 747 498 536\n\nبعد التأكيد نتواصلو معاك مباشرة.",
      "💳 Pour demarrer les demarches, payez les frais :\n\n🏦 Virement bancaire :\nIBAN : ES23 0182 8149 7102 0193 8018\n\n📱 Bizum : 612 491 755\n\n⚠️ Apres le paiement, envoyez le recu avec votre nom a :\n📲 WhatsApp : +34 747 498 536\n\nApres confirmation, nous vous contacterons."
    ),
    inputType: "buttons",
    options: [
      { label: t("خلصت ✅", "تم الدفع ✅", "خلصت ✅", "J'ai payé ✅"), value: "paid" },
    ],
    process: (_value, _session) => ({
      nextStep: "complete",
      updates: { paymentStatus: "paid" as const },
    }),
  },

  // ════════════════════════════════════════════════════════════
  //  TERMINAL STATES
  // ════════════════════════════════════════════════════════════
  complete: {
    id: "complete",
    message: t(
      "🎉 شكرا بزاف!\n\nتم استلام ملفك بنجاح. فريقنا القانوني غادي يراجعه خلال 24-48 ساعة وغادي يتواصل معاك.\n\nإلا عندك أي سؤال راسلنا مباشرة. 📩",
      "🎉 شكراً جزيلاً!\n\nتم استلام ملفك بنجاح. فريقنا القانوني سيراجعه خلال 24-48 ساعة وسيتواصل معك.\n\nإذا لديك أي سؤال راسلنا مباشرة. 📩",
      "🎉 شكرا بزاف!\n\nتم استلام ملفك بنجاح. فريقنا القانوني غادي يراجعه في 24-48 ساعة ويتواصل معاك.\n\nإلا عندك أي سؤال راسلنا مباشرة. 📩",
      "🎉 Merci beaucoup !\n\nVotre dossier a bien été reçu. Notre équipe juridique l'examinera sous 24-48h et vous contactera.\n\nPour toute question, écrivez-nous directement. 📩"
    ),
    inputType: "none",
    process: () => ({ nextStep: "complete", updates: { status: "completed" as const } }),
  },

  not_eligible_not_in_spain: {
    id: "not_eligible_not_in_spain",
    message: t(
      "⚠️ خاصك تكون داخل إسبانيا باش تقدر تقدم هاد الطلب.\n\nإلا تبدل وضعك، راسلنا وغادي نعاونوك. 🤝",
      "⚠️ يجب أن تكون داخل إسبانيا لتقديم هذا الطلب.\n\nإذا تغيّر وضعك، راسلنا وسنساعدك. 🤝",
      "⚠️ لازم تكون في اسبانيا باش تقدر تقدم هاد الطلب.\n\nإلا تبدل وضعك، راسلنا ونعاونوك. 🤝",
      "⚠️ Vous devez être en Espagne pour déposer cette demande.\n\nSi votre situation change, contactez-nous. 🤝"
    ),
    inputType: "none",
    process: () => ({ nextStep: "not_eligible_not_in_spain" }),
  },

  not_eligible_date: {
    id: "not_eligible_date",
    message: t(
      "⚠️ حسب الشروط الحالية، ما يمكنكش تستافد من التسوية الجماعية حيث خاصك تكون فإسبانيا قبل 01/01/2026.\n\nإلا عندك حالة خاصة، راسلنا. 🤝",
      "⚠️ حسب الشروط الحالية، لا يمكنك الاستفادة من التسوية الجماعية لأنه يجب التواجد في إسبانيا قبل 01/01/2026.\n\nإذا لديك حالة خاصة، راسلنا. 🤝",
      "⚠️ حسب الشروط الحالية، ما تقدرش تستافد من التسوية الجماعية لأنه لازم تكون في اسبانيا قبل 01/01/2026.\n\nإلا عندك حالة خاصة، راسلنا. 🤝",
      "⚠️ Selon les conditions actuelles, vous ne pouvez pas bénéficier de la régularisation car il faut avoir été en Espagne avant le 01/01/2026.\n\nSi vous avez un cas particulier, contactez-nous. 🤝"
    ),
    inputType: "none",
    process: () => ({ nextStep: "not_eligible_date" }),
  },

  not_eligible_yet: {
    id: "not_eligible_yet",
    message: t(
      "⏳ ما يمكنكش تقدم الطلب دابا. تقدر تقدمو ملي تكمل 5 شهور ديال الإقامة.\n\nراسلنا فداك الوقت وغادي نعاونوك! 💪",
      "⏳ لا يمكنك التقديم بعد. يمكنك التقديم عندما تكمل 5 أشهر من الإقامة.\n\nراسلنا حينها وسنساعدك! 💪",
      "⏳ ما تقدرش تقدم الطلب دابا. تقدر تقدمو كي تكمل 5 أشهر ديال الإقامة.\n\nراسلنا وقتها ونعاونوك! 💪",
      "⏳ Vous ne pouvez pas encore déposer la demande. Vous pourrez le faire une fois les 5 mois de résidence accomplis.\n\nContactez-nous à ce moment-là ! 💪"
    ),
    inputType: "none",
    process: () => ({ nextStep: "not_eligible_yet" }),
  },

  refer_human_criminal: {
    id: "refer_human_criminal",
    message: t(
      "⚖️ الحالة ديالك كتحتاج مراجعة قانونية خاصة بسبب السوابق العدلية.\n\nغادي يتواصل معاك مستشار قانوني مباشرة باش يدرس حالتك بالتفصيل. 📞",
      "⚖️ حالتك تحتاج مراجعة قانونية خاصة بسبب السوابق الجنائية.\n\nسيتواصل معك مستشار قانوني مباشرة لدراسة حالتك بالتفصيل. 📞",
      "⚖️ الحالة تاعك تحتاج مراجعة قانونية خاصة بسبب السوابق القضائية.\n\nغادي يتواصل معاك مستشار قانوني مباشرة باش يدرس حالتك بالتفصيل. 📞",
      "⚖️ Votre cas nécessite un examen juridique spécial en raison du casier judiciaire.\n\nUn conseiller juridique vous contactera directement pour étudier votre dossier en détail. 📞"
    ),
    inputType: "none",
    process: () => ({ nextStep: "refer_human_criminal" }),
  },

  refer_human_ban: {
    id: "refer_human_ban",
    message: t(
      "⚖️ الحالة ديالك كتحتاج مراجعة قانونية خاصة بسبب منع الدخول.\n\nغادي يتواصل معاك مستشار قانوني مباشرة. 📞",
      "⚖️ حالتك تحتاج مراجعة قانونية خاصة بسبب منع الدخول.\n\nسيتواصل معك مستشار قانوني مباشرة. 📞",
      "⚖️ الحالة تاعك تحتاج مراجعة قانونية خاصة بسبب منع الدخول.\n\nغادي يتواصل معاك مستشار قانوني مباشرة. 📞",
      "⚖️ Votre cas nécessite un examen juridique spécial en raison de l'interdiction d'entrée.\n\nUn conseiller juridique vous contactera directement. 📞"
    ),
    inputType: "none",
    process: () => ({ nextStep: "refer_human_ban" }),
  },

  refer_human_noreturn: {
    id: "refer_human_noreturn",
    message: t(
      "⚖️ الحالة ديالك كتحتاج مراجعة خاصة بسبب تعهد عدم الرجوع.\n\nغادي يتواصل معاك مستشار قانوني. 📞",
      "⚖️ حالتك تحتاج مراجعة خاصة بسبب تعهد عدم العودة.\n\nسيتواصل معك مستشار قانوني. 📞",
      "⚖️ الحالة تاعك تحتاج مراجعة خاصة بسبب تعهد عدم الرجوع.\n\nغادي يتواصل معاك مستشار قانوني. 📞",
      "⚖️ Votre cas nécessite un examen spécial en raison de l'engagement de non-retour.\n\nUn conseiller juridique vous contactera. 📞"
    ),
    inputType: "none",
    process: () => ({ nextStep: "refer_human_noreturn" }),
  },
};

export function getStep(id: string): FlowStep | undefined {
  return flowSteps[id];
}
