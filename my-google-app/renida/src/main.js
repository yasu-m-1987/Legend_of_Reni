// ========================================
// BIOHAZARD RENI - Main Entry Point
// ========================================

import './styles/index.css';
import { Game } from './core/Game.js';
import { TitleScene } from './scenes/TitleScene.js';
import { ModeSelectScene } from './scenes/ModeSelectScene.js';
import { CharacterSelectScene } from './scenes/CharacterSelectScene.js';
import { LoadingScene } from './scenes/LoadingScene.js';
import { GameScene } from './scenes/GameScene.js';
import { ResultScene } from './scenes/ResultScene.js';

// Initialize game
const canvas = document.getElementById('game-canvas');
const hudOverlay = document.getElementById('hud-overlay');

if (!canvas) {
  throw new Error('Game canvas not found');
}

const game = new Game(canvas, hudOverlay);

// Register scenes
game.registerScene('title', new TitleScene());
game.registerScene('modeSelect', new ModeSelectScene());
game.registerScene('characterSelect', new CharacterSelectScene());
game.registerScene('loading', new LoadingScene());
game.registerScene('game', new GameScene());
game.registerScene('result', new ResultScene());

// Start with title screen
game.start();
game.switchScene('title');

// Handle first user interaction for audio context
let audioInitialized = false;
document.addEventListener('click', () => {
  if (!audioInitialized) {
    game.audio.init();
    game.audio.resume();
    audioInitialized = true;
  }
}, { once: true });

document.addEventListener('keydown', () => {
  if (!audioInitialized) {
    game.audio.init();
    game.audio.resume();
    audioInitialized = true;
  }
}, { once: true });

console.log('☣ BIOHAZARD RENI // TYPING SURVIVAL HORROR // LOADED');
