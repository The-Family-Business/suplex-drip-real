import React from 'react';
import { ThemeConfig } from '../types';
import { Copy, RefreshCw } from 'lucide-react';

interface ConfigPanelProps {
  theme: ThemeConfig;
  setTheme: React.Dispatch<React.SetStateAction<ThemeConfig>>;
  onExport: () => void;
  onReset: () => void;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({ theme, setTheme, onExport, onReset }) => {
  
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

  const handleSizingChange = (key: keyof ThemeConfig['sizing'], value: number) => {
    setTheme(prev => ({
      ...prev,
      sizing: { ...prev.sizing, [key]: value }
    }));
  };

  return (
    <div className="bg-white/95 backdrop-blur-md border-l border-gray-200 w-full md:w-80 h-full overflow-y-auto p-6 shadow-2xl z-50 flex flex-col gap-8">
      <div>
        <h2 className="text-2xl font-black mb-1 text-gray-800 tracking-tight">Design Studio</h2>
        <p className="text-sm text-gray-500 font-medium">Customize your experience</p>
      </div>

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

      {/* Shapes & Styling */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Styling</h3>
        
        <RangeInput 
          label="Text Size" 
          value={theme.sizing.baseFontSize} 
          min={12} max={32} step={1}
          displayValue={theme.sizing.baseFontSize + 'px'}
          onChange={(v) => handleSizingChange('baseFontSize', v)}
        />

        <RangeInput 
          label="Corner Radius" 
          value={theme.sizing.cardBorderRadius} 
          min={0} max={100} step={4}
          onChange={(v) => handleSizingChange('cardBorderRadius', v)}
        />
        
        <RangeInput 
          label="Border Width" 
          value={theme.sizing.borderWidth} 
          min={0} max={10} step={1}
          onChange={(v) => handleSizingChange('borderWidth', v)}
        />
      </div>

      {/* Interaction */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Interaction</h3>
        
        <RangeInput 
          label="Hover Scale Effect" 
          value={theme.physics.hoverScale} 
          min={1} max={1.3} step={0.01}
          displayValue={theme.physics.hoverScale.toFixed(2) + 'x'}
          onChange={(v) => handlePhysicsChange('hoverScale', v)}
        />

        <RangeInput 
          label="Spring Stiffness" 
          value={theme.physics.stiffness} 
          min={50} max={600} step={10}
          onChange={(v) => handlePhysicsChange('stiffness', v)}
        />

        <RangeInput 
          label="Bounciness (Damping)" 
          value={theme.physics.damping} 
          min={5} max={100} step={1}
          onChange={(v) => handlePhysicsChange('damping', v)}
        />
      </div>

      {/* Actions */}
      <div className="mt-auto flex flex-col gap-3 pt-8 pb-4">
        <button 
          onClick={onExport}
          className="flex items-center justify-center gap-2 w-full bg-slate-900 text-white py-4 rounded-xl hover:bg-slate-800 transition-all hover:scale-[1.02] active:scale-95 font-bold shadow-lg"
        >
          <Copy size={18} /> Copy Config (.md)
        </button>
        <button 
          onClick={onReset}
          className="flex items-center justify-center gap-2 w-full border-2 border-gray-200 text-gray-600 py-3 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all font-semibold"
        >
          <RefreshCw size={18} /> Reset Defaults
        </button>
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

const RangeInput = ({ label, value, min, max, step, onChange, displayValue }: any) => (
  <div>
    <div className="flex justify-between mb-2 text-sm">
      <label className="font-medium text-gray-700">{label}</label>
      <span className="text-gray-500 font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">
        {displayValue || value}
      </span>
    </div>
    <input 
      type="range" min={min} max={max} step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-500 transition-all"
    />
  </div>
);