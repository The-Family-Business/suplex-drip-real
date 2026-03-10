
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Message, ThemeConfig } from '../types';
import { Undo2 } from 'lucide-react';

interface ChatBubbleProps {
  message: Message;
  visualState: 'active' | 'historyRecent' | 'historyMedium' | 'historyFar' | 'hidden';
  theme: ThemeConfig;
  onClick?: () => void;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message, visualState, theme, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const isBot = message.sender === 'bot';
  const isHistory = visualState.includes('history');
  
  // Detect if text is "long" (e.g. over 100 chars) to change styling
  const isLongText = message.text.length > 100;

  // Animation variants - "Time Machine" 3D Stack
  // Note: We use negative margins to aggressively pull the stack up
  const variants = {
    hidden: { 
      opacity: 0, 
      scale: 0.5,
      y: 100,
      rotateX: 20,
      transition: { duration: 0.4 } 
    },
    historyFar: { 
      opacity: 0.3, 
      scale: 0.85, 
      y: -60, 
      rotateX: 15,
      marginBottom: -100, // Very aggressive overlap
      filter: 'blur(4px)',
      zIndex: 1,
      transition: { type: 'spring', stiffness: theme.physics.stiffness, damping: theme.physics.damping }
    },
    historyMedium: { 
        opacity: 0.6, 
        scale: 0.9,
        y: -40, 
        rotateX: 10,
        marginBottom: -90, 
        filter: 'blur(2px)',
        zIndex: 2,
        transition: { type: 'spring', stiffness: theme.physics.stiffness, damping: theme.physics.damping }
      },
    historyRecent: { 
      opacity: 0.8, 
      scale: 0.95,
      y: -20, 
      rotateX: 5, // Slight tilt back
      marginBottom: -80,
      filter: 'blur(1px)',
      zIndex: 5,
      transition: { type: 'spring', stiffness: theme.physics.stiffness, damping: theme.physics.damping }
    },
    active: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      rotateX: 0,
      marginBottom: 30, // Breathing room below active
      filter: 'blur(0px)',
      zIndex: 10,
      transition: { type: 'spring', stiffness: theme.physics.stiffness, damping: theme.physics.damping }
    }
  };

  // Hover overrides for history items (The "Peek" effect)
  const historyHoverStyles = isHistory && isHovered ? {
    scale: 1,
    y: 0,
    rotateX: 0,
    filter: 'blur(0px)',
    marginBottom: 20,
    zIndex: 50,
    opacity: 1
  } : {};

  // Dynamic Styles
  const fontSize = isLongText 
    ? `${theme.sizing.baseFontSize * 0.9}px` 
    : `${theme.sizing.baseFontSize * (visualState === 'active' ? 2.2 : 1.8)}px`; 
  
  const fontWeight = isLongText ? 500 : 800;

  const bgColor = isBot && isLongText ? '#e0f2fe' : (isBot ? theme.colors.botBubbleBg : theme.colors.userBubbleBg);
  const textColor = isBot && isLongText ? '#0c4a6e' : (isBot ? theme.colors.botBubbleText : theme.colors.userBubbleText);
  const borderColor = isBot && isLongText ? '#bae6fd' : (isBot ? `${theme.colors.accent}15` : 'none');

  return (
    <motion.div
      initial="hidden"
      animate={isHistory && isHovered ? historyHoverStyles : visualState}
      variants={variants}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={isHistory ? onClick : undefined}
      style={{
        display: 'flex',
        width: '100%',
        justifyContent: isBot ? 'flex-start' : 'flex-end',
        position: 'relative',
        cursor: isHistory ? 'pointer' : 'default',
        pointerEvents: isHistory ? 'auto' : 'none',
        transformStyle: 'preserve-3d', // Enable 3D rotation
        perspective: '1000px',
      }}
    >
      <div
        style={{
          maxWidth: 'min(90%, 600px)',
          padding: `${theme.sizing.cardPadding}px`, 
          borderRadius: `${theme.sizing.bubbleBorderRadius}px`,
          borderBottomLeftRadius: isBot ? 0 : `${theme.sizing.bubbleBorderRadius}px`,
          borderBottomRightRadius: isBot ? `${theme.sizing.bubbleBorderRadius}px` : 0,
          backgroundColor: bgColor,
          color: textColor,
          boxShadow: visualState === 'active' || isHovered ? '0 20px 50px -10px rgba(0, 0, 0, 0.25)' : '0 10px 20px -10px rgba(0,0,0,0.1)',
          border: isBot ? `1px solid ${borderColor}` : 'none',
        }}
        className="relative transition-colors duration-300"
      >
        {/* Undo / Edit Overlay */}
        <AnimatePresence>
            {isHistory && isHovered && (
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/10 backdrop-blur-[1px] rounded-[inherit] flex items-center justify-center z-20"
                >
                    <div className="bg-white text-black px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 transform scale-110">
                        <Undo2 size={18} /> Edit / Undo
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        <p style={{ 
          fontSize,
          lineHeight: isLongText ? 1.5 : 1.1,
          fontWeight,
          letterSpacing: isLongText ? 'normal' : '-0.02em',
          whiteSpace: 'pre-wrap', 
          wordBreak: 'break-word',
          overflowWrap: 'anywhere'
        }}>
          {message.text}
        </p>
      </div>
    </motion.div>
  );
};
