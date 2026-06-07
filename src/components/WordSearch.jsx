import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Search, Volume2, Globe, Video, ExternalLink, MessageSquare, Loader } from 'lucide-react';

export default function WordSearch() {
  const { settings, addToast } = useContext(AppContext);
  const [word, setWord] = useState('');
  const [targetLang, setTargetLang] = useState('es'); // Default to Spanish translation
  const [isLoading, setIsLoading] = useState(false);
  
  // Results State
  const [definition, setDefinition] = useState(null);
  const [translation, setTranslation] = useState('');
  const [videos, setVideos] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!word.trim() || isLoading) return;

    setIsLoading(true);
    setDefinition(null);
    setTranslation('');
    setVideos([]);

    try {
      // 1. Fetch Definition (Free Dictionary API)
      const dictRes = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
      if (dictRes.ok) {
        const dictData = await dictRes.json();
        setDefinition(dictData[0]);
      } else {
        // Simple fallback definition
        setDefinition({
          word,
          meanings: [{ partOfSpeech: 'noun', definitions: [{ definition: `Definition not found for "${word}".` }] }]
        });
      }

      // 2. Fetch Translation (MyMemory Translation API)
      const transRes = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=en|${targetLang}`);
      if (transRes.ok) {
        const transData = await transRes.json();
        setTranslation(transData.responseData?.translatedText || 'Translation unavailable.');
      } else {
        setTranslation('Translation rate-limited or unavailable.');
      }

      // 3. Fetch YouTube Video Context (if YouTube API Key is set)
      if (settings.youtubeKey) {
        const ytRes = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=3&q=${encodeURIComponent(word + ' pronunciation english')}&type=video&key=${settings.youtubeKey}`);
        if (ytRes.ok) {
          const ytData = await ytRes.json();
          setVideos(ytData.items || []);
        } else {
          throw new Error('YouTube API call failed.');
        }
      }
    } catch (err) {
      console.error(err);
      addToast('YouTube video search failed. Check your API key in settings.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const playPronunciation = () => {
    if (definition?.phonetics) {
      const audioUrl = definition.phonetics.find(p => p.audio)?.audio;
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        audio.play().catch(e => console.error(e));
      } else {
        addToast('No audio pronunciation available.', 'info');
      }
    }
  };

  const getLanguageName = (code) => {
    const list = {
      es: 'Spanish',
      fr: 'French',
      de: 'German',
      it: 'Italian',
      ar: 'Arabic',
      zh: 'Chinese',
      ja: 'Japanese',
      ru: 'Russian'
    };
    return list[code] || code;
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Title */}
      <div>
        <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Video size={28} color="var(--accent-cyan)" /> Context Word Search
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Search any vocabulary word to view translations, meanings, and hear pronunciations in real YouTube videos.
        </p>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSearch} className="glass-card" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Type a word in English (e.g. photosynthesis, ephemeral, query)..."
            value={word}
            onChange={(e) => setWord(e.target.value)}
            required
            style={{ paddingLeft: '44px' }}
          />
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '14px', color: 'var(--text-muted)' }} />
        </div>

        <select
          className="form-select"
          style={{ width: '180px' }}
          value={targetLang}
          onChange={(e) => setTargetLang(e.target.value)}
        >
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
          <option value="it">Italian</option>
          <option value="ar">Arabic</option>
          <option value="zh">Chinese</option>
          <option value="ja">Japanese</option>
          <option value="ru">Russian</option>
        </select>

        <button type="submit" className="btn btn-primary" disabled={isLoading} style={{ minWidth: '120px' }}>
          {isLoading ? <Loader size={16} className="pulsing-mic" style={{ animation: 'spin 1s linear infinite', background: 'none' }} /> : 'Search Word'}
        </button>
      </form>

      {/* Loading Skeletons */}
      {isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-card" style={{ height: '140px', opacity: 0.5 }}>Loading vocabulary data...</div>
          <div className="glass-card" style={{ height: '200px', opacity: 0.5 }}>Fetching video context...</div>
        </div>
      )}

      {/* Results details */}
      {!isLoading && (definition || translation) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          {/* Card: Definition & Translation */}
          <div className="grid grid-2" style={{ gap: '24px' }}>
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyBetween: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.4rem', textTransform: 'capitalize' }}>📖 {definition?.word || word}</h3>
                  {definition?.phonetics?.some(p => p.audio) && (
                    <button className="btn btn-secondary btn-icon" onClick={playPronunciation} title="Listen Pronunciation">
                      <Volume2 size={16} color="var(--accent-cyan)" />
                    </button>
                  )}
                </div>
                {definition?.phonetic && (
                  <p style={{ color: 'var(--accent-cyan)', fontSize: '0.9rem', marginBottom: '12px', fontFamily: 'monospace' }}>
                    {definition.phonetic}
                  </p>
                )}
                {definition?.meanings?.slice(0, 2).map((meaning, idx) => (
                  <div key={idx} style={{ marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-violet)', background: 'rgba(155, 81, 224, 0.1)', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>
                      {meaning.partOfSpeech}
                    </span>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginTop: '6px' }}>
                      {meaning.definitions[0]?.definition}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card">
              <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Globe size={18} color="var(--accent-cyan)" /> Translation ({getLanguageName(targetLang)})
              </h3>
              <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '10px', minHeight: '100px', border: '1px solid var(--border-color)' }}>
                <p style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--accent-cyan)' }}>{translation}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '20px' }}>
                  Translated via MyMemory Translator
                </p>
              </div>
            </div>
          </div>

          {/* Card: YouTube Video Context */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Video size={18} color="var(--accent-cyan)" /> Real-World Pronunciation Context
            </h3>

            {settings.youtubeKey && videos.length > 0 ? (
              <div className="grid grid-3" style={{ gap: '16px' }}>
                {videos.map(video => (
                  <div key={video.id.videoId} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', borderRadius: '8px', overflow: 'hidden', background: '#000' }}>
                      <iframe
                        src={`https://www.youtube.com/embed/${video.id.videoId}`}
                        title={video.snippet.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{ width: '100%', height: '100%' }}
                      />
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {video.snippet.title}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '20px', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '500px' }}>
                  To load real-world YouTube video contexts directly inline, please configure a **YouTube Data API Key** in settings.
                </p>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <a
                    href={`https://youglish.com/pronounce/${encodeURIComponent(word)}/english`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                    style={{ fontSize: '0.85rem' }}
                  >
                    Open YouGlish Pronunciation <ExternalLink size={14} />
                  </a>
                  <a
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(word + ' pronunciation')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                    style={{ fontSize: '0.85rem' }}
                  >
                    Search on YouTube <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
