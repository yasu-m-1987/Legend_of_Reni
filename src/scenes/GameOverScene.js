import { STATES, GAME_WIDTH } from '../config/constants.js';
import { gameState } from '../core/gameState.js';
import { uiManager } from '../ui/UIManager.js';
import { audioSynth } from '../core/audioSynth.js';

const FONT_JP = '"DotGothic16", sans-serif';
const FONT_PX = '"Press Start 2P", monospace';

/**
 * ゲームオーバー（神トラ風：つづける / タイトルへ）
 * 「つづける」は集めたアイテム・倒したボスを保ったまま、そのエリアの入口から再開
 */
export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  create() {
    audioSynth.stopBGM();
    audioSynth.playGameOver();
    uiManager.update(STATES.GAMEOVER);

    this.cameras.main.setBackgroundColor('#000000');
    this.cameras.main.fadeIn(800, 0, 0, 0);

    const title = this.add.text(GAME_WIDTH / 2, 150, 'GAME OVER', {
      fontFamily: FONT_PX, fontSize: '32px', color: '#e83030', stroke: '#2a0000', strokeThickness: 8
    }).setOrigin(0.5).setAlpha(0);
    this.tweens.add({ targets: title, alpha: 1, y: 160, duration: 1200, ease: 'Quad.easeOut' });

    this.add.image(GAME_WIDTH / 2, 230, 'reni-walk', 0).setScale(3).setAngle(90).setTint(0x8a8a8a);
    this.add.text(GAME_WIDTH / 2, 280, 'れには力尽きてしまった…', {
      fontFamily: FONT_JP, fontSize: '16px', color: '#c8d0da'
    }).setOrigin(0.5);

    this.items = [
      { label: 'つづける', action: () => this.continueGame() },
      { label: 'タイトルへもどる', action: () => this.toTitle() }
    ];
    this.cursor = 0;
    this.texts = this.items.map((item, i) => this.add.text(GAME_WIDTH / 2 - 70, 340 + i * 40, item.label, {
      fontFamily: FONT_JP, fontSize: '22px', color: '#ffffff'
    }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true })
      .on('pointerover', () => { this.cursor = i; this.render(); })
      .on('pointerdown', () => this.items[i].action()));
    this.mark = this.add.text(0, 0, '▶', { fontFamily: FONT_JP, fontSize: '20px', color: '#ffd700' }).setOrigin(0, 0.5);
    this.render();

    this.locked = true;
    this.time.delayedCall(900, () => { this.locked = false; });

    const kb = this.input.keyboard;
    const move = (d) => { this.cursor = (this.cursor + d + this.items.length) % this.items.length; audioSynth.playCursor(); this.render(); };
    kb.on('keydown-UP', () => move(-1));
    kb.on('keydown-W', () => move(-1));
    kb.on('keydown-DOWN', () => move(1));
    kb.on('keydown-S', () => move(1));
    const choose = () => { if (!this.locked) this.items[this.cursor].action(); };
    kb.on('keydown-ENTER', choose);
    kb.on('keydown-SPACE', choose);
    kb.on('keydown-J', choose);
  }

  render() {
    this.texts.forEach((t, i) => t.setColor(i === this.cursor ? '#ffd700' : '#ffffff'));
    const t = this.texts[this.cursor];
    this.mark.setPosition(t.x - 28, t.y);
  }

  continueGame() {
    if (this.locked) return;
    this.locked = true;
    // ライフ 3 つ分・魔力全快で再開
    gameState.playerHealth = Math.min(gameState.playerMaxHealth, 6);
    gameState.playerMagic = gameState.playerMaxMagic;
    gameState.notify();
    gameState.save();
    audioSynth.playConfirm();
    this.cameras.main.fade(500, 0, 0, 0, true);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('PlayScene'));
  }

  toTitle() {
    if (this.locked) return;
    this.locked = true;
    audioSynth.playConfirm();
    this.cameras.main.fade(500, 0, 0, 0, true);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('TitleScene'));
  }
}
