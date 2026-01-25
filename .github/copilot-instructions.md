# GitHub Copilot Instructions

## Project Context

This is **BlockLogic**, a browser-based Blockudoku puzzle game that combines Sudoku grids with Tetris-style block placement mechanics.

## Technology Stack

### Frontend
- Vanilla JavaScript (ES6+)
- HTML5 Canvas API (Context 2D) for rendering
- CSS for layout and styling
- Class-based OOP architecture

### Backend
- Node.js runtime
- Express.js framework
- JSON file storage for data persistence (`db/scores.json`)

## Architecture Principles

### Code Organization
- `/public` - Frontend assets (HTML, CSS, JS)
- `/src` - Backend logic and API endpoints
- `/db` - Database files
- `js/` subdirectory structure:
  - `Grid.js` - Grid state management
  - `Pieces.js` - Shape definitions and piece generation
  - `ScoreManager.js` - Scoring logic
  - `Renderer.js` - Canvas rendering engine
  - `InputHandler.js` - User interaction handling
  - `Game.js` - Main game controller

### State Management
Use class-based OOP with these core classes:
- `Game` - Main controller coordinating all components
- `Grid` - Manages 9x9 grid state (2D array: 0=empty, 1=filled)
- `Piece` - Represents polyomino shapes as matrices
- `ScoreManager` - Tracks and calculates scores

## Game Constants

```javascript
const GRID_SIZE = 9;
const SUBGRID_SIZE = 3;
const PIECES_PER_BATCH = 3;
const POINTS_PER_BLOCK = 10;
const POINTS_PER_CLEAR = 100;
```

## Key Methods & Signatures

### Grid Class
```javascript
canPlacePiece(piece, startX, startY) // Returns Boolean
placePiece(piece, startX, startY)    // Returns void
checkClears()                        // Returns Array of indices
```

### ScoreManager Class
```javascript
calculateScore(placedBlockCount, clearedLinesCount, streakCount)
// Formula: Base points + (Lines × Multiplier) + Streak Bonus
```

### Renderer Class
```javascript
drawGrid(gridData)    // Draws 9x9 grid with 3x3 subgrid borders
drawHand(pieces)      // Renders available pieces below grid
```

## API Endpoints

- `GET /api/leaderboard` - Returns top 10 scores (descending order)
- `POST /api/score` - Accepts `{ username, score }`, validates and stores

## Coding Conventions

1. **Piece Representation**: Use matrices for shapes
   - Example L-shape: `[[1,0], [1,0], [1,1]]`

2. **Grid Indexing**: Zero-based indexing for 9x9 array

3. **Clear Detection**: Check all 9 rows, 9 columns, and 9 3x3 subgrids

4. **Game Over Logic**: Simulate ALL remaining pieces in ALL positions to verify no valid moves exist

5. **Event Handling**: Support both mouse and touch events (`mousedown`/`touchstart`, `mousemove`/`touchmove`, `mouseup`/`touchend`)

6. **Visual Feedback**: 
   - Ghost preview for valid placements
   - Highlight affected rows/columns/squares on hover
   - Animate clears with fade-out effects
   - Show floating score text (e.g., "+100")

## Data Storage

Scores are persisted in `/db/scores.json` with the following structure:

```json
[
  {
    "id": 1234567890,
    "username": "Player1",
    "score": 1500,
    "timestamp": "2026-01-25T10:30:00.000Z"
  }
]
```

Helper functions in `server.js`:
- `readScores()` - Reads and parses scores from JSON file
- `writeScores(scores)` - Writes scores array to JSON file

## Testing Focus Areas

- Validate `checkClears()` correctly identifies full 3×3 subgrids
- Ensure Game Over triggers only when truly no moves possible
- Verify score persistence and leaderboard integration
- Test drag-and-drop on both mouse and touch devices

## Development Workflow

1. Backend setup first (database, API endpoints, static file serving)
2. Core game logic (Grid, Pieces, Scoring)
3. Rendering engine and visual feedback
4. User interaction (drag-and-drop)
5. Game flow integration (turns, game over, restart)
6. Polish (animations, leaderboard UI)

When suggesting code, prioritize:
- Clean separation of concerns between classes
- Efficient Canvas rendering (minimize redraws)
- Robust collision detection
- Clear validation logic for game rules
