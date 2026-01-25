# Phase 3: Rendering System

## Task 3.1: Implement Renderer.drawGrid() Method

**Description:** Create canvas rendering for the 9x9 game grid with 3x3 subgrid divisions.

**File:** `/public/js/Renderer.js`

**Class Structure:**
```javascript
class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.cellSize = 50; // pixels
    this.gridSize = 9;
    this.gridOffset = { x: 50, y: 50 };
    
    // Colors
    this.colors = {
      background: '#1a1a2e',
      gridLine: '#444',
      subgridLine: '#888',
      emptyCell: '#16213e',
      filledCell: '#0f3460',
      highlight: '#e94560'
    };
  }
  
  drawGrid(gridData) {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw background
    this.ctx.fillStyle = this.colors.background;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw cells
    this.drawCells(gridData);
    
    // Draw grid lines
    this.drawGridLines();
  }
}
```

**Cell Rendering:**
```javascript
drawCells(gridData) {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const x = this.gridOffset.x + col * this.cellSize;
      const y = this.gridOffset.y + row * this.cellSize;
      
      // Fill cell
      this.ctx.fillStyle = gridData[row][col] === 1 
        ? this.colors.filledCell 
        : this.colors.emptyCell;
      this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
    }
  }
}
```

**Grid Line Rendering:**
```javascript
drawGridLines() {
  this.ctx.strokeStyle = this.colors.gridLine;
  this.ctx.lineWidth = 1;
  
  // Draw horizontal and vertical lines
  for (let i = 0; i <= 9; i++) {
    const offset = i * this.cellSize;
    
    // Vertical line
    this.ctx.beginPath();
    this.ctx.moveTo(this.gridOffset.x + offset, this.gridOffset.y);
    this.ctx.lineTo(this.gridOffset.x + offset, this.gridOffset.y + 9 * this.cellSize);
    this.ctx.stroke();
    
    // Horizontal line
    this.ctx.beginPath();
    this.ctx.moveTo(this.gridOffset.x, this.gridOffset.y + offset);
    this.ctx.lineTo(this.gridOffset.x + 9 * this.cellSize, this.gridOffset.y + offset);
    this.ctx.stroke();
  }
  
  // Draw heavier 3x3 subgrid lines
  this.ctx.strokeStyle = this.colors.subgridLine;
  this.ctx.lineWidth = 3;
  
  for (let i = 0; i <= 9; i += 3) {
    const offset = i * this.cellSize;
    
    // Vertical
    this.ctx.beginPath();
    this.ctx.moveTo(this.gridOffset.x + offset, this.gridOffset.y);
    this.ctx.lineTo(this.gridOffset.x + offset, this.gridOffset.y + 9 * this.cellSize);
    this.ctx.stroke();
    
    // Horizontal
    this.ctx.beginPath();
    this.ctx.moveTo(this.gridOffset.x, this.gridOffset.y + offset);
    this.ctx.lineTo(this.gridOffset.x + 9 * this.cellSize, this.gridOffset.y + offset);
    this.ctx.stroke();
  }
}
```

**Acceptance Criteria:**
- [ ] 9x9 grid rendered on canvas
- [ ] Cells filled based on grid state (0=empty, 1=filled)
- [ ] Standard grid lines drawn (thin lines)
- [ ] 3x3 subgrid borders drawn (thick lines every 3 cells)
- [ ] Proper color scheme applied
- [ ] Grid centered and properly sized

---

## Task 3.2: Implement Renderer.drawHand() Method

**Description:** Render the 3 available pieces below the main grid.

**Method Signature:**
```javascript
drawHand(pieces) {
  // Renders array of 3 pieces
}
```

**Implementation:**
```javascript
drawHand(pieces) {
  const handY = this.gridOffset.y + 10 * this.cellSize; // Below grid
  const handCellSize = 30; // Smaller than grid cells
  const spacing = 100;
  
  pieces.forEach((piece, index) => {
    if (!piece) return; // Piece already used
    
    const handX = this.gridOffset.x + index * (spacing + handCellSize * 5);
    
    // Draw piece preview
    for (let row = 0; row < piece.shape.length; row++) {
      for (let col = 0; col < piece.shape[row].length; col++) {
        if (piece.shape[row][col] === 1) {
          const x = handX + col * handCellSize;
          const y = handY + row * handCellSize;
          
          // Draw block
          this.ctx.fillStyle = this.colors.filledCell;
          this.ctx.fillRect(x, y, handCellSize - 2, handCellSize - 2);
          
          // Draw border
          this.ctx.strokeStyle = this.colors.subgridLine;
          this.ctx.lineWidth = 1;
          this.ctx.strokeRect(x, y, handCellSize - 2, handCellSize - 2);
        }
      }
    }
  });
}
```

**Acceptance Criteria:**
- [ ] 3 pieces rendered below main grid
- [ ] Pieces scaled smaller than grid (30px vs 50px)
- [ ] Proper spacing between pieces
- [ ] Null/used pieces skipped
- [ ] Visual distinction from main grid

---

## Task 3.3: Add Ghost Preview Rendering for Valid Placements

**Description:** Show semi-transparent preview of piece when hovering over valid placement.

**Method:**
```javascript
drawGhostPreview(piece, gridX, gridY) {
  if (!piece) return;
  
  this.ctx.globalAlpha = 0.3; // Semi-transparent
  
  for (let row = 0; row < piece.shape.length; row++) {
    for (let col = 0; col < piece.shape[row].length; col++) {
      if (piece.shape[row][col] === 1) {
        const x = this.gridOffset.x + (gridX + col) * this.cellSize;
        const y = this.gridOffset.y + (gridY + row) * this.cellSize;
        
        this.ctx.fillStyle = this.colors.highlight;
        this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
      }
    }
  }
  
  this.ctx.globalAlpha = 1.0; // Reset
}
```

**Acceptance Criteria:**
- [ ] Ghost preview shown at mouse/touch position
- [ ] Preview is semi-transparent (alpha 0.3)
- [ ] Only shown when placement is valid
- [ ] Uses highlight color
- [ ] Doesn't interfere with grid rendering

---

## Task 3.4: Add Row/Column/Square Highlighting on Hover

**Description:** Highlight rows, columns, and squares that would be cleared if piece is placed.

**Method:**
```javascript
highlightClears(clears) {
  this.ctx.globalAlpha = 0.2;
  this.ctx.fillStyle = this.colors.highlight;
  
  // Highlight rows
  clears.rows.forEach(rowIndex => {
    const y = this.gridOffset.y + rowIndex * this.cellSize;
    this.ctx.fillRect(
      this.gridOffset.x, 
      y, 
      9 * this.cellSize, 
      this.cellSize
    );
  });
  
  // Highlight columns
  clears.cols.forEach(colIndex => {
    const x = this.gridOffset.x + colIndex * this.cellSize;
    this.ctx.fillRect(
      x, 
      this.gridOffset.y, 
      this.cellSize, 
      9 * this.cellSize
    );
  });
  
  // Highlight 3x3 squares
  clears.squares.forEach(square => {
    const x = this.gridOffset.x + square.col * 3 * this.cellSize;
    const y = this.gridOffset.y + square.row * 3 * this.cellSize;
    this.ctx.fillRect(x, y, 3 * this.cellSize, 3 * this.cellSize);
  });
  
  this.ctx.globalAlpha = 1.0;
}
```

**Integration:**
```javascript
drawGridWithPreview(gridData, piece, gridX, gridY, potentialClears) {
  this.drawGrid(gridData);
  
  if (potentialClears) {
    this.highlightClears(potentialClears);
  }
  
  if (piece && gridX !== null && gridY !== null) {
    this.drawGhostPreview(piece, gridX, gridY);
  }
}
```

**Acceptance Criteria:**
- [ ] Rows highlighted when they would be cleared
- [ ] Columns highlighted when they would be cleared
- [ ] 3x3 squares highlighted when they would be cleared
- [ ] Highlighting is subtle (alpha 0.2)
- [ ] Multiple highlights can overlap
- [ ] Highlights cleared after piece placed
