
import { useCallback, useRef } from 'react';

// Using Web Audio API to generate "Liquid 8-Bit" UI sounds
// Tuned for "Punch-Out" style: Square waves, short envelopes, high resonance.
export const useSound = () => {
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      if (Ctx) {
        audioCtxRef.current = new Ctx();
      }
    }
    // Resume context if suspended (browser autoplay policy)
    if (audioCtxRef.current?.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  // --- 1. POP: Menu Cursor / Hover (Subtle Soft Tick) ---
  const playPop = useCallback(() => {
    try {
      const ctx = getCtx();
      if (!ctx) return;
      const t = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Sine wave is much softer/cleaner than square/sawtooth
      osc.type = 'sine';
      
      // Simple high pitch tick
      osc.frequency.setValueAtTime(800, t);
      osc.frequency.exponentialRampToValueAtTime(400, t + 0.03);

      // Very short, very quiet envelope
      gain.gain.setValueAtTime(0.03, t); // Low volume
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.05);
    } catch (e) {}
  }, [getCtx]);

  // --- 2. SWOOSH: Dodge (Noise Burst with Variation) ---
  const playSwoosh = useCallback(() => {
    try {
      const ctx = getCtx();
      if (!ctx) return;
      const t = ctx.currentTime;

      // Noise Buffer
      const bufferSize = ctx.sampleRate * 0.2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.value = 4; // Sharper swoosh

      // Randomize filter sweep start/end slightly for variation
      const startFreq = 1200 + (Math.random() * 600);
      
      // Filter Sweep: High to Low (The "Dodge" air sound)
      filter.frequency.setValueAtTime(startFreq, t);
      filter.frequency.exponentialRampToValueAtTime(100, t + 0.15);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.12, t + 0.02);
      gain.gain.linearRampToValueAtTime(0, t + 0.15);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(t);
    } catch (e) {}
  }, [getCtx]);

  // --- 3. CLICK: Star Punch / Confirm (Impact) ---
  const playClick = useCallback(() => {
    try {
      const ctx = getCtx();
      if (!ctx) return;
      const t = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // Triangle for "Body" impact
      osc.type = 'triangle';
      
      filter.type = 'lowpass';
      filter.Q.value = 8;
      filter.frequency.value = 3500;

      // Pitch: Rapid drop (Kick drum / Punch style)
      // Slight randomization of start pitch to prevent ear fatigue
      const startPitch = 600 + (Math.random() * 100);
      osc.frequency.setValueAtTime(startPitch, t);
      // TUNING: Stopped at 100Hz instead of 40Hz to remove the muddy "kick drum" feel
      // but keep the punchy impact.
      osc.frequency.exponentialRampToValueAtTime(100, t + 0.12);

      // Envelope: Punchy
      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.15);
    } catch (e) {}
  }, [getCtx]);

  // --- 4. BELL: Round Start (Bright & Detuned) ---
  const playBell = useCallback(() => {
    try {
      const ctx = getCtx();
      if (!ctx) return;
      const t = ctx.currentTime;

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'square';
      osc2.type = 'square';
      
      // Higher pitch for excitement
      osc1.frequency.setValueAtTime(1046.50, t); // C6
      osc2.frequency.setValueAtTime(1050.00, t); // Detuned

      // Envelope: Sharp attack, long metallic decay
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.1, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
      
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + 1.5);
      osc2.stop(t + 1.5);

    } catch (e) {}
  }, [getCtx]);

  // --- 5. CHEER: Faint Crowd Noise (Completion) ---
  const playCheer = useCallback(() => {
    try {
      const ctx = getCtx();
      if (!ctx) return;
      const t = ctx.currentTime;

      const bufferSize = ctx.sampleRate * 2.5;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      
      // Pink/Brownish noise generation
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      // Filter modulation to simulate crowd texture
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.value = 1;
      filter.frequency.setValueAtTime(400, t);
      filter.frequency.linearRampToValueAtTime(900, t + 1.5);

      // Tremolo (Amplitude Modulation) for individual clapping/voices texture
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 8; // 8Hz flutter
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 300; // Modulate filter freq
      
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.12, t + 0.5);
      gain.gain.linearRampToValueAtTime(0.08, t + 1.5);
      gain.gain.linearRampToValueAtTime(0, t + 2.5);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      
      lfo.start(t);
      noise.start(t);
      lfo.stop(t + 2.5);
    } catch (e) {}
  }, [getCtx]);

  // --- 6. COIN: Simple Accumulation Sound ---
  const playCoin = useCallback(() => {
    try {
      const ctx = getCtx();
      if (!ctx) return;
      const t = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, t);
      osc.frequency.linearRampToValueAtTime(1600, t + 0.1);

      gain.gain.setValueAtTime(0.05, t);
      gain.gain.linearRampToValueAtTime(0, t + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.1);
    } catch (e) {}
  }, [getCtx]);

  // --- 7. CASH REGISTER: CHA-CHING ---
  const playCashRegister = useCallback(() => {
    try {
      const ctx = getCtx();
      if (!ctx) return;
      const t = ctx.currentTime;

      // 1. The Ding (Bell)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(2000, t);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.1, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.6);

      // 2. The Cha-Ching (Rattle/Coins)
      // Simulate with rapid high-pitch arpeggio
      const arpTime = 0.06;
      [1000, 1500, 2200, 3000].forEach((freq, i) => {
        const coinOsc = ctx.createOscillator();
        const coinGain = ctx.createGain();
        const startTime = t + 0.1 + (i * arpTime);
        
        coinOsc.type = 'sine';
        coinOsc.frequency.setValueAtTime(freq, startTime);
        
        coinGain.gain.setValueAtTime(0.05, startTime);
        coinGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);
        
        coinOsc.connect(coinGain);
        coinGain.connect(ctx.destination);
        coinOsc.start(startTime);
        coinOsc.stop(startTime + 0.2);
      });

    } catch (e) {}
  }, [getCtx]);

  // --- 8. LEVEL UP: Crowd + Register ---
  const playLevelStart = useCallback(() => {
    playCheer();
    setTimeout(() => playCashRegister(), 100);
  }, [playCheer, playCashRegister]);

  return { playPop, playSwoosh, playClick, playBell, playCheer, playLevelStart, playCoin, playCashRegister };
};
