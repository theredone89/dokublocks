# Phase 2: Core Game Logic

## Task 2.1: Implement Grid Class with 9x9 Array

**Description:** Create the Grid class to manage the 9x9 game board state.

**File:** `/public/js/Grid.js`

**Data Structure:**
```javascript
class Grid {
  constructor() {
    this.size = 9;
    this.cells = this.initializeGrid();
  }
  
  initializeGrid() {
    // Create 9x9 array filled with 0s
    return Array(9).fill().map(() => Array(9).fill(0));
  }
}
```

**Steps:**
1. Create Grid.js file
2. Define Grid class with constructor
3. Initialize 9x9 2D array (0 = empty, 1 = filled)
4. Add reset() method to clear grid
5. Add getCell(x, y) and setCell(x, y, value) helpers

**Acceptance Criteria:**
- [ ] Grid class created
- [ ] 9x9 array initialized with zeros
- [ ] Array is mutable and can be updated
- [ ] Helper methods for cell access implemented
- [ ] Reset functionality works

---

## Task 2.2: Implement Grid.canPlacePiece() Method

**Description:** Add validation logic to check if a piece can be placed at a given position.

**Method Signature:**
```javascript
canPlacePiece(piece, startX, startY) {
  // Returns Boolean
}
```

**Validation Checks:**
1. **Boundary Check:** Ensure piece fits within 9x9 grid
2. **Collision Check:** Verify no overlap with existing blocks

**Algorithm:**
```javascript
canPlacePiece(piece, startX, startY) {
  for (let row = 0; row < piece.shape.length; row++) {
    for (let col = 0; col < piece.shape[row].length; col++) {
      if (piece.shape[row][col] === 1) {
        const gridX = startX + col;
        const gridY = startY + row;
        
        // Boundary check
        if (gridX < 0 || gridX >= 9 || gridY < 0 || gridY >= 9) {
          return false;
        }
        
        // Collision check
        if (this.cells[gridY][gridX] === 1) {
          return false;
        }
      }
    }
  }
  return true;
}
```

**Acceptance Criteria:**
- [ ] Returns false if piece extends beyond grid boundaries
- [ ] Returns false if piece overlaps with existing blocks
- [ ] Returns true only when placement is valid
- [ ] Handles all piece shapes correctly

---

## Task 2.3: Implement Grid.placePiece() Method

**Description:** Add method to place a piece on the grid.

**Method Signature:**
```javascript
placePiece(piece, startX, startY) {
  // Returns void
}
```

**Algorithm:**
```javascript
placePiece(piece, startX, startY) {
  for (let row = 0; row < piece.shape.length; row++) {
    for (let col = 0; col < piece.shape[row].length; col++) {
      if (piece.shape[row][col] === 1) {
        const gridX = startX + col;
        const gridY = startY + row;
        this.cells[gridY][gridX] = 1;
      }
    }
  }
}
```

**Steps:**
1. Iterate through piece matrix
2. Update grid cells from 0 to 1 where piece blocks exist
3. Assume validation already performed by canPlacePiece()

**Acceptance Criteria:**
- [ ] Grid cells updated correctly
- [ ] Only cells with piece blocks (value 1) are modified
- [ ] Grid state accurately reflects placed piece
- [ ] No boundary or collision checks needed (already validated)

---

## Task 2.4: Implement Grid.checkClears() Method

**Description:** Detect and return all completed rows, columns, and 3x3 subgrids.

**Method Signature:**
```javascript
checkClears() {
  // Returns { rows: [], cols: [], squares: [] }
}
```

**Detection Algorithm:**

**Rows:**
```javascript
checkRows() {
  const clearedRows = [];
  for (let row = 0; row < 9; row++) {
    if (this.cells[row].every(cell => cell === 1)) {
      clearedRows.push(row);
    }
  }
  return clearedRows;
}
```

**Columns:**
```javascript
checkColumns() {
  const clearedCols = [];
  for (let col = 0; col < 9; col++) {
    let isFull = true;
    for (let row = 0; row < 9; row++) {
      if (this.cells[row][col] === 0) {
        isFull = false;
        break;
      }
    }
    if (isFull) clearedCols.push(col);
  }
  return clearedCols;
}
```

**3x3 Subgrids:**
```javascript
checkSquares() {
  const clearedSquares = [];
  for (let squareRow = 0; squareRow < 3; squareRow++) {
    for (let squareCol = 0; squareCol < 3; squareCol++) {
      if (this.isSquareFull(squareRow, squareCol)) {
        clearedSquares.push({ row: squareRow, col: squareCol });
      }
    }
  }
  return clearedSquares;
}

isSquareFull(squareRow, squareCol) {
  const startRow = squareRow * 3;
  const startCol = squareCol * 3;
  for (let row = startRow; row < startRow + 3; row++) {
    for (let col = startCol; col < startCol + 3; col++) {
      if (this.cells[row][col] === 0) return false;
    }
  }
  return true;
}
```

**Acceptance Criteria:**
- [ ] Correctly identifies all full rows (9 cells filled)
- [ ] Correctly identifies all full columns (9 cells filled)
- [ ] Correctly identifies all full 3x3 subgrids (9 cells filled)
- [ ] Returns structured object with arrays of indices
- [ ] Handles multiple simultaneous clears

---

## Task 2.5: Define Polyomino Piece Shapes as Matrices

**Description:** Create shape definitions for all game pieces.

**File:** `/public/js/Pieces.js`

**Shape Format:**
```javascript
const PIECE_SHAPES = {
  // Single block
  DOT: [[1]],
  
  // Dominoes
  DOMINO_H: [[1, 1]],
  DOMINO_V: [[1], [1]],
  
  // Trominoes
  L_SMALL: [[1, 0], [1, 1]],
  L_SMALL_R: [[0, 1], [1, 1]],
  LINE_3_H: [[1, 1, 1]],
  LINE_3_V: [[1], [1], [1]],
  
  // Tetrominoes
  L_LARGE: [[1, 0], [1, 0], [1, 1]],
  L_LARGE_R: [[0, 1], [0, 1], [1, 1]],
  L_LARGE_F: [[1, 1], [1, 0], [1, 0]],
  L_LARGE_FR: [[1, 1], [0, 1], [0, 1]],
  T_SHAPE: [[1, 1, 1], [0, 1, 0]],
  SQUARE: [[1, 1], [1, 1]],
  Z_SHAPE: [[1, 1, 0], [0, 1, 1]],
  S_SHAPE: [[0, 1, 1], [1, 1, 0]],
  LINE_4_H: [[1, 1, 1, 1]],
  LINE_4_V: [[1], [1], [1], [1]],
  
  // Pentominoes
  LINE_5_H: [[1, 1, 1, 1, 1]],
  LINE_5_V: [[1], [1], [1], [1], [1]]
};
```

**Piece Class:**
```javascript
class Piece {
  constructor(shape, name) {
    this.shape = shape;
    this.name = name;
    this.width = shape[0].length;
    this.height = shape.length;
  }
}
```

**Acceptance Criteria:**
- [ ] All piece types defined as matrices
- [ ] Each piece uses 1 for blocks, 0 for empty spaces
- [ ] Piece class created with shape property
- [ ] Width and height calculated correctly

---

## Task 2.6: Implement PieceGenerator Class

**Description:** Create random piece generation system.

**File:** `/public/js/Pieces.js`

**Class Structure:**
```javascript
class PieceGenerator {
  constructor() {
    this.availableShapes = Object.keys(PIECE_SHAPES);
  }
  
  getRandomPiece() {
    const randomShape = this.availableShapes[
      Math.floor(Math.random() * this.availableShapes.length)
    ];
    return new Piece(PIECE_SHAPES[randomShape], randomShape);
  }
  
  generateBatch() {
    return [
      this.getRandomPiece(),
      this.getRandomPiece(),
      this.getRandomPiece()
    ];
  }
}
```

**Acceptance Criteria:**
- [ ] Generates exactly 3 pieces per batch
- [ ] Pieces selected randomly from available shapes
- [ ] Each piece is independent (can have duplicates)
- [ ] Returns array of Piece objects

---

## Task 2.7: Implement ScoreManager Class

**Description:** Create score tracking and calculation system.

**File:** `/public/js/ScoreManager.js`

**Class Structure:**
```javascript
class ScoreManager {
  constructor() {
    this.currentScore = 0;
    this.highScore = this.loadHighScore();
    this.streak = 0;
    this.lastClearCount = 0;
  }
  
  loadHighScore() {
    return parseInt(localStorage.getItem('highScore') || '0');
  }
  
  saveHighScore() {
    if (this.currentScore > this.highScore) {
      this.highScore = this.currentScore;
      localStorage.setItem('highScore', this.highScore.toString());
    }
  }
  
  reset() {
    this.currentScore = 0;
    this.streak = 0;
    this.lastClearCount = 0;
  }
  
  getScore() {
    return this.currentScore;
  }
  
  getHighScore() {
    return this.highScore;
  }
}
```

**Acceptance Criteria:**
- [ ] Tracks current score
- [ ] Loads/saves high score from localStorage
- [ ] Maintains streak counter
- [ ] Reset functionality works
- [ ] Getters for score and high score

---

## Task 2.8: Implement calculateScore() Method with Multipliers

**Description:** Add score calculation logic with combo and streak bonuses.

**Method Signature:**
```javascript
calculateScore(placedBlockCount, clearedLinesCount, streakCount) {
  // Returns updated score
}
```

**Scoring Formula:**
```javascript
calculateScore(placedBlockCount, clearedLinesCount) {
  const POINTS_PER_BLOCK = 10;
  const POINTS_PER_CLEAR = 100;
  
  // Base points for placing blocks
  let points = placedBlockCount * POINTS_PER_BLOCK;
  
  // Clear bonuses
  if (clearedLinesCount > 0) {
    points += clearedLinesCount * POINTS_PER_CLEAR;
    
    // Combo multiplier for multiple simultaneous clears
    if (clearedLinesCount >= 2) {
      const comboBonus = (clearedLinesCount - 1) * 50;
      points += comboBonus;
    }
    
    // Streak bonus
    this.streak++;
    if (this.streak >= 3) {
      const streakBonus = this.streak * 25;
      points += streakBonus;
    }
  } else {
    this.streak = 0;
  }
  
  this.currentScore += points;
  this.saveHighScore();
  
  return points; // Return points earned this turn
}
```

**Acceptance Criteria:**
- [ ] Block placement points calculated correctly (10 per block)
- [ ] Clear bonus applied (100 per line/square)
- [ ] Combo multiplier for multiple clears
- [ ] Streak bonus increases with consecutive clears
- [ ] Streak resets when no clears occur
- [ ] High score updated if exceeded
