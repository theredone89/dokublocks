# Gemini Assistant Instructions for BlockLogic

## Purpose
Provide a concise, actionable instruction set for a Gemini assistant working on the BlockLogic repository. These instructions mirror the project context and conventions from the existing Copilot guidance, adapted for a Gemini-style assistant.

## Project Context
- Project: BlockLogic — a browser-based Blockudoku puzzle game combining a 9×9 Sudoku-like grid with polyomino block placement.
- Primary responsibilities: help implement, review, and maintain frontend Canvas code, backend Express API, scoring persistence, and tests.

## Technology Stack
- Frontend: Vanilla JavaScript (ES6+), HTML5 Canvas (2D), CSS.
- Backend: Node.js + Express.js, JSON file storage in `/db`.

## High-level Architecture
- `public/` — static frontend assets (HTML, CSS, JS).
- `src/` — backend server code (Express endpoints).
- `db/` — JSON persistence (`scores.json`).
- `public/js/` — game modules: `Grid.js`, `Pieces.js`, `Game.js`, `Renderer.js`, `InputHandler.js`, `ScoreManager.js`.

## Assistant Behaviour and Conventions
- Be concise and direct; act like a collaborative engineer. Prioritize safety, correctness, and minimal, well-scoped changes.
- When editing repository files, prefer surgical changes and preserve existing style and public APIs.
- Use the repository's conventions for class-based OOP and zero-based grid indexing.
- When asked to modify code, create small patches that fix root causes rather than surface fixes.

## Key Constants
Use these canonical values unless there is a justified reason to change them:

- `GRID_SIZE = 9`
- `SUBGRID_SIZE = 3`
- `PIECES_PER_BATCH = 3`
- `POINTS_PER_BLOCK = 10`
- `POINTS_PER_CLEAR = 100`

## Core Class Responsibilities
- `Game`: orchestrates the game loop, piece batches, and integrates UI+logic.
- `Grid`: manages a 9×9 2D array (0 empty, 1 filled). Provide `canPlacePiece(piece, x, y)`, `placePiece(piece, x, y)`, and `checkClears()`.
- `Piece` / `Pieces`: represent polyomino shapes as matrices (e.g., L-shape `[[1,0],[1,0],[1,1]]`).
- `ScoreManager`: compute score via `calculateScore(placedBlockCount, clearedLinesCount, streakCount)`.
- `Renderer`: draw grid, subgrid borders, and hand pieces on Canvas.

## Grid & Game Rules
- Indexing: zero-based for all grid operations.
- Clear detection: check all 9 rows, 9 columns, and all 3×3 subgrids for full occupancy.
- Game-over: only trigger when simulating every remaining piece in every position yields no valid placement.

## Input & UX Requirements
- Support mouse + touch events: `mousedown`/`touchstart`, `mousemove`/`touchmove`, `mouseup`/`touchend`.
- Provide visual feedback: ghost preview for valid placements, highlight affected rows/cols/subgrids on hover, animate clears, and show floating score text.

## API Endpoints (Backend)
- `GET /api/leaderboard` — return top 10 scores (descending).
- `POST /api/score` — accept `{ username, score }`, validate input, persist to `/db/scores.json`.

## Data Storage
- Scores structure (in `/db/scores.json`):
```
[
  { "id": 1234567890, "username": "Player1", "score": 1500, "timestamp": "2026-01-25T10:30:00.000Z" }
]
```
- Preferred helper functions: `readScores()` and `writeScores(scores)` inside `src/server.js`.

## Testing Focus
- Verify `checkClears()` correctly identifies full 3×3 subgrids.
- Verify Game Over detection only when truly no moves remain.
- Validate score persistence and leaderboard integration.
- Test drag-and-drop for both mouse and touch devices.

## Development Workflow
1. Backend (API, score persistence, static serve).
2. Core game logic (Grid, Pieces, ScoreManager).
3. Rendering and animations (Renderer).
4. Input handling (InputHandler) and drag-and-drop UX.
5. Integration and gameflow (Game controller, restart, game over).
6. Polish and leaderboard UI.

## Code Review & PR Guidelines for the Assistant
- Keep PRs small and focused; include tests where appropriate.
- Document any deviations from constants or core rules with rationale.
- Avoid changing unrelated files or refactoring without user approval.

## When You Need to Ask the User
- If a requested change affects game rules (scoring, grid size, clear logic), confirm before implementing.
- For UI/UX design choices (animations, colors), propose options and ask for selection.

## Minimal Example: Piece Representation
- Use matrix arrays for shapes. Example 2×2 square:
```
[[1,1],[1,1]]
```

---
These instructions are derived from the repository's Copilot guidance and tuned for a Gemini-style assistant: concise, action-oriented, and respectful of existing project patterns.
