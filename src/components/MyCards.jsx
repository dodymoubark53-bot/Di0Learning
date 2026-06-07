import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { getMedia } from '../utils/db';
import { parseAnkiApkg } from '../utils/ankiParser';
import RichTextRenderer from './RichTextRenderer';
import { 
  Download, 
  Upload, 
  Trash, 
  Edit,
  FolderPlus, 
  BookOpen, 
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Brain,
  File,
  Plus,
  Eye,
  FileText,
  HelpCircle,
  CheckCircle,
  X
} from 'lucide-react';

// Sub-component to load media dynamically from IndexedDB
function MediaDisplay({ mediaItem }) {
  const [url, setUrl] = useState(mediaItem?.url || null);

  useEffect(() => {
    if (mediaItem?.url) {
      setUrl(mediaItem.url);
      return;
    }
    let activeUrl = null;
    if (mediaItem?.id) {
      getMedia(mediaItem.id).then(record => {
        if (record && record.blob) {
          activeUrl = URL.createObjectURL(record.blob);
          setUrl(activeUrl);
        }
      });
    }
    return () => {
      if (activeUrl) {
        URL.revokeObjectURL(activeUrl);
      }
    };
  }, [mediaItem]);

  if (!url) return null;

  const type = mediaItem.type || '';
  if (type.startsWith('image/')) {
    return <img src={url} alt={mediaItem.name} style={{ maxWidth: '100%', maxHeight: '160px', borderRadius: '8px', objectFit: 'contain', marginTop: '8px' }} />;
  }
  if (type.startsWith('audio/')) {
    return <audio src={url} controls style={{ width: '100%', height: '32px', marginTop: '8px' }} />;
  }
  if (type.startsWith('video/')) {
    return <video src={url} controls style={{ maxWidth: '100%', maxHeight: '160px', borderRadius: '8px', marginTop: '8px' }} />;
  }
  return (
    <div style={{ marginTop: '8px' }}>
      <a href={url} download={mediaItem.name} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem', gap: '4px' }}>
        <File size={12} /> Download {mediaItem.name}
      </a>
    </div>
  );
}

const stripHtml = (html) => {
  if (!html) return '';
  try {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  } catch (e) {
    return html;
  }
};

export default function MyCards() {
  const { 
    cards, 
    decksMetadata, 
    addDeck, 
    deleteDeck, 
    deleteCard, 
    updateCard,
    exportDeck, 
    importDeck, 
    importAnkiDeck,
    addToast,
    setActiveTab,
    t,
    lang
  } = useContext(AppContext);

  const [isImportingAnki, setIsImportingAnki] = useState(false);

  // Deck State
  const [activeDeck, setActiveDeck] = useState(null); // name of selected deck folder
  const [deckViewMode, setDeckViewMode] = useState('list'); // 'list' | 'browse'
  const [browseIndex, setBrowseIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Modals for editing and viewing cards
  const [viewingCard, setViewingCard] = useState(null);
  const [editingCard, setEditingCard] = useState(null);

  // Creating new deck state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckColor, setNewDeckColor] = useState('#9b51e0');

  // Editing card form states
  const [editTemplate, setEditTemplate] = useState('flashcard');
  const [editQuestion, setEditQuestion] = useState('');
  const [editAnswer, setEditAnswer] = useState('');
  const [editOptions, setEditOptions] = useState(['', '', '', '']);
  const [editCorrectAnswer, setEditCorrectAnswer] = useState('');
  const [editNotes, setEditNotes] = useState('');

  // Populate edit fields when editingCard changes
  useEffect(() => {
    if (editingCard) {
      setEditTemplate(editingCard.template || 'flashcard');
      setEditQuestion(editingCard.question || '');
      setEditAnswer(editingCard.answer || '');
      setEditOptions(editingCard.options || ['', '', '', '']);
      setEditCorrectAnswer(editingCard.correctAnswer || '');
      setEditNotes(editingCard.notes || '');
    }
  }, [editingCard]);

  // Filter cards by selected deck
  const deckCards = cards.filter(c => c.deckId === activeDeck);

  const handleCreateDeckSubmit = (e) => {
    e.preventDefault();
    if (!newDeckName.trim()) return;
    addDeck(newDeckName, newDeckColor);
    setNewDeckName('');
    setShowCreateForm(false);
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      importDeck(file);
    }
  };

  const handleAnkiImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.apkg')) {
      addToast('Invalid file format. Please upload a valid Anki .apkg file.', 'error');
      return;
    }

    setIsImportingAnki(true);
    try {
      addToast('Parsing Anki deck... Please wait.', 'info');
      const { cards: parsedCards, decks: parsedDecks, media: parsedMedia } = await parseAnkiApkg(file);
      
      if (!parsedCards || parsedCards.length === 0) {
        addToast('Could not read cards from this file.', 'error');
        setIsImportingAnki(false);
        return;
      }

      await importAnkiDeck(parsedCards, parsedDecks, parsedMedia);
    } catch (error) {
      console.error(error);
      addToast('Could not read cards from this file.', 'error');
    } finally {
      setIsImportingAnki(false);
      e.target.value = '';
    }
  };

  const handleStartExam = () => {
    localStorage.setItem('preSelectedQuizDeck', activeDeck);
    setActiveTab('quiz');
  };

  const handleAddCardRedirect = () => {
    localStorage.setItem('preSelectedDeck', activeDeck);
    setActiveTab('new-card');
  };

  const handleEditSave = (e) => {
    e.preventDefault();
    if (!editingCard) return;

    const updatedData = {
      template: editTemplate,
      question: editQuestion,
      answer: editTemplate === 'flashcard' ? editAnswer : '',
      options: editTemplate === 'multiple-choice' ? editOptions : [],
      correctAnswer: (editTemplate === 'multiple-choice' || editTemplate === 'true-false') ? editCorrectAnswer : '',
      notes: editTemplate === 'free-note' ? editNotes : ''
    };

    updateCard(editingCard.id, updatedData);
    setEditingCard(null);
  };

  const getTemplateIcon = (tmpl) => {
    switch (tmpl) {
      case 'flashcard': return <BookOpen size={16} color="var(--accent-cyan)" />;
      case 'multiple-choice': return <HelpCircle size={16} color="var(--accent-violet)" />;
      case 'true-false': return <CheckCircle size={16} color="var(--accent-amber)" />;
      default: return <FileText size={16} color="var(--text-muted)" />;
    }
  };

  const colorsList = [
    '#9b51e0', '#00f2fe', '#f59e0b', '#10b981', '#f43f5e'
  ];

  // RENDER: Loading overlay for Anki import
  if (isImportingAnki) {
    return (
      <div className="crop-overlay-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div className="glass-card" style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '420px', textAlign: 'center' }}>
          <div className="loading-spinner" style={{ width: '48px', height: '48px', borderRadius: '50%', border: '4px solid var(--border-color)', borderTopColor: 'var(--accent-violet)', animation: 'spin 1s linear infinite' }} />
          <h3 style={{ color: 'var(--accent-cyan)' }}>Importing Anki Deck</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '8px' }}>
            Parsing collections and loading media assets. This may take a few moments...
          </p>
        </div>
      </div>
    );
  }

  // RENDER: Decks Grid Selection Screen
  if (activeDeck === null) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '2rem' }}>{t('decks_title')} 🗂️</h1>
            <p style={{ color: 'var(--text-secondary)' }}>{t('decks_desc')}</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowCreateForm(true)}>
            <FolderPlus size={18} /> {t('create_deck')}
          </button>
        </div>

        {/* Import/Export toolbar */}
        <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t('btn_export')}:</span>
            <select 
              className="form-select" 
              style={{ width: '160px', padding: '6px 12px' }}
              onChange={(e) => {
                if (e.target.value) {
                  exportDeck(e.target.value);
                  e.target.value = '';
                }
              }}
            >
              <option value="">{t('select_deck')}...</option>
              {decksMetadata.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t('btn_import')}:</span>
            <label className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.85rem', cursor: 'pointer' }}>
              <Upload size={14} /> {t('upload_zip')}
              <input type="file" accept=".zip" onChange={handleImport} style={{ display: 'none' }} />
            </label>
            <label className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.85rem', cursor: 'pointer', border: '1px solid var(--accent-violet)' }}>
              <Upload size={14} /> Import Anki (.apkg)
              <input type="file" accept=".apkg" onChange={handleAnkiImport} style={{ display: 'none' }} />
            </label>
          </div>
        </div>

        {/* Decks collection */}
        {decksMetadata.length === 0 ? (
          <div className="empty-state">
            <BookOpen size={48} />
            <h3>{t('no_decks')}</h3>
          </div>
        ) : (
          <div className="grid grid-3" style={{ gap: '24px' }}>
            {decksMetadata.map(deck => {
              const count = cards.filter(c => c.deckId === deck.name).length;
              const formattedDate = new Date(deck.createdAt || Date.now()).toLocaleDateString(
                lang === 'ar' ? 'ar-EG' : 'en-US',
                { year: 'numeric', month: 'short', day: 'numeric' }
              );

              return (
                <div 
                  key={deck.name} 
                  className="deck-folder-card" 
                  style={{ '--accent-color': deck.color }}
                  onClick={() => {
                    setActiveDeck(deck.name);
                    setDeckViewMode('list');
                    setBrowseIndex(0);
                    setIsFlipped(false);
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>{deck.name}</h3>
                    {deck.name !== 'General' && (
                      <button 
                        className="btn btn-danger btn-icon" 
                        style={{ width: '28px', height: '28px' }} 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Are you sure you want to delete the deck "${deck.name}"? This removes all of its cards.`)) {
                            deleteDeck(deck.name);
                          }
                        }}
                      >
                        <Trash size={12} />
                      </button>
                    )}
                  </div>

                  <div style={{ marginTop: '20px' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                      📂 {count} {t('cards_count')}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {t('created_on')}: {formattedDate}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Create Deck Form Overlay */}
        {showCreateForm && (
          <div className="crop-overlay-container" style={{ padding: '20px' }}>
            <form onSubmit={handleCreateDeckSubmit} className="glass-card" style={{ maxWidth: '440px', width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ color: 'var(--accent-cyan)' }}>{t('create_deck')}</h3>

              <div className="form-group">
                <label className="form-label">{t('deck_name_placeholder')}</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder={t('deck_name_placeholder')}
                  value={newDeckName}
                  onChange={(e) => setNewDeckName(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label">Folder Color theme</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {colorsList.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewDeckColor(color)}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: color,
                        border: newDeckColor === color ? '2px solid #ffffff' : 'none',
                        cursor: 'pointer'
                      }}
                    />
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {t('btn_create')}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateForm(false)}>
                  {t('btn_cancel')}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    );
  }

  // RENDER: Inner Deck Detail - List View Mode
  const deckMetadataObj = decksMetadata.find(d => d.name === activeDeck);
  const deckColor = deckMetadataObj?.color || 'var(--accent-violet)';
  const formattedCreationDate = new Date(deckMetadataObj?.createdAt || Date.now()).toLocaleDateString(
    lang === 'ar' ? 'ar-EG' : 'en-US',
    { year: 'numeric', month: 'short', day: 'numeric' }
  );

  if (deckViewMode === 'list') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Navigation Return */}
        <button 
          className="btn btn-secondary" 
          onClick={() => setActiveDeck(null)}
          style={{ alignSelf: 'flex-start', gap: '8px' }}
        >
          <ArrowLeft size={16} /> {t('back_to_decks')}
        </button>

        {/* Deck Header Banner */}
        <div className="glass-card" style={{ borderLeft: `6px solid ${deckColor}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: deckColor }} />
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 700 }}>
                {t('deck_dashboard')}
              </span>
            </div>
            <h1 style={{ fontSize: '1.8rem', marginTop: '8px' }}>{activeDeck}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
              {t('created_on')}: {formattedCreationDate} • {deckCards.length} {t('cards_count')}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              className="btn btn-secondary" 
              onClick={() => { setBrowseIndex(0); setDeckViewMode('browse'); }}
              disabled={deckCards.length === 0}
              style={{ gap: '6px' }}
            >
              <BookOpen size={16} /> {t('browse_mode')}
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={handleStartExam}
              disabled={deckCards.length === 0}
              style={{ gap: '6px' }}
            >
              <Brain size={16} color="var(--accent-violet)" /> {t('exam_mode')}
            </button>
            <button 
              className="btn btn-primary" 
              onClick={handleAddCardRedirect}
              style={{ gap: '6px' }}
            >
              <Plus size={16} /> {lang === 'ar' ? 'بطاقة جديدة' : '+ Add Card'}
            </button>
          </div>
        </div>

        {/* Card list previews */}
        <div style={{ marginTop: '12px' }}>
          {deckCards.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '48px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <BookOpen size={48} color="var(--text-muted)" style={{ opacity: 0.5 }} />
              <h3>{lang === 'ar' ? 'لا توجد بطاقات في هذا المجلد الدراسي بعد' : 'No cards in this deck yet.'}</h3>
              <button className="btn btn-primary" onClick={handleAddCardRedirect}>
                {lang === 'ar' ? 'أضف أول بطاقة دراسية' : 'Add your first card!'}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {deckCards.map(card => (
                <div 
                  key={card.id} 
                  className="glass-card"
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '16px 20px',
                    cursor: 'pointer'
                  }}
                  onClick={() => setViewingCard(card)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, overflow: 'hidden' }}>
                    {getTemplateIcon(card.template)}
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>{stripHtml(card.question)}</strong>
                      {card.template === 'free-note' && card.notes && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: '12px', marginRight: '12px', display: 'inline-block' }}>
                          — {stripHtml(card.notes).substring(0, 50)}...
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                    <button 
                      className="btn btn-secondary btn-icon" 
                      style={{ width: '30px', height: '30px' }} 
                      onClick={(e) => { e.stopPropagation(); setViewingCard(card); }}
                      title="View card detail"
                    >
                      <Eye size={12} />
                    </button>
                    <button 
                      className="btn btn-secondary btn-icon" 
                      style={{ width: '30px', height: '30px' }} 
                      onClick={(e) => { e.stopPropagation(); setEditingCard(card); }}
                      title="Edit card"
                    >
                      <Edit size={12} />
                    </button>
                    <button 
                      className="btn btn-danger btn-icon" 
                      style={{ width: '30px', height: '30px' }} 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Delete this card?')) {
                          deleteCard(card.id);
                        }
                      }}
                      title="Delete card"
                    >
                      <Trash size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MODAL: Full card view */}
        {viewingCard && (
          <div className="crop-overlay-container">
            <div className="glass-card" style={{ maxWidth: '540px', width: '90%', position: 'relative', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                  {viewingCard.template.replace('-', ' ')}
                </span>
                <button 
                  className="btn btn-secondary btn-icon" 
                  style={{ width: '28px', height: '28px' }} 
                  onClick={() => { setViewingCard(null); setIsFlipped(false); }}
                >
                  <X size={14} />
                </button>
              </div>

              {/* Layouts based on templates */}
              <div style={{ minHeight: '160px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                {viewingCard.template === 'flashcard' ? (
                  <div 
                    className={`flashcard-wrapper ${isFlipped ? 'flipped' : ''}`}
                    onClick={() => setIsFlipped(!isFlipped)}
                    style={{ height: '240px' }}
                  >
                    <div className="flashcard-inner">
                      <div className="flashcard-front">
                        <div style={{ fontSize: '1.2rem', fontWeight: 600, width: '100%' }}>
                          <RichTextRenderer content={viewingCard.question} deckId={viewingCard.deckId} />
                        </div>
                        {viewingCard.media?.question && <MediaDisplay mediaItem={viewingCard.media.question} />}
                        {viewingCard.media?.question_image && <MediaDisplay mediaItem={viewingCard.media.question_image} />}
                        {viewingCard.media?.question_audio && <MediaDisplay mediaItem={viewingCard.media.question_audio} />}
                        <span style={{ position: 'absolute', bottom: '8px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>Tap to reveal answer</span>
                      </div>
                      <div className="flashcard-back">
                        <div style={{ fontSize: '1.1rem', fontWeight: 500, width: '100%' }}>
                          <RichTextRenderer content={viewingCard.answer} deckId={viewingCard.deckId} />
                        </div>
                        {viewingCard.media?.answer && <MediaDisplay mediaItem={viewingCard.media.answer} />}
                        {viewingCard.media?.answer_image && <MediaDisplay mediaItem={viewingCard.media.answer_image} />}
                        {viewingCard.media?.answer_audio && <MediaDisplay mediaItem={viewingCard.media.answer_audio} />}
                        <span style={{ position: 'absolute', bottom: '8px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>Tap to flip back</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '14px' }}>
                      <RichTextRenderer content={viewingCard.question} deckId={viewingCard.deckId} />
                    </h3>
                    {viewingCard.media?.question && <MediaDisplay mediaItem={viewingCard.media.question} />}
                    {viewingCard.media?.question_image && <MediaDisplay mediaItem={viewingCard.media.question_image} />}
                    {viewingCard.media?.question_audio && <MediaDisplay mediaItem={viewingCard.media.question_audio} />}

                    {viewingCard.template === 'multiple-choice' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                        {viewingCard.options?.map((opt, idx) => {
                          const label = String.fromCharCode(65 + idx);
                          const isCorrect = label === viewingCard.correctAnswer;
                          return (
                            <div 
                              key={idx} 
                              className={`quiz-option-btn ${isCorrect ? 'correct' : ''}`}
                            >
                              <span><strong>{label})</strong> {opt}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {viewingCard.template === 'true-false' && (
                      <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                        <div className={`quiz-option-btn justify-center ${viewingCard.correctAnswer === 'True' ? 'correct' : ''}`} style={{ flex: 1 }}>
                          ✅ True
                        </div>
                        <div className={`quiz-option-btn justify-center ${viewingCard.correctAnswer === 'False' ? 'correct' : ''}`} style={{ flex: 1 }}>
                          ❌ False
                        </div>
                      </div>
                    )}

                    {viewingCard.template === 'free-note' && (
                      <div style={{ marginTop: '12px' }}>
                        <div style={{ lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                          <RichTextRenderer content={viewingCard.notes} deckId={viewingCard.deckId} />
                        </div>
                        {viewingCard.media?.notes && <MediaDisplay mediaItem={viewingCard.media.notes} />}
                        {viewingCard.media?.notes_image && <MediaDisplay mediaItem={viewingCard.media.notes_image} />}
                        {viewingCard.media?.notes_audio && <MediaDisplay mediaItem={viewingCard.media.notes_audio} />}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button className="btn btn-secondary" onClick={() => { setViewingCard(null); setIsFlipped(false); }}>
                {lang === 'ar' ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        )}

        {/* MODAL: Edit Card form */}
        {editingCard && (
          <div className="crop-overlay-container" style={{ padding: '20px' }}>
            <form onSubmit={handleEditSave} className="glass-card" style={{ maxWidth: '540px', width: '90%', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', maxHeight: '90vh' }}>
              <h3 style={{ color: 'var(--accent-cyan)' }}>{lang === 'ar' ? 'تعديل البطاقة الدراسية' : 'Edit Study Card'}</h3>

              <div className="form-group">
                <label className="form-label">{t('question_label')}</label>
                <textarea 
                  className="form-textarea" 
                  rows={3}
                  value={editQuestion}
                  onChange={(e) => setEditQuestion(e.target.value)}
                  required
                />
              </div>

              {editTemplate === 'flashcard' && (
                <div className="form-group">
                  <label className="form-label">{t('back_label')}</label>
                  <textarea 
                    className="form-textarea" 
                    rows={3}
                    value={editAnswer}
                    onChange={(e) => setEditAnswer(e.target.value)}
                    required
                  />
                </div>
              )}

              {editTemplate === 'multiple-choice' && (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label className="form-label">{t('options_label')}</label>
                    {editOptions.map((opt, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{String.fromCharCode(65 + idx)})</span>
                        <input 
                          type="text" 
                          className="form-input"
                          value={opt}
                          onChange={(e) => {
                            const updated = [...editOptions];
                            updated[idx] = e.target.value;
                            setEditOptions(updated);
                          }}
                          required
                        />
                      </div>
                    ))}
                  </div>

                  <div className="form-group" style={{ marginTop: '10px' }}>
                    <label className="form-label">{t('correct_key_label')}</label>
                    <select 
                      className="form-select"
                      value={editCorrectAnswer}
                      onChange={(e) => setEditCorrectAnswer(e.target.value)}
                      required
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                    </select>
                  </div>
                </>
              )}

              {editTemplate === 'true-false' && (
                <div className="form-group">
                  <label className="form-label">{t('correct_key_label')}</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      type="button" 
                      className={`btn ${editCorrectAnswer === 'True' ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setEditCorrectAnswer('True')}
                      style={{ flex: 1 }}
                    >
                      True
                    </button>
                    <button 
                      type="button" 
                      className={`btn ${editCorrectAnswer === 'False' ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setEditCorrectAnswer('False')}
                      style={{ flex: 1 }}
                    >
                      False
                    </button>
                  </div>
                </div>
              )}

              {editTemplate === 'free-note' && (
                <div className="form-group">
                  <label className="form-label">{t('note_summary_label')}</label>
                  <textarea 
                    className="form-textarea" 
                    rows={5}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    required
                  />
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {lang === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setEditingCard(null)}>
                  {t('btn_cancel')}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    );
  }

  // RENDER: Inner Deck Detail - Browse Slider View Mode
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Navigation Return */}
      <button 
        className="btn btn-secondary" 
        onClick={() => setDeckViewMode('list')}
        style={{ alignSelf: 'flex-start', gap: '8px' }}
      >
        <ArrowLeft size={16} /> {lang === 'ar' ? 'العودة لقائمة المجلد' : 'Back to Deck Folder'}
      </button>

      {/* Slider Frame */}
      {deckCards.length === 0 ? (
        <div className="empty-state">
          <BookOpen size={48} />
          <h3>{t('empty_deck')}</h3>
        </div>
      ) : (
        <div style={{ maxWidth: '600px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Card {browseIndex + 1} of {deckCards.length}
            </span>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--accent-cyan)' }}>
              {deckCards[browseIndex]?.template?.replace('-', ' ')}
            </span>
          </div>

          <BrowseCardRenderer 
            card={deckCards[browseIndex]} 
            isFlipped={isFlipped} 
            setIsFlipped={setIsFlipped} 
            onDeleteCard={deleteCard}
            t={t}
            browseIndex={browseIndex}
            deckCardsLength={deckCards.length}
            setBrowseIndex={setBrowseIndex}
          />

          {/* Slider actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
            <button 
              className="btn btn-secondary" 
              onClick={() => {
                setBrowseIndex(prev => Math.max(0, prev - 1));
                setIsFlipped(false);
              }}
              disabled={browseIndex === 0}
              style={{ gap: '6px' }}
            >
              <ChevronLeft size={16} /> Previous
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={() => {
                setBrowseIndex(prev => Math.min(deckCards.length - 1, prev + 1));
                setIsFlipped(false);
              }}
              disabled={browseIndex === deckCards.length - 1}
              style={{ gap: '6px' }}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Inner slider card renderer
function BrowseCardRenderer({ card, isFlipped, setIsFlipped, onDeleteCard, t, browseIndex, deckCardsLength, setBrowseIndex }) {
  if (!card) return null;

  const handleCardClick = (e) => {
    if (e.target.closest('button') || e.target.closest('audio') || e.target.closest('video') || e.target.closest('a')) {
      return;
    }
    if (card.template === 'flashcard') {
      setIsFlipped(!isFlipped);
    }
  };

  const handleCardDelete = (e) => {
    e.stopPropagation();
    if (window.confirm('Delete this card?')) {
      onDeleteCard(card.id);
      if (browseIndex > 0 && browseIndex === deckCardsLength - 1) {
        setBrowseIndex(browseIndex - 1);
      }
    }
  };

  if (card.template === 'flashcard') {
    return (
      <div 
        className={`flashcard-wrapper ${isFlipped ? 'flipped' : ''}`}
        onClick={handleCardClick}
      >
        <div className="flashcard-inner">
          <div className="flashcard-front">
            <button 
              className="btn btn-danger btn-icon" 
              style={{ position: 'absolute', top: '12px', right: '12px', width: '28px', height: '28px' }} 
              onClick={handleCardDelete}
            >
              <Trash size={12} />
            </button>
            <div style={{ fontSize: '1.3rem', fontWeight: 600, padding: '0 20px', width: '100%' }}>
              <RichTextRenderer content={card.question} deckId={card.deckId} />
            </div>
            {card.media?.question && <MediaDisplay mediaItem={card.media.question} />}
            {card.media?.question_image && <MediaDisplay mediaItem={card.media.question_image} />}
            {card.media?.question_audio && <MediaDisplay mediaItem={card.media.question_audio} />}
            <span style={{ position: 'absolute', bottom: '16px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Click to flip / Click for answer
            </span>
          </div>

          <div className="flashcard-back">
            <button 
              className="btn btn-danger btn-icon" 
              style={{ position: 'absolute', top: '12px', right: '12px', width: '28px', height: '28px' }} 
              onClick={handleCardDelete}
            >
              <Trash size={12} />
            </button>
            <div style={{ fontSize: '1.2rem', fontWeight: 500, padding: '0 20px', width: '100%' }}>
              <RichTextRenderer content={card.answer} deckId={card.deckId} />
            </div>
            {card.media?.answer && <MediaDisplay mediaItem={card.media.answer} />}
            {card.media?.answer_image && <MediaDisplay mediaItem={card.media.answer_image} />}
            {card.media?.answer_audio && <MediaDisplay mediaItem={card.media.answer_audio} />}
            <span style={{ position: 'absolute', bottom: '16px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Click to flip back
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', minHeight: '320px', position: 'relative' }}>
      <button 
        className="btn btn-danger btn-icon" 
        style={{ position: 'absolute', top: '12px', right: '12px', width: '28px', height: '28px' }} 
        onClick={handleCardDelete}
      >
        <Trash size={12} />
      </button>

      <div>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', paddingRight: '30px' }}>
          <RichTextRenderer content={card.question} deckId={card.deckId} />
        </h3>
        {card.media?.question && <MediaDisplay mediaItem={card.media.question} />}
        {card.media?.question_image && <MediaDisplay mediaItem={card.media.question_image} />}
        {card.media?.question_audio && <MediaDisplay mediaItem={card.media.question_audio} />}
      </div>

      {card.template === 'multiple-choice' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {card.options?.map((opt, oIdx) => {
            const letter = String.fromCharCode(65 + oIdx);
            const isCorrect = letter === card.correctAnswer;
            return (
              <div 
                key={oIdx} 
                className={`quiz-option-btn ${isCorrect ? 'correct' : ''}`}
                style={{ cursor: 'default' }}
              >
                <span><strong>{letter})</strong> {opt}</span>
                {isCorrect && <span style={{ marginLeft: 'auto', color: 'var(--accent-emerald)', fontSize: '0.8rem' }}>✓ Correct Key</span>}
              </div>
            );
          })}
        </div>
      )}

      {card.template === 'true-false' && (
        <div style={{ display: 'flex', gap: '12px' }}>
          <div className={`quiz-option-btn justify-center ${card.correctAnswer === 'True' ? 'correct' : ''}`} style={{ flex: 1, cursor: 'default' }}>
            ✅ True
          </div>
          <div className={`quiz-option-btn justify-center ${card.correctAnswer === 'False' ? 'correct' : ''}`} style={{ flex: 1, cursor: 'default' }}>
            ❌ False
          </div>
        </div>
      )}

      {card.template === 'free-note' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
            <RichTextRenderer content={card.notes} deckId={card.deckId} />
          </div>
          {card.media?.notes && <MediaDisplay mediaItem={card.media.notes} />}
          {card.media?.notes_image && <MediaDisplay mediaItem={card.media.notes_image} />}
          {card.media?.notes_audio && <MediaDisplay mediaItem={card.media.notes_audio} />}
        </div>
      )}
    </div>
  );
}
