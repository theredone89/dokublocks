# copilot.md

## Project Overview

**Title:** BlockLogic (Blockudoku Replica)

**Description:** A browser-based puzzle game combining Sudoku grids with Tetris-style block placement. The game features a 9x9 grid where players place polyomino shapes to clear rows, columns, and 3x3 subgrids.

**Architecture:**

- **Frontend:** Vanilla JavaScript (ES6+), HTML5 Canvas for rendering, CSS for layout.
- **Backend:** Node.js (Express) for leaderboard management and score validation.

## Technical Stack & Constants

### Frontend

- **Entry Point:** `index.html`, `main.js`
- **Rendering:** HTML5 Canvas API (Context 2D)
- **State Management:** Class-based OOP (Game, Grid, Piece, Score)

### Backend

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** better-sqlite3 (or simple JSON store for MVP)

### Game Constants

- **Grid Size:** 9x9
- **Subgrid Size:** 3x3
- **Batch Size:** 3 pieces generated at a time.
- **Scoring:**
  - Block placement: 10 points per cell.
  - Line/Square clear: 100 points.
  - Combo/Streak multipliers applied for simultaneous or consecutive clears.

## Development Roadmap & Tasks

### Phase 1: Environment & Backend Setup

#### Task 1.1: Project Initialization

- Initialize a new Node.js project (`npm init -y`).
- Install dependencies: `express`, `cors`, `better-sqlite3`.
- Setup folder structure:
  - `/public` (Frontend assets: `index.html`, `css/`, `js/`)
  - `/src` (Backend logic)
  - `/db` (Database files)

#### Task 1.2: Database Schema

- Create a SQLite database initialization script.
- Table: `scores`
  - `id` (INTEGER, PK)
  - `username` (TEXT)
  - `score` (INTEGER)
  - `timestamp` (DATETIME)

#### Task 1.3: API Endpoints

- Create `server.js` with Express.
- Endpoint: `GET /api/leaderboard`
  - Returns top 10 scores sorted by descending order.
- Endpoint: `POST /api/score`
  - Accepts `{ username, score }`.
  - Validates input types.
  - Inserts into the database.
- Serve static files from `/public`.

### Phase 2: Frontend Core Logic (The Engine)

#### Task 2.1: The Grid Class

- Create `js/Grid.js`.
- **Data Structure:** Implement a 9x9 2D array (0 = empty, 1 = filled).
- **Method:** `canPlacePiece(piece, startX, startY)` -> Boolean.
  - Check boundaries.
  - Check for collision with existing blocks.
- **Method:** `placePiece(piece, startX, startY)` -> Void.
  - Write piece data into the 2D array.
- **Method:** `checkClears()` -> Array of cleared row/col/square indices.
  - Scan all 9 rows, 9 columns, and 9 subgrids (3x3).
  - Return lists of lines to be cleared.

#### Task 2.2: Piece Definitions

- Create `js/Pieces.js`.
- Define shapes as matrices (e.g., L-shape, Square, Line, Dot).
  - Example: `[[1,0], [1,0], [1,1]]` (L-shape).
- Implement a `PieceGenerator` that returns a random set of 3 shapes.

#### Task 2.3: Scoring System

- Create `js/ScoreManager.js`.
- Track current score.
- Implement `calculateScore(placedBlockCount, clearedLinesCount, streakCount)`.
- Apply logic: Base points + (Lines × Multiplier) + Streak Bonus.

### Phase 3: Frontend Rendering & Interaction

#### Task 3.1: Canvas Rendering Engine

- Create `js/Renderer.js`.
- **Method:** `drawGrid(gridData)`
  - Draw the 9x9 grid.
  - Draw heavier borders every 3 cells to denote 3x3 subgrids.
  - Fill cells based on grid data.
- **Method:** `drawHand(pieces)`
  - Render the 3 available pieces below the main grid.
  - Scale pieces down slightly if needed to fit UI.

#### Task 3.2: Input Handling (Drag & Drop)

- Create `js/InputHandler.js`.
- **Event Listeners:** `mousedown`, `mousemove`, `mouseup` (and touch equivalents).
- **Logic:**
  - **Hit Test:** Check if mouse down is inside one of the 3 available pieces.
  - **Drag:** If holding a piece, render it at mouse coordinates (floating).
  - **Snap Preview:** Calculate the nearest grid cell (x, y) under the mouse. If `Grid.canPlacePiece` is true, render a "ghost" preview of the piece on the grid.

#### Task 3.3: Game Loop Integration

- Create `js/Game.js` (Main Controller).
- Initialize Grid, ScoreManager, Renderer.
- **On Drop:**
  - If valid: Update Grid, animate clearing, calculate score, remove piece from hand.
  - If invalid: Return piece to hand.
- **Turn Logic:**
  - If hand is empty, generate 3 new pieces.
- **Game Over Check:** After every turn, simulate placing ALL remaining pieces in ALL grid positions. If no valid moves exist, trigger Game Over.

### Phase 4: Polish & Integration

#### Task 4.1: Game Over & Restart

- Overlay a "Game Over" modal on the Canvas.
- Display final score.
- Call `POST /api/score` to save the result.
- Add "Play Again" button that resets Grid and ScoreManager.

#### Task 4.2: Visual Feedback

- **Highlighting:** When hovering a valid spot, highlight the row/column/square that would be cleared if placed there.
- **Animations:**
  - Fade out effect for cleared blocks.
  - Float up text for "+100" score gains.

#### Task 4.3: Leaderboard UI

- Fetch `GET /api/leaderboard` on page load and game over.
- Render an HTML list (`<ul>`) beside the canvas to show top scores.

### Phase 5: Testing Specifications

- **Unit Test (Logic):** Verify `checkClears()` correctly identifies a full 3x3 subgrid.
- **Unit Test (Logic):** Verify Game Over triggers only when absolutely no moves are possible.
- **Integration Test:** Verify score is sent to backend and appears in the leaderboard after refresh.