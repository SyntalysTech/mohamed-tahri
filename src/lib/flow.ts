import { ClientSession, FlowStep, Translations } from "./types";

const t = (darija: string, ar: string, dz: string, fr: string): Translations => ({
  darija,
  ar,
  dz,
  fr,
});

export const steps: Record<string, FlowStep> = {
  // ════════════════════════════════════════════════════════════
  //  0. ENTRADA Y ONBOARDING
  // ════════════════════════════════════════════════════════════
  welcome: {
    id: "welcome",
    message: t(
      "السلام عليكم! 👋 مرحبا بيك فـ Asesoría MRT.\n\nحنا هنا باش نعاونوك فكل ما يخص الإقامة فإسبانيا 🇪🇸 بطريقة ساهلة ومضمونة.\n\nطبيعة الحال، هاد المحادثة سرية 100%.",
      "السلام عليكم! 👋 أهلاً بك في Asesoría MRT.\n\nنحن هنا لمساعدتك في كل ما يتعلق بالإقامة في إسبانيا 🇪🇸 بطريقة سهلة ومضمونة.\n\nبطبيعة الحال، هذه المحادثة سرية 100%.",
      "السلام عليكم! 👋 مرحبا بيك في Asesoría MRT.\n\nرانا هنا باش نعاونوك في كلش واش يخص الإقامة في اسبانيا 🇪🇸 بطريقة ساهلة ومضمونة.\n\nأكيد، هاد المحادثة سرية 100%.",
      "Bonjour ! 👋 Bienvenue chez Asesoría MRT.\n\nNous sommes là pour vous aider dans toutes vos démarches d'immigration en Espagne 🇪🇸 de manière simple.\n\nBien sûr, cette conversation est 100% confidentielle."
    ),
    inputType: "buttons",
    options: [
      { label: t("متابعة / Continuer ✅", "متابعة ✅", "متابعة ✅", "Continuer ✅"), value: "continue" },
    ],
    process: (value, session) => ({
      nextStep: "language",
    }),
  },

  language: {
    id: "language",
    message: t(
      "بأشمن لغة بغيتي نهضرو؟",
      "بأي لغة تفضل التحدث؟",
      "بأشمن لغة تحب نهضرو؟",
      "Dans quelle langue souhaitez-vous parler ?"
    ),
    inputType: "buttons",
    options: [
      { label: t("الدارجة المغربية 🇲🇦", "الدارجة المغربية 🇲🇦", "الدارجة المغربية 🇲🇦", "Darija Marocaine 🇲🇦"), value: "darija" },
      { label: t("العربية الفصحى 🇸🇦", "العربية الفصحى 🇸🇦", "العربية الفصحى 🇸🇦", "Arabe Classique 🇸🇦"), value: "ar" },
      { label: t("الدارجة الدزيرية 🇩🇿", "الدارجة الدزيرية 🇩🇿", "الدارجة الدزيرية 🇩🇿", "Algérien 🇩🇿"), value: "dz" },
      { label: t("الفرنسية 🇫🇷", "الفرنسية 🇫🇷", "الفرنسية 🇫🇷", "Français 🇫🇷"), value: "fr" },
    ],
    process: (value, session) => ({
      nextStep: "disclaimer",
      updates: { language: value as any },
    }),
  },

  disclaimer: {
    id: "disclaimer",
    message: t(
      "⚠️ تنبيه: هاد السيستيم هو أداة ذكية كتعاون المحامين ديالنا باش يدرسو ملفك بالزربة. كلشي غيتم مراجعته من طرف خبير بشري قبل أي إجراء قانوني.\n\nواش موافق على معالجة المعلومات ديالك لهاد الغرض؟",
      "⚠️ تنبيه: هذا النظام هو أداة ذكية تساعد محامينا في تقييم ملفك بسرعة. ستتم مراجعة كل شيء من قبل خبير بشري قبل أي إجراء قانوني.\n\nهل توافق على معالجة بياناتك لهذا الغرض؟",
      "⚠️ تنبيه: هاد السيستيم أداة ذكية تعاون المحامين تاعنا باش يدرسو الدوسي ديالك بالزربة. كلش يتراجع من طرف خبير قبل أي إجراء.\n\nواش موافق على معالجة معلوماتك لهاد الغرض؟",
      "⚠️ Avertissement : Ce système est un outil intelligent qui aide nos avocats à évaluer votre dossier rapidement. Tout sera revu par un expert humain.\n\nAcceptez-vous le traitement de vos données à cette fin ?"
    ),
    inputType: "buttons",
    options: [
      { label: t("موافق ✅", "أوافق ✅", "موافق ✅", "J'accepte ✅"), value: "yes" },
    ],
    process: () => ({ nextStep: "name" }),
  },

  name: {
    id: "name",
    message: t(
      "مزيان، باش نقدرو نتواصلو معاك أحسن، شنو سميتك؟",
      "ممتاز، لكي نتواصل معك بشكل أفضل، ما هو اسمك الكريم؟",
      "مليح، باش نقدرو نهضرو معاك غاية، واش اسمك؟",
      "Super, pour mieux communiquer, quel est votre prénom ?"
    ),
    inputType: "text",
    process: (value, session) => ({
      nextStep: "topic_choice",
      updates: { name: value },
    }),
  },

  // ════════════════════════════════════════════════════════════
  //  1. MENÚ PRINCIPAL
  // ════════════════════════════════════════════════════════════
  topic_choice: {
    id: "topic_choice",
    message: t(
      "متشرفين! أشنو هو نوع الإجراء لي بغيتي تسول عليه؟",
      "تشرفنا! ما هو نوع الإجراء الذي ترغب في الاستفسار عنه؟",
      "متشرفين! واش هو الإجراء لي راك تحوس عليه؟",
      "Enchanté ! Quelle démarche d'immigration souhaitez-vous effectuer ?"
    ),
    inputType: "buttons",
    options: [
      { label: t("1️⃣ التسوية الاستثنائية / Arraigo", "1️⃣ التسوية الاستثنائية / Arraigo", "1️⃣ التسوية الاستثنائية / Arraigo", "1️⃣ Régularisation / Arraigo"), value: "arraigo" },
      { label: t("2️⃣ تجديد الإقامة", "2️⃣ تجديد الإقامة", "2️⃣ تجديد الإقامة", "2️⃣ Renouvellement de titre"), value: "renovacion" },
      { label: t("3️⃣ التجمع العائلي", "3️⃣ التجمع العائلي", "3️⃣ التجمع العائلي", "3️⃣ Regroupement familial"), value: "reagrupacion" },
      { label: t("4️⃣ الجنسية الإسبانية", "4️⃣ الجنسية الإسبانية", "4️⃣ الجنسية الإسبانية", "4️⃣ Nationalité Espagnole"), value: "nacionalidad" },
      { label: t("5️⃣ الإقامة للدراسة", "5️⃣ الإقامة للدراسة", "5️⃣ الإقامة للدراسة", "5️⃣ Séjour étudiant"), value: "estudios" },
      { label: t("6️⃣ تغيير نوع الإقامة", "6️⃣ تغيير نوع الإقامة", "6️⃣ تغيير نوع الإقامة", "6️⃣ Changement de statut"), value: "modificacion" },
      { label: t("7️⃣ طعن فرفض (Recurso)", "7️⃣ طعن فرفض (Recurso)", "7️⃣ طعن فرفض (Recurso)", "7️⃣ Recours contre un refus"), value: "recurso" },
      { label: t("8️⃣ ما متأكدش / سؤال آخر", "8️⃣ غير متأكد / سؤال آخر", "8️⃣ راني حاير / سؤال آخر", "8️⃣ Pas sûr / Autre"), value: "duda" },
    ],
    process: (value, session) => {
      const mapping: Record<string, string> = {
        arraigo: "arraigo_asylum",
        renovacion: "ren_tipo",
        reagrupacion: "rea_familiar",
        nacionalidad: "nac_anos",
        estudios: "est_lugar",
        modificacion: "mod_actual",
        recurso: "rec_tipo",
        duda: "duda_explica"
      };
      return {
        nextStep: mapping[value] || "duda_explica",
        updates: { answers: { ...session.answers, topic: value } }
      };
    },
  },

  // ════════════════════════════════════════════════════════════
  //  MODULO 1: ARRAIGO / REGULARIZACIÓN
  // ════════════════════════════════════════════════════════════
  arraigo_asylum: {
    id: "arraigo_asylum",
    message: t(
      "بخصوص التسوية، واش قدمتي طلب لجوء (حماية دولية) قبل 1 يناير 2026؟",
      "بخصوص التسوية، هل قدمت طلب حماية دولية (لجوء) قبل 1 يناير 2026؟",
      "بخصوص التسوية، واش درت دوموند تاع اللجوء (حماية دولية) قبل 1 جانفي 2026؟",
      "Concernant la régularisation, avez-vous déposé une demande d'asile avant le 1er janvier 2026 ?"
    ),
    inputType: "buttons",
    options: [
      { label: t("نعم ✅", "نعم ✅", "نعم ✅", "Oui ✅"), value: "yes" },
      { label: t("لا ❌", "لا ❌", "لا ❌", "Non ❌"), value: "no" },
      { label: t("ما نعرفش ❓", "لا أعرف ❓", "ما نعرفش ❓", "Je ne sais pas ❓"), value: "unknown" },
    ],
    process: (value, session) => {
      if (value === "yes") {
        return { nextStep: "arr_spain", updates: { pathway: "quinta", answers: { ...session.answers, asylum: "yes" } } };
      } else if (value === "unknown") {
        return { nextStep: "refer_human", updates: { status: "referred", answers: { ...session.answers, asylum: "unknown" } } };
      }
      return { nextStep: "arr_spain", updates: { pathway: "sexta", answers: { ...session.answers, asylum: "no" } } };
    },
  },

  arr_spain: {
    id: "arr_spain",
    message: t(
      "واش نتا دابا فإسبانيا؟ 🇪🇸",
      "هل أنت متواجد حالياً داخل إسبانيا؟ 🇪🇸",
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
        return { nextStep: "not_eligible_not_in_spain", updates: { status: "not_eligible", answers: { ...session.answers, in_spain: "no" } } };
      }
      return { nextStep: "arr_criminal", updates: { answers: { ...session.answers, in_spain: "yes" } } };
    },
  },

  arr_criminal: {
    id: "arr_criminal",
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
        return { nextStep: "refer_human", updates: { status: "referred", answers: { ...session.answers, criminal: value } } };
      }
      return { nextStep: "arr_five_months", updates: { answers: { ...session.answers, criminal: "no" } } };
    },
  },

  arr_five_months: {
    id: "arr_five_months",
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
    ],
    process: (value, session) => {
      if (value === "no") {
        return { nextStep: "not_eligible_date", updates: { status: "not_eligible", answers: { ...session.answers, five_months: "no" } } };
      }
      if (session.pathway === "quinta") {
        return { nextStep: "arr_docs", updates: { answers: { ...session.answers, five_months: "yes" } } };
      }
      // Sexta conditional
      return { nextStep: "arr_sexta_requirement", updates: { answers: { ...session.answers, five_months: "yes" } } };
    },
  },

  arr_sexta_requirement: {
    id: "arr_sexta_requirement",
    message: t(
      "بالنسبة لتسوية الأوراق العادية، خاصك تحقق واحد من هاد الشروط:\n\n1️⃣ خدمة: خدمتي ولا عندك عقد عمل\n2️⃣ عائلة: كتعيش مع أسرتك\n3️⃣ وضعية هشاشة: مقيم بدون ورقة\n\nأشمن حالة نتا؟",
      "بالنسبة للوضع القانوني العام، يجب تحقيق شرط من الشروط:\n\n1️⃣ عمل: عملت سابقاً أو لديك عقد\n2️⃣ أسرة: تقيم مع عائلتك هنا\n3️⃣ هشاشة: مقيم بوضع غير نظامي\n\nما هو وضعك؟",
      "بالنسبة لتسوية الكواغط، لازم تكون عندك حاجة من هادو:\n\n1️⃣ خدمة: خدمت ولا عندك عقد\n2️⃣ عائلة: تسكن مع فاميلتك هنا\n3️⃣ هشاشة: عايش بلا وراق\n\nوش هي الحالة تاعك؟",
      "Pour la régularisation générale, vous devez remplir une condition :\n\n1️⃣ Travail : Vous avez travaillé ou avez un contrat\n2️⃣ Famille : Vous vivez avec votre famille ici\n3️⃣ Vulnérabilité : Sans papiers\n\nQuel est votre cas ?"
    ),
    inputType: "buttons",
    options: [
      { label: t("خدمة / عقد 💼", "عمل / عقد 💼", "خدمة / عقد 💼", "Travail 💼"), value: "work" },
      { label: t("عائلة 👨‍👩‍👧‍👦", "عائلة 👨‍👩‍👧‍👦", "عائلة 👨‍👩‍👧‍👦", "Famille 👨‍👩‍👧‍👦"), value: "family" },
      { label: t("بدون أوراق / هشاشة 🤝", "بدون أوراق (هشاشة) 🤝", "حراڤ (هشاشة) 🤝", "Sans papiers 🤝"), value: "vulnerability" },
    ],
    process: (value, session) => {
      return { nextStep: "arr_docs", updates: { answers: { ...session.answers, sexta_req: value } } };
    },
  },

  arr_docs: {
    id: "arr_docs",
    message: t(
      "مزيان! 📎 دابا خاصك تصور لينا أو تصيفط جواز السفر ديالك (الپاسپور) كامل، وأي وثائق كتدعم ملفك (بحال طلب اللجوء، بادرون، أوراق الخدمة).\n\nصيفط الملفات واحد بواحد:",
      "ممتاز! 📎 الآن أرسل لنا جواز سفرك كاملاً، وأي وثائق تدعم ملفك (مثل طلب اللجوء، التسجيل السكني، إثبات العمل).\n\nأرسل الملفات واحداً تلو الآخر:",
      "مليح! 📎 دركا لازم تصور ولا تبعثنا الباسپور تاعك كامل، وأي كواغط تزيدها (كيما طلب اللجوء، بادرون، خدمت).\n\nابعث الملفات وحدة بوحدة:",
      "Parfait ! 📎 Envoyez maintenant votre passeport complet et tout document justificatif (asile, padrón, travail).\n\nEnvoyez les fichiers un par un :"
    ),
    inputType: "file",
    process: (_value, session) => ({
      nextStep: "eligible_checkout",
      updates: { documents: [...session.documents, _value] },
    }),
  },


  // ════════════════════════════════════════════════════════════
  //  MODULO 2: RENOVACIONES
  // ════════════════════════════════════════════════════════════
  ren_tipo: {
    id: "ren_tipo",
    message: t(
      "شنو نوع الإقامة اللي بغيتي تجدد؟",
      "ما هو نوع الإقامة التي ترغب بتجديدها؟",
      "واش هي الإقامة لي بغيت تجددها؟",
      "Quel type de résidence souhaitez-vous renouveler ?"
    ),
    inputType: "buttons",
    options: [
      { label: t("إقامة عمل / Arraigo", "إقامة عمل / Arraigo", "إقامة عمل / Arraigo", "Travail / Arraigo"), value: "trabajo" },
      { label: t("دراسة", "دراسة", "دراسة", "Études"), value: "estudios" },
      { label: t("طويلة الأمد / Larga duración", "طويلة الأمد", "طويلة الأمد", "Longue durée"), value: "larga" },
      { label: t("أخرى", "أخرى", "أخرى", "Autre"), value: "otro" },
    ],
    process: (value, session) => ({ nextStep: "ren_fecha", updates: { pathway: "renovacion", answers: { ...session.answers, ren_tipo: value } } })
  },

  ren_fecha: {
    id: "ren_fecha",
    message: t(
      "فوقاش كتموت (أو ماتت) الإقامة ديالك؟ (اكتب التاريخ)",
      "متى تنتهي (أو انتهت) صلاحية الإقامة؟ (اكتب التاريخ)",
      "وقتاش تموت (أو ماتت) الكارطة تاعك؟ (اكتب التاريخ)",
      "Quelle est la date d'expiration de votre résidence ?"
    ),
    inputType: "text",
    process: (value, session) => ({ nextStep: "ren_trabajo", updates: { answers: { ...session.answers, ren_fecha: value } } })
  },

  ren_trabajo: {
    id: "ren_trabajo",
    message: t(
      "واش راك خدام حاليا؟ (أو عندك مدخول؟)",
      "هل تعمل حالياً؟ (أو لديك دخل مادي؟)",
      "واش راك خدام دركا؟",
      "Travaillez-vous actuellement ?"
    ),
    inputType: "buttons",
    options: [
      { label: t("نعم ✅", "نعم ✅", "نعم ✅", "Oui ✅"), value: "yes" },
      { label: t("لا ❌", "لا ❌", "لا ❌", "Non ❌"), value: "no" },
    ],
    process: (value, session) => {
      // Simplificado: va a documentacion
      return { nextStep: "ren_docs", updates: { answers: { ...session.answers, ren_trabajo: value } } }
    }
  },

  ren_docs: {
    id: "ren_docs",
    message: t(
      "مزيان! 📎 صيفط لينا صورتي من الإقامة القديمة والپاسپور.\n\nصيفطهم لينا:",
      "ممتاز! 📎 أرسل لنا نسخة من إقامتك الحالية وجواز السفر.\n\nأرسلهم:",
      "مليح! 📎 ابعثلنا نسخة من الكارطة لقديمة والباسپور.\n\nابعثهم:",
      "Parfait ! 📎 Envoyez une copie de votre titre de séjour et passeport."
    ),
    inputType: "file",
    process: (_value, session) => ({
      nextStep: "eligible_checkout",
      updates: { documents: [...session.documents, _value] },
    }),
  },

  // ════════════════════════════════════════════════════════════
  //  MODULO 3: REAGRUPACIÓN
  // ════════════════════════════════════════════════════════════
  rea_familiar: {
    id: "rea_familiar",
    message: t(
      "شكون بغيتي تجمع معاك فإسبانيا؟",
      "من هو فرد العائلة الذي تريد إلحاقه بك في إسبانيا؟",
      "شكون حاب تلم الشمل معاه فإسبانيا؟",
      "Quel membre de la famille souhaitez-vous regrouper ?"
    ),
    inputType: "buttons",
    options: [
      { label: t("الزوج/الزوجة", "الزوج/الزوجة", "الزوج/الزوجة", "Époux/Épouse"), value: "conyuge" },
      { label: t("الأبناء", "الأبناء", "الأبناء", "Enfants"), value: "hijo" },
      { label: t("الوالدين", "الوالدين", "الوالدين", "Parents"), value: "ascendiente" },
    ],
    process: (value, session) => ({ nextStep: "rea_ingresos", updates: { pathway: "reagrupacion", answers: { ...session.answers, rea_familiar: value } } })
  },

  rea_ingresos: {
    id: "rea_ingresos",
    message: t(
      "واش عندك خدمة ثابتة ومدخول مناسب؟ (أقل حاجة 1200 أورو تقريبا للزوجين)",
      "هل لديك عمل ثابت ودخل كافٍ؟ (الأدنى حوالي 1200 يورو للزوجين)",
      "واش عندك خدمة ومدخول مليح؟ (مينيوم 1200 اورو)",
      "Avez-vous un revenu stable et suffisant ? (Min. 1200€ pour un couple)"
    ),
    inputType: "buttons",
    options: [
      { label: t("نعم ✅", "نعم ✅", "نعم ✅", "Oui ✅"), value: "yes" },
      { label: t("لا ❌", "لا ❌", "لا ❌", "Non ❌"), value: "no" },
    ],
    process: (value, session) => {
      if (value === "no") {
        return { nextStep: "refer_human", updates: { status: "referred", answers: { ...session.answers, rea_ingresos: value } } }
      }
      return { nextStep: "eligible_checkout", updates: { answers: { ...session.answers, rea_ingresos: value } } }
    }
  },

  // ════════════════════════════════════════════════════════════
  //  MODULO 4: NACIONALIDAD
  // ════════════════════════════════════════════════════════════
  nac_anos: {
    id: "nac_anos",
    message: t(
      "شحال دالسنوات عندك دالإقامة (قانونية) فإسبانيا متواصلة؟",
      "كم عدد سنوات إقامتك القانونية المستمرة في إسبانيا؟",
      "شحال من عام وأنت ساكن مريقل فإسبانيا؟",
      "Combien d'années de résidence légale en Espagne avez-vous ?"
    ),
    inputType: "buttons",
    options: [
      { label: t("أقل من سنة", "أقل من سنة", "أقل من سنة", "Moins d'un an"), value: "menos_1" },
      { label: t("سنة واحدة (مثلا زواج)", "سنة واحدة", "عام واحد (زواج..)", "Un an (Mariage..)"), value: "1" },
      { label: t("2 سنوات (دول أمريكا الجنوبية)", "سنتان", "عامين", "2 ans (Am. latine)"), value: "2" },
      { label: t("10 سنوات", "10 سنوات", "10 سنين", "10 ans"), value: "10" },
    ],
    process: (value, session) => ({ nextStep: "nac_exam", updates: { pathway: "nacionalidad", answers: { ...session.answers, nac_anos: value } } })
  },

  nac_exam: {
    id: "nac_exam",
    message: t(
      "واش دوزتي الامتحانات الإجبارية؟ (CCSE للثقافة، وDELE للغة إلا ما كنتيش من دولة ناطقة بالإسبانية)",
      "هل اجتزت الامتحانات الإجبارية للثقافة واللغة؟",
      "واش فوتّ ليزيكزاما تاع الثقافة واللغة الإسبانية؟",
      "Avez-vous réussi les examens de culture et langue espagnole ?"
    ),
    inputType: "buttons",
    options: [
      { label: t("نعم ✅", "نعم ✅", "نعم ✅", "Oui ✅"), value: "yes" },
      { label: t("مازال / لا ❌", "ليس بعد ❌", "مازال ❌", "Pas encore ❌"), value: "no" },
      { label: t("معفي (قريت فإسبانيا..)", "معفى", "معفي", "Dispensé"), value: "exento" },
    ],
    process: (value, session) => ({ nextStep: "eligible_checkout", updates: { answers: { ...session.answers, nac_exam: value } } })
  },

  // ════════════════════════════════════════════════════════════
  //  MODULOS 5 - 7 (Dudas y miscelánea)
  // ════════════════════════════════════════════════════════════
  est_lugar: {
    id: "est_lugar",
    message: t(
      "واش نتا دابا فإسبانيا ولا باقي فبلادك؟",
      "هل أنت متواجد في إسبانيا أم في بلدك؟",
      "واش راك هنا فإسبانيا ولا في بلادك؟",
      "Êtes-vous en Espagne ou dans votre pays ?"
    ),
    inputType: "buttons",
    options: [
      { label: t("إسبانيا 🇪🇸", "إسبانيا 🇪🇸", "إسبانيا 🇪🇸", "Espagne 🇪🇸"), value: "es" },
      { label: t("بلادي", "بلدي", "بلادي", "Mon pays"), value: "out" },
    ],
    process: (value, session) => ({ nextStep: "refer_human", updates: { pathway: "estudios", status: "referred", answers: { ...session.answers, est_lugar: value } } })
  },

  mod_actual: {
    id: "mod_actual",
    message: t(
      "شنو نوع الإقامة اللي عندك دابا؟",
      "ما نوع إقامتك الحالية؟",
      "واش الكارطة اللي عندك دركا؟",
      "Quel est votre statut actuel ?"
    ),
    inputType: "text",
    process: (value, session) => ({ nextStep: "refer_human", updates: { pathway: "modificacion", status: "referred", answers: { ...session.answers, mod_actual: value } } })
  },

  rec_tipo: {
    id: "rec_tipo",
    message: t(
      "مزيان، الطعن كيحتاج دراسة مزيانة. شنو ترفض ليك بالضبط؟",
      "حسناً، الطعن يحتاج لدراسة معمقة، ما هو الطلب الذي تم رفضه؟",
      "واش هو الشي لي ترفضلك؟",
      "Quel est le recours déposé ?"
    ),
    inputType: "text",
    process: (value, session) => ({ nextStep: "refer_human", updates: { pathway: "recurso", status: "referred", answers: { ...session.answers, rec_tipo: value } } })
  },

  duda_explica: {
    id: "duda_explica",
    message: t(
      "فهمتك، عافاك شرح ليا باختصار فاش بغيتي نعاونوك؟",
      "الرجاء شرح وضعك باختصار وسنساعدك.",
      "اشرحلنا الحالة تاعك باختصار وراح نعاونوك.",
      "Veuillez expliquer brièvement votre situation."
    ),
    inputType: "text",
    process: (value, session) => ({ nextStep: "refer_human", updates: { pathway: "otros", status: "referred", answers: { ...session.answers, duda: value } } })
  },


  // ════════════════════════════════════════════════════════════
  //  ENDINGS & PAYMENT (Checkout general)
  // ════════════════════════════════════════════════════════════

  eligible_checkout: {
    id: "eligible_checkout",
    message: t(
      "✅ بناءً على المعطيات، الملف ديالك عندو حظوظ كبيرة ويقدر يكون قابل للمعالجة من طرف المحامين ديالنا.\n\nباش نقدرو نفتحو الملف ونبدأو الخدمة قانونياً، خاص الأداء الأولي. المحامي غيتصل بيك في غضون 24 ساعة.",
      "✅ بناءً على المعطيات المبدئية، ملفك له فرص بالنجاح وقابل للمعالجة.\n\nلكي نبدأ العمل ونفتح الملف قانونياً، يجب دفع الرسوم. سيتصل بك المحامي خلال 24 ساعة.",
      "✅ على حساب واش قلتلنا، الدوسي نتاعك يمكن يتقبل وحنا نقابلوه.\n\nباش نفتحو الدوسي ونبداو الخدمة، لازم تخلص الرسوم الأولى. المحامي راح يعيطلكم في 24 ساعة.",
      "✅ D'après vos réponses, votre dossier semble éligible et nous pouvons le traiter.\n\nPour ouvrir et démarrer les démarches, le règlement initial est requis. Notre avocat vous contactera sous 24h."
    ),
    inputType: "buttons",
    options: [
      {
        label: t("متابعة للدفع 💳", "متابعة للدفع 💳", "متابعة للدفع 💳", "Continuer vers le paiement 💳"),
        value: "pay",
      },
      {
        label: t("الاستفسار أولا 💬", "الاستفسار أولا 💬", "نستفسر قبل 💬", "Poser une question 💬"),
        value: "ask",
      },
    ],
    process: (value, session) => {
      if (value === "ask") return { nextStep: "refer_human", updates: { status: "referred" } };
      return {
        nextStep: session.plan === "premium" ? "service_tier" : "payment",
        updates: { status: "eligible" },
      };
    },
  },

  not_eligible_not_in_spain: {
    id: "not_eligible_not_in_spain",
    message: t(
      "❌ للأسف، أغلب إجراءات الإقامة المبدئية (العادية والاستثنائية) كتتطلب تكون فإسبانيا. غادي نتواصلو معاك فشكل آخر.",
      "❌ عذراً، معظم إجراءات الإقامة تتطلب التواجد داخل الأراضي الإسبانية. سيتواصل معك فريقنا لبدائل أخرى.",
      "❌ غالب الإجراءات تاع الإقامة تطلب تكون في اسبانيا. راح نتواصلو معاك باش نشوفو الحلول الأخرى.",
      "❌ La plupart des procédures nécessitent d'être en Espagne. Un conseiller vous contactera pour d'autres options."
    ),
    inputType: "none",
    process: (value, session) => ({ nextStep: "end" }),
  },

  not_eligible_date: {
    id: "not_eligible_date",
    message: t(
      "⏳ كيبان بلي المكاتب ديالنا غايحتاجو يقلبو على ثغرة أخرى لملفك حيت المدة لي طلبتيها مكافياش. المحامي غيهدر معاك.",
      "⏳ يبدو أن ملفك يحتاج لمراجعة خاصة للبحث عن بديل آخر بناءً على المدة. سيتواصل معك المحامي.",
      "⏳ لازم نشوفو دوسيك غاية باسكو المدة ماشي كافية. المحامي راح يكلف بيه.",
      "⏳ Il semble que la durée de votre séjour ne soit pas suffisante. Un avocat examinera votre dossier."
    ),
    inputType: "none",
    process: (value, session) => ({ nextStep: "end" }),
  },

  refer_human: {
    id: "refer_human",
    message: t(
      "⚠️ الملف ديالك كيحتاج مراجعة خاصة ودقيقة من طرف المحامين ديالنا (يقدر يكون بسبب سوابق أو تفاصيل دقيقة).\n\nغادي نتصلو بيك ف أقرب وقت ممكن.",
      "⚠️ ملفك يحتاج مراجعة دقيقة وخاصة من محامينا.\n\nسنتواصل معك في أقرب وقت لترتيب الاستشارة.",
      "⚠️ الدوسي نتاعك يطلب مراجعة من طرف محامي.\n\nراح نتاصلو بك في أقرب وقت.",
      "⚠️ Votre dossier nécessite un examen approfondi par nos avocats.\n\nNous vous contacterons très prochainement."
    ),
    inputType: "none",
    process: (value, session) => ({ nextStep: "end" }),
  },

  // Premium monetization
  service_tier: {
    id: "service_tier",
    message: t(
      "🌟 اختار مستوى الخدمة القانونية لي بغيتي:\n\n1️⃣ **تقييم أولي (19€)** - تحليل الملف + مكالمة مع محامي.\n2️⃣ **فتح ملف (79€)** - تجهيز المستندات الأولية لليقين من القبول.\n3️⃣ **وكالة شاملة (399€)** - كنتكلفو بكلشي حتى تشد البطاقة.",
      "🌟 اختر مستوى الخدمة القانونية:\n\n1️⃣ **تقييم مبدئي (19€)** - تحليل وحجز موعد استشارة.\n2️⃣ **فتح ملف (79€)** - تحضير الوثائق والمراجعة.\n3️⃣ **توكيل شامل (399€)** - نتكفل بكل شيء حتى استلام الإقامة.",
      "🌟 اختار المستوى تاع الخدمة القانونية:\n\n1️⃣ **تقييم أولي (19€)** - دراسة الدوسي + استشارة.\n2️⃣ **فتح الدوسي (79€)** - نوجدو الكواغط.\n3️⃣ **وكالة شاملة (399€)** - نتكلفو بكلش حتى تدي الكارطة.",
      "🌟 Choisissez votre niveau de service :\n\n1️⃣ **Pré-évaluation (19€)** - Analyse + Consultation.\n2️⃣ **Ouverture dossier (79€)** - Préparation documentaire.\n3️⃣ **Procédure complète (399€)** - Nous gérons tout."
    ),
    inputType: "buttons",
    options: [
      { label: t("19€ - تقييم أولي", "19€ - تقييم مبدئي", "19€ - تقييم أولي", "19€ - Pré-évaluation"), value: "pre_eval" },
      { label: t("79€ - فتح ملف", "79€ - فتح ملف", "79€ - فتح الدوسي", "79€ - Ouverture Dossier"), value: "file_opening" },
      { label: t("399€ - وكالة شاملة 👑", "399€ - توكيل شامل 👑", "399€ - وكالة شاملة 👑", "399€ - Procédure Complète 👑"), value: "full_processing" },
    ],
    process: (value, session) => ({
      nextStep: "payment",
      updates: { serviceTier: value as any },
    }),
  },

  payment: {
    id: "payment",
    message: t(
      "💳 ضغط على الرابط التحت باش تكمل الأداء الآمن عن طريق Stripe. من بعد غيوصلك وصل و نتصلو بيك.",
      "💳 اضغط على الرابط أدناه لإكمال الدفع الآمن عبر Stripe. ستصلك الفاتورة وسنتصل بك.",
      "💳 كليكي على الرابط التحت باش تخلص بطريقة آمنة (Stripe).",
      "💳 Cliquez sur le lien ci-dessous pour le paiement sécurisé via Stripe."
    ),
    inputType: "buttons",
    options: [
      { label: t("دفع الآن / Payer 🔒", "دفع الآن 🔒", "خلص دركا 🔒", "Payer maintenant 🔒"), value: "success" },
    ],
    process: (value, session) => {
      let amount = session.plan === "professional" ? 25 : 0;
      if (session.plan === "premium") {
        if (session.serviceTier === "pre_eval") amount = 19;
        if (session.serviceTier === "file_opening") amount = 79;
        if (session.serviceTier === "full_processing") amount = 399;
      }

      return {
        nextStep: session.plan === "premium" && session.serviceTier !== "full_processing" ? "upsell" : "end",
        updates: { paymentStatus: "paid", amountPaid: amount, status: "completed" },
      };
    },
  },

  upsell: {
    id: "upsell",
    message: t(
      "🎉 شكرا لك! الدفع داز بنجاح.\n\nبما أنك دفعت، عندنا عرض خاص ليك: بغيتي نرقّيو الملف ديالك لخدمة شاملة بخصم 15%؟ غادي نوفروا عليك التعب.",
      "🎉 شكراً لك! تم الدفع بنجاح.\n\nنعرض عليك ترقية ملفك للخدمة الشاملة بخصم 15% للتكفل بكل شيء.",
      "🎉 شكرا! الدفع فات مليح.\n\nحاب نرقالوك الخدمة للشاملة بنقص 15% ونهنيوك من التعب؟",
      "🎉 Merci ! Paiement réussi.\n\nSouhaitez-vous passer à la procédure complète avec 15% de réduction ?"
    ),
    inputType: "buttons",
    options: [
      { label: t("نعم، نرقّي 🚀", "نعم، أريد الترقية 🚀", "نعم، نرقّي 🚀", "Oui, je veux surclasser 🚀"), value: "accepted" },
      { label: t("لا شكرا ❌", "لا شكراً ❌", "لا شكرا ❌", "Non merci ❌"), value: "rejected" },
    ],
    process: (value, session) => ({
      nextStep: "end",
      updates: { answers: { ...session.answers, upsell: value } },
    }),
  },

  end: {
    id: "end",
    message: t(
      "تسجلات المعلومات ديالك. شكرا لثقتك فـ Asesoría MRT. فريقنا غيتصل بيك قريبا! 📞",
      "تم تسجيل معلوماتك بنجاح. شكراً لثقتك في Asesoría MRT. سيتواصل فريقنا معك! 📞",
      "سجلنا معلوماتك، شكرا للثقة نتاعك في Asesoría MRT. راح نتاصلو بك قريب! 📞",
      "Vos informations ont bien été enregistrées. Merci de votre confiance en Asesoría MRT. Un conseiller vous appellera ! 📞"
    ),
    inputType: "none",
    process: () => ({ nextStep: "end" }),
  },
};

export const startStep = "welcome";
export const getStep = (id: string): FlowStep => steps[id];
