# Phase 5: Game Flow Integration

## Task 5.1: Create Game Controller Class

**Description:** Implement main Game class to orchestrate all components.

**File:** `/public/js/Game.js`

**Class Structure:**
```javascript
class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.grid = new Grid();
    this.scoreManager = new ScoreManager();
    this.renderer = new Renderer(canvas);
    this.inputHandler = new InputHandler(canvas, this);
    this.pieceGenerator = new PieceGenerator();
    
    this.hand = [];
    this.isGameOver = false;
    this.isAnimating = false;
    
    this.init();
  }
  
  init() {
    this.grid.reset();
    this.scoreManager.reset();
    this.hand = this.pieceGenerator.generateBatch();
    this.isGameOver = false;
    this.render();
  }
  
  render(previewPiece = null, previewX = null, previewY = null, potentialClears = null) {
    this.renderer.drawGrid(this.grid.cells);
    
    if (potentialClears) {
      this.renderer.highlightClears(potentialClears);
    }
    
    if (previewPiece && previewX !== null && previewY !== null) {
      this.renderer.drawGhostPreview(previewPiece, previewX, previewY);
    }
    
    this.renderer.drawHand(this.hand);
    this.renderScore();
  }
  
  renderScore() {
    // Update score display in UI
    document.getElementById('current-score').textContent = this.scoreManager.getScore();
    document.getElementById('high-score').textContent = this.scoreManager.getHighScore();
  }
}
```

**Acceptance Criteria:**
- [ ] Game class initializes all components
- [ ] Components can communicate through Game controller
- [ ] Render method orchestrates all drawing
- [ ] Score display updates
- [ ] Clean initialization and reset

---

## Task 5.2: Integrate All Components in Game Controller

**Description:** Connect Grid, Pieces, Score, Renderer, and Input systems.

**Component Integration:**
```javascript
placePiece(pieceIndex, gridX, gridY) {
  const piece = this.hand[pieceIndex];
  
  if (!piece || !this.grid.canPlacePiece(piece, gridX, gridY)) {
    return false;
  }
  
  // Place piece on grid
  this.grid.placePiece(piece, gridX, gridY);
  
  // Count blocks placed
  const blockCount = this.countBlocks(piece);
  
  // Check for clears
  const clears = this.grid.checkClears();
  const clearCount = clears.rows.length + clears.cols.length + clears.squares.length;
  
  // Animate clears if any
  if (clearCount > 0) {
    this.animateClears(clears);
  }
  
  // Calculate and update score
  const points = this.scoreManager.calculateScore(blockCount, clearCount);
  this.showFloatingScore(gridX, gridY, points);
  
  // Remove piece from hand
  this.hand[pieceIndex] = null;
  
  // Check if hand is empty
  if (this.hand.every(p => p === null)) {
    this.hand = this.pieceGenerator.generateBatch();
  }
  
  // Check for game over
  this.checkGameOver();
  
  this.render();
  return true;
}

countBlocks(piece) {
  let count = 0;
  for (let row = 0; row < piece.shape.length; row++) {
    for (let col = 0; col < piece.shape[row].length; col++) {
      if (piece.shape[row][col] === 1) count++;
    }
  }
  return count;
}
```

**Acceptance Criteria:**
- [ ] All components work together seamlessly
- [ ] Piece placement updates grid state
- [ ] Score calculation triggered correctly
- [ ] Hand management works
- [ ] Game flow is smooth and logical

---

## Task 5.3: Implement Turn Logic and Hand Management

**Description:** Manage piece batches and turn progression.

**Hand Management:**
```javascript
refreshHand() {
  // Check if all pieces used
  const allUsed = this.hand.every(piece => piece === null);
  
  if (allUsed) {
    this.hand = this.pieceGenerator.generateBatch();
    this.render();
  }
}

getRemainingPieces() {
  return this.hand.filter(piece => piece !== null);
}

isPieceInHand(pieceIndex) {
  return this.hand[pieceIndex] !== null;
}
```

**Turn Flow:**
```javascript
processTurn(pieceIndex, gridX, gridY) {
  if (this.isGameOver || this.isAnimating) {
    return false;
  }
  
  // Attempt placement
  const success = this.placePiece(pieceIndex, gridX, gridY);
  
  if (success) {
    // Refresh hand if needed
    this.refreshHand();
    
    // Check game over after each turn
    setTimeout(() => {
      this.checkGameOver();
    }, 500); // After animations
  }
  
  return success;
}
```

**Acceptance Criteria:**
- [ ] Hand automatically refreshes when empty
- [ ] Exactly 3 pieces generated each batch
- [ ] Turn processing is sequential
- [ ] Game state updated correctly
- [ ] Used pieces properly removed from hand

---

## Task 5.4: Implement Game Over Detection Algorithm

**Description:** Check if any valid moves remain for any piece in hand.

**Game Over Check:**
```javascript
checkGameOver() {
  const remainingPieces = this.getRemainingPieces();
  
  if (remainingPieces.length === 0) {
    return; // Hand is full, can't be game over
  }
  
  // Try to place each remaining piece anywhere on the grid
  for (const piece of remainingPieces) {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (this.grid.canPlacePiece(piece, col, row)) {
          return false; // Found valid move, game continues
        }
      }
    }
  }
  
  // No valid moves found
  this.triggerGameOver();
  return true;
}
```

**Game Over Trigger:**
```javascript
triggerGameOver() {
  this.isGameOver = true;
  
  // Save high score
  this.scoreManager.saveHighScore();
  
  // Show game over modal
  this.showGameOverModal();
  
  // Log final score
  console.log(`Game Over! Final Score: ${this.scoreManager.getScore()}`);
}
```

**Acceptance Criteria:**
- [ ] Checks all remaining pieces
- [ ] Tests all possible grid positions
- [ ] Only triggers when truly no moves available
- [ ] No false positives (game continues when moves exist)
- [ ] Performance acceptable (< 100ms check time)

---

## Task 5.5: Create Game Over Modal UI

**Description:** Display game over screen with score and options.

**HTML Structure:**
```html
<div id="game-over-modal" class="modal hidden">
  <div class="modal-content">
    <h2>Game Over!</h2>
    <p class="final-score">Score: <span id="final-score">0</span></p>
    <p class="high-score">High Score: <span id="modal-high-score">0</span></p>
    
    <div class="username-input">
      <label for="username">Enter Name:</label>
      <input type="text" id="username" maxlength="20" placeholder="Player">
    </div>
    
    <div class="modal-buttons">
      <button id="submit-score-btn">Submit Score</button>
      <button id="play-again-btn">Play Again</button>
    </div>
  </div>
</div>
```

**CSS Styling:**
```css
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal.hidden {
  display: none;
}

.modal-content {
  background: #1a1a2e;
  padding: 40px;
  border-radius: 10px;
  text-align: center;
  color: #fff;
  max-width: 400px;
}

.final-score {
  font-size: 36px;
  color: #e94560;
  margin: 20px 0;
}

.modal-buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 20px;
}

button {
  padding: 10px 20px;
  font-size: 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  background: #0f3460;
  color: #fff;
  transition: background 0.3s;
}

button:hover {
  background: #e94560;
}
```

**Show Modal Function:**
```javascript
showGameOverModal() {
  const modal = document.getElementById('game-over-modal');
  const finalScore = document.getElementById('final-score');
  const highScore = document.getElementById('modal-high-score');
  
  finalScore.textContent = this.scoreManager.getScore();
  highScore.textContent = this.scoreManager.getHighScore();
  
  modal.classList.remove('hidden');
  
  // Focus username input
  document.getElementById('username').focus();
}

hideGameOverModal() {
  const modal = document.getElementById('game-over-modal');
  modal.classList.add('hidden');
}
```

**Acceptance Criteria:**
- [ ] Modal appears centered on screen
- [ ] Displays final score prominently
- [ ] Shows high score for comparison
- [ ] Username input field functional
- [ ] Submit and Play Again buttons visible
- [ ] Modal blocks interaction with game
- [ ] Keyboard accessible

---

## Task 5.6: Implement Score Submission on Game Over

**Description:** Submit score to backend API when game ends.

**Submit Function:**
```javascript
async submitScore() {
  const username = document.getElementById('username').value.trim() || 'Anonymous';
  const score = this.scoreManager.getScore();
  
  if (username.length > 20) {
    alert('Username must be 20 characters or less');
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
    
    // Show success message
    alert(`Score submitted! Your rank: #${data.rank}`);
    
    // Refresh leaderboard
    await this.loadLeaderboard();
    
  } catch (error) {
    console.error('Error submitting score:', error);
    alert('Failed to submit score. Please try again.');
  }
}
```

**Event Listener:**
```javascript
setupGameOverListeners() {
  document.getElementById('submit-score-btn').addEventListener('click', () => {
    this.submitScore();
  });
  
  document.getElementById('play-again-btn').addEventListener('click', () => {
    this.hideGameOverModal();
    this.init(); // Restart game
  });
  
  // Submit on Enter key
  document.getElementById('username').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      this.submitScore();
    }
  });
}
```

**Acceptance Criteria:**
- [ ] Score submitted via POST /api/score
- [ ] Username validated (1-20 chars)
- [ ] Success message shows rank
- [ ] Error handling for network failures
- [ ] Loading state during submission
- [ ] Leaderboard refreshed after submission

---

## Task 5.7: Implement Restart/Play Again Functionality

**Description:** Allow players to start a new game.

**Restart Function:**
```javascript
restart() {
  // Reset all game state
  this.grid.reset();
  this.scoreManager.reset();
  this.hand = this.pieceGenerator.generateBatch();
  this.isGameOver = false;
  this.isAnimating = false;
  
  // Hide modal
  this.hideGameOverModal();
  
  // Clear username input
  document.getElementById('username').value = '';
  
  // Re-render
  this.render();
  
  console.log('Game restarted');
}
```

**Quick Restart Button (Optional):**
```html
<button id="restart-btn" class="game-button">Restart</button>
```

```javascript
document.getElementById('restart-btn').addEventListener('click', () => {
  if (confirm('Are you sure you want to restart? Your current progress will be lost.')) {
    this.restart();
  }
});
```

**Acceptance Criteria:**
- [ ] All game state reset to initial values
- [ ] Grid cleared
- [ ] Score reset to 0
- [ ] New batch of pieces generated
- [ ] Game immediately playable
- [ ] High score preserved in localStorage
- [ ] Confirmation for mid-game restart
