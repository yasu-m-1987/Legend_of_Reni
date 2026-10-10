import { STATES, GAME_WIDTH, GAME_HEIGHT } from '../config/constants.js';
import { gameState } from '../core/gameState.js';
import { uiManager } from '../ui/UIManager.js';
import { audioSynth } from '../core/audioSynth.js';
import { formatPlayTime } from './PauseScene.js';

const FONT_JP = '"DotGothic16", sans-serif';
const FONT_PX = '"Press Start 2P", monospace';

const STORY = [
  '魔王ガノンは倒れ、',
  'トライフォースの光がハイラルに戻った。',
  '',
  '闇に包まれていた世界は元の姿を取り戻し、',
  '人々は小さな勇者の名を語り継いだ。',
  '',
  'キジトラ猫の「れに」――',
  'その伝説は、ここから始まる。'
];

/**
 * エンディング（スタッフロール風の物語＋プレイ記録）
 */
export class ClearScene extends Phaser.Scene {
  constructor() {
    super('ClearScene');
  }

  create() {
    audioSynth.stopBGM();
    audioSynth.startBGM('ending');
    uiManager.update(STATES.CLEAR);

    this.cameras.main.setBackgroundColor('#06070d');
    this.cameras.main.fadeIn(1500, 255, 255, 255);

    // 光の粒
    for (let i = 0; i < 30; i++) {
      const p = this.add.image(Phaser.Math.Between(0, GAME_WIDTH), Phaser.Math.Between(0, GAME_HEIGHT), 'px-glow')
        .setTint(0xffe58a).setScale(Phaser.Math.FloatBetween(0.2, 0.5)).setAlpha(0.6);
      this.tweens.add({
        targets: p,
        y: p.y - 80,
        alpha: 0,
        duration: Phaser.Math.Between(3000, 6000),
        repeat: -1,
        delay: Phaser.Math.Between(0, 3000)
      });
    }

    // トライフォース
    const cx = GAME_WIDTH / 2;
    [[cx, 64], [cx - 32, 120], [cx + 32, 120]].forEach(([x, y], i) => {
      const tri = this.add.image(x, y, 'tri-gold');
      this.tweens.add({ targets: tri, alpha: 0.7, duration: 1000, yoyo: true, repeat: -1, delay: i * 300 });
    });

    // 物語（1 行ずつフェードイン）
    STORY.forEach((line, i) => {
      const t = this.add.text(cx, 178 + i * 24, line, {
        fontFamily: FONT_JP, fontSize: '17px', color: '#ffffff', stroke: '#000000', strokeThickness: 3
      }).setOrigin(0.5).setAlpha(0);
      this.tweens.add({ targets: t, alpha: 1, duration: 800, delay: 1200 + i * 700 });
    });

    const afterStory = 1200 + STORY.length * 700 + 600;

    const stats = this.add.text(cx, 392, [
      `プレイ時間  ${formatPlayTime(gameState.playTime)}`,
      `やられた回数  ${gameState.deathCount}`
    ].join('     '), {
      fontFamily: FONT_JP, fontSize: '14px', color: '#9aa4af'
    }).setOrigin(0.5).setAlpha(0);
    this.tweens.add({ targets: stats, alpha: 1, duration: 800, delay: afterStory });

    const end = this.add.text(cx, 430, 'THE END', {
      fontFamily: FONT_PX, fontSize: '20px', color: '#ffd700', stroke: '#000000', strokeThickness: 5
    }).setOrigin(0.5).setAlpha(0);
    this.tweens.add({ targets: end, alpha: 1, duration: 1000, delay: afterStory + 400 });

    const hint = this.add.text(cx, GAME_HEIGHT - 10, 'PRESS ENTER', {
      fontFamily: FONT_PX, fontSize: '9px', color: '#ffffff'
    }).setOrigin(0.5, 1).setAlpha(0);

    this.canLeave = false;
    this.time.delayedCall(afterStory + 1500, () => {
      this.canLeave = true;
      hint.setAlpha(1);
      this.tweens.add({ targets: hint, alpha: 0.2, duration: 600, yoyo: true, repeat: -1 });
    });

    const leave = () => {
      if (!this.canLeave) return;
      this.canLeave = false;
      audioSynth.playConfirm();
      audioSynth.fadeOutBGM(1);
      this.cameras.main.fade(1000, 0, 0, 0, true);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('TitleScene'));
    };
    this.input.keyboard.on('keydown-ENTER', leave);
    this.input.keyboard.on('keydown-SPACE', leave);
    this.input.on('pointerdown', leave);
  }
}
