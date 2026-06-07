import React, { createContext, useState, useEffect } from 'react';
import JSZip from 'jszip';
import { saveMedia, getMedia, deleteMedia, clearAllMedia } from '../utils/db';
import { supabase } from '../lib/supabase';

export const AppContext = createContext();

const translations = {
  en: {
    home: 'Home Dashboard',
    cards: 'My Decks',
    'new-card': 'Create Card',
    schedule: 'Schedule Planner',
    quiz: 'Quiz Mode',
    'ai-assistant': 'AI Study Assistant',
    'word-search': 'Word Video Search',
    translator: 'Translator',
    settings: 'Settings',
    ask_ai: 'Ask AI Tutor',
    onboarding_title: 'Getting Started with Di0 Learning',
    onboarding_desc: 'Welcome to the future of educational success! Di0 Learning is built to supercharge your grades with AI assistance, flashcard review decks, calendar study logs, and instant translations.',
    onboarding_btn: "Let's Study!",
    // Dashboard
    welcome: 'Welcome back to',
    tagline: 'Your ultimate AI-powered study space. Here is your overview for today.',
    total_cards: 'Total Cards Created',
    active_decks: 'Active Decks / Subjects',
    quiz_accuracy: 'Avg Quiz Accuracy',
    upcoming_sessions: 'Upcoming Study Sessions',
    no_sessions: 'No study sessions scheduled for today or later.',
    add_session: 'Add Study Session',
    view_full_calendar: 'View Full Calendar',
    quick_actions: 'Quick Actions',
    recent_quiz_perf: 'Recent Quiz Performance',
    deck_subject: 'Deck Subject',
    score: 'Score',
    date_taken: 'Date Taken',
    no_quiz_history: 'No quiz history yet. Jump in and test your knowledge!',
    // Decks
    decks_title: 'My Decks Folders',
    decks_desc: 'Organize cards into subject folders to review or test yourself.',
    create_deck: 'Create a New Deck',
    deck_name_placeholder: 'Deck/Subject name (e.g. Physics)...',
    btn_create: 'Create',
    btn_cancel: 'Cancel',
    cards_count: 'cards',
    created_on: 'Created on',
    browse_mode: 'Browse Mode',
    exam_mode: 'Exam Mode',
    btn_export: 'Export to ZIP',
    btn_import: 'Import ZIP',
    upload_zip: 'Upload ZIP',
    no_decks: "No decks yet. Let's create your first one!",
    empty_deck: 'This deck is empty.',
    back_to_decks: 'Back to Decks List',
    deck_dashboard: 'Deck Dashboard',
    // New Card
    create_card_title: 'Create Study Card',
    create_card_desc: 'Choose a template layout and input your academic materials.',
    deck_label: 'Deck / Subject',
    use_existing: 'Use Existing',
    front_label: 'Front Side (Question / Concept)',
    back_label: 'Back Side (Definition / Answer)',
    question_label: 'Question',
    options_label: 'Answer Options',
    correct_key_label: 'Correct Key Option',
    statement_label: 'Statement',
    note_title_label: 'Note Title / Topic',
    note_summary_label: 'Note Summary / Content',
    save_card_btn: 'Save Card to Deck',
    record_stt: 'Record STT',
    stop_recording: 'Stop Recording',
    camera_snap: 'Camera Snap',
    upload_file: 'Upload File',
    // Quiz Mode
    quiz_title: 'Quiz Mode',
    quiz_desc: 'Test your knowledge by taking a customized quiz from your study decks.',
    select_deck: 'Select Deck / Subject',
    ai_gen_toggle: 'Auto-Generate via AI',
    ai_gen_desc: 'Transforms your raw card summaries/notes into a 5-question test.',
    start_quiz_btn: 'Start Review Quiz',
    q_progress: 'Question {current} of {total}',
    reveal_btn: 'Reveal Answer',
    right_btn: '✓ I was right',
    wrong_btn: '✗ I was wrong',
    pass_btn: '✓ Recalled Well (Pass)',
    fail_btn: '✗ Forgot Details (Fail)',
    compare_note: 'Compare with Original Note',
    quiz_completed: 'Quiz Completed!',
    quiz_comp_desc: 'Great job reviewing your deck subjects.',
    review_summary: 'Review Summary:',
    retake_btn: 'Retake Quiz',
    other_decks_btn: 'Review other Decks',
    // Settings
    settings_title: 'Application Settings',
    settings_desc: 'Configure API integrations, customize themes, clean data files, and inspect system hotkeys.',
    interface_theme: 'Interface Theme',
    dark_mode: 'Dark Mode',
    light_mode: 'Light Mode',
    third_party: 'Third-Party Integrations',
    claude_api: 'Anthropic Claude API Key',
    youtube_api: 'YouTube Data API v3 Key',
    shortcuts: 'Power User Hotkeys',
    danger_zone: 'Danger Zone',
    reset_onboarding: 'Reset Onboarding',
    clear_database: 'Clear Database',
    save_api_btn: 'Save API Settings'
  },
  ar: {
    home: 'لوحة التحكم',
    cards: 'مجلدات المناهج',
    'new-card': 'إنشاء بطاقة',
    schedule: 'جدول الدراسة',
    quiz: 'وضع الاختبار',
    'ai-assistant': 'المساعد الدراسي الذكي',
    'word-search': 'البحث المرئي للكلمات',
    translator: 'المترجم الفوري',
    settings: 'الإعدادات',
    ask_ai: 'اسأل معلم الذكاء الاصطناعي',
    onboarding_title: 'بدء استخدام Di0 Learning',
    onboarding_desc: 'مرحبًا بك في مستقبل النجاح الأكاديمي! تم تصميم Di0 Learning لتعزيز درجاتك بمساعدة الذكاء الاصطناعي، وبطاقات المراجعة، وجداول الدراسة، والترجمة الفورية.',
    onboarding_btn: 'ابدأ الدراسة الآن!',
    // Dashboard
    welcome: 'مرحبًا بك مجددًا في',
    tagline: 'مساحتك الدراسية المتكاملة بالذكاء الاصطناعي. إليك نظرة عامة على يومك.',
    total_cards: 'إجمالي البطاقات المنشأة',
    active_decks: 'المناهج الدراسية النشطة',
    quiz_accuracy: 'متوسط دقة الاختبارات',
    upcoming_sessions: 'جلسات الدراسة القادمة',
    no_sessions: 'لا توجد جلسات دراسية مجدولة لليوم أو لاحقًا.',
    add_session: 'إضافة جلسة دراسية',
    view_full_calendar: 'عرض التقويم بالكامل',
    quick_actions: 'إجراءات سريعة',
    recent_quiz_perf: 'أداء الاختبار الأخير',
    deck_subject: 'منهج الاختبار',
    score: 'النتيجة',
    date_taken: 'تاريخ الاختبار',
    no_quiz_history: 'لا يوجد تاريخ اختبارات بعد. ابدأ واختبر معلوماتك!',
    // Decks
    decks_title: 'مجلدات مناهجي',
    decks_desc: 'نظّم بطاقاتك في مجلدات موضوعية لمراجعتها أو اختبار نفسك فيها.',
    create_deck: 'إنشاء مجلد دراسي جديد',
    deck_name_placeholder: 'اسم المجلد الدراسي (مثال: فيزياء)...',
    btn_create: 'إنشاء',
    btn_cancel: 'إلغاء',
    cards_count: 'بطاقات',
    created_on: 'أنشئ في',
    browse_mode: 'وضع التصفح',
    exam_mode: 'وضع الاختبار',
    btn_export: 'تصدير كـ ZIP',
    btn_import: 'استيراد ZIP',
    upload_zip: 'رفع ملف ZIP',
    no_decks: 'لا توجد مجلدات دراسية بعد. فلننشئ مجلدك الأول!',
    empty_deck: 'هذا المجلد الدراسي فارغ.',
    back_to_decks: 'العودة لقائمة المجلدات',
    deck_dashboard: 'لوحة تحكم المجلد',
    // New Card
    create_card_title: 'إنشاء بطاقة دراسية',
    create_card_desc: 'اختر قالب التصميم وأدخل موادك الأكاديمية.',
    deck_label: 'المجلد / المادة',
    use_existing: 'استخدام مجلد موجود',
    front_label: 'الجانب الأمامي (السؤال / المفهوم)',
    back_label: 'الجانب الخلفي (التعريف / الإجابة)',
    question_label: 'السؤال',
    options_label: 'خيارات الإجابة',
    correct_key_label: 'خيار الإجابة الصحيحة',
    statement_label: 'العبارة',
    note_title_label: 'عنوان الملاحظة / الموضوع',
    note_summary_label: 'ملخص الملاحظة / المحتوى',
    save_card_btn: 'حفظ البطاقة في المجلد',
    record_stt: 'تحويل الصوت لنص',
    stop_recording: 'إيقاف التسجيل',
    camera_snap: 'التقاط كاميرا',
    upload_file: 'رفع ملف',
    // Quiz Mode
    quiz_title: 'وضع الاختبار',
    quiz_desc: 'اختبر معلوماتك عن طريق إجراء اختبار مخصص من مجلدات دراستك.',
    select_deck: 'اختر المجلد الدراسي / المادة',
    ai_gen_toggle: 'إنشاء الاختبار بالذكاء الاصطناعي تلقائياً',
    ai_gen_desc: 'تحويل ملخصات وملاحظات بطاقاتك مباشرة إلى اختبار مكون من 5 أسئلة.',
    start_quiz_btn: 'بدء اختبار المراجعة',
    q_progress: 'السؤال {current} من {total}',
    reveal_btn: 'كشف الإجابة',
    right_btn: '✓ كانت إجابتي صحيحة',
    wrong_btn: '✗ أخطأت في الإجابة',
    pass_btn: '✓ تذكرت التفاصيل (نجاح)',
    fail_btn: '✗ نسيت التفاصيل (فشل)',
    compare_note: 'مقارنة بالملاحظة الأصلية',
    quiz_completed: 'اكتمل الاختبار!',
    quiz_comp_desc: 'عمل رائع في مراجعة موادك الدراسية.',
    review_summary: 'ملخص المراجعة:',
    retake_btn: 'إعادة الاختبار',
    other_decks_btn: 'مراجعة مجلدات أخرى',
    // Settings
    settings_title: 'إعدادات التطبيق',
    settings_desc: 'تكوين واجهات برمجية، وتخصيص المظهر، ومسح قواعد البيانات، والاطلاع على اختصارات لوحة المفاتيح.',
    interface_theme: 'مظهر الواجهة',
    dark_mode: 'الوضع الداكن',
    light_mode: 'الوضع المضيء',
    third_party: 'عمليات التكامل الخارجية',
    claude_api: 'رمز واجهة Anthropic Claude API',
    youtube_api: 'رمز واجهة YouTube Data API v3',
    shortcuts: 'اختصارات لوحة المفاتيح السريعة',
    danger_zone: 'منطقة الخطر',
    reset_onboarding: 'إعادة تعيين شاشة البدء',
    clear_database: 'مسح قاعدة البيانات بالكامل',
    save_api_btn: 'حفظ إعدادات المظهر'
  }
};

export const AppProvider = ({ children }) => {
  // Navigation / Routing
  const [activeTab, setActiveTab] = useState('home');

  // Supabase User State
  const [user, setUser] = useState(null);
  const [isDataLoading, setIsDataLoading] = useState(false);

  // Auth State Listener
useEffect(() => {
  supabase.auth.getSession().then(({ data: { session } }) => {
    setUser(session?.user ?? null);
  });

  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    setUser(session?.user ?? null);
  });

  return () => subscription.unsubscribe();
}, []);

  // UI Language Preference (EN / AR)
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'en');

  // Theme & Onboarding
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [showOnboarding, setShowOnboarding] = useState(() => {
    const saved = localStorage.getItem('showOnboarding');
    return saved === null ? true : saved === 'true';
  });

  // Global Settings (API Keys, etc.)
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('settings');
    return saved ? JSON.parse(saved) : { anthropicKey: '', youtubeKey: '', corsProxy: '' };
  });

  // Cards & Decks
  const [cards, setCards] = useState([]);

  // Decks metadata catalog (Folder system support)
  const [decksMetadata, setDecksMetadata] = useState([
    { name: 'General', color: '#9b51e0', createdAt: Date.now() }
  ]);

  // Study Planner Schedule
  const [schedule, setSchedule] = useState([]);

  // Quiz History
  const [quizHistory, setQuizHistory] = useState([]);

  // Toast System
  const [toasts, setToasts] = useState([]);

  // Dictionary Translator lookup helper
  const t = (key, params = {}) => {
    let text = translations[lang]?.[key] || translations['en']?.[key] || key;
    Object.keys(params).forEach(p => {
      text = text.replace(`{${p}}`, params[p]);
    });
    return text;
  };

  const toggleLang = () => {
    setLang(prev => (prev === 'en' ? 'ar' : 'en'));
  };

  const addToast = (message, type = 'info') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Supabase Media Upload Helpers
  const uploadImage = async (file, userId) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}_${Math.random().toString(36).substr(2, 5)}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('card-images')
      .upload(fileName, file);

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('card-images')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  };

  const uploadAudio = async (blob, userId) => {
    const fileName = `${userId}/${Date.now()}_${Math.random().toString(36).substr(2, 5)}.webm`;

    const { data, error } = await supabase.storage
      .from('card-audio')
      .upload(fileName, blob, { contentType: 'audio/webm' });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('card-audio')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  };

  const uploadCardMedia = async (mediaFiles, userId) => {
    const urls = {};
    for (const [key, file] of Object.entries(mediaFiles)) {
      if (!file) continue;
      try {
        if (key.includes('image')) {
          const url = await uploadImage(file, userId);
          urls[key] = url;
        } else if (key.includes('audio')) {
          const url = await uploadAudio(file, userId);
          urls[key] = url;
        }
      } catch (err) {
        console.error(`Error uploading ${key}:`, err);
        addToast(`Failed to upload media asset ${key}`, 'error');
      }
    }
    return urls;
  };

  // Helper function to read from IndexedDB and upload to Supabase Storage
  const uploadMediaFromIndexedDB = async (mediaId, bucketName, userId) => {
    if (!mediaId) return null;
    try {
      const record = await getMedia(mediaId);
      if (record && record.blob) {
        const ext = record.filename?.split('.').pop() || (bucketName === 'card-images' ? 'jpg' : 'webm');
        const fileName = `${userId}/${Date.now()}_${Math.random().toString(36).substr(2, 5)}.${ext}`;
        
        const { data, error } = await supabase.storage
          .from(bucketName)
          .upload(fileName, record.blob);

        if (error) throw error;

        const { data: urlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(fileName);

        return urlData.publicUrl;
      }
    } catch (e) {
      console.error(`Failed to upload media ${mediaId} from IndexedDB:`, e);
    }
    return null;
  };

  // Migration from LocalStorage to Supabase
  const migrateLocalDataToSupabase = async (currUser) => {
    try {
      addToast(lang === 'ar' ? 'جاري نقل بياناتك المحلية إلى السحابة...' : 'Migrating local data to cloud...', 'info');

      // 1. Get local decksMetadata
      const localDecks = JSON.parse(localStorage.getItem('decksMetadata') || '[]');
      // 2. Get local cards
      const localCards = JSON.parse(localStorage.getItem('cards') || '[]');
      // 3. Get local schedule
      const localSessions = JSON.parse(localStorage.getItem('schedule') || '[]');
      // 4. Get local quizHistory
      const localQuizHistory = JSON.parse(localStorage.getItem('quizHistory') || '[]');

      // Map of local deck name -> Supabase deck UUID
      const deckNameMap = {};

      // Migrate Decks
      for (const deck of localDecks) {
        const { data: existing } = await supabase
          .from('decks')
          .select('id')
          .eq('name', deck.name)
          .eq('user_id', currUser.id)
          .maybeSingle();

        if (existing) {
          deckNameMap[deck.name] = existing.id;
        } else {
          const { data: inserted } = await supabase
            .from('decks')
            .insert({
              user_id: currUser.id,
              name: deck.name,
              color: deck.color || '#00BCD4',
              created_at: new Date(deck.createdAt || Date.now()).toISOString()
            })
            .select()
            .single();

          if (inserted) {
            deckNameMap[deck.name] = inserted.id;
          }
        }
      }

      // Ensure 'General' is in the map
      if (!deckNameMap['General']) {
        const { data: genDeck } = await supabase
          .from('decks')
          .insert({
            user_id: currUser.id,
            name: 'General',
            color: '#9b51e0'
          })
          .select()
          .single();
        if (genDeck) {
          deckNameMap['General'] = genDeck.id;
        }
      }

      // Migrate Cards
      for (const card of localCards) {
        const deckUuid = deckNameMap[card.deckId] || deckNameMap['General'];
        if (!deckUuid) continue;

        // Upload media files from IndexedDB to Supabase Storage
        const front_image_url = card.media?.question_image?.id || card.media?.question?.id 
          ? await uploadMediaFromIndexedDB(card.media?.question_image?.id || card.media?.question?.id, 'card-images', currUser.id)
          : null;

        const front_audio_url = card.media?.question_audio?.id || card.media?.question?.id
          ? await uploadMediaFromIndexedDB(card.media?.question_audio?.id || card.media?.question?.id, 'card-audio', currUser.id)
          : null;

        const back_image_url = card.media?.answer_image?.id || card.media?.answer?.id || card.media?.notes_image?.id || card.media?.notes?.id
          ? await uploadMediaFromIndexedDB(card.media?.answer_image?.id || card.media?.answer?.id || card.media?.notes_image?.id || card.media?.notes?.id, 'card-images', currUser.id)
          : null;

        const back_audio_url = card.media?.answer_audio?.id || card.media?.answer?.id || card.media?.notes_audio?.id || card.media?.notes?.id
          ? await uploadMediaFromIndexedDB(card.media?.answer_audio?.id || card.media?.answer?.id || card.media?.notes_audio?.id || card.media?.notes?.id, 'card-audio', currUser.id)
          : null;

        const mappedOptions = card.template === 'multiple-choice'
          ? card.options?.map((opt, idx) => ({
              text: opt,
              isCorrect: String.fromCharCode(65 + idx) === card.correctAnswer
            }))
          : null;

        const mappedCorrectAnswer = card.template === 'true-false'
          ? card.correctAnswer === 'True'
          : null;

        await supabase.from('cards').insert({
          user_id: currUser.id,
          deck_id: deckUuid,
          type: card.template || 'flashcard',
          front_text: card.question || '',
          back_text: card.template === 'free-note' ? card.notes : card.answer || '',
          front_image_url,
          front_audio_url,
          back_image_url,
          back_audio_url,
          options: mappedOptions,
          correct_answer: mappedCorrectAnswer,
          tags: [],
          created_at: new Date(card.createdAt || Date.now()).toISOString()
        });
      }

      // Migrate Study Sessions
      for (const session of localSessions) {
        await supabase.from('study_sessions').insert({
          user_id: currUser.id,
          subject: session.subject || 'Study Session',
          date: session.date || new Date().toISOString().split('T')[0],
          start_time: session.time || '12:00',
          duration_minutes: session.duration || 60,
          notes: session.notes || '',
          color: session.color || '#00BCD4',
          completed: false
        });
      }

      // Migrate Quiz Results
      for (const result of localQuizHistory) {
        const deckUuid = deckNameMap[result.deckName] || deckNameMap['General'];
        if (!deckUuid) continue;

        await supabase.from('quiz_results').insert({
          user_id: currUser.id,
          deck_id: deckUuid,
          score: result.score || 0,
          total: result.total || 0,
          percentage: result.total ? (result.score / result.total) * 100 : 0,
          taken_at: new Date(result.date || Date.now()).toISOString()
        });
      }

      // Merge User Settings
      const localTheme = localStorage.getItem('theme') || 'dark';
      const localLang = localStorage.getItem('lang') || 'en';
      const localSettings = JSON.parse(localStorage.getItem('settings') || '{}');

      await supabase.from('user_settings').upsert({
        user_id: currUser.id,
        language: localLang,
        theme: localTheme,
        google_tts_key: localSettings.anthropicKey || '',
        youtube_api_key: localSettings.youtubeKey || ''
      }, { onConflict: 'user_id' });

      // Clear local keys to prevent re-migration
      localStorage.removeItem('decksMetadata');
      localStorage.removeItem('cards');
      localStorage.removeItem('schedule');
      localStorage.removeItem('quizHistory');
      
      // Clear IndexedDB media cache
      await clearAllMedia();

      addToast(lang === 'ar' ? 'اكتملت مزامنة البيانات السحابية بنجاح!' : 'Cloud data synchronization completed successfully!', 'success');
    } catch (e) {
      console.error('Migration failed:', e);
      addToast(lang === 'ar' ? 'فشل نقل بعض البيانات المحلية.' : 'Failed to migrate some local data.', 'error');
    }
  };

  // Auth User Fetch Sync Routine
  useEffect(() => {
    if (!supabase || !user) {
      setCards([]);
      setDecksMetadata([{ name: 'General', color: '#9b51e0', createdAt: Date.now() }]);
      setSchedule([]);
      setQuizHistory([]);
      return;
    }

    const loadData = async () => {
      setIsDataLoading(true);
      try {
        // 1. Check if we need to migrate local data first
        const hasLocalDecks = localStorage.getItem('decksMetadata') !== null;
        const hasLocalCards = localStorage.getItem('cards') !== null;
        if (hasLocalDecks || hasLocalCards) {
          await migrateLocalDataToSupabase(user);
        }

        // 2. Fetch all user data from Supabase
        // Decks
        const { data: dbDecks } = await supabase.from('decks').select('*');
        const formattedDecks = dbDecks ? dbDecks.map(d => ({
          id: d.id,
          name: d.name,
          color: d.color,
          createdAt: new Date(d.created_at).getTime()
        })) : [];

        // Ensure General deck metadata is present
        if (formattedDecks.length === 0 || !formattedDecks.some(d => d.name === 'General')) {
          const { data: genDeck } = await supabase.from('decks').insert({
            user_id: user.id,
            name: 'General',
            color: '#9b51e0'
          }).select().single();
          if (genDeck) {
            formattedDecks.push({
              id: genDeck.id,
              name: genDeck.name,
              color: genDeck.color,
              createdAt: new Date(genDeck.created_at).getTime()
            });
          }
        }
        setDecksMetadata(formattedDecks);

        // Cards
        const { data: dbCards } = await supabase.from('cards').select('*');
        const formattedCards = dbCards ? dbCards.map(c => {
          const deck = formattedDecks.find(d => d.id === c.deck_id);
          return {
            id: c.id,
            deckId: deck ? deck.name : 'General',
            template: c.type,
            question: c.front_text,
            answer: c.back_text,
            options: c.options || [],
            correctAnswer: c.type === 'true_false'
              ? (c.correct_answer ? 'True' : 'False')
              : (c.options && c.options.findIndex(o => o.isCorrect) !== -1
                  ? String.fromCharCode(65 + c.options.findIndex(o => o.isCorrect))
                  : ''),
            notes: c.type === 'free-note' ? c.back_text : '',
            media: {
              question_image: c.front_image_url ? { url: c.front_image_url, type: 'image/*' } : null,
              question_audio: c.front_audio_url ? { url: c.front_audio_url, type: 'audio/*' } : null,
              answer_image: c.back_image_url ? { url: c.back_image_url, type: 'image/*' } : null,
              answer_audio: c.back_audio_url ? { url: c.back_audio_url, type: 'audio/*' } : null,
              notes_image: c.type === 'free-note' && c.back_image_url ? { url: c.back_image_url, type: 'image/*' } : null,
              notes_audio: c.type === 'free-note' && c.back_audio_url ? { url: c.back_audio_url, type: 'audio/*' } : null,
            },
            createdAt: new Date(c.created_at).getTime()
          };
        }) : [];
        setCards(formattedCards);

        // Study Schedule Planner
        const { data: dbSessions } = await supabase.from('study_sessions').select('*');
        const formattedSessions = dbSessions ? dbSessions.map(s => ({
          id: s.id,
          subject: s.subject,
          date: s.date,
          time: s.start_time?.substring(0, 5) || '12:00',
          duration: s.duration_minutes,
          notes: s.notes,
          color: s.color,
          completed: s.completed
        })) : [];
        setSchedule(formattedSessions);

        // Quiz History
        const { data: dbResults } = await supabase.from('quiz_results').select('*');
        const formattedResults = dbResults ? dbResults.map(r => {
          const deck = formattedDecks.find(d => d.id === r.deck_id);
          return {
            id: r.id,
            date: new Date(r.taken_at).toLocaleDateString(),
            deckName: deck ? deck.name : 'General',
            score: r.score,
            total: r.total
          };
        }) : [];
        setQuizHistory(formattedResults);

        // User Settings
        const { data: dbSettings } = await supabase.from('user_settings').select('*').maybeSingle();
        if (dbSettings) {
          if (dbSettings.language) setLang(dbSettings.language);
          if (dbSettings.theme) setTheme(dbSettings.theme);
          setSettings({
            anthropicKey: dbSettings.google_tts_key || '',
            youtubeKey: dbSettings.youtube_api_key || '',
            corsProxy: ''
          });
        } else {
          await supabase.from('user_settings').insert({
            user_id: user.id,
            language: lang,
            theme: theme,
            google_tts_key: settings.anthropicKey || '',
            youtube_api_key: settings.youtubeKey || ''
          });
        }

      } catch (err) {
        console.error('Failed to load user data from Supabase:', err);
      } finally {
        setIsDataLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Realtime subscriber for Cards
  useEffect(() => {
    if (!supabase || !user || decksMetadata.length <= 1) return;

    const channel = supabase
      .channel('realtime-cards')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'cards', filter: `user_id=eq.${user.id}` },
        async (payload) => {
          const { data: dbCards } = await supabase.from('cards').select('*');
          if (dbCards) {
            const formattedCards = dbCards.map(c => {
              const deck = decksMetadata.find(d => d.id === c.deck_id);
              return {
                id: c.id,
                deckId: deck ? deck.name : 'General',
                template: c.type,
                question: c.front_text,
                answer: c.back_text,
                options: c.options || [],
                correctAnswer: c.type === 'true_false'
                  ? (c.correct_answer ? 'True' : 'False')
                  : (c.options && c.options.findIndex(o => o.isCorrect) !== -1
                      ? String.fromCharCode(65 + c.options.findIndex(o => o.isCorrect))
                      : ''),
                notes: c.type === 'free-note' ? c.back_text : '',
                media: {
                  question_image: c.front_image_url ? { url: c.front_image_url, type: 'image/*' } : null,
                  question_audio: c.front_audio_url ? { url: c.front_audio_url, type: 'audio/*' } : null,
                  answer_image: c.back_image_url ? { url: c.back_image_url, type: 'image/*' } : null,
                  answer_audio: c.back_audio_url ? { url: c.back_audio_url, type: 'audio/*' } : null,
                  notes_image: c.type === 'free-note' && c.back_image_url ? { url: c.back_image_url, type: 'image/*' } : null,
                  notes_audio: c.type === 'free-note' && c.back_audio_url ? { url: c.back_audio_url, type: 'audio/*' } : null,
                },
                createdAt: new Date(c.created_at).getTime()
              };
            });
            setCards(formattedCards);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, decksMetadata]);

  // Sync state changes to LocalStorage and user_settings table
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    if (supabase && user) {
      supabase.from('user_settings').upsert({
        user_id: user.id,
        theme,
        language: lang,
        google_tts_key: settings.anthropicKey || '',
        youtube_api_key: settings.youtubeKey || ''
      }, { onConflict: 'user_id' }).then(({ error }) => {
        if (error) console.error('Error updating theme in Supabase:', error);
      });
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('lang', lang);
    if (supabase && user) {
      supabase.from('user_settings').upsert({
        user_id: user.id,
        theme,
        language: lang,
        google_tts_key: settings.anthropicKey || '',
        youtube_api_key: settings.youtubeKey || ''
      }, { onConflict: 'user_id' }).then(({ error }) => {
        if (error) console.error('Error updating lang in Supabase:', error);
      });
    }
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('showOnboarding', showOnboarding.toString());
  }, [showOnboarding]);

  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify(settings));
    if (supabase && user) {
      supabase.from('user_settings').upsert({
        user_id: user.id,
        theme,
        language: lang,
        google_tts_key: settings.anthropicKey || '',
        youtube_api_key: settings.youtubeKey || ''
      }, { onConflict: 'user_id' }).then(({ error }) => {
        if (error) console.error('Error updating settings in Supabase:', error);
      });
    }
  }, [settings]);

  // Theme Actions
  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  // Decks list (derived from decksMetadata)
  const decks = decksMetadata.map(d => d.name);

  // Deck Folder Actions
  const addDeck = async (name, color = '#9b51e0') => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (decksMetadata.some(d => d.name.toLowerCase() === trimmed.toLowerCase())) {
      return;
    }

    let newDeck = {
      name: trimmed,
      color,
      createdAt: Date.now()
    };

    if (supabase && user) {
      try {
        const { data, error } = await supabase
          .from('decks')
          .insert({ name: trimmed, color, user_id: user.id })
          .select()
          .single();
        if (error) throw error;
        newDeck.id = data.id;
        newDeck.createdAt = new Date(data.created_at).getTime();
      } catch (e) {
        console.error(e);
        addToast('Failed to create deck on server.', 'error');
        return;
      }
    }

    setDecksMetadata(prev => [...prev, newDeck]);
    addToast(`Deck "${trimmed}" created!`, 'success');
  };

  const deleteDeck = async (deckName) => {
    if (deckName === 'General') {
      addToast('Cannot delete the General default deck.', 'error');
      return;
    }

    if (supabase && user) {
      try {
        const deckMeta = decksMetadata.find(d => d.name === deckName);
        if (deckMeta && deckMeta.id) {
          const { error } = await supabase.from('decks').delete().eq('id', deckMeta.id);
          if (error) throw error;
        }
      } catch (e) {
        console.error(e);
        addToast('Failed to delete deck on server.', 'error');
        return;
      }
    }

    setCards(prev => prev.filter(c => c.deckId !== deckName));
    setDecksMetadata(prev => prev.filter(d => d.name !== deckName));
    addToast(`Deck "${deckName}" removed.`, 'info');
  };

  // Card Actions
  const addCard = async (cardData, mediaFiles = {}) => {
    const assignedDeck = cardData.deckId || 'General';
    let deckUuid = null;
    let deckMeta = decksMetadata.find(d => d.name === assignedDeck);

    if (supabase && user) {
      try {
        if (!deckMeta) {
          const colors = ['#9b51e0', '#00f2fe', '#f59e0b', '#10b981', '#f43f5e'];
          const randomColor = colors[Math.floor(Math.random() * colors.length)];
          const { data: newDeck, error: deckErr } = await supabase
            .from('decks')
            .insert({ name: assignedDeck, color: randomColor, user_id: user.id })
            .select()
            .single();
          if (deckErr) throw deckErr;
          deckMeta = {
            id: newDeck.id,
            name: newDeck.name,
            color: newDeck.color,
            createdAt: new Date(newDeck.created_at).getTime()
          };
          setDecksMetadata(prev => [...prev, deckMeta]);
        }
        deckUuid = deckMeta.id;

        const uploadedUrls = await uploadCardMedia(mediaFiles, user.id);

        const mappedOptions = cardData.template === 'multiple-choice'
          ? cardData.options?.map((opt, idx) => ({
              text: opt,
              isCorrect: String.fromCharCode(65 + idx) === cardData.correctAnswer
            }))
          : null;

        const mappedCorrectAnswer = cardData.template === 'true-false'
          ? cardData.correctAnswer === 'True'
          : null;

        const { data: dbCard, error: cardErr } = await supabase
          .from('cards')
          .insert({
            user_id: user.id,
            deck_id: deckUuid,
            type: cardData.template || 'flashcard',
            front_text: cardData.question || '',
            back_text: cardData.template === 'free-note' ? cardData.notes : cardData.answer || '',
            front_image_url: uploadedUrls.question_image || null,
            front_audio_url: uploadedUrls.question_audio || null,
            back_image_url: uploadedUrls.answer_image || uploadedUrls.notes_image || null,
            back_audio_url: uploadedUrls.answer_audio || uploadedUrls.notes_audio || null,
            options: mappedOptions,
            correct_answer: mappedCorrectAnswer,
            tags: []
          })
          .select()
          .single();

        if (cardErr) throw cardErr;

        const newCard = {
          id: dbCard.id,
          deckId: assignedDeck,
          template: dbCard.type,
          question: dbCard.front_text,
          answer: dbCard.type === 'free-note' ? '' : dbCard.back_text,
          options: cardData.options || [],
          correctAnswer: cardData.correctAnswer || '',
          notes: dbCard.type === 'free-note' ? dbCard.back_text : '',
          media: {
            question_image: dbCard.front_image_url ? { url: dbCard.front_image_url, type: 'image/*' } : null,
            question_audio: dbCard.front_audio_url ? { url: dbCard.front_audio_url, type: 'audio/*' } : null,
            answer_image: dbCard.back_image_url ? { url: dbCard.back_image_url, type: 'image/*' } : null,
            answer_audio: dbCard.back_audio_url ? { url: dbCard.back_audio_url, type: 'audio/*' } : null,
            notes_image: dbCard.type === 'free-note' && dbCard.back_image_url ? { url: dbCard.back_image_url, type: 'image/*' } : null,
            notes_audio: dbCard.type === 'free-note' && dbCard.back_audio_url ? { url: dbCard.back_audio_url, type: 'audio/*' } : null,
          },
          createdAt: new Date(dbCard.created_at).getTime()
        };

        setCards(prev => [newCard, ...prev]);
        addToast('Card created successfully!', 'success');

      } catch (e) {
        console.error(e);
        addToast('Failed to create card on server.', 'error');
      }
    }
  };

  const updateCard = async (cardId, updatedData, mediaFiles = {}, deletedMediaIds = []) => {
    if (supabase && user) {
      try {
        const currentCard = cards.find(c => c.id === cardId);
        if (!currentCard) return;

        let deckUuid = null;
        if (updatedData.deckId) {
          let deckMeta = decksMetadata.find(d => d.name === updatedData.deckId);
          if (!deckMeta) {
            const colors = ['#9b51e0', '#00f2fe', '#f59e0b', '#10b981', '#f43f5e'];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            const { data: newDeck, error: deckErr } = await supabase
              .from('decks')
              .insert({ name: updatedData.deckId, color: randomColor, user_id: user.id })
              .select()
              .single();
            if (deckErr) throw deckErr;
            deckMeta = {
              id: newDeck.id,
              name: newDeck.name,
              color: newDeck.color,
              createdAt: new Date(newDeck.created_at).getTime()
            };
            setDecksMetadata(prev => [...prev, deckMeta]);
          }
          deckUuid = deckMeta.id;
        }

        const uploadedUrls = await uploadCardMedia(mediaFiles, user.id);

        const mappedOptions = updatedData.template === 'multiple-choice'
          ? updatedData.options?.map((opt, idx) => ({
              text: opt,
              isCorrect: String.fromCharCode(65 + idx) === updatedData.correctAnswer
            }))
          : null;

        const mappedCorrectAnswer = updatedData.template === 'true-false'
          ? updatedData.correctAnswer === 'True'
          : null;

        const updates = {
          updated_at: new Date().toISOString()
        };
        if (deckUuid) updates.deck_id = deckUuid;
        if (updatedData.template) updates.type = updatedData.template;
        if (updatedData.question !== undefined) updates.front_text = updatedData.question;
        
        if (updatedData.template === 'free-note') {
          if (updatedData.notes !== undefined) updates.back_text = updatedData.notes;
        } else {
          if (updatedData.answer !== undefined) updates.back_text = updatedData.answer;
        }

        if (mappedOptions !== null) updates.options = mappedOptions;
        if (mappedCorrectAnswer !== null) updates.correct_answer = mappedCorrectAnswer;

        if (uploadedUrls.question_image) updates.front_image_url = uploadedUrls.question_image;
        if (uploadedUrls.question_audio) updates.front_audio_url = uploadedUrls.question_audio;
        
        if (updatedData.template === 'free-note') {
          if (uploadedUrls.notes_image) updates.back_image_url = uploadedUrls.notes_image;
          if (uploadedUrls.notes_audio) updates.back_audio_url = uploadedUrls.notes_audio;
        } else {
          if (uploadedUrls.answer_image) updates.back_image_url = uploadedUrls.answer_image;
          if (uploadedUrls.answer_audio) updates.back_audio_url = uploadedUrls.answer_audio;
        }

        const { data: dbCard, error } = await supabase
          .from('cards')
          .update(updates)
          .eq('id', cardId)
          .select()
          .single();

        if (error) throw error;

        setCards(prev => prev.map(c => {
          if (c.id === cardId) {
            const finalDeckName = updatedData.deckId || c.deckId;
            return {
              ...c,
              deckId: finalDeckName,
              template: dbCard.type,
              question: dbCard.front_text,
              answer: dbCard.type === 'free-note' ? '' : dbCard.back_text,
              options: updatedData.options ?? c.options,
              correctAnswer: updatedData.correctAnswer ?? c.correctAnswer,
              notes: dbCard.type === 'free-note' ? dbCard.back_text : '',
              media: {
                question_image: dbCard.front_image_url ? { url: dbCard.front_image_url, type: 'image/*' } : c.media?.question_image,
                question_audio: dbCard.front_audio_url ? { url: dbCard.front_audio_url, type: 'audio/*' } : c.media?.question_audio,
                answer_image: dbCard.back_image_url ? { url: dbCard.back_image_url, type: 'image/*' } : c.media?.answer_image,
                answer_audio: dbCard.back_audio_url ? { url: dbCard.back_audio_url, type: 'audio/*' } : c.media?.answer_audio,
                notes_image: dbCard.type === 'free-note' && dbCard.back_image_url ? { url: dbCard.back_image_url, type: 'image/*' } : c.media?.notes_image,
                notes_audio: dbCard.type === 'free-note' && dbCard.back_audio_url ? { url: dbCard.back_audio_url, type: 'audio/*' } : c.media?.notes_audio,
              }
            };
          }
          return c;
        }));
        
        addToast('Card updated successfully!', 'success');

      } catch (e) {
        console.error(e);
        addToast('Failed to update card on server.', 'error');
      }
    }
  };

  const deleteCard = async (cardId) => {
    if (supabase && user) {
      try {
        const { error } = await supabase.from('cards').delete().eq('id', cardId);
        if (error) throw error;
      } catch (e) {
        console.error(e);
        addToast('Failed to delete card from server.', 'error');
        return;
      }
    }

    setCards(prev => prev.filter(c => c.id !== cardId));
    addToast('Card deleted.', 'info');
  };

  // Schedule Actions
  const addSession = async (sessionData) => {
    let newSession = {
      subject: sessionData.subject || 'Study Session',
      date: sessionData.date || new Date().toISOString().split('T')[0],
      time: sessionData.time || '12:00',
      duration: parseInt(sessionData.duration, 10) || 60,
      notes: sessionData.notes || '',
      color: sessionData.color || '#9b51e0'
    };

    if (supabase && user) {
      try {
        const { data, error } = await supabase
          .from('study_sessions')
          .insert({
            user_id: user.id,
            subject: newSession.subject,
            date: newSession.date,
            start_time: newSession.time,
            duration_minutes: newSession.duration,
            notes: newSession.notes,
            color: newSession.color,
            completed: false
          })
          .select()
          .single();

        if (error) throw error;
        newSession.id = data.id;
      } catch (e) {
        console.error(e);
        addToast('Failed to schedule session on server.', 'error');
        return;
      }
    } else {
      newSession.id = Date.now().toString();
    }

    setSchedule(prev => [...prev, newSession]);
    addToast('Session added to planner!', 'success');
  };

  const deleteSession = async (sessionId) => {
    if (supabase && user) {
      try {
        const { error } = await supabase.from('study_sessions').delete().eq('id', sessionId);
        if (error) throw error;
      } catch (e) {
        console.error(e);
        addToast('Failed to delete session on server.', 'error');
        return;
      }
    }

    setSchedule(prev => prev.filter(s => s.id !== sessionId));
    addToast('Session removed.', 'info');
  };

  // Quiz Performance
  const addQuizResult = async (result) => {
    let newResult = {
      date: new Date().toLocaleDateString(),
      deckName: result.deckName,
      score: result.score,
      total: result.total
    };

    if (supabase && user) {
      try {
        const deckMeta = decksMetadata.find(d => d.name === result.deckName) || decksMetadata.find(d => d.name === 'General');
        if (deckMeta) {
          const { data, error } = await supabase
            .from('quiz_results')
            .insert({
              user_id: user.id,
              deck_id: deckMeta.id,
              score: result.score,
              total: result.total,
              percentage: (result.score / result.total) * 100
            })
            .select()
            .single();

          if (error) throw error;
          newResult.id = data.id;
          newResult.date = new Date(data.taken_at).toLocaleDateString();
        }
      } catch (e) {
        console.error(e);
        addToast('Failed to save quiz result to server.', 'error');
      }
    } else {
      newResult.id = Date.now().toString();
    }

    setQuizHistory(prev => [newResult, ...prev]);
  };

  // ZIP Export & Import using JSZip
  const exportDeck = async (deckName) => {
    const deckCards = cards.filter(c => c.deckId === deckName);
    if (deckCards.length === 0) {
      addToast('No cards to export in this deck.', 'error');
      return;
    }

    try {
      addToast('Preparing export ZIP...', 'info');
      const zip = new JSZip();
      
      zip.file('deck_metadata.json', JSON.stringify(deckCards, null, 2));

      for (const card of deckCards) {
        if (card.media) {
          for (const field of Object.keys(card.media)) {
            const mediaItem = card.media[field];
            if (mediaItem?.url) {
              try {
                const res = await fetch(mediaItem.url);
                const blob = await res.blob();
                const pathParts = mediaItem.url.split('/');
                const filename = pathParts[pathParts.length - 1];
                zip.file(`media/${filename}`, blob);
              } catch (e) {
                console.error('Failed to download media for zip export:', e);
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

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${deckName.replace(/\s+/g, '_')}_Di0Learning.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      addToast('Deck exported successfully!', 'success');
    } catch (error) {
      console.error(error);
      addToast('Export failed.', 'error');
    }
  };

  const importDeck = async (file) => {
    if (!file) return;

    try {
      addToast('Importing ZIP package...', 'info');
      const zip = await JSZip.loadAsync(file);
      
      const metadataFile = zip.file('deck_metadata.json');
      if (!metadataFile) {
        addToast('Invalid ZIP: Missing deck_metadata.json', 'error');
        return;
      }

      const metadataText = await metadataFile.async('text');
      const importedCards = JSON.parse(metadataText);

      if (!Array.isArray(importedCards)) {
        addToast('Invalid card schema in metadata file.', 'error');
        return;
      }

      const newCardsList = [...cards];

      for (const card of importedCards) {
        const newCardId = supabase && user ? null : (Date.now().toString() + '_' + Math.random().toString(36).substr(2, 5));
        card.createdAt = Date.now();

        let deckMeta = decksMetadata.find(d => d.name === card.deckId);
        if (!deckMeta) {
          const colors = ['#9b51e0', '#00f2fe', '#f59e0b', '#10b981', '#f43f5e'];
          const randomColor = colors[Math.floor(Math.random() * colors.length)];
          
          if (supabase && user) {
            const { data: newDeck } = await supabase
              .from('decks')
              .insert({ name: card.deckId, color: randomColor, user_id: user.id })
              .select()
              .single();
            if (newDeck) {
              deckMeta = {
                id: newDeck.id,
                name: newDeck.name,
                color: newDeck.color,
                createdAt: new Date(newDeck.created_at).getTime()
              };
            }
          } else {
            deckMeta = {
              name: card.deckId,
              color: randomColor,
              createdAt: Date.now()
            };
          }
          if (deckMeta) {
            setDecksMetadata(prev => [...prev, deckMeta]);
          }
        }

        const mediaUrls = {};
        if (card.media) {
          for (const field of Object.keys(card.media)) {
            const mediaItem = card.media[field];
            if (!mediaItem) continue;
            const zipMediaFile = zip.file(`media/${mediaItem.id}`) || zip.file(mediaItem.id) || Object.values(zip.files).find(f => f.name.includes(mediaItem.id || ''));
            
            if (zipMediaFile) {
              const fileBlob = await zipMediaFile.async('blob');
              
              if (supabase && user) {
                const bucket = field.includes('audio') ? 'card-audio' : 'card-images';
                const fileExt = mediaItem.name?.split('.').pop() || (bucket === 'card-images' ? 'jpg' : 'webm');
                const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substr(2, 5)}.${fileExt}`;
                
                const { data } = await supabase.storage.from(bucket).upload(fileName, fileBlob);
                if (data) {
                  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
                  mediaUrls[field] = { url: urlData.publicUrl, type: mediaItem.type, name: mediaItem.name };
                }
              } else {
                const newMediaId = `media_${newCardId}_${field}_${Date.now()}`;
                const typedBlob = new Blob([fileBlob], { type: mediaItem.type });
                await saveMedia(newMediaId, typedBlob, mediaItem.name);
                
                mediaUrls[field] = {
                  id: newMediaId,
                  name: mediaItem.name,
                  type: mediaItem.type
                };
              }
            }
          }
        }

        if (supabase && user) {
          const mappedOptions = card.template === 'multiple-choice'
            ? card.options?.map((opt, idx) => ({
                text: opt,
                isCorrect: String.fromCharCode(65 + idx) === card.correctAnswer
              }))
            : null;

          const mappedCorrectAnswer = card.template === 'true-false'
            ? card.correctAnswer === 'True'
            : null;

          const { data: dbCard } = await supabase
            .from('cards')
            .insert({
              user_id: user.id,
              deck_id: deckMeta.id,
              type: card.template || 'flashcard',
              front_text: card.question || '',
              back_text: card.template === 'free-note' ? card.notes : card.answer || '',
              front_image_url: mediaUrls.question_image?.url || mediaUrls.question?.url || null,
              front_audio_url: mediaUrls.question_audio?.url || null,
              back_image_url: mediaUrls.answer_image?.url || mediaUrls.notes_image?.url || mediaUrls.answer?.url || mediaUrls.notes?.url || null,
              back_audio_url: mediaUrls.answer_audio?.url || mediaUrls.notes_audio?.url || null,
              options: mappedOptions,
              correct_answer: mappedCorrectAnswer,
              tags: []
            })
            .select()
            .single();

          if (dbCard) {
            const formattedCard = {
              id: dbCard.id,
              deckId: card.deckId,
              template: dbCard.type,
              question: dbCard.front_text,
              answer: dbCard.type === 'free-note' ? '' : dbCard.back_text,
              options: card.options || [],
              correctAnswer: card.correctAnswer || '',
              notes: dbCard.type === 'free-note' ? dbCard.back_text : '',
              media: {
                question_image: dbCard.front_image_url ? { url: dbCard.front_image_url, type: 'image/*' } : null,
                question_audio: dbCard.front_audio_url ? { url: dbCard.front_audio_url, type: 'audio/*' } : null,
                answer_image: dbCard.back_image_url ? { url: dbCard.back_image_url, type: 'image/*' } : null,
                answer_audio: dbCard.back_audio_url ? { url: dbCard.back_audio_url, type: 'audio/*' } : null,
                notes_image: dbCard.type === 'free-note' && dbCard.back_image_url ? { url: dbCard.back_image_url, type: 'image/*' } : null,
                notes_audio: dbCard.type === 'free-note' && dbCard.back_audio_url ? { url: dbCard.back_audio_url, type: 'audio/*' } : null,
              },
              createdAt: new Date(dbCard.created_at).getTime()
            };
            newCardsList.unshift(formattedCard);
          }
        } else {
          card.id = newCardId;
          card.media = mediaUrls;
          newCardsList.unshift(card);
        }
      }

      setCards(newCardsList);
      addToast(`Imported ${importedCards.length} cards!`, 'success');
    } catch (error) {
      console.error(error);
      addToast('Failed to import deck. Ensure files are valid ZIP formats.', 'error');
    }
  };

  const importAnkiDeck = async (importedCards, importedDecks, mediaAssets) => {
    try {
      const newDecksMetadata = [...decksMetadata];
      const colors = ['#9b51e0', '#00f2fe', '#f59e0b', '#10b981', '#f43f5e'];
      const deckNameMap = {};

      for (const deckName of importedDecks) {
        let deckMeta = newDecksMetadata.find(d => d.name.toLowerCase() === deckName.toLowerCase());
        if (!deckMeta) {
          const color = colors[Math.floor(Math.random() * colors.length)];
          if (supabase && user) {
            const { data } = await supabase
              .from('decks')
              .insert({ name: deckName, color, user_id: user.id })
              .select()
              .single();
            if (data) {
              deckMeta = {
                id: data.id,
                name: data.name,
                color: data.color,
                createdAt: new Date(data.created_at).getTime()
              };
            }
          } else {
            deckMeta = {
              name: deckName,
              color,
              createdAt: Date.now()
            };
          }
          if (deckMeta) {
            newDecksMetadata.push(deckMeta);
          }
        }
        if (deckMeta) {
          deckNameMap[deckName] = deckMeta.id;
        }
      }
      setDecksMetadata(newDecksMetadata);

      for (const [filename, blob] of Object.entries(mediaAssets)) {
        if (supabase && user) {
          const isAudio = filename.endsWith('.mp3') || filename.endsWith('.wav') || filename.endsWith('.ogg') || filename.endsWith('.webm');
          const bucket = isAudio ? 'card-audio' : 'card-images';
          const path = `${user.id}/${filename}`;
          await supabase.storage.from(bucket).upload(path, blob, { upsert: true });
        } else {
          for (const deckName of importedDecks) {
            await saveMedia(`ankimedia_${deckName}_${filename}`, blob, filename);
          }
          await saveMedia(`ankimedia_General_${filename}`, blob, filename);
        }
      }

      const newCards = [...cards];
      for (const card of importedCards) {
        if (supabase && user) {
          const deckUuid = deckNameMap[card.deckId] || deckNameMap['General'];
          const { data: dbCard } = await supabase
            .from('cards')
            .insert({
              user_id: user.id,
              deck_id: deckUuid,
              type: 'flashcard',
              front_text: card.question || '',
              back_text: card.answer || '',
              tags: []
            })
            .select()
            .single();

          if (dbCard) {
            newCards.unshift({
              id: dbCard.id,
              deckId: card.deckId,
              template: 'flashcard',
              question: dbCard.front_text,
              answer: dbCard.back_text,
              options: [],
              correctAnswer: '',
              notes: '',
              media: {},
              createdAt: new Date(dbCard.created_at).getTime()
            });
          }
        } else {
          const newCardId = Date.now().toString() + '_' + Math.random().toString(36).substr(2, 5);
          newCards.unshift({
            id: newCardId,
            deckId: card.deckId,
            template: 'flashcard',
            question: card.question,
            answer: card.answer,
            options: [],
            correctAnswer: '',
            notes: '',
            media: {},
            createdAt: Date.now()
          });
        }
      }
      setCards(newCards);
      
      addToast(`Imported ${importedCards.length} cards into ${importedDecks.length} decks successfully!`, 'success');
    } catch (e) {
      console.error(e);
      addToast('Anki import failed during database writing.', 'error');
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
        user,
        setUser,
        isDataLoading
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
