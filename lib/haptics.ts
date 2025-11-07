// Haptic feedback utilities

type HapticIntensity = 'light' | 'medium' | 'heavy';

export class HapticsManager {
  private enabled: boolean = true;

  constructor() {
    // Load preference from localStorage
    if (typeof window !== 'undefined') {
      const pref = localStorage.getItem('haptics_enabled');
      this.enabled = pref !== 'false'; // enabled by default
    }
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('haptics_enabled', enabled.toString());
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public vibrate(intensity: HapticIntensity = 'medium') {
    if (!this.enabled) return;

    if ('vibrate' in navigator) {
      const patterns = {
        light: 10,
        medium: 20,
        heavy: 30
      };

      navigator.vibrate(patterns[intensity]);
    }
  }

  // Specific haptic patterns for common actions
  public tap() {
    this.vibrate('light');
  }

  public select() {
    this.vibrate('light');
  }

  public success() {
    if (!this.enabled) return;
    if ('vibrate' in navigator) {
      navigator.vibrate([10, 50, 10]);
    }
  }

  public error() {
    if (!this.enabled) return;
    if ('vibrate' in navigator) {
      navigator.vibrate([20, 100, 20, 100, 20]);
    }
  }

  public warning() {
    if (!this.enabled) return;
    if ('vibrate' in navigator) {
      navigator.vibrate([15, 50, 15]);
    }
  }

  public impact(intensity: HapticIntensity = 'medium') {
    this.vibrate(intensity);
  }

  public notification() {
    if (!this.enabled) return;
    if ('vibrate' in navigator) {
      navigator.vibrate([10, 30, 10]);
    }
  }
}

// Singleton instance
export const haptics = new HapticsManager();

