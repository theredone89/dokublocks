/**
 * ScoreBackupManager
 * Manages localStorage backup for scores when server connection fails
 */
class ScoreBackupManager {
  constructor() {
    this.PENDING_SCORES_KEY = 'blocklogic-pending-scores';
    this.BACKUP_SCORES_KEY = 'blocklogic-backup-scores';
    this.SYNC_INTERVAL = 5000; // Try to sync every 5 seconds
    this.syncIntervalId = null;
    this.onSyncCallback = null;
    
    this.initAutoSync();
  }

  /**
   * Save a score to backup (localStorage)
   * @param {string} username 
   * @param {number} score 
   */
  saveToBackup(username, score) {
    try {
      const backupScore = {
        id: Date.now(),
        username: username,
        score: score,
        timestamp: new Date().toISOString()
      };

      // Save to pending scores (to be synced later)
      const pendingScores = this.getPendingScores();
      pendingScores.push(backupScore);
      localStorage.setItem(this.PENDING_SCORES_KEY, JSON.stringify(pendingScores));

      // Also save to backup scores for display
      const backupScores = this.getBackupScores();
      backupScores.push(backupScore);
      localStorage.setItem(this.BACKUP_SCORES_KEY, JSON.stringify(backupScores));

      console.log('Score saved to local backup:', backupScore);
      return true;
    } catch (error) {
      console.error('Failed to save score to backup:', error);
      return false;
    }
  }

  /**
   * Get pending scores that need to be synced to server
   * @returns {Array}
   */
  getPendingScores() {
    try {
      const data = localStorage.getItem(this.PENDING_SCORES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to retrieve pending scores:', error);
      return [];
    }
  }

  /**
   * Get backup scores (all scores stored locally)
   * @returns {Array}
   */
  getBackupScores() {
    try {
      const data = localStorage.getItem(this.BACKUP_SCORES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to retrieve backup scores:', error);
      return [];
    }
  }

  /**
   * Clear pending scores after successful sync
   */
  clearPendingScores() {
    try {
      localStorage.removeItem(this.PENDING_SCORES_KEY);
    } catch (error) {
      console.error('Failed to clear pending scores:', error);
    }
  }

  /**
   * Clear all backup scores
   */
  clearAllBackups() {
    try {
      localStorage.removeItem(this.PENDING_SCORES_KEY);
      localStorage.removeItem(this.BACKUP_SCORES_KEY);
    } catch (error) {
      console.error('Failed to clear backups:', error);
    }
  }

  /**
   * Attempt to sync pending scores to server
   * @returns {Promise<boolean>} - true if sync successful
   */
  async syncPendingScores() {
    const pendingScores = this.getPendingScores();
    
    if (pendingScores.length === 0) {
      return true;
    }

    try {
      let successCount = 0;
      const failedScores = [];

      for (const scoreData of pendingScores) {
        try {
          const response = await fetch('/api/score', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              username: scoreData.username,
              score: scoreData.score
            }),
            timeout: 5000 // 5 second timeout
          });

          if (response.ok) {
            successCount++;
          } else {
            failedScores.push(scoreData);
          }
        } catch (error) {
          failedScores.push(scoreData);
        }
      }

      // Update pending scores with only failed ones
      if (failedScores.length === 0) {
        this.clearPendingScores();
        console.log(`Successfully synced ${successCount} scores to server`);
        if (this.onSyncCallback) {
          this.onSyncCallback(true, successCount);
        }
        return true;
      } else {
        // Save failed scores back to pending
        localStorage.setItem(this.PENDING_SCORES_KEY, JSON.stringify(failedScores));
        console.log(`Synced ${successCount} scores, ${failedScores.length} failed`);
        if (this.onSyncCallback) {
          this.onSyncCallback(false, successCount);
        }
        return false;
      }
    } catch (error) {
      console.error('Error during sync attempt:', error);
      return false;
    }
  }

  /**
   * Initialize automatic sync attempts
   */
  initAutoSync() {
    // Try to sync immediately
    this.syncPendingScores();

    // Then set up periodic sync
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId);
    }

    this.syncIntervalId = setInterval(() => {
      this.syncPendingScores();
    }, this.SYNC_INTERVAL);
  }

  /**
   * Stop auto sync
   */
  stopAutoSync() {
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId);
      this.syncIntervalId = null;
    }
  }

  /**
   * Register callback for sync events
   * @param {Function} callback - Called with (success: boolean, syncedCount: number)
   */
  onSync(callback) {
    this.onSyncCallback = callback;
  }

  /**
   * Get combined leaderboard (backup + server)
   * @param {Array} serverScores - Scores from server
   * @returns {Array}
   */
  getCombinedLeaderboard(serverScores = []) {
    const combined = [...serverScores];
    const backupScores = this.getBackupScores();
    
    // Add backup scores that aren't on the server (by id)
    const serverIds = new Set(serverScores.map(s => s.id));
    backupScores.forEach(backupScore => {
      if (!serverIds.has(backupScore.id)) {
        combined.push(backupScore);
      }
    });

    // Sort by score descending
    return combined.sort((a, b) => b.score - a.score);
  }

  /**
   * Check if there are pending scores waiting to sync
   * @returns {number}
   */
  getPendingCount() {
    return this.getPendingScores().length;
  }
}
