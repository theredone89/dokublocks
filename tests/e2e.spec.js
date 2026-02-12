const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:3000';

test.describe('BlockLogic - End-to-End Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    // Wait for canvas to be ready
    await page.waitForSelector('#game-canvas');
    // Wait for game to initialize
    await page.waitForFunction(() => {
      return window.game && window.game.hand && window.game.hand.length === 3;
    }, { timeout: 5000 });
    // Ensure game is not in game over state
    await page.evaluate(() => {
      if (window.game.isGameOver) {
        window.game.init();
      }
    });
    await page.waitForTimeout(200);
  });

  test.afterEach(async ({ page }) => {
    // Clean up any open modals
    await page.evaluate(() => {
      const modals = ['game-over-modal', 'confirm-modal', 'dialog-modal'];
      modals.forEach(id => {
        const modal = document.getElementById(id);
        if (modal) {
          modal.classList.add('hidden');
        }
      });
    });
  });

  test('Game loads successfully with all UI elements', async ({ page }) => {
    // Check title
    await expect(page).toHaveTitle(/BlockLogic/);
    
    // Check header elements (logo image instead of h1)
    await expect(page.locator('.logo')).toBeVisible();
    await expect(page.locator('#current-score')).toBeVisible();
    await expect(page.locator('#high-score')).toBeVisible();
    
    // Check game area
    await expect(page.locator('#game-canvas')).toBeVisible();
    await expect(page.locator('#restart-btn')).toBeVisible();
    
    // Check leaderboard
    await expect(page.locator('#leaderboard-container')).toBeVisible();
    await expect(page.locator('#refresh-leaderboard-btn')).toBeVisible();
    
    // Verify initial score is 0
    await expect(page.locator('#current-score')).toHaveText('0');
  });

  test('Canvas renders correctly', async ({ page }) => {
    const canvas = await page.locator('#game-canvas');
    
    // Check canvas dimensions (dynamically calculated based on screen size)
    const width = await canvas.getAttribute('width');
    const height = await canvas.getAttribute('height');
    // Width should be reasonable (between 300-600px)
    expect(parseInt(width)).toBeGreaterThanOrEqual(300);
    expect(parseInt(width)).toBeLessThanOrEqual(600);
    // Height should be reasonable (between 500-800px)
    expect(parseInt(height)).toBeGreaterThanOrEqual(500);
    expect(parseInt(height)).toBeLessThanOrEqual(800);
    
    // Take screenshot to verify rendering
    await expect(canvas).toBeVisible();
  });

  test('Game initializes with 3 pieces in hand', async ({ page }) => {
    // Evaluate JavaScript to check game state
    const handLength = await page.evaluate(() => {
      return window.game?.hand?.length || 0;
    });
    
    expect(handLength).toBe(3);
  });

  test('Grid is initialized correctly (9x9 empty grid)', async ({ page }) => {
    const gridState = await page.evaluate(() => {
      const grid = window.game?.grid;
      if (!grid) return null;
      
      let totalCells = 0;
      let emptyCells = 0;
      
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          totalCells++;
          if (grid.cells[row][col] === 0) {
            emptyCells++;
          }
        }
      }
      
      return { totalCells, emptyCells };
    });
    
    expect(gridState.totalCells).toBe(81);
    expect(gridState.emptyCells).toBe(81);
  });

  test('Can place a piece on the grid', async ({ page }) => {
    // Ensure game is ready and score is 0
    await page.waitForFunction(() => {
      return window.game && 
             window.game.scoreManager.currentScore === 0 &&
             !window.game.isGameOver;
    });
    
    // Get initial score
    const initialScore = await page.locator('#current-score').textContent();
    expect(parseInt(initialScore)).toBe(0);
    
    // Get the first piece and place it
    const result = await page.evaluate(() => {
      const game = window.game;
      if (!game || !game.hand[0]) return { success: false, error: 'No game or hand' };
      
      const piece = game.hand[0];
      const startX = 4;
      const startY = 4;
      
      // Check if we can place the piece
      if (!game.grid.canPlacePiece(piece, startX, startY)) {
        return { success: false, error: 'Cannot place piece' };
      }
      
      // Simulate piece placement
      game.placePiece(0, startX, startY);
      
      // Check first block of the piece for verification
      let filledCell = 0;
      for (let py = 0; py < piece.shape.length; py++) {
        for (let px = 0; px < piece.shape[py].length; px++) {
          if (piece.shape[py][px] === 1) {
            filledCell = game.grid.cells[startY + py][startX + px];
            break;
          }
        }
        if (filledCell === 1) break;
      }
      
      return { 
        success: true, 
        gridCell: filledCell,
        handLength: game.hand.filter(p => p !== null).length
      };
    });
    
    expect(result.success).toBe(true);
    expect(result.gridCell).toBe(1); // Cell should be filled
    expect(result.handLength).toBeLessThan(3); // One piece should be used
    
    // Wait for score update
    await page.waitForTimeout(100);
    
    // Score should have increased
    const newScore = await page.locator('#current-score').textContent();
    expect(parseInt(newScore)).toBeGreaterThan(parseInt(initialScore));
  });

  test('Detects row clear correctly', async ({ page }) => {
    const result = await page.evaluate(() => {
      const game = window.game;
      if (!game) return { success: false };
      
      // Fill entire first row manually
      for (let col = 0; col < 9; col++) {
        game.grid.cells[0][col] = 1;
      }
      
      // Check for clears
      const clears = game.grid.checkClears();
      
      return {
        success: true,
        hasRowClear: clears.rows.includes(0),
        rowCount: clears.rows.length,
        colCount: clears.cols.length,
        squareCount: clears.squares.length
      };
    });
    
    expect(result.success).toBe(true);
    expect(result.hasRowClear).toBe(true);
    expect(result.rowCount).toBe(1);
  });

  test('Detects column clear correctly', async ({ page }) => {
    const result = await page.evaluate(() => {
      const game = window.game;
      if (!game) return { success: false };
      
      // Fill entire column 4
      for (let row = 0; row < 9; row++) {
        game.grid.cells[row][4] = 1;
      }
      
      const clears = game.grid.checkClears();
      
      return {
        success: true,
        hasColClear: clears.cols.includes(4),
        rowCount: clears.rows.length,
        colCount: clears.cols.length,
        squareCount: clears.squares.length
      };
    });
    
    expect(result.success).toBe(true);
    expect(result.hasColClear).toBe(true);
    expect(result.colCount).toBe(1);
  });

  test('Detects 3x3 square clear correctly', async ({ page }) => {
    const result = await page.evaluate(() => {
      const game = window.game;
      if (!game) return { success: false };
      
      // Fill top-left 3x3 square (square index 0)
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          game.grid.cells[row][col] = 1;
        }
      }
      
      const clears = game.grid.checkClears();
      
      return {
        success: true,
        hasSquareClear: clears.squares.some(sq => sq.row === 0 && sq.col === 0),
        rowCount: clears.rows.length,
        colCount: clears.cols.length,
        squareCount: clears.squares.length
      };
    });
    
    expect(result.success).toBe(true);
    expect(result.hasSquareClear).toBe(true);
    expect(result.squareCount).toBe(1);
  });

  test('Restart button resets the game', async ({ page }) => {
    // Place a piece first to change game state
    await page.evaluate(() => {
      const game = window.game;
      if (game && game.hand[0]) {
        // Place piece to add score
        game.placePiece(0, 4, 4);
      }
    });
    
    // Wait for state to update
    await page.waitForTimeout(300);
    
    // Verify score is not 0
    const scoreBeforeRestart = await page.locator('#current-score').textContent();
    expect(parseInt(scoreBeforeRestart)).toBeGreaterThan(0);
    
    // Click restart - this shows a custom confirm modal
    await page.click('#restart-btn');
    
    // Wait for confirm modal to appear
    await page.waitForSelector('#confirm-modal:not(.hidden)', { timeout: 2000 });
    
    // Click Yes button
    await page.click('#confirm-yes-btn');
    await page.waitForTimeout(300);
    
    // Check if game reset
    const state = await page.evaluate(() => {
      const game = window.game;
      return {
        score: game.scoreManager.currentScore,
        handLength: game.hand.length
      };
    });
    
    expect(state.score).toBe(0);
    expect(state.handLength).toBe(3);
    
    // Check UI
    await expect(page.locator('#current-score')).toHaveText('0');
  });

  test('Game Over modal appears when no moves available', async ({ page }) => {
    // Reset game to ensure clean slate
    await page.evaluate(() => {
      window.game.init();
    });
    await page.waitForTimeout(200);
    
    // Trigger game over directly
    await page.evaluate(() => {
      const game = window.game;
      // Completely fill the grid leaving no space
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          game.grid.cells[row][col] = 1;
        }
      }
      // Force game over check
      game.checkGameOver();
    });
    
    // Wait for modal to appear
    await page.waitForSelector('#game-over-modal:not(.hidden)', { timeout: 3000 });
    
    // Check if modal is visible
    const modalVisible = await page.locator('#game-over-modal').isVisible();
    expect(modalVisible).toBe(true);
    
    // Check modal content
    await expect(page.locator('#game-over-modal h2')).toHaveText('Game Over!');
    await expect(page.locator('#final-score')).toBeVisible();
  });

  test('Game does not end prematurely when clearing blocks creates space', async ({ page }) => {
    // This test verifies the bug fix where game over was triggered
    // before blocks were cleared, causing false game overs
    
    const result = await page.evaluate(async () => {
      const game = window.game;
      
      // Reset to clean state
      game.init();
      
      // Create a scenario where the grid is mostly full
      // Fill row 0, leaving only position [0][8] empty
      for (let col = 0; col < 8; col++) {
        game.grid.cells[0][col] = 1;
      }
      
      // Fill most other cells to make it hard for pieces to fit
      for (let row = 1; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          // Leave some strategic spaces
          if (!(row === 1 && col < 3)) {
            game.grid.cells[row][col] = 1;
          }
        }
      }
      
      // Create a simple single-block piece to complete the row
      const singleBlock = new Piece([[1]]);
      
      // Create pieces that would fit in the cleared space but not in current grid
      const smallPiece1 = new Piece([[1, 1]]);
      const smallPiece2 = new Piece([[1]]);
      
      // Set hand with specific pieces
      game.hand = [singleBlock, smallPiece1, smallPiece2];
      
      // Place the single block at [0][8] to complete row 0
      // This should clear the row and create space
      await game.placePiece(0, 8, 0);
      
      // Wait a bit for animation to complete
      await new Promise(resolve => setTimeout(resolve, 250));
      
      // Check game state
      return {
        isGameOver: game.isGameOver,
        remainingPiecesCount: game.hand.filter(p => p !== null).length,
        row0Cleared: game.grid.cells[0].every(cell => cell === 0),
        canPlaceRemainingPieces: game.hand.some((piece, idx) => {
          if (!piece) return false;
          // Check if this piece can be placed anywhere
          for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
              if (game.grid.canPlacePiece(piece, col, row)) {
                return true;
              }
            }
          }
          return false;
        })
      };
    });
    
    // Verify the game is NOT over
    expect(result.isGameOver).toBe(false);
    
    // Verify row 0 was actually cleared
    expect(result.row0Cleared).toBe(true);
    
    // Verify there are still pieces in hand
    expect(result.remainingPiecesCount).toBeGreaterThan(0);
    
    // Verify at least one remaining piece can be placed (proving space exists)
    expect(result.canPlaceRemainingPieces).toBe(true);
  });

  test('Leaderboard loads and displays scores', async ({ page }) => {
    // Click refresh to load leaderboard
    await page.click('#refresh-leaderboard-btn');
    await page.waitForTimeout(1000);
    
    // Check if leaderboard is visible
    const leaderboardList = page.locator('#leaderboard-list');
    
    // Either the list is visible with items or there are no scores yet
    const isVisible = await leaderboardList.isVisible();
    
    if (isVisible) {
      // If there are scores, check structure
      const items = await leaderboardList.locator('li').count();
      expect(items).toBeGreaterThanOrEqual(0);
      expect(items).toBeLessThanOrEqual(10);
    }
  });

  test('Score submission works correctly', async ({ page }) => {
    // Ensure game is in a fresh state
    await page.evaluate(() => {
      window.game.init();
    });
    await page.waitForTimeout(200);
    
    // Trigger game over
    await page.evaluate(() => {
      const game = window.game;
      game.scoreManager.currentScore = 999;
      game.triggerGameOver();
    });
    
    // Wait for modal to appear
    await page.waitForSelector('#game-over-modal:not(.hidden)', { timeout: 5000 });
    
    // Enter username
    await page.fill('#username', 'TestPlayer');
    
    // Submit score - this will trigger a custom alert modal
    await page.click('#submit-score-btn');
    
    // Wait for custom dialog modal to appear
    await page.waitForSelector('#dialog-modal:not(.hidden)', { timeout: 3000 });
    
    // Click OK on the custom alert
    await page.click('#dialog-ok-btn');
    
    // Wait for modals to close
    await page.waitForTimeout(500);
    
    // Game over modal should be hidden after submission
    const modalHidden = await page.locator('#game-over-modal').evaluate(el => 
      el.classList.contains('hidden')
    );
    expect(modalHidden).toBe(true);
  });

  test('Play Again button in modal restarts game', async ({ page }) => {
    // Reset game first
    await page.evaluate(() => {
      window.game.init();
    });
    await page.waitForTimeout(200);
    
    // Trigger game over
    await page.evaluate(() => {
      window.game.triggerGameOver();
    });
    
    // Wait for modal to appear
    await page.waitForSelector('#game-over-modal:not(.hidden)', { timeout: 3000 });
    
    // Click Play Again
    await page.click('#play-again-btn');
    await page.waitForTimeout(300);
    
    // Modal should be hidden
    const modalHidden = await page.locator('#game-over-modal').evaluate(el => 
      el.classList.contains('hidden')
    );
    expect(modalHidden).toBe(true);
    
    // Score should be reset
    await expect(page.locator('#current-score')).toHaveText('0');
  });

  test('API endpoint - GET /api/leaderboard returns valid data', async ({ page }) => {
    const response = await page.request.get(`${BASE_URL}/api/leaderboard`);
    expect(response.ok()).toBe(true);
    
    const data = await response.json();
    expect(data).toHaveProperty('success');
    expect(data).toHaveProperty('data');
    expect(Array.isArray(data.data)).toBe(true);
    expect(data.data.length).toBeLessThanOrEqual(10);
  });

  test('API endpoint - POST /api/score validates input', async ({ page }) => {
    // Test with valid data
    const validResponse = await page.request.post(`${BASE_URL}/api/score`, {
      data: {
        username: 'E2ETest',
        score: 500
      }
    });
    expect(validResponse.ok()).toBe(true);
    
    const validData = await validResponse.json();
    expect(validData.success).toBe(true);
    expect(validData).toHaveProperty('rank');
    
    // Test with invalid data (missing username)
    const invalidResponse = await page.request.post(`${BASE_URL}/api/score`, {
      data: {
        score: 500
      }
    });
    expect(invalidResponse.status()).toBe(400);
    
    // Test with invalid data (negative score)
    const invalidScoreResponse = await page.request.post(`${BASE_URL}/api/score`, {
      data: {
        username: 'Test',
        score: -100
      }
    });
    expect(invalidScoreResponse.status()).toBe(400);
  });

  test('Score calculation is correct', async ({ page }) => {
    const result = await page.evaluate(() => {
      const game = window.game;
      
      // Place a 2x2 piece (4 blocks)
      const score1 = game.scoreManager.calculateScore(4, 0, 0);
      
      // Clear 1 row (4 blocks placed + 1 row clear)
      const score2 = game.scoreManager.calculateScore(4, 1, 0);
      
      // Clear 2 lines with combo (4 blocks + 2 clears + combo)
      const score3 = game.scoreManager.calculateScore(4, 2, 1);
      
      return { score1, score2, score3 };
    });
    
    // 4 blocks = 4 * 10 = 40 points
    expect(result.score1).toBe(40);
    
    // 4 blocks (40) + 1 clear (100) = 140 points
    expect(result.score2).toBe(140);
    
    // 4 blocks (40) + 2 clears (200) + combo bonus
    expect(result.score3).toBeGreaterThan(240);
  });

  test('Piece cannot be placed out of bounds', async ({ page }) => {
    const result = await page.evaluate(() => {
      const game = window.game;
      const piece = game.hand[0];
      
      return {
        canPlaceNegative: game.grid.canPlacePiece(piece, -1, 0),
        canPlaceOutOfBounds: game.grid.canPlacePiece(piece, 10, 10),
        canPlaceValid: game.grid.canPlacePiece(piece, 4, 4)
      };
    });
    
    expect(result.canPlaceNegative).toBe(false);
    expect(result.canPlaceOutOfBounds).toBe(false);
    expect(result.canPlaceValid).toBe(true);
  });

  test('Piece cannot be placed on occupied cells', async ({ page }) => {
    const result = await page.evaluate(() => {
      const game = window.game;
      
      // Fill a cell
      game.grid.cells[4][4] = 1;
      
      // Try to place a piece that would overlap
      const piece = new Piece([[1]], 'DOT');
      
      return {
        canPlaceOnOccupied: game.grid.canPlacePiece(piece, 4, 4),
        canPlaceAdjacent: game.grid.canPlacePiece(piece, 4, 5)
      };
    });
    
    expect(result.canPlaceOnOccupied).toBe(false);
    expect(result.canPlaceAdjacent).toBe(true);
  });

  test('High score is tracked correctly', async ({ page }) => {
    // Set a score and save as high score
    await page.evaluate(() => {
      window.game.scoreManager.currentScore = 500;
      window.game.scoreManager.saveHighScore();
      window.game.updateScoreDisplay();
    });
    
    await page.waitForTimeout(200);
    
    let highScore = await page.locator('#high-score').textContent();
    const highScoreValue = parseInt(highScore);
    
    // High score should be at least 500
    expect(highScoreValue).toBeGreaterThanOrEqual(500);
    
    // Click restart button
    await page.click('#restart-btn');
    
    // Wait for and handle confirm modal
    await page.waitForSelector('#confirm-modal:not(.hidden)', { timeout: 2000 });
    await page.click('#confirm-yes-btn');
    await page.waitForTimeout(300);
    
    // High score should persist
    highScore = await page.locator('#high-score').textContent();
    expect(parseInt(highScore)).toBe(highScoreValue);
  });

  test('Multiple clears increase score correctly', async ({ page }) => {
    const result = await page.evaluate(() => {
      const game = window.game;
      
      // Fill first row
      for (let col = 0; col < 9; col++) {
        game.grid.cells[0][col] = 1;
      }
      
      // Fill first column
      for (let row = 0; row < 9; row++) {
        game.grid.cells[row][0] = 1;
      }
      
      // Check clears - should detect row 0 and column 0
      const clears = game.grid.checkClears();
      
      return {
        rowClears: clears.rows.length,
        colClears: clears.cols.length,
        totalClears: clears.rows.length + clears.cols.length
      };
    });
    
    expect(result.rowClears).toBe(1);
    expect(result.colClears).toBe(1);
    expect(result.totalClears).toBe(2);
  });
});

test.describe('Performance & Responsiveness', () => {
  test('Canvas redraws efficiently', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Measure rendering performance
    const metrics = await page.evaluate(() => {
      const start = performance.now();
      
      // Force multiple redraws
      for (let i = 0; i < 10; i++) {
        window.game.render();
      }
      
      const end = performance.now();
      return end - start;
    });
    
    // 10 renders should complete in reasonable time (< 500ms)
    expect(metrics).toBeLessThan(500);
  });

  test('Game remains responsive after many moves', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Simulate many moves
    await page.evaluate(() => {
      const game = window.game;
      
      for (let i = 0; i < 50; i++) {
        // Randomly fill some cells
        const row = Math.floor(Math.random() * 9);
        const col = Math.floor(Math.random() * 9);
        game.grid.cells[row][col] = Math.random() > 0.5 ? 1 : 0;
        game.render();
      }
    });
    
    // Check that game is still responsive
    const isResponsive = await page.evaluate(() => {
      return typeof window.game !== 'undefined' && 
             window.game.grid !== null &&
             window.game.hand.length === 3;
    });
    
    expect(isResponsive).toBe(true);
  });
});
