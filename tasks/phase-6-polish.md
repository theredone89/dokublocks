# Phase 6: Polish & UI Enhancements

## Task 6.1: Add Fade-Out Animation for Cleared Blocks

**Description:** Implement smooth fade-out effect when rows/columns/squares are cleared.

**Animation Implementation:**
```javascript
async animateClears(clears) {
  this.isAnimating = true;
  
  const cellsToAnimate = this.getCellsToAnimate(clears);
  const duration = 500; // milliseconds
  const steps = 30;
  const stepDuration = duration / steps;
  
  for (let step = 0; step <= steps; step++) {
    const alpha = 1 - (step / steps);
    
    // Redraw grid
    this.renderer.drawGrid(this.grid.cells);
    
    // Draw fading cells
    this.renderer.ctx.globalAlpha = alpha;
    cellsToAnimate.forEach(cell => {
      const x = this.renderer.gridOffset.x + cell.col * this.renderer.cellSize;
      const y = this.renderer.gridOffset.y + cell.row * this.renderer.cellSize;
      
      this.renderer.ctx.fillStyle = this.renderer.colors.highlight;
      this.renderer.ctx.fillRect(x, y, this.renderer.cellSize, this.renderer.cellSize);
    });
    this.renderer.ctx.globalAlpha = 1.0;
    
    this.renderer.drawHand(this.hand);
    
    await this.sleep(stepDuration);
  }
  
  // Clear the cells after animation
  this.clearCells(clears);
  
  this.isAnimating = false;
  this.render();
}

getCellsToAnimate(clears) {
  const cells = [];
  
  // Add row cells
  clears.rows.forEach(row => {
    for (let col = 0; col < 9; col++) {
      cells.push({ row, col });
    }
  });
  
  // Add column cells
  clears.cols.forEach(col => {
    for (let row = 0; row < 9; row++) {
      cells.push({ row, col });
    }
  });
  
  // Add square cells
  clears.squares.forEach(square => {
    const startRow = square.row * 3;
    const startCol = square.col * 3;
    for (let row = startRow; row < startRow + 3; row++) {
      for (let col = startCol; col < startCol + 3; col++) {
        cells.push({ row, col });
      }
    }
  });
  
  // Remove duplicates
  return Array.from(new Set(cells.map(c => `${c.row},${c.col}`)))
    .map(str => {
      const [row, col] = str.split(',').map(Number);
      return { row, col };
    });
}

clearCells(clears) {
  // Clear rows
  clears.rows.forEach(row => {
    for (let col = 0; col < 9; col++) {
      this.grid.cells[row][col] = 0;
    }
  });
  
  // Clear columns
  clears.cols.forEach(col => {
    for (let row = 0; row < 9; row++) {
      this.grid.cells[row][col] = 0;
    }
  });
  
  // Clear squares
  clears.squares.forEach(square => {
    const startRow = square.row * 3;
    const startCol = square.col * 3;
    for (let row = startRow; row < startRow + 3; row++) {
      for (let col = startCol; col < startCol + 3; col++) {
        this.grid.cells[row][col] = 0;
      }
    }
  });
}

sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

**Acceptance Criteria:**
- [ ] Cleared blocks fade out smoothly
- [ ] Animation lasts 500ms
- [ ] Multiple clears animated simultaneously
- [ ] Game state frozen during animation
- [ ] Cells actually cleared after animation completes

---

## Task 6.2: Add Floating Score Text Animation

**Description:** Show animated "+points" text when score is earned.

**Floating Text System:**
```javascript
class FloatingText {
  constructor(x, y, text, renderer) {
    this.x = x;
    this.y = y;
    this.text = text;
    this.renderer = renderer;
    this.life = 1.0; // 1.0 = fully visible, 0.0 = gone
    this.speed = 2; // pixels per frame
  }
  
  update() {
    this.y -= this.speed;
    this.life -= 0.03;
    return this.life > 0;
  }
  
  draw() {
    this.renderer.ctx.save();
    this.renderer.ctx.globalAlpha = this.life;
    this.renderer.ctx.font = 'bold 24px Arial';
    this.renderer.ctx.fillStyle = '#e94560';
    this.renderer.ctx.textAlign = 'center';
    this.renderer.ctx.fillText(this.text, this.x, this.y);
    this.renderer.ctx.restore();
  }
}
```

**Integration in Game:**
```javascript
class Game {
  constructor(canvas) {
    // ... existing code ...
    this.floatingTexts = [];
    this.startAnimationLoop();
  }
  
  showFloatingScore(gridX, gridY, points) {
    const x = this.renderer.gridOffset.x + gridX * this.renderer.cellSize + this.renderer.cellSize / 2;
    const y = this.renderer.gridOffset.y + gridY * this.renderer.cellSize;
    
    const text = `+${points}`;
    this.floatingTexts.push(new FloatingText(x, y, text, this.renderer));
  }
  
  startAnimationLoop() {
    const animate = () => {
      // Update floating texts
      this.floatingTexts = this.floatingTexts.filter(text => text.update());
      
      // Render game
      this.render();
      
      // Draw floating texts on top
      this.floatingTexts.forEach(text => text.draw());
      
      requestAnimationFrame(animate);
    };
    
    animate();
  }
}
```

**Acceptance Criteria:**
- [ ] Score text appears at placement position
- [ ] Text floats upward smoothly
- [ ] Text fades out gradually
- [ ] Multiple texts can animate simultaneously
- [ ] Text is clearly visible and readable
- [ ] Animation doesn't block gameplay

---

## Task 6.3: Create Leaderboard UI Component

**Description:** Build visual leaderboard display for top scores.

**HTML Structure:**
```html
<div id="leaderboard-container">
  <h2>Leaderboard</h2>
  <div id="leaderboard-loading" class="loading">Loading...</div>
  <ol id="leaderboard-list" class="hidden">
    <!-- Populated dynamically -->
  </ol>
  <button id="refresh-leaderboard-btn">Refresh</button>
</div>
```

**CSS Styling:**
```css
#leaderboard-container {
  background: #1a1a2e;
  padding: 20px;
  border-radius: 10px;
  min-width: 300px;
  color: #fff;
}

#leaderboard-container h2 {
  margin: 0 0 15px 0;
  color: #e94560;
  text-align: center;
}

#leaderboard-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

#leaderboard-list li {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  margin: 5px 0;
  background: #16213e;
  border-radius: 5px;
  transition: background 0.3s;
}

#leaderboard-list li:hover {
  background: #0f3460;
}

.leaderboard-rank {
  font-weight: bold;
  color: #e94560;
  margin-right: 10px;
}

.leaderboard-name {
  flex: 1;
}

.leaderboard-score {
  font-weight: bold;
  color: #4ecca3;
}

.loading {
  text-align: center;
  color: #888;
}

#refresh-leaderboard-btn {
  width: 100%;
  margin-top: 10px;
}
```

**Render Function:**
```javascript
renderLeaderboard(scores) {
  const list = document.getElementById('leaderboard-list');
  const loading = document.getElementById('leaderboard-loading');
  
  loading.classList.add('hidden');
  list.classList.remove('hidden');
  
  list.innerHTML = '';
  
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
  
  // Highlight player's score if present
  const currentScore = this.scoreManager.getScore();
  if (currentScore > 0) {
    this.highlightPlayerScore(scores, currentScore);
  }
}
```

**Acceptance Criteria:**
- [ ] Leaderboard displays top 10 scores
- [ ] Shows rank, username, and score
- [ ] Properly formatted and styled
- [ ] Loading state shown while fetching
- [ ] Error state for failed fetches
- [ ] Player's score highlighted if in top 10

---

## Task 6.4: Fetch and Display Leaderboard on Page Load

**Description:** Load and display leaderboard data when game starts.

**Fetch Function:**
```javascript
async loadLeaderboard() {
  const loading = document.getElementById('leaderboard-loading');
  const list = document.getElementById('leaderboard-list');
  
  loading.classList.remove('hidden');
  list.classList.add('hidden');
  
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
    loading.textContent = 'Failed to load leaderboard';
    
    // Retry button
    const retryBtn = document.createElement('button');
    retryBtn.textContent = 'Retry';
    retryBtn.onclick = () => this.loadLeaderboard();
    loading.appendChild(retryBtn);
  }
}
```

**Initial Load:**
```javascript
// In Game constructor or init
constructor(canvas) {
  // ... existing code ...
  
  // Load leaderboard on startup
  this.loadLeaderboard();
  
  // Setup refresh button
  document.getElementById('refresh-leaderboard-btn').addEventListener('click', () => {
    this.loadLeaderboard();
  });
}
```

**Auto-refresh:**
```javascript
startLeaderboardAutoRefresh() {
  // Refresh every 30 seconds
  setInterval(() => {
    if (!this.isGameOver) {
      this.loadLeaderboard();
    }
  }, 30000);
}
```

**Acceptance Criteria:**
- [ ] Leaderboard fetched on page load
- [ ] Data displayed immediately when available
- [ ] Error handling for network failures
- [ ] Retry mechanism on failure
- [ ] Refresh button works
- [ ] Optional auto-refresh every 30 seconds
- [ ] No blocking of game initialization
