import { STATES } from '../config/constants.js';
import { gameState } from '../core/gameState.js';
import { uiManager } from '../ui/UIManager.js';
import { audioSynth } from '../core/audioSynth.js';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  create() {
    audioSynth.stopBGM();
    audioSynth.playHurt();

    uiManager.update(STATES.GAMEOVER);

    const retryBtn = document.getElementById('retry-btn');
    if (retryBtn) {
      retryBtn.onclick = () => {
        gameState.reset();
        this.scene.start('PlayScene');
      };
    }

    this.input.keyboard.once('keydown-ENTER', () => {
      gameState.reset();
      this.scene.start('PlayScene');
    });
  }
}
