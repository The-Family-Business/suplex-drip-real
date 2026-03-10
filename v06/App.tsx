
import React, { useState, useEffect, useRef } from 'react';
import { QUESTIONS, DEFAULT_THEME } from './constants';
import { Message, UserAnswers, ThemeConfig, Question } from './types';
import { ChatBubble } from './components/ChatBubble';
import { InputArea } from './components/InputArea';
import { ConfigPanel } from './components/ConfigPanel';
import { useSound } from './hooks/useSound';
import { analyzeCompany, CompanyAnalysis } from './utils/ai';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { ArrowLeft, Download, FileJson, CheckCircle, Sparkles, Settings, X } from 'lucide-react';

const App: React.FC = () => {
  // --- State ---
  const [theme, setTheme] = useState<ThemeConfig>(DEFAULT_THEME);
  const [questions, setQuestions] = useState<Question[]>(QUESTIONS);
  const [showConfig, setShowConfig] = useState(false);
  
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
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { playSwoosh, playClick } = useSound();

  // --- Helpers ---
  const activeQuestions = questions.filter(q => !q.hidden);

  // --- Effects ---
  
  // Auto-scroll logic - Prioritize keeping input visible
  useEffect(() => {
    if (messagesEndRef.current) {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'end' // Changed to end to ensure input isn't cut off
            });
        }, 150);
    }
  }, [messages.length, isTyping, currentQuestionIndex, isCompleted]);

  const getAiSuggestions = (qId: string): string[] => {
      if (!analysis) return [];
      switch(qId) {
          case 'company_name': return analysis.companyName ? [analysis.companyName] : [];
          case 'business_description': return analysis.summaries || [];
          case 'target_audience': return analysis.targetAudiences || [];
          default: return [];
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
    
    // Store answer (raw value)
    setAnswers(prev => ({ ...prev, [currentQ.id]: value }));
    playSwoosh();

    // --- AI Trigger Logic ---
    if (currentQ.id === 'intro' && typeof value === 'string' && value.includes('.')) {
        setIsAnalyzing(true);
        analyzeCompany(value).then(data => {
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

    // Move to next question
    proceedToNext(currentQuestionIndex + 1);
  };

  const proceedToNext = (nextIndex: number) => {
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    if (nextIndex < activeQuestions.length) {
      setIsTyping(true);

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
      }, 500);
    } else {
      setIsTyping(true);
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        setIsCompleted(true);
        playSwoosh();
        typingTimeoutRef.current = null;
      }, 800);
    }
  };

  // Time Travel Logic
  const handleJumpTo = (msgIndex: number) => {
    playClick();
    if (isTyping) {
        if(typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        setIsTyping(false);
    }
    
    // Calculate which question this message belongs to.
    // Logic: Message 0 is Q1 Intro. Message 1 is Q1 Answer. Message 2 is Q2 Intro.
    // So Math.floor(index / 2) should give us the Question Index roughly.
    // If we click a Bot message (even index), we go to that question.
    // If we click a User message (odd index), we go to that question to edit the answer.
    
    const targetQuestionIndex = Math.floor(msgIndex / 2);
    
    // Slice messages up to the point just before the target turn
    // If targeting Q2 (index 1), we want to keep Q1 bot and Q1 answer. (Indices 0, 1).
    // So we keep messages where index < targetQuestionIndex * 2 + 1
    
    // Actually, simpler: just keep messages up to the BOT intro of that question.
    // The Bot intro is at index `targetQuestionIndex * 2`.
    const newMessages = messages.slice(0, targetQuestionIndex * 2 + 1);
    
    setMessages(newMessages);
    setCurrentQuestionIndex(targetQuestionIndex);
    setIsCompleted(false);
  };

  const handleBack = () => {
    if (currentQuestionIndex === 0 && !isTyping && !isCompleted) return;
    playClick();

    if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
    }

    if (isCompleted) {
        setIsCompleted(false);
        setMessages(prev => prev.slice(0, -1)); // Remove last answer? No, just un-complete
        setCurrentQuestionIndex(activeQuestions.length - 1);
        return;
    }

    if (isTyping) {
        setIsTyping(false);
        setMessages(prev => prev.slice(0, -1));
        return;
    }
    
    setMessages(prev => {
        const newMsgs = [...prev];
        if (newMsgs.length > 1) {
             newMsgs.pop(); 
             newMsgs.pop(); 
        }
        return newMsgs;
    });
    
    setCurrentQuestionIndex(prev => Math.max(0, prev - 1));
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

  const handleDownloadAnswers = () => {
    const fullData = { answers, aiAnalysis: analysis };
    const json = JSON.stringify(fullData, null, 2);
    const a = document.createElement("a");
    const file = new Blob([json], { type: 'application/json' });
    a.href = URL.createObjectURL(file);
    a.download = 'form-submission.json';
    a.click();
  };

  const handleDownloadTemplate = () => {
    const templateData = {
      theme: theme,
      questions: questions,
      meta: { exportedAt: new Date().toISOString(), version: "2.0" }
    };
    const json = JSON.stringify(templateData, null, 2);
    const a = document.createElement("a");
    const file = new Blob([json], { type: 'application/json' });
    a.href = URL.createObjectURL(file);
    a.download = 'form-template.json';
    a.click();
  };

  return (
    <div className="flex h-screen w-full overflow-hidden font-sans relative" style={{ backgroundColor: theme.colors.background }}>
      
      {/* --- Config Panel Drawer --- */}
      <AnimatePresence>
        {showConfig && (
            <>
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 0.5 }} 
                    exit={{ opacity: 0 }}
                    onClick={() => setShowConfig(false)}
                    className="fixed inset-0 bg-black z-40"
                />
                <motion.div 
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="fixed inset-y-0 right-0 z-50 w-full md:w-[420px] shadow-2xl"
                >
                    <div className="absolute top-4 right-4 z-50">
                        <button 
                            onClick={() => setShowConfig(false)} 
                            className="p-2 bg-white/50 hover:bg-white rounded-full transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>
                    <ConfigPanel 
                        theme={theme} 
                        setTheme={setTheme}
                        questions={questions}
                        setQuestions={setQuestions}
                        onExport={handleDownloadAnswers}
                        onReset={resetChat}
                    />
                </motion.div>
            </>
        )}
      </AnimatePresence>

      <LayoutGroup>
        <div className="flex-1 relative flex flex-col h-full transition-all duration-300">
            
            {/* Background Blurs */}
            <div 
            className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob pointer-events-none"
            style={{ backgroundColor: theme.colors.secondary, opacity: 0.3 }} 
            />
            <div 
            className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000 pointer-events-none"
            style={{ backgroundColor: theme.colors.primary, opacity: 0.1 }} 
            />

            {/* Sticky Header */}
            <header className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-[100] pointer-events-none">
            <div className="flex items-center gap-4 pointer-events-auto">
                {(currentQuestionIndex > 0 || isTyping || isCompleted) && (
                    <button 
                        onClick={handleBack}
                        className="p-3 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40 transition-all cursor-pointer shadow-sm z-50"
                        style={{ color: theme.colors.accent }}
                        aria-label="Go Back"
                    >
                        <ArrowLeft size={24} strokeWidth={3} />
                    </button>
                )}
                <div 
                    className="text-xl font-bold tracking-tight select-none opacity-90"
                    style={{ color: theme.colors.accent }}
                >
                    BRAND<span style={{ color: theme.colors.secondary }}>FLOW</span>
                </div>
            </div>
            
            <div className="flex items-center gap-3 pointer-events-auto">
                {isAnalyzing && (
                    <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-white/50 rounded-full text-xs font-bold text-indigo-600 animate-pulse">
                        <Sparkles size={12} /> Analyzing...
                    </div>
                )}
                <button 
                    onClick={() => setShowConfig(true)}
                    className="p-3 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40 transition-all cursor-pointer shadow-sm"
                    style={{ color: theme.colors.accent }}
                >
                    <Settings size={24} strokeWidth={2.5} />
                </button>
            </div>
            </header>

            {/* Main Scrollable Content Area */}
            {/* We force flex-end to ensure the active input is always reachable */}
            <div 
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto no-scrollbar scroll-smooth relative z-10 flex flex-col"
                style={{ 
                    // Soft mask for top fade
                    maskImage: 'linear-gradient(to bottom, transparent 0%, black 100px, black 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 100px, black 100%)'
                }}
            >
                <div className="w-full max-w-4xl mx-auto px-4 md:px-8 flex-1 flex flex-col justify-end pb-8">
                    
                    {/* Top Spacer to allow scrolling up */}
                    <div className="h-[20vh] shrink-0" />

                    {/* Messages Stack */}
                    <div className="flex flex-col relative" style={{ perspective: '1000px' }}>
                        <AnimatePresence initial={false} mode="popLayout">
                            {messages.map((msg, idx) => {
                                const dist = messages.length - 1 - idx;
                                let visualState = 'active';
                                if (isCompleted) {
                                    visualState = 'historyRecent';
                                } else {
                                    if (dist === 0) visualState = 'active';
                                    else if (dist === 1) visualState = 'historyRecent';
                                    else if (dist === 2) visualState = 'historyMedium';
                                    else visualState = 'historyFar';
                                }

                                return (
                                    <ChatBubble 
                                        key={msg.id}
                                        message={msg} 
                                        visualState={visualState as any} 
                                        theme={theme}
                                        onClick={() => handleJumpTo(idx)}
                                    />
                                );
                            })}
                        </AnimatePresence>
                    </div>
                    
                    {/* Typing Indicator */}
                    {isTyping && (
                        <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex space-x-2 p-6 rounded-3xl w-fit mt-4 ml-2 mb-8 relative z-50"
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

                    {/* Completed State */}
                    <AnimatePresence>
                        {isCompleted && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 50 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            className="w-full flex flex-col items-center justify-center p-12 mt-8 text-center rounded-[3rem] shadow-xl border-4 bg-white relative z-50"
                            style={{ borderColor: theme.colors.secondary }}
                        >
                            <div className="mb-6 text-green-500">
                                <CheckCircle size={80} fill={theme.colors.cardBg} strokeWidth={2} />
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black mb-6" style={{ color: theme.colors.text }}>All Done!</h2>
                            
                            <div className="flex flex-col md:flex-row gap-4 w-full max-w-md">
                            <button
                                onClick={handleDownloadAnswers}
                                className="flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-bold text-white transition-transform hover:scale-105 active:scale-95 shadow-lg bg-gray-900"
                            >
                                <FileJson size={20} /> Answers
                            </button>
                            
                            <button
                                onClick={handleDownloadTemplate}
                                className="flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-bold transition-transform hover:scale-105 active:scale-95 shadow-lg border-2 border-gray-900 text-gray-900"
                            >
                                <Download size={20} /> Template
                            </button>
                            </div>
                            
                            <button 
                                onClick={resetChat}
                                className="mt-8 text-sm font-bold underline opacity-50 hover:opacity-100 text-gray-500"
                            >
                                Start Over
                            </button>
                        </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Active Input Area - Stitched to bottom of flow */}
                    {!isCompleted && activeQuestions[currentQuestionIndex] && !isTyping && messages[messages.length - 1].sender === 'bot' && (
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="mt-8 relative z-50"
                        >
                            <InputArea 
                                question={activeQuestions[currentQuestionIndex]} 
                                onAnswer={handleAnswer}
                                disabled={isTyping} 
                                theme={theme}
                                aiSuggestions={getAiSuggestions(activeQuestions[currentQuestionIndex].id)}
                                isAnalyzing={isAnalyzing}
                                initialAnswer={answers[activeQuestions[currentQuestionIndex].id]}
                            />
                        </motion.div>
                    )}

                    {/* Invisible anchor for scrolling */}
                    <div ref={messagesEndRef} className="h-4 w-full" />
                </div>
            </div>

        </div>
      </LayoutGroup>
    </div>
  );
};

export default App;
