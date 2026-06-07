import React, { useState, useEffect, useRef, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Send, Bot, User, Key, Sparkles, Loader } from 'lucide-react';

export default function AIAssistant() {
  const { settings, addToast, t, lang } = useContext(AppContext);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Sync default welcome message based on active language
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: lang === 'ar'
            ? "مرحباً! أنا **المساعد الدراسي الذكي (Di0 Tutor)**. 🤖\n\nيمكنني مساعدتك في مراجعة بطاقات الاستذكار، شرح المفاهيم الصعبة، توليد اختبارات تدريبية، أو حل المسائل. ما هي المادة التي تود مراجعتها اليوم؟"
            : "Hello! I am your **Di0 Learning AI Assistant**. 🤖\n\nI can help you review study cards, break down tough concepts, generate practice quizzes, or solve problems. What subject are we studying today?",
          timestamp: new Date()
        }
      ]);
    }
  }, [lang, messages.length]);

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
        const responseText = data.content?.[0]?.text || 'No response.';

        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: responseText,
          timestamp: new Date()
        }]);
      } else {
        await new Promise(resolve => setTimeout(resolve, 1500));
        const aiResponse = generateLocalAIResponse(userMessage.content);
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: aiResponse,
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      console.error(error);
      addToast(lang === 'ar' ? 'فشلت مكالمة المساعد الذكي. يرجى التحقق من المفتاح.' : 'Claude API call failed. Check your API key.', 'error');
      
      const aiResponse = `*API Request Error: ${error.message}*\n\n` + generateLocalAIResponse(userMessage.content);
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

  const generateLocalAIResponse = (prompt) => {
    const p = prompt.toLowerCase();
    
    if (lang === 'ar') {
      if (p.includes('تمثيل ضوئي') || p.includes('بناء ضوئي')) {
        return `### عملية البناء الضوئي 🌿\n\n**البناء الضوئي** هو العملية الكيميائية التي تقوم بها النباتات الخضراء لتحويل الطاقة الضوئية إلى طاقة كيميائية (جلوكوز) باستخدام الماء وثاني أكسيد الكربون.\n\n#### المعادلة الكيميائية الكلية:\n$$6CO_2 + 6H_2O \\xrightarrow{\\text{ضوء الشمس}} C_6H_{12}O_6 + 6O_2$$\n\n#### مرحلتين أساسيتين:\n1. **تفاعلات الضوء (في الثيلاكويد)**: يمتص الكلوروفيل أشعة الشمس ويقسم جزيئات الماء ($H_2O$)، مطلقاً الأكسجين ($O_2$).\n2. **دورة كالفن (التفاعلات اللاضوئية)**: يتم تثبيت ثاني أكسيد الكربون ($CO_2$) لتكوين سكريات الجلوكوز ($C_6H_{12}O_6$).`;
      }
      if (p.includes('نسبية') || p.includes('أينشتاين')) {
        return `### نظرية النسبية لأينشتاين 🌌\n\nتتكون نظرية النسبية لألبرت أينشتاين من جزأين:\n\n1. **النسبية الخاصة (1905)**:\n   - توضح أن قوانين الفيزياء هي نفسها لجميع المراقبين في حركة منتظمة.\n   - سرعة الضوء في الفراغ ($c$) ثابتة لجميع المراقبين بغض النظر عن سرعتهم.\n   - معادلة تكافؤ الكتلة والطاقة الشهيرة:\n     $$E = mc^2$$\n\n2. **النسبية العامة (1915)**:\n   - توضح أن الجاذبية ليست قوة سحب، بل هي **انحناء في نسيج الزمكان** ناتج عن وجود الكتلة والطاقة.`;
      }
      return `### دراسة موضوع: "${prompt}" 📚\n\nإليك ملخص دراسي للمفهوم الذي تبحث عنه:\n\n1. **الفكرة العامة**: فهم آليات "${prompt}" يساعد في اجتياز الامتحانات المتعلقة بها.\n2. **نصيحة دراسية**: قم بإنشاء **مجلد بطاقات تعليمية** لحفظ المصطلحات الأساسية.\n\n*ملاحظة: يمكنك إدخال رمز API Key الخاص بك في صفحة الإعدادات لتفعيل إجابات مفصلة وحية مباشرة من خوادم الذكاء الاصطناعي الذكية!*`;
    }

    // English responses
    if (p.includes('photosynthesis')) {
      return `### Photosynthesis: The Fuel of Life 🌿\n\n**Photosynthesis** is the chemical process by which green plants convert light energy into glucose using water and carbon dioxide.\n\n#### Chemical Formula:\n$$6CO_2 + 6H_2O \\xrightarrow{\\text{Light}} C_6H_{12}O_6 + 6O_2$$\n\n#### Two Key Stages:\n1. **Light-Dependent Reactions**: Occur in thylakoids, split water to release oxygen ($O_2$).\n2. **The Calvin Cycle**: Assemblage of glucose using chemical energy carrier pathways.`;
    }
    if (p.includes('relativity') || p.includes('einstein')) {
      return `### Einstein's Theory of Relativity 🌌\n\nAlbert Einstein's work comprises two theories:\n\n1. **Special Relativity (1905)**: Establishes speed of light ($c$) is constant, and $E = mc^2$.\n2. **General Relativity (1915)**: Gravity is explained not as a force, but as **spacetime curvature** around heavy masses.`;
    }
    return `### Studying Topic: "${prompt}" 📚\n\nHere is a quick learning overview for this topic:\n\n1. **Concept Review**: Memorizing terms and mechanics of "${prompt}" helps build solid foundations.\n2. **Study Tip**: Add a **Flashcard** or a **Free Note** card inside your decks to recall this easily.\n\n*Note: Configure your Anthropic Claude API Key in Settings to unlock live, customized AI tutoring tailored directly to your classes!*`;
  };

  const renderMessageContent = (text) => {
    return text.split('\n').map((line, idx) => {
      let content = line;
      if (content.startsWith('### ')) {
        return <h3 key={idx} style={{ marginTop: '14px', marginBottom: '8px', fontSize: '1.25rem', color: 'var(--accent-cyan)' }}>{content.replace('### ', '')}</h3>;
      }
      if (content.startsWith('#### ')) {
        return <h4 key={idx} style={{ marginTop: '10px', marginBottom: '6px', fontSize: '1.05rem', color: 'var(--accent-violet)' }}>{content.replace('#### ', '')}</h4>;
      }
      
      content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      content = content.replace(/\*(.*?)\*/g, '<em>$1</em>');
      content = content.replace(/\$\$(.*?)\$\$/g, '<code style="background:var(--bg-tertiary); padding:4px 8px; border-radius:4px; display:block; margin:8px 0; font-family:monospace;">$1</code>');
      content = content.replace(/\$(.*?)\$/g, '<code style="background:var(--bg-tertiary); padding:2px 6px; border-radius:4px; font-family:monospace;">$1</code>');

      if (content.trim().startsWith('* ') || content.trim().startsWith('- ')) {
        const item = content.replace(/^[\s]*[\*\-]\s*/, '');
        return <li key={idx} style={{ marginLeft: '20px', marginRight: '20px', marginBottom: '4px' }} dangerouslySetInnerHTML={{ __html: item }} />;
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
            <Sparkles size={24} color="var(--accent-cyan)" /> {t('ai-assistant')}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            {settings.anthropicKey ? (lang === 'ar' ? 'متصل بـ Claude API' : 'Connected to Claude API') : (lang === 'ar' ? 'يعمل في وضع المحاكاة المحلي' : 'Running in Local Simulator Mode')}
          </p>
        </div>
        {!settings.anthropicKey && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-amber)', padding: '6px 12px', borderRadius: '8px' }}>
            <Key size={14} /> {lang === 'ar' ? 'أضف رمز Claude في الإعدادات لإجابات حية' : 'Add Claude key in Settings for live answers'}
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
                {msg.role === 'assistant' ? (lang === 'ar' ? 'المعلم الذكي' : 'DI0 TUTOR') : (lang === 'ar' ? 'أنت' : 'YOU')}
              </div>
              <div style={{ wordBreak: 'break-word' }}>
                {renderMessageContent(msg.content)}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="message-bubble assistant" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Loader size={18} className="pulsing-mic" style={{ animation: 'spin 1s linear infinite', background: 'none !important' }} />
              <span>{lang === 'ar' ? 'المعلم الذكي يفكر حالياً...' : 'Di0 Tutor is thinking...'}</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="chat-input-area" style={{ borderTop: '1px solid var(--border-color)', padding: '16px' }}>
          <input
            type="text"
            className="form-input"
            placeholder={lang === 'ar' ? 'اسأل المعلم الذكي عن أي موضوع دراسي...' : 'Ask a study question...'}
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
            <Send size={18} style={{ transform: lang === 'ar' ? 'rotate(180deg)' : 'none' }} />
          </button>
        </form>
      </div>
    </div>
  );
}
