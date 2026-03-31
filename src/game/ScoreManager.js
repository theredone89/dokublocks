export class ScoreManager {
  constructor() {
    this.currentScore = 0;
    this.highScore = this.loadHighScore();
    this.streak = 0;
    this.lastClearCount = 0;
  }

  loadHighScore() {
    const saved = localStorage.getItem('highScore');
    return saved ? parseInt(saved) : 0;
  }

  saveHighScore() {
    if (this.currentScore > this.highScore) {
      this.highScore = this.currentScore;
      localStorage.setItem('highScore', this.highScore.toString());
      return true;
    }
    return false;
  }

  reset() {
    this.currentScore = 0;
    this.streak = 0;
    this.lastClearCount = 0;
  }

  getScore() { return this.currentScore; }
  getHighScore() { return this.highScore; }

  calculateScore(placedBlockCount, clearedLinesCount) {
    const POINTS_PER_BLOCK = 10;
    const POINTS_PER_CLEAR = 100;
    let points = placedBlockCount * POINTS_PER_BLOCK;
    if (clearedLinesCount > 0) {
      points += clearedLinesCount * POINTS_PER_CLEAR;
      if (clearedLinesCount >= 2) {
        const comboBonus = (clearedLinesCount - 1) * 50;
        points += comboBonus;
      }
      this.streak++;
      if (this.streak >= 3) {
        const streakBonus = this.streak * 25;
        points += streakBonus;
      }
      this.lastClearCount = clearedLinesCount;
    } else {
      this.streak = 0;
    }
    this.currentScore += points;
    this.saveHighScore();
    return points;
  }

  getStreak() { return this.streak; }
}
