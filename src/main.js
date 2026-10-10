import { TitleScene } from './scenes/TitleScene.js';
import { PlayScene } from './scenes/PlayScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';
import { ClearScene } from './scenes/ClearScene.js';
import { HUDScene } from './scenes/HUDScene.js';
import { PauseScene } from './scenes/PauseScene.js';
import { GAME_WIDTH, GAME_HEIGHT } from './config/constants.js';
import { audioSynth } from './core/audioSynth.js';

/**
 * 『れにの伝説 (Legend of Reni)』エントリーポイント
 */
const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  // 配列の順番が描画順（HUD・ポーズはプレイ画面の上に重ねる）
  scene: [TitleScene, PlayScene, HUDScene, PauseScene, GameOverScene, ClearScene]
};

// M キーでいつでもサウンド ON/OFF
window.addEventListener('keydown', (e) => {
  if (e.code === 'KeyM' && !e.repeat) audioSynth.toggleMute();
});

window.addEventListener('DOMContentLoaded', () => {
  try {
    const game = new Phaser.Game(config);
    window.__RENI_GAME__ = game;
    console.log('[SYSTEM] れにの伝説 起動完了');
  } catch (e) {
    console.error('[FATAL] ゲームの初期化に失敗しました:', e);
  }
});
