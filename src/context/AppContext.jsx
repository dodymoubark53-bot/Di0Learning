import { createContext, useState, useEffect, useRef } from "react";
import JSZip from "jszip";
import { saveMedia, getMedia, clearAllMedia } from "../utils/db";

// Supabase import removed
export const AppContext = createContext();

const translations = {
  en: {
    home: "Home Dashboard",
    cards: "My Decks",
    "new-card": "Create Card",
    schedule: "Schedule Planner",
    quiz: "Quiz Mode",
    "ai-assistant": "AI Study Assistant",
    "word-search": "Word Video Search",
    translator: "Translator",
    settings: "Settings",
    ask_ai: "Ask AI Tutor",
    onboarding_title: "Getting Started with Di0 Learning",
    onboarding_desc:
      "Welcome to the future of educational success! Di0 Learning is built to supercharge your grades with AI assistance, flashcard review decks, calendar study logs, and instant translations.",
    onboarding_btn: "Let's Study!",
    // Dashboard
    welcome: "Welcome back to",
    tagline:
      "Your ultimate AI-powered study space. Here is your overview for today.",
    total_cards: "Total Cards Created",
    active_decks: "Active Decks / Subjects",
    quiz_accuracy: "Avg Quiz Accuracy",
    upcoming_sessions: "Upcoming Study Sessions",
    no_sessions: "No study sessions scheduled for today or later.",
    add_session: "Add Study Session",
    view_full_calendar: "View Full Calendar",
    quick_actions: "Quick Actions",
    recent_quiz_perf: "Recent Quiz Performance",
    deck_subject: "Deck Subject",
    score: "Score",
    date_taken: "Date Taken",
    no_quiz_history: "No quiz history yet. Jump in and test your knowledge!",
    // Decks
    decks_title: "My Decks Folders",
    decks_desc:
      "Organize cards into subject folders to review or test yourself.",
    create_deck: "Create a New Deck",
    deck_name_placeholder: "Deck/Subject name (e.g. Physics)...",
    btn_create: "Create",
    btn_cancel: "Cancel",
    cards_count: "cards",
    created_on: "Created on",
    browse_mode: "Browse Mode",
    exam_mode: "Exam Mode",
    btn_export: "Export to ZIP",
    btn_import: "Import ZIP",
    upload_zip: "Upload ZIP",
    no_decks: "No decks yet. Let's create your first one!",
    empty_deck: "This deck is empty.",
    back_to_decks: "Back to Decks List",
    deck_dashboard: "Deck Dashboard",
    // New Card
    create_card_title: "Create Study Card",
    create_card_desc:
      "Choose a template layout and input your academic materials.",
    deck_label: "Deck / Subject",
    use_existing: "Use Existing",
    front_label: "Front Side (Question / Concept)",
    back_label: "Back Side (Definition / Answer)",
    question_label: "Question",
    options_label: "Answer Options",
    correct_key_label: "Correct Key Option",
    statement_label: "Statement",
    note_title_label: "Note Title / Topic",
    note_summary_label: "Note Summary / Content",
    save_card_btn: "Save Card to Deck",
    record_stt: "Record STT",
    stop_recording: "Stop Recording",
    camera_snap: "Camera Snap",
    upload_file: "Upload File",
    // Quiz Mode
    quiz_title: "Quiz Mode",
    quiz_desc:
      "Test your knowledge by taking a customized quiz from your study decks.",
    select_deck: "Select Deck / Subject",
    ai_gen_toggle: "Auto-Generate via AI",
    ai_gen_desc:
      "Transforms your raw card summaries/notes into a 5-question test.",
    start_quiz_btn: "Start Review Quiz",
    q_progress: "Question {current} of {total}",
    reveal_btn: "Reveal Answer",
    right_btn: "✓ I was right",
    wrong_btn: "✗ I was wrong",
    pass_btn: "✓ Recalled Well (Pass)",
    fail_btn: "✗ Forgot Details (Fail)",
    compare_note: "Compare with Original Note",
    quiz_completed: "Quiz Completed!",
    quiz_comp_desc: "Great job reviewing your deck subjects.",
    review_summary: "Review Summary:",
    retake_btn: "Retake Quiz",
    other_decks_btn: "Review other Decks",
    // Settings
    settings_title: "Application Settings",
    settings_desc:
      "Configure API integrations, customize themes, clean data files, and inspect system hotkeys.",
    interface_theme: "Interface Theme",
    dark_mode: "Dark Mode",
    light_mode: "Light Mode",
    third_party: "Third-Party Integrations",
    claude_api: "Anthropic Claude API Key",
    youtube_api: "YouTube Data API v3 Key",
    shortcuts: "Power User Hotkeys",
    danger_zone: "Danger Zone",
    reset_onboarding: "Reset Onboarding",
    clear_database: "Clear Database",
    save_api_btn: "Save API Settings",
  },
  ar: {
    home: "لوحة التحكم",
    cards: "مجلدات المناهج",
    "new-card": "إنشاء بطاقة",
    schedule: "جدول الدراسة",
    quiz: "وضع الاختبار",
    "ai-assistant": "المساعد الدراسي الذكي",
    "word-search": "البحث المرئي للكلمات",
    translator: "المترجم الفوري",
    settings: "الإعدادات",
    ask_ai: "اسأل معلم الذكاء الاصطناعي",
    onboarding_title: "بدء استخدام Di0 Learning",
    onboarding_desc:
      "مرحبًا بك في مستقبل النجاح الأكاديمي! تم تصميم Di0 Learning لتعزيز درجاتك بمساعدة الذكاء الاصطناعي، وبطاقات المراجعة، وجداول الدراسة، والترجمة الفورية.",
    onboarding_btn: "ابدأ الدراسة الآن!",
    // Dashboard
    welcome: "مرحبًا بك مجددًا في",
    tagline:
      "مساحتك الدراسية المتكاملة بالذكاء الاصطناعي. إليك نظرة عامة على يومك.",
    total_cards: "إجمالي البطاقات المنشأة",
    active_decks: "المناهج الدراسية النشطة",
    quiz_accuracy: "متوسط دقة الاختبارات",
    upcoming_sessions: "جلسات الدراسة القادمة",
    no_sessions: "لا توجد جلسات دراسية مجدولة لليوم أو لاحقًا.",
    add_session: "إضافة جلسة دراسية",
    view_full_calendar: "عرض التقويم بالكامل",
    quick_actions: "إجراءات سريعة",
    recent_quiz_perf: "أداء الاختبار الأخير",
    deck_subject: "منهج الاختبار",
    score: "النتيجة",
    date_taken: "تاريخ الاختبار",
    no_quiz_history: "لا يوجد تاريخ اختبارات بعد. ابدأ واختبر معلوماتك!",
    // Decks
    decks_title: "مجلدات مناهجي",
    decks_desc: "نظّم بطاقاتك في مجلدات موضوعية لمراجعتها أو اختبار نفسك فيها.",
    create_deck: "إنشاء مجلد دراسي جديد",
    deck_name_placeholder: "اسم المجلد الدراسي (مثال: فيزياء)...",
    btn_create: "إنشاء",
    btn_cancel: "إلغاء",
    cards_count: "بطاقات",
    created_on: "أنشئ في",
    browse_mode: "وضع التصفح",
    exam_mode: "وضع الاختبار",
    btn_export: "تصدير كـ ZIP",
    btn_import: "استيراد ZIP",
    upload_zip: "رفع ملف ZIP",
    no_decks: "لا توجد مجلدات دراسية بعد. فلننشئ مجلدك الأول!",
    empty_deck: "هذا المجلد الدراسي فارغ.",
    back_to_decks: "العودة لقائمة المجلدات",
    deck_dashboard: "لوحة تحكم المجلد",
    // New Card
    create_card_title: "إنشاء بطاقة دراسية",
    create_card_desc: "اختر قالب التصميم وأدخل موادك الأكاديمية.",
    deck_label: "المجلد / المادة",
    use_existing: "استخدام مجلد موجود",
    front_label: "الجانب الأمامي (السؤال / المفهوم)",
    back_label: "الجانب الخلفي (التعريف / الإجابة)",
    question_label: "السؤال",
    options_label: "خيارات الإجابة",
    correct_key_label: "خيار الإجابة الصحيحة",
    statement_label: "العبارة",
    note_title_label: "عنوان الملاحظة / الموضوع",
    note_summary_label: "ملخص الملاحظة / المحتوى",
    save_card_btn: "حفظ البطاقة في المجلد",
    record_stt: "تحويل الصوت لنص",
    stop_recording: "إيقاف التسجيل",
    camera_snap: "التقاط كاميرا",
    upload_file: "رفع ملف",
    // Quiz Mode
    quiz_title: "وضع الاختبار",
    quiz_desc: "اختبر معلوماتك عن طريق إجراء اختبار مخصص من مجلدات دراستك.",
    select_deck: "اختر المجلد الدراسي / المادة",
    ai_gen_toggle: "إنشاء الاختبار بالذكاء الاصطناعي تلقائياً",
    ai_gen_desc:
      "تحويل ملخصات وملاحظات بطاقاتك مباشرة إلى اختبار مكون من 5 أسئلة.",
    start_quiz_btn: "بدء اختبار المراجعة",
    q_progress: "السؤال {current} من {total}",
    reveal_btn: "كشف الإجابة",
    right_btn: "✓ كانت إجابتي صحيحة",
    wrong_btn: "✗ أخطأت في الإجابة",
    pass_btn: "✓ تذكرت التفاصيل (نجاح)",
    fail_btn: "✗ نسيت التفاصيل (فشل)",
    compare_note: "مقارنة بالملاحظة الأصلية",
    quiz_completed: "اكتمل الاختبار!",
    quiz_comp_desc: "عمل رائع في مراجعة موادك الدراسية.",
    review_summary: "ملخص المراجعة:",
    retake_btn: "إعادة الاختبار",
    other_decks_btn: "مراجعة مجلدات أخرى",
    // Settings
    settings_title: "إعدادات التطبيق",
    settings_desc:
      "تكوين واجهات برمجية، وتخصيص المظهر، ومسح قواعد البيانات، والاطلاع على اختصارات لوحة المفاتيح.",
    interface_theme: "مظهر الواجهة",
    dark_mode: "الوضع الداكن",
    light_mode: "الوضع المضيء",
    third_party: "عمليات التكامل الخارجية",
    claude_api: "رمز واجهة Anthropic Claude API",
    youtube_api: "رمز واجهة YouTube Data API v3",
    shortcuts: "اختصارات لوحة المفاتيح السريعة",
    danger_zone: "منطقة الخطر",
    reset_onboarding: "إعادة تعيين شاشة البدء",
    clear_database: "مسح قاعدة البيانات بالكامل",
    save_api_btn: "حفظ إعدادات المظهر",
  },
};

export const AppProvider = ({ children }) => {
  // Navigation / Routing
  const [activeTab, setActiveTab] = useState("home");

  // User Account Authentication State
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("di0_active_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isDataLoading, setIsDataLoading] = useState(false);

  // Storage key helper based on active user
  const getUserKey = (baseKey) => {
    const userId = user ? user.id : "guest_default";
    return `${baseKey}_${userId}`;
  };

  // UI Language Preference (EN / AR)
  const [lang, setLang] = useState(() => localStorage.getItem("lang") || "en");

  // Theme & Onboarding
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "dark",
  );
  const [showOnboarding, setShowOnboarding] = useState(() => {
    const saved = localStorage.getItem("showOnboarding");
    return saved === null ? true : saved === "true";
  });

  // Global Settings (API Keys, etc.)
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem("settings");
    return saved
      ? JSON.parse(saved)
      : { anthropicKey: "", youtubeKey: "", corsProxy: "" };
  });

  // Cards & Decks (User Isolated & Persistent across reloads)
  const [cards, setCards] = useState(() => {
    try {
      const savedActiveUser = localStorage.getItem("di0_active_user");
      if (!savedActiveUser) return [];
      const userObj = JSON.parse(savedActiveUser);
      const savedCards = localStorage.getItem(`cards_${userObj.id}`);
      return savedCards ? JSON.parse(savedCards) : [];
    } catch {
      return [];
    }
  });

  // Decks metadata catalog (User Isolated & Persistent)
  const [decksMetadata, setDecksMetadata] = useState(() => {
    try {
      const savedActiveUser = localStorage.getItem("di0_active_user");
      if (!savedActiveUser) return [{ name: "General", color: "#9b51e0", createdAt: new Date().getTime() }];
      const userObj = JSON.parse(savedActiveUser);
      const savedDecks = localStorage.getItem(`decksMetadata_${userObj.id}`);
      return savedDecks 
        ? JSON.parse(savedDecks) 
        : [{ name: "General", color: "#9b51e0", createdAt: new Date().getTime() }];
    } catch {
      return [{ name: "General", color: "#9b51e0", createdAt: new Date().getTime() }];
    }
  });

  // Study Planner Schedule (User Isolated & Persistent)
  const [schedule, setSchedule] = useState(() => {
    try {
      const savedActiveUser = localStorage.getItem("di0_active_user");
      if (!savedActiveUser) return [];
      const userObj = JSON.parse(savedActiveUser);
      const savedSchedule = localStorage.getItem(`schedule_${userObj.id}`);
      return savedSchedule ? JSON.parse(savedSchedule) : [];
    } catch {
      return [];
    }
  });

  // Quiz History (User Isolated & Persistent)
  const [quizHistory, setQuizHistory] = useState(() => {
    try {
      const savedActiveUser = localStorage.getItem("di0_active_user");
      if (!savedActiveUser) return [];
      const userObj = JSON.parse(savedActiveUser);
      const savedHistory = localStorage.getItem(`quizHistory_${userObj.id}`);
      return savedHistory ? JSON.parse(savedHistory) : [];
    } catch {
      return [];
    }
  });

  const isInitialMount = useRef(true);

  // Switch user workspace ONLY when user account changes after mount
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (!user) {
      setCards([]);
      setDecksMetadata([{ name: "General", color: "#9b51e0", createdAt: new Date().getTime() }]);
      setSchedule([]);
      setQuizHistory([]);
      return;
    }

    const userId = user.id;
    
    // Cards
    const savedCards = localStorage.getItem(`cards_${userId}`);
    setCards(savedCards ? JSON.parse(savedCards) : []);

    // Decks
    const savedDecks = localStorage.getItem(`decksMetadata_${userId}`);
    setDecksMetadata(
      savedDecks 
        ? JSON.parse(savedDecks) 
        : [{ name: "General", color: "#9b51e0", createdAt: new Date().getTime() }]
    );

    // Schedule
    const savedSchedule = localStorage.getItem(`schedule_${userId}`);
    setSchedule(savedSchedule ? JSON.parse(savedSchedule) : []);

    // Quiz History
    const savedHistory = localStorage.getItem(`quizHistory_${userId}`);
    setQuizHistory(savedHistory ? JSON.parse(savedHistory) : []);
  }, [user?.id]);

  // Toast System
  const [toasts, setToasts] = useState(() => []);

  // Dictionary Translator lookup helper
  const t = (key, params = {}) => {
    let text = translations[lang]?.[key] || translations["en"]?.[key] || key;
    Object.keys(params).forEach((p) => {
      text = text.replace(`{${p}}`, params[p]);
    });
    return text;
  };

  const toggleLang = () => {
    setLang((prev) => (prev === "en" ? "ar" : "en"));
  };

  const addToast = (message, type = "info") => {
    const id = String(Date.now()) + "_" + type;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Auth requirement check before saving data
  const checkAuthRequired = () => {
    if (!user) {
      addToast(
        lang === "ar"
          ? "⚠️ يلزم تسجيل الدخول أو إنشاء حساب جديد أولاً لحفظ بطاقاتك وموادك الدراسية!"
          : "⚠️ Sign in or create an account to save study cards and data!",
        "error"
      );
      return false;
    }
    return true;
  };

  // Sync state changes to LocalStorage ONLY when account is active
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("lang", lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem("showOnboarding", showOnboarding.toString());
  }, [showOnboarding]);

  useEffect(() => {
    localStorage.setItem("settings", JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (!user) return;
    localStorage.setItem(`cards_${user.id}`, JSON.stringify(cards));
  }, [cards, user?.id]);

  useEffect(() => {
    if (!user) return;
    localStorage.setItem(`decksMetadata_${user.id}`, JSON.stringify(decksMetadata));
  }, [decksMetadata, user?.id]);

  useEffect(() => {
    if (!user) return;
    localStorage.setItem(`schedule_${user.id}`, JSON.stringify(schedule));
  }, [schedule, user?.id]);

  useEffect(() => {
    if (!user) return;
    localStorage.setItem(`quizHistory_${user.id}`, JSON.stringify(quizHistory));
  }, [quizHistory, user?.id]);

  // Auth User Functions
  const registerUser = async (name, email, password) => {
    const cleanEmail = email.trim().toLowerCase();
    let db = {};
    try {
      db = JSON.parse(localStorage.getItem("di0_users_db") || "{}");
    } catch {
      db = {};
    }

    if (db[cleanEmail]) {
      addToast(lang === "ar" ? "هذا البريد الإلكتروني مسجل بالفعل." : "Email is already registered.", "error");
      return false;
    }

    const newUser = {
      id: "user_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
      name: name.trim() || cleanEmail.split("@")[0],
      email: cleanEmail,
      password,
      createdAt: Date.now()
    };

    db[cleanEmail] = newUser;
    localStorage.setItem("di0_users_db", JSON.stringify(db));
    
    setUser(newUser);
    localStorage.setItem("di0_active_user", JSON.stringify(newUser));
    addToast(lang === "ar" ? `مرحباً بك ${newUser.name}! تم إنشاء حسابك بنجاح.` : `Welcome ${newUser.name}! Account created.`, "success");
    return true;
  };

  const loginUser = async (email, password) => {
    const cleanEmail = email.trim().toLowerCase();
    let db = {};
    try {
      db = JSON.parse(localStorage.getItem("di0_users_db") || "{}");
    } catch {
      db = {};
    }

    const userObj = db[cleanEmail];
    if (!userObj || userObj.password !== password) {
      addToast(lang === "ar" ? "البريد الإلكتروني أو كلمة المرور غير صحيحة." : "Invalid email or password.", "error");
      return false;
    }

    setUser(userObj);
    localStorage.setItem("di0_active_user", JSON.stringify(userObj));
    addToast(lang === "ar" ? `مرحباً بعودتك، ${userObj.name}!` : `Welcome back, ${userObj.name}!`, "success");
    return true;
  };

  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem("di0_active_user");
    addToast(lang === "ar" ? "تم تسجيل الخروج بنجاح." : "Logged out successfully.", "info");
  };

  // SRS Rating Update
  const updateCardSrs = (cardId, rating) => {
    const intervals = {
      again: 1 * 60 * 1000,      // 1 minute (تكرار بعد دقيقة واحدة)
      hard: 10 * 60 * 1000,      // 10 minutes (تكرار بعد 10 دقائق)
      good: 60 * 60 * 1000,      // 1 hour (تكرار بعد ساعة واحدة)
      easy: 240 * 60 * 1000,     // 4 hours (تكرار بعد 4 ساعات)
    };

    const now = Date.now();
    const cleanId = String(cardId).split('_retry_')[0];
    const addition = intervals[rating] || intervals.good;
    const nextReviewDate = now + addition;

    setCards(prev => prev.map(c => {
      if (c.id === cleanId) {
        return {
          ...c,
          lastRating: rating,
          lastReviewedAt: now,
          nextReviewDate,
          reviewCount: (c.reviewCount || 0) + 1,
        };
      }
      return c;
    }));
  };

  // Theme Actions
  const toggleTheme = () =>
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  // Decks list (derived from decksMetadata)
  const decks = decksMetadata.map((d) => d.name);

  // Deck Folder Actions
  const addDeck = async (name, color = "#9b51e0") => {
    if (!checkAuthRequired()) return false;
    const trimmed = name.trim();
    if (!trimmed) return;
    if (
      decksMetadata.some((d) => d.name.toLowerCase() === trimmed.toLowerCase())
    ) {
      return;
    }

    let newDeck = {
      id: Date.now().toString(),
      name: trimmed,
      color,
      createdAt: Date.now(),
    };

    setDecksMetadata((prev) => [...prev, newDeck]);
    addToast(`Deck "${trimmed}" created!`, "success");
    return true;
  };

  const deleteDeck = async (deckName) => {
    if (!checkAuthRequired()) return false;
    if (deckName === "General") {
      addToast("Cannot delete the General default deck.", "error");
      return;
    }

    setCards((prev) => prev.filter((c) => c.deckId !== deckName));
    setDecksMetadata((prev) => prev.filter((d) => d.name !== deckName));
    addToast(`Deck "${deckName}" removed.`, "info");
  };

  // Card Actions
  const addCard = async (cardData, mediaFiles = {}) => {
    if (!checkAuthRequired()) return false;
    const assignedDeck = cardData.deckId || "General";
    let deckMeta = decksMetadata.find((d) => d.name === assignedDeck);

    if (!deckMeta) {
      const colors = ["#9b51e0", "#00f2fe", "#f59e0b", "#10b981", "#f43f5e"];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      deckMeta = {
        id: Date.now().toString(),
        name: assignedDeck,
        color: randomColor,
        createdAt: Date.now(),
      };
      setDecksMetadata((prev) => [...prev, deckMeta]);
    }

    const newCardId = Date.now().toString() + "_" + Math.random().toString(36).substr(2, 5);
    const mediaUrls = {};

    for (const [key, file] of Object.entries(mediaFiles)) {
      if (!file) continue;
      const newMediaId = `media_${newCardId}_${key}_${Date.now()}`;
      await saveMedia(newMediaId, file, file.name);
      mediaUrls[key] = {
        id: newMediaId,
        name: file.name,
        type: file.type,
      };
    }

    const newCard = {
      id: newCardId,
      deckId: assignedDeck,
      template: cardData.template || "flashcard",
      question: cardData.question || "",
      answer: cardData.answer || "",
      options: cardData.options || [],
      correctAnswer: cardData.correctAnswer || "",
      notes: cardData.notes || "",
      media: mediaUrls,
      createdAt: Date.now(),
    };

    setCards((prev) => [newCard, ...prev]);
    addToast("Card created successfully!", "success");
    return true;
  };

  const updateCard = async (
    cardId,
    updatedData,
    mediaFiles = {},
    deletedMediaIds = [],
  ) => {
    if (!checkAuthRequired()) return false;
    const currentCard = cards.find((c) => c.id === cardId);
    if (!currentCard) return;

    // Handle new media uploads
    const mediaUrls = { ...(currentCard.media || {}) };
    for (const [key, file] of Object.entries(mediaFiles)) {
      if (!file) continue;
      const newMediaId = `media_${cardId}_${key}_${Date.now()}`;
      await saveMedia(newMediaId, file, file.name);
      mediaUrls[key] = {
        id: newMediaId,
        name: file.name,
        type: file.type,
      };
    }

    // Process deletions if any
    for (const deletedId of deletedMediaIds) {
      for (const [key, mediaObj] of Object.entries(mediaUrls)) {
        if (mediaObj?.id === deletedId) {
          delete mediaUrls[key];
        }
      }
    }

    setCards((prev) =>
      prev.map((c) => {
        if (c.id === cardId) {
          return {
            ...c,
            ...updatedData,
            deckId: updatedData.deckId || c.deckId,
            media: mediaUrls,
          };
        }
        return c;
      })
    );
    addToast("Card updated successfully!", "success");
    return true;
  };

  const deleteCard = async (cardId) => {
    if (!checkAuthRequired()) return false;
    setCards((prev) => prev.filter((c) => c.id !== cardId));
    addToast("Card deleted.", "info");
  };

  // Schedule Actions
  const addSession = async (sessionData) => {
    if (!checkAuthRequired()) return false;
    let newSession = {
      id: Date.now().toString(),
      subject: sessionData.subject || "Study Session",
      date: sessionData.date || new Date().toISOString().split("T")[0],
      time: sessionData.time || "12:00",
      duration: parseInt(sessionData.duration, 10) || 60,
      notes: sessionData.notes || "",
      color: sessionData.color || "#9b51e0",
    };

    setSchedule((prev) => [...prev, newSession]);
    addToast("Session added to planner!", "success");
  };

  const deleteSession = async (sessionId) => {
    setSchedule((prev) => prev.filter((s) => s.id !== sessionId));
    addToast("Session removed.", "info");
  };

  // Quiz Performance
  const addQuizResult = async (result) => {
    let newResult = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(),
      deckName: result.deckName,
      score: result.score,
      total: result.total,
    };

    setQuizHistory((prev) => [newResult, ...prev]);
  };

  // ZIP Export & Import using JSZip
  const exportDeck = async (deckName) => {
    const deckCards = cards.filter((c) => c.deckId === deckName);
    if (deckCards.length === 0) {
      addToast("No cards to export in this deck.", "error");
      return;
    }

    try {
      addToast("Preparing export ZIP...", "info");
      const zip = new JSZip();

      zip.file("deck_metadata.json", JSON.stringify(deckCards, null, 2));

      for (const card of deckCards) {
        if (card.media) {
          for (const field of Object.keys(card.media)) {
            const mediaItem = card.media[field];
            if (mediaItem?.url) {
              try {
                const res = await fetch(mediaItem.url);
                const blob = await res.blob();
                const pathParts = mediaItem.url.split("/");
                const filename = pathParts[pathParts.length - 1];
                zip.file(`media/${filename}`, blob);
              } catch (e) {
                console.error("Failed to download media for zip export:", e);
              }
            } else if (mediaItem?.id) {
              const mediaRecord = await getMedia(mediaItem.id);
              if (mediaRecord && mediaRecord.blob) {
                zip.file(`media/${mediaItem.id}`, mediaRecord.blob);
              }
            }
          }
        }
      }

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${deckName.replace(/\s+/g, "_")}_Di0Learning.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      addToast("Deck exported successfully!", "success");
    } catch (error) {
      console.error(error);
      addToast("Export failed.", "error");
    }
  };

  const importDeck = async (file) => {
    if (!file) return;

    try {
      addToast("Importing ZIP package...", "info");
      const zip = await JSZip.loadAsync(file);

      const metadataFile = zip.file("deck_metadata.json");
      if (!metadataFile) {
        addToast("Invalid ZIP: Missing deck_metadata.json", "error");
        return;
      }

      const metadataText = await metadataFile.async("text");
      const importedCards = JSON.parse(metadataText);

      if (!Array.isArray(importedCards)) {
        addToast("Invalid card schema in metadata file.", "error");
        return;
      }

      const newCardsList = [...cards];

      for (const card of importedCards) {
        const newCardId = Date.now().toString() + "_" + Math.random().toString(36).substr(2, 5);
        card.createdAt = Date.now();

        let deckMeta = decksMetadata.find((d) => d.name === card.deckId);
        if (!deckMeta) {
          const colors = ["#9b51e0", "#00f2fe", "#f59e0b", "#10b981", "#f43f5e"];
          const randomColor = colors[Math.floor(Math.random() * colors.length)];
          deckMeta = {
            id: Date.now().toString(),
            name: card.deckId,
            color: randomColor,
            createdAt: Date.now(),
          };
          setDecksMetadata((prev) => [...prev, deckMeta]);
        }

        const mediaUrls = {};
        if (card.media) {
          for (const field of Object.keys(card.media)) {
            const mediaItem = card.media[field];
            if (!mediaItem) continue;
            const zipMediaFile =
              zip.file(`media/${mediaItem.id}`) ||
              zip.file(mediaItem.id) ||
              Object.values(zip.files).find((f) =>
                f.name.includes(mediaItem.id || ""),
              );

            if (zipMediaFile) {
              const fileBlob = await zipMediaFile.async("blob");
              const newMediaId = `media_${newCardId}_${field}_${Date.now()}`;
              const typedBlob = new Blob([fileBlob], {
                type: mediaItem.type,
              });
              await saveMedia(newMediaId, typedBlob, mediaItem.name);

              mediaUrls[field] = {
                id: newMediaId,
                name: mediaItem.name,
                type: mediaItem.type,
              };
            }
          }
        }

        card.id = newCardId;
        card.media = mediaUrls;
        newCardsList.unshift(card);
      }

      setCards(newCardsList);
      addToast(`Imported ${importedCards.length} cards!`, "success");
    } catch (error) {
      console.error(error);
      addToast(
        "Failed to import deck. Ensure files are valid ZIP formats.",
        "error",
      );
    }
  };

  const importAnkiDeck = async (importedCards, importedDecks, mediaAssets) => {
    try {
      const newDecksMetadata = [...decksMetadata];
      const colors = ["#9b51e0", "#00f2fe", "#f59e0b", "#10b981", "#f43f5e"];

      for (const deckName of importedDecks) {
        let deckMeta = newDecksMetadata.find(
          (d) => d.name.toLowerCase() === deckName.toLowerCase(),
        );
        if (!deckMeta) {
          const color = colors[Math.floor(Math.random() * colors.length)];
          deckMeta = {
            id: Date.now().toString() + "_" + Math.random().toString(36).substr(2, 5),
            name: deckName,
            color,
            createdAt: Date.now(),
          };
          newDecksMetadata.push(deckMeta);
        }
      }
      setDecksMetadata(newDecksMetadata);

      for (const [filename, blob] of Object.entries(mediaAssets)) {
        for (const deckName of importedDecks) {
          await saveMedia(
            `ankimedia_${deckName}_${filename}`,
            blob,
            filename,
          );
        }
        await saveMedia(`ankimedia_General_${filename}`, blob, filename);
      }

      const newCards = [...cards];
      for (const card of importedCards) {
        const newCardId =
          Date.now().toString() +
          "_" +
          Math.random().toString(36).substr(2, 5);
        newCards.unshift({
          id: newCardId,
          deckId: card.deckId,
          template: "flashcard",
          question: card.question,
          answer: card.answer,
          options: [],
          correctAnswer: "",
          notes: "",
          media: {},
          createdAt: Date.now(),
        });
      }
      setCards(newCards);

      addToast(
        `Imported ${importedCards.length} cards into ${importedDecks.length} decks successfully!`,
        "success",
      );
    } catch (e) {
      console.error(e);
      addToast("Anki import failed during database writing.", "error");
    }
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        lang,
        toggleLang,
        t,
        theme,
        toggleTheme,
        showOnboarding,
        setShowOnboarding,
        settings,
        setSettings,
        cards,
        decks,
        decksMetadata,
        addDeck,
        deleteDeck,
        addCard,
        updateCard,
        deleteCard,
        schedule,
        addSession,
        deleteSession,
        quizHistory,
        addQuizResult,
        exportDeck,
        importDeck,
        importAnkiDeck,
        toasts,
        addToast,
        removeToast,
        isDataLoading,
        user,
        setUser,
        registerUser,
        loginUser,
        logoutUser,
        updateCardSrs,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
