export class ScoreBackupManager {
  constructor() {
    this.PENDING_SCORES_KEY = 'blocklogic-pending-scores';
    this.BACKUP_SCORES_KEY = 'blocklogic-backup-scores';
    this.SYNC_INTERVAL = 5000;
    this.syncIntervalId = null;
    this.onSyncCallback = null;
    this.initAutoSync();
  }

  saveToBackup(username, score) {
    try {
      const backupScore = { id: Date.now(), username, score, timestamp: new Date().toISOString() };
      const pendingScores = this.getPendingScores();
      pendingScores.push(backupScore);
      localStorage.setItem(this.PENDING_SCORES_KEY, JSON.stringify(pendingScores));
      const backupScores = this.getBackupScores();
      backupScores.push(backupScore);
      localStorage.setItem(this.BACKUP_SCORES_KEY, JSON.stringify(backupScores));
      return true;
    } catch (error) {
      console.error('Failed to save score to backup:', error);
      return false;
    }
  }

  getPendingScores() {
    try {
      const data = localStorage.getItem(this.PENDING_SCORES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) { return []; }
  }

  getBackupScores() {
    try {
      const data = localStorage.getItem(this.BACKUP_SCORES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) { return []; }
  }

  clearPendingScores() { try { localStorage.removeItem(this.PENDING_SCORES_KEY); } catch (e) {} }

  clearAllBackups() { try { localStorage.removeItem(this.PENDING_SCORES_KEY); localStorage.removeItem(this.BACKUP_SCORES_KEY); } catch (e) {} }

  async syncPendingScores() {
    const pendingScores = this.getPendingScores();
    if (pendingScores.length === 0) return true;
    try {
      let successCount = 0;
      const failedScores = [];
      for (const scoreData of pendingScores) {
        try {
          const response = await fetch('/api/score', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: scoreData.username, score: scoreData.score })
          });
          if (response.ok) successCount++; else failedScores.push(scoreData);
        } catch (error) { failedScores.push(scoreData); }
      }
      if (failedScores.length === 0) {
        this.clearPendingScores();
        if (this.onSyncCallback) this.onSyncCallback(true, successCount);
        return true;
      } else {
        localStorage.setItem(this.PENDING_SCORES_KEY, JSON.stringify(failedScores));
        if (this.onSyncCallback) this.onSyncCallback(false, successCount);
        return false;
      }
    } catch (error) {
      console.error('Error during sync attempt:', error);
      return false;
    }
  }

  initAutoSync() {
    this.syncPendingScores();
    if (this.syncIntervalId) clearInterval(this.syncIntervalId);
    this.syncIntervalId = setInterval(() => this.syncPendingScores(), this.SYNC_INTERVAL);
  }

  stopAutoSync() { if (this.syncIntervalId) { clearInterval(this.syncIntervalId); this.syncIntervalId = null; } }

  onSync(callback) { this.onSyncCallback = callback; }

  getCombinedLeaderboard(serverScores = []) {
    const combined = [...serverScores];
    const backupScores = this.getBackupScores();
    const serverIds = new Set(serverScores.map(s => s.id));
    backupScores.forEach(backupScore => { if (!serverIds.has(backupScore.id)) combined.push(backupScore); });
    return combined.sort((a, b) => b.score - a.score);
  }

  getPendingCount() { return this.getPendingScores().length; }
}
