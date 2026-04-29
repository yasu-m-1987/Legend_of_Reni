// ========================================
// BIOHAZARD RENI - Game Scene (Main Gameplay)
// ========================================
import { Scene } from '../core/Game.js';
import {
  GAME_WIDTH, GAME_HEIGHT, COLORS, CHARACTERS, WEAPONS,
  CREATURE_TYPES, CREATURE_ARRIVE_X,
  CREATURE_SPAWN_X_MIN, CREATURE_SPAWN_X_MAX,
  CREATURE_Y_MIN, CREATURE_Y_MAX,
  COMBO_BONUS_THRESHOLD, COMBO_TIME_BONUS,
  BITE_PENALTY, AUDIO, MUTATION_TIME_RATIO,
} from '../utils/constants.js';
import { RomajiMatcher, toRomaji } from '../utils/romanizer.js';
import { ZombieFeline } from '../entities/ZombieFeline.js';
import { Cerberus } from '../entities/Cerberus.js';
import { Tyrant } from '../entities/Tyrant.js';
import { Rain } from '../effects/Rain.js';
import { Lightning } from '../effects/Lightning.js';
import { NeonGlow } from '../effects/NeonGlow.js';
import { MuzzleFlash } from '../effects/MuzzleFlash.js';
import { ScreenShake } from '../effects/ScreenShake.js';
import { createStageBackground } from '../effects/StageBackground.js';
import { HUD } from '../ui/HUD.js';

export class GameScene extends Scene {
  constructor() {
    super();
    this.hud = new HUD();
  }

  async enter(data) {
    this.mode = data.mode;
    this.character = data.character || CHARACTERS.RENI;
    this.words = [...data.words];
    this.usedWords = [];

    // Character abilities
    this.comboThreshold = this.character.comboThresholdOverride || COMBO_BONUS_THRESHOLD;
    this.comboBonusExtra = this.character.comboBonusExtra || 0;
    this.bitePenaltyReduction = this.character.bitePenaltyReduction || 0;
    this.killTimeBonus = this.character.killTimeBonus || 0;

    // State
    this.timeRemaining = this.mode.timeLimit;
    this.totalTime = this.mode.timeLimit;
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.totalHits = 0;
    this.totalMisses = 0;
    this.kills = 0;
    this.creatures = [];
    this.currentTarget = null;
    this.gameOver = false;
    this.mutationTriggered = false;

    // Spawn
    this.spawnTimer = 1.5; // initial delay
    this.spawnRate = this.mode.spawnRateBase;
    this.gameTime = 0;

    // Effects
    this.rain = new Rain(GAME_WIDTH, GAME_HEIGHT);
    this.lightning = new Lightning(GAME_WIDTH, GAME_HEIGHT, this.game.audio);
    this.neon = new NeonGlow(GAME_WIDTH, GAME_HEIGHT);
    this.muzzleFlash = new MuzzleFlash();
    this.screenShake = new ScreenShake();
    this.stageBg = createStageBackground(this.mode.stage);

    // Weapon
    this.currentWeaponIndex = 0;
    this.currentWeapon = WEAPONS[0];

    // Agent muzzle position (bottom right)
    this.agentX = 130;
    this.agentY = GAME_HEIGHT - 120;

    // Audio
    this.game.audio.init();
    this.game.audio.resume();
    this.game.audio.startRain();
    this.game.audio.startBGM(false);

    // HUD
    this.hud.show();
    this.hud.updateTimer(this.timeRemaining, this.totalTime);
    this.hud.updateScore(this.score, this.mode.cost);
    this.hud.updateCombo(this.combo);
    this.hud.updateWord('', '', '', '');
    this.hud.updateWeapon(this.currentWeapon.name, this.currentWeapon.color);

    // Input
    this._keyUnsub = this.game.input.onKey((e) => this._handleKey(e));
  }

  exit() {
    super.exit();
    this.game.audio.stopBGM();
    this.hud.hide();
  }

  _getNextWord() {
    if (this.words.length === 0) {
      this.words = [...this.usedWords];
      this.usedWords = [];
    }
    const idx = Math.floor(Math.random() * this.words.length);
    const word = this.words.splice(idx, 1)[0];
    this.usedWords.push(word);
    return word;
  }

  _spawnCreature() {
    const word = this._getNextWord();
    const romaji = toRomaji(word);
    const matcher = new RomajiMatcher(word);

    // Determine creature type based on game progress
    const progress = 1 - (this.timeRemaining / this.totalTime);
    let type, CreatureClass;

    if (progress > 0.7 && romaji.length > 12 && Math.random() < 0.15) {
      type = CREATURE_TYPES.TYRANT;
      CreatureClass = Tyrant;
    } else if (progress > 0.3 && Math.random() < 0.3) {
      type = CREATURE_TYPES.CERBERUS;
      CreatureClass = Cerberus;
    } else {
      type = CREATURE_TYPES.ZOMBIE_FELINE;
      CreatureClass = ZombieFeline;
    }

    const speedBase = this.mode.creatureSpeedBase +
      (this.mode.creatureSpeedMax - this.mode.creatureSpeedBase) * progress;
    const speed = speedBase * type.speedMultiplier * (60 + Math.random() * 30);
    const bounty = romaji.length * type.bountyPerChar;

    const creature = new CreatureClass({
      x: CREATURE_SPAWN_X_MIN + Math.random() * (CREATURE_SPAWN_X_MAX - CREATURE_SPAWN_X_MIN),
      y: CREATURE_Y_MIN + Math.random() * (CREATURE_Y_MAX - CREATURE_Y_MIN),
      speed,
      word,
      romaji,
      bounty,
      type,
      matcher,
    });

    this.creatures.push(creature);

    // Auto-target if no current target
    if (!this.currentTarget) {
      this._setTarget(creature);
    }
  }

  _setTarget(creature) {
    if (this.currentTarget) {
      this.currentTarget.targeted = false;
    }
    this.currentTarget = creature;
    creature.targeted = true;

    const progress = creature.matcher.getProgress();
    this.hud.updateWord(
      creature.word,
      creature.romaji,
      progress.completedRomaji,
      progress.currentPartial
    );
  }

  _handleKey(e) {
    if (this.gameOver) return;
    const key = e.key.toLowerCase();

    // Only accept a-z
    if (key.length !== 1 || key < 'a' || key > 'z') {
      // Tab to switch target
      if (e.key === 'Tab') {
        e.preventDefault();
        this._cycleTarget();
      }
      return;
    }

    if (!this.currentTarget || this.currentTarget.dying) {
      // Find nearest creature
      const alive = this.creatures.filter(c => !c.dying && c.alive);
      if (alive.length > 0) {
        alive.sort((a, b) => a.x - b.x);
        this._setTarget(alive[0]);
      } else {
        return;
      }
    }

    const result = this.currentTarget.matcher.tryKey(key);

    if (result === 'correct') {
      this.totalHits++;
      this.combo++;
      if (this.combo > this.maxCombo) this.maxCombo = this.combo;
      this._playWeaponSound();
      this.muzzleFlash.trigger(this.agentX + 20, this.agentY - 30);
      this.screenShake.trigger(this.currentWeapon.shakeIntensity * 0.3, 0.08);
      this.currentTarget.onHit();

      // Combo bonus
      if (this.combo > 0 && this.combo % this.comboThreshold === 0) {
        const bonus = COMBO_TIME_BONUS + this.comboBonusExtra;
        this.timeRemaining += bonus;
        this.game.audio.playComboBonus();
        this.hud.showFeedback(`+${bonus}s SURVIVAL INSTINCT!`, 'bonus');
        this.hud.flashScreen('rgba(0, 255, 65, 0.2)');
      }

      // Update word display
      const progress = this.currentTarget.matcher.getProgress();
      this.hud.updateWord(
        this.currentTarget.word,
        this.currentTarget.romaji,
        progress.completedRomaji,
        progress.currentPartial
      );

    } else if (result === 'complete') {
      // Word completed - kill creature
      this.totalHits++;
      this.combo++;
      if (this.combo > this.maxCombo) this.maxCombo = this.combo;
      this.kills++;
      this.score += this.currentTarget.bounty;
      this._playWeaponSound();
      this.game.audio.playKill();
      this.muzzleFlash.trigger(this.agentX + 20, this.agentY - 30);
      this.screenShake.trigger(this.currentWeapon.shakeIntensity * 0.5, 0.1);
      this.currentTarget.kill();
      this.hud.showFeedback(`KILL +$${this.currentTarget.bounty}`, 'kill');
      this.hud.updateScore(this.score, this.mode.cost);
      this._checkWeaponUpgrade();

      // Kill time bonus (MOCHI ability)
      if (this.killTimeBonus > 0) {
        this.timeRemaining += this.killTimeBonus;
      }

      // Combo bonus check
      if (this.combo > 0 && this.combo % this.comboThreshold === 0) {
        const bonus = COMBO_TIME_BONUS + this.comboBonusExtra;
        this.timeRemaining += bonus;
        this.game.audio.playComboBonus();
        this.hud.showFeedback(`+${bonus}s SURVIVAL INSTINCT!`, 'bonus');
      }

      // Find next target
      this.currentTarget = null;
      const alive = this.creatures.filter(c => !c.dying && c.alive);
      if (alive.length > 0) {
        alive.sort((a, b) => a.x - b.x);
        this._setTarget(alive[0]);
      } else {
        this.hud.updateWord('', '', '', '');
      }

    } else {
      // Wrong key
      this.totalMisses++;
      this.combo = 0;
      this.game.audio.playDryFire();
      this.hud.showFeedback('JAM!', 'miss');
      this.screenShake.trigger(3, 0.1);
    }

    this.hud.updateCombo(this.combo);
  }

  _cycleTarget() {
    const alive = this.creatures.filter(c => !c.dying && c.alive);
    if (alive.length <= 1) return;

    alive.sort((a, b) => a.x - b.x);
    const currentIdx = alive.indexOf(this.currentTarget);
    const nextIdx = (currentIdx + 1) % alive.length;
    this._setTarget(alive[nextIdx]);
  }

  update(dt) {
    if (this.gameOver) return;

    this.gameTime += dt;
    this.timeRemaining -= dt;

    if (this.timeRemaining <= 0) {
      this.timeRemaining = 0;
      this.gameOver = true;
      this._endGame();
      return;
    }

    // Danger mode BGM
    if (this.timeRemaining <= AUDIO.DANGER_TIME_THRESHOLD) {
      this.game.audio.setDangerMode(true);
    }

    // Mutation event
    const timeRatio = this.timeRemaining / this.totalTime;
    if (!this.mutationTriggered && timeRatio <= MUTATION_TIME_RATIO) {
      this.mutationTriggered = true;
      this.hud.showFeedback('⚠ B.O.W. MUTATION DETECTED ⚠', 'warning');
      this.hud.flashScreen('rgba(170, 58, 255, 0.3)');
      this.screenShake.trigger(10, 0.5);
      this.lightning.trigger();
      // Stage switch on mutation (e.g., lab → castle)
      if (this.mode.stageMutation) {
        this.stageBg = createStageBackground(this.mode.stageMutation);
      }
    }

    // Spawn logic
    const progress = 1 - timeRatio;
    const currentSpawnRate = this.mode.spawnRateBase -
      (this.mode.spawnRateBase - this.mode.spawnRateMin) * progress;

    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this._spawnCreature();
      this.spawnTimer = currentSpawnRate / 1000 + (Math.random() - 0.5) * 0.5;
    }

    // Update creatures
    for (let i = this.creatures.length - 1; i >= 0; i--) {
      const creature = this.creatures[i];
      creature.update(dt);

      // Creature reached player
      if (creature.hasArrived() && !creature.dying) {
        creature.kill();
        this.combo = 0;
        const actualPenalty = Math.max(1, BITE_PENALTY - this.bitePenaltyReduction);
        this.timeRemaining -= actualPenalty;
        this.game.audio.playBite();
        this.screenShake.trigger(12, 0.4);
        this.hud.flashScreen('rgba(139, 0, 0, 0.4)');
        this.hud.showFeedback(`BITE! -${actualPenalty}s`, 'damage');
        this.hud.updateCombo(this.combo);

        if (this.currentTarget === creature) {
          this.currentTarget = null;
          const alive = this.creatures.filter(c => !c.dying && c.alive);
          if (alive.length > 0) {
            alive.sort((a, b) => a.x - b.x);
            this._setTarget(alive[0]);
          } else {
            this.hud.updateWord('', '', '', '');
          }
        }
      }

      // Remove dead creatures
      if (!creature.isAlive()) {
        this.creatures.splice(i, 1);
      }
    }

    // Effects
    this.rain.update(dt);
    this.lightning.update(dt);
    this.neon.update(dt);
    this.muzzleFlash.update(dt);
    this.screenShake.update(dt);
    this.stageBg.update(dt);

    // HUD updates
    this.hud.updateTimer(this.timeRemaining, this.totalTime);
    this.hud.updateHeartMonitor(dt, this.combo, timeRatio);
  }

  _endGame() {
    this.game.audio.stopBGM();
    this.game.audio.stopRain();

    setTimeout(() => {
      this.game.switchScene('result', {
        mode: this.mode,
        character: this.character,
        score: this.score,
        kills: this.kills,
        combo: this.maxCombo,
        hits: this.totalHits,
        misses: this.totalMisses,
        accuracy: this.totalHits + this.totalMisses > 0
          ? Math.round((this.totalHits / (this.totalHits + this.totalMisses)) * 100)
          : 0,
      });
    }, 1500);
  }

  render(ctx) {
    const W = GAME_WIDTH, H = GAME_HEIGHT;

    ctx.save();
    this.screenShake.apply(ctx);

    // Stage background
    this.stageBg.render(ctx);

    // Neon glow
    this.neon.render(ctx);

    // Player zone marker
    ctx.strokeStyle = 'rgba(255, 50, 50, 0.15)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(CREATURE_ARRIVE_X, CREATURE_Y_MIN - 30);
    ctx.lineTo(CREATURE_ARRIVE_X, CREATURE_Y_MAX + 50);
    ctx.stroke();
    ctx.setLineDash([]);

    // Creatures (sort by y for depth)
    const sorted = [...this.creatures].sort((a, b) => a.y - b.y);
    for (const creature of sorted) {
      creature.render(ctx);
    }

    // Rain (on top of creatures)
    this.rain.render(ctx);

    // Lightning
    this.lightning.render(ctx);

    // Agent
    this._renderAgent(ctx);

    // Muzzle flash
    this.muzzleFlash.render(ctx);

    // Game over overlay
    if (this.gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(0, 0, W, H);
      ctx.textAlign = 'center';
      ctx.font = `bold 42px 'Orbitron', sans-serif`;
      ctx.fillStyle = COLORS.BLOOD_RED_BRIGHT;
      ctx.shadowColor = COLORS.BLOOD_RED_BRIGHT;
      ctx.shadowBlur = 20;
      ctx.fillText('TIME UP', W / 2, H / 2);
      ctx.shadowBlur = 0;
      ctx.font = `16px 'Share Tech Mono', monospace`;
      ctx.fillStyle = COLORS.TEXT_DIM;
      ctx.fillText('CALCULATING RESULTS...', W / 2, H / 2 + 40);
    }

    ctx.restore();
  }

  _renderAgent(ctx) {
    const x = this.agentX;
    const y = this.agentY;
    const ch = this.character;

    ctx.save();
    ctx.translate(x, y);

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(0, 45, 25, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // === Tail (behind body) ===
    ctx.strokeStyle = ch.bodyColor;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    if (ch.tailStyle === 'long') {
      ctx.moveTo(-10, 22);
      ctx.quadraticCurveTo(-25, 8, -28, -5);
    } else if (ch.tailStyle === 'short') {
      ctx.moveTo(-10, 22);
      ctx.quadraticCurveTo(-16, 16, -14, 12);
    } else if (ch.tailStyle === 'fluffy') {
      ctx.lineWidth = 6;
      ctx.moveTo(-10, 22);
      ctx.quadraticCurveTo(-20, 8, -16, -2);
    } else {
      ctx.moveTo(-10, 22);
      ctx.bezierCurveTo(-18, 12, -24, 4, -16, 6);
    }
    ctx.stroke();
    // Tail stripes
    ctx.strokeStyle = ch.stripeColor;
    ctx.lineWidth = 1.2;
    ctx.globalAlpha = 0.4;
    ctx.stroke();
    ctx.globalAlpha = 1.0;
    ctx.lineCap = 'butt';

    // === Body (キジトラ) ===
    ctx.fillStyle = ch.bodyColor;
    ctx.beginPath();
    ctx.ellipse(0, 10, 18, 25, 0, 0, Math.PI * 2);
    ctx.fill();

    // Belly (lighter)
    ctx.fillStyle = ch.bellyColor;
    ctx.beginPath();
    ctx.ellipse(0, 16, 10, 15, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body stripes (キジトラ模様)
    ctx.strokeStyle = ch.stripeColor;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.45;
    for (let s = -2; s <= 2; s++) {
      ctx.beginPath();
      ctx.moveTo(-14, -2 + s * 8);
      ctx.quadraticCurveTo(0, -6 + s * 8, 14, -2 + s * 8);
      ctx.stroke();
    }
    ctx.globalAlpha = 1.0;

    // === Head ===
    ctx.fillStyle = ch.headColor || ch.bodyColor;
    ctx.beginPath();
    ctx.arc(0, -25, 13, 0, Math.PI * 2);
    ctx.fill();

    // Head stripes (M mark)
    ctx.strokeStyle = ch.stripeColor;
    ctx.lineWidth = 1.3;
    ctx.globalAlpha = 0.45;
    ctx.beginPath();
    ctx.moveTo(-7, -30);
    ctx.lineTo(-5, -33);
    ctx.lineTo(-1, -29);
    ctx.lineTo(1, -33);
    ctx.lineTo(5, -33);
    ctx.lineTo(7, -30);
    ctx.stroke();
    ctx.globalAlpha = 1.0;

    // === Ears ===
    ctx.fillStyle = ch.headColor || ch.bodyColor;
    ctx.beginPath();
    ctx.moveTo(-9, -35); ctx.lineTo(-13, -48); ctx.lineTo(-3, -37); ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(9, -35); ctx.lineTo(13, -48); ctx.lineTo(3, -37); ctx.closePath(); ctx.fill();

    // Inner ear (pink)
    ctx.fillStyle = ch.earInner;
    ctx.beginPath();
    ctx.moveTo(-8, -36); ctx.lineTo(-11, -45); ctx.lineTo(-4, -38); ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(8, -36); ctx.lineTo(11, -45); ctx.lineTo(4, -38); ctx.closePath(); ctx.fill();

    // === Eyes ===
    // Eye whites
    ctx.fillStyle = '#eeeedd';
    ctx.beginPath(); ctx.ellipse(-5, -26, 3, 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(5, -26, 3, 3, 0, 0, Math.PI * 2); ctx.fill();

    // Pupils (colored, glowing)
    ctx.fillStyle = ch.eyeColor;
    ctx.shadowColor = ch.eyeGlow;
    ctx.shadowBlur = 6;
    ctx.beginPath(); ctx.ellipse(-5, -26, 1.8, 2.3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(5, -26, 1.8, 2.3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;

    // Highlight
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.beginPath(); ctx.arc(-5.5, -27, 0.7, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(4.5, -27, 0.7, 0, Math.PI * 2); ctx.fill();

    // === Nose ===
    ctx.fillStyle = ch.noseColor;
    ctx.beginPath();
    ctx.moveTo(0, -22); ctx.lineTo(-2.5, -19.5); ctx.lineTo(2.5, -19.5);
    ctx.closePath(); ctx.fill();

    // === Mouth ===
    ctx.strokeStyle = ch.stripeColor;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(0, -19.5); ctx.lineTo(0, -18);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-3.5, -17); ctx.quadraticCurveTo(0, -15.5, 3.5, -17);
    ctx.stroke();

    // Whiskers
    ctx.strokeStyle = 'rgba(200,180,150,0.35)';
    ctx.lineWidth = 0.6;
    ctx.beginPath(); ctx.moveTo(-7, -20); ctx.lineTo(-20, -22); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-7, -19); ctx.lineTo(-20, -19); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(7, -20); ctx.lineTo(20, -22); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(7, -19); ctx.lineTo(20, -19); ctx.stroke();

    // === Gun arm ===
    ctx.strokeStyle = ch.bodyColor;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(10, 0);
    ctx.lineTo(25, -25);
    ctx.stroke();

    // Gun
    ctx.fillStyle = '#444';
    switch(this.currentWeapon.id) {
      case 'shotgun':
        ctx.fillRect(18, -32, 22, 5); // Long barrel
        ctx.fillStyle = '#632'; // wood pump
        ctx.fillRect(25, -31, 8, 4);
        ctx.fillStyle = '#444';
        ctx.fillRect(20, -28, 4, 8); // grip
        break;
      case 'machinegun':
        ctx.fillRect(15, -34, 25, 8); // bulky body
        ctx.fillRect(35, -32, 10, 3); // barrel
        ctx.fillRect(20, -26, 4, 8); // grip
        ctx.fillRect(28, -26, 4, 12); // magazine
        break;
      case 'magnum':
        ctx.fillStyle = '#ccc'; // silver
        ctx.fillRect(18, -33, 18, 7); // heavy barrel
        ctx.fillStyle = '#444';
        ctx.fillRect(22, -26, 5, 8); // grip
        break;
      case 'rocket':
        ctx.fillStyle = '#353'; // green tube
        ctx.fillRect(5, -38, 35, 12); // main tube
        ctx.fillStyle = '#222';
        ctx.fillRect(38, -36, 8, 8); // warhead opening
        ctx.fillRect(20, -26, 4, 8); // grip
        break;
      case 'handgun':
      default:
        ctx.fillRect(20, -32, 15, 6);
        ctx.fillRect(22, -28, 4, 8);
        break;
    }

    // Muzzle flash glow on agent
    if (this.muzzleFlash.isActive()) {
      ctx.fillStyle = 'rgba(255, 200, 50, 0.2)';
      ctx.beginPath();
      ctx.arc(0, -10, 40, 0, Math.PI * 2);
      ctx.fill();
    }

    // Agent name tag
    ctx.font = `8px 'Orbitron', sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = `rgba(${this._hexToRgb(ch.accentColor)}, 0.5)`;
    ctx.fillText(ch.name, 0, 55);

    ctx.restore();
  }

  _playWeaponSound() {
    const method = this.currentWeapon.soundMethod;
    if (this.game.audio[method]) {
      this.game.audio[method]();
    } else {
      this.game.audio.playGunshot();
    }
  }

  _checkWeaponUpgrade() {
    for (let i = WEAPONS.length - 1; i >= 0; i--) {
      if (this.score >= WEAPONS[i].scoreThreshold) {
        if (i > this.currentWeaponIndex) {
          this.currentWeaponIndex = i;
          this.currentWeapon = WEAPONS[i];
          this.game.audio.playWeaponUpgrade();
          this.hud.updateWeapon(this.currentWeapon.name, this.currentWeapon.color);
          this.hud.showFeedback(`🔫 ${this.currentWeapon.nameJp} GET!`, 'bonus');
          this.hud.flashScreen(`rgba(255, 200, 0, 0.25)`);
          this.screenShake.trigger(6, 0.3);
        }
        break;
      }
    }
  }

  _hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r},${g},${b}`;
  }
}
