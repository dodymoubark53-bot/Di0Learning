import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { Plus, Trash, ChevronLeft, ChevronRight, Calendar, Clock, Award, Check, X, FileText, Sparkles } from 'lucide-react';

export default function Schedule() {
  const { schedule, addSession, deleteSession, decks, addToast, t, lang, user } = useContext(AppContext);
  const navigate = useNavigate();

  // Calendar State
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());

  // Persistent Daily Notes & Achievements Log per User Account
  const [dailyNotes, setDailyNotes] = useState(() => {
    try {
      const savedUser = localStorage.getItem("di0_active_user");
      if (!savedUser) return {};
      const userObj = JSON.parse(savedUser);
      const savedNotes = localStorage.getItem(`di0_daily_notes_${userObj.id}`);
      return savedNotes ? JSON.parse(savedNotes) : {};
    } catch {
      return {};
    }
  });

  const isInitialNotesMount = useRef(true);

  useEffect(() => {
    if (isInitialNotesMount.current) {
      isInitialNotesMount.current = false;
      return;
    }

    if (!user) {
      setDailyNotes({});
      return;
    }
    try {
      const saved = localStorage.getItem(`di0_daily_notes_${user.id}`);
      setDailyNotes(saved ? JSON.parse(saved) : {});
    } catch {
      setDailyNotes({});
    }
  }, [user?.id]);

  // Active Day Modal Cell State
  const [activeDayCell, setActiveDayCell] = useState(null); // { dateNum, dateStr }
  const [dayNoteText, setDayNoteText] = useState('');

  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('12:00');
  const [duration, setDuration] = useState(60);
  const [color, setColor] = useState('#9b51e0');
  const [notes, setNotes] = useState('');

  // Selected session details
  const [selectedSession, setSelectedSession] = useState(null);

  // Month Names Localized
  const monthNamesEN = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const monthNamesAR = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  const monthNames = lang === 'ar' ? monthNamesAR : monthNamesEN;

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

  // Open Day Modal Window
  const openDayModal = (cell) => {
    if (!cell.dateStr) return;
    setActiveDayCell(cell);
    setDayNoteText(dailyNotes[cell.dateStr] || '');
  };

  const handleSaveDayNote = (e) => {
    e.preventDefault();
    if (!activeDayCell) return;
    if (!user) {
      addToast(
        lang === 'ar'
          ? '⚠️ يلزم تسجيل الدخول أو إنشاء حساب أولاً لحفظ إنجازاتك!'
          : '⚠️ Please sign in or create an account to save achievements!',
        'error'
      );
      navigate('/auth');
      return;
    }
    const updated = { ...dailyNotes, [activeDayCell.dateStr]: dayNoteText.trim() };
    setDailyNotes(updated);
    localStorage.setItem(`di0_daily_notes_${user.id}`, JSON.stringify(updated));
    addToast(
      lang === 'ar'
        ? 'تم حفظ ملاحظات وإنجازات اليوم بنجاح!'
        : 'Daily achievements & notes saved!',
      'success'
    );
  };

  // Grid math
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  const calendarCells = [];
  
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push({ key: `pad-${i}`, dateNum: null, dateStr: '', isToday: false });
  }

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

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim()) return;
    if (!user) {
      addToast(
        lang === 'ar'
          ? '⚠️ يلزم تسجيل الدخول أو إنشاء حساب جديد أولاً لجدولة الجلسات!'
          : '⚠️ Sign in or register to schedule study sessions!',
        'error'
      );
      navigate('/auth');
      return;
    }

    const success = await addSession({
      subject,
      date,
      time,
      duration,
      color,
      notes
    });

    if (success) {
      setSubject('');
      setDate('');
      setTime('12:00');
      setDuration(60);
      setColor('#9b51e0');
      setNotes('');
      setShowAddForm(false);
    }
  };

  const colorsList = [
    { label: 'Violet', hex: '#9b51e0' },
    { label: 'Cyan', hex: '#00f2fe' },
    { label: 'Amber', hex: '#f59e0b' },
    { label: 'Emerald', hex: '#10b981' },
    { label: 'Rose', hex: '#f43f5e' }
  ];

  const dayHeadersEN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayHeadersAR = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
  const dayHeaders = lang === 'ar' ? dayHeadersAR : dayHeadersEN;

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Page Hero */}
      <div className="page-hero" style={{ '--hero-glow': 'rgba(245,87,108,0.15)', '--hero-gradient': 'linear-gradient(135deg, #f093fb, #f5576c)' }}>
        <div className="page-hero-content">
          <div className="page-hero-icon-wrapper">
            <Calendar size={32} color="#fff" />
          </div>
          <h1 className="page-hero-title">{lang === 'ar' ? 'مخطط وجدول المذاكرة' : 'Study & Achievement Planner'}</h1>
          <p className="page-hero-subtitle">
            {lang === 'ar' 
              ? 'اضغط على أي يوم لفتح نافذة تدوين الإنجازات والملاحظات، وجدولة جلساتك الدراسية.' 
              : 'Click any day box to log daily achievements, notes, and study sessions.'}
          </p>
        </div>
        <div className="page-hero-actions">
          <button className="btn btn-primary" onClick={() => {
            setDate(today.toISOString().split('T')[0]);
            setShowAddForm(true);
          }} style={{ padding: '14px 24px', fontSize: '1rem', borderRadius: '14px' }}>
            <Plus size={20} /> {lang === 'ar' ? 'جدولة جلسة' : 'Schedule Session'}
          </button>
        </div>
      </div>

      <div className="grid grid-2" style={{ gap: '30px', gridTemplateColumns: '1.4fr 0.6fr' }}>
        {/* Left: Month calendar grid */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.4rem' }}>
              {monthNames[currentMonth]} {currentYear}
            </h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-secondary btn-icon" style={{ width: '32px', height: '32px' }} onClick={handlePrevMonth}>
                <ChevronLeft size={16} style={{ transform: lang === 'ar' ? 'rotate(180deg)' : 'none' }} />
              </button>
              <button className="btn btn-secondary btn-icon" style={{ width: '32px', height: '32px' }} onClick={handleNextMonth}>
                <ChevronRight size={16} style={{ transform: lang === 'ar' ? 'rotate(180deg)' : 'none' }} />
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <div className="calendar-grid">
              {dayHeaders.map(day => (
                <div key={day} className="calendar-day-header">{day}</div>
              ))}

              {calendarCells.map(cell => {
                const daySessions = cell.dateStr ? schedule.filter(s => s.date === cell.dateStr) : [];
                const hasNote = cell.dateStr && Boolean(dailyNotes[cell.dateStr]);

                return (
                  <div 
                    key={cell.key} 
                    className={`calendar-cell ${!cell.dateNum ? 'inactive' : ''} ${cell.isToday ? 'today' : ''}`}
                    onClick={() => cell.dateNum && openDayModal(cell)}
                    style={{ cursor: cell.dateNum ? 'pointer' : 'default' }}
                    title={cell.dateNum ? (lang === 'ar' ? 'اضغط لفتح نافذة تدوين اليوم' : 'Click to open day planner & achievements') : ''}
                  >
                    {cell.dateNum && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <span className="calendar-date-num">{cell.dateNum}</span>
                        {hasNote && (
                          <span 
                            style={{ 
                              fontSize: '0.65rem', 
                              background: 'rgba(67,233,123,0.2)', 
                              color: '#43e97b', 
                              padding: '2px 5px', 
                              borderRadius: '4px', 
                              fontWeight: 700 
                            }}
                            title={lang === 'ar' ? 'يوجد إنجازات وملاحظات' : 'Logged achievements'}
                          >
                            🏆
                          </span>
                        )}
                      </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, overflowY: 'auto', marginTop: '4px' }}>
                      {daySessions.map(session => (
                        <div 
                          key={session.id} 
                          className="calendar-event" 
                          style={{ backgroundColor: session.color + '25', borderLeft: `3px solid ${session.color}`, color: 'var(--text-primary)' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSession(session);
                          }}
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

        {/* Right Agenda sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-card">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={18} color="var(--accent-cyan)" /> {lang === 'ar' ? 'أجندة الجلسات' : 'Session Agenda'}
            </h3>
            {schedule.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                {lang === 'ar' ? 'لا توجد جلسات دراسية مجدولة بعد.' : 'No sessions scheduled yet.'}
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

      {/* MODAL: Day Cell Details & Achievements Log Modal */}
      {activeDayCell && (
        <div className="crop-overlay-container" style={{ padding: '20px' }}>
          <div className="glass-card" style={{ maxWidth: '560px', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Calendar size={22} color="var(--accent-cyan)" />
                <h2 style={{ fontSize: '1.4rem', color: 'var(--text-primary)' }}>
                  {lang === 'ar' ? `يوم ${activeDayCell.dateNum} ${monthNames[currentMonth]} ${currentYear}` : `Day ${activeDayCell.dateNum} - ${monthNames[currentMonth]} ${currentYear}`}
                </h2>
              </div>
              <button 
                className="btn btn-secondary btn-icon" 
                style={{ width: '30px', height: '30px' }}
                onClick={() => setActiveDayCell(null)}
              >
                <X size={16} />
              </button>
            </div>

            {/* Achievements & Journal Form */}
            <form onSubmit={handleSaveDayNote} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Award size={16} color="var(--accent-amber)" />
                  {lang === 'ar' ? 'تدوين إنجازات وملاحظات هذا اليوم:' : 'Log Today\'s Achievements & Study Notes:'}
                </label>
                <textarea 
                  className="form-textarea" 
                  rows={4}
                  placeholder={lang === 'ar' ? 'دون هنا إنجازاتك، الدروس التي أنهيتها، أو أي ملاحظات هامة...' : 'Write down your achievements, completed tasks, or notes for this day...'}
                  value={dayNoteText}
                  onChange={(e) => setDayNoteText(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', gap: '6px' }}>
                <Check size={16} /> {lang === 'ar' ? 'حفظ الإنجازات' : 'Save Achievements Log'}
              </button>
            </form>

            <hr style={{ borderColor: 'var(--border-color)', margin: '4px 0' }} />

            {/* Scheduled Sessions for this Day */}
            <div>
              <h3 style={{ fontSize: '1rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={16} color="var(--accent-violet)" />
                {lang === 'ar' ? 'الجلسات المجدولة لهذا اليوم:' : 'Sessions Scheduled for This Day:'}
              </h3>

              {schedule.filter(s => s.date === activeDayCell.dateStr).length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  {lang === 'ar' ? 'لا توجد جلسات دراسية مجدولة لهذا اليوم.' : 'No sessions scheduled for this date.'}
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {schedule.filter(s => s.date === activeDayCell.dateStr).map(session => (
                    <div 
                      key={session.id} 
                      style={{ 
                        padding: '10px 14px', 
                        background: 'var(--bg-secondary)', 
                        borderLeft: `4px solid ${session.color}`, 
                        borderRadius: '8px',
                        display: 'flex',
                        justify: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: '0.9rem' }}>{session.subject}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          ⏰ {session.time} ({session.duration} {lang === 'ar' ? 'دقيقة' : 'mins'})
                        </div>
                      </div>
                      <button 
                        className="btn btn-danger btn-icon"
                        style={{ width: '28px', height: '28px' }}
                        onClick={() => deleteSession(session.id)}
                        title={lang === 'ar' ? 'حذف الجلسة' : 'Delete session'}
                      >
                        <Trash size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
              <button 
                type="button"
                className="btn btn-secondary" 
                onClick={() => {
                  setDate(activeDayCell.dateStr);
                  setShowAddForm(true);
                }}
                style={{ flex: 1, gap: '6px' }}
              >
                <Plus size={16} /> {lang === 'ar' ? 'جدولة جلسة لهذا اليوم' : '+ Add Session to this Day'}
              </button>
              <button 
                type="button"
                className="btn btn-secondary" 
                onClick={() => setActiveDayCell(null)}
              >
                {lang === 'ar' ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Add Session Form */}
      {showAddForm && (
        <div className="crop-overlay-container" style={{ padding: '20px' }}>
          <form onSubmit={handleAddSubmit} className="glass-card" style={{ maxWidth: '480px', width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ color: 'var(--accent-cyan)', fontSize: '1.4rem' }}>
              {lang === 'ar' ? 'جدولة جلسة دراسية جديدة' : 'Schedule Study Session'}
            </h2>
            
            <div className="form-group">
              <label className="form-label">{lang === 'ar' ? 'الموضوع / اسم المجلد' : 'Subject / Deck Name'}</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="..."
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
                <label className="form-label">{lang === 'ar' ? 'التاريخ' : 'Date'}</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">{lang === 'ar' ? 'الوقت' : 'Time'}</label>
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
                <label className="form-label">{lang === 'ar' ? 'المدة (بالدقائق)' : 'Duration (Minutes)'}</label>
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
                <label className="form-label">{lang === 'ar' ? 'لون العلامة' : 'Accent Tag Color'}</label>
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
              <label className="form-label">{lang === 'ar' ? 'ملاحظات المخطط / الأهداف' : 'Planner Notes / Goals'}</label>
              <textarea 
                className="form-textarea" 
                rows={3} 
                placeholder="..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                {lang === 'ar' ? 'حفظ الجلسة' : 'Save Session'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>
                {t('btn_cancel')}
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
                <span><strong>{lang === 'ar' ? 'التاريخ' : 'Date'}:</strong> {selectedSession.date}</span>
              </p>
              <p style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} color="var(--text-secondary)" /> 
                <span><strong>{lang === 'ar' ? 'الوقت' : 'Time'}:</strong> {selectedSession.time} ({selectedSession.duration} {lang === 'ar' ? 'دقيقة' : 'minutes'})</span>
              </p>
              {selectedSession.notes && (
                <div style={{ background: 'var(--bg-primary)', padding: '12px', borderRadius: '8px', marginTop: '6px' }}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>
                    {lang === 'ar' ? 'الملاحظات' : 'Notes'}
                  </p>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>{selectedSession.notes}</p>
                </div>
              )}
            </div>

            <button className="btn btn-secondary" onClick={() => setSelectedSession(null)} style={{ marginTop: '10px' }}>
              {lang === 'ar' ? 'إغلاق التفاصيل' : 'Close details'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
