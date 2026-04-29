// ========================================
// BIOHAZARD RENI - Local Storage Manager
// ========================================

const STORAGE_KEY = 'biohazard_reni_scores';

export function saveScore(mode, result) {
  const scores = getScores();
  scores.push({
    mode,
    ...result,
    date: new Date().toISOString(),
  });
  // Keep only last 50 scores
  if (scores.length > 50) scores.splice(0, scores.length - 50);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
}

export function getScores() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

export function getHighScore(mode) {
  const scores = getScores().filter(s => s.mode === mode);
  if (scores.length === 0) return null;
  return scores.reduce((best, s) => (s.score > best.score ? s : best));
}

export function clearScores() {
  localStorage.removeItem(STORAGE_KEY);
}
