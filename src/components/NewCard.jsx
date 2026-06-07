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

export default function NewCard() {
  const { decks, addCard, setActiveTab, addToast } = useContext(AppContext);

  // Form State
  const [template, setTemplate] = useState('flashcard');
  const [deckId, setDeckId] = useState('General');
  const [newDeckName, setNewDeckName] = useState('');
  const [isCreatingDeck, setIsCreatingDeck] = useState(false);

  // Field Values
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [notes, setNotes] = useState('');

  // Media Attachments State (Stores file objects or Blobs)
  const [attachedFiles, setAttachedFiles] = useState({}); // { question: File/Blob, answer: File/Blob, notes: File/Blob }

  // Speech-to-Text / Audio Recording state
  const [activeRecordingField, setActiveRecordingField] = useState(null); // 'question' | 'answer' | 'notes'
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [recognition, setRecognition] = useState(null);

  // Camera Capture state
  const [cameraField, setCameraField] = useState(null); // 'question' | 'answer' | 'notes'
  const [cameraStream, setCameraStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null); // base64 string
  
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
      rec.lang = 'en-US';
      setRecognition(rec);
    }
  }, []);

  // Sync Recognition to input updates
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

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        // Set file attachment
        const audioFile = new File([audioBlob], `voice_note_${field}_${Date.now()}.webm`, { type: 'audio/webm' });
        setAttachedFiles(prev => ({ ...prev, [field]: audioFile }));
        stream.getTracks().forEach(track => track.stop());
        addToast('Audio note captured and linked to card.', 'success');
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

  // Drag and Drop files
  const handleFileDrop = (e, field) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setAttachedFiles(prev => ({ ...prev, [field]: file }));
      addToast(`Attached ${file.name}`, 'success');
    }
  };

  const handleFileSelect = (e, field) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFiles(prev => ({ ...prev, [field]: file }));
      addToast(`Attached ${file.name}`, 'success');
    }
  };

  const removeAttachment = (field) => {
    setAttachedFiles(prev => {
      const updated = { ...prev };
      delete updated[field];
      return updated;
    });
    addToast('Attachment removed', 'info');
  };

  // Camera logic
  const startCamera = async (field) => {
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

  // Handle rendering of crop canvas preview
  useEffect(() => {
    if (!capturedImage) return;

    const img = new window.Image();
    img.src = capturedImage;
    img.onload = () => {
      const canvas = cropCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      
      // Draw base photo fit-sized
      canvas.width = img.width > 500 ? 500 : img.width;
      canvas.height = (img.height / img.width) * canvas.width;
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Dark translucent mask over canvas
      ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Clear the crop box area
      ctx.clearRect(cropBox.x, cropBox.y, cropBox.w, cropBox.h);

      // Redraw selected crop section in focus
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

      // Draw border edge on crop box
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
        setAttachedFiles(prev => ({ ...prev, [cameraField]: croppedFile }));
        
        // Reset state
        setCapturedImage(null);
        setCameraField(null);
        addToast('Cropped camera snap added to card.', 'success');
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

  // Save Card Submit Handler
  const handleSave = async (e) => {
    e.preventDefault();

    // Validations
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
      question: template === 'free-note' ? question : question, // Question or Title
      answer: template === 'flashcard' ? answer : '',
      options: template === 'multiple-choice' ? options : [],
      correctAnswer: (template === 'multiple-choice' || template === 'true-false') ? correctAnswer : '',
      notes: template === 'free-note' ? notes : ''
    };

    // Save Card
    await addCard(cardPayload, attachedFiles);

    // Reset Form Fields
    setQuestion('');
    setAnswer('');
    setOptions(['', '', '', '']);
    setCorrectAnswer('');
    setNotes('');
    setAttachedFiles({});
    if (isCreatingDeck) {
      setNewDeckName('');
      setIsCreatingDeck(false);
      setDeckId(finalDeck);
    }

    // Switch back to view cards
    setActiveTab('cards');
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '2rem' }}>Create Study Card ➕</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Choose a template layout and input your academic materials.</p>
      </div>

      {/* Select Template Toggle */}
      <div className="glass-card" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', padding: '12px' }}>
        {['flashcard', 'multiple-choice', 'true-false', 'free-note'].map(t => (
          <button
            key={t}
            type="button"
            className={`btn ${template === t ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => {
              setTemplate(t);
              setQuestion('');
              setAnswer('');
              setNotes('');
              setAttachedFiles({});
            }}
            style={{ fontSize: '0.8rem', padding: '10px 4px', textTransform: 'capitalize' }}
          >
            {t.replace('-', ' ')}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Select Deck Name */}
        <div className="form-group">
          <label className="form-label">Deck / Subject</label>
          <div style={{ display: 'flex', gap: '12px' }}>
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
                  Create Deck
                </button>
              </>
            ) : (
              <>
                <input
                  type="text"
                  className="form-input"
                  placeholder="New deck name (e.g. Physics, History)..."
                  value={newDeckName}
                  onChange={(e) => setNewDeckName(e.target.value)}
                />
                <button type="button" className="btn btn-secondary" onClick={() => setIsCreatingDeck(false)}>
                  Use Existing
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
              <label className="form-label">Front Side (Question / Concept)</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Write front side question or concept..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
              <InputToolbar 
                field="question" 
                attachedFile={attachedFiles.question} 
                onFileSelect={handleFileSelect} 
                onFileDrop={handleFileDrop}
                onRemoveFile={removeAttachment}
                onStartMic={startRecording}
                onStopMic={stopRecording}
                onStartCamera={startCamera}
                isRecording={activeRecordingField === 'question'}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Back Side (Definition / Answer)</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Write back side definition or answer..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
              />
              <InputToolbar 
                field="answer" 
                attachedFile={attachedFiles.answer} 
                onFileSelect={handleFileSelect} 
                onFileDrop={handleFileDrop}
                onRemoveFile={removeAttachment}
                onStartMic={startRecording}
                onStopMic={stopRecording}
                onStartCamera={startCamera}
                isRecording={activeRecordingField === 'answer'}
              />
            </div>
          </>
        )}

        {/* MULTIPLE CHOICE */}
        {template === 'multiple-choice' && (
          <>
            <div className="form-group">
              <label className="form-label">Question</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Type the question..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
              <InputToolbar 
                field="question" 
                attachedFile={attachedFiles.question} 
                onFileSelect={handleFileSelect} 
                onFileDrop={handleFileDrop}
                onRemoveFile={removeAttachment}
                onStartMic={startRecording}
                onStopMic={stopRecording}
                onStartCamera={startCamera}
                isRecording={activeRecordingField === 'question'}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label className="form-label">Answer Options</label>
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
              <label className="form-label">Correct Key Option</label>
              <select
                className="form-select"
                value={correctAnswer}
                onChange={(e) => setCorrectAnswer(e.target.value)}
              >
                <option value="">Choose correct option...</option>
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
              <label className="form-label">Statement</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Write the true/false statement..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
              <InputToolbar 
                field="question" 
                attachedFile={attachedFiles.question} 
                onFileSelect={handleFileSelect} 
                onFileDrop={handleFileDrop}
                onRemoveFile={removeAttachment}
                onStartMic={startRecording}
                onStopMic={stopRecording}
                onStartCamera={startCamera}
                isRecording={activeRecordingField === 'question'}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Correct Answer</label>
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
              <label className="form-label">Note Title / Topic</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Mitochondria Structure, French Revolution Timeline..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Note Summary / Content</label>
              <textarea
                className="form-textarea"
                rows={6}
                placeholder="Write your study notes and summaries..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <InputToolbar 
                field="notes" 
                attachedFile={attachedFiles.notes} 
                onFileSelect={handleFileSelect} 
                onFileDrop={handleFileDrop}
                onRemoveFile={removeAttachment}
                onStartMic={startRecording}
                onStopMic={stopRecording}
                onStartCamera={startCamera}
                isRecording={activeRecordingField === 'notes'}
              />
            </div>
          </>
        )}

        {/* Save & Cancel */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
          <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
            <Sparkles size={16} /> Save Card to Deck
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => setActiveTab('cards')} style={{ flex: 0.3 }}>
            Cancel
          </button>
        </div>
      </form>

      {/* Video Capture & Cropper Modal Overlay */}
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

              {/* Crop Box Sliders */}
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

// Media input bar component for text areas
function InputToolbar({ 
  field, 
  attachedFile, 
  onFileSelect, 
  onFileDrop, 
  onRemoveFile, 
  onStartMic, 
  onStopMic, 
  onStartCamera, 
  isRecording 
}) {
  return (
    <div 
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        background: 'var(--bg-primary)',
        padding: '10px 14px',
        border: '1px solid var(--border-color)',
        borderTop: 'none',
        borderRadius: '0 0 10px 10px',
        gap: '12px'
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => onFileDrop(e, field)}
    >
      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '6px' }}>
        {/* Microphone STT */}
        {!isRecording ? (
          <button 
            type="button" 
            className="btn btn-secondary" 
            style={{ padding: '6px 10px', fontSize: '0.8rem', gap: '4px' }}
            onClick={() => onStartMic(field)}
          >
            <Mic size={14} color="var(--accent-cyan)" /> Record STT
          </button>
        ) : (
          <button 
            type="button" 
            className="btn btn-danger pulsing-mic" 
            style={{ padding: '6px 10px', fontSize: '0.8rem', gap: '4px' }}
            onClick={onStopMic}
          >
            <Square size={14} /> Stop Recording
          </button>
        )}

        {/* Camera capture */}
        <button 
          type="button" 
          className="btn btn-secondary" 
          style={{ padding: '6px 10px', fontSize: '0.8rem', gap: '4px' }}
          onClick={() => onStartCamera(field)}
        >
          <Camera size={14} color="var(--accent-violet)" /> Camera Snap
        </button>

        {/* File Picker */}
        <label className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '0.8rem', gap: '4px', cursor: 'pointer' }}>
          <Upload size={14} color="var(--accent-amber)" /> Upload File
          <input 
            type="file" 
            onChange={(e) => onFileSelect(e, field)} 
            style={{ display: 'none' }} 
            accept="image/*,audio/*,video/*,application/pdf"
          />
        </label>
      </div>

      {/* Attached item details */}
      {attachedFile && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', background: 'var(--bg-tertiary)', padding: '4px 10px', borderRadius: '6px' }}>
          <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            📎 {attachedFile.name}
          </span>
          <button 
            type="button" 
            className="btn btn-danger btn-icon" 
            style={{ width: '18px', height: '18px' }}
            onClick={() => onRemoveFile(field)}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
