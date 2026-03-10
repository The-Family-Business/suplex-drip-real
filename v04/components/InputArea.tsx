import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ArrowRight, Check, Plus } from 'lucide-react';
import { Question, Option, ThemeConfig } from '../types';
import { useSound } from '../hooks/useSound';

interface InputAreaProps {
  question: Question;
  onAnswer: (value: string | string[], label: string) => void;
  disabled: boolean;
  theme: ThemeConfig;
}

export const InputArea: React.FC<InputAreaProps> = ({ question, onAnswer, disabled, theme }) => {
  const [textValue, setTextValue] = useState('');
  const [customInputValue, setCustomInputValue] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const { playPop, playClick } = useSound();

  // Reset state when question changes
  useEffect(() => {
    if ((question.type === 'text' || question.type === 'email') && !disabled) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 500);
    }
    setTextValue('');
    setCustomInputValue('');
    setSelectedOptions([]);
  }, [question, disabled]);

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
          // Treat custom input as just another selected option
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
    
    // Find labels for selected values
    const labels = question.options
      ?.filter(opt => selectedOptions.includes(opt.value))
      .map(opt => opt.label)
      .join(', ');
      
    onAnswer(selectedOptions, labels || '');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    show: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        type: 'spring', 
        stiffness: theme.physics.stiffness, 
        damping: theme.physics.damping 
      }
    }
  };

  if (disabled) return null;

  // Determine grid columns based on option count
  // 4 columns for large screens if 12 items (perfect 4x3)
  const isGrid = (question.options?.length || 0) > 6;

  return (
    <div className="w-full flex flex-col justify-end" style={{ maxWidth: theme.sizing.containerMaxWidth, margin: '0 auto' }}>
      <AnimatePresence mode='wait'>
        {question.type === 'choice' && question.options ? (
          <motion.div
            key="choices"
            variants={containerVariants}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, y: 20 }}
            className="w-full relative"
          >
            {/* Options Grid */}
            <div className={`
              grid gap-3
              ${isGrid ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'}
            `}
            style={{ 
               maxHeight: '60vh', 
               overflowY: 'auto',
               padding: '10px'
            }}>
              {question.options.map((option) => {
                const isSelected = selectedOptions.includes(option.value);
                const isHovered = hoveredOption === option.id;
                
                return (
                  <motion.button
                    key={option.id}
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

            {/* Hybrid Custom Input Field (The "Other" Bubble) */}
            {(question.allowCustomInput || true) && (
                <motion.form
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

            {/* Floating Continue Button for Multi-Select */}
            <AnimatePresence>
              {question.multiSelect && selectedOptions.length > 0 && (
                <motion.div
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: 20 }}
                   className="fixed bottom-8 left-0 right-0 flex justify-center z-40 pointer-events-none"
                >
                  <button
                    onClick={handleMultiSubmit}
                    className="pointer-events-auto flex items-center gap-2 px-8 py-3 rounded-full font-bold shadow-2xl text-lg hover:scale-105 transition-transform border-4 border-white"
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
          <motion.form
            key="text-input"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: theme.physics.stiffness, damping: theme.physics.damping }}
            onSubmit={handleTextSubmit}
            className="relative w-full"
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
