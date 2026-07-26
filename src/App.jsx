import React, { useState, useEffect, useContext } from "react";
import "./App.css";
import {
  useLocation,
  useNavigate,
  Link,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AppContext, AppProvider } from "./context/AppContext";
import Dashboard from "./components/Dashboard";
import MyCards from "./components/MyCards";
import NewCard from "./components/NewCard";
import Schedule from "./components/Schedule";
import QuizMode from "./components/QuizMode";
import WordSearch from "./components/WordSearch";
import Translator from "./components/Translator";
import Settings from "./components/Settings";

import {
  Home,
  BookOpen,
  Plus,
  Calendar,
  Brain,
  Video,
  Languages,
  Settings as SettingsIcon,
  Sparkles,
  X,
  Sun,
  Moon,
  ChevronRight,
} from "lucide-react";

// 1B. Create Navbar Component
function Navbar({
  activeTab,
  t,
  lang,
  toggleLang,
  theme,
  toggleTheme,
  navLinks,
}) {
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const currentLink = navLinks ? navLinks.find((l) => l.id === activeTab) : null;

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="mobile-header-bar">
        <div className="sidebar-logo" style={{ marginBottom: 0 }}>
          <div className="sidebar-logo-icon" style={{ width: "30px", height: "30px", fontSize: "0.85rem" }}>
            d0
          </div>
          <span className="gradient-text" style={{ fontSize: "1.1rem" }}>
            Di0 Learning
          </span>
        </div>
        <button className="hamburger-btn" onClick={() => setIsDrawerOpen(true)}>
          ☰
        </button>
      </div>

      {/* Drawer Backdrop */}
      <div
        className={`drawer-backdrop ${isDrawerOpen ? "open" : ""}`}
        onClick={() => setIsDrawerOpen(false)}
      />

      {/* Mobile Drawer */}
      <div className={`mobile-drawer ${isDrawerOpen ? "open" : ""}`}>
        <div className="drawer-logo">
          <div className="sidebar-logo-icon">
            d0
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span className="gradient-text" style={{ lineHeight: 1 }}>Di0 Learning</span>
            <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginTop: "2px", fontWeight: 600 }}>AI STUDY SUITE</span>
          </div>
        </div>

        <ul className="drawer-links">
          {navLinks &&
            navLinks.map((link) => (
              <li key={link.id}>
                <Link
                  to={link.id === "home" ? "/" : `/${link.id}`}
                  className={`drawer-item ${activeTab === link.id ? "active" : ""}`}
                  onClick={() => setIsDrawerOpen(false)}
                >
                  <span className="nav-item-icon">{link.icon}</span>
                  <span>{t(link.id)}</span>
                </Link>
              </li>
            ))}
        </ul>

        <div className="drawer-footer">
          <div className="drawer-actions">
            {/* Language Switcher */}
            <button
              className="btn btn-secondary"
              onClick={toggleLang}
              style={{
                padding: "8px 14px",
                fontSize: "0.85rem",
                fontWeight: "bold",
                flex: 1,
              }}
            >
              🌐 {lang === "en" ? "العربية (AR)" : "English (EN)"}
            </button>
            {/* Theme Toggle */}
            <button
              className="btn btn-secondary btn-icon"
              onClick={toggleTheme}
              style={{ width: "38px", height: "38px" }}
            >
              {theme === "dark" ? <Sun size={16} color="var(--accent-cyan)" /> : <Moon size={16} color="var(--accent-amber)" />}
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Top Header Navbar */}
      <nav className="desktop-navbar">
        <div className="header-title-badge">
          {currentLink && <span className="header-title-icon">{currentLink.icon}</span>}
          <h2 className="header-title-text">
            {t(activeTab)}
          </h2>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Quick Keyboard Hotkey Tip Badge */}
          <div className="hotkey-tip-pill">
            <span style={{ opacity: 0.7 }}>Hotkey:</span>
            <kbd>Alt</kbd> + <kbd>{activeTab.charAt(0).toUpperCase()}</kbd>
          </div>

          {/* Language Switcher */}
          <button
            className="btn btn-secondary"
            onClick={toggleLang}
            style={{
              padding: "7px 14px",
              fontSize: "0.85rem",
              fontWeight: "700",
              minWidth: "85px",
              borderRadius: "10px",
            }}
          >
            🌐 {lang === "en" ? "AR" : "EN"}
          </button>

          {/* Theme Toggle */}
          <button
            className="btn btn-secondary btn-icon"
            onClick={toggleTheme}
            style={{ width: "38px", height: "38px" }}
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === "dark" ? <Sun size={16} color="var(--accent-cyan)" /> : <Moon size={16} color="var(--accent-amber)" />}
          </button>
        </div>
      </nav>
    </>
  );
}

function AppContent() {
  const {
    activeTab,
    setActiveTab,
    lang,
    toggleLang,
    t,
    theme,
    toggleTheme,
    showOnboarding,
    setShowOnboarding,
    toasts,
    removeToast,
    isDataLoading,
  } = useContext(AppContext);

  const navigate = useNavigate();
  const location = useLocation();

  // Synchronize location path with activeTab state
  useEffect(() => {
    const path = location.pathname.substring(1);
    if (!path) {
      setActiveTab("home");
    } else if (
      [
        "home",
        "cards",
        "new-card",
        "schedule",
        "quiz",
        "ai-assistant",
        "word-search",
        "translator",
        "settings",
      ].includes(path)
    ) {
      setActiveTab(path);
    }
  }, [location, setActiveTab]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey) {
        const key = e.key.toLowerCase();
        const routes = {
          h: "/",
          c: "/cards",
          n: "/new-card",
          q: "/quiz",
          a: "/ai-assistant",
          s: "/schedule",
          w: "/word-search",
          t: "/translator",
          k: "/settings",
        };
        if (routes[key]) {
          e.preventDefault();
          navigate(routes[key]);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  const navLinks = [
    { id: "home", icon: <Home size={18} /> },
    { id: "cards", icon: <BookOpen size={18} /> },
    { id: "new-card", icon: <Plus size={18} /> },
    { id: "schedule", icon: <Calendar size={18} /> },
    { id: "quiz", icon: <Brain size={18} /> },
    { id: "ai-assistant", icon: <Sparkles size={18} /> },
    { id: "word-search", icon: <Video size={18} /> },
    { id: "translator", icon: <Languages size={18} /> },
    { id: "settings", icon: <SettingsIcon size={18} /> },
  ];

  if (isDataLoading) {
    return (
      <div
        className="crop-overlay-container"
        style={{
          position: "fixed",
          background: "var(--bg-primary)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          className="glass-card"
          style={{
            padding: "40px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "20px",
            textAlign: "center",
          }}
        >
          <div
            className="loading-spinner"
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              border: "4px solid var(--border-color)",
              borderTopColor: "var(--accent-violet)",
              animation: "spin 1s linear infinite",
            }}
          />
          <h3 style={{ color: "var(--accent-cyan)" }}>
            {lang === "ar" ? "جاري تحميل البيانات..." : "Loading Cloud Sync..."}
          </h3>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container" dir={lang === "ar" ? "rtl" : "ltr"}>
      {/* Toast Notification Container */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            <span style={{ fontSize: "0.9rem", fontWeight: 500 }}>
              {toast.message}
            </span>
            <button
              className="btn btn-secondary btn-icon"
              style={{
                width: "20px",
                height: "20px",
                background: "transparent",
                border: "none",
                color: "inherit",
              }}
              onClick={() => removeToast(toast.id)}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <Routes>
        {/* App routes wrapper */}
        <Route
          path="/*"
          element={
              <div style={{ display: "flex", width: "100%" }}>
                {/* 1. Desktop Sidebar Navigation */}
                <aside className="app-sidebar">
                  <div className="sidebar-logo">
                    <div className="sidebar-logo-icon">
                      d0
                    </div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span className="gradient-text" style={{ lineHeight: 1 }}>Di0 Learning</span>
                      <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginTop: "2px", fontWeight: 600, letterSpacing: "0.05em" }}>AI STUDY SUITE</span>
                    </div>
                  </div>

                  <nav style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
                    {/* Section 1: Main */}
                    <div>
                      <div className="nav-section-title">
                        {lang === "ar" ? "الرئيسية" : "MAIN DASHBOARD"}
                      </div>
                      <ul className="nav-links">
                        {[
                          { id: "home",     icon: <Home size={18} />,     color: "#00f2fe" },
                          { id: "cards",    icon: <BookOpen size={18} />, color: "#4facfe" },
                          { id: "new-card", icon: <Plus size={18} />,     color: "#43e97b" },
                          { id: "schedule", icon: <Calendar size={18} />, color: "#f59e0b" },
                        ].map((link) => (
                          <li key={link.id}>
                            <Link
                              to={link.id === "home" ? "/" : `/${link.id}`}
                              className={`nav-item ${activeTab === link.id ? "active" : ""}`}
                              style={{ "--nav-color": link.color }}
                            >
                              <span className="nav-item-icon" style={activeTab === link.id ? { background: `${link.color}1a`, borderColor: `${link.color}44`, color: link.color } : {}}>
                                {link.icon}
                              </span>
                              <span style={{ flex: 1 }}>{t(link.id)}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Section 2: Study Tools */}
                    <div>
                      <div className="nav-section-title">
                        {lang === "ar" ? "أدوات الذكاء الاصطناعي" : "AI & STUDY TOOLS"}
                      </div>
                      <ul className="nav-links">
                        {[
                          { id: "quiz",         icon: <Brain size={18} />,     color: "#f97316", badge: null },
                          { id: "ai-assistant", icon: <Sparkles size={18} />,  color: "#9b51e0", badge: "AI" },
                          { id: "word-search",  icon: <Video size={18} />,     color: "#ff0844", badge: null },
                          { id: "translator",   icon: <Languages size={18} />, color: "#e100ff", badge: null },
                        ].map((link) => (
                          <li key={link.id}>
                            <Link
                              to={`/${link.id}`}
                              className={`nav-item ${activeTab === link.id ? "active" : ""}`}
                              style={{ "--nav-color": link.color }}
                            >
                              <span className="nav-item-icon" style={activeTab === link.id ? { background: `${link.color}1a`, borderColor: `${link.color}44`, color: link.color } : {}}>
                                {link.icon}
                              </span>
                              <span style={{ flex: 1 }}>{t(link.id)}</span>
                              {link.badge && (
                                <span className="sidebar-badge">{link.badge}</span>
                              )}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Section 3: Preferences */}
                    <div>
                      <div className="nav-section-title">
                        {lang === "ar" ? "الإعدادات" : "PREFERENCES"}
                      </div>
                      <ul className="nav-links">
                        <li>
                          <Link
                            to="/settings"
                            className={`nav-item ${activeTab === "settings" ? "active" : ""}`}
                            style={{ "--nav-color": "#10b981" }}
                          >
                            <span className="nav-item-icon" style={activeTab === "settings" ? { background: "#10b9811a", borderColor: "#10b98144", color: "#10b981" } : {}}>
                              <SettingsIcon size={18} />
                            </span>
                            <span>{t("settings")}</span>
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </nav>

                  {/* Sidebar Bottom Status Widget */}
                  <div className="sidebar-footer-widget">
                    <div className="status-dot-wrap">
                      <span className="status-dot" />
                      <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                        {lang === "ar" ? "نظام الحفظ المحلي: نشط" : "Local Sync: Active"}
                      </span>
                    </div>
                  </div>
                </aside>

                {/* 2. Mobile Navigation Bottom Tab Bar */}
                <nav className="bottom-bar">
                  {navLinks.slice(0, 5).map((link) => (
                    <Link
                      key={link.id}
                      to={link.id === "home" ? "/" : `/${link.id}`}
                      className={`bottom-nav-item ${activeTab === link.id ? "active" : ""}`}
                    >
                      {link.icon}
                      <span>{t(link.id).split(" ")[0]}</span>
                    </Link>
                  ))}
                  <Link
                    to="/ai-assistant"
                    className={`bottom-nav-item ${activeTab === "ai-assistant" ? "active" : ""}`}
                  >
                    <Sparkles size={18} />
                    <span>{lang === "ar" ? "ذكاء" : "AI"}</span>
                  </Link>
                </nav>

                {/* 3. Main content viewport wrapper */}
                <main className="app-content" style={{ width: "100%" }}>
                  {/* Pass props to Navbar */}
                  <Navbar
                    activeTab={activeTab}
                    t={t}
                    lang={lang}
                    toggleLang={toggleLang}
                    theme={theme}
                    toggleTheme={toggleTheme}
                    navLinks={navLinks}
                  />

                  {/* Subroutes within App Shell */}
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/home" element={<Navigate to="/" replace />} />
                    <Route path="/cards" element={<MyCards />} />
                    <Route path="/new-card" element={<NewCard />} />
                    <Route path="/schedule" element={<Schedule />} />
                    <Route path="/quiz" element={<QuizMode />} />
                    <Route
                      path="/ai-assistant"
                      element={<AIAssistantWrapper />}
                    />
                    <Route path="/word-search" element={<WordSearch />} />
                    <Route path="/translator" element={<Translator />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>

                  {/* Persistent Floating AI Button */}
                  {activeTab !== "ai-assistant" && (
                    <Link
                      to="/ai-assistant"
                      className="btn btn-primary"
                      style={{
                        position: "fixed",
                        bottom: "24px",
                        right: lang === "en" ? "24px" : "auto",
                        left: lang === "ar" ? "24px" : "auto",
                        borderRadius: "50px",
                        padding: "12px 24px",
                        boxShadow: "0 8px 30px rgba(0, 242, 254, 0.3)",
                        zIndex: 90,
                        textDecoration: "none",
                      }}
                    >
                      <Sparkles size={18} /> {t("ask_ai")}
                    </Link>
                  )}
                </main>
              </div>
          }
        />
      </Routes>

      {/* 4. Onboarding Guide Overlay */}
      {showOnboarding && (
        <div className="crop-overlay-container" style={{ padding: "20px" }}>
          <div
            className="glass-card"
            style={{
              maxWidth: "540px",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              padding: "32px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <Sparkles size={28} color="var(--accent-cyan)" />
                <h2 style={{ fontSize: "1.6rem" }}>{t("onboarding_title")}</h2>
              </div>
              <button
                className="btn btn-secondary btn-icon"
                style={{ width: "28px", height: "28px" }}
                onClick={() => setShowOnboarding(false)}
              >
                <X size={14} />
              </button>
            </div>

            <p style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>
              {t("onboarding_desc")}
            </p>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                margin: "10px 0",
              }}
            >
              {[
                {
                  icon: "🤖",
                  title: t("ai-assistant"),
                  desc:
                    lang === "en"
                      ? "Ask complex educational questions and receive clear explanations instantly."
                      : "طرح أسئلة تعليمية معقدة وتلقي تفسيرات واضحة فوراً.",
                },
                {
                  icon: "🗂️",
                  title: t("cards"),
                  desc:
                    lang === "en"
                      ? "Create Flashcards, Multiple Choice, True/False, or Free Notes organized in Folders."
                      : "إنشاء بطاقات الفلاش كارد، الخيارات، صح أم خطأ، أو الملاحظات الحرة داخل مجلدات.",
                },
                {
                  icon: "🎤",
                  title: lang === "en" ? "Smart Inputs" : "المدخلات الذكية",
                  desc:
                    lang === "en"
                      ? "Insert data via typing, microphone speech transcribing, camera capture, or document uploads."
                      : "إدخال البيانات بالكتابة، تحويل الكلام لنصوص، التقاط الكاميرا، أو رفع الملفات.",
                },
                {
                  icon: "🌍",
                  title: t("word-search"),
                  desc:
                    lang === "en"
                      ? "Hear how any vocabulary term is pronounced in context in real YouTube clips."
                      : "سماع كيف يتم نطق أي مصطلح في سياقه الواقعي عبر مقاطع اليوتيوب.",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    gap: "16px",
                    alignItems: "flex-start",
                  }}
                >
                  <span style={{ fontSize: "1.5rem", flexShrink: 0 }}>
                    {item.icon}
                  </span>
                  <div>
                    <h4
                      style={{
                        fontSize: "0.95rem",
                        fontWeight: 700,
                        marginBottom: "2px",
                      }}
                    >
                      {item.title}
                    </h4>
                    <p
                      style={{
                        fontSize: "0.85rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <button
              className="btn btn-primary"
              onClick={() => setShowOnboarding(false)}
              style={{ marginTop: "10px", width: "100%" }}
            >
              {t("onboarding_btn")} <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const AIAssistant = React.lazy(() => import("./components/AIAssistant"));

function AIAssistantWrapper() {
  return (
    <React.Suspense
      fallback={
        <div className="glass-card" style={{ height: "300px" }}>
          Loading...
        </div>
      }
    >
      <AIAssistant />
    </React.Suspense>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
