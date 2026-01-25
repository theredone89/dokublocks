class InputHandler {
  constructor(canvas, game) {
    this.canvas = canvas;
    this.game = game;
    this.selectedPiece = null;
    this.selectedPieceIndex = null;
    this.isDragging = false;
    this.mousePos = { x: 0, y: 0 };
    
    this.setupMouseListeners();
    this.setupTouchListeners();
  }

  setupMouseListeners() {
    this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
  }

  setupTouchListeners() {
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.handleTouchStart(e);
    }, { passive: false });
    
    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      this.handleTouchMove(e);
    }, { passive: false });
    
    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.handleTouchEnd(e);
    }, { passive: false });
  }

  handleMouseDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const pieceIndex = this.getPieceAtPosition(x, y);
    
    if (pieceIndex !== null && !this.game.isGameOver && !this.game.isAnimating) {
      this.selectedPiece = this.game.hand[pieceIndex];
      this.selectedPieceIndex = pieceIndex;
      this.isDragging = true;
      this.mousePos = { x, y };
    }
  }

  handleMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    this.mousePos.x = e.clientX - rect.left;
    this.mousePos.y = e.clientY - rect.top;
    
    if (this.isDragging && this.selectedPiece) {
      this.updatePreview();
    } else {
      // Always update preview to show hover states
      this.game.render();
    }
  }

  handleMouseUp(e) {
    if (this.isDragging && this.selectedPiece) {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const gridPos = this.getGridPosition(x, y, this.selectedPiece);
      
      if (gridPos && this.game.grid.canPlacePiece(this.selectedPiece, gridPos.x, gridPos.y)) {
        this.game.placePiece(this.selectedPieceIndex, gridPos.x, gridPos.y);
      }
    }
    
    this.selectedPiece = null;
    this.selectedPieceIndex = null;
    this.isDragging = false;
    this.game.render();
  }

  handleTouchStart(e) {
    const touch = e.touches[0];
    const rect = this.canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    const pieceIndex = this.getPieceAtPosition(x, y);
    
    if (pieceIndex !== null && !this.game.isGameOver && !this.game.isAnimating) {
      this.selectedPiece = this.game.hand[pieceIndex];
      this.selectedPieceIndex = pieceIndex;
      this.isDragging = true;
      this.mousePos = { x, y };
    }
  }

  handleTouchMove(e) {
    if (!this.isDragging) return;
    
    const touch = e.touches[0];
    const rect = this.canvas.getBoundingClientRect();
    this.mousePos.x = touch.clientX - rect.left;
    this.mousePos.y = touch.clientY - rect.top;
    
    this.updatePreview();
  }

  handleTouchEnd(e) {
    if (this.isDragging && this.selectedPiece) {
      const touch = e.changedTouches[0];
      const rect = this.canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      
      const gridPos = this.getGridPosition(x, y, this.selectedPiece);
      
      if (gridPos && this.game.grid.canPlacePiece(this.selectedPiece, gridPos.x, gridPos.y)) {
        this.game.placePiece(this.selectedPieceIndex, gridPos.x, gridPos.y);
      }
    }
    
    this.selectedPiece = null;
    this.selectedPieceIndex = null;
    this.isDragging = false;
    this.game.render();
  }

  getPieceAtPosition(x, y) {
    const handY = this.game.renderer.gridOffset.y + 10 * this.game.renderer.cellSize;
    const handCellSize = 30;
    const spacing = 150;
    
    for (let i = 0; i < this.game.hand.length; i++) {
      const piece = this.game.hand[i];
      if (!piece) continue;
      
      const handX = this.game.renderer.gridOffset.x + i * spacing;
      
      // Check each block of the piece
      for (let row = 0; row < piece.shape.length; row++) {
        for (let col = 0; col < piece.shape[row].length; col++) {
          if (piece.shape[row][col] === 1) {
            const blockX = handX + col * handCellSize;
            const blockY = handY + row * handCellSize;
            
            if (x >= blockX && x <= blockX + handCellSize &&
                y >= blockY && y <= blockY + handCellSize) {
              return i;
            }
          }
        }
      }
    }
    
    return null;
  }

  getGridPosition(canvasX, canvasY, piece = null) {
    // If we have a piece, adjust for its center offset (matching drawDraggingPiece)
    let adjustedX = canvasX;
    let adjustedY = canvasY;
    
    if (piece) {
      const dragCellSize = 30; // Same as in drawDraggingPiece
      const offsetX = (piece.width * dragCellSize) / 2;
      const offsetY = (piece.height * dragCellSize) / 2;
      // Adjust to get the top-left corner of where the piece would be placed
      adjustedX = canvasX - offsetX;
      adjustedY = canvasY - offsetY;
    }
    
    const gridX = Math.floor(
      (adjustedX - this.game.renderer.gridOffset.x) / this.game.renderer.cellSize
    );
    const gridY = Math.floor(
      (adjustedY - this.game.renderer.gridOffset.y) / this.game.renderer.cellSize
    );
    
    // Allow positions that might place piece partially outside initial check
    // The canPlacePiece method will do proper boundary validation
    if (gridX < -10 || gridX >= 20 || gridY < -10 || gridY >= 20) {
      return null;
    }
    
    return { x: gridX, y: gridY };
  }

  updatePreview() {
    // Render base grid and hand, which will also call drawDragPreview via Game.render()
    this.game.renderer.drawGrid(this.game.grid.cells);
    this.game.renderer.drawHand(this.game.hand);
    
    // Draw the drag preview elements
    this.drawDragPreview();
  }

  drawDragPreview() {
    if (!this.selectedPiece) return;
    
    const gridPos = this.getGridPosition(this.mousePos.x, this.mousePos.y, this.selectedPiece);
    
    if (gridPos) {
      const canPlace = this.game.grid.canPlacePiece(
        this.selectedPiece,
        gridPos.x,
        gridPos.y
      );
      
      if (canPlace) {
        const potentialClears = this.calculatePotentialClears(
          this.selectedPiece,
          gridPos.x,
          gridPos.y
        );
        
        // Draw highlights and ghost preview
        if (potentialClears) {
          this.game.renderer.highlightClears(potentialClears);
        }
        this.game.renderer.drawGhostPreview(this.selectedPiece, gridPos.x, gridPos.y);
      }
    }
    
    // Draw the piece following the cursor
    this.game.renderer.drawDraggingPiece(this.selectedPiece, this.mousePos.x, this.mousePos.y);
  }

  calculatePotentialClears(piece, startX, startY) {
    const tempCells = this.game.grid.cells.map(row => [...row]);
    
    for (let row = 0; row < piece.shape.length; row++) {
      for (let col = 0; col < piece.shape[row].length; col++) {
        if (piece.shape[row][col] === 1) {
          tempCells[startY + row][startX + col] = 1;
        }
      }
    }
    
    return this.game.grid.checkClears(tempCells);
  }
}
