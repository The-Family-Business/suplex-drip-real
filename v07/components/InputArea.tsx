
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ArrowRight, Check, Plus, Sparkles, Loader2, ArrowDown, RefreshCw, CreditCard, Search, ShieldCheck, Zap, Trophy, TrendingUp, Mail, PlusCircle, MinusCircle, DollarSign, Rocket, Timer, BarChart3, MapPin, Radar, Server, Database, Crown, Cpu, Flame, Briefcase, Wrench, Star, Lock, AlertCircle } from 'lucide-react';
import { Question, Option, ThemeConfig, UserAnswers } from '../types';
import { useSound } from '../hooks/useSound';

interface InputAreaProps {
  question: Question;
  onAnswer: (value: string | string[], label: string) => void;
  disabled: boolean;
  theme: ThemeConfig;
  aiSuggestions?: string[];
  isAnalyzing?: boolean;
  onReroll?: () => void;
  initialAnswer?: string | string[] | Record<string, string>;
  isInitialScrape?: boolean; 
  defaultValue?: string; 
  answers?: UserAnswers; // Allow access to previous answers for logic
}

export const InputArea: React.FC<InputAreaProps> = ({ 
    question, 
    onAnswer, 
    disabled, 
    theme, 
    aiSuggestions = [], 
    isAnalyzing = false, 
    onReroll,
    initialAnswer,
    defaultValue,
    answers
}) => {
  const [textValue, setTextValue] = useState('');
  const [customInputValue, setCustomInputValue] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);
  
  // Specific State for Plan Calculator
  // 1-5 = G-Suite Accounts. 6 = PRO Plan (Smartlead/Apify)
  const [planLevel, setPlanLevel] = useState(1);
  const [whiteGlove, setWhiteGlove] = useState(false);

  // Specific State for Location Radius
  const [radius, setRadius] = useState<number>(25);
  
  const hoverTimeoutRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { playPop, playClick, playBell, playLevelStart, playCoin, playCashRegister } = useSound();

  // Reset and restore state when question changes
  useEffect(() => {
    let defaultText = '';
    
    // Check if we have a passed-down default value
    if (defaultValue) {
        defaultText = defaultValue;
    } else {
        // Defaults for specific fields
        if (question.id === 'lead_count') defaultText = '500';
    }
    
    // --- SMART CAMPAIGN NAMING LOGIC ---
    if (question.id === 'campaign_name' && answers) {
        // Extract previous answers to build a smart name
        const audienceRaw = answers['target_audience'] || 'Leads';
        // If audience is an array, take the first one, else string
        const audience = Array.isArray(audienceRaw) ? audienceRaw[0] : audienceRaw;
        
        const locationRaw = answers['target_locations'] || '';
        // Clean location string (remove radius info if present, e.g. "New York (25 miles)" -> "New York")
        const location = (Array.isArray(locationRaw) ? locationRaw[0] : locationRaw).toString().split('(')[0].trim();

        if (location) {
            defaultText = `${audience} in ${location}`;
        } else {
            defaultText = `${audience} Outreach`;
        }
    }

    // Restore logic (overrides default if user already answered this step)
    if (initialAnswer) {
        if (Array.isArray(initialAnswer)) {
            setSelectedOptions(initialAnswer);
        } else if (typeof initialAnswer === 'string') {
            if (question.type === 'choice' || question.multiSelect) {
                 if (!question.multiSelect) {
                     setSelectedOptions([initialAnswer]);
                 } else {
                     setSelectedOptions([initialAnswer]);
                 }
            } else {
                defaultText = initialAnswer;
            }
        }
    }

    setTextValue(defaultText);
    setCustomInputValue('');
    if (!initialAnswer) setSelectedOptions([]);

    // Focus handling
    if ((question.type === 'text' || question.type === 'email' || question.id === 'select_plan' || question.id === 'lead_count' || question.id === 'campaign_name' || question.id === 'target_locations') && !disabled) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 500);
    }
  }, [question, disabled, initialAnswer, defaultValue, answers]); // Added answers dependency

  // Cleanup hover timeout
  useEffect(() => {
      return () => {
          if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      };
  }, []);

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textValue.trim()) return;
    playClick();

    // Special handling for Location to append Radius
    if (question.id === 'target_locations') {
        const radiusLabel = radius >= 100 ? "Broad/Global" : `within ${radius} miles`;
        const finalValue = `${textValue} (${radiusLabel})`;
        onAnswer(finalValue, finalValue);
    } else {
        onAnswer(textValue, textValue);
    }
  };

  const handleCustomInputSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if(!customInputValue.trim()) return;
      playClick();
      
      if(question.multiSelect) {
          onAnswer([...selectedOptions, customInputValue], `Custom: ${customInputValue} + ${selectedOptions.length} others`);
      } else {
          onAnswer(customInputValue, customInputValue);
      }
  };

  const handleOptionClick = (option: Option) => {
    playClick(); 
    
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
      onAnswer(option.value, option.label);
    }
  };

  const handleMultiSubmit = () => {
    if (selectedOptions.length === 0) return;
    playClick();
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
  
  const handleSendSuggestion = (text: string) => {
      playClick();
      onAnswer(text, text);
  };

  // --- PLAN HANDLERS ---
  const handlePlanChange = (increment: number) => {
      const next = Math.max(1, Math.min(6, planLevel + increment));
      if (next !== planLevel) {
          setPlanLevel(next);
          // Reset white glove if dropping below Pro
          if (next < 6 && whiteGlove) setWhiteGlove(false);
          
          if (next === 6) {
              playLevelStart(); // BIG SOUND for PRO
          } else if (next === 5 && increment > 0) {
              playCashRegister(); // Bonus sound for hitting the 5-account tier
          } else {
              playCoin(); // Coin sound for filling the meter
          }
      }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.03, delayChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 10 },
    show: { 
      opacity: 1, scale: 1, y: 0,
      transition: { type: 'spring', stiffness: theme.physics.stiffness, damping: theme.physics.damping }
    }
  };

  if (disabled) return null;

  // --- SALES / PLAN CALCULATOR RENDER ---
  if (question.id === 'select_plan') {
    
    const isPro = planLevel === 6;

    // 1. Calculate Costs & Volume
    const BASE_COST = 49;
    const STEP_COST = 12;
    const PRO_COST = 297;
    
    const monthlyCost = isPro 
        ? PRO_COST 
        : BASE_COST + ((planLevel - 1) * STEP_COST);
    
    // Total price if white glove selected
    const totalFirstMonth = whiteGlove ? monthlyCost + 500 : monthlyCost;

    // Market Price Logic (Price Anchoring)
    // Level 1 (1 acct): $49 vs $99 (Competitors)
    // Level 5 (5 accts): $97 vs $250 ($50/seat)
    // Pro (Unl): $297 vs $1497 (Agency Retainer)
    const marketPrice = isPro 
        ? 1497 
        : (planLevel * 50) + 49; 

    const savingsPercent = Math.round(((marketPrice - monthlyCost) / marketPrice) * 100);
    const savingsAmount = marketPrice - monthlyCost;

    const pricePerAccount = isPro ? 0 : monthlyCost / planLevel; 

    // Volume Calculations
    const dailyEmails = isPro 
        ? 10000 
        : planLevel * 50; 
        
    const monthlyEmails = dailyEmails * 22; 
    const estLeads = Math.round(monthlyEmails * 0.4); 

    // LTV
    let ltv = 2000; 
    if (answers && answers['customer_value']) {
        const ltvStr = answers['customer_value'].toString().replace(/[^0-9.]/g, '');
        const parsed = parseFloat(ltvStr);
        if (!isNaN(parsed) && parsed > 0) ltv = parsed;
    }

    const salesPerMonth = monthlyEmails / 2000;
    const revenuePotential = salesPerMonth * ltv;
    
    const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
    const fmtNum = (n: number) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n);

    const speedDays = isPro ? 1 : Math.max(2, Math.round(35 / planLevel));
    
    let submitLabel = '';
    if (isPro) {
        submitLabel = `Agency Pro: Uncapped (${fmt(PRO_COST)}/mo)`;
        if (whiteGlove) submitLabel += ` + $500 Setup`;
    } else {
        submitLabel = `Growth Plan: ${planLevel} Accounts (${fmtNum(monthlyEmails)}/mo) - ${fmt(monthlyCost)}/mo`;
    }

    const features = [
        { text: "Automated Sending", unlocked: true },
        { text: "Basic Analytics", unlocked: true },
        { text: "Standard Support", unlocked: true },
        { text: "Volume Discount", unlocked: planLevel >= 5, lockedText: "Unlock Vol Discount" },
        { text: "Priority Support", unlocked: planLevel >= 5, lockedText: "Unlock Priority Support" },
        { text: "Unlimited Sending", unlocked: isPro, lockedText: "Unlock Unlimited" },
        { text: "Dedicated Account Mgr", unlocked: isPro, lockedText: "Unlock Account Mgr" },
    ];

    return (
        <div 
            className="w-full flex flex-col justify-end gap-6 items-center" 
            style={{ 
                maxWidth: '850px', 
                margin: '0 auto',
                perspective: '1000px' 
            }} 
        >
            {/* --- METER DASHBOARD --- */}
            <motion.div 
                className="w-full grid grid-cols-1 md:grid-cols-2 gap-4"
                initial={{ rotateX: 10, y: 20, opacity: 0 }}
                animate={{ rotateX: 5, y: 0, opacity: 1 }}
                style={{ transformStyle: 'preserve-3d' }}
            >
                {/* 1. VELOCITY */}
                <div 
                    className="relative rounded-[2rem] p-6 border-4 shadow-2xl overflow-hidden flex flex-col justify-between h-[180px] transition-colors duration-500 bg-white"
                    style={{ borderColor: theme.colors.primary }}
                >
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="flex flex-col">
                             <span className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Deal Velocity</span>
                             <div className="text-4xl font-black text-slate-800 tracking-tighter">
                                {isPro ? "INSTANT" : `${speedDays} Days`}
                             </div>
                        </div>
                        <div className="p-2 rounded-xl bg-yellow-100 text-yellow-700"><Zap size={24} fill="currentColor" /></div>
                    </div>
                    <div className="relative z-10 mt-auto">
                        <div className="h-6 w-full bg-gray-100 rounded-full overflow-hidden border border-black/5 relative">
                            <motion.div 
                                className="absolute top-0 left-0 h-full rounded-full"
                                style={{ background: `linear-gradient(90deg, ${theme.colors.secondary}, #facc15)` }}
                                initial={{ width: 0 }}
                                animate={{ width: `${(planLevel / 6) * 100}%` }}
                                transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                            />
                        </div>
                    </div>
                </div>

                {/* 2. REVENUE */}
                <div 
                    className="relative rounded-[2rem] p-6 border-4 shadow-2xl overflow-hidden flex flex-col justify-between h-[180px] transition-colors duration-500 bg-white"
                    style={{ borderColor: theme.colors.primary }}
                >
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="flex flex-col">
                             <span className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Potential</span>
                             <div className="text-4xl font-black text-slate-800 leading-none tracking-tighter">
                                {fmt(revenuePotential)}
                                <span className="text-lg text-gray-400 font-bold ml-1">/mo</span>
                             </div>
                             <div className="text-xs font-bold text-green-600 mt-1">Reach ~{fmtNum(estLeads)} prospects</div>
                        </div>
                        <div className="p-2 rounded-xl bg-green-100 text-green-700"><DollarSign size={24} strokeWidth={3} /></div>
                    </div>
                    <div className="relative z-10 mt-auto">
                        <div className="h-6 w-full bg-gray-100 rounded-full overflow-hidden border border-black/5 relative">
                            <motion.div 
                                className="absolute top-0 left-0 h-full rounded-full"
                                style={{ background: `linear-gradient(90deg, ${theme.colors.primary}, #166534)` }}
                                initial={{ width: 0 }}
                                animate={{ width: `${(Math.max(1, planLevel) / 6) * 100}%` }}
                                transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                            />
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* --- CONTROLS MACHINE --- */}
            <div 
                className="w-full rounded-[2.5rem] p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between relative overflow-visible transition-colors duration-500 border-b-8 mt-4"
                style={{ 
                    backgroundColor: isPro ? theme.colors.primary : 'white',
                    borderColor: isPro ? '#143015' : theme.colors.secondary,
                    color: isPro ? 'white' : theme.colors.text
                }}
            >
                {/* Background Pattern for Pro */}
                {isPro && (
                    <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden rounded-[2.5rem]">
                         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-300 via-transparent to-transparent" />
                    </div>
                )}
                
                {/* BEST VALUE BADGE */}
                <AnimatePresence>
                    {planLevel === 5 && (
                        <motion.div 
                                initial={{ opacity: 0, scale: 0, rotate: 0 }}
                                animate={{ opacity: 1, scale: 1, rotate: 12 }}
                                exit={{ opacity: 0, scale: 0 }}
                                whileHover={{ scale: 1.1, rotate: 12 }}
                                className="absolute -top-6 -right-3 z-50 pointer-events-none"
                        >
                            <div className="relative pointer-events-auto">
                                <div className="absolute inset-0 bg-yellow-400 blur-md rounded-full animate-pulse opacity-70"></div>
                                <div className="relative bg-gradient-to-r from-yellow-300 via-yellow-400 to-orange-500 text-black text-xs font-black uppercase px-5 py-3 rounded-full shadow-[0_8px_16px_rgba(250,204,21,0.4)] border-4 border-white flex items-center gap-1.5 tracking-wide">
                                    <Star size={16} fill="black" strokeWidth={0} className="animate-[spin_4s_linear_infinite]" />
                                    BEST VALUE
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>


                {/* Left Side: Counter Controls */}
                <div className="flex flex-col items-center md:items-start gap-4 w-full md:w-auto mb-6 md:mb-0 relative z-10">
                    <div className="flex items-center gap-6 bg-black/5 p-3 rounded-2xl">
                        <button 
                            onClick={() => handlePlanChange(-1)}
                            className="w-14 h-14 rounded-xl bg-white shadow-sm flex items-center justify-center hover:scale-105 active:scale-95 transition-all text-gray-600"
                        >
                            <MinusCircle size={28} />
                        </button>

                        <div className="flex flex-col items-center min-w-[120px]">
                            <AnimatePresence mode="wait">
                                {isPro ? (
                                    <motion.div 
                                        key="pro"
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.8, opacity: 0 }}
                                        className="text-center"
                                    >
                                        <div className="flex items-center justify-center gap-1 text-yellow-400 mb-1">
                                            <Crown size={18} fill="currentColor" />
                                            <span className="text-xs font-black uppercase tracking-wider">AGENCY</span>
                                        </div>
                                        <div className="text-3xl font-black tracking-tight leading-none text-white">PRO</div>
                                    </motion.div>
                                ) : (
                                    <motion.div 
                                        key="count"
                                        initial={{ y: 10, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        exit={{ y: -10, opacity: 0 }}
                                        className="text-center"
                                    >
                                        <div className="text-5xl font-black leading-none tabular-nums" style={{ color: theme.colors.primary }}>{planLevel}</div>
                                        <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">Accounts</div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <button 
                            onClick={() => handlePlanChange(1)}
                            disabled={isPro}
                            className={`w-14 h-14 rounded-xl shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all relative ${isPro ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-green-600 text-white'}`}
                        >
                            {planLevel < 5 && (
                                <span className="absolute inset-0 rounded-xl bg-green-500 animate-ping opacity-75"></span>
                            )}
                            <PlusCircle size={28} className="relative z-10" />
                        </button>
                    </div>

                    <div className="text-center md:text-left pl-2">
                        <div className="text-sm font-medium opacity-60">Monthly Investment</div>
                        <div className="text-3xl font-black tracking-tight flex items-baseline gap-1">
                            {fmt(monthlyCost)}
                            <span className="text-base font-bold opacity-50">/mo</span>
                        </div>
                        {!isPro && planLevel > 1 && (
                            <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-[10px] font-bold uppercase">
                                Only {fmt(pricePerAccount)}/account
                            </div>
                        )}
                        {!isPro && planLevel === 1 && (
                            <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-bold uppercase">
                                $49/account
                            </div>
                        )}
                    </div>
                </div>

                <div className="w-full h-px bg-current opacity-10 md:hidden mb-6" />

                <div className="flex-1 w-full md:pl-12 relative z-10">
                    <div className="text-xs font-black uppercase tracking-widest opacity-50 mb-3">
                        Included Features
                    </div>
                    <div className="space-y-2">
                        {features.map((feat, i) => (
                            <motion.div 
                                key={feat.text}
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: i * 0.05 }}
                                className={`flex items-center gap-3 text-sm font-bold ${
                                    feat.unlocked 
                                        ? (isPro ? 'text-yellow-400' : 'text-green-600') 
                                        : 'text-gray-400 opacity-60' 
                                }`}
                            >
                                <div className={`p-1 rounded-full ${
                                    feat.unlocked 
                                        ? (isPro ? 'bg-yellow-400 text-black' : 'bg-green-100 text-green-700') 
                                        : 'bg-gray-200 text-gray-400'
                                }`}>
                                    {feat.unlocked ? <Check size={10} strokeWidth={4} /> : <Lock size={10} strokeWidth={3} />}
                                </div>
                                {feat.unlocked ? feat.text : (feat.lockedText || feat.text)}
                            </motion.div>
                        ))}
                    </div>

                    {isPro && (
                        <motion.button
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={() => {
                                setWhiteGlove(!whiteGlove);
                                playClick();
                            }}
                            className={`mt-4 w-full py-3 px-4 rounded-xl border-2 flex items-center justify-between transition-all ${
                                whiteGlove 
                                    ? 'bg-yellow-400 border-yellow-400 text-black' 
                                    : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                            }`}
                        >
                             <div className="flex items-center gap-2">
                                <Briefcase size={16} />
                                <span className="font-bold text-sm">Add White Glove Setup</span>
                             </div>
                             <div className="font-black text-sm">{whiteGlove ? <Check size={18} /> : '+$500'}</div>
                        </motion.button>
                    )}
                </div>
            </div>

            {/* --- FOUNDERS CTA BUTTON (THE ROUNDED REDESIGN) --- */}
            <motion.div
                className="w-full relative group mt-4"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                {/* 1. Golden Ring Border with Glow */}
                <div 
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-300 via-orange-400 to-yellow-300 blur-sm opacity-60 group-hover:opacity-100 transition-opacity duration-500 animate-pulse" 
                    style={{ padding: '2px' }}
                />
                
                {/* 2. Main Button Container */}
                <button
                    onClick={() => onAnswer(
                        isPro ? (whiteGlove ? 'pro_agency_white_glove' : 'pro_agency') : `${planLevel}`, 
                        submitLabel
                    )}
                    className="relative w-full rounded-full p-1 bg-gradient-to-b from-yellow-200 to-yellow-600 shadow-2xl"
                >
                    <div className="w-full h-full rounded-full bg-green-900 flex items-center justify-between px-3 py-3 md:px-8 md:py-5 relative overflow-hidden">
                        
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 translate-x-[-150%] animate-[shimmer_3s_infinite]" />

                        {/* Left: Icon & Label */}
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-green-800 flex items-center justify-center shadow-inner border border-green-400/30">
                                <Rocket size={24} className="text-white fill-white" />
                            </div>
                            <div className="flex flex-col items-start text-left">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span className="bg-yellow-400 text-black text-[10px] font-black uppercase px-1.5 py-0.5 rounded shadow-sm tracking-wider">
                                        FOUNDERS DEAL
                                    </span>
                                    <span className="text-green-300 text-[10px] font-bold uppercase tracking-wider line-through decoration-green-500/60 decoration-2">
                                        Typical: {fmt(marketPrice)}/mo
                                    </span>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-white font-black text-2xl md:text-3xl tracking-tight leading-none">
                                        {fmt(totalFirstMonth)}
                                        <span className="text-sm text-green-200/60 ml-1 font-bold">/mo</span>
                                    </span>
                                    
                                </div>
                            </div>
                        </div>

                        {/* Right: Savings & Arrow */}
                        <div className="flex items-center gap-6 relative z-10">
                            <div className="hidden md:flex flex-col items-end">
                                <span className="text-yellow-400 font-black text-lg">SAVE {savingsPercent}%</span>
                                <span className="text-green-200/50 text-[10px] font-bold uppercase tracking-widest">
                                    Save {fmt(savingsAmount)}/mo
                                </span>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors group-hover:translate-x-1 duration-300">
                                <ArrowRight size={20} className="text-white" />
                            </div>
                        </div>
                    </div>
                </button>
            </motion.div>
            
            <div className="flex items-center gap-4 opacity-50 text-[10px] font-bold uppercase tracking-widest pb-4">
                 <span className="flex items-center gap-1"><ShieldCheck size={12} /> 30-Day Money Back</span>
                 <span>•</span>
                 <span>Cancel Anytime</span>
            </div>

        </div>
    );
  }

  // --- GRID RENDER ---
  const isGrid = (question.options?.length || 0) > 6 || question.id === 'campaign_template';
  
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
              ${question.id === 'campaign_template' ? 'grid-cols-2 md:grid-cols-3' : (isGrid ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3')}
            `}
            style={{ padding: '20px' }}>
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
                      y: -4,
                      zIndex: 20,
                      backgroundColor: isSelected ? theme.colors.primary : theme.colors.secondary,
                    }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleOptionClick(option)}
                    onMouseEnter={() => {
                        playPop();
                        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
                        hoverTimeoutRef.current = setTimeout(() => {
                            setHoveredOption(option.id);
                        }, 600);
                    }}
                    onMouseLeave={() => {
                        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
                        setHoveredOption(null);
                    }}
                    style={{
                      // Note: We use a relative container for the button content to manage overflow properly
                      // while allowing the Tooltip to pop out of this main button wrapper.
                      backgroundColor: isSelected ? theme.colors.primary : theme.colors.cardBg,
                      borderRadius: `${theme.sizing.cardBorderRadius}px`,
                      borderWidth: `${theme.sizing.borderWidth}px`,
                      borderStyle: 'solid',
                      borderColor: isSelected ? theme.colors.primary : `${theme.colors.accent}30`,
                      boxShadow: `0 8px 16px -4px ${theme.colors.accent}15`,
                      color: isSelected ? theme.colors.background : theme.colors.text,
                      minHeight: `${theme.sizing.minButtonHeight}px`,
                      position: 'relative',
                      overflow: 'visible' // Allow tooltip to render outside
                    }}
                    className="group flex flex-col items-center justify-center text-center transition-colors duration-200"
                  >
                    <div 
                        className="w-full h-full flex flex-col items-center justify-center" 
                        style={{ 
                            padding: question.id === 'campaign_template' ? '30px 20px' : `${theme.sizing.cardPadding / 2}px`,
                            borderRadius: `${theme.sizing.cardBorderRadius - theme.sizing.borderWidth}px`,
                            overflow: 'hidden' // Clip internal content
                        }}
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
                        </div>
                    </div>

                    {isSelected && (
                        <div className="absolute top-2 right-2 z-10">
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                <Check size={16} strokeWidth={4} />
                            </motion.div>
                        </div>
                    )}

                    {/* SCROLLING TOOLTIP */}
                    <AnimatePresence>
                        {isHovered && option.examples && option.examples.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 15, scale: 0.5, x: '-50%' }}
                                animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
                                exit={{ opacity: 0, y: 10, scale: 0.6, x: '-50%' }}
                                transition={{ type: "spring", stiffness: 350, damping: 22 }}
                                style={{
                                    position: 'absolute',
                                    bottom: '115%', // Just above the button
                                    left: '50%',
                                    zIndex: 100,
                                    backgroundColor: '#111', // Very dark for contrast
                                    color: 'white',
                                    padding: '12px 16px',
                                    borderRadius: '16px',
                                    width: 'max-content',
                                    maxWidth: '240px',
                                    boxShadow: '0 15px 30px -5px rgba(0,0,0,0.4)',
                                    pointerEvents: 'none'
                                }}
                            >
                                {/* Tooltip Arrow */}
                                <div style={{
                                    position: 'absolute',
                                    bottom: '-6px',
                                    left: '50%',
                                    marginLeft: '-6px',
                                    width: '12px',
                                    height: '12px',
                                    backgroundColor: '#111',
                                    transform: 'rotate(45deg)'
                                }} />
                                
                                {/* Examples Container */}
                                <div className="relative overflow-hidden" style={{ maxHeight: '100px' }}>
                                    {/* Gradient Masks for scrolling */}
                                    {option.examples.length > 3 && (
                                        <>
                                            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-b from-[#111] to-transparent z-10" />
                                            <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-t from-[#111] to-transparent z-10" />
                                        </>
                                    )}

                                    <div className={`flex flex-col gap-1 ${option.examples.length > 3 ? 'animate-marquee-vertical-tooltip' : ''}`}>
                                        {/* Original List */}
                                        {option.examples.map((ex, i) => (
                                            <div key={`o-${i}`} className="text-sm font-semibold whitespace-nowrap opacity-90">{ex}</div>
                                        ))}
                                        {/* Duplicate for marquee */}
                                        {option.examples.length > 3 && option.examples.map((ex, i) => (
                                            <div key={`d-${i}`} className="text-sm font-semibold whitespace-nowrap opacity-90">{ex}</div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                  </motion.button>
                );
              })}
            </div>

            {/* Custom Input for Choices */}
            {question.allowCustomInput && (
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
                            placeholder={question.id === 'target_locations' ? "Enter a city, state, or region..." : "Type your own answer..."}
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

            {/* Continue Button for Multi-Select */}
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
                    style={{ backgroundColor: theme.colors.accent, color: theme.colors.background }}
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
             {/* Suggestions List - Appears magically when ready */}
             <AnimatePresence>
                {aiSuggestions.length > 0 && !textValue && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="flex flex-col items-start gap-4 mb-6 ml-1 w-full max-w-5xl relative z-50"
                    >
                      {/* Suggestions Header + Reroll */}
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center gap-2 text-sm font-black uppercase tracking-widest ml-1 text-sky-800/60">
                            <Sparkles size={16} fill="#075985" className="opacity-60" /> Found for you
                        </div>
                        
                        {onReroll && (
                            <button 
                                onClick={onReroll}
                                disabled={isAnalyzing}
                                className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/50 text-xs font-bold text-sky-700 hover:bg-white hover:shadow-sm transition-all disabled:opacity-50"
                            >
                                {isAnalyzing ? (
                                    <>
                                        <Loader2 className="animate-spin" size={12} />
                                        Thinking...
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw size={12} /> Reroll
                                    </>
                                )}
                            </button>
                        )}
                      </div>

                      {aiSuggestions.map((suggestion, idx) => (
                          <SuggestionItem 
                             key={`suggestion-${idx}`}
                             suggestion={suggestion}
                             index={idx}
                             theme={theme}
                             onApply={handleApplySuggestion}
                             onSend={handleSendSuggestion}
                          />
                      ))}
                    </motion.div>
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
                <div className="flex flex-col gap-4">
                    {/* VISIBLE ANALYZING INDICATOR REMOVED as requested */}

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
                        y: '-50%',
                        }}
                        className="absolute right-6 top-1/2 p-4 rounded-2xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {textValue.trim() ? <Send size={32} /> : <ArrowRight size={32} />}
                    </motion.button>
                    </div>

                    {/* --- LOCATION RADIUS SLIDER --- */}
                    {question.id === 'target_locations' && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="bg-white/60 backdrop-blur-md rounded-2xl p-4 border border-white/40 shadow-sm flex flex-col gap-2 w-full max-w-md mx-auto"
                        >
                            <div className="flex justify-between items-center text-sm font-bold text-gray-700">
                                <span className="flex items-center gap-1"><Radar size={16} /> Distance Range</span>
                                <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                                    {radius >= 100 ? "Global / Broad" : `${radius} miles`}
                                </span>
                            </div>
                            <input 
                                type="range" 
                                min="10" 
                                max="100" 
                                step="5"
                                value={radius}
                                onChange={(e) => setRadius(parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                            <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                <span>City Only</span>
                                <span>State Wide</span>
                            </div>
                        </motion.div>
                    )}
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
        @keyframes marquee-vertical-tooltip {
            0% { transform: translateY(0); }
            100% { transform: translateY(-50%); }
        }
        @keyframes shimmer {
            0% { transform: translateX(-150%) skewX(12deg); }
            100% { transform: translateX(150%) skewX(12deg); }
        }
        .animate-marquee {
            animation: marquee 10s linear infinite;
        }
        .animate-marquee-vertical-tooltip {
            animation: marquee-vertical-tooltip 8s linear infinite;
        }
      `}</style>
    </div>
  );
};

interface SuggestionItemProps {
    suggestion: string;
    index: number;
    theme: ThemeConfig;
    onApply: (text: string) => void;
    onSend: (text: string) => void;
}

const SuggestionItem: React.FC<SuggestionItemProps> = ({ suggestion, index, theme, onApply, onSend }) => {
    const [val, setVal] = useState(suggestion);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize on mount and change
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [val]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ delay: index * 0.1 }}
            style={{
                borderRadius: `${theme.sizing.cardBorderRadius}px`,
                backgroundColor: theme.colors.aiSuggestionBg,
                borderColor: theme.colors.aiSuggestionBorder,
                borderWidth: '6px', // Updated from 3px to 6px
                borderStyle: 'solid'
            }}
            className="w-full relative group transition-all shadow-md hover:shadow-xl overflow-hidden mb-4"
        >
            <textarea 
                ref={textareaRef}
                className="w-full bg-transparent px-6 py-5 font-bold leading-snug outline-none resize-none pb-16"
                style={{
                    fontSize: `${theme.sizing.aiSuggestionFontSize}px`,
                    color: theme.colors.aiSuggestionText,
                }}
                rows={1}
                value={val}
                onChange={(e) => setVal(e.target.value)}
            />
            
            <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                 <button 
                    onClick={() => onApply(val)}
                    style={{ backgroundColor: 'rgba(255,255,255,0.6)', color: theme.colors.aiSuggestionText }}
                    className="p-3 rounded-full hover:bg-white transition-all hover:scale-110 shadow-sm backdrop-blur-sm"
                    title="Use in Input"
                >
                    <ArrowDown size={22} strokeWidth={3} />
                </button>

                <button 
                    onClick={() => onSend(val)}
                    style={{ backgroundColor: theme.colors.aiSuggestionText, color: theme.colors.aiSuggestionBg }}
                    className="p-3 rounded-full transition-all hover:scale-110 shadow-lg hover:shadow-xl"
                    title="Send Immediately"
                >
                    <Send size={22} strokeWidth={3} />
                </button>
            </div>
        </motion.div>
    );
};
