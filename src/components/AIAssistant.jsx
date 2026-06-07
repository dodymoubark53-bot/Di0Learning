import React, { useState, useEffect, useRef, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Send, Bot, User, Key, Sparkles, Loader } from 'lucide-react';

export default function AIAssistant() {
  const { settings, addToast } = useContext(AppContext);
  const [messages, setMessages] = useState([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I am your **Di0 Learning AI Assistant**. 🤖\n\nI can help you review study cards, break down tough concepts, generate practice quizzes, or solve problems. What subject are we studying today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      if (settings.anthropicKey) {
        // Send request directly to Anthropic Claude API
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': settings.anthropicKey,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-by-browser': 'true'
          },
          body: JSON.stringify({
            model: 'claude-3-5-sonnet-20241022', // fallbacks to current stable sonnet
            max_tokens: 1024,
            messages: messages.concat(userMessage).map(msg => ({
              role: msg.role === 'assistant' ? 'assistant' : 'user',
              content: msg.content
            }))
          })
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error?.message || `API error code ${response.status}`);
        }

        const data = await response.json();
        const responseText = data.content?.[0]?.text || 'No response received.';

        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: responseText,
          timestamp: new Date()
        }]);
      } else {
        // Simulating smart educational response helper
        await new Promise(resolve => setTimeout(resolve, 1500));
        const aiResponse = generateLocalAIResponse(userMessage.content, messages);
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: aiResponse,
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      console.error(error);
      addToast(`Claude API Call failed: ${error.message}. Switching to Local Simulator.`, 'error');
      
      // Fallback response on failure
      const aiResponse = `*API Request Error: ${error.message}*\n\nHere is a simulated educational answer based on your request:\n\n` + 
                         generateLocalAIResponse(userMessage.content, messages);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Predefined keyword triggers for high fidelity local simulations
  const generateLocalAIResponse = (prompt, history) => {
    const p = prompt.toLowerCase();
    
    if (p.includes('photosynthesis')) {
      return `### Photosynthesis: The Fuel of Life 🌿\n\n**Photosynthesis** is the chemical process by which green plants, algae, and some bacteria convert light energy (usually from the Sun) into chemical energy (glucose) using water and carbon dioxide.\n\n#### The Chemical Formula:\n$$6CO_2 + 6H_2O \\xrightarrow{\\text{Light}} C_6H_{12}O_6 + 6O_2$$\n\n#### Two Key Stages:\n1. **Light-Dependent Reactions (in the Thylakoids)**: Clorophyll absorbs sunlight and splits water molecules ($H_2O$), releasing Oxygen ($O_2$) and producing ATP and NADPH energy carriers.\n2. **The Calvin Cycle (Light-Independent in the Stroma)**: Carbon Dioxide ($CO_2$) is captured and assembled into energy-rich sugars (Glucose, $C_6H_{12}O_6$) using ATP/NADPH.\n\n*Review Tip: Try creating a True or False card on whether light is needed for the Calvin Cycle!*`;
    }
    
    if (p.includes('relativity') || p.includes('einstein')) {
      return `### Einstein's Theory of Relativity 🌌\n\nAlbert Einstein's work comprises two related theories:\n\n1. **Special Relativity (1905)**:\n   - Asserts that the laws of physics are identical for all observers in uniform motion.\n   - Establishes that the speed of light in a vacuum ($c$) is the same for all observers.\n   - Yields the mass-energy equivalence equation:\n     $$E = mc^2$$\n\n2. **General Relativity (1915)**:\n   - Explains gravity not as a direct force, but as the **curvature of spacetime** caused by mass and energy.\n   - Think of a heavy bowling ball sitting on a trampoline: smaller marbles will roll toward it because the fabric itself is curved.\n\nWould you like me to generate a Multiple Choice card about this concept to test yourself?`;
    }

    if (p.includes('quiz') || p.includes('test me')) {
      return `### Quick Quiz Challenge! 📝\n\nLet's test your knowledge right here. Try to answer this question:\n\n**Question**: Which cell organelle is responsible for generating cellular energy in the form of ATP?\n\n*   **A)** Ribosome\n*   **B)** Mitochondria\n*   **C)** Golgi Apparatus\n*   **D)** Lysosome\n\n*Reply with your answer (A, B, C, or D) to check it!*`;
    }

    if (p.match(/^[a-d]$/i)) {
      const ans = p.toUpperCase();
      if (ans === 'B') {
        return `🎉 **Correct!** Mitochondria is known as the "powerhouse of the cell" because it produces ATP through cellular respiration.\n\nHere is a quick breakdown:\n- **Ribosomes** synthesize proteins.\n- **Golgi Apparatus** packages and distributes macromolecular products.\n- **Lysosomes** contain digestive enzymes to break down waste.`;
      } else {
        return `❌ **Incorrect.** The correct answer was **B) Mitochondria**.\n\n- Your selected option was **${ans}**.\n- Remember that Mitochondria synthesizes ATP, whereas ribosomes create proteins and Lysosomes handle cell waste.`;
      }
    }

    if (p.includes('mitochondria') || p.includes('cell')) {
      return `### Mitochondria: The Cell's Power Plant 🔋\n\n**Mitochondria** are double-membrane organelles found in most eukaryotic organisms. Their primary role is to generate chemical energy in the form of **Adenosine Triphosphate (ATP)**.\n\n#### Key Structural Parts:\n*   **Outer Membrane**: Encloses the organelle.\n*   **Inner Membrane**: Folded into **cristae** to maximize surface area for electron transport chain reactions.\n*   **Matrix**: The fluid interior containing enzymes for the Citric Acid (Krebs) cycle.\n*   **Mitochondrial DNA (mtDNA)**: They contain their own genome, pointing to an evolutionary origin via *endosymbiosis*!`;
    }

    // Generic educational explanation engine
    const words = prompt.split(' ');
    const subject = words[words.length - 1] || 'this topic';
    return `### Studying: "${prompt}" 📚\n\nHere is a structured overview to help you master this concept:\n\n1. **Core Concept**: Understanding the fundamental mechanics of "${prompt}" is key to answering related exam questions.\n2. **Key Terms to Memorize**:\n   - **Term A**: The primary driving factor.\n   - **Term B**: The output or reaction variable.\n3. **Quick Summary**: Keep your study sessions focused by breaking this down into bite-sized summaries. Add a **Flashcard** or **Free Note** card in your deck to memorize this.\n\n*Tip: Configure your Anthropic Claude API key in the Settings page to unlock unlimited, real-time advanced answers tailored directly to your curriculum!*`;
  };

  // Helper to render basic markdown formatting
  const renderMessageContent = (text) => {
    return text.split('\n').map((line, idx) => {
      let content = line;
      
      // Headers
      if (content.startsWith('### ')) {
        return <h3 key={idx} style={{ marginTop: '14px', marginBottom: '8px', fontSize: '1.25rem', color: 'var(--accent-cyan)' }}>{content.replace('### ', '')}</h3>;
      }
      if (content.startsWith('#### ')) {
        return <h4 key={idx} style={{ marginTop: '10px', marginBottom: '6px', fontSize: '1.05rem', color: 'var(--accent-violet)' }}>{content.replace('#### ', '')}</h4>;
      }
      if (content.startsWith('**Question**:')) {
        return <p key={idx} style={{ fontWeight: '700', fontSize: '1.05rem', margin: '8px 0' }}>{content.replace('**Question**:', '❓ Question:')}</p>;
      }

      // Bold replacements
      content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      content = content.replace(/\*(.*?)\*/g, '<em>$1</em>');
      // Simple code blocks/equations
      content = content.replace(/\$\$(.*?)\$\$/g, '<code style="background:var(--bg-tertiary); padding:4px 8px; border-radius:4px; display:block; margin:8px 0; font-family:monospace;">$1</code>');
      content = content.replace(/\$(.*?)\$/g, '<code style="background:var(--bg-tertiary); padding:2px 6px; border-radius:4px; font-family:monospace;">$1</code>');

      // Bullets
      if (content.trim().startsWith('* ') || content.trim().startsWith('- ')) {
        const item = content.replace(/^[\s]*[\*\-]\s*/, '');
        return <li key={idx} style={{ marginLeft: '20px', marginBottom: '4px' }} dangerouslySetInnerHTML={{ __html: item }} />;
      }
      
      return <p key={idx} style={{ marginBottom: '10px', minHeight: '18px' }} dangerouslySetInnerHTML={{ __html: content }} />;
    });
  };

  return (
    <div className="chat-container">
      {/* Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={24} color="var(--accent-cyan)" /> AI Study Assistant
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            {settings.anthropicKey ? 'Connected to Claude API' : 'Running in Local Simulator Mode'}
          </p>
        </div>
        {!settings.anthropicKey && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-amber)', padding: '6px 12px', borderRadius: '8px' }}>
            <Key size={14} /> Add Claude key in Settings for live answers
          </div>
        )}
      </div>

      {/* Messages Feed */}
      <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', padding: 0 }}>
        <div className="chat-messages">
          {messages.map(msg => (
            <div 
              key={msg.id} 
              className={`message-bubble ${msg.role}`}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontSize: '0.75rem', opacity: 0.8, fontWeight: 600 }}>
                {msg.role === 'assistant' ? <Bot size={14} /> : <User size={14} />}
                {msg.role === 'assistant' ? 'DI0 TUTOR' : 'YOU'}
              </div>
              <div style={{ wordBreak: 'break-word' }}>
                {renderMessageContent(msg.content)}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="message-bubble assistant" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Loader size={18} className="pulsing-mic" style={{ animation: 'spin 1s linear infinite', background: 'none !important' }} />
              <span>Di0 Tutor is thinking...</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="chat-input-area" style={{ borderTop: '1px solid var(--border-color)', padding: '16px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Ask a question (e.g., 'Explain Photosynthesis' or 'Quiz me on cells')..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            style={{ borderRadius: '24px' }}
          />
          <button 
            type="submit" 
            className="btn btn-primary btn-icon" 
            disabled={!input.trim() || isLoading}
            style={{ flexShrink: 0 }}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
