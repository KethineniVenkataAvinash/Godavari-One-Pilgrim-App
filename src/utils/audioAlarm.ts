/**
 * Web Audio API Acoustic Emergency Alarm & Safety Whistle Generator
 * Completely offline, zero asset dependencies, synthesized in-browser.
 */

class EmergencyAudioEngine {
  private ctx: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private lfo: OscillatorNode | null = null;
  private isPlaying = false;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Starts high-decibel warbling emergency siren
   */
  startSiren(): boolean {
    try {
      this.initContext();
      if (!this.ctx) return false;
      if (this.isPlaying) this.stopSiren();

      const now = this.ctx.currentTime;

      // Master Gain
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(0.01, now);
      this.gainNode.gain.exponentialRampToValueAtTime(0.7, now + 0.1);
      this.gainNode.connect(this.ctx.destination);

      // Main Siren Oscillator (Sawtooth creates penetrating acoustic frequency)
      this.oscillator = this.ctx.createOscillator();
      this.oscillator.type = 'sawtooth';
      this.oscillator.frequency.setValueAtTime(750, now);

      // LFO for pitch modulation (warble cycle 1.5 Hz)
      this.lfo = this.ctx.createOscillator();
      this.lfo.type = 'sine';
      this.lfo.frequency.setValueAtTime(1.5, now);

      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(350, now); // Swing pitch by +-350 Hz

      this.lfo.connect(lfoGain);
      lfoGain.connect(this.oscillator.frequency);

      this.oscillator.connect(this.gainNode);

      this.lfo.start(now);
      this.oscillator.start(now);
      this.isPlaying = true;
      return true;
    } catch (e) {
      console.warn('AudioContext not allowed or supported', e);
      return false;
    }
  }

  /**
   * Stops the active siren
   */
  stopSiren() {
    try {
      if (this.gainNode && this.ctx) {
        this.gainNode.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
      }
      setTimeout(() => {
        if (this.oscillator) {
          try { this.oscillator.stop(); } catch { /* ignore */ }
          this.oscillator.disconnect();
          this.oscillator = null;
        }
        if (this.lfo) {
          try { this.lfo.stop(); } catch { /* ignore */ }
          this.lfo.disconnect();
          this.lfo = null;
        }
        if (this.gainNode) {
          this.gainNode.disconnect();
          this.gainNode = null;
        }
        this.isPlaying = false;
      }, 120);
    } catch (e) {
      console.warn('Error stopping siren', e);
      this.isPlaying = false;
    }
  }

  /**
   * Plays a sharp 3-burst safety whistle sound (police/lifeguard style)
   */
  playWhistleBurst() {
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const bursts = [0, 0.28, 0.56];

      bursts.forEach((offset) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // High pitch whistle dual tone
        osc.type = 'sine';
        osc.frequency.setValueAtTime(2800, now + offset);
        osc.frequency.exponentialRampToValueAtTime(3200, now + offset + 0.1);
        osc.frequency.exponentialRampToValueAtTime(2700, now + offset + 0.22);

        gain.gain.setValueAtTime(0.01, now + offset);
        gain.gain.linearRampToValueAtTime(0.8, now + offset + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.01, now + offset + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + offset);
        osc.stop(now + offset + 0.24);
      });
    } catch (e) {
      console.warn('Whistle burst error', e);
    }
  }

  /**
   * Plays a subtle, pleasant high-tech confirmation beep for QR code badge scanning
   * accompanied by haptic feedback.
   */
  playQrBeep(frequency = 2093, durationMs = 85, volume = 0.22): boolean {
    try {
      if (typeof window !== 'undefined' && 'navigator' in window && typeof navigator.vibrate === 'function') {
        try { navigator.vibrate(35); } catch { /* ignore */ }
      }
      this.initContext();
      if (!this.ctx) return false;

      const now = this.ctx.currentTime;
      const durationSec = durationMs / 1000;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(Math.min(volume, 0.4), now + 0.006);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, now);
      osc.frequency.exponentialRampToValueAtTime(frequency + 80, now + durationSec);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + durationSec + 0.02);

      setTimeout(() => {
        try {
          osc.disconnect();
          gain.disconnect();
        } catch { /* ignore */ }
      }, durationMs + 40);

      return true;
    } catch (e) {
      console.warn('QR beep error', e);
      return false;
    }
  }

  /**
   * Alias for playQrBeep for biometric and facility scans
   */
  playSuccessScanBeep(frequency = 2093, durationMs = 85, volume = 0.22): boolean {
    return this.playQrBeep(frequency, durationMs, volume);
  }

  /**
   * Plays a warning tone for offline alerts and threshold warnings
   */
  playWarningTone(frequency = 880, durationMs = 160, volume = 0.25): boolean {
    return this.playQrBeep(frequency, durationMs, volume);
  }

  isSirenPlaying(): boolean {
    return this.isPlaying;
  }
}

export const audioEngine = new EmergencyAudioEngine();

