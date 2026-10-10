import { GAME_WIDTH, GAME_HEIGHT, ITEMS, BOSS_NAMES } from '../config/constants.js';
import { gameState } from '../core/gameState.js';
import { audioSynth } from '../core/audioSynth.js';

const FONT_JP = '"DotGothic16", sans-serif';
const FONT_PX = '"Press Start 2P", monospace';
const MAX_HEARTS = 10;

const ITEM_ICONS = {
  [ITEMS.SWORD]: () => (gameState.hasMasterSword ? 'item-sword-master' : 'item-sword-normal'),
  [ITEMS.FIREROD]: () => 'item-firerod',
  [ITEMS.BOW]: () => 'item-bow',
  [ITEMS.MIRROR]: () => 'item-mirror'
};

/**
 * ゲーム画面内 HUD（神トラ風）
 * 左上: 魔力メーター・装備アイテム枠・矢の数 / 右上: ライフ
 * 中央: エリア名 / 下部: メッセージウィンドウ / 上部中央: ボスの体力
 */
export class HUDScene extends Phaser.Scene {
  constructor() {
    super('HUDScene');
  }

  create() {
    this.play = this.scene.get('PlayScene');

    // 上部の帯（読みやすさのための薄い影）
    const band = this.add.graphics();
    band.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0.55, 0.55, 0, 0);
    band.fillRect(0, 0, GAME_WIDTH, 58);

    this.createMagicMeter();
    this.createItemBox();
    this.createCounters();
    this.createHearts();
    this.createBossBar();
    this.createAreaTitle();
    this.createMessageBox();
    this.createIndicators();

    this.refresh();
    const unsubscribe = gameState.subscribe(() => this.refresh());
    const onMute = () => this.refreshMute();
    window.addEventListener('reni:mute', onMute);
    this.events.once('shutdown', () => {
      unsubscribe();
      window.removeEventListener('reni:mute', onMute);
    });
  }

  // ---------- 構築 ----------

  createMagicMeter() {
    const x = 14;
    const y = 8;
    const g = this.add.graphics();
    g.fillStyle(0x0d1017, 1).fillRoundedRect(x - 2, y - 2, 18, 46, 4);
    g.lineStyle(2, 0xfcfcfc, 1).strokeRoundedRect(x - 2, y - 2, 18, 46, 4);
    this.magicFill = this.add.graphics();
    this.magicRect = { x: x + 2, y: y + 2, w: 10, h: 38 };
    this.add.text(x + 7, y + 50, 'MP', { fontFamily: FONT_PX, fontSize: '7px', color: '#7ee787' }).setOrigin(0.5, 0);
  }

  createItemBox() {
    const x = 42;
    const y = 6;
    const g = this.add.graphics();
    g.fillStyle(0x0d1017, 0.9).fillRoundedRect(x, y, 44, 44, 6);
    g.lineStyle(3, 0xf0c828, 1).strokeRoundedRect(x, y, 44, 44, 6);
    g.lineStyle(1, 0x986808, 1).strokeRoundedRect(x + 3, y + 3, 38, 38, 4);
    this.itemIcon = this.add.image(x + 22, y + 22, 'item-sword-normal').setDisplaySize(30, 30);
    this.itemKey = this.add.text(x + 40, y + 40, '1', {
      fontFamily: FONT_PX, fontSize: '8px', color: '#ffffff', stroke: '#000000', strokeThickness: 3
    }).setOrigin(1, 1);
  }

  createCounters() {
    this.add.image(104, 18, 'hud-arrow');
    this.arrowText = this.add.text(116, 12, '00', {
      fontFamily: FONT_PX, fontSize: '11px', color: '#ffffff', stroke: '#000000', strokeThickness: 3
    });
    this.timeText = this.add.text(98, 34, '', {
      fontFamily: FONT_PX, fontSize: '7px', color: '#9aa4af'
    });
  }

  createHearts() {
    const right = GAME_WIDTH - 14;
    const left = right - MAX_HEARTS * 16;
    this.add.text((left + right) / 2, 6, '－ ライフ －', {
      fontFamily: FONT_JP, fontSize: '12px', color: '#ff8a8a', stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5, 0);
    this.hearts = [];
    for (let i = 0; i < MAX_HEARTS; i++) {
      this.hearts.push(this.add.image(left + 8 + i * 16, 32, 'hud-heart', 0));
    }
  }

  createBossBar() {
    this.bossGroup = this.add.container(GAME_WIDTH / 2, 30).setVisible(false);
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.7).fillRoundedRect(-124, -4, 248, 22, 4);
    bg.lineStyle(2, 0xfcfcfc, 1).strokeRect(-110, 6, 220, 8);
    this.bossName = this.add.text(0, -2, '', {
      fontFamily: FONT_JP, fontSize: '11px', color: '#ffb4b4', stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5, 0.5);
    this.bossFill = this.add.graphics();
    this.bossGroup.add([bg, this.bossFill, this.bossName]);
    this.bossShownRatio = 1;
  }

  createAreaTitle() {
    this.areaSub = this.add.text(GAME_WIDTH / 2, 118, '', {
      fontFamily: FONT_PX, fontSize: '10px', color: '#ffffff', stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5).setAlpha(0);
    this.areaText = this.add.text(GAME_WIDTH / 2, 146, '', {
      fontFamily: FONT_JP, fontSize: '30px', color: '#ffd700', stroke: '#000000', strokeThickness: 7
    }).setOrigin(0.5).setAlpha(0);
  }

  createMessageBox() {
    const w = 620;
    const h = 64;
    const x = (GAME_WIDTH - w) / 2;
    const y = GAME_HEIGHT - h - 14;
    this.msgBox = this.add.container(0, 0).setVisible(false);
    const g = this.add.graphics();
    g.fillStyle(0x0b1a4a, 0.92).fillRoundedRect(x, y, w, h, 8);
    g.lineStyle(3, 0xfcfcfc, 1).strokeRoundedRect(x, y, w, h, 8);
    g.lineStyle(1, 0x58c8e8, 1).strokeRoundedRect(x + 4, y + 4, w - 8, h - 8, 6);
    this.msgText = this.add.text(x + 20, y + 14, '', {
      fontFamily: FONT_JP, fontSize: '17px', color: '#ffffff', lineSpacing: 6,
      wordWrap: { width: w - 40, useAdvancedWrap: true }
    });
    this.msgBox.add([g, this.msgText]);
  }

  createIndicators() {
    this.savedText = this.add.text(GAME_WIDTH - 12, GAME_HEIGHT - 10, '● SAVE', {
      fontFamily: FONT_PX, fontSize: '8px', color: '#7ee787', stroke: '#000000', strokeThickness: 3
    }).setOrigin(1, 1).setAlpha(0);
    this.muteText = this.add.text(12, GAME_HEIGHT - 10, '♪ OFF [M]', {
      fontFamily: FONT_PX, fontSize: '8px', color: '#ff8a8a', stroke: '#000000', strokeThickness: 3
    }).setOrigin(0, 1);
    this.refreshMute();
  }

  // ---------- 更新 ----------

  refresh() {
    if (!this.hearts) return;
    const gs = gameState;

    // ライフ
    const total = Math.min(MAX_HEARTS, Math.ceil(gs.playerMaxHealth / 2));
    this.hearts.forEach((h, i) => {
      h.setVisible(i < total);
      const hp = gs.playerHealth - i * 2;
      h.setFrame(hp >= 2 ? 0 : hp === 1 ? 1 : 2);
    });

    // 魔力
    const r = this.magicRect;
    const ratio = Phaser.Math.Clamp(gs.playerMagic / gs.playerMaxMagic, 0, 1);
    const fillH = Math.round(r.h * ratio);
    this.magicFill.clear();
    this.magicFill.fillStyle(0x0e481c, 1).fillRect(r.x, r.y, r.w, r.h);
    this.magicFill.fillStyle(0x34b04c, 1).fillRect(r.x, r.y + r.h - fillH, r.w, fillH);
    this.magicFill.fillStyle(0x78e888, 1).fillRect(r.x, r.y + r.h - fillH, 3, fillH);

    // 装備
    const icon = (ITEM_ICONS[gs.selectedItem] || ITEM_ICONS[ITEMS.SWORD])();
    this.itemIcon.setTexture(icon).setDisplaySize(30, 30);
    this.itemKey.setText(String(gs.selectedItem));

    // 矢
    this.arrowText.setText(String(gs.playerArrows).padStart(2, '0'));
    this.arrowText.setColor(gs.hasBow ? '#ffffff' : '#6b6b6b');
  }

  refreshMute() {
    if (this.muteText) this.muteText.setVisible(audioSynth.isMuted);
  }

  update() {
    const t = Math.floor(gameState.playTime);
    const hh = Math.floor(t / 3600);
    const mm = String(Math.floor((t % 3600) / 60)).padStart(2, '0');
    const ss = String(t % 60).padStart(2, '0');
    this.timeText.setText(hh > 0 ? `${hh}:${mm}:${ss}` : `${mm}:${ss}`);

    // ボスの体力ゲージ（PlayScene のボスを監視）
    const boss = this.play && this.play.boss;
    if (boss && boss.active) {
      if (!this.bossGroup.visible) {
        this.bossGroup.setVisible(true);
        this.bossShownRatio = 1;
      }
      this.bossName.setText(BOSS_NAMES[boss.type] || '');
      const target = Math.max(0, boss.health / boss.maxHealth);
      this.bossShownRatio += (target - this.bossShownRatio) * 0.15;
      this.bossFill.clear();
      this.bossFill.fillStyle(0x3a0d0d, 1).fillRect(-109, 7, 218, 6);
      this.bossFill.fillStyle(0xffd0a0, 1).fillRect(-109, 7, 218 * this.bossShownRatio, 6);
      this.bossFill.fillStyle(0xe83030, 1).fillRect(-109, 7, 218 * target, 6);
    } else if (this.bossGroup.visible) {
      this.bossGroup.setVisible(false);
    }
  }

  // ---------- 外部から呼ばれる演出 ----------

  /** エリア名を画面中央に表示 */
  showArea(name, color = '#ffd700', sub = '') {
    if (!this.areaText) return;
    this.tweens.killTweensOf([this.areaText, this.areaSub]);
    this.areaText.setText(name).setColor(color).setAlpha(0).setY(156);
    this.areaSub.setText(sub).setAlpha(0);
    this.tweens.add({ targets: this.areaText, alpha: 1, y: 146, duration: 450, ease: 'Quad.easeOut' });
    if (sub) this.tweens.add({ targets: this.areaSub, alpha: 1, duration: 450 });
    this.tweens.add({ targets: [this.areaText, this.areaSub], alpha: 0, delay: 1900, duration: 600 });
  }

  /** 下部メッセージウィンドウ（文字送り付き） */
  showMessage(message) {
    if (!this.msgBox) return;
    if (this.msgTimer) this.msgTimer.remove(false);
    if (this.msgHide) this.msgHide.remove(false);
    this.tweens.killTweensOf(this.msgBox);

    this.msgBox.setVisible(true).setAlpha(1);
    this.msgText.setText('');
    const chars = Array.from(message);
    let i = 0;
    this.msgTimer = this.time.addEvent({
      delay: 22,
      repeat: chars.length - 1,
      callback: () => {
        i++;
        this.msgText.setText(chars.slice(0, i).join(''));
        if (i % 2 === 0) audioSynth.playText();
        if (i >= chars.length) {
          this.msgHide = this.time.delayedCall(2200, () => {
            this.tweens.add({
              targets: this.msgBox,
              alpha: 0,
              duration: 250,
              onComplete: () => this.msgBox.setVisible(false)
            });
          });
        }
      }
    });
  }

  flashSaved() {
    if (!this.savedText) return;
    this.tweens.killTweensOf(this.savedText);
    this.savedText.setAlpha(1);
    this.tweens.add({ targets: this.savedText, alpha: 0, delay: 1200, duration: 500 });
  }
}
