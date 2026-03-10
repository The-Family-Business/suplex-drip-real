export type QuestionType = 'choice' | 'text' | 'email';

export interface Option {
  id: string;
  label: string;
  emoji?: string;
  value: string;
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: Option[];
  placeholder?: string;
}

export interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  isTyping?: boolean;
}

export interface UserAnswers {
  [key: string]: string;
}

export interface ThemeConfig {
  colors: {
    background: string;
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    cardBg: string;
    botBubbleBg: string;
    botBubbleText: string;
    userBubbleBg: string;
    userBubbleText: string;
  };
  sizing: {
    baseFontSize: number;
    cardBorderRadius: number; // Increased range support
    cardPadding: number;
    borderWidth: number; // New: Stroke width
    bubbleBorderRadius: number;
    containerMaxWidth: string;
  };
  physics: {
    stiffness: number;
    damping: number;
    hoverScale: number; // New: Hover effect intensity
  };
}