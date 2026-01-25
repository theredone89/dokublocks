# Phase 7: Testing & Setup

## Task 7.1: Write Unit Tests for Grid Class

**Description:** Create comprehensive tests for Grid functionality.

**Test File:** `/tests/grid.test.js` (if using a test framework)

**Manual Test Cases:**

### Test 1: Grid Initialization
```javascript
// Create new grid
const grid = new Grid();

// Verify size
console.assert(grid.cells.length === 9, 'Grid should have 9 rows');
console.assert(grid.cells[0].length === 9, 'Grid should have 9 columns');

// Verify all cells are empty
let allEmpty = true;
for (let row = 0; row < 9; row++) {
  for (let col = 0; col < 9; col++) {
    if (grid.cells[row][col] !== 0) {
      allEmpty = false;
    }
  }
}
console.assert(allEmpty, 'All cells should be initialized to 0');
```

### Test 2: canPlacePiece - Boundary Validation
```javascript
const grid = new Grid();
const piece = new Piece([[1, 1], [1, 1]], 'SQUARE');

// Valid placement
console.assert(grid.canPlacePiece(piece, 0, 0) === true, 'Should place at top-left');
console.assert(grid.canPlacePiece(piece, 7, 7) === true, 'Should place at bottom-right');

// Invalid - out of bounds
console.assert(grid.canPlacePiece(piece, 8, 8) === false, 'Should not place beyond grid');
console.assert(grid.canPlacePiece(piece, -1, 0) === false, 'Should not place at negative coords');
console.assert(grid.canPlacePiece(piece, 0, 9) === false, 'Should not place beyond bottom edge');
```

### Test 3: canPlacePiece - Collision Detection
```javascript
const grid = new Grid();
const piece = new Piece([[1]], 'DOT');

// Place first piece
grid.placePiece(piece, 4, 4);

// Try to place at same location
console.assert(grid.canPlacePiece(piece, 4, 4) === false, 'Should detect collision');

// Try adjacent location
console.assert(grid.canPlacePiece(piece, 4, 5) === true, 'Should allow adjacent placement');
```

### Test 4: checkClears - Row Detection
```javascript
const grid = new Grid();

// Fill entire row 0
for (let col = 0; col < 9; col++) {
  grid.cells[0][col] = 1;
}

const clears = grid.checkClears();
console.assert(clears.rows.includes(0), 'Should detect filled row 0');
console.assert(clears.rows.length === 1, 'Should detect exactly 1 row');
```

### Test 5: checkClears - Column Detection
```javascript
const grid = new Grid();

// Fill entire column 5
for (let row = 0; row < 9; row++) {
  grid.cells[row][5] = 1;
}

const clears = grid.checkClears();
console.assert(clears.cols.includes(5), 'Should detect filled column 5');
console.assert(clears.cols.length === 1, 'Should detect exactly 1 column');
```

### Test 6: checkClears - 3x3 Square Detection
```javascript
const grid = new Grid();

// Fill top-left 3x3 square
for (let row = 0; row < 3; row++) {
  for (let col = 0; col < 3; col++) {
    grid.cells[row][col] = 1;
  }
}

const clears = grid.checkClears();
console.assert(clears.squares.length === 1, 'Should detect 1 filled square');
console.assert(clears.squares[0].row === 0 && clears.squares[0].col === 0, 
  'Should identify top-left square');
```

**Acceptance Criteria:**
- [ ] All test cases pass
- [ ] Boundary conditions tested
- [ ] Collision detection validated
- [ ] Clear detection for rows works
- [ ] Clear detection for columns works
- [ ] Clear detection for 3x3 squares works

---

## Task 7.2: Write Unit Tests for ScoreManager

**Description:** Test score calculation and tracking.

### Test 1: Score Initialization
```javascript
const scoreManager = new ScoreManager();

console.assert(scoreManager.getScore() === 0, 'Initial score should be 0');
console.assert(scoreManager.streak === 0, 'Initial streak should be 0');
```

### Test 2: Block Placement Points
```javascript
const scoreManager = new ScoreManager();

// Place 4 blocks (2x2 square)
const points = scoreManager.calculateScore(4, 0);

console.assert(points === 40, 'Should get 40 points for 4 blocks (4 × 10)');
console.assert(scoreManager.getScore() === 40, 'Total score should be 40');
```

### Test 3: Clear Bonus
```javascript
const scoreManager = new ScoreManager();

// Place 3 blocks and clear 1 line
const points = scoreManager.calculateScore(3, 1);

// 3 blocks × 10 = 30
// 1 clear × 100 = 100
// Total = 130
console.assert(points === 130, 'Should get 130 points (30 + 100)');
```

### Test 4: Combo Multiplier
```javascript
const scoreManager = new ScoreManager();

// Clear 3 lines simultaneously
const points = scoreManager.calculateScore(0, 3);

// 3 clears × 100 = 300
// Combo bonus (3 - 1) × 50 = 100
// Total = 400
console.assert(points === 400, 'Should get 400 points with combo bonus');
```

### Test 5: Streak Bonus
```javascript
const scoreManager = new ScoreManager();

// First clear
scoreManager.calculateScore(0, 1);
console.assert(scoreManager.streak === 1, 'Streak should be 1');

// Second clear
scoreManager.calculateScore(0, 1);
console.assert(scoreManager.streak === 2, 'Streak should be 2');

// Third clear (streak bonus kicks in)
const points = scoreManager.calculateScore(0, 1);
console.assert(scoreManager.streak === 3, 'Streak should be 3');
// 100 (clear) + 75 (streak 3 × 25) = 175
console.assert(points === 175, 'Should get streak bonus on 3rd clear');

// No clear (streak resets)
scoreManager.calculateScore(5, 0);
console.assert(scoreManager.streak === 0, 'Streak should reset to 0');
```

**Acceptance Criteria:**
- [ ] Score initialization correct
- [ ] Block placement points calculated
- [ ] Clear bonuses applied
- [ ] Combo multipliers work
- [ ] Streak tracking functional
- [ ] Streak resets appropriately

---

## Task 7.3: Write Integration Tests for Game Flow

**Description:** Test complete game scenarios end-to-end.

### Test 1: Complete Turn Cycle
```javascript
// Initialize game
const canvas = document.getElementById('game-canvas');
const game = new Game(canvas);

// Verify initial state
console.assert(game.hand.length === 3, 'Should start with 3 pieces');
console.assert(game.isGameOver === false, 'Game should not be over');
console.assert(game.scoreManager.getScore() === 0, 'Score should be 0');

// Place first piece
const success = game.placePiece(0, 0, 0);
console.assert(success === true, 'Piece placement should succeed');
console.assert(game.hand[0] === null, 'Used piece should be removed');
```

### Test 2: Hand Refresh
```javascript
const game = new Game(canvas);

// Use all 3 pieces
game.placePiece(0, 0, 0);
game.placePiece(1, 2, 0);
game.placePiece(2, 4, 0);

// Hand should refresh
game.refreshHand();
console.assert(game.hand.every(p => p !== null), 'Hand should be refilled');
console.assert(game.hand.length === 3, 'Should have 3 new pieces');
```

### Test 3: Score Persistence
```javascript
const game = new Game(canvas);

// Make some moves to score points
game.grid.cells[0] = [1, 1, 1, 1, 1, 1, 1, 1, 0]; // Almost full row
const piece = new Piece([[1]], 'DOT');
game.placePiece(piece, 8, 0);

const scoreBefore = game.scoreManager.getScore();
console.assert(scoreBefore > 0, 'Should have scored points');

// Restart game
game.restart();
console.assert(game.scoreManager.getScore() === 0, 'Score should reset');
console.assert(game.scoreManager.getHighScore() >= scoreBefore, 'High score should persist');
```

**Acceptance Criteria:**
- [ ] Complete turns execute correctly
- [ ] Hand management works in practice
- [ ] Scores persist and reset appropriately
- [ ] Game state transitions smoothly
- [ ] No crashes or errors during normal play

---

## Task 7.4: Test Drag-and-Drop on Mouse and Touch Devices

**Description:** Validate input handling across different devices.

### Manual Test Checklist:

**Mouse Tests:**
- [ ] Click on piece in hand selects it
- [ ] Drag shows ghost preview on grid
- [ ] Valid placement highlighted in green/preview color
- [ ] Invalid placement shows no preview
- [ ] Drop on valid position places piece
- [ ] Drop on invalid position returns piece to hand
- [ ] Cursor changes appropriately during drag

**Touch Tests (Mobile/Tablet):**
- [ ] Touch on piece in hand selects it
- [ ] Drag with finger shows ghost preview
- [ ] Preview follows finger accurately
- [ ] Valid/invalid placement feedback works
- [ ] Release on valid position places piece
- [ ] Release on invalid position returns piece
- [ ] No page scrolling during drag
- [ ] Responsive to finger movements

**Cross-Browser Tests:**
- [ ] Chrome desktop mouse
- [ ] Firefox desktop mouse
- [ ] Safari desktop mouse
- [ ] Chrome mobile touch
- [ ] Safari iOS touch
- [ ] Firefox Android touch

**Edge Cases:**
- [ ] Double-click doesn't break state
- [ ] Rapid clicking handled gracefully
- [ ] Multi-touch ignored (only first touch)
- [ ] Drag outside canvas handled
- [ ] Window resize during drag

**Acceptance Criteria:**
- [ ] Both mouse and touch work flawlessly
- [ ] No duplicate event firing
- [ ] Smooth, responsive feedback
- [ ] Works on all major browsers
- [ ] No UI glitches or lag

---

## Task 7.5: Create index.html with Canvas Element

**Description:** Build main HTML structure for the game.

**File:** `/public/index.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BlockLogic - Blockudoku Game</title>
  <link rel="stylesheet" href="css/styles.css">
</head>
<body>
  <div class="container">
    <header>
      <h1>BlockLogic</h1>
      <div class="score-display">
        <div class="score-item">
          <span class="score-label">Score:</span>
          <span id="current-score" class="score-value">0</span>
        </div>
        <div class="score-item">
          <span class="score-label">High Score:</span>
          <span id="high-score" class="score-value">0</span>
        </div>
      </div>
    </header>

    <main>
      <div class="game-area">
        <canvas id="game-canvas" width="600" height="800"></canvas>
        <button id="restart-btn" class="game-button">Restart Game</button>
      </div>

      <aside id="leaderboard-container">
        <h2>Leaderboard</h2>
        <div id="leaderboard-loading" class="loading">Loading...</div>
        <ol id="leaderboard-list" class="hidden"></ol>
        <button id="refresh-leaderboard-btn">Refresh</button>
      </aside>
    </main>
  </div>

  <!-- Game Over Modal -->
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

  <!-- Scripts -->
  <script src="js/Grid.js"></script>
  <script src="js/Pieces.js"></script>
  <script src="js/ScoreManager.js"></script>
  <script src="js/Renderer.js"></script>
  <script src="js/InputHandler.js"></script>
  <script src="js/Game.js"></script>
  <script src="js/main.js"></script>
</body>
</html>
```

**Acceptance Criteria:**
- [ ] Proper HTML5 structure
- [ ] Canvas element sized appropriately
- [ ] All UI elements present
- [ ] Modal hidden by default
- [ ] Scripts loaded in correct order
- [ ] Responsive viewport meta tag
- [ ] Semantic HTML elements used

---

## Task 7.6: Create CSS Styling and Layout

**Description:** Style the game interface.

**File:** `/public/css/styles.css`

```css
/* See full CSS in previous tasks */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Arial', sans-serif;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: #fff;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.container {
  max-width: 1200px;
  width: 100%;
  padding: 20px;
}

header {
  text-align: center;
  margin-bottom: 30px;
}

h1 {
  font-size: 48px;
  color: #e94560;
  margin-bottom: 20px;
}

main {
  display: flex;
  gap: 30px;
  justify-content: center;
  align-items: flex-start;
}

.game-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

#game-canvas {
  border: 3px solid #0f3460;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

/* ... rest of styles from previous tasks ... */
```

**Acceptance Criteria:**
- [ ] Clean, modern design
- [ ] Responsive layout
- [ ] Proper spacing and alignment
- [ ] Readable typography
- [ ] Accessible color contrast
- [ ] Smooth transitions and hover effects

---

## Task 7.7: Create main.js Entry Point

**Description:** Initialize the game application.

**File:** `/public/js/main.js`

```javascript
// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
  // Get canvas element
  const canvas = document.getElementById('game-canvas');
  
  if (!canvas) {
    console.error('Canvas element not found');
    return;
  }
  
  // Initialize game
  const game = new Game(canvas);
  
  // Make game accessible globally for debugging
  window.game = game;
  
  console.log('BlockLogic game initialized');
  console.log('Use window.game to access game instance');
});
```

**Acceptance Criteria:**
- [ ] Game initializes on page load
- [ ] No errors in console
- [ ] Canvas properly detected
- [ ] Game instance created
- [ ] Initial render complete
- [ ] All components functional
