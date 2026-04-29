// ========================================
// BIOHAZARD RENI - Japanese to Romaji Converter
// Supports multiple input patterns (shi/si, tsu/tu, etc.)
// ========================================

const ROMAJI_MAP = {
  'あ': ['a'], 'い': ['i'], 'う': ['u'], 'え': ['e'], 'お': ['o'],
  'か': ['ka'], 'き': ['ki'], 'く': ['ku'], 'け': ['ke'], 'こ': ['ko'],
  'さ': ['sa'], 'し': ['si', 'shi'], 'す': ['su'], 'せ': ['se'], 'そ': ['so'],
  'た': ['ta'], 'ち': ['ti', 'chi'], 'つ': ['tu', 'tsu'], 'て': ['te'], 'と': ['to'],
  'な': ['na'], 'に': ['ni'], 'ぬ': ['nu'], 'ね': ['ne'], 'の': ['no'],
  'は': ['ha'], 'ひ': ['hi'], 'ふ': ['hu', 'fu'], 'へ': ['he'], 'ほ': ['ho'],
  'ま': ['ma'], 'み': ['mi'], 'む': ['mu'], 'め': ['me'], 'も': ['mo'],
  'や': ['ya'], 'ゆ': ['yu'], 'よ': ['yo'],
  'ら': ['ra'], 'り': ['ri'], 'る': ['ru'], 'れ': ['re'], 'ろ': ['ro'],
  'わ': ['wa'], 'を': ['wo'], 'ん': ['nn', 'n'],
  'が': ['ga'], 'ぎ': ['gi'], 'ぐ': ['gu'], 'げ': ['ge'], 'ご': ['go'],
  'ざ': ['za'], 'じ': ['zi', 'ji'], 'ず': ['zu'], 'ぜ': ['ze'], 'ぞ': ['zo'],
  'だ': ['da'], 'ぢ': ['di'], 'づ': ['du', 'dzu'], 'で': ['de'], 'ど': ['do'],
  'ば': ['ba'], 'び': ['bi'], 'ぶ': ['bu'], 'べ': ['be'], 'ぼ': ['bo'],
  'ぱ': ['pa'], 'ぴ': ['pi'], 'ぷ': ['pu'], 'ぺ': ['pe'], 'ぽ': ['po'],
  // 拗音
  'きゃ': ['kya'], 'きゅ': ['kyu'], 'きょ': ['kyo'],
  'しゃ': ['sya', 'sha'], 'しゅ': ['syu', 'shu'], 'しょ': ['syo', 'sho'],
  'ちゃ': ['tya', 'cha'], 'ちゅ': ['tyu', 'chu'], 'ちょ': ['tyo', 'cho'],
  'にゃ': ['nya'], 'にゅ': ['nyu'], 'にょ': ['nyo'],
  'ひゃ': ['hya'], 'ひゅ': ['hyu'], 'ひょ': ['hyo'],
  'みゃ': ['mya'], 'みゅ': ['myu'], 'みょ': ['myo'],
  'りゃ': ['rya'], 'りゅ': ['ryu'], 'りょ': ['ryo'],
  'ぎゃ': ['gya'], 'ぎゅ': ['gyu'], 'ぎょ': ['gyo'],
  'じゃ': ['zya', 'ja', 'jya'], 'じゅ': ['zyu', 'ju', 'jyu'], 'じょ': ['zyo', 'jo', 'jyo'],
  'びゃ': ['bya'], 'びゅ': ['byu'], 'びょ': ['byo'],
  'ぴゃ': ['pya'], 'ぴゅ': ['pyu'], 'ぴょ': ['pyo'],
  // 特殊
  'ー': ['-'],
};

/**
 * Convert a hiragana string into an array of "character groups"
 * Each group has the hiragana char(s) and possible romaji patterns
 */
export function tokenize(hiragana) {
  const tokens = [];
  let i = 0;

  while (i < hiragana.length) {
    // Check for っ (double consonant)
    if (hiragana[i] === 'っ') {
      // Look ahead to next char to determine what consonant to double
      if (i + 1 < hiragana.length) {
        // Check for 2-char compound (拗音) after っ
        const nextTwo = hiragana.substring(i + 1, i + 3);
        const nextOne = hiragana[i + 1];

        let nextPatterns;
        if (ROMAJI_MAP[nextTwo]) {
          nextPatterns = ROMAJI_MAP[nextTwo];
        } else if (ROMAJI_MAP[nextOne]) {
          nextPatterns = ROMAJI_MAP[nextOne];
        } else {
          // fallback
          tokens.push({ kana: 'っ', patterns: ['xtu', 'xtsu'] });
          i++;
          continue;
        }

        // Double the first consonant of each pattern
        const doubledPatterns = nextPatterns.map(p => p[0] + p);
        const combinedKana = nextTwo.length === 2 && ROMAJI_MAP[nextTwo]
          ? 'っ' + nextTwo
          : 'っ' + nextOne;

        tokens.push({
          kana: combinedKana,
          patterns: doubledPatterns,
        });

        i += combinedKana.length;
        continue;
      } else {
        tokens.push({ kana: 'っ', patterns: ['xtu', 'xtsu'] });
        i++;
        continue;
      }
    }

    // Check 2-char compounds (拗音) first
    if (i + 1 < hiragana.length) {
      const twoChar = hiragana.substring(i, i + 2);
      if (ROMAJI_MAP[twoChar]) {
        tokens.push({ kana: twoChar, patterns: ROMAJI_MAP[twoChar] });
        i += 2;
        continue;
      }
    }

    // Single character
    const oneChar = hiragana[i];
    if (ROMAJI_MAP[oneChar]) {
      // Handle ん special case: 'n' allowed only if next is NOT a vowel/ya/yu/yo
      if (oneChar === 'ん') {
        const next = hiragana[i + 1];
        const vowels = ['a', 'i', 'u', 'e', 'o'];
        const nextRomaji = next && ROMAJI_MAP[next] ? ROMAJI_MAP[next][0] : '';
        const startsWithVowel = vowels.includes(nextRomaji[0]);
        const startsWithY = nextRomaji[0] === 'y';
        const startsWithN = nextRomaji[0] === 'n';

        if (!next || (!startsWithVowel && !startsWithY && !startsWithN)) {
          // 'n' alone is fine
          tokens.push({ kana: 'ん', patterns: ['n', 'nn'] });
        } else {
          // Must use 'nn' to disambiguate
          tokens.push({ kana: 'ん', patterns: ['nn'] });
        }
      } else {
        tokens.push({ kana: oneChar, patterns: ROMAJI_MAP[oneChar] });
      }
      i++;
    } else {
      // Unknown character, pass through (for katakana, etc.)
      tokens.push({ kana: oneChar, patterns: [oneChar] });
      i++;
    }
  }

  return tokens;
}

/**
 * Get the default (shortest) romaji reading for a hiragana string
 */
export function toRomaji(hiragana) {
  const tokens = tokenize(hiragana);
  return tokens.map(t => t.patterns[0]).join('');
}

/**
 * RomajiMatcher: Tracks user input against tokenized hiragana,
 * accepting any valid pattern for each token.
 */
export class RomajiMatcher {
  constructor(hiragana) {
    this.hiragana = hiragana;
    this.tokens = tokenize(hiragana);
    this.currentTokenIndex = 0;
    this.currentInput = '';
    this.completedRomaji = '';
    this.totalRomaji = toRomaji(hiragana);
  }

  /**
   * Try to match a key press. Returns:
   *   'correct' - key matches current token progress
   *   'complete' - last key of the entire word
   *   'wrong' - key doesn't match any pattern
   */
  tryKey(key) {
    if (this.currentTokenIndex >= this.tokens.length) return 'complete';

    const token = this.tokens[this.currentTokenIndex];
    const testInput = this.currentInput + key;

    // Check if any pattern starts with this input
    const matching = token.patterns.filter(p => p.startsWith(testInput));

    if (matching.length > 0) {
      // Check if any pattern is exactly completed
      const exact = matching.find(p => p === testInput);
      if (exact) {
        this.completedRomaji += exact;
        this.currentInput = '';
        this.currentTokenIndex++;

        if (this.currentTokenIndex >= this.tokens.length) {
          return 'complete';
        }
        return 'correct';
      }
      // Still partial match
      this.currentInput = testInput;
      return 'correct';
    }

    return 'wrong';
  }

  getProgress() {
    return {
      completed: this.currentTokenIndex,
      total: this.tokens.length,
      completedRomaji: this.completedRomaji,
      currentPartial: this.currentInput,
      remaining: this.tokens.slice(this.currentTokenIndex).map(t => t.patterns[0]).join(''),
    };
  }

  isComplete() {
    return this.currentTokenIndex >= this.tokens.length;
  }

  getDisplayRomaji() {
    return this.totalRomaji;
  }
}
