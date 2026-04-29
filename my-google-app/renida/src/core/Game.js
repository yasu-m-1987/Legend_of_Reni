// ========================================
// BIOHAZARD RENI - Game Engine (Core Loop & Scene Management)
// ========================================

import { GAME_WIDTH, GAME_HEIGHT } from '../utils/constants.js';
import { InputHandler } from './InputHandler.js';
import { AudioManager } from './AudioManager.js';

export class Game {
  constructor(canvas, hudOverlay) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.hudOverlay = hudOverlay;

    // Responsive sizing
    this.resize();
    window.addEventListener('resize', () => this.resize());

    this.input = new InputHandler();
    this.audio = new AudioManager();

    this.currentScene = null;
    this.scenes = {};
    this.lastTime = 0;
    this.running = false;

    // Design resolution
    this.designWidth = GAME_WIDTH;
    this.designHeight = GAME_HEIGHT;
  }

  resize() {
    const container = this.canvas.parentElement;
    const w = container.clientWidth;
    const h = container.clientHeight;

    // Maintain aspect ratio
    const aspect = GAME_WIDTH / GAME_HEIGHT;
    let cw, ch;

    if (w / h > aspect) {
      ch = h;
      cw = h * aspect;
    } else {
      cw = w;
      ch = w / aspect;
    }

    this.canvas.width = GAME_WIDTH;
    this.canvas.height = GAME_HEIGHT;
    this.canvas.style.width = `${cw}px`;
    this.canvas.style.height = `${ch}px`;

    this.scale = cw / GAME_WIDTH;
  }

  registerScene(name, scene) {
    this.scenes[name] = scene;
    scene.game = this;
  }

  async switchScene(name, data = {}) {
    if (this.currentScene) {
      this.currentScene.exit();
    }
    this.currentScene = this.scenes[name];
    if (this.currentScene) {
      await this.currentScene.enter(data);
    }
  }

  start() {
    this.input.start();
    this.running = true;
    this.lastTime = performance.now();
    this._loop(this.lastTime);
  }

  stop() {
    this.running = false;
    this.input.stop();
    this.audio.stopAll();
  }

  _loop(timestamp) {
    if (!this.running) return;

    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05); // cap at 50ms
    this.lastTime = timestamp;

    if (this.currentScene) {
      this.currentScene.update(dt);
      this.currentScene.render(this.ctx);
    }

    requestAnimationFrame((t) => this._loop(t));
  }
}

// Base Scene class
export class Scene {
  constructor() {
    this.game = null;
    this._keyUnsub = null;
  }

  async enter(data) {}
  exit() {
    if (this._keyUnsub) {
      this._keyUnsub();
      this._keyUnsub = null;
    }
  }
  update(dt) {}
  render(ctx) {}
}
