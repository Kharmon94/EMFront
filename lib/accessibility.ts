/**
 * WCAG 2.1 AA Accessibility Utilities
 * 
 * This module provides utilities for maintaining WCAG 2.1 Level AA compliance
 * across the platform.
 */

/**
 * Check if a color combination meets WCAG contrast requirements
 * @param foreground - Foreground color in hex format
 * @param background - Background color in hex format
 * @param level - 'AA' or 'AAA'
 * @returns boolean indicating if contrast is sufficient
 */
export function checkColorContrast(
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA'
): boolean {
  const ratio = getContrastRatio(foreground, background);
  
  // WCAG 2.1 requirements
  const requirements = {
    'AA': 4.5,    // Normal text
    'AAA': 7.0,   // Normal text
    'AA_large': 3.0,   // Large text (18pt+ or 14pt+ bold)
    'AAA_large': 4.5,  // Large text
  };
  
  return ratio >= requirements[level];
}

/**
 * Calculate contrast ratio between two colors
 */
function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Calculate relative luminance of a color
 */
function getLuminance(color: string): number {
  const rgb = hexToRgb(color);
  if (!rgb) return 0;
  
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
    const normalized = val / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Generate ARIA label for music player controls
 */
export function getPlayerAriaLabel(
  action: 'play' | 'pause' | 'next' | 'previous' | 'shuffle' | 'repeat',
  trackTitle?: string
): string {
  const labels = {
    play: trackTitle ? `Play ${trackTitle}` : 'Play',
    pause: trackTitle ? `Pause ${trackTitle}` : 'Pause',
    next: 'Next track',
    previous: 'Previous track',
    shuffle: 'Toggle shuffle',
    repeat: 'Toggle repeat',
  };
  
  return labels[action];
}

/**
 * Generate ARIA label for trading interface
 */
export function getTradingAriaLabel(
  action: 'buy' | 'sell',
  tokenSymbol: string,
  amount: number
): string {
  return `${action === 'buy' ? 'Buy' : 'Sell'} ${amount} ${tokenSymbol} tokens`;
}

/**
 * Format time for screen readers
 */
export function formatTimeForScreenReader(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
  if (minutes > 0) parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs} second${secs !== 1 ? 's' : ''}`);
  
  return parts.join(', ');
}

/**
 * Generate descriptive alt text for artist images
 */
export function getArtistImageAlt(artistName: string, verified: boolean): string {
  return `${artistName}${verified ? ', verified artist' : ''} profile picture`;
}

/**
 * Generate descriptive alt text for album artwork
 */
export function getAlbumImageAlt(albumTitle: string, artistName: string): string {
  return `${albumTitle} by ${artistName} album artwork`;
}

/**
 * Keyboard navigation helper for interactive lists
 */
export function handleListKeyNavigation(
  event: React.KeyboardEvent,
  currentIndex: number,
  listLength: number,
  onSelect: (index: number) => void
): void {
  let newIndex = currentIndex;
  
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      newIndex = Math.min(currentIndex + 1, listLength - 1);
      break;
    case 'ArrowUp':
      event.preventDefault();
      newIndex = Math.max(currentIndex - 1, 0);
      break;
    case 'Home':
      event.preventDefault();
      newIndex = 0;
      break;
    case 'End':
      event.preventDefault();
      newIndex = listLength - 1;
      break;
    case 'Enter':
    case ' ':
      event.preventDefault();
      onSelect(currentIndex);
      return;
  }
  
  if (newIndex !== currentIndex) {
    onSelect(newIndex);
  }
}

/**
 * Focus management for modals and dialogs
 */
export class FocusTrap {
  private element: HTMLElement;
  private previouslyFocused: HTMLElement | null;
  private focusableElements: HTMLElement[];
  
  constructor(element: HTMLElement) {
    this.element = element;
    this.previouslyFocused = document.activeElement as HTMLElement;
    this.focusableElements = this.getFocusableElements();
  }
  
  activate(): void {
    // Focus first element
    if (this.focusableElements.length > 0) {
      this.focusableElements[0].focus();
    }
    
    // Add keyboard listener
    this.element.addEventListener('keydown', this.handleKeyDown);
  }
  
  deactivate(): void {
    // Remove keyboard listener
    this.element.removeEventListener('keydown', this.handleKeyDown);
    
    // Restore focus
    if (this.previouslyFocused) {
      this.previouslyFocused.focus();
    }
  }
  
  private getFocusableElements(): HTMLElement[] {
    const selector = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');
    
    return Array.from(this.element.querySelectorAll(selector));
  }
  
  private handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key !== 'Tab') return;
    
    const firstElement = this.focusableElements[0];
    const lastElement = this.focusableElements[this.focusableElements.length - 1];
    
    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  };
}

/**
 * Announce messages to screen readers
 */
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get appropriate animation duration based on user preference
 */
export function getAnimationDuration(normalDuration: number): number {
  return prefersReducedMotion() ? 0 : normalDuration;
}

/**
 * Skip to main content (for keyboard navigation)
 */
export function addSkipToMainLink(): void {
  const skipLink = document.createElement('a');
  skipLink.href = '#main-content';
  skipLink.textContent = 'Skip to main content';
  skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:p-4 focus:bg-purple-600 focus:text-white';
  
  document.body.insertBefore(skipLink, document.body.firstChild);
}

/**
 * Validate form with accessible error messages
 */
export function setAccessibleFormError(
  inputElement: HTMLInputElement,
  errorMessage: string
): void {
  // Set aria-invalid
  inputElement.setAttribute('aria-invalid', 'true');
  
  // Create or update error message
  let errorElement = document.getElementById(`${inputElement.id}-error`);
  
  if (!errorElement) {
    errorElement = document.createElement('span');
    errorElement.id = `${inputElement.id}-error`;
    errorElement.className = 'text-red-500 text-sm mt-1';
    errorElement.setAttribute('role', 'alert');
    inputElement.parentElement?.appendChild(errorElement);
  }
  
  errorElement.textContent = errorMessage;
  inputElement.setAttribute('aria-describedby', errorElement.id);
}

/**
 * Clear accessible form error
 */
export function clearAccessibleFormError(inputElement: HTMLInputElement): void {
  inputElement.removeAttribute('aria-invalid');
  inputElement.removeAttribute('aria-describedby');
  
  const errorElement = document.getElementById(`${inputElement.id}-error`);
  if (errorElement) {
    errorElement.remove();
  }
}

