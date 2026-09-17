import { buildAllTextures } from '../config/assets/textures.js';
import { audioSynth } from '../core/audioSynth.js';
import { STATES } from '../config/constants.js';
import { uiManager } from '../ui/UIManager.js';

/**
 * タイトルシーン（神トラ風演出）
 */
export class TitleScene extends Phaser.Scene {
  constructor() {
    super('TitleScene');
  }

  preload() {
    buildAllTextures(this);
  }

  create() {
    uiManager.update(STATES.TITLE);

    // 背景色（神トラ冒頭の暗夜風）
    this.cameras.main.setBackgroundColor('#0d1117');

    // トライフォース風の三角形演出
    const triGraphics = this.add.graphics();
    triGraphics.lineStyle(4, 0xffd700, 0.8);
    triGraphics.beginPath();
    triGraphics.moveTo(400, 160);
    triGraphics.lineTo(330, 280);
    triGraphics.lineTo(470, 280);
    triGraphics.closePath();
    triGraphics.strokePath();

    this.tweens.add({
      targets: triGraphics,
      alpha: 0.3,
      duration: 1000,
      yoyo: true,
      repeat: -1
    });

    // プレイヤー「れに」のドット絵を中央に表示
    const reni = this.add.sprite(400, 240, 'reni-walk', 0).setScale(4);
    this.tweens.add({
      targets: reni,
      y: 232,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // タイトルロゴテキスト
    this.add.text(400, 100, 'れ に の 伝 説', {
      fontFamily: '"Press Start 2P", "DotGothic16", monospace',
      fontSize: '32px',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 8
    }).setOrigin(0.5);

    this.add.text(400, 140, '- A Link to the Past -', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '14px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // スタート案内
    const startTxt = this.add.text(400, 360, 'PRESS ENTER / CLICK TO START', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '16px',
      color: '#ffd700'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: startTxt,
      alpha: 0.2,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    // キー入力またはクリックでゲーム開始
    const startGame = () => {
      audioSynth.playFanfare();
      this.cameras.main.fade(500, 0, 0, 0, false, (cam, progress) => {
        if (progress === 1) {
          this.scene.start('PlayScene');
        }
      });
    };

    this.input.keyboard.once('keydown-ENTER', startGame);
    this.input.keyboard.once('keydown-SPACE', startGame);
    this.input.once('pointerdown', startGame);
  }
}
