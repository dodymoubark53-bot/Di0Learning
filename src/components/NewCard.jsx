import React, { useState, useEffect, useRef, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { 
  Mic, 
  Upload, 
  Camera, 
  Trash, 
  Sparkles, 
  Play, 
  Square,
  Scissors,
  Check
} from 'lucide-react';

// Specialized audio player playback component for voice notes
function AudioPlayControls({ file, onRemove }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    const audio = new Audio(url);
    audioRef.current = audio;

    const timeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };
    
    const loadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const ended = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', timeUpdate);
    audio.addEventListener('loadedmetadata', loadedMetadata);
    audio.addEventListener('ended', ended);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', timeUpdate);
      audio.removeEventListener('loadedmetadata', loadedMetadata);
      audio.removeEventListener('ended', ended);
      URL.revokeObjectURL(url);
    };
  }, [file]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(e => console.error(e));
      setIsPlaying(true);
    }
  };

  const handleProgressClick = (e) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newPercentage = clickX / width;
    audioRef.current.currentTime = newPercentage * duration;
    setCurrentTime(audioRef.current.currentTime);
  };

  const formatTime = (secs) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="voice-playback-container">
      <button 
        type="button" 
        className="btn btn-secondary btn-icon" 
        style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
        onClick={togglePlay}
      >
        {isPlaying ? <span style={{ fontSize: '0.8rem' }}>⏸️</span> : <span style={{ fontSize: '0.8rem' }}>▶️</span>}
      </button>
      
      {/* Timeline tracker */}
      <div className="playback-progress-bar" onClick={handleProgressClick}>
        <div className="playback-progress-fill" style={{ width: `${progressPercent}%` }} />
      </div>

      {/* Timer */}
      <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', minWidth: '70px', textAlign: 'center' }}>
        {formatTime(currentTime)} / {formatTime(duration)}
      </span>

      {/* Delete / Reset */}
      <button 
        type="button" 
        className="btn btn-danger btn-icon" 
        style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
        onClick={onRemove}
        title="Delete recording"
      >
        <Trash size={12} />
      </button>
    </div>
  );
}

export default function NewCard() {
  const { decks, addCard, setActiveTab, addToast, t, lang } = useContext(AppContext);

  // Form State
  const [template, setTemplate] = useState('flashcard');
  const [deckId, setDeckId] = useState('General');
  const [newDeckName, setNewDeckName] = useState('');
  const [isCreatingDeck, setIsCreatingDeck] = useState(false);

  // Check for preselected redirect deck
  useEffect(() => {
    const pre = localStorage.getItem('preSelectedDeck');
    if (pre) {
      setDeckId(pre);
      localStorage.removeItem('preSelectedDeck');
    }
  }, []);

  // Field Values
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [notes, setNotes] = useState('');

  // Media Attachments State (Stores File/Blob objects grouped by field and type)
  const [attachedFiles, setAttachedFiles] = useState({
    question: { image: null, audio: null },
    answer: { image: null, audio: null },
    notes: { image: null, audio: null }
  });

  // Speech-to-Text / Audio Recording state
  const [activeRecordingField, setActiveRecordingField] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [recognition, setRecognition] = useState(null);

  // Camera Capture state
  const [cameraField, setCameraField] = useState(null);
  const [cameraStream, setCameraStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  
  // Crop overlay states
  const [cropBox, setCropBox] = useState({ x: 50, y: 50, w: 200, h: 200 });
  const videoRef = useRef(null);
  const cropCanvasRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = lang === 'ar' ? 'ar-SA' : 'en-US';
      setRecognition(rec);
    }
  }, [lang]);

  // Sync Recognition results
  useEffect(() => {
    if (!recognition || !activeRecordingField) return;

    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript) {
        if (activeRecordingField === 'question') setQuestion(prev => prev + ' ' + finalTranscript);
        if (activeRecordingField === 'answer') setAnswer(prev => prev + ' ' + finalTranscript);
        if (activeRecordingField === 'notes') setNotes(prev => prev + ' ' + finalTranscript);
      }
    };

    recognition.onerror = (e) => {
      console.error(e);
      addToast('Speech transcribing error.', 'error');
    };
  }, [activeRecordingField, recognition]);

  // Audio recording handlers
  const startRecording = async (field) => {
    if (activeRecordingField) return;

    if (attachedFiles[field]?.audio) {
      const confirmReplace = window.confirm('Replace existing recording?');
      if (!confirmReplace) return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        // Generate named voice note
        const audioFile = new File([audioBlob], `voice_note_${field}_${Date.now()}.webm`, { type: 'audio/webm' });
        setAttachedFiles(prev => ({
          ...prev,
          [field]: {
            ...prev[field],
            audio: audioFile
          }
        }));
        stream.getTracks().forEach(track => track.stop());
        addToast('Voice recording completed!', 'success');
      };

      setMediaRecorder(recorder);
      setAudioChunks(chunks);
      setActiveRecordingField(field);

      recorder.start();
      if (recognition) {
        recognition.start();
      }
    } catch (err) {
      console.error(err);
      addToast('Cannot access microphone.', 'error');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    if (recognition) {
      recognition.stop();
    }
    setActiveRecordingField(null);
    setMediaRecorder(null);
  };

  const processAttachedFile = (file, field) => {
    if (!file) return;
    const isImage = file.type.startsWith('image/');
    const isAudio = file.type.startsWith('audio/');
    
    if (isImage) {
      if (attachedFiles[field]?.image) {
        const confirmReplace = window.confirm('Replace existing image?');
        if (!confirmReplace) return;
      }
      setAttachedFiles(prev => ({
        ...prev,
        [field]: {
          ...prev[field],
          image: file
        }
      }));
      addToast(`Attached image: ${file.name}`, 'success');
    } else if (isAudio) {
      if (attachedFiles[field]?.audio) {
        const confirmReplace = window.confirm('Replace existing recording?');
        if (!confirmReplace) return;
      }
      setAttachedFiles(prev => ({
        ...prev,
        [field]: {
          ...prev[field],
          audio: file
        }
      }));
      addToast(`Attached audio: ${file.name}`, 'success');
    } else {
      addToast('Unsupported file type. Please upload an image or audio file.', 'error');
    }
  };

  // Drag and Drop files
  const handleFileDrop = (e, field) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processAttachedFile(file, field);
    }
  };

  const handleFileSelect = (e, field) => {
    const file = e.target.files?.[0];
    if (file) {
      processAttachedFile(file, field);
    }
  };

  const removeAttachment = (field, type) => {
    setAttachedFiles(prev => {
      const fieldMedia = prev[field] || {};
      const updatedFieldMedia = { ...fieldMedia };
      updatedFieldMedia[type] = null;
      return { ...prev, [field]: updatedFieldMedia };
    });
    addToast(`${type === 'audio' ? 'Recording' : 'Image'} removed`, 'info');
  };

  // Camera logic
  const startCamera = async (field) => {
    if (attachedFiles[field]?.image) {
      const confirmReplace = window.confirm('Replace existing image?');
      if (!confirmReplace) return;
    }
    setCameraField(field);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      setCameraStream(stream);
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      }, 100);
    } catch (err) {
      console.error(err);
      addToast('Camera access blocked or unavailable.', 'error');
      setCameraField(null);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imgData = canvas.toDataURL('image/jpeg');
      setCapturedImage(imgData);

      // Stop camera stream
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        setCameraStream(null);
      }
    }
  };

  // Render crop preview
  useEffect(() => {
    if (!capturedImage) return;

    const img = new window.Image();
    img.src = capturedImage;
    img.onload = () => {
      const canvas = cropCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      
      canvas.width = img.width > 500 ? 500 : img.width;
      canvas.height = (img.height / img.width) * canvas.width;
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Mask overlay
      ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Clear selection box
      ctx.clearRect(cropBox.x, cropBox.y, cropBox.w, cropBox.h);

      // Draw focus image portion
      ctx.drawImage(
        img,
        (cropBox.x / canvas.width) * img.width,
        (cropBox.y / canvas.height) * img.height,
        (cropBox.w / canvas.width) * img.width,
        (cropBox.h / canvas.height) * img.height,
        cropBox.x,
        cropBox.y,
        cropBox.w,
        cropBox.h
      );

      // Draw selection border
      ctx.strokeStyle = 'var(--accent-cyan)';
      ctx.lineWidth = 2;
      ctx.strokeRect(cropBox.x, cropBox.y, cropBox.w, cropBox.h);
    };
  }, [capturedImage, cropBox]);

  const saveCroppedImage = () => {
    const img = new window.Image();
    img.src = capturedImage;
    img.onload = () => {
      const canvas = cropCanvasRef.current;
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = cropBox.w;
      exportCanvas.height = cropBox.h;
      const ctx = exportCanvas.getContext('2d');

      ctx.drawImage(
        img,
        (cropBox.x / canvas.width) * img.width,
        (cropBox.y / canvas.height) * img.height,
        (cropBox.w / canvas.width) * img.width,
        (cropBox.h / canvas.height) * img.height,
        0,
        0,
        cropBox.w,
        cropBox.h
      );

      exportCanvas.toBlob(blob => {
        const croppedFile = new File([blob], `snap_${cameraField}_${Date.now()}.jpg`, { type: 'image/jpeg' });
        setAttachedFiles(prev => ({
          ...prev,
          [cameraField]: {
            ...prev[cameraField],
            image: croppedFile
          }
        }));
        
        setCapturedImage(null);
        setCameraField(null);
        addToast('Camera snaps saved.', 'success');
      }, 'image/jpeg');
    };
  };

  const closeCameraModal = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
    }
    setCameraStream(null);
    setCapturedImage(null);
    setCameraField(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (template === 'flashcard' && (!question.trim() || !answer.trim())) {
      addToast('Please input both question and answer.', 'error');
      return;
    }
    if (template === 'multiple-choice' && (!question.trim() || options.some(o => !o.trim()) || !correctAnswer)) {
      addToast('Please fill the question, all 4 options, and key answer.', 'error');
      return;
    }
    if (template === 'true-false' && (!question.trim() || !correctAnswer)) {
      addToast('Please write the true/false statement and select the key.', 'error');
      return;
    }
    if (template === 'free-note' && (!question.trim() || !notes.trim())) {
      addToast('Please write a title and note summary content.', 'error');
      return;
    }

    const finalDeck = isCreatingDeck ? newDeckName.trim() : deckId;
    if (!finalDeck) {
      addToast('Please assign a deck/subject name.', 'error');
      return;
    }

    const cardPayload = {
      deckId: finalDeck,
      template,
      question,
      answer: template === 'flashcard' ? answer : '',
      options: template === 'multiple-choice' ? options : [],
      correctAnswer: (template === 'multiple-choice' || template === 'true-false') ? correctAnswer : '',
      notes: template === 'free-note' ? notes : ''
    };

    const mediaFilesToSubmit = {};
    for (const fKey of ['question', 'answer', 'notes']) {
      const fieldMedia = attachedFiles[fKey];
      if (fieldMedia) {
        if (fieldMedia.image) {
          mediaFilesToSubmit[`${fKey}_image`] = fieldMedia.image;
        }
        if (fieldMedia.audio) {
          mediaFilesToSubmit[`${fKey}_audio`] = fieldMedia.audio;
        }
      }
    }

    await addCard(cardPayload, mediaFilesToSubmit);

    setQuestion('');
    setAnswer('');
    setOptions(['', '', '', '']);
    setCorrectAnswer('');
    setNotes('');
    setAttachedFiles({
      question: { image: null, audio: null },
      answer: { image: null, audio: null },
      notes: { image: null, audio: null }
    });
    if (isCreatingDeck) {
      setNewDeckName('');
      setIsCreatingDeck(false);
      setDeckId(finalDeck);
    }

    setActiveTab('cards');
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '2rem' }}>{t('create_card_title')} ➕</h1>
        <p style={{ color: 'var(--text-secondary)' }}>{t('create_card_desc')}</p>
      </div>

      {/* Select Template Toggle */}
      <div className="glass-card template-toggle-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', padding: '12px' }}>
        {['flashcard', 'multiple-choice', 'true-false', 'free-note'].map(tType => (
          <button
            key={tType}
            type="button"
            className={`btn ${template === tType ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => {
              setTemplate(tType);
              setQuestion('');
              setAnswer('');
              setNotes('');
              setAttachedFiles({});
            }}
            style={{ fontSize: '0.8rem', padding: '10px 4px', textTransform: 'capitalize' }}
          >
            {tType.replace('-', ' ')}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Select Deck Name */}
        <div className="form-group">
          <label className="form-label">{t('deck_label')}</label>
          <div className="flex-mobile-stack" style={{ display: 'flex', gap: '12px' }}>
            {!isCreatingDeck ? (
              <>
                <select 
                  className="form-select" 
                  value={deckId} 
                  onChange={(e) => setDeckId(e.target.value)}
                >
                  <option value="General">General</option>
                  {decks.filter(d => d !== 'General').map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <button type="button" className="btn btn-secondary" onClick={() => setIsCreatingDeck(true)}>
                  {t('create_deck')}
                </button>
              </>
            ) : (
              <>
                <input
                  type="text"
                  className="form-input"
                  placeholder={t('deck_name_placeholder')}
                  value={newDeckName}
                  onChange={(e) => setNewDeckName(e.target.value)}
                />
                <button type="button" className="btn btn-secondary" onClick={() => setIsCreatingDeck(false)}>
                  {t('use_existing')}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Templates Rendering */}

        {/* FLASHCARD */}
        {template === 'flashcard' && (
          <>
            <div className="form-group">
              <label className="form-label">{t('front_label')}</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
              <InputToolbar 
                field="question" 
                attachedMedia={attachedFiles.question} 
                onFileSelect={handleFileSelect} 
                onFileDrop={handleFileDrop}
                onRemoveFile={removeAttachment}
                onStartMic={startRecording}
                onStopMic={stopRecording}
                onStartCamera={startCamera}
                isRecording={activeRecordingField === 'question'}
                t={t}
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t('back_label')}</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
              />
              <InputToolbar 
                field="answer" 
                attachedMedia={attachedFiles.answer} 
                onFileSelect={handleFileSelect} 
                onFileDrop={handleFileDrop}
                onRemoveFile={removeAttachment}
                onStartMic={startRecording}
                onStopMic={stopRecording}
                onStartCamera={startCamera}
                isRecording={activeRecordingField === 'answer'}
                t={t}
              />
            </div>
          </>
        )}

        {/* MULTIPLE CHOICE */}
        {template === 'multiple-choice' && (
          <>
            <div className="form-group">
              <label className="form-label">{t('question_label')}</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
              <InputToolbar 
                field="question" 
                attachedMedia={attachedFiles.question} 
                onFileSelect={handleFileSelect} 
                onFileDrop={handleFileDrop}
                onRemoveFile={removeAttachment}
                onStartMic={startRecording}
                onStopMic={stopRecording}
                onStartCamera={startCamera}
                isRecording={activeRecordingField === 'question'}
                t={t}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label className="form-label">{t('options_label')}</label>
              {options.map((opt, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontWeight: '700', color: 'var(--text-secondary)' }}>
                    {String.fromCharCode(65 + idx)})
                  </span>
                  <input
                    type="text"
                    className="form-input"
                    placeholder={`Option ${String.fromCharCode(65 + idx)}...`}
                    value={opt}
                    onChange={(e) => {
                      const updated = [...options];
                      updated[idx] = e.target.value;
                      setOptions(updated);
                    }}
                  />
                </div>
              ))}
            </div>

            <div className="form-group" style={{ marginTop: '10px' }}>
              <label className="form-label">{t('correct_key_label')}</label>
              <select
                className="form-select"
                value={correctAnswer}
                onChange={(e) => setCorrectAnswer(e.target.value)}
              >
                <option value="">...</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
            </div>
          </>
        )}

        {/* TRUE OR FALSE */}
        {template === 'true-false' && (
          <>
            <div className="form-group">
              <label className="form-label">{t('statement_label')}</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
              <InputToolbar 
                field="question" 
                attachedMedia={attachedFiles.question} 
                onFileSelect={handleFileSelect} 
                onFileDrop={handleFileDrop}
                onRemoveFile={removeAttachment}
                onStartMic={startRecording}
                onStopMic={stopRecording}
                onStartCamera={startCamera}
                isRecording={activeRecordingField === 'question'}
                t={t}
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t('correct_key_label')}</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  className={`btn ${correctAnswer === 'True' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setCorrectAnswer('True')}
                  style={{ flex: 1 }}
                >
                  ✅ True
                </button>
                <button
                  type="button"
                  className={`btn ${correctAnswer === 'False' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setCorrectAnswer('False')}
                  style={{ flex: 1 }}
                >
                  ❌ False
                </button>
              </div>
            </div>
          </>
        )}

        {/* FREE NOTE CARD */}
        {template === 'free-note' && (
          <>
            <div className="form-group">
              <label className="form-label">{t('note_title_label')}</label>
              <input
                type="text"
                className="form-input"
                placeholder="..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t('note_summary_label')}</label>
              <textarea
                className="form-textarea"
                rows={6}
                placeholder="..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <InputToolbar 
                field="notes" 
                attachedMedia={attachedFiles.notes} 
                onFileSelect={handleFileSelect} 
                onFileDrop={handleFileDrop}
                onRemoveFile={removeAttachment}
                onStartMic={startRecording}
                onStopMic={stopRecording}
                onStartCamera={startCamera}
                isRecording={activeRecordingField === 'notes'}
                t={t}
              />
            </div>
          </>
        )}

        {/* Save & Cancel */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
          <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
            <Sparkles size={16} /> {t('save_card_btn')}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => setActiveTab('cards')} style={{ flex: 0.3 }}>
            {t('btn_cancel')}
          </button>
        </div>
      </form>

      {/* Video Capture Modal */}
      {cameraField && (
        <div className="crop-overlay-container">
          {!capturedImage ? (
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '500px', width: '90%' }}>
              <h3 style={{ color: 'var(--accent-cyan)' }}>Camera Capture</h3>
              <div style={{ width: '100%', aspectRatio: '4/3', background: '#000', borderRadius: '8px', overflow: 'hidden' }}>
                <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                <button type="button" className="btn btn-primary" onClick={capturePhoto} style={{ flex: 1 }}>
                  Snap Photo
                </button>
                <button type="button" className="btn btn-secondary" onClick={closeCameraModal}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '550px', width: '95%' }}>
              <h3 style={{ color: 'var(--accent-violet)' }}>Adjust Crop Margins</h3>
              
              <div className="crop-canvas-wrapper">
                <canvas ref={cropCanvasRef} />
              </div>

              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Left margin:</span>
                  <input
                    type="range"
                    min="0"
                    max="300"
                    value={cropBox.x}
                    onChange={(e) => setCropBox(prev => ({ ...prev, x: parseInt(e.target.value, 10) }))}
                    style={{ width: '65%' }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Top margin:</span>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={cropBox.y}
                    onChange={(e) => setCropBox(prev => ({ ...prev, y: parseInt(e.target.value, 10) }))}
                    style={{ width: '65%' }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Width size:</span>
                  <input
                    type="range"
                    min="50"
                    max="350"
                    value={cropBox.w}
                    onChange={(e) => setCropBox(prev => ({ ...prev, w: parseInt(e.target.value, 10) }))}
                    style={{ width: '65%' }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Height size:</span>
                  <input
                    type="range"
                    min="50"
                    max="350"
                    value={cropBox.h}
                    onChange={(e) => setCropBox(prev => ({ ...prev, h: parseInt(e.target.value, 10) }))}
                    style={{ width: '65%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '10px' }}>
                <button type="button" className="btn btn-primary" onClick={saveCroppedImage} style={{ flex: 1 }}>
                  <Check size={16} /> Save Crop Snaps
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setCapturedImage(null)}>
                  Retake Photo
                </button>
                <button type="button" className="btn btn-secondary" onClick={closeCameraModal} style={{ padding: '10px' }}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Sub-component toolbar mapping input tools
function InputToolbar({ 
  field, 
  attachedMedia, 
  onFileSelect, 
  onFileDrop, 
  onRemoveFile, 
  onStartMic, 
  onStopMic, 
  onStartCamera, 
  isRecording,
  t
}) {
  const imageFile = attachedMedia?.image;
  const audioFile = attachedMedia?.audio;

  return (
    <div 
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-primary)',
        padding: '10px 14px',
        border: '1px solid var(--border-color)',
        borderTop: 'none',
        borderRadius: '0 0 10px 10px',
        gap: '8px'
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => onFileDrop(e, field)}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {!isRecording ? (
            <button 
              type="button" 
              className="btn btn-secondary" 
              style={{ padding: '6px 10px', fontSize: '0.8rem', gap: '4px' }}
              onClick={() => onStartMic(field)}
            >
              <Mic size={14} color="var(--accent-cyan)" /> {t('record_stt')}
            </button>
          ) : (
            <button 
              type="button" 
              className="btn btn-danger pulsing-mic" 
              style={{ padding: '6px 10px', fontSize: '0.8rem', gap: '4px' }}
              onClick={onStopMic}
            >
              <Square size={14} /> {t('stop_recording')}
            </button>
          )}

          <button 
            type="button" 
            className="btn btn-secondary" 
            style={{ padding: '6px 10px', fontSize: '0.8rem', gap: '4px' }}
            onClick={() => onStartCamera(field)}
          >
            <Camera size={14} color="var(--accent-violet)" /> {t('camera_snap')}
          </button>

          <label className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '0.8rem', gap: '4px', cursor: 'pointer' }}>
            <Upload size={14} color="var(--accent-amber)" /> {t('upload_file')}
            <input 
              type="file" 
              onChange={(e) => onFileSelect(e, field)} 
              style={{ display: 'none' }} 
              accept="image/*,audio/*"
            />
          </label>
        </div>

        {/* Image Attachment Display */}
        {imageFile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', background: 'var(--bg-tertiary)', padding: '4px 10px', borderRadius: '6px' }}>
            <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              🖼️ {imageFile.name}
            </span>
            <button 
              type="button" 
              className="btn btn-danger btn-icon" 
              style={{ width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => onRemoveFile(field, 'image')}
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* Render Playback Slider controls if it is a recorded voice note */}
      {audioFile && (
        <AudioPlayControls file={audioFile} onRemove={() => onRemoveFile(field, 'audio')} />
      )}
    </div>
  );
}
