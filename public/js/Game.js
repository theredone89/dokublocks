class FloatingText {
  constructor(x, y, text, renderer) {
    this.x = x;
    this.y = y;
    this.text = text;
    this.renderer = renderer;
    this.life = 1.0;
    this.speed = 2;
  }

  update() {
    this.y -= this.speed;
    this.life -= 0.03;
    return this.life > 0;
  }

  draw() {
    this.renderer.drawFloatingText(this.x, this.y, this.text, this.life);
  }
}

class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.grid = new Grid();
    this.scoreManager = new ScoreManager();
    this.renderer = new Renderer(canvas);
    this.pieceGenerator = new PieceGenerator();
    this.backupManager = new ScoreBackupManager();
    
    this.hand = [];
    this.isGameOver = false;
    this.isAnimating = false;
    this.isSubmittingScore = false;
    this.floatingTexts = [];
    this.clearingCells = null;
    this.animationProgress = 0;
    
    this.inputHandler = new InputHandler(canvas, this);
    
    this.init();
    this.startAnimationLoop();
    this.loadLeaderboard();
    this.setupEventListeners();
    this.setupResizeListener();
    this.setupSyncNotification();
    this.setupOfflineDetection();
    this.setupContinueButton();
  }

  setupResizeListener() {
    let resizeTimeout;
    window.addEventListener('resize', () => {
      // Debounce resize events
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.renderer.resize();
        this.render();
      }, 100);
    });
  }

  setupSyncNotification() {
    // Listen for sync events from backup manager
    this.backupManager.onSync((success, syncedCount) => {
      if (success && syncedCount > 0) {
        this.showDialog(`${syncedCount} score(s) synced to server successfully!`);
        // Reload leaderboard to show newly synced scores
        this.loadLeaderboard();
      }
    });
    
    // Listen for online event to trigger sync
    window.addEventListener('app-online', () => {
      console.log('[Game] Connection restored, attempting to sync pending scores...');
      this.backupManager.syncPendingScores();
    });
  }

  setupOfflineDetection() {
    const offlineBanner = document.getElementById('offline-banner');
    const offlineText = document.getElementById('offline-text');
    
    if (!offlineBanner) return;
    
    // Set initial state
    this.updateOfflineStatus(offlineBanner, offlineText);
    
    // Update on status changes
    window.addEventListener('online', () => {
      this.updateOfflineStatus(offlineBanner, offlineText);
    });
    
    window.addEventListener('offline', () => {
      this.updateOfflineStatus(offlineBanner, offlineText);
    });
  }

  updateOfflineStatus(banner, text) {
    if (navigator.onLine) {
      banner.classList.add('hidden');
      text.textContent = 'You are online';
    } else {
      banner.classList.remove('hidden');
      text.textContent = 'You are offline - using local storage';
    }
  }

  // Continue button wiring
  setupContinueButton() {
    const continueBtn = document.getElementById('continue-btn');
    const newGameBtn = document.getElementById('new-game-btn');

    if (continueBtn) {
      continueBtn.addEventListener('click', () => {
        const loaded = this.loadState();
        if (loaded) {
          // Hide menu if present
          const menu = document.querySelector('.menu-page');
          if (menu) menu.classList.add('hidden');
        } else {
          // No saved state — start a new game
          this.init();
          const menu = document.querySelector('.menu-page');
          if (menu) menu.classList.add('hidden');
        }
      });
    }

    if (newGameBtn) {
      newGameBtn.addEventListener('click', () => {
        // Start a fresh game and hide menu
        this.init();
        const menu = document.querySelector('.menu-page');
        if (menu) menu.classList.add('hidden');
      });
    }
  }

  init() {
    this.grid.reset();
    this.scoreManager.reset();
    this.hand = this.pieceGenerator.generateBatch(this.grid.getFilledPercentage());
    this.isGameOver = false;
    this.floatingTexts = [];
    this.render();
    this.updateScoreDisplay();
  }

  setupEventListeners() {
    const submitBtn = document.getElementById('submit-score-btn');
    const playAgainBtn = document.getElementById('play-again-btn');
    const refreshBtn = document.getElementById('refresh-leaderboard-btn');
    
    if (submitBtn) {
      submitBtn.addEventListener('click', () => this.submitScore());
    }
    
    if (playAgainBtn) {
      playAgainBtn.addEventListener('click', () => {
        this.hideGameOverModal();
        this.init();
      });
    }
    
    
    
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.loadLeaderboard());
    }
    
    // Theme handling: apply saved theme and listen for changes from settings page
    (function() {
      const themeColorMeta = document.getElementById('theme-color-meta');
      const appleStatusBar = document.getElementById('apple-status-bar');

      const applyTheme = (isLight) => {
        try { this.renderer.setTheme(!!isLight); } catch (e) {}
        document.body.classList.toggle('light-theme', !!isLight);
        if (themeColorMeta) themeColorMeta.setAttribute('content', isLight ? '#e3f2fd' : '#1a1a2e');
        if (appleStatusBar) appleStatusBar.setAttribute('content', isLight ? 'default' : 'black-translucent');
        this.render();
      };

      // Apply saved theme at startup
      const savedTheme = localStorage.getItem('blocklogic-theme');
      applyTheme(savedTheme === 'light');

      // If a toggle exists on this page, wire it up too
      const themeToggle = document.getElementById('theme-toggle');
      if (themeToggle) {
        themeToggle.checked = (savedTheme === 'light');
        themeToggle.addEventListener('change', (e) => {
          const isLight = e.target.checked;
          localStorage.setItem('blocklogic-theme', isLight ? 'light' : 'dark');
          window.dispatchEvent(new CustomEvent('blocklogic-theme-change', { detail: { isLight } }));
          applyTheme(isLight);
        });
      }

      // Listen for theme change broadcasts (from settings page)
      const themeHandler = (e) => {
        const isLight = e && e.detail && typeof e.detail.isLight === 'boolean' ? e.detail.isLight : null;
        if (typeof isLight === 'boolean') applyTheme(isLight);
      };
      window.addEventListener('blocklogic-theme-change', themeHandler);
    }).call(this);
    
    const usernameInput = document.getElementById('username');
    if (usernameInput) {
      usernameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.submitScore();
        }
      });
    }
  }

  render() {
    this.renderer.drawGrid(this.grid.cells);
    
    // Draw clearing animation if active
    if (this.isAnimating && this.clearingCells) {
      this.renderer.drawClearingCells(this.clearingCells, this.animationProgress);
    }
    
    this.renderer.drawHand(this.hand);
    
    // If dragging, re-draw the dragging piece and preview
    if (this.inputHandler && this.inputHandler.isDragging && this.inputHandler.selectedPiece) {
      this.inputHandler.drawDragPreview();
    }
  }

  startAnimationLoop() {
    const animate = () => {
      this.floatingTexts = this.floatingTexts.filter(text => text.update());
      
      if (this.floatingTexts.length > 0) {
        this.render();
        this.floatingTexts.forEach(text => text.draw());
      }
      
      requestAnimationFrame(animate);
    };
    animate();
  }

  async placePiece(pieceIndex, gridX, gridY) {
    const piece = this.hand[pieceIndex];
    
    if (!piece || !this.grid.canPlacePiece(piece, gridX, gridY)) {
      return false;
    }
    
    this.grid.placePiece(piece, gridX, gridY);
    
    const blockCount = piece.getBlockCount();
    const clears = this.grid.checkClears();
    const clearCount = clears.rows.length + clears.cols.length + clears.squares.length;
    
    if (clearCount > 0) {
      await this.animateClears(clears);
    }
    
    const points = this.scoreManager.calculateScore(blockCount, clearCount);
    
    const centerX = this.renderer.gridOffset.x + (gridX + piece.width / 2) * this.renderer.cellSize;
    const centerY = this.renderer.gridOffset.y + (gridY + piece.height / 2) * this.renderer.cellSize;
    this.showFloatingScore(centerX, centerY, points);
    
    this.hand[pieceIndex] = null;
    
    if (this.hand.every(p => p === null)) {
      this.hand = this.pieceGenerator.generateBatch(this.grid.getFilledPercentage());
    }
    
    this.updateScoreDisplay();
    
    // Check game over after blocks are cleared
    this.checkGameOver();
    
    this.render();
    // Persist state after each successful placement
    try {
      this.saveState();
    } catch (e) {
      console.warn('[Game] Failed to save state:', e);
    }
    return true;
  }

  // Save game state to localStorage so Continue can restore it
  saveState() {
    const state = {
      grid: this.grid.cells,
      score: this.scoreManager.currentScore || this.scoreManager.getScore(),
      highScore: this.scoreManager.highScore || this.scoreManager.getHighScore(),
      hand: this.hand.map(p => (p ? p.name : null)),
      isGameOver: !!this.isGameOver,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('blocklogic-save', JSON.stringify(state));
  }

  // Load saved state; returns true if loaded
  loadState() {
    try {
      const raw = localStorage.getItem('blocklogic-save');
      if (!raw) return false;
      const state = JSON.parse(raw);

      if (state.grid && Array.isArray(state.grid)) {
        this.grid.cells = state.grid;
      }

      if (typeof state.score === 'number') {
        this.scoreManager.currentScore = state.score;
      }

      if (typeof state.highScore === 'number') {
        this.scoreManager.highScore = state.highScore;
      }

      if (Array.isArray(state.hand)) {
        this.hand = state.hand.map(name => (name ? new Piece(PIECE_SHAPES[name], name) : null));
      } else {
        this.hand = this.pieceGenerator.generateBatch(this.grid.getFilledPercentage());
      }

      this.isGameOver = !!state.isGameOver;
      this.render();
      this.updateScoreDisplay();
      return true;
    } catch (e) {
      console.error('[Game] Failed to load saved state:', e);
      return false;
    }
  }

  clearSavedState() {
    try {
      localStorage.removeItem('blocklogic-save');
    } catch (e) {
      // ignore
    }
  }

  async animateClears(clears) {
    this.isAnimating = true;
    
    // Get cells to clear for animation
    this.clearingCells = this.getClearingCells(clears);
    
    const duration = 160; // Snappy animation
    const steps = 8;
    const stepDuration = duration / steps;
    
    for (let step = 0; step <= steps; step++) {
      this.animationProgress = step / steps;
      this.render();
      await this.sleep(stepDuration);
    }
    
    this.grid.clearLines(clears);
    this.clearingCells = null;
    this.animationProgress = 0;
    this.isAnimating = false;
    this.render();
  }

  getClearingCells(clears) {
    const cells = [];
    
    // Add row cells
    clears.rows.forEach(row => {
      for (let col = 0; col < 9; col++) {
        cells.push({ row, col });
      }
    });
    
    // Add column cells
    clears.cols.forEach(col => {
      for (let row = 0; row < 9; row++) {
        if (!cells.some(c => c.row === row && c.col === col)) {
          cells.push({ row, col });
        }
      }
    });
    
    // Add square cells
    clears.squares.forEach(square => {
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const row = square.row * 3 + r;
          const col = square.col * 3 + c;
          if (!cells.some(cell => cell.row === row && cell.col === col)) {
            cells.push({ row, col });
          }
        }
      }
    });
    
    return cells;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  showFloatingScore(x, y, points) {
    const text = `+${points}`;
    this.floatingTexts.push(new FloatingText(x, y, text, this.renderer));
  }

  checkGameOver() {
    const remainingPieces = this.hand.filter(p => p !== null);
    
    if (remainingPieces.length === 0) {
      return false;
    }
    
    for (const piece of remainingPieces) {
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (this.grid.canPlacePiece(piece, col, row)) {
            return false;
          }
        }
      }
    }
    
    this.triggerGameOver();
    return true;
  }

  triggerGameOver() {
    this.isGameOver = true;
    this.scoreManager.saveHighScore();
    this.showGameOverModal();
  }

  showGameOverModal() {
    const modal = document.getElementById('game-over-modal');
    const finalScore = document.getElementById('final-score');
    const highScore = document.getElementById('modal-high-score');
    const submitBtn = document.getElementById('submit-score-btn');
    
    if (modal && finalScore && highScore) {
      finalScore.textContent = this.scoreManager.getScore();
      highScore.textContent = this.scoreManager.getHighScore();
      this.isSubmittingScore = false;
      if (submitBtn) {
        submitBtn.disabled = false;
      }
      modal.classList.remove('hidden');
      
      const usernameInput = document.getElementById('username');
      if (usernameInput) {
        usernameInput.focus();
      }
    }
  }

  hideGameOverModal() {
    const modal = document.getElementById('game-over-modal');
    const submitBtn = document.getElementById('submit-score-btn');
    if (modal) {
      modal.classList.add('hidden');
      this.isSubmittingScore = false;
      if (submitBtn) {
        submitBtn.disabled = false;
      }
      const usernameInput = document.getElementById('username');
      if (usernameInput) {
        usernameInput.value = '';
      }
    }
  }

  showDialog(message, onClose = null) {
    const modal = document.getElementById('dialog-modal');
    const messageEl = document.getElementById('dialog-message');
    const okBtn = document.getElementById('dialog-ok-btn');
    
    if (modal && messageEl) {
      messageEl.textContent = message;
      modal.classList.remove('hidden');
      
      // Set up one-time click handler
      const closeDialog = () => {
        modal.classList.add('hidden');
        okBtn.removeEventListener('click', closeDialog);
        // Execute callback if provided
        if (onClose) {
          onClose();
        }
      };
      
      okBtn.addEventListener('click', closeDialog);
    }
  }

  showConfirmDialog(message, onConfirm, onCancel = null) {
    const modal = document.getElementById('confirm-modal');
    const messageEl = document.getElementById('confirm-message');
    const yesBtn = document.getElementById('confirm-yes-btn');
    const noBtn = document.getElementById('confirm-no-btn');
    
    if (modal && messageEl) {
      messageEl.textContent = message;
      modal.classList.remove('hidden');
      
      // Set up one-time click handlers
      const handleYes = () => {
        modal.classList.add('hidden');
        yesBtn.removeEventListener('click', handleYes);
        noBtn.removeEventListener('click', handleNo);
        if (onConfirm) {
          onConfirm();
        }
      };
      
      const handleNo = () => {
        modal.classList.add('hidden');
        yesBtn.removeEventListener('click', handleYes);
        noBtn.removeEventListener('click', handleNo);
        if (onCancel) {
          onCancel();
        }
      };
      
      yesBtn.addEventListener('click', handleYes);
      noBtn.addEventListener('click', handleNo);
    }
  }

  async submitScore() {
    if (this.isSubmittingScore) {
      return;
    }

    this.isSubmittingScore = true;
    const submitBtn = document.getElementById('submit-score-btn');
    if (submitBtn) {
      submitBtn.disabled = true;
    }

    const usernameInput = document.getElementById('username');
    const username = usernameInput ? usernameInput.value.trim() || 'Anonymous' : 'Anonymous';
    const score = this.scoreManager.getScore();
    
    if (username.length > 20) {
      this.showDialog('Username must be 20 characters or less');
      return;
    }
    
    try {
      const response = await fetch('/api/score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, score })
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit score');
      }
      
      const data = await response.json();
      
      await this.loadLeaderboard();
      
      this.showDialog(`Score submitted! Your rank: #${data.rank}`, () => {
        // Close game over modal and navigate to leaderboard page
        this.hideGameOverModal();
        try { window.location.href = '/leaderboard'; } catch (e) { console.warn('Failed to navigate to leaderboard', e); }
      });
      
    } catch (error) {
      console.error('Error submitting score:', error);
      
      // Fallback to localStorage backup
      const backupSaved = this.backupManager.saveToBackup(username, score);
      
      if (backupSaved) {
        const pendingCount = this.backupManager.getPendingCount();
        this.showDialog(
          `Server unavailable. Score saved locally (${pendingCount} pending).` +
          ` It will sync when connection is restored.`,
          () => {
            this.hideGameOverModal();
            try { window.location.href = '/leaderboard'; } catch (e) { console.warn('Failed to navigate to leaderboard', e); }
          }
        );
      } else {
        this.showDialog('Failed to submit score. Please try again.');
      }
    }
  }

  async loadLeaderboard() {
    const loading = document.getElementById('leaderboard-loading');
    const list = document.getElementById('leaderboard-list');
    
    if (!loading || !list) return;
    
    loading.classList.remove('hidden');
    list.classList.add('hidden');
    loading.textContent = 'Loading...';
    
    try {
      const response = await fetch('/api/leaderboard');
      
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }
      
      const data = await response.json();
      
      if (data.success && data.data) {
        // Use combined leaderboard (server + backup)
        const combinedScores = this.backupManager.getCombinedLeaderboard(data.data);
        this.renderLeaderboard(combinedScores);
      } else {
        throw new Error('Invalid response format');
      }
      
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      // Fall back to backup scores if server is unavailable
      const backupScores = this.backupManager.getBackupScores();
      if (backupScores.length > 0) {
        this.renderLeaderboard(backupScores);
        loading.classList.add('hidden');
        list.classList.remove('hidden');
        const pendingCount = this.backupManager.getPendingCount();
        if (pendingCount > 0) {
          const notice = document.createElement('li');
          notice.textContent = `⚠️ ${pendingCount} score(s) pending sync to server`;
          notice.style.textAlign = 'center';
          notice.style.color = '#ff9800';
          list.insertBefore(notice, list.firstChild);
        }
      } else {
        loading.textContent = 'Failed to load';
      }
    }
  }

  renderLeaderboard(scores) {
    const list = document.getElementById('leaderboard-list');
    const loading = document.getElementById('leaderboard-loading');
    
    if (!list || !loading) return;
    
    loading.classList.add('hidden');
    list.classList.remove('hidden');
    list.innerHTML = '';
    
    if (scores.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'No scores yet. Be the first!';
      li.style.textAlign = 'center';
      list.appendChild(li);
      return;
    }
    
    scores.forEach((entry, index) => {
      const li = document.createElement('li');
      
      const rank = document.createElement('span');
      rank.className = 'leaderboard-rank';
      rank.textContent = `#${index + 1}`;
      
      const name = document.createElement('span');
      name.className = 'leaderboard-name';
      name.textContent = entry.username;
      
      const score = document.createElement('span');
      score.className = 'leaderboard-score';
      score.textContent = entry.score.toLocaleString();
      
      li.appendChild(rank);
      li.appendChild(name);
      li.appendChild(score);
      
      list.appendChild(li);
    });
  }

  updateScoreDisplay() {
    const currentScore = document.getElementById('current-score');
    const highScore = document.getElementById('high-score');
    
    if (currentScore) {
      currentScore.textContent = this.scoreManager.getScore().toLocaleString();
    }
    
    if (highScore) {
      highScore.textContent = this.scoreManager.getHighScore().toLocaleString();
    }
    try {
      window.dispatchEvent(new CustomEvent('blocklogic-score-update', {
        detail: {
          currentScore: this.scoreManager.getScore(),
          highScore: this.scoreManager.getHighScore()
        }
      }));
    } catch (e) {
      // ignore
    }
  }
}
