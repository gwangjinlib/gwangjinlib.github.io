// Web Audio API Synthesizer for Retro Arcade Sounds

class SoundEngine {
  private ctx: AudioContext | null = null;
  private sfxMuted: boolean = false;
  private bgmMuted: boolean = false;
  private bgmOscillator: OscillatorNode | null = null;
  private bgmGain: GainNode | null = null;
  private bgmTimer: number | null = null;
  private isBgmPlaying: boolean = false;

  constructor() {
    // AudioContext will be initialized on user interaction
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleSfx(): boolean {
    this.sfxMuted = !this.sfxMuted;
    return !this.sfxMuted;
  }

  public toggleBgm(): boolean {
    this.bgmMuted = !this.bgmMuted;
    if (this.bgmMuted) {
      this.stopBgm();
    } else {
      this.startBgm();
    }
    return !this.bgmMuted;
  }

  public isSfxOn(): boolean {
    return !this.sfxMuted;
  }

  public isBgmOn(): boolean {
    return !this.bgmMuted;
  }

  // Rocket Launch Sound
  public playShoot() {
    if (this.sfxMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.15);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  // Laser Beam Sound
  public playLaser() {
    if (this.sfxMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1760, now + 0.2);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  // Valorant-style Kill Banner & Chime Sound
  public playValorantKill(combo: number = 1, isFinisher: boolean = false) {
    if (this.sfxMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Pitch mapping based on kill streak (1 kill up to Ace 5+ kill chords)
    const killChords: { [key: number]: number[] } = {
      1: [587.33, 880.00], // D5, A5
      2: [659.25, 987.77], // E5, B5 (Double Kill)
      3: [783.99, 1174.66], // G5, D6 (Triple Kill)
      4: [880.00, 1318.51], // A5, E6 (Quadra Kill)
      5: [1046.50, 1567.98, 2093.00], // C6, G6, C7 (ACE!)
    };
    const streak = Math.min(5, Math.max(1, combo));
    const freqs = killChords[streak] || killChords[5];

    // 1. Heavy crisp punch transient (Valorant kill thud)
    const bassOsc = this.ctx.createOscillator();
    const bassGain = this.ctx.createGain();
    bassOsc.type = 'sine';
    bassOsc.frequency.setValueAtTime(140, now);
    bassOsc.frequency.exponentialRampToValueAtTime(38, now + 0.12);
    bassGain.gain.setValueAtTime(0.4, now);
    bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    bassOsc.connect(bassGain);
    bassGain.connect(this.ctx.destination);
    bassOsc.start(now);
    bassOsc.stop(now + 0.12);

    // 2. Metallic click / headshot tick
    const tickOsc = this.ctx.createOscillator();
    const tickGain = this.ctx.createGain();
    tickOsc.type = 'triangle';
    tickOsc.frequency.setValueAtTime(2400, now);
    tickOsc.frequency.exponentialRampToValueAtTime(1200, now + 0.04);
    tickGain.gain.setValueAtTime(0.35, now);
    tickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    tickOsc.connect(tickGain);
    tickGain.connect(this.ctx.destination);
    tickOsc.start(now);
    tickOsc.stop(now + 0.04);

    // 3. Resonant musical bell chimes
    freqs.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.015);
      
      const dur = isFinisher ? 0.6 : (0.28 + streak * 0.05);
      gain.gain.setValueAtTime(0.28, now + idx * 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.015 + dur);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.015);
      osc.stop(now + idx * 0.015 + dur);
    });
  }

  // Mystic Dragon Flying & Roar Finisher Sound
  public playDragonFinisherSound() {
    if (this.sfxMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // 1. Deep Celestial Dragon Roar Sweep
    const roarOsc = this.ctx.createOscillator();
    const roarGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    roarOsc.type = 'sawtooth';
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, now);
    filter.frequency.exponentialRampToValueAtTime(1200, now + 0.4);
    filter.frequency.exponentialRampToValueAtTime(180, now + 1.1);

    roarOsc.frequency.setValueAtTime(120, now);
    roarOsc.frequency.exponentialRampToValueAtTime(420, now + 0.35);
    roarOsc.frequency.exponentialRampToValueAtTime(95, now + 1.1);

    roarGain.gain.setValueAtTime(0.01, now);
    roarGain.gain.linearRampToValueAtTime(0.4, now + 0.2);
    roarGain.gain.exponentialRampToValueAtTime(0.001, now + 1.1);

    roarOsc.connect(filter);
    filter.connect(roarGain);
    roarGain.connect(this.ctx.destination);

    roarOsc.start(now);
    roarOsc.stop(now + 1.1);

    // 2. Ascending Celestial Dragon Stardust Pentatonic Chimes
    const chimes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
    chimes.forEach((freq, i) => {
      if (!this.ctx) return;
      const cOsc = this.ctx.createOscillator();
      const cGain = this.ctx.createGain();
      cOsc.type = 'sine';
      cOsc.frequency.setValueAtTime(freq, now + 0.1 + i * 0.08);

      cGain.gain.setValueAtTime(0.2, now + 0.1 + i * 0.08);
      cGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1 + i * 0.08 + 0.4);

      cOsc.connect(cGain);
      cGain.connect(this.ctx.destination);
      cOsc.start(now + 0.1 + i * 0.08);
      cOsc.stop(now + 0.1 + i * 0.08 + 0.4);
    });
  }

  // Tactical Phantom Suppressed Shoot
  public playPhantomShoot() {
    if (this.sfxMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(650, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.11);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.11);
  }

  // Explosion / Impact Sound
  public playExplosion(isBig: boolean = false) {
    if (this.sfxMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const bufferSize = this.ctx.sampleRate * (isBig ? 0.4 : 0.2);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(isBig ? 600 : 1000, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + (isBig ? 0.4 : 0.2));

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(isBig ? 0.5 : 0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + (isBig ? 0.4 : 0.2));

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    whiteNoise.start();
  }

  // Reload sound (mechanical clicking)
  public playReload() {
    if (this.sfxMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    
    // First click
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(600, now);
    osc1.frequency.exponentialRampToValueAtTime(200, now + 0.08);
    gain1.gain.setValueAtTime(0.2, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.08);

    // Second click (completion)
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(400, now + 0.12);
    osc2.frequency.exponentialRampToValueAtTime(800, now + 0.2);
    gain2.gain.setValueAtTime(0.25, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.2);
  }

  // Item Pickup Chime
  public playItemPickup() {
    if (this.sfxMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    const now = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0.2, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.06 + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.1);
    });
  }

  // Coin Sound (bright double chime)
  public playCoin() {
    if (this.sfxMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(987.77, now); // B5
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.08);

    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1318.51, now + 0.07); // E6
    gain2.gain.setValueAtTime(0.35, now + 0.07);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);
    osc2.start(now + 0.07);
    osc2.stop(now + 0.2);
  }

  // Nuclear Bomb Detonation
  public playNuke() {
    if (this.sfxMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    this.playExplosion(true);

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 1.2);

    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 1.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 1.2);
  }

  // Shield Hit / Absorb
  public playShieldHit() {
    if (this.sfxMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.25);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  // Game Over Sound
  public playGameOver() {
    if (this.sfxMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const notes = [300, 260, 220, 180, 140];
    const now = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      gain.gain.setValueAtTime(0.25, now + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.12 + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.2);
    });
  }

  // Retro Chip Arpeggio BGM generator
  public startBgm() {
    if (this.bgmMuted || this.isBgmPlaying) return;
    this.initCtx();
    if (!this.ctx) return;

    this.isBgmPlaying = true;
    const melody = [
      261.63, 329.63, 392.00, 523.25, // C4, E4, G4, C5
      220.00, 261.63, 329.63, 440.00, // A3, C4, E4, A4
      174.61, 220.00, 261.63, 349.23, // F3, A3, C4, F4
      196.00, 246.94, 293.66, 392.00  // G3, B3, D4, G4
    ];

    let noteIdx = 0;
    this.bgmTimer = window.setInterval(() => {
      if (!this.ctx || this.bgmMuted || !this.isBgmPlaying) return;
      const freq = melody[noteIdx % melody.length];
      noteIdx++;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.14);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime);
      osc.stop(this.ctx.currentTime + 0.15);
    }, 150);
  }

  public stopBgm() {
    this.isBgmPlaying = false;
    if (this.bgmTimer !== null) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }
}

export const soundEngine = new SoundEngine();
