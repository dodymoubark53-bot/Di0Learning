import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Brain, Award, ArrowRight, RotateCcw, AlertTriangle, Sparkles, Check, X, ShieldAlert } from 'lucide-react';

export default function QuizMode() {
  const { cards, decks, settings, addQuizResult, setActiveTab, addToast } = useContext(AppContext);

  // Setup State
  const [quizDeck, setQuizDeck] = useState('All');
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

  // Initialize Quiz
  const startQuiz = async () => {
    // Filter cards
    let deckCards = quizDeck === 'All' ? cards : cards.filter(c => c.deckId === quizDeck);
    
    if (deckCards.length === 0) {
      addToast('No cards found in this deck to run a quiz.', 'error');
      return;
    }

    if (useAI) {
      setIsGeneratingAI(true);
      try {
        if (settings.anthropicKey) {
          // Construct prompt for Claude to generate a quiz from selected cards
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
          // Fallback to local AI generator simulator
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
      // Standard quiz: Shuffle and take up to 10 cards
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

  // Pre-seeded responses for local AI generator when key is absent
  const generateMockAIQuestions = (deckCards) => {
    const questions = [];
    // Extract terms from cards to build options
    const titles = deckCards.map(c => c.question).filter(Boolean);
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

    // Default general questions based on user's custom deck items
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
          correctAnswer: 'A' // We will label it correctly during assignment
        });
      }
    });

    // Fallback if we couldn't parse anything specific
    if (questions.length === 0) {
      questions.push({
        id: 'ai_gen_fallback',
        template: 'multiple-choice',
        question: `Review Question: Regarding the subject "${quizDeck}", which parameter is primary?`,
        options: ['The core definition variables', 'Secondary structural attributes', 'Statistical validation parameters', 'General contextual references'],
        correctAnswer: 'A'
      });
    }

    // Standardize correct answer sorting
    return questions.map(q => {
      if (q.template === 'multiple-choice') {
        const correctVal = q.options[0]; // Set correct item
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
    if (selectedAnswers[currentIndex] !== undefined) return; // Answer already lock-in
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
    // Calculate final scores
    let finalScore = 0;
    quizQuestions.forEach((q, idx) => {
      if (q.template === 'multiple-choice' || q.template === 'true-false') {
        if (selectedAnswers[idx] === q.correctAnswer) {
          finalScore++;
        }
      } else {
        if (selfScores[idx] === 'correct') {
          finalScore++;
        }
      }
    });

    addQuizResult({
      deckName: quizDeck,
      score: finalScore,
      total: quizQuestions.length
    });

    setQuizFinished(true);
  };

  // Render question slide
  const renderQuizQuestion = () => {
    const q = quizQuestions[currentIndex];
    const userAns = selectedAnswers[currentIndex];
    const isAnswered = userAns !== undefined;

    return (
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '24px', minHeight: '380px' }}>
        {/* Progress bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>
            Question {currentIndex + 1} of {quizQuestions.length}
          </span>
          <span style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>
            Deck: {quizDeck}
          </span>
        </div>
        <div style={{ width: '100%', height: '4px', background: 'var(--bg-tertiary)', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ width: `${((currentIndex + 1) / quizQuestions.length) * 100}%`, height: '100%', background: 'linear-gradient(to right, var(--accent-cyan), var(--accent-violet))', transition: 'width 0.3s' }} />
        </div>

        {/* Question text */}
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 600, lineHeight: 1.4 }}>{q.question}</h2>
        </div>

        {/* Templates logic */}

        {/* Multiple Choice Card */}
        {q.template === 'multiple-choice' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {q.options.map((opt, oIdx) => {
              const label = String.fromCharCode(65 + oIdx);
              const isSelected = userAns === label;
              const isCorrect = label === q.correctAnswer;
              
              let borderStyle = 'var(--border-color)';
              let bgStyle = 'var(--bg-secondary)';
              
              if (isAnswered) {
                if (isCorrect) {
                  borderStyle = 'var(--accent-emerald)';
                  bgStyle = 'rgba(16, 185, 129, 0.15)';
                } else if (isSelected) {
                  borderStyle = 'var(--accent-danger)';
                  bgStyle = 'rgba(239, 68, 68, 0.15)';
                }
              } else {
                borderStyle = 'var(--border-color)';
              }

              return (
                <button
                  key={oIdx}
                  type="button"
                  className="btn"
                  onClick={() => handleOptionSelect(label)}
                  disabled={isAnswered}
                  style={{
                    justifyContent: 'flex-start',
                    background: bgStyle,
                    border: `1px solid ${borderStyle}`,
                    padding: '14px',
                    fontSize: '0.9rem',
                    textAlign: 'left'
                  }}
                >
                  <strong style={{ marginRight: '8px' }}>{label})</strong> {opt}
                </button>
              );
            })}
          </div>
        )}

        {/* True or False Card */}
        {q.template === 'true-false' && (
          <div style={{ display: 'flex', gap: '16px' }}>
            {['True', 'False'].map(opt => {
              const isSelected = userAns === opt;
              const isCorrect = opt === q.correctAnswer;

              let borderStyle = 'var(--border-color)';
              let bgStyle = 'var(--bg-secondary)';
              
              if (isAnswered) {
                if (isCorrect) {
                  borderStyle = 'var(--accent-emerald)';
                  bgStyle = 'rgba(16, 185, 129, 0.15)';
                } else if (isSelected) {
                  borderStyle = 'var(--accent-danger)';
                  bgStyle = 'rgba(239, 68, 68, 0.15)';
                }
              }

              return (
                <button
                  key={opt}
                  type="button"
                  className="btn"
                  onClick={() => handleOptionSelect(opt)}
                  disabled={isAnswered}
                  style={{
                    flex: 1,
                    background: bgStyle,
                    border: `1px solid ${borderStyle}`,
                    padding: '16px',
                    fontWeight: 600
                  }}
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
                Reveal Answer
              </button>
            ) : (
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <div style={{ background: 'var(--bg-primary)', padding: '20px', borderRadius: '12px', width: '100%', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '8px' }}>Answer</p>
                  <p style={{ fontSize: '1.2rem', fontWeight: 600 }}>{q.answer}</p>
                </div>
                <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                  <button className="btn btn-secondary" style={{ flex: 1, border: '1px solid var(--accent-emerald)', color: 'var(--accent-emerald)' }} onClick={() => handleSelfScore('correct')}>
                    ✓ I was right
                  </button>
                  <button className="btn btn-secondary" style={{ flex: 1, border: '1px solid var(--accent-danger)', color: 'var(--accent-danger)' }} onClick={() => handleSelfScore('wrong')}>
                    ✗ I was wrong
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
                  placeholder="Type your recall notes here to compare..."
                  value={freeNoteInput}
                  onChange={(e) => setFreeNoteInput(e.target.value)}
                />
                <button className="btn btn-primary" onClick={() => setRevealAnswer(true)}>
                  Compare with Original Note
                </button>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '4px' }}>Original Note</p>
                  <p style={{ fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>{q.notes}</p>
                </div>
                {freeNoteInput && (
                  <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)', opacity: 0.85 }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '4px' }}>Your Recall Input</p>
                    <p style={{ fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>{freeNoteInput}</p>
                  </div>
                )}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button className="btn btn-secondary" style={{ flex: 1, border: '1px solid var(--accent-emerald)', color: 'var(--accent-emerald)' }} onClick={() => handleSelfScore('correct')}>
                    ✓ Recalled Well (Pass)
                  </button>
                  <button className="btn btn-secondary" style={{ flex: 1, border: '1px solid var(--accent-danger)', color: 'var(--accent-danger)' }} onClick={() => handleSelfScore('wrong')}>
                    ✗ Forgot Details (Fail)
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Nav Toolbar */}
        {isAnswered && (
          <button className="btn btn-primary" style={{ alignSelf: 'flex-end', gap: '6px' }} onClick={handleNext}>
            Next Question <ArrowRight size={16} />
          </button>
        )}
      </div>
    );
  };

  // Render score totals
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
          <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Quiz Completed!</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Great job reviewing your deck subjects.</p>
        </div>

        <div style={{ fontSize: '3rem', fontWeight: 800 }}>
          <span className="gradient-text">{score} / {quizQuestions.length}</span>
          <span style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginLeft: '10px' }}>({pct}%)</span>
        </div>

        {/* Summary grid */}
        <div style={{ width: '100%', borderTop: '1px solid var(--border-color)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>Review Summary:</h3>
          {quizQuestions.map((q, idx) => {
            const templateLabel = q.template.replace('-', ' ');
            let isCorrect = false;
            
            if (q.template === 'multiple-choice' || q.template === 'true-false') {
              isCorrect = selectedAnswers[idx] === q.correctAnswer;
            } else {
              isCorrect = selfScores[idx] === 'correct';
            }

            return (
              <div key={q.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'var(--bg-secondary)', borderRadius: '6px', fontSize: '0.85rem' }}>
                <div style={{ maxWidth: '80%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <strong>Q{idx+1}:</strong> {q.question}
                </div>
                <span style={{ color: isCorrect ? 'var(--accent-emerald)' : 'var(--accent-danger)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {isCorrect ? <Check size={14} /> : <X size={14} />} {isCorrect ? 'Correct' : 'Incorrect'}
                </span>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '10px' }}>
          <button className="btn btn-primary" onClick={startQuiz} style={{ flex: 1 }}>
            <RotateCcw size={16} /> Retake Quiz
          </button>
          <button className="btn btn-secondary" onClick={() => { setQuizStarted(false); setQuizFinished(false); }} style={{ flex: 1 }}>
            Review other Decks
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Quiz setup view */}
      {!quizStarted && (
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Brain size={32} color="var(--accent-cyan)" />
            <h1 style={{ fontSize: '1.8rem' }}>Quiz Mode</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Test your knowledge by taking a customized quiz from your study decks.
          </p>

          <div className="form-group">
            <label className="form-label">Select Deck / Subject</label>
            <select
              className="form-select"
              value={quizDeck}
              onChange={(e) => setQuizDeck(e.target.value)}
            >
              <option value="All">All Decks ({cards.length} cards)</option>
              {decks.map(d => (
                <option key={d} value={d}>
                  {d} ({cards.filter(c => c.deckId === d).length} cards)
                </option>
              ))}
            </select>
          </div>

          {/* AI Generator Toggle option */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-secondary)', padding: '14px 18px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <div>
              <strong style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={16} color="var(--accent-violet)" /> Auto-Generate via AI
              </strong>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Transforms your raw card summaries/notes into a 5-question test.
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
            {isGeneratingAI ? 'Assembling quiz materials...' : 'Start Review Quiz'}
          </button>
        </div>
      )}

      {/* Quiz questions view */}
      {quizStarted && !quizFinished && renderQuizQuestion()}

      {/* Quiz completed view */}
      {quizStarted && quizFinished && renderQuizFinished()}
    </div>
  );
}
