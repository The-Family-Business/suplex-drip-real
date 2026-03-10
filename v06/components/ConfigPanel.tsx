
import React, { useState } from 'react';
import { ThemeConfig, Question } from '../types';
import { Copy, RefreshCw, Eye, EyeOff, Zap, Box, Wind } from 'lucide-react';

interface ConfigPanelProps {
  theme: ThemeConfig;
  setTheme: React.Dispatch<React.SetStateAction<ThemeConfig>>;
  questions: Question[];
  setQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
  onExport: () => void;
  onReset: () => void;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({ theme, setTheme, questions, setQuestions, onExport, onReset }) => {
  const [activeTab, setActiveTab] = useState<'style' | 'content'>('style');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const handleColorChange = (key: keyof ThemeConfig['colors'], value: string) => {
    setTheme(prev => ({
      ...prev,
      colors: { ...prev.colors, [key]: value }
    }));
  };

  const handlePhysicsChange = (key: keyof ThemeConfig['physics'], value: number) => {
    setTheme(prev => ({
      ...prev,
      physics: { ...prev.physics, [key]: value }
    }));
  };

  const applyPhysicsPreset = (preset: 'bouncy' | 'smooth' | 'stiff') => {
      let newPhysics;
      switch(preset) {
          case 'bouncy':
              newPhysics = { stiffness: 400, damping: 25, hoverScale: 1.05 };
              break;
          case 'smooth':
              newPhysics = { stiffness: 120, damping: 20, hoverScale: 1.02 };
              break;
          case 'stiff':
              newPhysics = { stiffness: 600, damping: 60, hoverScale: 1.01 };
              break;
      }
      setTheme(prev => ({ ...prev, physics: newPhysics }));
  };

  const handleSizingChange = (key: keyof ThemeConfig['sizing'], value: number) => {
    setTheme(prev => ({
      ...prev,
      sizing: { ...prev.sizing, [key]: value }
    }));
  };

  const toggleQuestionVisibility = (id: string) => {
    setQuestions(prev => prev.map(q => 
        q.id === id ? { ...q, hidden: !q.hidden } : q
    ));
  };

  const updateQuestionText = (id: string, newText: string) => {
    setQuestions(prev => prev.map(q => 
        q.id === id ? { ...q, text: newText } : q
    ));
  };

  return (
    <div className="bg-white/95 backdrop-blur-md border-l border-gray-200 w-full md:w-96 h-full flex flex-col shadow-2xl z-50">
      
      {/* Tab Switcher */}
      <div className="flex border-b border-gray-200">
        <button 
            onClick={() => setActiveTab('style')}
            className={`flex-1 py-4 font-bold text-sm uppercase tracking-wider ${activeTab === 'style' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
        >
            Style
        </button>
        <button 
            onClick={() => setActiveTab('content')}
            className={`flex-1 py-4 font-bold text-sm uppercase tracking-wider ${activeTab === 'content' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
        >
            Content
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        
        {activeTab === 'style' && (
            <>
                {/* Colors */}
                <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Palette</h3>
                    <div className="grid gap-3">
                    <ColorInput label="Background" value={theme.colors.background} onChange={(v) => handleColorChange('background', v)} />
                    <ColorInput label="Primary" value={theme.colors.primary} onChange={(v) => handleColorChange('primary', v)} />
                    <ColorInput label="Secondary" value={theme.colors.secondary} onChange={(v) => handleColorChange('secondary', v)} />
                    <ColorInput label="Accent" value={theme.colors.accent} onChange={(v) => handleColorChange('accent', v)} />
                    <ColorInput label="Card Base" value={theme.colors.cardBg} onChange={(v) => handleColorChange('cardBg', v)} />
                    <ColorInput label="Text" value={theme.colors.text} onChange={(v) => handleColorChange('text', v)} />
                    </div>
                </div>

                {/* Typography */}
                <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Typography</h3>
                    <RangeInput label="Chat Bubble Base" value={theme.sizing.baseFontSize} min={12} max={32} step={1} onChange={(v) => handleSizingChange('baseFontSize', v)} />
                    <RangeInput label="Button Text" value={theme.sizing.buttonFontSize} min={12} max={32} step={1} onChange={(v) => handleSizingChange('buttonFontSize', v)} />
                    <RangeInput label="Min Button Height" value={theme.sizing.minButtonHeight} min={40} max={160} step={5} onChange={(v) => handleSizingChange('minButtonHeight', v)} />
                </div>

                {/* Sizing */}
                <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Shapes</h3>
                    <RangeInput label="Corner Radius" value={theme.sizing.cardBorderRadius} min={0} max={100} step={4} onChange={(v) => handleSizingChange('cardBorderRadius', v)} />
                    <RangeInput label="Border Width" value={theme.sizing.borderWidth} min={0} max={10} step={1} onChange={(v) => handleSizingChange('borderWidth', v)} />
                </div>
                
                 {/* Physics / Animation */}
                 <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Motion Effects</h3>
                    
                    <div className="flex gap-2">
                        <button onClick={() => applyPhysicsPreset('bouncy')} className="flex-1 flex flex-col items-center justify-center p-3 rounded-lg border hover:bg-indigo-50 hover:border-indigo-300 transition-all text-xs font-semibold">
                            <Zap size={20} className="mb-1 text-orange-500" /> Bouncy
                        </button>
                        <button onClick={() => applyPhysicsPreset('smooth')} className="flex-1 flex flex-col items-center justify-center p-3 rounded-lg border hover:bg-indigo-50 hover:border-indigo-300 transition-all text-xs font-semibold">
                            <Wind size={20} className="mb-1 text-blue-500" /> Smooth
                        </button>
                        <button onClick={() => applyPhysicsPreset('stiff')} className="flex-1 flex flex-col items-center justify-center p-3 rounded-lg border hover:bg-indigo-50 hover:border-indigo-300 transition-all text-xs font-semibold">
                            <Box size={20} className="mb-1 text-gray-500" /> Stiff
                        </button>
                    </div>

                    <RangeInput label="Stiffness" value={theme.physics.stiffness} min={50} max={800} step={10} onChange={(v) => handlePhysicsChange('stiffness', v)} />
                    <RangeInput label="Damping" value={theme.physics.damping} min={5} max={100} step={1} onChange={(v) => handlePhysicsChange('damping', v)} />
                </div>

                 {/* Actions */}
                <div className="flex flex-col gap-3 pt-4 pb-8">
                    <button onClick={onExport} className="flex items-center justify-center gap-2 w-full bg-slate-900 text-white py-3 rounded-xl hover:bg-slate-800 font-bold shadow-lg">
                    <Copy size={16} /> Export / Download
                    </button>
                    <button onClick={onReset} className="flex items-center justify-center gap-2 w-full border border-gray-200 text-gray-600 py-3 rounded-xl hover:bg-gray-50 font-semibold">
                    <RefreshCw size={16} /> Reset
                    </button>
                </div>
            </>
        )}

        {activeTab === 'content' && (
            <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Question Flow</h3>
                
                <div className="space-y-3">
                    {questions.map((q, idx) => (
                        <div key={q.id} className={`p-3 rounded-lg border ${q.hidden ? 'bg-gray-50 border-gray-200 opacity-60' : 'bg-white border-indigo-100 shadow-sm'}`}>
                            <div className="flex items-start gap-2">
                                <span className="text-xs font-mono text-gray-400 mt-1">{(idx + 1).toString().padStart(2, '0')}</span>
                                
                                <div className="flex-1 min-w-0">
                                    {editingId === q.id ? (
                                        <textarea 
                                            value={q.text}
                                            onChange={(e) => updateQuestionText(q.id, e.target.value)}
                                            onBlur={() => setEditingId(null)}
                                            autoFocus
                                            className="w-full text-sm p-1 border rounded"
                                            rows={2}
                                        />
                                    ) : (
                                        <p className="text-sm font-medium text-gray-800 truncate cursor-pointer hover:text-indigo-600" onClick={() => setEditingId(q.id)}>
                                            {q.text}
                                        </p>
                                    )}
                                    <p className="text-xs text-gray-400 mt-1 capitalize">{q.type} • {q.id}</p>
                                </div>

                                <button 
                                    onClick={() => toggleQuestionVisibility(q.id)}
                                    className={`p-1.5 rounded hover:bg-gray-100 ${q.hidden ? 'text-gray-400' : 'text-indigo-600'}`}
                                >
                                    {q.hidden ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

const ColorInput = ({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) => (
  <div className="flex items-center justify-between group">
    <label className="text-sm text-gray-600 font-semibold group-hover:text-gray-900 transition-colors">{label}</label>
    <div className="flex items-center gap-2">
      <div 
        className="w-6 h-6 rounded-full shadow-sm border border-gray-100 overflow-hidden relative cursor-pointer hover:scale-110 transition-transform"
        style={{ backgroundColor: value }}
      >
        <input 
          type="color" 
          value={value} 
          onChange={(e) => onChange(e.target.value)}
          className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
        />
      </div>
    </div>
  </div>
);

const RangeInput = ({ label, value, min, max, step, onChange }: any) => (
  <div>
    <div className="flex justify-between mb-2 text-sm">
      <label className="font-medium text-gray-700">{label}</label>
      <span className="text-gray-500 font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{value}</span>
    </div>
    <input 
      type="range" min={min} max={max} step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-500 transition-all"
    />
  </div>
);
