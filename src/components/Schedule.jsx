import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Plus, Trash, ChevronLeft, ChevronRight, Calendar, Clock, BookOpen } from 'lucide-react';

export default function Schedule() {
  const { schedule, addSession, deleteSession, decks } = useContext(AppContext);

  // Calendar State
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());

  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('12:00');
  const [duration, setDuration] = useState(60);
  const [color, setColor] = useState('#9b51e0');
  const [notes, setNotes] = useState('');

  // Selected session detail state
  const [selectedSession, setSelectedSession] = useState(null);

  // Month navigation helpers
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  // Grid Calculations
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday

  const calendarCells = [];
  
  // Padding cells before start of month
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push({ key: `pad-${i}`, dateNum: null, dateStr: '', isToday: false });
  }

  // Active month days
  for (let d = 1; d <= daysInMonth; d++) {
    const formattedDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const isToday = today.getDate() === d && today.getMonth() === currentMonth && today.getFullYear() === currentYear;
    calendarCells.push({
      key: `day-${d}`,
      dateNum: d,
      dateStr: formattedDate,
      isToday
    });
  }

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!subject.trim()) return;

    addSession({
      subject,
      date,
      time,
      duration,
      color,
      notes
    });

    // Reset Form
    setSubject('');
    setDate('');
    setTime('12:00');
    setDuration(60);
    setColor('#9b51e0');
    setNotes('');
    setShowAddForm(false);
  };

  const colorsList = [
    { label: 'Violet', hex: '#9b51e0' },
    { label: 'Cyan', hex: '#00f2fe' },
    { label: 'Amber', hex: '#f59e0b' },
    { label: 'Emerald', hex: '#10b981' },
    { label: 'Rose', hex: '#f43f5e' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Calendar header layout */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2rem' }}>Study Planner 📅</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Schedule topics, organize sessions, and check study dates.</p>
        </div>
        <button className="btn btn-primary" onClick={() => {
          setDate(today.toISOString().split('T')[0]);
          setShowAddForm(true);
        }}>
          <Plus size={18} /> Schedule Session
        </button>
      </div>

      <div className="grid grid-2" style={{ gap: '30px', gridTemplateColumns: '1.4fr 0.6fr' }}>
        {/* Left: Monthly Grid Calendar */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.4rem' }}>
              {monthNames[currentMonth]} {currentYear}
            </h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-secondary btn-icon" style={{ width: '32px', height: '32px' }} onClick={handlePrevMonth}>
                <ChevronLeft size={16} />
              </button>
              <button className="btn btn-secondary btn-icon" style={{ width: '32px', height: '32px' }} onClick={handleNextMonth}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <div className="calendar-grid">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="calendar-day-header">{day}</div>
              ))}

              {calendarCells.map(cell => {
                const daySessions = cell.dateStr ? schedule.filter(s => s.date === cell.dateStr) : [];
                return (
                  <div 
                    key={cell.key} 
                    className={`calendar-cell ${!cell.dateNum ? 'inactive' : ''} ${cell.isToday ? 'today' : ''}`}
                  >
                    {cell.dateNum && (
                      <span className="calendar-date-num">{cell.dateNum}</span>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, overflowY: 'auto' }}>
                      {daySessions.map(session => (
                        <div 
                          key={session.id} 
                          className="calendar-event" 
                          style={{ backgroundColor: session.color + '25', borderLeft: `3px solid ${session.color}`, color: 'var(--text-primary)' }}
                          onClick={() => setSelectedSession(session)}
                        >
                          {session.subject}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right side panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Calendar Agenda */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={18} color="var(--accent-cyan)" /> Session Agenda
            </h3>
            {schedule.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                No sessions scheduled yet. Use the scheduler button to add one.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '420px', overflowY: 'auto' }}>
                {schedule
                  .sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`))
                  .map(session => (
                    <div 
                      key={session.id} 
                      onClick={() => setSelectedSession(session)}
                      style={{ 
                        padding: '10px 14px', 
                        background: 'var(--bg-secondary)', 
                        borderLeft: `4px solid ${session.color}`, 
                        borderRadius: '8px', 
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        transition: 'transform 0.2s ease'
                      }}
                      className="agenda-item"
                    >
                      <strong style={{ fontSize: '0.9rem' }}>{session.subject}</strong>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        <span>🗓️ {session.date}</span>
                        <span>⏰ {session.time}</span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL: Add Session Form */}
      {showAddForm && (
        <div className="crop-overlay-container" style={{ padding: '20px' }}>
          <form onSubmit={handleAddSubmit} className="glass-card" style={{ maxWidth: '480px', width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ color: 'var(--accent-cyan)', fontSize: '1.4rem' }}>Schedule Study Session</h2>
            
            <div className="form-group">
              <label className="form-label">Subject / Deck Name</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. Calculus review, Chemistry ch. 4..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                list="deck-options"
              />
              <datalist id="deck-options">
                {decks.map(d => <option key={d} value={d} />)}
              </datalist>
            </div>

            <div className="grid grid-2" style={{ gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Time</label>
                <input 
                  type="time" 
                  className="form-input" 
                  value={time} 
                  onChange={(e) => setTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-2" style={{ gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Duration (Minutes)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  min="5"
                  max="480"
                  value={duration} 
                  onChange={(e) => setDuration(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Accent Tag Color</label>
                <div style={{ display: 'flex', gap: '6px', height: '42px', alignItems: 'center' }}>
                  {colorsList.map(c => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setColor(c.hex)}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: c.hex,
                        border: color === c.hex ? '2px solid #ffffff' : 'none',
                        cursor: 'pointer'
                      }}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Planner Notes / Goals</label>
              <textarea 
                className="form-textarea" 
                rows={3} 
                placeholder="Detail what you plan to accomplish (e.g. solve 10 integrals)..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                Save Session
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: View Session Details */}
      {selectedSession && (
        <div className="crop-overlay-container">
          <div className="glass-card" style={{ maxWidth: '440px', width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h2 style={{ borderLeft: `4px solid ${selectedSession.color}`, paddingLeft: '12px' }}>
                {selectedSession.subject}
              </h2>
              <button 
                className="btn btn-danger btn-icon" 
                style={{ width: '32px', height: '32px' }}
                onClick={() => {
                  deleteSession(selectedSession.id);
                  setSelectedSession(null);
                }}
              >
                <Trash size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.95rem' }}>
              <p style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={16} color="var(--text-secondary)" /> 
                <span><strong>Date:</strong> {selectedSession.date}</span>
              </p>
              <p style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} color="var(--text-secondary)" /> 
                <span><strong>Time:</strong> {selectedSession.time} ({selectedSession.duration} minutes)</span>
              </p>
              {selectedSession.notes && (
                <div style={{ background: 'var(--bg-primary)', padding: '12px', borderRadius: '8px', marginTop: '6px' }}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Notes</p>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>{selectedSession.notes}</p>
                </div>
              )}
            </div>

            <button className="btn btn-secondary" onClick={() => setSelectedSession(null)} style={{ marginTop: '10px' }}>
              Close details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
