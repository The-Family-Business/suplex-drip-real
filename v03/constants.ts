import { Question, ThemeConfig } from './types';

export const DEFAULT_THEME: ThemeConfig = {
  colors: {
    background: '#FFF9E6',
    primary: '#1E4620',
    secondary: '#F4D03F',
    accent: '#4A2721',
    text: '#1A1A1A',
    cardBg: '#FFFFFF',
    botBubbleBg: '#FFFFFF',
    botBubbleText: '#1A1A1A',
    userBubbleBg: '#1E4620',
    userBubbleText: '#FFFFFF',
  },
  sizing: {
    baseFontSize: 22,
    buttonFontSize: 18,
    cardBorderRadius: 100,
    cardPadding: 32,
    borderWidth: 6,
    bubbleBorderRadius: 24,
    minButtonHeight: 70,
    containerMaxWidth: '1000px',
  },
  physics: {
    stiffness: 300,
    damping: 61,
    hoverScale: 1.04,
  },
};

export const QUESTIONS: Question[] = [
  {
    id: 'intro',
    text: "Hey there. Let's build your profile.",
    type: 'choice',
    options: [
      { id: 'start', label: "Start Now", value: 'start' },
      { id: 'later', label: "Not yet", value: 'later' }
    ]
  },
  {
    id: 'tools',
    text: "Are you familiar with modern no-code tools?",
    type: 'choice',
    options: [
      { id: 'expert', label: "I'm a pro", value: 'expert' },
      { id: 'some', label: "I know a few", value: 'intermediate' },
      { id: 'new', label: "Total beginner", value: 'beginner' }
    ]
  },
  {
    id: 'business_type',
    text: "What type of business are you running? (Select all that apply)",
    type: 'choice',
    multiSelect: true,
    options: [
      { id: 'saas', label: "SaaS", value: 'saas' },
      { id: 'ecommerce', label: "E-Commerce", value: 'ecommerce' },
      { id: 'b2b', label: "B2B Service", value: 'b2b' },
      { id: 'local', label: "Local Business", value: 'local' },
      { id: 'agency', label: "Agency", value: 'agency' },
      { id: 'creator', label: "Creator", value: 'creator' }
    ]
  },
  {
    id: 'website',
    text: "What is your website URL?",
    type: 'text',
    placeholder: "example.com"
  },
  {
    id: 'contact',
    text: "Where should we send the report?",
    type: 'email',
    placeholder: "name@company.com"
  }
];