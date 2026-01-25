# BlockLogic - Technical Specification

## 1. Project Overview

### 1.1 Product Description
BlockLogic is a browser-based puzzle game that combines Sudoku grid mechanics with Tetris-style block placement. Players strategically place polyomino shapes on a 9x9 grid to clear rows, columns, and 3x3 subgrids.

### 1.2 Core Mechanics
- **Grid:** 9x9 playing field divided into nine 3x3 subgrids
- **Pieces:** Polyomino shapes (Tetris-like blocks) presented in batches of 3
- **Objective:** Clear rows, columns, and 3x3 subgrids by filling them completely
- **Game Over:** No valid placement exists for any remaining piece

### 1.3 Technology Stack

#### Frontend
- **Language:** Vanilla JavaScript (ES6+)
- **Rendering:** HTML5 Canvas API (Context 2D)
- **Styling:** CSS3
- **Architecture:** Class-based Object-Oriented Programming

#### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** better-sqlite3
- **API:** RESTful endpoints for leaderboard management

## 2. System Architecture

### 2.1 Directory Structure
```
/dokublocks
├── /public
│   ├── index.html
│   ├── /css
│   │   └── styles.css
│   └── /js
│       ├── main.js
│       ├── Game.js
│       ├── Grid.js
│       ├── Pieces.js
│       ├── ScoreManager.js
│       ├── Renderer.js
│       └── InputHandler.js
├── /src
│   └── server.js
└── /db
    └── game.db
```

### 2.2 Component Architecture

#### Frontend Components
1. **Game Controller** (`Game.js`) - Main orchestrator
2. **Grid Manager** (`Grid.js`) - State management for 9x9 grid
3. **Piece System** (`Pieces.js`) - Shape definitions and generation
4. **Score Tracker** (`ScoreManager.js`) - Score calculation and tracking
5. **Renderer** (`Renderer.js`) - Canvas drawing operations
6. **Input Handler** (`InputHandler.js`) - User interaction processing

#### Backend Components
1. **API Server** (`server.js`) - Express.js REST API
2. **Database** (`game.db`) - SQLite data store

## 3. Core Game Constants

```javascript
const GRID_SIZE = 9;           // 9x9 playing grid
const SUBGRID_SIZE = 3;        // 3x3 subgrid divisions
const PIECES_PER_BATCH = 3;    // Number of pieces per hand
const POINTS_PER_BLOCK = 10;   // Points for placing a single block
const POINTS_PER_CLEAR = 100;  // Base points for clearing a line/square
```

## 4. Functional Specifications

### 4.1 Grid System

#### Data Structure
- **Type:** 2D Array (9x9)
- **Values:** `0` (empty) or `1` (filled)
- **Initialization:** All cells set to `0`

#### Core Methods

**`canPlacePiece(piece, startX, startY): Boolean`**
- **Purpose:** Validates if a piece can be placed at given coordinates
- **Validation:**
  - Check if piece fits within grid boundaries
  - Check for collisions with existing blocks
- **Returns:** `true` if valid, `false` otherwise

**`placePiece(piece, startX, startY): void`**
- **Purpose:** Places piece on grid
- **Action:** Updates grid array cells from `0` to `1` based on piece shape
- **Precondition:** `canPlacePiece()` returned `true`

**`checkClears(): Array`**
- **Purpose:** Identifies completed rows, columns, and subgrids
- **Algorithm:**
  - Scan all 9 rows for full rows
  - Scan all 9 columns for full columns
  - Scan all 9 3x3 subgrids for full squares
- **Returns:** Array of indices/coordinates for cleared elements

### 4.2 Piece System

#### Shape Representation
- **Format:** Matrix notation (2D arrays)
- **Values:** `1` (block present) or `0` (empty space)
- **Example L-shape:**
  ```javascript
  [
    [1, 0],
    [1, 0],
    [1, 1]
  ]
  ```

#### Piece Types
- Single block (1x1)
- Domino (1x2, 2x1)
- L-shapes (various rotations)
- T-shapes (various rotations)
- Squares (2x2)
- Lines (1x3, 3x1, 1x4, 4x1, 1x5, 5x1)
- Other polyominoes

#### Piece Generation
**`PieceGenerator.getRandomBatch(): Array<Piece>`**
- **Returns:** Array of 3 random piece objects
- **Distribution:** Random selection from available shapes
- **Timing:** Called when hand is empty

### 4.3 Scoring System

#### Score Calculation
**`calculateScore(placedBlockCount, clearedLinesCount, streakCount): Number`**

**Formula:**
```
Score = (placedBlockCount × POINTS_PER_BLOCK) 
      + (clearedLinesCount × POINTS_PER_CLEAR)
      + (streakBonus)
```

**Multipliers:**
- Combo multiplier for simultaneous clears
- Streak bonus for consecutive successful placements

#### Score Tracking
- Maintain current session score
- Track high score
- Submit final score to leaderboard on game over

### 4.4 Rendering System

#### Canvas Configuration
- **Resolution:** Responsive (scales to viewport)
- **Grid Layout:** 9x9 cells with visible 3x3 subgrid borders
- **Color Scheme:** Distinct colors for grid lines, blocks, and highlights

#### Core Render Methods

**`drawGrid(gridData): void`**
- Draw 9x9 grid structure
- Draw heavier borders every 3 cells (subgrid divisions)
- Fill cells based on grid state (0=empty, 1=filled)
- Apply visual styling (colors, shadows, gradients)

**`drawHand(pieces): void`**
- Render 3 available pieces below main grid
- Scale pieces for optimal display
- Show piece previews with drag capability

**Visual Effects:**
- Ghost preview for valid placements
- Highlighting for rows/columns/squares to be cleared
- Fade-out animation for cleared blocks
- Floating score text (e.g., "+100")

### 4.5 Input Handling

#### Supported Input Methods
- **Mouse Events:** `mousedown`, `mousemove`, `mouseup`
- **Touch Events:** `touchstart`, `touchmove`, `touchend`

#### Interaction Flow

**1. Selection (Hit Test)**
- Detect if pointer is over a piece in the hand
- Highlight selected piece
- Prepare for drag operation

**2. Dragging**
- Render piece at pointer coordinates
- Calculate grid position under pointer
- Show ghost preview if placement is valid
- Highlight affected rows/columns/squares

**3. Drop**
- If valid position: Place piece, update grid, calculate score
- If invalid position: Return piece to hand
- Trigger clear animation if applicable
- Generate new batch if hand is empty

### 4.6 Game Flow

#### Game States
1. **Active** - Player can place pieces
2. **Animating** - Clearing animation in progress
3. **Game Over** - No valid moves available

#### Turn Sequence
1. Player selects a piece from hand
2. Player drags piece over grid
3. Visual feedback shows valid/invalid placement
4. Player drops piece
5. If valid:
   - Place piece on grid
   - Check for clears
   - Animate clears
   - Update score
   - Remove piece from hand
6. If hand is empty, generate 3 new pieces
7. Check for game over condition

#### Game Over Detection
**Algorithm:**
```
For each remaining piece in hand:
  For each position (x, y) in grid:
    If canPlacePiece(piece, x, y):
      Return false (game continues)
Return true (game over)
```

#### Game Over Flow
1. Display "Game Over" modal overlay
2. Show final score
3. Prompt for username
4. Submit score via `POST /api/score`
5. Display updated leaderboard
6. Offer "Play Again" option

## 5. API Specifications

### 5.1 Leaderboard Endpoints

#### GET /api/leaderboard
**Description:** Retrieve top 10 scores

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "username": "Player1",
      "score": 5420,
      "timestamp": "2026-01-25T10:30:00Z"
    }
  ]
}
```

**Status Codes:**
- `200` - Success
- `500` - Server error

#### POST /api/score
**Description:** Submit new score

**Request Body:**
```json
{
  "username": "Player1",
  "score": 5420
}
```

**Validation:**
- `username`: Required, string, 1-20 characters
- `score`: Required, integer, >= 0

**Response:**
```json
{
  "success": true,
  "message": "Score submitted successfully",
  "rank": 7
}
```

**Status Codes:**
- `201` - Score created
- `400` - Validation error
- `500` - Server error

## 6. Database Schema

### 6.1 Scores Table

```sql
CREATE TABLE IF NOT EXISTS scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL,
  score INTEGER NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_score ON scores(score DESC);
```

**Fields:**
- `id` - Auto-incrementing primary key
- `username` - Player identifier (TEXT)
- `score` - Game score (INTEGER)
- `timestamp` - Submission time (DATETIME)

## 7. Testing Requirements

### 7.1 Unit Tests

**Grid Tests:**
- `canPlacePiece()` boundary validation
- `canPlacePiece()` collision detection
- `placePiece()` grid state updates
- `checkClears()` row detection
- `checkClears()` column detection
- `checkClears()` 3x3 subgrid detection

**Scoring Tests:**
- Block placement points calculation
- Clear bonus calculation
- Combo multiplier application
- Streak bonus calculation

**Piece Tests:**
- Piece generation randomness
- Piece matrix integrity
- Batch generation (exactly 3 pieces)

### 7.2 Integration Tests

**Game Flow Tests:**
- Complete turn cycle
- Hand replenishment after emptying
- Score persistence to database
- Leaderboard retrieval and display

**Game Over Tests:**
- Correct detection when no moves available
- False negatives (game continues when moves exist)
- Score submission on game over

### 7.3 User Interaction Tests

**Input Tests:**
- Mouse drag and drop
- Touch drag and drop
- Invalid placement rejection
- Valid placement acceptance

**Visual Tests:**
- Ghost preview rendering
- Highlight rendering
- Animation playback
- Responsive canvas sizing

## 8. Implementation Phases

### Phase 1: Backend Setup
- Initialize Node.js project
- Install dependencies (express, cors, better-sqlite3)
- Create folder structure
- Setup database schema
- Implement API endpoints
- Configure static file serving

### Phase 2: Core Game Logic
- Implement Grid class
- Implement Piece definitions
- Implement PieceGenerator
- Implement ScoreManager
- Unit test core logic

### Phase 3: Rendering & Interaction
- Implement Renderer class
- Implement InputHandler class
- Create canvas layout
- Implement drag and drop
- Add visual feedback

### Phase 4: Game Flow Integration
- Implement Game controller
- Integrate all components
- Implement turn logic
- Implement game over detection
- Implement restart functionality

### Phase 5: Polish & Testing
- Add animations
- Implement leaderboard UI
- Comprehensive testing
- UI/UX refinements
- Performance optimization

## 9. Non-Functional Requirements

### 9.1 Performance
- Render loop: 60 FPS target
- API response time: < 200ms
- Game state updates: Immediate (< 16ms)

### 9.2 Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Desktop and mobile devices
- Responsive design (320px - 2560px width)

### 9.3 Usability
- Intuitive drag-and-drop interface
- Clear visual feedback
- Accessible controls (mouse and touch)
- Smooth animations

### 9.4 Maintainability
- Clean code separation
- Comprehensive comments
- Consistent naming conventions
- Modular architecture
