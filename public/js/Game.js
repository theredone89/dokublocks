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
    
    this.hand = [];
    this.isGameOver = false;
    this.isAnimating = false;
    this.floatingTexts = [];
    
    this.inputHandler = new InputHandler(canvas, this);
    
    this.init();
    this.startAnimationLoop();
    this.loadLeaderboard();
    this.setupEventListeners();
    this.setupResizeListener();
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

  init() {
    this.grid.reset();
    this.scoreManager.reset();
    this.hand = this.pieceGenerator.generateBatch();
    this.isGameOver = false;
    this.floatingTexts = [];
    this.render();
    this.updateScoreDisplay();
  }

  setupEventListeners() {
    const submitBtn = document.getElementById('submit-score-btn');
    const playAgainBtn = document.getElementById('play-again-btn');
    const restartBtn = document.getElementById('restart-btn');
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
    
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        this.showConfirmDialog(
          'Are you sure you want to restart? Your current progress will be lost.',
          () => this.init()
        );
      });
    }
    
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.loadLeaderboard());
    }
    
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      // Load saved theme preference
      const savedTheme = localStorage.getItem('blocklogic-theme');
      const themeColorMeta = document.getElementById('theme-color-meta');
      const appleStatusBar = document.getElementById('apple-status-bar');
      
      if (savedTheme === 'light') {
        themeToggle.checked = true;
        this.renderer.setTheme(true);
        document.body.classList.add('light-theme');
        if (themeColorMeta) {
          themeColorMeta.setAttribute('content', '#e3f2fd');
        }
        if (appleStatusBar) {
          appleStatusBar.setAttribute('content', 'default');
        }
      }
      
      themeToggle.addEventListener('change', (e) => {
        const isLight = e.target.checked;
        this.renderer.setTheme(isLight);
        document.body.classList.toggle('light-theme', isLight);
        localStorage.setItem('blocklogic-theme', isLight ? 'light' : 'dark');
        
        // Update theme-color meta tag for tab tinting
        if (themeColorMeta) {
          themeColorMeta.setAttribute('content', isLight ? '#e3f2fd' : '#1a1a2e');
        }
        
        // Update Apple status bar style
        if (appleStatusBar) {
          appleStatusBar.setAttribute('content', isLight ? 'default' : 'black-translucent');
        }
        
        this.render();
      });
    }
    
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

  placePiece(pieceIndex, gridX, gridY) {
    const piece = this.hand[pieceIndex];
    
    if (!piece || !this.grid.canPlacePiece(piece, gridX, gridY)) {
      return false;
    }
    
    this.grid.placePiece(piece, gridX, gridY);
    
    const blockCount = piece.getBlockCount();
    const clears = this.grid.checkClears();
    const clearCount = clears.rows.length + clears.cols.length + clears.squares.length;
    
    if (clearCount > 0) {
      this.animateClears(clears);
    }
    
    const points = this.scoreManager.calculateScore(blockCount, clearCount);
    
    const centerX = this.renderer.gridOffset.x + (gridX + piece.width / 2) * this.renderer.cellSize;
    const centerY = this.renderer.gridOffset.y + (gridY + piece.height / 2) * this.renderer.cellSize;
    this.showFloatingScore(centerX, centerY, points);
    
    this.hand[pieceIndex] = null;
    
    if (this.hand.every(p => p === null)) {
      this.hand = this.pieceGenerator.generateBatch();
    }
    
    this.updateScoreDisplay();
    
    // Check game over after animation completes (if there was a clear)
    if (clearCount > 0) {
      setTimeout(() => {
        this.checkGameOver();
      }, 450); // Slightly longer than animation duration
    } else {
      this.checkGameOver();
    }
    
    this.render();
    return true;
  }

  async animateClears(clears) {
    this.isAnimating = true;
    
    const duration = 400;
    const steps = 20;
    const stepDuration = duration / steps;
    
    for (let step = 0; step <= steps; step++) {
      await this.sleep(stepDuration);
    }
    
    this.grid.clearLines(clears);
    this.isAnimating = false;
    this.render();
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
    
    if (modal && finalScore && highScore) {
      finalScore.textContent = this.scoreManager.getScore();
      highScore.textContent = this.scoreManager.getHighScore();
      modal.classList.remove('hidden');
      
      const usernameInput = document.getElementById('username');
      if (usernameInput) {
        usernameInput.focus();
      }
    }
  }

  hideGameOverModal() {
    const modal = document.getElementById('game-over-modal');
    if (modal) {
      modal.classList.add('hidden');
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
        // Close game over modal and show leaderboard
        this.hideGameOverModal();
        const leaderboard = document.getElementById('leaderboard-container');
        if (leaderboard) {
          leaderboard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });
      
    } catch (error) {
      console.error('Error submitting score:', error);
      this.showDialog('Failed to submit score. Please try again.');
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
        this.renderLeaderboard(data.data);
      } else {
        throw new Error('Invalid response format');
      }
      
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      loading.textContent = 'Failed to load';
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
  }
}
