
import { useCallback } from 'react';

// Using Web Audio API to generate "liquid" UI sounds
export const useSound = () => {
  const playPop = useCallback(() => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // "Bloop" sound setup
      osc.type = 'sine';
      filter.type = 'lowpass';
      
      const t = ctx.currentTime;
      
      // Pitch envelope: Start mid, go slightly up, then drop fast
      osc.frequency.setValueAtTime(600, t);
      osc.frequency.exponentialRampToValueAtTime(800, t + 0.05);
      osc.frequency.exponentialRampToValueAtTime(300, t + 0.2);

      // Filter sweep to give the "water" character
      filter.frequency.setValueAtTime(400, t);
      filter.frequency.linearRampToValueAtTime(1500, t + 0.1);
      
      // Amplitude envelope
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.3, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(t + 0.25);
    } catch (e) {
      // Ignore audio errors
    }
  }, []);

  const playSwoosh = useCallback(() => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;

      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'triangle';
      filter.type = 'lowpass';

      const t = ctx.currentTime;

      // Lower frequency slide
      osc.frequency.setValueAtTime(300, t);
      osc.frequency.linearRampToValueAtTime(100, t + 0.3);

      // Filter opens up creates the "whoosh" air
      filter.frequency.setValueAtTime(200, t);
      filter.frequency.exponentialRampToValueAtTime(2000, t + 0.2);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.15, t + 0.05);
      gain.gain.linearRampToValueAtTime(0, t + 0.3);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(t + 0.35);
    } catch (e) {
      // Ignore
    }
  }, []);

  const playClick = useCallback(() => {
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
  
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
  
        // Short high pitched blip
        osc.type = 'sine';
        const t = ctx.currentTime;
        
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.exponentialRampToValueAtTime(1200, t + 0.05);
        
        gain.gain.setValueAtTime(0.05, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
  
        osc.connect(gain);
        gain.connect(ctx.destination);
  
        osc.start();
        osc.stop(t + 0.1);
      } catch (e) {
        // Ignore
      }
  }, []);

  return { playPop, playSwoosh, playClick };
};
