import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ArrowRight } from 'lucide-react';
import { Question, Option, ThemeConfig } from '../types';
import { useSound } from '../hooks/useSound';

interface InputAreaProps {
  question: Question;
  onAnswer: (value: string, label: string) => void;
  disabled: boolean;
  theme: ThemeConfig;
}

export const InputArea: React.FC<InputAreaProps> = ({ question, onAnswer, disabled, theme }) => {
  const [textValue, setTextValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { playPop, playClick } = useSound();

  useEffect(() => {
    if ((question.type === 'text' || question.type === 'email') && !disabled) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 500);
    }
    setTextValue('');
  }, [question, disabled]);

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textValue.trim()) return;
    playPop();
    onAnswer(textValue, textValue);
  };

  const handleOptionClick = (option: Option) => {
    playPop();
    onAnswer(option.value, option.label);
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
  const isLargeGrid = optionCount > 4;

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
            className="w-full"
          >
            {/* Scrollable container if too many options, otherwise auto height */}
            <div className={`
              grid gap-4 md:gap-6 
              ${isLargeGrid ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}
            `}
            style={{ 
               maxHeight: '60vh', 
               overflowY: 'auto',
               padding: '10px' // Padding for shadows not to clip
            }}>
              {question.options.map((option) => (
                <motion.button
                  key={option.id}
                  variants={itemVariants}
                  whileHover={{ 
                    scale: theme.physics.hoverScale, 
                    y: -5,
                    backgroundColor: theme.colors.secondary,
                    borderColor: theme.colors.text,
                    color: theme.colors.text,
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleOptionClick(option)}
                  onMouseEnter={() => playClick()}
                  style={{
                    backgroundColor: theme.colors.cardBg,
                    borderRadius: `${theme.sizing.cardBorderRadius}px`,
                    padding: `${theme.sizing.cardPadding}px`,
                    borderWidth: `${theme.sizing.borderWidth}px`,
                    borderStyle: 'solid',
                    borderColor: `${theme.colors.accent}30`,
                    boxShadow: `0 20px 40px -10px ${theme.colors.accent}15`,
                    color: theme.colors.text
                  }}
                  className="group relative flex flex-col items-center justify-center text-center transition-colors duration-200 min-h-[140px]"
                >
                  <span 
                    className="font-extrabold leading-tight transition-transform duration-300"
                    style={{ 
                      fontSize: isLargeGrid ? '1.5rem' : '2rem',
                      fontFamily: 'Inter, sans-serif'
                    }}
                  >
                    {option.label}
                  </span>
                  {/* Decorative line */}
                  <div 
                    className="w-8 h-1 mt-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ backgroundColor: theme.colors.text }}
                  />
                </motion.button>
              ))}
            </div>
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
                  height: '140px',
                  borderRadius: `${theme.sizing.cardBorderRadius}px`,
                  borderWidth: `${theme.sizing.borderWidth}px`,
                  borderStyle: 'solid',
                  borderColor: `${theme.colors.accent}20`,
                  paddingLeft: '2rem',
                  paddingRight: '6rem',
                  fontSize: '2.5rem',
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