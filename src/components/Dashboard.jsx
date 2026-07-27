import React, { useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import {
  BookOpen,
  Plus,
  Calendar,
  Brain,
  Clock,
  Award,
  ArrowRight,
  TrendingUp,
  Star,
  Zap,
} from 'lucide-react';


/* ─── Aurora canvas background ─── */
function AuroraCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let t = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      t += 0.004;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const blobs = [
        { x: 0.25, y: 0.3, r: 0.45, color: 'rgba(0,242,254,0.06)', dx: Math.sin(t * 0.7) * 0.06 },
        { x: 0.75, y: 0.2, r: 0.5, color: 'rgba(155,81,224,0.07)', dx: Math.cos(t * 0.5) * 0.05 },
        { x: 0.5, y: 0.7, r: 0.4, color: 'rgba(249,168,37,0.05)', dx: Math.sin(t * 0.9) * 0.04 },
      ];

      blobs.forEach((b) => {
        const grd = ctx.createRadialGradient(
          (b.x + b.dx) * canvas.width, b.y * canvas.height, 0,
          (b.x + b.dx) * canvas.width, b.y * canvas.height, b.r * canvas.width,
        );
        grd.addColorStop(0, b.color);
        grd.addColorStop(1, 'transparent');
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      });

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        borderRadius: '28px',
        pointerEvents: 'none',
      }}
    />
  );
}

/* ─── Stat chip ─── */
function StatChip({ icon: Icon, value, label, color, bg }) {
  return (
    <div className="dash-stat-chip" style={{ '--chip-color': color, '--chip-bg': bg }}>
      <div className="dash-stat-icon">
        <Icon size={20} />
      </div>
      <div>
        <div className="dash-stat-value">{value}</div>
        <div className="dash-stat-label">{label}</div>
      </div>
    </div>
  );
}


/* ─── Main Dashboard ─── */
export default function Dashboard() {
  const navigate = useNavigate();
  const {
    cards,
    decksMetadata,
    schedule,
    quizHistory,
    setActiveTab,
    t,
    lang,
  } = useContext(AppContext);

  const goTo = (tab, path) => {
    setActiveTab(tab);
    navigate(path);
  };

  const now = new Date();
  const upcomingSessions = schedule
    .filter((s) => new Date(`${s.date}T${s.time}`) >= now)
    .sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`))
    .slice(0, 3);

  const totalCards = cards.length;
  const totalDecks = decksMetadata.length;
  const avgScore = quizHistory.length
    ? Math.round(
        (quizHistory.reduce((acc, cur) => acc + cur.score / cur.total, 0) /
          quizHistory.length) *
          100,
      )
    : 0;
  const recentQuiz = quizHistory[0] || null;

  return (
    <div className="dashboard-root page-enter">

      {/* ══════════════════════════════════════
          HERO BRAND SECTION
      ══════════════════════════════════════ */}
      <section className="dash-hero">
        <AuroraCanvas />

        {/* Brand cluster */}
        <div className="dash-hero-brand">
          {/* Logo pill */}
          <div className="dash-logo-pill">
            <div className="dash-logo-orb">d0</div>
            <div className="dash-logo-text">
              <span className="dash-logo-main gradient-text">Di0 Learning</span>
              <span className="dash-logo-sub">
                <Zap size={10} style={{ display: 'inline', marginRight: 3 }} />
                AI STUDY SUITE
              </span>
            </div>
          </div>

          <h1 className="dash-hero-title">
            Your <span className="gradient-text">Learning Universe</span><br />
            — All in One Place
          </h1>
          <p className="dash-hero-subtitle">
            Flashcards · AI Tutor · Quiz Engine · Video Search · Schedule Planner
          </p>

          {/* CTA buttons */}
          <div className="dash-hero-cta">
            <button className="btn btn-primary dash-cta-primary" onClick={() => goTo('new-card', '/new-card')}>
              <Plus size={17} /> {lang === 'ar' ? 'إنشاء كارت جديد' : 'Create a Card'}
            </button>
            <button className="btn btn-secondary dash-cta-secondary" onClick={() => goTo('quiz', '/quiz')}>
              <Brain size={17} /> {lang === 'ar' ? 'بدء اختبار' : 'Start Quiz'}
            </button>
          </div>
        </div>

        {/* Floating stat chips */}
        <div className="dash-hero-stats">
          <div onClick={() => goTo('cards', '/cards')} style={{ cursor: 'pointer' }} title={lang === 'ar' ? 'الانتقال إلى الكروت' : 'Go to Cards'}>
            <StatChip icon={BookOpen} value={totalCards} label={t('total_cards') || 'Total Cards'} color="var(--accent-cyan)" bg="rgba(0,242,254,0.1)" />
          </div>
          <div onClick={() => goTo('cards', '/cards')} style={{ cursor: 'pointer' }} title={lang === 'ar' ? 'الانتقال إلى المجلدات' : 'Go to Decks'}>
            <StatChip icon={Brain} value={totalDecks} label={t('active_decks') || 'Decks'} color="var(--accent-violet)" bg="rgba(155,81,224,0.1)" />
          </div>
          <div onClick={() => goTo('quiz', '/quiz')} style={{ cursor: 'pointer' }} title={lang === 'ar' ? 'الانتقال إلى الاختبارات' : 'Go to Quizzes'}>
            <StatChip icon={Award} value={`${avgScore}%`} label={t('quiz_accuracy') || 'Quiz Accuracy'} color="var(--accent-amber)" bg="rgba(249,168,37,0.1)" />
          </div>
          <div onClick={() => goTo('quiz', '/quiz')} style={{ cursor: 'pointer' }} title={lang === 'ar' ? 'الانتقال إلى سجل الاختبارات' : 'Go to Quiz History'}>
            <StatChip icon={Star} value={quizHistory.length} label="Quizzes Done" color="var(--accent-green)" bg="rgba(67,233,123,0.1)" />
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════
          UPCOMING SESSIONS + RECENT QUIZ
      ══════════════════════════════════════ */}
      <section className="dash-bottom-grid">

        {/* Upcoming sessions */}
        <div className="dash-panel">
          <div className="dash-panel-header">
            <Clock size={18} color="var(--accent-cyan)" />
            <h3>{t('upcoming_sessions') || 'Upcoming Sessions'}</h3>
          </div>

          {upcomingSessions.length === 0 ? (
            <div className="dash-empty-state">
              <Calendar size={36} style={{ opacity: 0.3 }} />
              <p style={{ color: 'var(--text-secondary)', margin: '8px 0' }}>
                {t('no_sessions') || 'No upcoming sessions'}
              </p>
              <button className="btn btn-secondary" onClick={() => goTo('schedule', '/schedule')}>
                <Plus size={14} /> {t('add_session') || 'Add Session'}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {upcomingSessions.map((session) => (
                <div
                  key={session.id}
                  className="dash-session-row"
                  style={{ borderLeft: `3px solid ${session.color}` }}
                >
                  <div>
                    <div className="dash-session-subject">{session.subject}</div>
                    <div className="dash-session-meta">
                      🗓 {session.date} &nbsp;·&nbsp; ⏰ {session.time} ({session.duration} min)
                    </div>
                    {session.notes && (
                      <div className="dash-session-notes">{session.notes}</div>
                    )}
                  </div>
                  <span className="dash-session-status">Ready</span>
                </div>
              ))}
              <button
                className="btn btn-secondary"
                onClick={() => goTo('schedule', '/schedule')}
                style={{ alignSelf: 'flex-start', marginTop: 4 }}
              >
                {t('view_full_calendar') || 'View Calendar'}
                <ArrowRight size={14} style={{ transform: lang === 'ar' ? 'rotate(180deg)' : 'none' }} />
              </button>
            </div>
          )}
        </div>

        {/* Recent quiz performance */}
        <div className="dash-panel">
          <div className="dash-panel-header">
            <TrendingUp size={18} color="var(--accent-violet)" />
            <h3>{t('recent_quiz_perf') || 'Recent Performance'}</h3>
          </div>

          {recentQuiz ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="dash-quiz-row">
                <span className="dash-quiz-label">{t('deck_subject') || 'Deck'}</span>
                <strong style={{ color: 'var(--accent-violet)' }}>{recentQuiz.deckName}</strong>
              </div>
              <div className="dash-quiz-row">
                <span className="dash-quiz-label">{t('score') || 'Score'}</span>
                <strong>{recentQuiz.score} / {recentQuiz.total}
                  <span style={{ color: 'var(--accent-amber)', marginLeft: 6 }}>
                    ({Math.round((recentQuiz.score / recentQuiz.total) * 100)}%)
                  </span>
                </strong>
              </div>
              <div className="dash-quiz-row">
                <span className="dash-quiz-label">{t('date_taken') || 'Date'}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{recentQuiz.date}</span>
              </div>

              {/* Score bar */}
              <div className="dash-score-bar-wrap">
                <div
                  className="dash-score-bar-fill"
                  style={{ width: `${Math.round((recentQuiz.score / recentQuiz.total) * 100)}%` }}
                />
              </div>

              <button className="btn btn-secondary" onClick={() => goTo('quiz', '/quiz')} style={{ marginTop: 4 }}>
                <Brain size={14} /> Take Another Quiz
              </button>
            </div>
          ) : (
            <div className="dash-empty-state">
              <Brain size={36} style={{ opacity: 0.3 }} />
              <p style={{ color: 'var(--text-secondary)', margin: '8px 0' }}>
                {t('no_quiz_history') || 'No quiz history yet'}
              </p>
              <button className="btn btn-primary" onClick={() => goTo('quiz', '/quiz')}>
                <Brain size={14} /> Start First Quiz
              </button>
            </div>
          )}
        </div>

      </section>
    </div>
  );
}
