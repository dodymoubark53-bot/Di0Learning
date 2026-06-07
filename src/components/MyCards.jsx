import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { getMedia } from '../utils/db';
import { 
  Download, 
  Upload, 
  Trash, 
  Edit, 
  FileText, 
  FolderPlus, 
  BookOpen, 
  Image, 
  Volume2, 
  File
} from 'lucide-react';

// Sub-component to load media dynamically from IndexedDB
function MediaDisplay({ mediaItem }) {
  const [url, setUrl] = useState(null);

  useEffect(() => {
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

  if (!url) return <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Loading media...</div>;

  const type = mediaItem.type || '';
  if (type.startsWith('image/')) {
    return <img src={url} alt={mediaItem.name} style={{ maxWidth: '100%', maxHeight: '180px', borderRadius: '8px', objectFit: 'contain', marginTop: '8px' }} />;
  }
  if (type.startsWith('audio/')) {
    return <audio src={url} controls style={{ width: '100%', height: '32px', marginTop: '8px' }} />;
  }
  if (type.startsWith('video/')) {
    return <video src={url} controls style={{ maxWidth: '100%', maxHeight: '180px', borderRadius: '8px', marginTop: '8px' }} />;
  }
  return (
    <div style={{ marginTop: '8px' }}>
      <a href={url} download={mediaItem.name} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', gap: '6px' }}>
        <File size={14} /> Download {mediaItem.name}
      </a>
    </div>
  );
}

export default function MyCards() {
  const { 
    cards, 
    decks, 
    deleteCard, 
    exportDeck, 
    importDeck, 
    setActiveTab 
  } = useContext(AppContext);

  const [selectedDeck, setSelectedDeck] = useState('All');
  const [flippedCards, setFlippedCards] = useState({});

  // Filter cards based on selection
  const filteredCards = selectedDeck === 'All' 
    ? cards 
    : cards.filter(c => c.deckId === selectedDeck);

  const toggleFlip = (id, e) => {
    // Avoid flipping if clicking media, buttons, or selectables
    if (e.target.closest('button') || e.target.closest('audio') || e.target.closest('a') || e.target.closest('video')) {
      return;
    }
    setFlippedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      importDeck(file);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2rem' }}>My Study Cards 🗂️</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Browse and manage your flashcards and study decks.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-primary" onClick={() => setActiveTab('new-card')}>
            <FolderPlus size={18} /> New Card
          </button>
        </div>
      </div>

      {/* Share / Export & Import Toolbar */}
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Export Deck:</span>
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
            <option value="">Select subject...</option>
            {decks.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Import ZIP:</span>
          <label className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.85rem', cursor: 'pointer' }}>
            <Upload size={14} /> Upload ZIP
            <input type="file" accept=".zip" onChange={handleImport} style={{ display: 'none' }} />
          </label>
        </div>
      </div>

      {/* Deck Selector Filter */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
        <button 
          className={`btn ${selectedDeck === 'All' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setSelectedDeck('All')}
          style={{ padding: '8px 16px', fontSize: '0.85rem' }}
        >
          All Decks ({cards.length})
        </button>
        {decks.map(deck => (
          <button
            key={deck}
            className={`btn ${selectedDeck === deck ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSelectedDeck(deck)}
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            {deck} ({cards.filter(c => c.deckId === deck).length})
          </button>
        ))}
      </div>

      {/* Empty State */}
      {filteredCards.length === 0 && (
        <div className="empty-state">
          <BookOpen size={48} />
          <h3>No Cards Found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '8px' }}>
            {selectedDeck === 'All' 
              ? "You haven't created any cards yet. Let's create your first card!"
              : `The deck "${selectedDeck}" is empty.`}
          </p>
          <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => setActiveTab('new-card')}>
            Add New Card
          </button>
        </div>
      )}

      {/* Cards Grid */}
      <div className="grid grid-2" style={{ gap: '24px' }}>
        {filteredCards.map(card => {
          const isFlipped = !!flippedCards[card.id];

          // Flashcard layout (needs flip animation)
          if (card.template === 'flashcard') {
            return (
              <div key={card.id} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 600, background: 'rgba(0, 242, 254, 0.1)', padding: '4px 8px', borderRadius: '4px' }}>
                    📖 Flashcard • {card.deckId}
                  </span>
                  <button className="btn btn-danger btn-icon" style={{ width: '28px', height: '28px' }} onClick={() => deleteCard(card.id)}>
                    <Trash size={12} />
                  </button>
                </div>

                <div 
                  className={`flashcard-wrapper ${isFlipped ? 'flipped' : ''}`}
                  onClick={(e) => toggleFlip(card.id, e)}
                >
                  <div className="flashcard-inner">
                    {/* Front */}
                    <div className="flashcard-front">
                      <p style={{ fontSize: '1.25rem', fontWeight: 600 }}>{card.question}</p>
                      {card.media?.question && <MediaDisplay mediaItem={card.media.question} />}
                      <span style={{ position: 'absolute', bottom: '12px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Tap to reveal answer
                      </span>
                    </div>

                    {/* Back */}
                    <div className="flashcard-back">
                      <p style={{ fontSize: '1.15rem', fontWeight: 500 }}>{card.answer}</p>
                      {card.media?.answer && <MediaDisplay mediaItem={card.media.answer} />}
                      <span style={{ position: 'absolute', bottom: '12px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Tap to flip back
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          // Multiple Choice layout
          if (card.template === 'multiple-choice') {
            return (
              <div key={card.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '320px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-violet)', fontWeight: 600, background: 'rgba(155, 81, 224, 0.1)', padding: '4px 8px', borderRadius: '4px' }}>
                      ❓ Multiple Choice • {card.deckId}
                    </span>
                    <button className="btn btn-danger btn-icon" style={{ width: '28px', height: '28px' }} onClick={() => deleteCard(card.id)}>
                      <Trash size={12} />
                    </button>
                  </div>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '12px' }}>{card.question}</h3>
                  {card.media?.question && <MediaDisplay mediaItem={card.media.question} />}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                    {card.options?.map((opt, oIdx) => {
                      const optLabel = String.fromCharCode(65 + oIdx); // A, B, C, D
                      const isCorrect = optLabel === card.correctAnswer;
                      return (
                        <div 
                          key={oIdx}
                          style={{
                            padding: '10px 14px',
                            background: isCorrect ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-tertiary)',
                            border: `1px solid ${isCorrect ? 'var(--accent-emerald)' : 'var(--border-color)'}`,
                            borderRadius: '8px',
                            fontSize: '0.85rem',
                            display: 'flex',
                            justifyContent: 'space-between'
                          }}
                        >
                          <span><strong>{optLabel})</strong> {opt}</span>
                          {isCorrect && <span style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>✓ Key</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          }

          // True or False layout
          if (card.template === 'true-false') {
            return (
              <div key={card.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '260px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-amber)', fontWeight: 600, background: 'rgba(245, 158, 11, 0.1)', padding: '4px 8px', borderRadius: '4px' }}>
                      ✓ True/False • {card.deckId}
                    </span>
                    <button className="btn btn-danger btn-icon" style={{ width: '28px', height: '28px' }} onClick={() => deleteCard(card.id)}>
                      <Trash size={12} />
                    </button>
                  </div>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '12px' }}>{card.question}</h3>
                  {card.media?.question && <MediaDisplay mediaItem={card.media.question} />}

                  <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                    <div style={{
                      flex: 1,
                      padding: '10px',
                      textAlign: 'center',
                      borderRadius: '8px',
                      background: card.correctAnswer === 'True' ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-tertiary)',
                      border: `1px solid ${card.correctAnswer === 'True' ? 'var(--accent-emerald)' : 'var(--border-color)'}`,
                      fontSize: '0.9rem',
                      fontWeight: 600
                    }}>
                      ✅ True
                    </div>
                    <div style={{
                      flex: 1,
                      padding: '10px',
                      textAlign: 'center',
                      borderRadius: '8px',
                      background: card.correctAnswer === 'False' ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-tertiary)',
                      border: `1px solid ${card.correctAnswer === 'False' ? 'var(--accent-emerald)' : 'var(--border-color)'}`,
                      fontSize: '0.9rem',
                      fontWeight: 600
                    }}>
                      ❌ False
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          // Free Note Card layout
          return (
            <div key={card.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '260px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, background: 'var(--bg-tertiary)', padding: '4px 8px', borderRadius: '4px' }}>
                    📝 Free Note • {card.deckId}
                  </span>
                  <button className="btn btn-danger btn-icon" style={{ width: '28px', height: '28px' }} onClick={() => deleteCard(card.id)}>
                    <Trash size={12} />
                  </button>
                </div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '10px' }}>{card.question}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                  {card.notes}
                </p>
                {card.media?.notes && <MediaDisplay mediaItem={card.media.notes} />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
