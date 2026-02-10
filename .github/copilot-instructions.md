# GitHub Copilot Instructions

## Project Context

This is **BlockLogic**, a browser-based Blockudoku puzzle game that combines Sudoku grids with Tetris-style block placement mechanics.

## Technology Stack

### Frontend
- Use Node 25+ for development and testing
- Vanilla JavaScript (ES6+)
- HTML5 Canvas API (Context 2D) for rendering
- CSS for layout and styling
- Class-based OOP architecture

### Backend
- Node.js runtime (18+ required for testing with Playwright)
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
  - `ScoreBackupManager.js` - Offline score persistence and sync

### State Management
Use class-based OOP with these core classes:
- `Game` - Main controller coordinating all components
- `Grid` - Manages 9x9 grid state (2D array: 0=empty, 1=filled)
- `Piece` - Represents polyomino shapes as matrices
- `ScoreManager` - Tracks and calculates scores
- `ScoreBackupManager` - Handles offline score storage and sync
- `Renderer` - Canvas-based rendering with theme support
- `InputHandler` - Drag-and-drop piece placement
- `PieceGenerator` - Random piece generation
- `FloatingText` - Animated score popups

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

7. **Modal System**: Custom modals instead of browser dialogs
   - Confirm Modal: `showConfirmDialog(message, onConfirm, onCancel)`
   - Alert Modal: `showDialog(message, onClose)`
   - Game Over Modal: `showGameOverModal()` / `hideGameOverModal()`
   - All modals use `.hidden` class for visibility control

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

## Testing Infrastructure

### Requirements
- **Node.js 25+** (Playwright requirement)
- **Playwright** for end-to-end testing

### Before running tests ensure:
- nvm is set to Node 25+: `nvm use`

### Test Scripts
```bash
npm test              # Run all Playwright tests
npm run test:ui       # Run tests in Playwright UI mode (interactive)
npm run test:headed   # Run tests in headed browser mode (visible)
```

### Testing Framework
- Located in `/tests/e2e.spec.js`
- Uses Playwright Test framework
- Tests run against local server at `http://localhost:3000`
- Server must be running before tests execute

### Test Best Practices

1. **Modal Handling**:
   - Game uses CUSTOM modals, not browser dialogs
   - Confirm dialogs: Use `#confirm-modal`, `#confirm-yes-btn`, `#confirm-no-btn`
   - Alert dialogs: Use `#dialog-modal`, `#dialog-ok-btn`
   - Game Over modal: Use `#game-over-modal`
   - Always wait for modals to appear: `await page.waitForSelector('#modal-id:not(.hidden)')`

2. **State Management in Tests**:
   - Always verify game is initialized: `window.game && window.game.hand.length === 3`
   - Reset game state when needed: `window.game.init()`
   - Wait for async operations (animations, score updates)
   - Clean up modals in `afterEach` hooks

3. **Timing Considerations**:
   - Wait for game initialization before interactions
   - Account for animation duration (400ms for clears)
   - Use `waitForFunction` for state verification
   - Add buffer time after state changes (200-300ms)

4. **API Testing**:
   - Test both success and error cases
   - Validate response structure and status codes
   - Verify data persistence across requests

### Test Coverage Areas

- UI element rendering and visibility
- Grid initialization and state management
- Piece placement validation and execution
- Clear detection (rows, columns, 3×3 squares)
- Score calculation and persistence
- High score tracking across sessions
- Game over detection and modal behavior
- Restart functionality with confirmation
- Leaderboard loading and display
- API endpoint validation
- Performance and responsiveness

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
