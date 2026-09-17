import { TitleScene } from './scenes/TitleScene.js';
import { PlayScene } from './scenes/PlayScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';
import { ClearScene } from './scenes/ClearScene.js';

/**
 * 『れにの伝説 (Legend of Reni)』エントリーポイント
 */
const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 800,
  height: 480,
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [TitleScene, PlayScene, GameOverScene, ClearScene]
};

window.addEventListener('DOMContentLoaded', () => {
  try {
    const game = new Phaser.Game(config);
    window.__RENI_GAME__ = game;
    console.log('[SYSTEM] れにの伝説 起動完了');
  } catch (e) {
    console.error('[FATAL] ゲームの初期化に失敗しました:', e);
  }
});
