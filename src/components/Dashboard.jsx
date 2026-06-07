import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { 
  Plus, 
  Brain, 
  Calendar, 
  Search, 
  Languages, 
  Clock, 
  Award, 
  ArrowRight,
  BookOpen
} from 'lucide-react';

export default function Dashboard() {
  const { 
    cards, 
    decks, 
    schedule, 
    quizHistory, 
    setActiveTab 
  } = useContext(AppContext);

  // Get next 3 upcoming sessions
  const now = new Date();
  const upcomingSessions = schedule
    .filter(session => new Date(`${session.date}T${session.time}`) >= now)
    .sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`))
    .slice(0, 3);

  // Compute stats
  const totalCards = cards.length;
  const totalDecks = decks.length;
  const recentQuiz = quizHistory[0] || null;
  const avgScore = quizHistory.length 
    ? Math.round((quizHistory.reduce((acc, curr) => acc + (curr.score / curr.total), 0) / quizHistory.length) * 100) 
    : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header section */}
      <div>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>
          Welcome back to <span className="gradient-text">Di0 Learning</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Your ultimate AI-powered study space. Here is your overview for today.
        </p>
      </div>

      {/* Grid: Quick stats */}
      <div className="grid grid-3" style={{ gap: '20px' }}>
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(0, 242, 254, 0.1)', color: 'var(--accent-cyan)' }}>
            <BookOpen size={28} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.8rem', fontWeight: '800' }}>{totalCards}</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Cards Created</p>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(155, 81, 224, 0.1)', color: 'var(--accent-violet)' }}>
            <Brain size={28} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.8rem', fontWeight: '800' }}>{totalDecks}</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Active Decks / Subjects</p>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-amber)' }}>
            <Award size={28} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.8rem', fontWeight: '800' }}>{avgScore}%</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Avg Quiz Accuracy</p>
          </div>
        </div>
      </div>

      {/* Dashboard Main Grid split */}
      <div className="grid grid-2" style={{ gap: '30px', gridTemplateColumns: '1.2fr 0.8fr' }}>
        {/* Left: Quick Actions & Sessions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Clock size={22} color="var(--accent-cyan)" /> Upcoming Study Sessions
          </h2>
          
          {upcomingSessions.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <p style={{ color: 'var(--text-secondary)' }}>No study sessions scheduled for today or later.</p>
              <button className="btn btn-secondary" onClick={() => setActiveTab('schedule')}>
                <Plus size={16} /> Add Study Session
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {upcomingSessions.map(session => (
                <div key={session.id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: `4px solid ${session.color}` }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{session.subject}</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', gap: '12px' }}>
                      <span>🗓️ {session.date}</span>
                      <span>⏰ {session.time} ({session.duration} mins)</span>
                    </p>
                    {session.notes && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px', fontStyle: 'italic' }}>
                        Notes: {session.notes}
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <span style={{ fontSize: '0.8rem', padding: '6px 12px', background: 'var(--bg-tertiary)', borderRadius: '6px', fontWeight: '600' }}>
                      Ready
                    </span>
                  </div>
                </div>
              ))}
              <button className="btn btn-secondary" onClick={() => setActiveTab('schedule')} style={{ alignSelf: 'flex-start' }}>
                View Full Calendar <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Right side: Quick Links & Recent Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <h2 style={{ fontSize: '1.5rem' }}>Quick Actions</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <button className="btn btn-primary" onClick={() => setActiveTab('new-card')} style={{ height: '100px', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
              <Plus size={24} /> Create Card
            </button>
            <button className="btn btn-secondary" onClick={() => setActiveTab('quiz')} style={{ height: '100px', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
              <Brain size={24} color="var(--accent-violet)" /> Start Quiz
            </button>
            <button className="btn btn-secondary" onClick={() => setActiveTab('ai-assistant')} style={{ height: '100px', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
              <Languages size={24} color="var(--accent-cyan)" /> AI Tutor Chat
            </button>
            <button className="btn btn-secondary" onClick={() => setActiveTab('word-search')} style={{ height: '100px', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
              <Search size={24} color="var(--accent-amber)" /> Word Video Context
            </button>
          </div>

          <h2 style={{ fontSize: '1.5rem', marginTop: '12px' }}>Recent Quiz Performance</h2>
          <div className="glass-card">
            {recentQuiz ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <p style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Deck Subject:</span>
                  <strong style={{ color: 'var(--accent-violet)' }}>{recentQuiz.deckName}</strong>
                </p>
                <p style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Score:</span>
                  <strong>{recentQuiz.score} / {recentQuiz.total} ({Math.round(recentQuiz.score / recentQuiz.total * 100)}%)</strong>
                </p>
                <p style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <span>Date Taken:</span>
                  <span>{recentQuiz.date}</span>
                </p>
              </div>
            ) : (
              <div style={{ textStyle: 'center', color: 'var(--text-secondary)', textAlign: 'center', padding: '10px 0' }}>
                No quiz history yet. Jump in and test your knowledge!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
