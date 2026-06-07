import React, { useState, useEffect, useRef, useContext } from 'react';
import { Languages, ArrowRightLeft, Copy, Trash, Loader, Volume2, Square } from 'lucide-react';
import { AppContext } from '../context/AppContext';

export default function Translator() {
  const { lang } = useContext(AppContext);
  const [text, setText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('es');
  const [isLoading, setIsLoading] = useState(false);

  // Google TTS / Web Speech state tracking per button
  const [sourceSpeechState, setSourceSpeechState] = useState('idle'); // 'idle' | 'loading' | 'playing'
  const [targetSpeechState, setTargetSpeechState] = useState('idle'); // 'idle' | 'loading' | 'playing'

  const activeAudioRef = useRef(null);
  const cancelSpeechRef = useRef(false);
  const activeResolveRef = useRef(null);

  // Clean up any speaking voice when unmounting
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      cancelSpeechRef.current = true;
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
        activeAudioRef.current = null;
      }
      if (activeResolveRef.current) {
        activeResolveRef.current();
        activeResolveRef.current = null;
      }
    };
  }, []);

  const handleTranslate = async () => {
    if (!text.trim()) return;
    setIsLoading(true);

    try {
      const langPair = `${sourceLang}|${targetLang}`;
      const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}`);
      
      if (!response.ok) throw new Error('Translation API failed');
      
      const data = await response.json();
      if (data.responseData) {
        setTranslatedText(data.responseData.translatedText);
      } else {
        setTranslatedText('Could not translate. Please try again.');
      }
    } catch (error) {
      console.error(error);
      setTranslatedText('Translation request failed. Please check your network connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwap = () => {
    if (sourceLang === 'auto') return;
    const temp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(temp);
    
    const textTemp = text;
    setText(translatedText);
    setTranslatedText(textTemp);
  };

  const copyToClipboard = (val) => {
    if (!val) return;
    navigator.clipboard.writeText(val);
    alert('Copied to clipboard!');
  };

  const languageToGoogleCode = {
    en: 'en',
    es: 'es',
    fr: 'fr',
    de: 'de',
    it: 'it',
    ar: 'ar',
    zh: 'zh-CN',
    ja: 'ja',
    ru: 'ru',
    pt: 'pt'
  };

  const splitTextIntoChunks = (textToSplit, maxLength) => {
    const words = textToSplit.split(' ');
    const chunks = [];
    let current = '';

    for (const word of words) {
      if ((current + ' ' + word).trim().length <= maxLength) {
        current = (current + ' ' + word).trim();
      } else {
        if (current) chunks.push(current);
        current = word;
      }
    }
    if (current) chunks.push(current);
    return chunks;
  };

  const handleSpeak = async (textToRead, langCode, target) => {
    const setSpeechState = target === 'source' ? setSourceSpeechState : setTargetSpeechState;
    const currentSpeechState = target === 'source' ? sourceSpeechState : targetSpeechState;

    // 1. If currently playing or loading, stop it
    if (currentSpeechState === 'playing' || currentSpeechState === 'loading') {
      cancelSpeechRef.current = true;
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
        activeAudioRef.current = null;
      }
      if (activeResolveRef.current) {
        activeResolveRef.current();
        activeResolveRef.current = null;
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setSpeechState('idle');
      return;
    }

    // 2. Stop any other active synthesis or audio
    cancelSpeechRef.current = true;
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current = null;
    }
    if (activeResolveRef.current) {
      activeResolveRef.current();
      activeResolveRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSourceSpeechState('idle');
    setTargetSpeechState('idle');

    // Reset cancellation ref for this new voice playback
    cancelSpeechRef.current = false;

    // 3. Start synthesis
    setSpeechState('loading');
    const googleLang = languageToGoogleCode[langCode] || 'en';

    try {
      const chunks = splitTextIntoChunks(textToRead, 200);
      setSpeechState('playing');

      for (const chunk of chunks) {
        if (cancelSpeechRef.current) break;

        const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=${googleLang}&client=tw-ob`;
        
        await new Promise((resolve, reject) => {
          if (cancelSpeechRef.current) {
            resolve();
            return;
          }

          activeResolveRef.current = resolve;

          const audio = new Audio(url);
          activeAudioRef.current = audio;

          audio.onended = () => {
            resolve();
          };

          audio.onerror = (e) => {
            console.warn('Google Translate TTS chunk play error:', e);
            reject(new Error('Translate TTS chunk failed'));
          };

          audio.play().catch(err => {
            console.warn('Audio play request failed:', err);
            reject(new Error('Translate TTS play failed'));
          });
        });

        activeResolveRef.current = null;
        if (cancelSpeechRef.current) break;
      }

      setSpeechState('idle');
      activeAudioRef.current = null;

    } catch (error) {
      console.warn('Google Translate TTS failed, falling back to Web Speech API:', error);
      if (cancelSpeechRef.current) {
        setSpeechState('idle');
        return;
      }

      // Fallback to Web Speech API
      if (!('speechSynthesis' in window)) {
        alert('Web Speech API not supported in this browser.');
        setSpeechState('idle');
        return;
      }

      setSpeechState('playing');

      const fallbackMapping = {
        en: 'en-US',
        es: 'es-ES',
        fr: 'fr-FR',
        de: 'de-DE',
        it: 'it-IT',
        ar: 'ar-SA',
        zh: 'zh-CN',
        ja: 'ja-JP',
        ru: 'ru-RU',
        pt: 'pt-PT'
      };

      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = fallbackMapping[langCode] || 'en-US';

      utterance.onend = () => {
        setSpeechState('idle');
      };
      utterance.onerror = (e) => {
        console.error('Web Speech error:', e);
        setSpeechState('idle');
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  const renderSpeechIcon = (state) => {
    if (state === 'loading') {
      return <Loader size={14} className="pulsing-mic" style={{ animation: 'spin 1s linear infinite' }} />;
    }
    if (state === 'playing') {
      return <Square size={14} style={{ fill: 'currentColor' }} />;
    }
    return <Volume2 size={14} />;
  };

  const getButtonClass = (state) => {
    return `btn btn-secondary btn-icon ${state !== 'idle' ? 'speaking-btn-active' : ''}`;
  };

  const languagesList = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'ar', name: 'Arabic' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ru', name: 'Russian' },
    { code: 'pt', name: 'Portuguese' }
  ];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Languages size={28} color="var(--accent-cyan)" /> Universal Translator
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Translate study guides, lecture summaries, or flashcards instantly across major languages.
        </p>
      </div>

      {/* Language Selector Controls Bar */}
      <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', padding: '16px 20px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>From:</span>
          <select 
            className="form-select" 
            style={{ width: '130px', padding: '6px 12px' }}
            value={sourceLang}
            onChange={(e) => setSourceLang(e.target.value)}
          >
            <option value="auto">Auto-Detect</option>
            {languagesList.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
          </select>
        </div>

        <button className="btn btn-secondary btn-icon" style={{ width: '36px', height: '36px' }} onClick={handleSwap} disabled={sourceLang === 'auto'}>
          <ArrowRightLeft size={16} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>To:</span>
          <select 
            className="form-select" 
            style={{ width: '130px', padding: '6px 12px' }}
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
          >
            {languagesList.filter(l => l.code !== 'auto').map(l => (
              <option key={l.code} value={l.code}>{l.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Text Area translation columns */}
      <div className="grid grid-2" style={{ gap: '24px', gridTemplateColumns: '1fr 1fr' }}>
        
        {/* Left Column: Input text */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px' }}>
          <textarea
            className="form-textarea"
            rows={8}
            placeholder="Type or paste your text here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{ border: 'none', background: 'transparent', resize: 'none', padding: 0 }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button className="btn btn-secondary btn-icon" style={{ width: '32px', height: '32px' }} onClick={() => copyToClipboard(text)} title="Copy Input text">
                <Copy size={14} />
              </button>
              <button 
                type="button"
                className={getButtonClass(sourceSpeechState)} 
                style={{ width: '32px', height: '32px' }} 
                onClick={() => handleSpeak(text, sourceLang === 'auto' ? 'en' : sourceLang, 'source')} 
                title={sourceSpeechState === 'playing' ? (lang === 'ar' ? 'إيقاف الصوت' : 'Stop playback') : (lang === 'ar' ? 'نطق النص' : 'Speak text aloud')}
                disabled={!text.trim()}
              >
                {renderSpeechIcon(sourceSpeechState)}
              </button>
              <button className="btn btn-secondary btn-icon" style={{ width: '32px', height: '32px' }} onClick={() => { setText(''); setTranslatedText(''); }} title="Clear Input text">
                <Trash size={14} />
              </button>
            </div>
            <button className="btn btn-primary" onClick={handleTranslate} disabled={isLoading || !text.trim()} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              {isLoading ? <Loader size={14} className="pulsing-mic" style={{ animation: 'spin 1s linear infinite', background: 'none' }} /> : 'Translate'}
            </button>
          </div>
        </div>

        {/* Right Column: Output text */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px', background: 'var(--bg-secondary)' }}>
          <div style={{ flex: 1, minHeight: '160px', overflowY: 'auto', whiteSpace: 'pre-wrap', color: translatedText ? 'var(--text-primary)' : 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.5' }}>
            {translatedText || 'Translation will appear here...'}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '12px', flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button className="btn btn-secondary btn-icon" style={{ width: '32px', height: '32px' }} onClick={() => copyToClipboard(translatedText)} title="Copy Translation text" disabled={!translatedText}>
                <Copy size={14} />
              </button>
              <button 
                type="button"
                className={getButtonClass(targetSpeechState)} 
                style={{ width: '32px', height: '32px' }} 
                onClick={() => handleSpeak(translatedText, targetLang, 'target')} 
                title={targetSpeechState === 'playing' ? (lang === 'ar' ? 'إيقاف الصوت' : 'Stop playback') : (lang === 'ar' ? 'نطق النص' : 'Speak text aloud')}
                disabled={!translatedText}
              >
                {renderSpeechIcon(targetSpeechState)}
              </button>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Powered by MyMemory API
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
