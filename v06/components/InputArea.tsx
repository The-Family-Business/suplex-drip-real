
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ArrowRight, Check, Plus, Sparkles, Loader2, Minus } from 'lucide-react';
import { Question, Option, ThemeConfig } from '../types';
import { useSound } from '../hooks/useSound';

interface InputAreaProps {
  question: Question;
  onAnswer: (value: string | string[], label: string) => void;
  disabled: boolean;
  theme: ThemeConfig;
  aiSuggestions?: string[];
  isAnalyzing?: boolean;
  initialAnswer?: string | string[] | Record<string, string>;
}

export const InputArea: React.FC<InputAreaProps> = ({ question, onAnswer, disabled, theme, aiSuggestions = [], isAnalyzing = false, initialAnswer }) => {
  const [textValue, setTextValue] = useState('');
  const [customInputValue, setCustomInputValue] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const { playPop, playClick } = useSound();

  // Reset and restore state when question changes
  useEffect(() => {
    // Default Volume to 100
    let defaultText = '';
    if (question.id === 'email_volume') defaultText = '100';
    
    // Restore logic
    if (initialAnswer) {
        if (Array.isArray(initialAnswer)) {
            setSelectedOptions(initialAnswer);
        } else if (typeof initialAnswer === 'string') {
            if (question.type === 'choice' || question.multiSelect) {
                // Restore single choice as selected option for visual state
                setSelectedOptions([initialAnswer]);
            } else {
                defaultText = initialAnswer;
            }
        }
    }

    setTextValue(defaultText);
    setCustomInputValue('');
    // Only reset options if we didn't just restore them
    if (!initialAnswer) setSelectedOptions([]);

    if ((question.type === 'text' || question.type === 'email' || question.id === 'email_volume') && !disabled) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 500);
    }
  }, [question, disabled, initialAnswer]);

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textValue.trim()) return;
    playPop();
    onAnswer(textValue, textValue);
  };

  const handleCustomInputSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if(!customInputValue.trim()) return;
      playPop();
      
      if(question.multiSelect) {
          onAnswer([...selectedOptions, customInputValue], `Custom: ${customInputValue} + ${selectedOptions.length} others`);
      } else {
          onAnswer(customInputValue, customInputValue);
      }
  };

  const handleOptionClick = (option: Option) => {
    playPop();
    
    if (question.multiSelect) {
      setSelectedOptions(prev => {
        const isSelected = prev.includes(option.value);
        if (isSelected) {
          return prev.filter(v => v !== option.value);
        } else {
          return [...prev, option.value];
        }
      });
    } else {
      // Single select: submit immediately
      onAnswer(option.value, option.label);
    }
  };

  const handleMultiSubmit = () => {
    if (selectedOptions.length === 0) return;
    playClick();
    
    // Find labels
    const labels = question.options
      ?.filter(opt => selectedOptions.includes(opt.value))
      .map(opt => opt.label)
      .join(', ');
      
    onAnswer(selectedOptions, labels || '');
  };

  const handleApplySuggestion = (text: string) => {
      playClick();
      setTextValue(text);
      inputRef.current?.focus();
  };

  const adjustVolume = (delta: number) => {
    playClick();
    const current = parseInt(textValue) || 0;
    const newVal = Math.max(0, current + delta);
    setTextValue(newVal.toString());
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
        delayChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 10 },
    show: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: { 
        type: 'spring', 
        stiffness: theme.physics.stiffness, 
        damping: theme.physics.damping 
      }
    }
  };

  if (disabled) return null;

  // --- SPECIAL RENDER FOR EMAIL VOLUME COUNTER ---
  if (question.id === 'email_volume') {
    const val = parseInt(textValue) || 0;
    
    // Determine active plan tier
    let activeTier = 'starter';
    if (val >= 1000) activeTier = 'pro';
    else if (val >= 250) activeTier = 'connected';

    const tiers = [
        { id: 'starter', label: 'Starter (40)', threshold: 0 },
        { id: 'connected', label: 'Connected (250)', threshold: 250 },
        { id: 'pro', label: 'Pro (1000+)', threshold: 1000 }
    ];

    return (
        <div 
            className="w-full flex flex-col justify-end gap-6 items-center" 
            style={{ maxWidth: theme.sizing.containerMaxWidth, margin: '0 auto' }}
        >
            {/* Tier Indicators */}
            <div className="flex justify-center gap-3 w-full max-w-2xl">
                {tiers.map((tier) => {
                    const isActive = activeTier === tier.id;
                    return (
                        <motion.div
                            key={tier.id}
                            animate={{ 
                                scale: isActive ? 1.05 : 1,
                                opacity: isActive ? 1 : 0.6
                            }}
                            style={{
                                backgroundColor: isActive ? theme.colors.primary : 'rgba(255,255,255,0.4)',
                                color: isActive ? theme.colors.background : theme.colors.primary,
                                borderColor: isActive ? theme.colors.primary : 'transparent'
                            }}
                            className={`flex-1 py-3 px-2 rounded-full text-center text-sm md:text-base font-bold transition-colors border-2 shadow-sm`}
                        >
                            {tier.label}
                        </motion.div>
                    );
                })}
            </div>

            {/* Giant Counter Input */}
            <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleTextSubmit}
                className="relative w-full max-w-3xl"
            >
                <div 
                  className="relative flex items-center rounded-full shadow-2xl overflow-hidden"
                  style={{
                    backgroundColor: theme.colors.cardBg,
                    borderWidth: `${theme.sizing.borderWidth}px`,
                    borderColor: theme.colors.primary,
                    borderStyle: 'solid'
                  }}
                >
                     {/* Input */}
                    <input
                        ref={inputRef}
                        type="number"
                        value={textValue}
                        onChange={(e) => setTextValue(e.target.value)}
                        placeholder="0"
                        style={{ color: theme.colors.primary }}
                        className="w-full py-6 px-8 text-4xl font-black bg-transparent outline-none placeholder:opacity-30"
                    />
                    
                    {/* Controls */}
                    <div className="flex items-center gap-3 pr-3">
                        <button
                            type="button"
                            onClick={() => adjustVolume(10)}
                            style={{ backgroundColor: theme.colors.secondary, color: theme.colors.accent }}
                            className="p-3 rounded-full hover:brightness-95 transition-colors"
                        >
                            <Plus size={24} strokeWidth={3} />
                        </button>
                         <button
                            type="submit"
                            disabled={!textValue.trim() || parseInt(textValue) <= 0}
                            style={{ backgroundColor: theme.colors.primary, color: theme.colors.background }}
                            className="p-4 rounded-full disabled:opacity-50 disabled:scale-90 transition-all shadow-lg"
                        >
                            <ArrowRight size={28} strokeWidth={3} />
                        </button>
                    </div>
                </div>
                <p className="text-center font-bold text-sm mt-4 opacity-60" style={{ color: theme.colors.accent }}>
                    Enter the number of emails per day
                </p>
            </motion.form>
        </div>
    );
  }

  // --- STANDARD RENDER ---
  
  const isGrid = (question.options?.length || 0) > 6;

  return (
    <div 
        layout
        className="w-full flex flex-col justify-end" 
        style={{ maxWidth: theme.sizing.containerMaxWidth, margin: '0 auto' }}
    >
      <AnimatePresence mode='wait'>
        {question.type === 'choice' && question.options ? (
          <motion.div
            key="choices"
            layout
            variants={containerVariants}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            className="w-full relative"
          >
            {/* Options Grid */}
            <div className={`
              grid gap-3
              ${isGrid ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'}
            `}
            style={{ 
               padding: '20px'
            }}>
              {question.options.map((option) => {
                const isSelected = selectedOptions.includes(option.value);
                const isHovered = hoveredOption === option.id;
                
                return (
                  <motion.button
                    key={option.id}
                    layout
                    variants={itemVariants}
                    whileHover={{ 
                      scale: theme.physics.hoverScale, 
                      y: -2,
                      backgroundColor: isSelected ? theme.colors.primary : theme.colors.secondary,
                    }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleOptionClick(option)}
                    onMouseEnter={() => {
                        playClick();
                        setHoveredOption(option.id);
                    }}
                    onMouseLeave={() => setHoveredOption(null)}
                    style={{
                      backgroundColor: isSelected ? theme.colors.primary : theme.colors.cardBg,
                      borderRadius: `${theme.sizing.cardBorderRadius}px`,
                      padding: `${theme.sizing.cardPadding / 2}px`,
                      borderWidth: `${theme.sizing.borderWidth}px`,
                      borderStyle: 'solid',
                      borderColor: isSelected ? theme.colors.primary : `${theme.colors.accent}30`,
                      boxShadow: `0 8px 16px -4px ${theme.colors.accent}15`,
                      color: isSelected ? theme.colors.background : theme.colors.text,
                      minHeight: `${theme.sizing.minButtonHeight}px`,
                      overflow: 'hidden'
                    }}
                    className="group relative flex flex-col items-center justify-center text-center transition-colors duration-200"
                  >
                    <div className="relative z-10 w-full px-2">
                        <span 
                            className="font-extrabold leading-tight block"
                            style={{ 
                            fontSize: `${theme.sizing.buttonFontSize}px`,
                            fontFamily: 'Inter, sans-serif'
                            }}
                        >
                            {option.label}
                        </span>
                        
                        {/* Marquee Effect on Hover */}
                        <AnimatePresence>
                            {isHovered && option.examples && option.examples.length > 0 && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="w-full overflow-hidden mt-1"
                                >
                                    <div className="whitespace-nowrap flex animate-marquee">
                                        <span className="text-xs opacity-80 font-medium px-2">
                                            {option.examples.join(' • ')} • {option.examples.join(' • ')}
                                        </span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {isSelected && (
                        <div className="absolute top-2 right-2">
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                <Check size={16} strokeWidth={4} />
                            </motion.div>
                        </div>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Hybrid Custom Input Field */}
            {(question.allowCustomInput || true) && (
                <motion.form
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 px-2"
                    onSubmit={handleCustomInputSubmit}
                >
                     <div className="relative flex items-center">
                        <input 
                            type="text"
                            value={customInputValue}
                            onChange={(e) => setCustomInputValue(e.target.value)}
                            placeholder="Type your own answer..."
                            className="w-full py-4 px-6 rounded-full bg-white/50 backdrop-blur border-2 border-gray-200 focus:border-indigo-500 focus:bg-white outline-none transition-all shadow-sm font-semibold text-gray-700 placeholder:text-gray-400"
                        />
                        <button 
                            type="submit"
                            disabled={!customInputValue.trim()}
                            className="absolute right-2 p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-0 transition-all disabled:scale-0"
                        >
                            <Plus size={20} />
                        </button>
                     </div>
                </motion.form>
            )}

            {/* In-Flow Continue Button for Multi-Select */}
            <AnimatePresence>
              {question.multiSelect && selectedOptions.length > 0 && (
                <motion.div
                   layout
                   initial={{ opacity: 0, height: 0, y: 20 }}
                   animate={{ opacity: 1, height: 'auto', y: 0 }}
                   exit={{ opacity: 0, height: 0, y: 20 }}
                   className="w-full flex justify-center mt-6 mb-4 px-2"
                >
                  <button
                    onClick={handleMultiSubmit}
                    className="flex items-center gap-2 px-8 py-3 rounded-full font-bold shadow-xl text-lg hover:scale-105 transition-transform border-4 border-white"
                    style={{ 
                      backgroundColor: theme.colors.accent, 
                      color: theme.colors.background 
                    }}
                  >
                    Continue ({selectedOptions.length}) <ArrowRight size={20} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        ) : (
          <motion.div
            key="text-input-wrapper"
            layout
            className="relative w-full flex flex-col items-start gap-2"
          >
             {/* AI Suggestions Stack */}
             <AnimatePresence>
                {/* Loader State */}
                {isAnalyzing && aiSuggestions.length === 0 && (
                     <motion.div 
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2 text-sm font-semibold mb-2 ml-2 bg-white/50 px-3 py-1 rounded-full w-fit border border-white/50 text-indigo-700"
                    >
                        <Loader2 className="animate-spin" size={14} /> AI is finding suggestions for you...
                    </motion.div>
                )}

                {/* Suggestions List */}
                {aiSuggestions.length > 0 && !textValue && (
                    <div className="flex flex-col items-start gap-4 mb-6 ml-1 w-full max-w-5xl">
                      <div className="flex items-center gap-2 text-sm font-black uppercase tracking-widest mb-2 ml-1 text-sky-800/60">
                        <Sparkles size={16} fill="#075985" className="opacity-60" /> Suggestions
                      </div>
                      {aiSuggestions.map((suggestion, idx) => (
                        <motion.button
                            key={idx}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: idx * 0.1 }}
                            onClick={() => handleApplySuggestion(suggestion)}
                            style={{
                                borderRadius: `${theme.sizing.cardBorderRadius}px`
                            }}
                            className="w-full text-left p-8 border-4 transition-all shadow-md text-3xl font-bold leading-snug whitespace-pre-wrap break-words bg-sky-50 border-sky-200 text-sky-600 hover:bg-sky-100 hover:border-sky-300 hover:scale-[1.01] hover:shadow-xl"
                        >
                            {suggestion}
                        </motion.button>
                      ))}
                    </div>
                )}
             </AnimatePresence>

            <motion.form
                key="text-input"
                layout
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: theme.physics.stiffness, damping: theme.physics.damping }}
                onSubmit={handleTextSubmit}
                className="relative w-full max-w-3xl"
            >
                <div className="relative group">
                <input
                    ref={inputRef}
                    type={question.type}
                    value={textValue}
                    onChange={(e) => setTextValue(e.target.value)}
                    placeholder={question.placeholder}
                    style={{
                    height: `${Math.max(theme.sizing.minButtonHeight * 1.5, 120)}px`,
                    borderRadius: `${theme.sizing.cardBorderRadius}px`,
                    borderWidth: `${theme.sizing.borderWidth}px`,
                    borderStyle: 'solid',
                    borderColor: `${theme.colors.accent}20`,
                    paddingLeft: '2rem',
                    paddingRight: '6rem',
                    fontSize: `${theme.sizing.baseFontSize * 1.5}px`,
                    backgroundColor: theme.colors.cardBg,
                    color: theme.colors.text,
                    }}
                    className="w-full font-bold shadow-xl focus:border-opacity-100 focus:outline-none transition-all placeholder:text-slate-300"
                />
                <motion.button
                    type="submit"
                    disabled={!textValue.trim()}
                    whileHover={{ scale: 1.1, rotate: -5 }}
                    whileTap={{ scale: 0.9 }}
                    style={{
                    backgroundColor: theme.colors.primary,
                    color: theme.colors.background,
                    y: '-50%', // Explicitly handled by framer-motion style
                    }}
                    className="absolute right-6 top-1/2 p-4 rounded-2xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {textValue.trim() ? <Send size={32} /> : <ArrowRight size={32} />}
                </motion.button>
                </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
      <style>{`
        @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
        }
        .animate-marquee {
            animation: marquee 10s linear infinite;
        }
      `}</style>
    </div>
  );
};
