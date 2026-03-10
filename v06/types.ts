
export type QuestionType = 'choice' | 'text' | 'email';

export interface Option {
  id: string;
  label: string;
  emoji?: string;
  value: string;
  examples?: string[]; // For the scrolling hover effect
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: Option[];
  placeholder?: string;
  multiSelect?: boolean;
  hidden?: boolean; // For dashboard toggling
  allowCustomInput?: boolean; // To show text input alongside choices
}

export interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  isTyping?: boolean;
}

export interface UserAnswers {
  [key: string]: string | string[] | Record<string, string>;
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
    buttonFontSize: number;
    cardBorderRadius: number;
    cardPadding: number;
    borderWidth: number;
    bubbleBorderRadius: number;
    minButtonHeight: number;
    containerMaxWidth: string;
  };
  physics: {
    stiffness: number;
    damping: number;
    hoverScale: number;
  };
}
