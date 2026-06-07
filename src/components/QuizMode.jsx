import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Brain, Award, ArrowRight, RotateCcw, Sparkles, Check, X, File } from 'lucide-react';
import RichTextRenderer from './RichTextRenderer';
import { getMedia } from '../utils/db';

const stripHtml = (html) => {
  if (!html) return '';
  try {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  } catch (e) {
    return html;
  }
};

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

export default function QuizMode() {
  const { cards, decks, settings, addQuizResult, setActiveTab, addToast, t, lang } = useContext(AppContext);

  // Setup State (Checking for pre-selected redirect signals)
  const [quizDeck, setQuizDeck] = useState(() => {
    return localStorage.getItem('preSelectedQuizDeck') || 'All';
  });
  const [useAI, setUseAI] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  
  // Game State
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { index: selectedOption }
  const [selfScores, setSelfScores] = useState({}); // { index: 'correct' | 'wrong' }
  const [revealAnswer, setRevealAnswer] = useState(false);
  const [freeNoteInput, setFreeNoteInput] = useState('');
  const [quizFinished, setQuizFinished] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Cleanup deck redirection on mount
  useEffect(() => {
    const preselected = localStorage.getItem('preSelectedQuizDeck');
    if (preselected) {
      setQuizDeck(preselected);
      localStorage.removeItem('preSelectedQuizDeck');
    }
  }, []);

  // Initialize Quiz
  const startQuiz = async () => {
    let deckCards = quizDeck === 'All' ? cards : cards.filter(c => c.deckId === quizDeck);
    
    if (deckCards.length === 0) {
      addToast('No cards found in this deck to run a quiz.', 'error');
      return;
    }

    if (useAI) {
      setIsGeneratingAI(true);
      try {
        if (settings.anthropicKey) {
          const notesText = deckCards.map(c => `[Template: ${c.template}] Q/Title: ${c.question} | Answer/Notes: ${c.answer || c.notes}`).join('\n');
          const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': settings.anthropicKey,
              'anthropic-version': '2023-06-01',
              'anthropic-dangerous-direct-by-browser': 'true'
            },
            body: JSON.stringify({
              model: 'claude-3-5-sonnet-20241022',
              max_tokens: 1200,
              messages: [{
                role: 'user',
                content: `You are an AI study assistant. Generate exactly 5 multiple choice questions based on the following study materials. Output ONLY a JSON array, with no markdown code fences, matching this format:\n[{"question": "Question text?", "options": ["Option A", "Option B", "Option C", "Option D"], "correctAnswer": "A"}]\n\nMaterials:\n${notesText}`
              }]
            })
          });

          if (!response.ok) throw new Error('Claude quiz generator call failed.');
          const data = await response.json();
          const jsonText = data.content[0].text.trim().replace(/^```json|```$/g, '');
          const questions = JSON.parse(jsonText);
          
          setQuizQuestions(questions.map((q, idx) => ({
            id: `ai_${idx}`,
            template: 'multiple-choice',
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            deckId: quizDeck
          })));
        } else {
          // Fallback to local AI generator
          await new Promise(resolve => setTimeout(resolve, 1500));
          const mockAIQuestions = generateMockAIQuestions(deckCards);
          setQuizQuestions(mockAIQuestions);
          addToast('Generated simulated quiz from deck materials.', 'info');
        }
      } catch (err) {
        console.error(err);
        addToast('AI Generator failed. Defaulting to standard deck cards.', 'error');
        setQuizQuestions(deckCards.slice(0, 10).map(c => ({ ...c })));
      } finally {
        setIsGeneratingAI(false);
      }
    } else {
      const shuffled = [...deckCards].sort(() => 0.5 - Math.random()).slice(0, 10);
      setQuizQuestions(shuffled);
    }

    setCurrentIndex(0);
    setSelectedAnswers({});
    setSelfScores({});
    setRevealAnswer(false);
    setFreeNoteInput('');
    setQuizFinished(false);
    setQuizStarted(true);
  };

  const generateMockAIQuestions = (deckCards) => {
    const questions = [];
    const contentText = deckCards.map(c => c.notes || c.answer).join(' ');

    if (contentText.toLowerCase().includes('photosynthesis') || contentText.toLowerCase().includes('calvin')) {
      questions.push({
        id: 'ai_mock_1',
        template: 'multiple-choice',
        question: 'During photosynthesis, which component provides the energy carriers ATP and NADPH for the Calvin Cycle?',
        options: ['The Light-Dependent Reactions', 'The Mitochondria Matrix', 'The Cytoplasm', 'The Cell Nucleus'],
        correctAnswer: 'A'
      });
      questions.push({
        id: 'ai_mock_2',
        template: 'true-false',
        question: 'True or False: The Calvin Cycle of photosynthesis directly requires solar light to split water molecules.',
        correctAnswer: 'False'
      });
    }

    if (contentText.toLowerCase().includes('relativity') || contentText.toLowerCase().includes('einstein')) {
      questions.push({
        id: 'ai_mock_3',
        template: 'multiple-choice',
        question: 'According to General Relativity, gravity is explained by which of the following mechanical descriptions?',
        options: ['Immediate force fields between masses', 'The curvature of spacetime fabrics', 'Subatomic electromagnetic exchanges', 'Centrifugal rotation arrays'],
        correctAnswer: 'B'
      });
    }

    deckCards.slice(0, 4).forEach((card, idx) => {
      if (card.template === 'flashcard') {
        questions.push({
          id: `ai_gen_${idx}`,
          template: 'multiple-choice',
          question: `Recall check: What is the primary answer associated with "${card.question}"?`,
          options: [
            card.answer,
            `Alternative theory on ${card.deckId}`,
            'Standard educational placeholder response',
            'None of the above options fit this concept'
          ].sort(() => 0.5 - Math.random()),
          correctAnswer: 'A'
        });
      }
    });

    if (questions.length === 0) {
      questions.push({
        id: 'ai_gen_fallback',
        template: 'multiple-choice',
        question: `Review Question: Regarding the subject "${quizDeck}", which parameter is primary?`,
        options: ['The core definition variables', 'Secondary structural attributes', 'Statistical validation parameters', 'General contextual references'],
        correctAnswer: 'A'
      });
    }

    return questions.map(q => {
      if (q.template === 'multiple-choice') {
        const correctVal = q.options[0];
        const shuffledOptions = [...q.options].sort(() => 0.5 - Math.random());
        const correctIndexLabel = String.fromCharCode(65 + shuffledOptions.indexOf(correctVal));
        return {
          ...q,
          options: shuffledOptions,
          correctAnswer: correctIndexLabel
        };
      }
      return q;
    });
  };

  const handleOptionSelect = (optionLabel) => {
    if (selectedAnswers[currentIndex] !== undefined) return;
    setSelectedAnswers(prev => ({ ...prev, [currentIndex]: optionLabel }));
  };

  const handleSelfScore = (scoreType) => {
    setSelfScores(prev => ({ ...prev, [currentIndex]: scoreType }));
    handleNext();
  };

  const handleNext = () => {
    setRevealAnswer(false);
    setFreeNoteInput('');
    if (currentIndex < quizQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    let finalScore = 0;
    quizQuestions.forEach((q, idx) => {
      if (q.template === 'multiple-choice' || q.template === 'true-false') {
        if (selectedAnswers[idx] === q.correctAnswer) finalScore++;
      } else {
        if (selfScores[idx] === 'correct') finalScore++;
      }
    });

    addQuizResult({
      deckName: quizDeck,
      score: finalScore,
      total: quizQuestions.length
    });

    setQuizFinished(true);
  };

  const renderQuizQuestion = () => {
    const q = quizQuestions[currentIndex];
    const userAns = selectedAnswers[currentIndex];
    const isAnswered = userAns !== undefined;

    return (
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '24px', minHeight: '380px' }}>
        {/* Progress bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>
            {t('q_progress', { current: currentIndex + 1, total: quizQuestions.length })}
          </span>
          <span style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>
            {t('cards')}: {q.deckId || quizDeck}
          </span>
        </div>
        <div style={{ width: '100%', height: '4px', background: 'var(--bg-tertiary)', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ width: `${((currentIndex + 1) / quizQuestions.length) * 100}%`, height: '100%', background: 'linear-gradient(to right, var(--accent-cyan), var(--accent-violet))', transition: 'width 0.3s' }} />
        </div>

        {/* Question text */}
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 600, lineHeight: 1.4 }}>
            <RichTextRenderer content={q.question} deckId={q.deckId || quizDeck} />
          </h2>
          {q.media?.question && <MediaDisplay mediaItem={q.media.question} />}
          {q.media?.question_image && <MediaDisplay mediaItem={q.media.question_image} />}
          {q.media?.question_audio && <MediaDisplay mediaItem={q.media.question_audio} />}
        </div>

        {/* Multiple Choice Options */}
        {q.template === 'multiple-choice' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {q.options.map((opt, oIdx) => {
              const label = String.fromCharCode(65 + oIdx);
              const isSelected = userAns === label;
              const isCorrect = label === q.correctAnswer;
              
              let optionClass = "quiz-option-btn";
              if (isAnswered) {
                if (isCorrect) optionClass += " correct";
                else if (isSelected) optionClass += " incorrect";
              } else if (isSelected) {
                optionClass += " selected";
              }

              return (
                <button
                  key={oIdx}
                  type="button"
                  className={optionClass}
                  onClick={() => handleOptionSelect(label)}
                  disabled={isAnswered}
                >
                  <strong>{label})</strong> {opt}
                </button>
              );
            })}
          </div>
        )}

        {/* True or False Options */}
        {q.template === 'true-false' && (
          <div style={{ display: 'flex', gap: '16px' }}>
            {['True', 'False'].map(opt => {
              const isSelected = userAns === opt;
              const isCorrect = opt === q.correctAnswer;

              let optionClass = "quiz-option-btn justify-center";
              if (isAnswered) {
                if (isCorrect) optionClass += " correct";
                else if (isSelected) optionClass += " incorrect";
              } else if (isSelected) {
                optionClass += " selected";
              }

              return (
                <button
                  key={opt}
                  type="button"
                  className={optionClass}
                  onClick={() => handleOptionSelect(opt)}
                  disabled={isAnswered}
                  style={{ flex: 1 }}
                >
                  {opt === 'True' ? '✅ True' : '❌ False'}
                </button>
              );
            })}
          </div>
        )}

        {/* Flashcard (Self-scoring) */}
        {q.template === 'flashcard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            {!revealAnswer ? (
              <button className="btn btn-primary" onClick={() => setRevealAnswer(true)}>
                {t('reveal_btn')}
              </button>
            ) : (
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <div style={{ background: 'var(--bg-primary)', padding: '20px', borderRadius: '12px', width: '100%', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '8px' }}>Answer</p>
                  <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>
                    <RichTextRenderer content={q.answer} deckId={q.deckId || quizDeck} />
                  </div>
                  {q.media?.answer && <MediaDisplay mediaItem={q.media.answer} />}
                  {q.media?.answer_image && <MediaDisplay mediaItem={q.media.answer_image} />}
                  {q.media?.answer_audio && <MediaDisplay mediaItem={q.media.answer_audio} />}
                </div>
                <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                  <button className="btn btn-secondary" style={{ flex: 1, border: '1px solid var(--accent-emerald)', color: 'var(--accent-emerald)' }} onClick={() => handleSelfScore('correct')}>
                    {t('right_btn')}
                  </button>
                  <button className="btn btn-secondary" style={{ flex: 1, border: '1px solid var(--accent-danger)', color: 'var(--accent-danger)' }} onClick={() => handleSelfScore('wrong')}>
                    {t('wrong_btn')}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Free Note (Self-scoring) */}
        {q.template === 'free-note' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {!revealAnswer ? (
              <>
                <textarea
                  className="form-textarea"
                  rows={4}
                  placeholder="..."
                  value={freeNoteInput}
                  onChange={(e) => setFreeNoteInput(e.target.value)}
                />
                <button className="btn btn-primary" onClick={() => setRevealAnswer(true)}>
                  {t('compare_note')}
                </button>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '4px' }}>Original Note</p>
                  <div style={{ fontSize: '0.95rem' }}>
                    <RichTextRenderer content={q.notes} deckId={q.deckId || quizDeck} />
                  </div>
                  {q.media?.notes && <MediaDisplay mediaItem={q.media.notes} />}
                  {q.media?.notes_image && <MediaDisplay mediaItem={q.media.notes_image} />}
                  {q.media?.notes_audio && <MediaDisplay mediaItem={q.media.notes_audio} />}
                </div>
                {freeNoteInput && (
                  <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)', opacity: 0.85 }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '4px' }}>Your Recall Input</p>
                    <p style={{ fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>{freeNoteInput}</p>
                  </div>
                )}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button className="btn btn-secondary" style={{ flex: 1, border: '1px solid var(--accent-emerald)', color: 'var(--accent-emerald)' }} onClick={() => handleSelfScore('correct')}>
                    {t('pass_btn')}
                  </button>
                  <button className="btn btn-secondary" style={{ flex: 1, border: '1px solid var(--accent-danger)', color: 'var(--accent-danger)' }} onClick={() => handleSelfScore('wrong')}>
                    {t('fail_btn')}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Next Button */}
        {isAnswered && (
          <button className="btn btn-primary" style={{ alignSelf: 'flex-end', gap: '6px' }} onClick={handleNext}>
            {lang === 'ar' ? 'السؤال التالي' : 'Next Question'} <ArrowRight size={16} style={{ transform: lang === 'ar' ? 'rotate(180deg)' : 'none' }} />
          </button>
        )}
      </div>
    );
  };

  const renderQuizFinished = () => {
    let score = 0;
    quizQuestions.forEach((q, idx) => {
      if (q.template === 'multiple-choice' || q.template === 'true-false') {
        if (selectedAnswers[idx] === q.correctAnswer) score++;
      } else {
        if (selfScores[idx] === 'correct') score++;
      }
    });

    const pct = Math.round((score / quizQuestions.length) * 100);

    return (
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', textAlign: 'center', padding: '40px' }}>
        <div style={{ padding: '24px', borderRadius: '50%', background: 'rgba(0, 242, 254, 0.1)', color: 'var(--accent-cyan)' }}>
          <Award size={64} />
        </div>

        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>{t('quiz_completed')}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>{t('quiz_comp_desc')}</p>
        </div>

        <div style={{ fontSize: '3rem', fontWeight: 800 }}>
          <span className="gradient-text">{score} / {quizQuestions.length}</span>
          <span style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginLeft: '10px' }}>({pct}%)</span>
        </div>

        {/* Summary grid */}
        <div style={{ width: '100%', borderTop: '1px solid var(--border-color)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>{t('review_summary')}</h3>
          {quizQuestions.map((q, idx) => {
            let isCorrect = false;
            
            if (q.template === 'multiple-choice' || q.template === 'true-false') {
              isCorrect = selectedAnswers[idx] === q.correctAnswer;
            } else {
              isCorrect = selfScores[idx] === 'correct';
            }

            return (
              <div key={q.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'var(--bg-secondary)', borderRadius: '6px', fontSize: '0.85rem' }}>
                <div style={{ maxWidth: '80%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <strong>Q{idx+1}:</strong> {stripHtml(q.question)}
                </div>
                <span style={{ color: isCorrect ? 'var(--accent-emerald)' : 'var(--accent-danger)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {isCorrect ? <Check size={14} /> : <X size={14} />} {isCorrect ? (lang === 'ar' ? 'صح' : 'Correct') : (lang === 'ar' ? 'خطأ' : 'Incorrect')}
                </span>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '10px' }}>
          <button className="btn btn-primary" onClick={startQuiz} style={{ flex: 1 }}>
            <RotateCcw size={16} /> {t('retake_btn')}
          </button>
          <button className="btn btn-secondary" onClick={() => { setQuizStarted(false); setQuizFinished(false); }} style={{ flex: 1 }}>
            {t('other_decks_btn')}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {!quizStarted && (
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Brain size={32} color="var(--accent-cyan)" />
            <h1 style={{ fontSize: '1.8rem' }}>{t('quiz_title')}</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {t('quiz_desc')}
          </p>

          <div className="form-group">
            <label className="form-label">{t('select_deck')}</label>
            <select
              className="form-select"
              value={quizDeck}
              onChange={(e) => setQuizDeck(e.target.value)}
            >
              <option value="All">{lang === 'ar' ? 'جميع المجلدات' : 'All Decks'} ({cards.length} {t('cards_count')})</option>
              {decks.map(d => (
                <option key={d} value={d}>
                  {d} ({cards.filter(c => c.deckId === d).length} {t('cards_count')})
                </option>
              ))}
            </select>
          </div>

          {/* AI Generator Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-secondary)', padding: '14px 18px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <div>
              <strong style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={16} color="var(--accent-violet)" /> {t('ai_gen_toggle')}
              </strong>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {t('ai_gen_desc')}
              </p>
            </div>
            <input
              type="checkbox"
              style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              checked={useAI}
              onChange={(e) => setUseAI(e.target.checked)}
            />
          </div>

          <button 
            type="button" 
            className="btn btn-primary" 
            onClick={startQuiz}
            style={{ marginTop: '12px' }}
            disabled={isGeneratingAI}
          >
            {isGeneratingAI ? (lang === 'ar' ? 'جاري تجهيز المواد...' : 'Assembling quiz materials...') : t('start_quiz_btn')}
          </button>
        </div>
      )}

      {quizStarted && !quizFinished && renderQuizQuestion()}

      {quizStarted && quizFinished && renderQuizFinished()}
    </div>
  );
}
