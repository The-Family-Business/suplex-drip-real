
import React, { useState, useEffect, useRef } from 'react';
import { QUESTIONS, DEFAULT_THEME } from './constants';
import { Message, UserAnswers, ThemeConfig, Question } from './types';
import { ChatBubble } from './components/ChatBubble';
import { InputArea } from './components/InputArea';
import { ConfigPanel } from './components/ConfigPanel';
import { useSound } from './hooks/useSound';
import { analyzeCompany, CompanyAnalysis } from './utils/ai';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { X, ArrowLeft, Download, FileJson, CheckCircle, PenTool, Play, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  // --- State ---
  const [theme, setTheme] = useState<ThemeConfig>(DEFAULT_THEME);
  const [questions, setQuestions] = useState<Question[]>(QUESTIONS); // Live questions state
  const [isEditorOpen, setIsEditorOpen] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false); // Toggle between preview and edit
  const [showExportModal, setShowExportModal] = useState(false);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [messages, setMessages] = useState<Message[]>([
    { id: 'init', sender: 'bot', text: questions[0].text }
  ]);
  const [answers, setAnswers] = useState<UserAnswers>({});
  const [isTyping, setIsTyping] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // AI Analysis State
  const [analysis, setAnalysis] = useState<CompanyAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { playSwoosh, playClick } = useSound();

  // --- Effects ---
  useEffect(() => {
    // Scroll twice to ensure layout animations settle
    const doScroll = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    };
    doScroll();
    const t = setTimeout(doScroll, 100);
    return () => clearTimeout(t);
  }, [messages, isTyping, isCompleted]);

  // When questions text changes via Editor, update history if relevant
  useEffect(() => {
    // Only update the initial message for now to reflect edits immediately on reset
    if (messages[0].id === 'init') {
         setMessages(prev => [{...prev[0], text: questions[0].text}, ...prev.slice(1)]);
    }
  }, [questions]);

  // --- Helpers ---
  // Get only visible questions
  const activeQuestions = questions.filter(q => !q.hidden);

  const getAiSuggestion = (qId: string): string | null => {
      if (!analysis) return null;
      switch(qId) {
          case 'company_name': return analysis.companyName;
          case 'business_description': return analysis.summary;
          case 'target_audience': return analysis.targetAudience;
          default: return null;
      }
  };

  // --- Handlers ---
  const handleAnswer = async (value: string | string[], label: string) => {
    const currentQ = activeQuestions[currentQuestionIndex];
    
    // Add User Message
    const newUserMsg: Message = {
      id: `ans-${Date.now()}`,
      sender: 'user',
      text: label
    };

    setMessages(prev => [...prev, newUserMsg]);
    
    // Store answer
    const storedValue = Array.isArray(value) ? value.join(',') : value;
    setAnswers(prev => ({ ...prev, [currentQ.id]: storedValue }));
    playSwoosh();

    // --- AI Trigger Logic (Background) ---
    if (currentQ.id === 'intro' && typeof value === 'string' && value.includes('.')) {
        setIsAnalyzing(true);
        // Fire and forget - don't await here to keep UI snappy
        analyzeCompany(value).then(data => {
            console.log("Analysis complete:", data);
            setAnalysis(data);
            setIsAnalyzing(false);
        }).catch(err => {
            console.error(err);
            setIsAnalyzing(false);
        });
    }

    if (value === 'restart') {
      setTimeout(resetChat, 800);
      return;
    }

    // Determine Next
    const nextIndex = currentQuestionIndex + 1;
    
    // Check if we need to inject the AI analysis before the next question
    // We inject it after 'setup_preference' (which is usually the 2nd to last question)
    if (currentQ.id === 'setup_preference' && analysis) {
        injectAnalysisResult(nextIndex);
        return;
    }
    
    proceedToNext(nextIndex);
  };

  const injectAnalysisResult = (nextIndex: number) => {
    setIsTyping(true);
    
    // Simulate a slightly longer "thinking" pause for effect
    setTimeout(() => {
        setIsTyping(false);
        if (!analysis) {
            proceedToNext(nextIndex);
            return;
        }

        const analysisMsg: Message = {
            id: `ai-analysis-${Date.now()}`,
            sender: 'bot',
            text: `Based on what we've discussed for ${analysis.companyName || 'your business'}...

🎯 **Strategy:** Targeting ${analysis.targetAudience}

📝 **Sample Subject:** "${analysis.emailTemplate.subject}"

${analysis.emailTemplate.body}`
        };

        setMessages(prev => [...prev, analysisMsg]);
        playSwoosh();

        // After showing analysis, wait a beat then show the next question (Contact info)
        setTimeout(() => {
             proceedToNext(nextIndex);
        }, 3500); // Give them time to read the big bubble

    }, 1500);
  };

  const proceedToNext = (nextIndex: number) => {
    if (nextIndex < activeQuestions.length) {
      setIsTyping(true);
      
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

      typingTimeoutRef.current = setTimeout(() => {
        const nextQ = activeQuestions[nextIndex];
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

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      setIsTyping(false);
    }

    playClick();
    
    setMessages(prev => {
        const newMsgs = [...prev];
        // Remove user message
        newMsgs.pop();
        
        // Remove bot message(s). Check if the last one was the AI analysis giant bubble
        const lastMsg = newMsgs[newMsgs.length - 1];
        newMsgs.pop();

        if (lastMsg && lastMsg.text.includes("Strategy:")) {
             // If we popped the "Contact" question, check if the one before was analysis
             // If so, pop that too
             newMsgs.pop();
        }

        return newMsgs;
    });
    
    setCurrentQuestionIndex(prev => prev - 1);
  };

  const resetChat = () => {
    const firstQ = activeQuestions[0];
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    setMessages([{ id: 'init', sender: 'bot', text: firstQ?.text || "Hello" }]);
    setAnswers({});
    setAnalysis(null);
    setCurrentQuestionIndex(0);
    setIsTyping(false);
    setIsCompleted(false);
  };

  const handleBubbleClick = (index: number) => {
    if (isTyping) return;
    if (!isCompleted && index === messages.length - 1) return;
    playClick();
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
    const fullData = {
        answers,
        aiAnalysis: analysis
    };
    const json = JSON.stringify(fullData, null, 2);
    downloadFile(json, 'form-submission.json', 'application/json');
  };

  const handleDownloadTemplate = () => {
    const templateData = {
      theme: theme,
      questions: questions,
      meta: {
        exportedAt: new Date().toISOString(),
        version: "2.0"
      }
    };
    const json = JSON.stringify(templateData, null, 2);
    downloadFile(json, 'form-template.json', 'application/json');
  };

  const markdownOutput = `\`\`\`javascript
// themeConfig.js
export const theme = ${JSON.stringify(theme, null, 2)};
export const questions = ${JSON.stringify(questions, null, 2)};
\`\`\``;

  return (
    <div className="flex h-screen w-full overflow-hidden font-sans" style={{ backgroundColor: theme.colors.background }}>
      
      {/* 1. Main Preview Area */}
      <LayoutGroup>
      <div className="flex-1 relative flex flex-col h-full transition-all duration-300">
        
        {/* Decorative Background Elements based on Theme */}
        <div 
          className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob pointer-events-none"
          style={{ backgroundColor: theme.colors.secondary, opacity: 0.3 }} 
        />
        <div 
          className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000 pointer-events-none"
          style={{ backgroundColor: theme.colors.primary, opacity: 0.1 }} 
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
          
          <div className="flex items-center gap-2">
              {/* Analysis Indicator */}
              {isAnalyzing && (
                  <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-white/50 rounded-full text-xs font-bold text-indigo-600 animate-pulse">
                      <Sparkles size={12} /> Analyzing Site...
                  </div>
              )}

              <div className="bg-white/80 backdrop-blur rounded-lg p-1 flex gap-1 shadow-sm border border-gray-100">
                  <button
                    onClick={() => setIsEditMode(false)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md font-bold text-sm transition-colors ${!isEditMode ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-50'}`}
                  >
                      <Play size={16} /> Preview
                  </button>
                  <button
                    onClick={() => {
                        setIsEditMode(true);
                        setIsEditorOpen(true);
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md font-bold text-sm transition-colors ${isEditMode ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-50'}`}
                  >
                      <PenTool size={16} /> Edit
                  </button>
              </div>

              <button 
                onClick={() => setIsEditorOpen(!isEditorOpen)}
                className="md:hidden px-4 py-2 bg-white rounded shadow text-sm font-bold"
              >
                {isEditorOpen ? 'Close' : 'Config'}
              </button>
          </div>
        </header>

        {/* Chat Scroll Area */}
        <main className="flex-1 w-full mx-auto flex flex-col relative z-10" style={{ maxWidth: theme.sizing.containerMaxWidth }}>
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto no-scrollbar scroll-smooth px-4 md:px-8"
          >
            <div className="min-h-full flex flex-col justify-end pb-4">
              {messages.map((msg, idx) => {
                const dist = messages.length - 1 - idx;
                let visualState: 'active' | 'historyRecent' | 'historyMedium' | 'historyFar' | 'hidden' = 'hidden';
                
                if (isCompleted) {
                    visualState = 'historyRecent'; 
                } else {
                    if (dist === 0) visualState = 'active';
                    else if (dist === 1) visualState = 'historyRecent';
                    else if (dist === 2) visualState = 'historyMedium';
                    else if (dist === 3) visualState = 'historyFar';
                }

                return (
                  <div key={msg.id} className={msg.id.includes('ai-analysis') ? "whitespace-pre-wrap" : ""}>
                    <ChatBubble 
                        message={msg} 
                        visualState={visualState}
                        theme={theme}
                        onClick={() => handleBubbleClick(idx)}
                    />
                  </div>
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
                        <FileJson size={20} /> Answers
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
                         <Download size={20} /> Template
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
          {!isCompleted && activeQuestions[currentQuestionIndex] && (
            <div className="flex-none px-4 relative z-20 pb-8 md:pb-20 lg:pb-32 pt-4">
              <AnimatePresence>
                {!isTyping && messages[messages.length - 1].sender === 'bot' && (
                    <motion.div
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      style={{ pointerEvents: isEditMode ? 'none' : 'auto', opacity: isEditMode ? 0.7 : 1 }}
                    >
                      <InputArea 
                        question={activeQuestions[currentQuestionIndex]} 
                        onAnswer={handleAnswer}
                        disabled={isTyping} 
                        theme={theme}
                        aiSuggestion={getAiSuggestion(activeQuestions[currentQuestionIndex].id)}
                      />
                    </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </main>
      </div>
      </LayoutGroup>

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
              questions={questions}
              setQuestions={setQuestions}
              onExport={handleExport}
              onReset={() => {
                setTheme(DEFAULT_THEME);
                setQuestions(QUESTIONS);
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
              <p className="text-gray-600 mb-4">Copy this configuration or download a standalone HTML file.</p>
              
              <div className="bg-slate-900 rounded-lg p-4 relative group mb-4">
                <pre className="text-green-400 font-mono text-xs md:text-sm overflow-auto max-h-60 whitespace-pre-wrap">
                  {markdownOutput}
                </pre>
                <button 
                  onClick={() => navigator.clipboard.writeText(markdownOutput)}
                  className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded text-xs transition-colors"
                >
                  Copy JSON
                </button>
              </div>

               <button 
                  onClick={() => {
                      const htmlContent = `<!DOCTYPE html><html><head><title>Form Export</title></head><body><h1>Use the JSON above to configure your deployment.</h1></body></html>`; 
                      // In a real scenario, this would generate the full React build string, but for now we simulate the action or provide the json.
                      const blob = new Blob([JSON.stringify({theme, questions}, null, 2)], {type: 'application/json'});
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'config.json';
                      a.click();
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 font-bold shadow-lg"
                >
                  <Download size={18} /> Download Configuration JSON
                </button>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default App;
