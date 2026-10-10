import { buildAllTextures } from '../config/assets/textures.js';
import { audioSynth } from '../core/audioSynth.js';
import { gameState } from '../core/gameState.js';
import { GAME_WIDTH, GAME_HEIGHT, WORLD_INFO, STATES } from '../config/constants.js';
import { uiManager } from '../ui/UIManager.js';
import { formatPlayTime } from './PauseScene.js';

const FONT_JP = '"DotGothic16", sans-serif';
const FONT_PX = '"Press Start 2P", monospace';

/**
 * タイトルシーン（神トラ風：トライフォースが集まるオープニング → ファイル選択）
 */
export class TitleScene extends Phaser.Scene {
  constructor() {
    super('TitleScene');
  }

  preload() {
    buildAllTextures(this);
  }

  create() {
    uiManager.setScene(this);
    uiManager.update(STATES.TITLE);
    this.phase = 'intro';
    this.assembled = false;
    this.cameras.main.setBackgroundColor('#06070d');
    this.cameras.main.fadeIn(600, 0, 0, 0);

    this.createStarfield();
    this.createTriforce();
    this.createLogo();

    // 「れに」
    this.reni = this.add.sprite(GAME_WIDTH / 2, 352, 'reni-walk', 0).setScale(3).setAlpha(0);
    this.reniShadow = this.add.image(GAME_WIDTH / 2, 378, 'shadow').setScale(2).setAlpha(0);
    if (!this.anims.exists('title-walk')) {
      this.anims.create({
        key: 'title-walk',
        frames: [{ key: 'reni-walk', frame: 0 }, { key: 'reni-walk', frame: 1 }],
        frameRate: 4,
        repeat: -1
      });
    }
    this.reni.play('title-walk');

    this.pressText = this.add.text(GAME_WIDTH / 2, 420, 'PRESS ENTER', {
      fontFamily: FONT_PX, fontSize: '14px', color: '#ffd700', stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5).setAlpha(0);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 12, '© 2026 れにの伝説 製作委員会', {
      fontFamily: FONT_JP, fontSize: '11px', color: '#58626f'
    }).setOrigin(0.5, 1);

    // ---- 入力 ----
    const kb = this.input.keyboard;
    kb.on('keydown-ENTER', () => this.onConfirm());
    kb.on('keydown-SPACE', () => this.onConfirm());
    kb.on('keydown-J', () => this.onConfirm());
    kb.on('keydown-UP', () => this.moveCursor(-1));
    kb.on('keydown-W', () => this.moveCursor(-1));
    kb.on('keydown-DOWN', () => this.moveCursor(1));
    kb.on('keydown-S', () => this.moveCursor(1));
    this.input.on('pointerdown', () => { if (this.phase !== 'menu') this.onConfirm(); });
  }

  createStarfield() {
    for (let i = 0; i < 40; i++) {
      const star = this.add.image(
        Phaser.Math.Between(0, GAME_WIDTH),
        Phaser.Math.Between(0, GAME_HEIGHT),
        'px-glow'
      ).setScale(Phaser.Math.FloatBetween(0.15, 0.4)).setAlpha(Phaser.Math.FloatBetween(0.2, 0.8));
      this.tweens.add({
        targets: star,
        alpha: 0.1,
        duration: Phaser.Math.Between(800, 2200),
        yoyo: true,
        repeat: -1,
        delay: Phaser.Math.Between(0, 1500)
      });
    }
  }

  /** 3 つの三角形が回転しながら集まって 1 つのトライフォースになる */
  createTriforce() {
    const cx = GAME_WIDTH / 2;
    const top = 70;
    this.triTargets = [
      { x: cx, y: top + 28 },
      { x: cx - 32, y: top + 84 },
      { x: cx + 32, y: top + 84 }
    ];
    const starts = [
      { x: cx, y: -80, angle: -540 },
      { x: -80, y: GAME_HEIGHT + 60, angle: 540 },
      { x: GAME_WIDTH + 80, y: GAME_HEIGHT + 60, angle: -360 }
    ];
    this.triforce = this.triTargets.map((t, i) => {
      const tri = this.add.image(starts[i].x, starts[i].y, 'tri-gold').setAngle(starts[i].angle).setScale(0.6);
      this.tweens.add({
        targets: tri,
        x: t.x,
        y: t.y,
        angle: 0,
        scale: 1,
        duration: 2000,
        ease: 'Cubic.easeOut',
        onComplete: () => { if (i === 0) this.onTriforceAssembled(); }
      });
      return tri;
    });
  }

  createLogo() {
    this.logo = this.add.text(GAME_WIDTH / 2, 250, 'れにの伝説', {
      fontFamily: FONT_JP, fontSize: '52px', color: '#ffd700', stroke: '#3a1f00', strokeThickness: 10
    }).setOrigin(0.5).setAlpha(0).setScale(1.3);
    this.logo.setShadow(0, 4, '#000000', 0, true, true);
    this.subtitle = this.add.text(GAME_WIDTH / 2, 294, '～ A Link to the Past ～', {
      fontFamily: FONT_PX, fontSize: '11px', color: '#ffffff', stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5).setAlpha(0);
  }

  onTriforceAssembled() {
    if (this.assembled) return;
    this.assembled = true;

    // スキップされた場合も正しい位置にそろえる
    this.triforce.forEach((tri, i) => {
      this.tweens.killTweensOf(tri);
      tri.setPosition(this.triTargets[i].x, this.triTargets[i].y).setAngle(0).setScale(1);
    });

    this.cameras.main.flash(500, 255, 255, 220);
    this.tweens.add({ targets: this.logo, alpha: 1, scale: 1, duration: 500, ease: 'Back.easeOut' });
    this.tweens.add({ targets: this.subtitle, alpha: 1, duration: 500, delay: 300 });
    this.tweens.add({ targets: [this.reni, this.reniShadow], alpha: 1, duration: 500, delay: 500 });
    this.tweens.add({ targets: this.reni, y: 346, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.time.delayedCall(700, () => {
      if (this.phase !== 'intro' && this.phase !== 'press') return;
      this.phase = 'press';
      this.pressText.setAlpha(1);
      this.tweens.add({ targets: this.pressText, alpha: 0.2, duration: 500, yoyo: true, repeat: -1 });
    });
    // トライフォースのきらめき
    this.triforce.forEach((tri, i) => {
      this.tweens.add({ targets: tri, alpha: 0.75, duration: 900, yoyo: true, repeat: -1, delay: i * 300 });
    });
  }

  onConfirm() {
    if (this.phase === 'intro') {
      // 演出をスキップ
      this.onTriforceAssembled();
      return;
    }
    if (this.phase === 'press') {
      // ブラウザの自動再生制限のため、最初の操作で音声を有効化する
      audioSynth.resume();
      audioSynth.startBGM('title');
      audioSynth.playConfirm();
      this.showMenu();
      return;
    }
    if (this.phase === 'menu') {
      this.menuItems[this.cursor].action();
    }
  }

  showMenu() {
    this.phase = 'menu';
    this.tweens.killTweensOf(this.pressText);
    this.pressText.setVisible(false);
    this.tweens.add({ targets: [this.reni, this.reniShadow], x: '-=230', duration: 400, ease: 'Quad.easeOut' });

    const save = gameState.peekSave();
    this.menuItems = [];
    if (save) this.menuItems.push({ label: 'つづきから', action: () => this.startGame(true) });
    this.menuItems.push({ label: 'はじめから', action: () => this.startGame(false) });

    const baseY = 344;
    this.cursor = 0;
    this.menuTexts = this.menuItems.map((item, i) => this.add.text(GAME_WIDTH / 2 - 70, baseY + i * 38, item.label, {
      fontFamily: FONT_JP, fontSize: '22px', color: '#ffffff', stroke: '#000000', strokeThickness: 4
    }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true })
      .on('pointerover', () => { if (this.cursor !== i) { this.cursor = i; this.renderMenu(); audioSynth.playCursor(); } })
      .on('pointerdown', () => { this.cursor = i; this.menuItems[i].action(); }));

    this.cursorMark = this.add.text(0, 0, '▶', { fontFamily: FONT_JP, fontSize: '20px', color: '#ffd700' }).setOrigin(0, 0.5);

    if (save) {
      const info = WORLD_INFO[save.currentWorld];
      const hearts = Math.ceil(save.playerMaxHealth / 2);
      this.add.text(GAME_WIDTH / 2 + 70, baseY, `${info ? info.name : ''}  ♥×${hearts}  ${formatPlayTime(save.playTime || 0)}`, {
        fontFamily: FONT_JP, fontSize: '13px', color: '#9aa4af'
      }).setOrigin(0, 0.5);
    }
    this.renderMenu();
  }

  moveCursor(d) {
    if (this.phase !== 'menu' || this.menuItems.length < 2) return;
    this.cursor = (this.cursor + d + this.menuItems.length) % this.menuItems.length;
    audioSynth.playCursor();
    this.renderMenu();
  }

  renderMenu() {
    this.menuTexts.forEach((t, i) => t.setColor(i === this.cursor ? '#ffd700' : '#ffffff'));
    const t = this.menuTexts[this.cursor];
    this.cursorMark.setPosition(t.x - 28, t.y);
  }

  startGame(continueGame) {
    if (this.phase === 'starting') return;
    this.phase = 'starting';

    const loaded = continueGame && gameState.load();
    if (!loaded) gameState.reset();

    audioSynth.playFanfare();
    audioSynth.fadeOutBGM(0.6);
    this.cameras.main.fade(700, 0, 0, 0, true);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('PlayScene', { intro: !loaded });
    });
  }
}
