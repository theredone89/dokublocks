# Phase 4: Input Handling

## Task 4.1: Implement InputHandler with Mouse Events

**Description:** Create event handling for mouse-based drag-and-drop interactions.

**File:** `/public/js/InputHandler.js`

**Class Structure:**
```javascript
class InputHandler {
  constructor(canvas, game) {
    this.canvas = canvas;
    this.game = game;
    this.selectedPiece = null;
    this.selectedPieceIndex = null;
    this.isDragging = false;
    this.mousePos = { x: 0, y: 0 };
    
    this.setupMouseListeners();
  }
  
  setupMouseListeners() {
    this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
  }
}
```

**Mouse Down Handler:**
```javascript
handleMouseDown(e) {
  const rect = this.canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  // Check if clicking on a piece in hand
  const pieceIndex = this.getPieceAtPosition(x, y);
  
  if (pieceIndex !== null) {
    this.selectedPiece = this.game.hand[pieceIndex];
    this.selectedPieceIndex = pieceIndex;
    this.isDragging = true;
  }
}
```

**Mouse Move Handler:**
```javascript
handleMouseMove(e) {
  const rect = this.canvas.getBoundingClientRect();
  this.mousePos.x = e.clientX - rect.left;
  this.mousePos.y = e.clientY - rect.top;
  
  if (this.isDragging && this.selectedPiece) {
    // Calculate grid position
    const gridPos = this.getGridPosition(this.mousePos.x, this.mousePos.y);
    
    // Check if placement is valid
    const canPlace = this.game.grid.canPlacePiece(
      this.selectedPiece, 
      gridPos.x, 
      gridPos.y
    );
    
    // Trigger redraw with preview
    this.game.render(this.selectedPiece, gridPos.x, gridPos.y, canPlace);
  }
}
```

**Mouse Up Handler:**
```javascript
handleMouseUp(e) {
  if (this.isDragging && this.selectedPiece) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const gridPos = this.getGridPosition(x, y);
    
    // Attempt to place piece
    if (this.game.grid.canPlacePiece(this.selectedPiece, gridPos.x, gridPos.y)) {
      this.game.placePiece(this.selectedPieceIndex, gridPos.x, gridPos.y);
    }
  }
  
  // Reset drag state
  this.selectedPiece = null;
  this.selectedPieceIndex = null;
  this.isDragging = false;
  this.game.render();
}
```

**Acceptance Criteria:**
- [ ] Mouse down selects piece from hand
- [ ] Mouse move updates preview position
- [ ] Mouse up places piece if valid
- [ ] Invalid drops return piece to hand
- [ ] Cursor changes during drag

---

## Task 4.2: Implement InputHandler with Touch Events

**Description:** Add touch event support for mobile devices.

**Touch Event Listeners:**
```javascript
setupTouchListeners() {
  this.canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    this.handleTouchStart(e);
  });
  
  this.canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    this.handleTouchMove(e);
  });
  
  this.canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    this.handleTouchEnd(e);
  });
}
```

**Touch Start Handler:**
```javascript
handleTouchStart(e) {
  const touch = e.touches[0];
  const rect = this.canvas.getBoundingClientRect();
  const x = touch.clientX - rect.left;
  const y = touch.clientY - rect.top;
  
  const pieceIndex = this.getPieceAtPosition(x, y);
  
  if (pieceIndex !== null) {
    this.selectedPiece = this.game.hand[pieceIndex];
    this.selectedPieceIndex = pieceIndex;
    this.isDragging = true;
  }
}
```

**Touch Move Handler:**
```javascript
handleTouchMove(e) {
  if (!this.isDragging) return;
  
  const touch = e.touches[0];
  const rect = this.canvas.getBoundingClientRect();
  this.mousePos.x = touch.clientX - rect.left;
  this.mousePos.y = touch.clientY - rect.top;
  
  const gridPos = this.getGridPosition(this.mousePos.x, this.mousePos.y);
  const canPlace = this.game.grid.canPlacePiece(
    this.selectedPiece, 
    gridPos.x, 
    gridPos.y
  );
  
  this.game.render(this.selectedPiece, gridPos.x, gridPos.y, canPlace);
}
```

**Touch End Handler:**
```javascript
handleTouchEnd(e) {
  if (this.isDragging && this.selectedPiece) {
    const touch = e.changedTouches[0];
    const rect = this.canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    const gridPos = this.getGridPosition(x, y);
    
    if (this.game.grid.canPlacePiece(this.selectedPiece, gridPos.x, gridPos.y)) {
      this.game.placePiece(this.selectedPieceIndex, gridPos.x, gridPos.y);
    }
  }
  
  this.selectedPiece = null;
  this.selectedPieceIndex = null;
  this.isDragging = false;
  this.game.render();
}
```

**Acceptance Criteria:**
- [ ] Touch events work on mobile devices
- [ ] Single-finger drag supported
- [ ] Touch and mouse events don't conflict
- [ ] preventDefault() stops scrolling during drag
- [ ] Smooth touch response

---

## Task 4.3: Implement Drag-and-Drop Piece Selection

**Description:** Add hit testing to detect which piece is being selected.

**Helper Method:**
```javascript
getPieceAtPosition(x, y) {
  const handY = this.game.renderer.gridOffset.y + 10 * this.game.renderer.cellSize;
  const handCellSize = 30;
  const spacing = 100;
  
  for (let i = 0; i < this.game.hand.length; i++) {
    const piece = this.game.hand[i];
    if (!piece) continue;
    
    const handX = this.game.renderer.gridOffset.x + i * (spacing + handCellSize * 5);
    
    // Calculate bounding box
    const width = piece.shape[0].length * handCellSize;
    const height = piece.shape.length * handCellSize;
    
    // Check if click/touch is within bounds
    if (x >= handX && x <= handX + width &&
        y >= handY && y <= handY + height) {
      return i;
    }
  }
  
  return null;
}
```

**Visual Feedback:**
```javascript
drawSelectedPiece(x, y) {
  if (!this.selectedPiece) return;
  
  const handCellSize = 30;
  
  this.game.renderer.ctx.globalAlpha = 0.8;
  
  for (let row = 0; row < this.selectedPiece.shape.length; row++) {
    for (let col = 0; col < this.selectedPiece.shape[row].length; col++) {
      if (this.selectedPiece.shape[row][col] === 1) {
        const drawX = x - (this.selectedPiece.width * handCellSize / 2) + col * handCellSize;
        const drawY = y - (this.selectedPiece.height * handCellSize / 2) + row * handCellSize;
        
        this.game.renderer.ctx.fillStyle = this.game.renderer.colors.filledCell;
        this.game.renderer.ctx.fillRect(drawX, drawY, handCellSize - 2, handCellSize - 2);
      }
    }
  }
  
  this.game.renderer.ctx.globalAlpha = 1.0;
}
```

**Acceptance Criteria:**
- [ ] Correctly identifies which piece is clicked/touched
- [ ] Hit test accounts for piece shape boundaries
- [ ] Null pieces (already used) are skipped
- [ ] Selected piece follows cursor/finger
- [ ] Visual feedback for selected state

---

## Task 4.4: Implement Snap-to-Grid Preview Logic

**Description:** Convert mouse/touch coordinates to grid cell positions.

**Grid Position Calculator:**
```javascript
getGridPosition(canvasX, canvasY) {
  const gridX = Math.floor(
    (canvasX - this.game.renderer.gridOffset.x) / this.game.renderer.cellSize
  );
  const gridY = Math.floor(
    (canvasY - this.game.renderer.gridOffset.y) / this.game.renderer.cellSize
  );
  
  return { x: gridX, y: gridY };
}
```

**Validation with Preview:**
```javascript
updatePreview() {
  if (!this.isDragging || !this.selectedPiece) return;
  
  const gridPos = this.getGridPosition(this.mousePos.x, this.mousePos.y);
  
  // Check if within grid bounds
  if (gridPos.x < 0 || gridPos.x >= 9 || gridPos.y < 0 || gridPos.y >= 9) {
    this.game.render(); // No preview
    return;
  }
  
  // Check if placement is valid
  const canPlace = this.game.grid.canPlacePiece(
    this.selectedPiece,
    gridPos.x,
    gridPos.y
  );
  
  // Calculate potential clears
  let potentialClears = null;
  if (canPlace) {
    potentialClears = this.calculatePotentialClears(
      this.selectedPiece,
      gridPos.x,
      gridPos.y
    );
  }
  
  // Render with preview
  this.game.render(this.selectedPiece, gridPos.x, gridPos.y, potentialClears);
}
```

**Potential Clears Calculation:**
```javascript
calculatePotentialClears(piece, startX, startY) {
  // Create temporary grid copy
  const tempGrid = this.game.grid.cells.map(row => [...row]);
  
  // Place piece on temp grid
  for (let row = 0; row < piece.shape.length; row++) {
    for (let col = 0; col < piece.shape[row].length; col++) {
      if (piece.shape[row][col] === 1) {
        tempGrid[startY + row][startX + col] = 1;
      }
    }
  }
  
  // Check for clears using temp grid
  const tempGridObj = { cells: tempGrid };
  return this.game.grid.checkClears.call(tempGridObj);
}
```

**Acceptance Criteria:**
- [ ] Cursor position converted to grid coordinates
- [ ] Snap-to-grid effect visible
- [ ] Preview only shown for valid placements
- [ ] Potential clears calculated and highlighted
- [ ] Performance optimized (no lag during drag)
