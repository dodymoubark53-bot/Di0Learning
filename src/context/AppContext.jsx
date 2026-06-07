import React, { createContext, useState, useEffect } from 'react';
import JSZip from 'jszip';
import { saveMedia, getMedia, deleteMedia } from '../utils/db';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Navigation / Routing
  const [activeTab, setActiveTab] = useState('home');

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
  const [cards, setCards] = useState(() => {
    const saved = localStorage.getItem('cards');
    return saved ? JSON.parse(saved) : [];
  });

  // Study Planner Schedule
  const [schedule, setSchedule] = useState(() => {
    const saved = localStorage.getItem('schedule');
    return saved ? JSON.parse(saved) : [];
  });

  // Quiz History
  const [quizHistory, setQuizHistory] = useState(() => {
    const saved = localStorage.getItem('quizHistory');
    return saved ? JSON.parse(saved) : [];
  });

  // Toast System
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync state changes to LocalStorage
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('showOnboarding', showOnboarding.toString());
  }, [showOnboarding]);

  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('cards', JSON.stringify(cards));
  }, [cards]);

  useEffect(() => {
    localStorage.setItem('schedule', JSON.stringify(schedule));
  }, [schedule]);

  useEffect(() => {
    localStorage.setItem('quizHistory', JSON.stringify(quizHistory));
  }, [quizHistory]);

  // Theme Actions
  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  // Decks list (derived from cards)
  const decks = Array.from(new Set(cards.map(c => c.deckId).filter(Boolean)));

  // Card Actions
  const addCard = async (cardData, mediaFiles = {}) => {
    const cardId = Date.now().toString();
    const mediaMetadata = {};

    // Save attached files to IndexedDB
    for (const field of Object.keys(mediaFiles)) {
      const file = mediaFiles[field];
      if (file) {
        const mediaId = `media_${cardId}_${field}_${Date.now()}`;
        await saveMedia(mediaId, file, file.name);
        mediaMetadata[field] = {
          id: mediaId,
          name: file.name,
          type: file.type
        };
      }
    }

    const newCard = {
      id: cardId,
      deckId: cardData.deckId || 'General',
      template: cardData.template || 'flashcard',
      question: cardData.question || '',
      answer: cardData.answer || '',
      options: cardData.options || ['', '', '', ''],
      correctAnswer: cardData.correctAnswer || '',
      notes: cardData.notes || '',
      media: mediaMetadata,
      createdAt: Date.now()
    };

    setCards(prev => [newCard, ...prev]);
    addToast('Card created successfully!', 'success');
  };

  const updateCard = async (cardId, updatedData, mediaFiles = {}, deletedMediaIds = []) => {
    // Delete any media marked for deletion
    for (const mId of deletedMediaIds) {
      await deleteMedia(mId);
    }

    const currentCard = cards.find(c => c.id === cardId);
    if (!currentCard) return;

    const mediaMetadata = { ...(currentCard.media || {}) };

    // Remove deleted media from metadata
    for (const field of Object.keys(mediaMetadata)) {
      if (deletedMediaIds.includes(mediaMetadata[field].id)) {
        delete mediaMetadata[field];
      }
    }

    // Save newly attached files
    for (const field of Object.keys(mediaFiles)) {
      const file = mediaFiles[field];
      if (file) {
        // If there was previous media on this field, delete it
        if (mediaMetadata[field]) {
          await deleteMedia(mediaMetadata[field].id);
        }
        const mediaId = `media_${cardId}_${field}_${Date.now()}`;
        await saveMedia(mediaId, file, file.name);
        mediaMetadata[field] = {
          id: mediaId,
          name: file.name,
          type: file.type
        };
      }
    }

    setCards(prev => prev.map(c => {
      if (c.id === cardId) {
        return {
          ...c,
          deckId: updatedData.deckId || 'General',
          template: updatedData.template || c.template,
          question: updatedData.question ?? c.question,
          answer: updatedData.answer ?? c.answer,
          options: updatedData.options ?? c.options,
          correctAnswer: updatedData.correctAnswer ?? c.correctAnswer,
          notes: updatedData.notes ?? c.notes,
          media: mediaMetadata
        };
      }
      return c;
    }));
    addToast('Card updated successfully!', 'success');
  };

  const deleteCard = async (cardId) => {
    const card = cards.find(c => c.id === cardId);
    if (card && card.media) {
      // Clean up media files from IndexedDB
      for (const field of Object.keys(card.media)) {
        await deleteMedia(card.media[field].id);
      }
    }

    setCards(prev => prev.filter(c => c.id !== cardId));
    addToast('Card deleted.', 'info');
  };

  // Schedule Actions
  const addSession = (sessionData) => {
    const newSession = {
      id: Date.now().toString(),
      subject: sessionData.subject || 'Study Session',
      date: sessionData.date || new Date().toISOString().split('T')[0],
      time: sessionData.time || '12:00',
      duration: parseInt(sessionData.duration, 10) || 60,
      notes: sessionData.notes || '',
      color: sessionData.color || '#9b51e0'
    };
    setSchedule(prev => [...prev, newSession]);
    addToast('Session added to planner!', 'success');
  };

  const deleteSession = (sessionId) => {
    setSchedule(prev => prev.filter(s => s.id !== sessionId));
    addToast('Session removed.', 'info');
  };

  // Quiz Performance
  const addQuizResult = (result) => {
    const newResult = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(),
      deckName: result.deckName,
      score: result.score,
      total: result.total
    };
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
      
      // Store card configurations as metadata.json
      zip.file('deck_metadata.json', JSON.stringify(deckCards, null, 2));

      // Fetch all attached media from IndexedDB and add to ZIP
      for (const card of deckCards) {
        if (card.media) {
          for (const field of Object.keys(card.media)) {
            const mediaItem = card.media[field];
            const mediaRecord = await getMedia(mediaItem.id);
            if (mediaRecord && mediaRecord.blob) {
              zip.file(`media/${mediaItem.id}`, mediaRecord.blob);
            }
          }
        }
      }

      // Generate the package ZIP download
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
        // Generate new card IDs to prevent collisions
        const oldId = card.id;
        const newCardId = Date.now().toString() + '_' + Math.random().toString(36).substr(2, 5);
        card.id = newCardId;
        card.createdAt = Date.now();

        // Check and copy files from ZIP into local IndexedDB
        if (card.media) {
          const newMedia = {};
          for (const field of Object.keys(card.media)) {
            const mediaItem = card.media[field];
            const zipMediaFile = zip.file(`media/${mediaItem.id}`);
            
            if (zipMediaFile) {
              const fileBlob = await zipMediaFile.async('blob');
              const newMediaId = `media_${newCardId}_${field}_${Date.now()}`;
              
              // Re-create the blob with the proper type
              const typedBlob = new Blob([fileBlob], { type: mediaItem.type });
              await saveMedia(newMediaId, typedBlob, mediaItem.name);
              
              newMedia[field] = {
                id: newMediaId,
                name: mediaItem.name,
                type: mediaItem.type
              };
            }
          }
          card.media = newMedia;
        }

        newCardsList.unshift(card);
      }

      setCards(newCardsList);
      addToast(`Imported ${importedCards.length} cards!`, 'success');
    } catch (error) {
      console.error(error);
      addToast('Failed to import deck. Ensure files are valid ZIP formats.', 'error');
    }
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        theme,
        toggleTheme,
        showOnboarding,
        setShowOnboarding,
        settings,
        setSettings,
        cards,
        decks,
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
        toasts,
        addToast,
        removeToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
