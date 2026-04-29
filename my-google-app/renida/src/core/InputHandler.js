// ========================================
// BIOHAZARD RENI - Input Handler
// ========================================

export class InputHandler {
  constructor() {
    this.listeners = [];
    this._onKeyDown = this._onKeyDown.bind(this);
    this.enabled = true;
  }

  start() {
    document.addEventListener('keydown', this._onKeyDown);
  }

  stop() {
    document.removeEventListener('keydown', this._onKeyDown);
  }

  onKey(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  clearListeners() {
    this.listeners = [];
  }

  _onKeyDown(e) {
    if (!this.enabled) return;

    // Prevent default for game keys
    if (e.key.length === 1 || e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
    }

    this.listeners.forEach(cb => cb(e));
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }
}
