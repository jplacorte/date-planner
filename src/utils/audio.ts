// Web Audio API based ambient soundscapes and tactile feedback

class SoundEngine {
  private ctx: AudioContext | null = null;
  private currentTrack: string = 'none';
  private nodes: (AudioNode | number)[] = [];

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Play satisfying UI interaction sounds
  public playCheckmarkSound() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.08); // G5
    osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.18); // C6

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.4);
  }

  public playPopSound() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(640, now + 0.06);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  public playCelebrationChime() {
    const ctx = this.getContext();
    if (!ctx) return;

    const chords = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C E G C E
    const now = ctx.currentTime;

    chords.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const delay = index * 0.07;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + delay);

      gain.gain.setValueAtTime(0.001, now + delay);
      gain.gain.linearRampToValueAtTime(0.15, now + delay + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + 1.3);
    });
  }

  // Stop current ambient background audio
  public stopAmbient() {
    this.nodes.forEach((node) => {
      if (typeof node === 'number') {
        window.clearInterval(node);
      } else {
        try {
          if ('stop' in node && typeof (node as AudioScheduledSourceNode).stop === 'function') {
            (node as AudioScheduledSourceNode).stop();
          }
          node.disconnect();
        } catch {
          // ignore cleanup errors
        }
      }
    });
    this.nodes = [];
    this.currentTrack = 'none';
  }

  // Play continuous ambient soundscape
  public playAmbient(track: 'lofi' | 'rain' | 'fireplace' | 'acoustic') {
    if (this.currentTrack === track) return;
    this.stopAmbient();
    const ctx = this.getContext();
    if (!ctx) return;

    this.currentTrack = track;

    if (track === 'rain') {
      this.startRainSynth(ctx);
    } else if (track === 'fireplace') {
      this.startFireplaceSynth(ctx);
    } else if (track === 'lofi') {
      this.startLofiSynth(ctx);
    } else if (track === 'acoustic') {
      this.startAcousticSynth(ctx);
    }
  }

  private startRainSynth(ctx: AudioContext) {
    // Generate pink noise for gentle rain
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
      b6 = white * 0.115926;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    // Filter to simulate soft raindrops
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(900, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.08, ctx.currentTime);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start();
    this.nodes.push(noise, filter, gain);
  }

  private startFireplaceSynth(ctx: AudioContext) {
    // Fireplace low rumble
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(55, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.05, ctx.currentTime);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    this.nodes.push(osc, gain);

    // Random crackle pops
    const interval = window.setInterval(() => {
      if (this.currentTrack !== 'fireplace' || !this.ctx) return;
      if (Math.random() > 0.4) {
        const popOsc = this.ctx.createOscillator();
        const popGain = this.ctx.createGain();
        const now = this.ctx.currentTime;
        popOsc.type = 'sawtooth';
        popOsc.frequency.setValueAtTime(100 + Math.random() * 400, now);
        popGain.gain.setValueAtTime(0.03 + Math.random() * 0.04, now);
        popGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
        popOsc.connect(popGain);
        popGain.connect(this.ctx.destination);
        popOsc.start(now);
        popOsc.stop(now + 0.05);
      }
    }, 180);

    this.nodes.push(interval);
  }

  private startLofiSynth(ctx: AudioContext) {
    // Gentle recurring warm major 7th chord cycle
    const chords = [
      [261.63, 329.63, 392.00, 493.88], // Cmaj7
      [220.00, 261.63, 329.63, 392.00], // Am7
      [174.61, 220.00, 261.63, 329.63], // Fmaj7
      [196.00, 246.94, 293.66, 349.23], // G7
    ];

    let chordIdx = 0;
    const playChord = () => {
      if (this.currentTrack !== 'lofi' || !this.ctx) return;
      const currentChord = chords[chordIdx];
      chordIdx = (chordIdx + 1) % chords.length;
      const now = ctx.currentTime;

      currentChord.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.04, now + 0.6);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.8);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 3.9);
      });
    };

    playChord();
    const interval = window.setInterval(playChord, 4000);
    this.nodes.push(interval);
  }

  private startAcousticSynth(ctx: AudioContext) {
    // Romantic warm acoustic arpeggios
    const notes = [329.63, 392.00, 493.88, 587.33, 659.25, 587.33, 493.88, 392.00];
    let noteIdx = 0;

    const playNote = () => {
      if (this.currentTrack !== 'acoustic' || !this.ctx) return;
      const freq = notes[noteIdx];
      noteIdx = (noteIdx + 1) % notes.length;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.05, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 1.3);
    };

    playNote();
    const interval = window.setInterval(playNote, 500);
    this.nodes.push(interval);
  }
}

export const soundEngine = new SoundEngine();
