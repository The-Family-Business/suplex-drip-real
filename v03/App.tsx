import React, { useState, useEffect, useRef } from 'react';
import { QUESTIONS, DEFAULT_THEME } from './constants';
import { Message, UserAnswers, ThemeConfig } from './types';
import { ChatBubble } from './components/ChatBubble';
import { InputArea } from './components/InputArea';
import { ConfigPanel } from './components/ConfigPanel';
import { useSound } from './hooks/useSound';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, Download, FileJson, CheckCircle } from 'lucide-react';

const App: React.FC = () => {
  // --- State ---
  const [theme, setTheme] = useState<ThemeConfig>(DEFAULT_THEME);
  const [isEditorOpen, setIsEditorOpen] = useState(true);
  const [showExportModal, setShowExportModal] = useState(false);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [messages, setMessages] = useState<Message[]>([
    { id: 'init', sender: 'bot', text: QUESTIONS[0].text }
  ]);
  const [answers, setAnswers] = useState<UserAnswers>({});
  const [isTyping, setIsTyping] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { playSwoosh, playClick } = useSound();

  // --- Effects ---
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isTyping, isCompleted]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  // --- Handlers ---
  const handleAnswer = async (value: string | string[], label: string) => {
    const currentQ = QUESTIONS[currentQuestionIndex];
    
    // Add User Message
    const newUserMsg: Message = {
      id: `ans-${Date.now()}`,
      sender: 'user',
      text: label
    };

    setMessages(prev => [...prev, newUserMsg]);
    // Store answer (join array if it's multiple choice)
    const storedValue = Array.isArray(value) ? value.join(',') : value;
    setAnswers(prev => ({ ...prev, [currentQ.id]: storedValue }));
    playSwoosh();

    if (value === 'restart') {
      setTimeout(resetChat, 800);
      return;
    }

    // Determine Next
    const nextIndex = currentQuestionIndex + 1;
    
    if (nextIndex < QUESTIONS.length) {
      setIsTyping(true);
      
      // Clear existing timeout if any
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

      typingTimeoutRef.current = setTimeout(() => {
        const nextQ = QUESTIONS[nextIndex];
        const newBotMsg: Message = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: nextQ.text
        };
        setMessages(prev => [...prev, newBotMsg]);
        setCurrentQuestionIndex(nextIndex);
        setIsTyping(false);
        playSwoosh();
        typingTimeoutRef.current = null;
      }, 800);
    } else {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setIsCompleted(true);
        playSwoosh();
      }, 800);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex === 0) return;
    
    if (isCompleted) setIsCompleted(false);

    // Cancel any pending typing
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      setIsTyping(false);
    }

    playClick();
    
    setMessages(prev => {
        const newMsgs = [...prev];
        if (newMsgs.length >= 2) {
             newMsgs.pop(); // Remove current Bot Q
             newMsgs.pop(); // Remove prev User A
        }
        return newMsgs;
    });
    
    setCurrentQuestionIndex(prev => prev - 1);
  };

  const handleBubbleClick = (index: number) => {
    // Prevent clicking if typing
    if (isTyping) return;
    // Prevent clicking the active (last) message if not completed
    if (!isCompleted && index === messages.length - 1) return;

    const targetBotMsgIndex = index % 2 === 0 ? index : index - 1;
    const targetQuestionIndex = targetBotMsgIndex / 2;

    if (targetQuestionIndex < 0 || targetQuestionIndex >= QUESTIONS.length) return;

    playClick();

    if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        setIsTyping(false);
    }

    setIsCompleted(false);
    setMessages(prev => prev.slice(0, targetBotMsgIndex + 1));
    setCurrentQuestionIndex(targetQuestionIndex);
  };

  const resetChat = () => {
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    setMessages([{ id: 'init', sender: 'bot', text: QUESTIONS[0].text }]);
    setAnswers({});
    setCurrentQuestionIndex(0);
    setIsTyping(false);
    setIsCompleted(false);
  };

  const handleExport = () => {
    setShowExportModal(true);
  };

  const downloadFile = (content: string, fileName: string, contentType: string) => {
    const a = document.createElement("a");
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
  };

  const handleDownloadAnswers = () => {
    const json = JSON.stringify(answers, null, 2);
    downloadFile(json, 'form-submission.json', 'application/json');
  };

  const handleDownloadTemplate = () => {
    // Create a simplified version of the current state as a template
    const templateData = {
      theme: theme,
      questions: QUESTIONS,
      meta: {
        exportedAt: new Date().toISOString(),
        version: "1.0"
      }
    };
    const json = JSON.stringify(templateData, null, 2);
    downloadFile(json, 'form-template.json', 'application/json');
  };

  // Generate Markdown
  const markdownOutput = `\`\`\`javascript
// themeConfig.js
export const theme = ${JSON.stringify(theme, null, 2)};
\`\`\``;

  return (
    <div className="flex h-screen w-full overflow-hidden font-sans" style={{ backgroundColor: theme.colors.background }}>
      
      {/* 1. Main Preview Area */}
      <div className="flex-1 relative flex flex-col h-full transition-all duration-300">
        
        {/* Decorative Background Elements based on Theme */}
        <div 
          className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob pointer-events-none"
          style={{ backgroundColor: theme.colors.secondary }} 
        />
        <div 
          className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000 pointer-events-none"
          style={{ backgroundColor: theme.colors.primary }} 
        />

        {/* Top Bar */}
        <header className="flex-none p-6 flex justify-between items-center z-10 relative">
          <div className="flex items-center gap-4">
            {currentQuestionIndex > 0 && (
                <button 
                    onClick={handleBack}
                    className="p-2 rounded-full hover:bg-black/5 transition-colors"
                    style={{ color: theme.colors.accent }}
                >
                    <ArrowLeft size={24} strokeWidth={3} />
                </button>
            )}
            <div 
                className="text-xl font-bold tracking-tight select-none"
                style={{ color: theme.colors.accent }}
            >
                BRAND<span style={{ color: theme.colors.secondary }}>FLOW</span>
            </div>
          </div>
          <button 
            onClick={() => setIsEditorOpen(!isEditorOpen)}
            className="md:hidden px-4 py-2 bg-white rounded shadow text-sm font-bold"
          >
            {isEditorOpen ? 'Close' : 'Edit'}
          </button>
        </header>

        {/* Chat Scroll Area */}
        <main className="flex-1 w-full mx-auto flex flex-col relative z-10" style={{ maxWidth: theme.sizing.containerMaxWidth }}>
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto no-scrollbar scroll-smooth px-4 md:px-8"
          >
            <div className="min-h-full flex flex-col justify-end pb-4">
              {messages.map((msg, idx) => {
                // Calculate distance from the end
                const dist = messages.length - 1 - idx;
                
                let visualState: 'active' | 'historyRecent' | 'historyMedium' | 'historyFar' | 'hidden' = 'hidden';
                
                if (isCompleted) {
                    // Push everything up when completed
                    visualState = 'historyRecent'; 
                } else {
                    if (dist === 0) visualState = 'active';
                    else if (dist === 1) visualState = 'historyRecent';
                    else if (dist === 2) visualState = 'historyMedium';
                    else if (dist === 3) visualState = 'historyFar';
                }

                return (
                  <ChatBubble 
                    key={msg.id}
                    message={msg} 
                    visualState={visualState}
                    theme={theme}
                    onClick={() => handleBubbleClick(idx)}
                  />
                );
              })}
              
              {isTyping && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex space-x-2 p-6 rounded-3xl w-fit mb-8"
                  style={{ backgroundColor: theme.colors.botBubbleBg }}
                >
                   {[0, 150, 300].map(delay => (
                     <div 
                       key={delay}
                       className="w-3 h-3 rounded-full animate-bounce"
                       style={{ 
                         backgroundColor: theme.colors.accent,
                         animationDelay: `${delay}ms` 
                       }} 
                     />
                   ))}
                </motion.div>
              )}

              {/* Completion Screen */}
              <AnimatePresence>
                {isCompleted && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: "spring", duration: 0.8 }}
                    className="w-full flex flex-col items-center justify-center p-8 mt-8 mb-20 text-center rounded-[3rem] shadow-xl border-4"
                    style={{ 
                      backgroundColor: theme.colors.cardBg,
                      borderColor: theme.colors.secondary 
                    }}
                  >
                    <div className="mb-4 text-green-500">
                       <CheckCircle size={64} fill={theme.colors.cardBg} strokeWidth={2} />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ color: theme.colors.text }}>All Done!</h2>
                    <p className="text-lg mb-8 font-medium opacity-70" style={{ color: theme.colors.text }}>Your profile has been created.</p>
                    
                    <div className="flex flex-col md:flex-row gap-4 w-full max-w-md">
                      <button
                        onClick={handleDownloadAnswers}
                        className="flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-bold text-white transition-transform hover:scale-105 active:scale-95 shadow-lg"
                        style={{ backgroundColor: theme.colors.primary }}
                      >
                        <FileJson size={20} /> Download JSON
                      </button>
                      
                      <button
                        onClick={handleDownloadTemplate}
                        className="flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-bold transition-transform hover:scale-105 active:scale-95 shadow-lg border-2"
                        style={{ 
                          backgroundColor: theme.colors.background,
                          color: theme.colors.text,
                          borderColor: theme.colors.text
                        }}
                      >
                         <Download size={20} /> Save Template
                      </button>
                    </div>
                    
                    <button 
                       onClick={resetChat}
                       className="mt-6 text-sm font-bold underline opacity-50 hover:opacity-100"
                       style={{ color: theme.colors.text }}
                    >
                        Start Over
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Input Area */}
          {!isCompleted && (
            <div className="flex-none px-4 relative z-20 pb-8 md:pb-20 lg:pb-32 pt-4">
              <AnimatePresence>
                {!isTyping && messages[messages.length - 1].sender === 'bot' && (
                    <motion.div
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                    >
                      <InputArea 
                        question={QUESTIONS[currentQuestionIndex]} 
                        onAnswer={handleAnswer}
                        disabled={isTyping} 
                        theme={theme}
                      />
                    </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </main>
      </div>

      {/* 2. Editor Panel (Sidebar) */}
      <AnimatePresence>
        {isEditorOpen && (
          <motion.aside 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            className="absolute md:relative right-0 top-0 h-full z-40 bg-white shadow-2xl"
          >
            <ConfigPanel 
              theme={theme} 
              setTheme={setTheme} 
              onExport={handleExport}
              onReset={() => {
                setTheme(DEFAULT_THEME);
                resetChat();
              }}
            />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* 3. Export Modal */}
      <AnimatePresence>
        {showExportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Export Configuration</h3>
                <button onClick={() => setShowExportModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X size={24} />
                </button>
              </div>
              <p className="text-gray-600 mb-4">Copy this block to use your design in the production app.</p>
              <div className="bg-slate-900 rounded-lg p-4 relative group">
                <pre className="text-green-400 font-mono text-xs md:text-sm overflow-auto max-h-96 whitespace-pre-wrap">
                  {markdownOutput}
                </pre>
                <button 
                  onClick={() => navigator.clipboard.writeText(markdownOutput)}
                  className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded text-xs transition-colors"
                >
                  Copy to Clipboard
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default App;