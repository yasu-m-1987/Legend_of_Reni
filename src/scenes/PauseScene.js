import { GAME_WIDTH, GAME_HEIGHT, WORLD_INFO } from '../config/constants.js';
import { gameState } from '../core/gameState.js';
import { audioSynth } from '../core/audioSynth.js';

const FONT_JP = '"DotGothic16", sans-serif';
const FONT_PX = '"Press Start 2P", monospace';

export function formatPlayTime(seconds) {
  const t = Math.floor(seconds);
  const h = Math.floor(t / 3600);
  const m = String(Math.floor((t % 3600) / 60)).padStart(2, '0');
  const s = String(t % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

/**
 * ポーズメニュー（PlayScene を一時停止して重ねて表示）
 */
export class PauseScene extends Phaser.Scene {
  constructor() {
    super('PauseScene');
  }

  create() {
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.6).setOrigin(0);

    const px = 90;
    const py = 70;
    const pw = GAME_WIDTH - 180;
    const ph = GAME_HEIGHT - 140;
    const g = this.add.graphics();
    g.fillStyle(0x0b1a4a, 0.95).fillRoundedRect(px, py, pw, ph, 10);
    g.lineStyle(3, 0xfcfcfc, 1).strokeRoundedRect(px, py, pw, ph, 10);
    g.lineStyle(1, 0x58c8e8, 1).strokeRoundedRect(px + 5, py + 5, pw - 10, ph - 10, 7);
    g.lineStyle(1, 0x58c8e8, 0.6).lineBetween(px + 300, py + 56, px + 300, py + ph - 20);

    this.add.text(GAME_WIDTH / 2, py + 26, 'PAUSE', {
      fontFamily: FONT_PX, fontSize: '16px', color: '#ffd700', stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5);

    // ---- 左: メニュー ----
    this.options = [
      { label: () => 'つづける', action: () => this.resume() },
      { label: () => 'セーブする', action: () => this.save() },
      { label: () => `サウンド：${audioSynth.isMuted ? 'OFF' : 'ON'}`, action: () => { audioSynth.toggleMute(); this.renderMenu(); } },
      { label: () => 'セーブしてタイトルへ', action: () => this.quitToTitle() }
    ];
    this.cursor = 0;
    this.optionTexts = this.options.map((opt, i) => this.add.text(px + 56, py + 80 + i * 44, '', {
      fontFamily: FONT_JP, fontSize: '20px', color: '#ffffff'
    }).setInteractive({ useHandCursor: true })
      .on('pointerover', () => { this.cursor = i; this.renderMenu(); })
      .on('pointerdown', () => this.choose()));
    this.cursorText = this.add.text(px + 30, 0, '▶', { fontFamily: FONT_JP, fontSize: '18px', color: '#ffd700' });
    this.tweens.add({ targets: this.cursorText, x: px + 36, duration: 300, yoyo: true, repeat: -1 });
    this.statusText = this.add.text(px + 30, py + ph - 40, '', { fontFamily: FONT_JP, fontSize: '14px', color: '#7ee787' });

    // ---- 右: 持ち物・記録 ----
    const rx = px + 324;
    const items = [
      ['item-sword-normal', gameState.hasMasterSword ? 'マスターソード' : 'れにの剣', true],
      ['item-firerod', 'ファイアロッド', gameState.hasFireRod],
      ['item-bow', '弓矢', gameState.hasBow],
      ['item-mirror', 'マジックミラー', true],
      ['portal', 'ムーンパール', gameState.hasMoonPearl]
    ];
    if (gameState.hasMasterSword) items[0][0] = 'item-sword-master';
    this.add.text(rx, py + 62, 'もちもの', { fontFamily: FONT_JP, fontSize: '14px', color: '#58c8e8' });
    items.forEach(([tex, name, owned], i) => {
      const y = py + 96 + i * 30;
      const icon = this.add.image(rx + 14, y, tex).setDisplaySize(24, 24);
      const label = this.add.text(rx + 34, y, owned ? name : '？？？', {
        fontFamily: FONT_JP, fontSize: '15px', color: owned ? '#ffffff' : '#6b7280'
      }).setOrigin(0, 0.5);
      if (!owned) { icon.setTint(0x222222); label.setAlpha(0.8); }
    });

    const info = WORLD_INFO[gameState.currentWorld];
    const record = [
      `いまいる場所：${info ? info.name : '-'}`,
      `プレイ時間：${formatPlayTime(gameState.playTime)}`,
      `たおしたボス：${gameState.defeatedBosses.size} / 4`,
      `やられた回数：${gameState.deathCount}`
    ];
    this.add.text(rx, py + 252, record.join('\n'), {
      fontFamily: FONT_JP, fontSize: '13px', color: '#c8d0da', lineSpacing: 6
    });

    this.add.text(GAME_WIDTH / 2, py + ph + 22, '↑↓：えらぶ　Enter/Space：決定　Esc/P：とじる　M：サウンド', {
      fontFamily: FONT_JP, fontSize: '12px', color: '#9aa4af'
    }).setOrigin(0.5);

    // ---- 入力 ----
    const kb = this.input.keyboard;
    const move = (d) => {
      this.cursor = (this.cursor + d + this.options.length) % this.options.length;
      audioSynth.playCursor();
      this.renderMenu();
    };
    kb.on('keydown-UP', () => move(-1));
    kb.on('keydown-W', () => move(-1));
    kb.on('keydown-DOWN', () => move(1));
    kb.on('keydown-S', () => move(1));
    kb.on('keydown-ENTER', () => this.choose());
    kb.on('keydown-SPACE', () => this.choose());
    kb.on('keydown-J', () => this.choose());
    kb.on('keydown-ESC', () => this.resume());
    kb.on('keydown-P', () => this.resume());

    this.renderMenu();
  }

  renderMenu() {
    this.optionTexts.forEach((t, i) => {
      t.setText(this.options[i].label());
      t.setColor(i === this.cursor ? '#ffd700' : '#ffffff');
    });
    this.cursorText.setY(this.optionTexts[this.cursor].y + 2);
  }

  choose() {
    this.options[this.cursor].action();
  }

  resume() {
    audioSynth.playCursor();
    this.scene.resume('PlayScene');
    this.scene.stop();
  }

  save() {
    if (gameState.save()) {
      audioSynth.playConfirm();
      this.statusText.setText('冒険の記録をセーブしました').setColor('#7ee787');
    } else {
      audioSynth.playError();
      this.statusText.setText('セーブできませんでした').setColor('#ff8a8a');
    }
  }

  quitToTitle() {
    gameState.save();
    audioSynth.playConfirm();
    audioSynth.fadeOutBGM(0.4);
    this.scene.stop('HUDScene');
    this.scene.stop('PlayScene');
    this.scene.start('TitleScene');
  }
}
