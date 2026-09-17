import { STATES } from '../config/constants.js';
import { gameState } from '../core/gameState.js';
import { uiManager } from '../ui/UIManager.js';
import { audioSynth } from '../core/audioSynth.js';

export class ClearScene extends Phaser.Scene {
  constructor() {
    super('ClearScene');
  }

  create() {
    audioSynth.stopBGM();
    audioSynth.playFanfare();

    uiManager.update(STATES.CLEAR);

    const restartBtn = document.getElementById('restart-btn');
    if (restartBtn) {
      restartBtn.onclick = () => {
        gameState.reset();
        this.scene.start('TitleScene');
      };
    }

    this.input.keyboard.once('keydown-ENTER', () => {
      gameState.reset();
      this.scene.start('TitleScene');
    });
  }
}
