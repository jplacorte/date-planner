import { AmbientSound } from '@/types/date';

// Web Audio API based ambient soundscapes and tactile feedback
class SoundEngine {
  private ctx: AudioContext | null = null;
  private currentTrack: AmbientSound = 'none';
  private masterGain: GainNode | null = null;
  private ambientBus: GainNode | null = null;
  private trackBus: GainNode | null = null;
  private volume: number = 0.75;
  private activeNodes: (AudioNode | number)[] = [];
  private isUnlocked: boolean = false;
  private unlockListenersAttached: boolean = false;
  private isTransitioning: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      // Load saved volume if present
      try {
        const saved = localStorage.getItem('date_planner_ambient_volume');
        if (saved !== null) {
          const parsed = parseFloat(saved);
          if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
            this.volume = parsed;
          }
        }
      } catch {}

      this.setupUnlockListeners();
    }
  }

  private setupUnlockListeners() {
    if (this.unlockListenersAttached || typeof window === 'undefined') return;
    this.unlockListenersAttached = true;

    const unlock = () => {
      const ctx = this.getContext();
      if (ctx) {
        if (ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
        }
        this.unlockAudio(ctx);
      }
    };

    ['pointerdown', 'touchstart', 'click', 'keydown'].forEach((evt) => {
      window.addEventListener(evt, unlock, { passive: true });
    });
  }

  private unlockAudio(ctx: AudioContext) {
    if (this.isUnlocked) return;
    try {
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
      this.isUnlocked = true;
    } catch {
      // ignore unlock errors
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    return this.ctx;
  }

  private ensureGraph(ctx: AudioContext) {
    if (!this.masterGain) {
      this.masterGain = ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, ctx.currentTime);
      this.masterGain.connect(ctx.destination);
    }
    if (!this.ambientBus) {
      this.ambientBus = ctx.createGain();
      this.ambientBus.gain.setValueAtTime(1.0, ctx.currentTime);
      this.ambientBus.connect(this.masterGain);
    }
  }

  private async resumeContext(): Promise<AudioContext | null> {
    const ctx = this.getContext();
    if (!ctx) return null;

    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch (err) {
        console.warn('[SoundEngine] AudioContext resume failed:', err);
      }
    }
    this.unlockAudio(ctx);
    this.ensureGraph(ctx);
    return ctx;
  }

  // Volume control (0.0 to 1.0)
  public setVolume(volume: number) {
    const clamped = Math.max(0, Math.min(1, volume));
    this.volume = clamped;
    try {
      localStorage.setItem('date_planner_ambient_volume', String(clamped));
    } catch {}

    if (this.ctx && this.masterGain) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(clamped, now + 0.05);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public getCurrentTrack(): AmbientSound {
    return this.currentTrack;
  }

  // --- Tactile UI interaction sounds ---

  public playCheckmarkSound() {
    const ctx = this.getContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    this.ensureGraph(ctx);

    const dest = this.masterGain || ctx.destination;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.08); // G5
    osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.18); // C6

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(now);
    osc.stop(now + 0.4);
  }

  public playPopSound() {
    const ctx = this.getContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    this.ensureGraph(ctx);

    const dest = this.masterGain || ctx.destination;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(640, now + 0.06);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  public playCelebrationChime() {
    const ctx = this.getContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    this.ensureGraph(ctx);

    const dest = this.masterGain || ctx.destination;
    const chords = [523.25, 659.25, 783.99, 1046.5, 1318.51]; // C E G C E
    const now = ctx.currentTime;

    chords.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const delay = index * 0.07;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + delay);

      gain.gain.setValueAtTime(0.001, now + delay);
      gain.gain.linearRampToValueAtTime(0.2, now + delay + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 1.2);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(now + delay);
      osc.stop(now + delay + 1.3);
    });
  }

  // --- Ambient Background Audio Engine ---

  public async stopAmbient(): Promise<void> {
    this.currentTrack = 'none';

    if (this.ctx && this.ambientBus) {
      const now = this.ctx.currentTime;
      try {
        this.ambientBus.gain.cancelScheduledValues(now);
        this.ambientBus.gain.setValueAtTime(this.ambientBus.gain.value, now);
        this.ambientBus.gain.linearRampToValueAtTime(0.0001, now + 0.2);
      } catch {}
      await new Promise((r) => setTimeout(r, 220));
    }

    this.cleanupNodes();

    if (this.trackBus) {
      try {
        this.trackBus.disconnect();
      } catch {}
      this.trackBus = null;
    }

    if (this.ambientBus && this.ctx) {
      try {
        this.ambientBus.gain.setValueAtTime(1.0, this.ctx.currentTime);
      } catch {}
    }
  }

  private cleanupNodes() {
    this.activeNodes.forEach((node) => {
      if (typeof node === 'number') {
        window.clearInterval(node);
      } else {
        try {
          if ('stop' in node && typeof (node as AudioScheduledSourceNode).stop === 'function') {
            (node as AudioScheduledSourceNode).stop();
          }
          node.disconnect();
        } catch {}
      }
    });
    this.activeNodes = [];
  }

  public async playAmbient(track: AmbientSound): Promise<void> {
    if (track === 'none') {
      await this.stopAmbient();
      return;
    }

    if (this.isTransitioning) return;
    this.isTransitioning = true;

    try {
      await this.stopAmbient();

      const ctx = await this.resumeContext();
      if (!ctx) return;

      this.currentTrack = track;
      this.ensureGraph(ctx);

      // Create a fresh dedicated track submaster gain
      const trackBus = ctx.createGain();
      trackBus.gain.setValueAtTime(0.001, ctx.currentTime);
      trackBus.gain.linearRampToValueAtTime(1.0, ctx.currentTime + 0.35);
      trackBus.connect(this.ambientBus!);
      this.trackBus = trackBus;

      if (track === 'rain') {
        this.startRainSynth(ctx, trackBus);
      } else if (track === 'fireplace') {
        this.startFireplaceSynth(ctx, trackBus);
      } else if (track === 'lofi') {
        this.startLofiSynth(ctx, trackBus);
      } else if (track === 'acoustic') {
        this.startAcousticSynth(ctx, trackBus);
      }
    } finally {
      this.isTransitioning = false;
    }
  }

  // --- Soundscape 1: Gentle Rain ---
  private startRainSynth(ctx: AudioContext, destination: GainNode) {
    const sampleRate = ctx.sampleRate;
    const bufferSize = sampleRate * 3;
    const buffer = ctx.createBuffer(2, bufferSize, sampleRate);

    // High quality stereo pink noise algorithm (Paul Kellet)
    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.969 * b2 + white * 0.153852;
        b3 = 0.8665 * b3 + white * 0.3104856;
        b4 = 0.55 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.016898;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.18;
        b6 = white * 0.115926;
      }
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    // Gentle rain lowpass filter
    const lpFilter = ctx.createBiquadFilter();
    lpFilter.type = 'lowpass';
    lpFilter.frequency.setValueAtTime(1400, ctx.currentTime);

    // Highpass filter to eliminate sub-bass rumble
    const hpFilter = ctx.createBiquadFilter();
    hpFilter.type = 'highpass';
    hpFilter.frequency.setValueAtTime(180, ctx.currentTime);

    const rainGain = ctx.createGain();
    rainGain.gain.setValueAtTime(0.35, ctx.currentTime);

    noise.connect(hpFilter);
    hpFilter.connect(lpFilter);
    lpFilter.connect(rainGain);
    rainGain.connect(destination);

    noise.start();
    this.activeNodes.push(noise, hpFilter, lpFilter, rainGain);

    // Delicate random window raindrops
    const dropletTimer = window.setInterval(() => {
      if (this.currentTrack !== 'rain' || !this.ctx || !this.trackBus) return;
      if (Math.random() > 0.45) {
        const now = this.ctx.currentTime;
        const dropOsc = this.ctx.createOscillator();
        const dropGain = this.ctx.createGain();
        const dropFilter = this.ctx.createBiquadFilter();

        const freq = 1400 + Math.random() * 1600;
        dropOsc.type = 'sine';
        dropOsc.frequency.setValueAtTime(freq, now);
        dropOsc.frequency.exponentialRampToValueAtTime(freq * 0.6, now + 0.06);

        dropFilter.type = 'bandpass';
        dropFilter.frequency.setValueAtTime(freq, now);
        dropFilter.Q.setValueAtTime(3.0, now);

        const peakGain = 0.04 + Math.random() * 0.06;
        dropGain.gain.setValueAtTime(0.001, now);
        dropGain.gain.linearRampToValueAtTime(peakGain, now + 0.005);
        dropGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);

        dropOsc.connect(dropFilter);
        dropFilter.connect(dropGain);
        dropGain.connect(destination);

        dropOsc.start(now);
        dropOsc.stop(now + 0.08);
      }
    }, 160);

    this.activeNodes.push(dropletTimer);
  }

  // --- Soundscape 2: Warm Fireplace ---
  private startFireplaceSynth(ctx: AudioContext, destination: GainNode) {
    // 1. Low warm ember roar (filtered noise)
    const sampleRate = ctx.sampleRate;
    const bufferSize = sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.15;
    }

    const roar = ctx.createBufferSource();
    roar.buffer = buffer;
    roar.loop = true;

    const roarFilter = ctx.createBiquadFilter();
    roarFilter.type = 'bandpass';
    roarFilter.frequency.setValueAtTime(280, ctx.currentTime);
    roarFilter.Q.setValueAtTime(1.2, ctx.currentTime);

    const roarGain = ctx.createGain();
    roarGain.gain.setValueAtTime(0.28, ctx.currentTime);

    roar.connect(roarFilter);
    roarFilter.connect(roarGain);
    roarGain.connect(destination);
    roar.start();
    this.activeNodes.push(roar, roarFilter, roarGain);

    // 2. Harmonic warm body tones (fully audible on phone/laptop speakers)
    const bodyOsc1 = ctx.createOscillator();
    const bodyOsc2 = ctx.createOscillator();
    const bodyGain = ctx.createGain();

    bodyOsc1.type = 'sine';
    bodyOsc1.frequency.setValueAtTime(110, ctx.currentTime); // A2

    bodyOsc2.type = 'sine';
    bodyOsc2.frequency.setValueAtTime(165, ctx.currentTime); // E3

    bodyGain.gain.setValueAtTime(0.07, ctx.currentTime);

    bodyOsc1.connect(bodyGain);
    bodyOsc2.connect(bodyGain);
    bodyGain.connect(destination);

    bodyOsc1.start();
    bodyOsc2.start();
    this.activeNodes.push(bodyOsc1, bodyOsc2, bodyGain);

    // 3. Realistic wood crackles & popping embers
    const crackleTimer = window.setInterval(() => {
      if (this.currentTrack !== 'fireplace' || !this.ctx || !this.trackBus) return;

      const rand = Math.random();
      if (rand > 0.4) {
        const now = this.ctx.currentTime;
        const isBigSnap = rand > 0.93;

        // Wood crackle impulse
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        if (isBigSnap) {
          // Deeper snap / pop
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(280 + Math.random() * 320, now);
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(450, now);
          filter.Q.setValueAtTime(2.0, now);

          gain.gain.setValueAtTime(0.18, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
          osc.connect(filter);
          filter.connect(gain);
          gain.connect(destination);
          osc.start(now);
          osc.stop(now + 0.07);
        } else {
          // Sharp dry pine crackle
          osc.type = 'sawtooth';
          const freq = 1800 + Math.random() * 2600;
          osc.frequency.setValueAtTime(freq, now);

          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(freq, now);
          filter.Q.setValueAtTime(5.0, now);

          const peakGain = 0.08 + Math.random() * 0.12;
          gain.gain.setValueAtTime(peakGain, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(destination);
          osc.start(now);
          osc.stop(now + 0.03);
        }
      }
    }, 85);

    this.activeNodes.push(crackleTimer);
  }

  // --- Soundscape 3: Lofi Beats (Warm Rhodes Neo-Soul Chords) ---
  private startLofiSynth(ctx: AudioContext, destination: GainNode) {
    // Iconic Neo-Soul chord progression: Cmaj9 -> Am9 -> Fmaj7 -> G13
    const chords = [
      [130.81, 196.0, 246.94, 293.66, 329.63], // Cmaj9  (C3, G3, B3, D4, E4)
      [110.0, 164.81, 196.0, 261.63, 329.63],  // Am9    (A2, E3, G3, C4, E4)
      [87.31, 130.81, 164.81, 220.0, 261.63],  // Fmaj7  (F2, C3, E3, A3, C4)
      [98.0, 174.61, 246.94, 329.63, 440.0],   // G13    (G2, F3, B3, E4, A4)
    ];

    let chordIdx = 0;

    // Subtle vinyl dust texture
    const vinylBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const vData = vinylBuffer.getChannelData(0);
    for (let i = 0; i < vData.length; i++) {
      vData[i] = (Math.random() * 2 - 1) * 0.03;
    }
    const vinyl = ctx.createBufferSource();
    vinyl.buffer = vinylBuffer;
    vinyl.loop = true;

    const vinylFilter = ctx.createBiquadFilter();
    vinylFilter.type = 'bandpass';
    vinylFilter.frequency.setValueAtTime(1200, ctx.currentTime);
    vinylFilter.Q.setValueAtTime(1.0, ctx.currentTime);

    const vinylGain = ctx.createGain();
    vinylGain.gain.setValueAtTime(0.04, ctx.currentTime);

    vinyl.connect(vinylFilter);
    vinylFilter.connect(vinylGain);
    vinylGain.connect(destination);
    vinyl.start();
    this.activeNodes.push(vinyl, vinylFilter, vinylGain);

    const playChord = () => {
      if (this.currentTrack !== 'lofi' || !this.ctx || !this.trackBus) return;
      const chord = chords[chordIdx];
      chordIdx = (chordIdx + 1) % chords.length;
      const now = this.ctx.currentTime;

      chord.forEach((freq, noteIdx) => {
        if (!this.ctx || !this.trackBus) return;

        // Primary fundamental
        const osc = this.ctx.createOscillator();
        // Warm chorus overtone
        const overtone = this.ctx.createOscillator();

        const filter = this.ctx.createBiquadFilter();
        const noteGain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        overtone.type = 'triangle';
        overtone.frequency.setValueAtTime(freq * 1.002, now); // +3.5 cents detune for lushness

        // Warm Rhodes envelope filter
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, now);
        filter.frequency.exponentialRampToValueAtTime(650, now + 1.8);

        // Staggered arpeggiation/strum touch (25ms per string)
        const strum = noteIdx * 0.025;
        const voiceGain = 0.065;

        noteGain.gain.setValueAtTime(0.001, now + strum);
        noteGain.gain.linearRampToValueAtTime(voiceGain, now + strum + 0.12);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, now + strum + 3.8);

        osc.connect(filter);
        overtone.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(destination);

        osc.start(now + strum);
        overtone.start(now + strum);
        osc.stop(now + strum + 3.9);
        overtone.stop(now + strum + 3.9);
      });
    };

    playChord();
    const interval = window.setInterval(playChord, 3900);
    this.activeNodes.push(interval);
  }

  // --- Soundscape 4: Romantic Acoustic Guitar ---
  private startAcousticSynth(ctx: AudioContext, destination: GainNode) {
    // Beautiful romantic fingerpicking pattern in D Major
    // Dmaj9 -> Bm7 -> Gmaj7 -> A7sus4
    const patterns = [
      // Dmaj9
      [146.83, 220.0, 369.99, 554.37, 440.0, 369.99],
      // Bm7
      [123.47, 185.0, 293.66, 440.0, 369.99, 293.66],
      // Gmaj7
      [98.0, 146.83, 246.94, 369.99, 293.66, 246.94],
      // A7sus4
      [110.0, 164.81, 220.0, 293.66, 329.63, 277.18],
    ];

    let patternIdx = 0;
    let noteIdx = 0;

    const playPluck = () => {
      if (this.currentTrack !== 'acoustic' || !this.ctx || !this.trackBus) return;

      const currentPattern = patterns[patternIdx];
      const freq = currentPattern[noteIdx];

      noteIdx++;
      if (noteIdx >= currentPattern.length) {
        noteIdx = 0;
        patternIdx = (patternIdx + 1) % patterns.length;
      }

      const now = ctx.currentTime;

      // Acoustic string model: triangle base + warm transient
      const osc = ctx.createOscillator();
      const harmonic = ctx.createOscillator();
      const pluckFilter = ctx.createBiquadFilter();
      const pluckGain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      harmonic.type = 'sine';
      harmonic.frequency.setValueAtTime(freq * 2, now);

      // Bright attack that swiftly decays into warm string body
      pluckFilter.type = 'lowpass';
      pluckFilter.frequency.setValueAtTime(2400, now);
      pluckFilter.frequency.exponentialRampToValueAtTime(550, now + 0.6);

      const isBassNote = noteIdx === 1; // Downbeat
      const peakGain = isBassNote ? 0.22 : 0.16;

      pluckGain.gain.setValueAtTime(0.001, now);
      pluckGain.gain.linearRampToValueAtTime(peakGain, now + 0.008);
      pluckGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);

      osc.connect(pluckFilter);
      harmonic.connect(pluckFilter);
      pluckFilter.connect(pluckGain);
      pluckGain.connect(destination);

      osc.start(now);
      harmonic.start(now);
      osc.stop(now + 1.45);
      harmonic.stop(now + 1.45);
    };

    playPluck();
    const interval = window.setInterval(playPluck, 420);
    this.activeNodes.push(interval);
  }
}

export const soundEngine = new SoundEngine();
