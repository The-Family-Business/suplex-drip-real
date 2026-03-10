import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ArrowRight, Check } from 'lucide-react';
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
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
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
    setSelectedOptions([]);
  }, [question, disabled]);

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textValue.trim()) return;
    playPop();
    onAnswer(textValue, textValue);
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
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    show: { 
      opacity: 1, 
      y: 0, 
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
  const optionCount = question.options?.length || 0;
  // Use dense grid on mobile if more than 2 options to prevent pushing content below fold
  const isLargeGrid = optionCount > 2;

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
            {/* Scrollable container if too many options, otherwise auto height */}
            <div className={`
              grid gap-3 md:gap-4 
              ${isLargeGrid ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}
            `}
            style={{ 
               maxHeight: '55vh', 
               overflowY: 'auto',
               padding: '10px' // Padding for shadows not to clip
            }}>
              {question.options.map((option) => {
                const isSelected = selectedOptions.includes(option.value);
                
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
                    onMouseEnter={() => playClick()}
                    style={{
                      backgroundColor: isSelected ? theme.colors.primary : theme.colors.cardBg,
                      borderRadius: `${theme.sizing.cardBorderRadius}px`,
                      padding: `${theme.sizing.cardPadding / 2}px ${theme.sizing.cardPadding}px`, // Reduced vertical padding
                      borderWidth: `${theme.sizing.borderWidth}px`,
                      borderStyle: 'solid',
                      borderColor: isSelected ? theme.colors.primary : `${theme.colors.accent}30`,
                      boxShadow: `0 10px 20px -5px ${theme.colors.accent}15`,
                      color: isSelected ? theme.colors.background : theme.colors.text,
                      minHeight: `${theme.sizing.minButtonHeight}px`,
                    }}
                    className="group relative flex flex-col items-center justify-center text-center transition-colors duration-200"
                  >
                    <div className="flex items-center gap-2">
                      <span 
                        className="font-extrabold leading-tight"
                        style={{ 
                          fontSize: `${theme.sizing.buttonFontSize}px`,
                          fontFamily: 'Inter, sans-serif'
                        }}
                      >
                        {option.label}
                      </span>
                      {isSelected && (
                         <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                           <Check size={theme.sizing.buttonFontSize} strokeWidth={4} />
                         </motion.div>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Floating Continue Button for Multi-Select */}
            <AnimatePresence>
              {question.multiSelect && selectedOptions.length > 0 && (
                <motion.div
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: 20 }}
                   className="absolute bottom-[-60px] left-0 right-0 flex justify-center z-30"
                >
                  <button
                    onClick={handleMultiSubmit}
                    className="flex items-center gap-2 px-8 py-3 rounded-full font-bold shadow-xl text-lg hover:scale-105 transition-transform"
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
                  color: theme.colors.background
                }}
                className="absolute right-6 top-1/2 -translate-y-1/2 p-4 rounded-2xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {textValue.trim() ? <Send size={32} /> : <ArrowRight size={32} />}
              </motion.button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
};