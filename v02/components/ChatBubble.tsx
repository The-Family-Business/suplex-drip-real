import React from 'react';
import { motion } from 'framer-motion';
import { Message, ThemeConfig } from '../types';

interface ChatBubbleProps {
  message: Message;
  visualState: 'active' | 'historyRecent' | 'historyMedium' | 'historyFar' | 'hidden';
  theme: ThemeConfig;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message, visualState, theme }) => {
  const isBot = message.sender === 'bot';

  // "Star Wars" opening crawl effect (reversed vertically)
  // Adjusted to keep history more visible and higher up
  const variants = {
    hidden: { 
      opacity: 0, 
      height: 0, 
      scale: 0.5,
      y: -150, 
      marginBottom: 0,
      transition: { duration: 0.4 } 
    },
    historyFar: { 
      opacity: 0.3, 
      height: 'auto', 
      scale: 0.75,
      y: -80, 
      originY: 1, 
      marginBottom: -40, // Collapse spacing visually
      filter: 'blur(1px)',
      transition: { type: 'spring', stiffness: theme.physics.stiffness, damping: theme.physics.damping }
    },
    historyMedium: { 
        opacity: 0.6, 
        height: 'auto', 
        scale: 0.85,
        y: -40, 
        originY: 1, 
        marginBottom: -10, 
        filter: 'blur(0.5px)',
        transition: { type: 'spring', stiffness: theme.physics.stiffness, damping: theme.physics.damping }
      },
    historyRecent: { 
      opacity: 0.85, 
      height: 'auto', 
      scale: 0.95,
      y: -10,
      originY: 1,
      marginBottom: 20,
      filter: 'blur(0px)',
      transition: { type: 'spring', stiffness: theme.physics.stiffness, damping: theme.physics.damping }
    },
    active: { 
      opacity: 1, 
      height: 'auto', 
      scale: 1,
      y: 0,
      originY: 1,
      marginBottom: 40,
      filter: 'blur(0px)',
      transition: { type: 'spring', stiffness: theme.physics.stiffness, damping: theme.physics.damping }
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate={visualState}
      variants={variants}
      style={{
        display: 'flex',
        width: '100%',
        justifyContent: isBot ? 'flex-start' : 'flex-end',
        position: 'relative',
        zIndex: visualState === 'active' ? 10 : 5 - (visualState === 'historyRecent' ? 1 : visualState === 'historyMedium' ? 2 : 3)
      }}
    >
      <div
        style={{
          maxWidth: '90%',
          padding: `${theme.sizing.cardPadding}px`, 
          borderRadius: `${theme.sizing.bubbleBorderRadius}px`,
          borderBottomLeftRadius: isBot ? 0 : `${theme.sizing.bubbleBorderRadius}px`,
          borderBottomRightRadius: isBot ? `${theme.sizing.bubbleBorderRadius}px` : 0,
          backgroundColor: isBot ? theme.colors.botBubbleBg : theme.colors.userBubbleBg,
          color: isBot ? theme.colors.botBubbleText : theme.colors.userBubbleText,
          boxShadow: visualState === 'active' ? '0 15px 40px -10px rgba(0, 0, 0, 0.2)' : '0 4px 10px -5px rgba(0,0,0,0.1)',
          border: isBot ? `1px solid ${theme.colors.accent}15` : 'none',
        }}
        className="relative transition-all duration-300"
      >
        <p style={{ 
          fontSize: `${theme.sizing.baseFontSize * (visualState === 'active' ? 2.2 : 1.8)}px`, // Dynamic scaling
          lineHeight: 1.1,
          fontWeight: 800,
          letterSpacing: '-0.02em',
        }}>
          {message.text}
        </p>
      </div>
    </motion.div>
  );
};