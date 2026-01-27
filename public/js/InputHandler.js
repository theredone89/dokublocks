class InputHandler {
  constructor(canvas, game) {
    this.canvas = canvas;
    this.game = game;
    this.selectedPiece = null;
    this.selectedPieceIndex = null;
    this.isDragging = false;
    this.mousePos = { x: 0, y: 0 };
    this.isTouch = false; // Track if current interaction is touch
    
    this.setupMouseListeners();
    this.setupTouchListeners();
  }

  // Convert client coordinates to canvas coordinates (handles CSS scaling)
  getCanvasCoordinates(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
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
    const { x, y } = this.getCanvasCoordinates(e.clientX, e.clientY);
    
    const pieceIndex = this.getPieceAtPosition(x, y);
    
    if (pieceIndex !== null && !this.game.isGameOver && !this.game.isAnimating) {
      this.selectedPiece = this.game.hand[pieceIndex];
      this.selectedPieceIndex = pieceIndex;
      this.isDragging = true;
      this.isTouch = false; // This is a mouse interaction
      this.mousePos = { x, y };
    }
  }

  handleMouseMove(e) {
    const { x, y } = this.getCanvasCoordinates(e.clientX, e.clientY);
    this.mousePos.x = x;
    this.mousePos.y = y;
    
    if (this.isDragging && this.selectedPiece) {
      this.updatePreview();
    } else {
      // Always update preview to show hover states
      this.game.render();
    }
  }

  handleMouseUp(e) {
    if (this.isDragging && this.selectedPiece) {
      const { x, y } = this.getCanvasCoordinates(e.clientX, e.clientY);
      
      const gridPos = this.getGridPosition(x, y, this.selectedPiece);
      
      if (gridPos && this.game.grid.canPlacePiece(this.selectedPiece, gridPos.x, gridPos.y)) {
        this.game.placePiece(this.selectedPieceIndex, gridPos.x, gridPos.y);
      }
    }
    
    this.selectedPiece = null;
    this.selectedPieceIndex = null;
    this.isDragging = false;
    this.isTouch = false;
    this.game.render();
  }

  handleTouchStart(e) {
    const touch = e.touches[0];
    const { x, y } = this.getCanvasCoordinates(touch.clientX, touch.clientY);
    
    const pieceIndex = this.getPieceAtPosition(x, y);
    
    if (pieceIndex !== null && !this.game.isGameOver && !this.game.isAnimating) {
      this.selectedPiece = this.game.hand[pieceIndex];
      this.selectedPieceIndex = pieceIndex;
      this.isDragging = true;
      this.isTouch = true; // This is a touch interaction
      this.mousePos = { x, y };
    }
  }

  handleTouchMove(e) {
    if (!this.isDragging) return;
    
    const touch = e.touches[0];
    const { x, y } = this.getCanvasCoordinates(touch.clientX, touch.clientY);
    this.mousePos.x = x;
    this.mousePos.y = y;
    
    this.updatePreview();
  }

  handleTouchEnd(e) {
    if (this.isDragging && this.selectedPiece) {
      const touch = e.changedTouches[0];
      const { x, y } = this.getCanvasCoordinates(touch.clientX, touch.clientY);
      
      const gridPos = this.getGridPosition(x, y, this.selectedPiece);
      
      if (gridPos && this.game.grid.canPlacePiece(this.selectedPiece, gridPos.x, gridPos.y)) {
        this.game.placePiece(this.selectedPieceIndex, gridPos.x, gridPos.y);
      }
    }
    
    this.selectedPiece = null;
    this.selectedPieceIndex = null;
    this.isDragging = false;
    this.isTouch = false;
    this.game.render();
  }

  getPieceAtPosition(x, y) {
    const handY = this.game.renderer.gridOffset.y + (9.5 * this.game.renderer.cellSize);
    const handCellSize = this.game.renderer.handCellSize || 30;
    
    // Match the layout calculation from drawHand
    const pieceSlotWidth = handCellSize * 5;
    const spacingBetween = this.game.renderer.isMobile ? 10 : 20;
    const totalWidth = (pieceSlotWidth * 3) + (spacingBetween * 2);
    const startX = (this.game.renderer.canvas.width - totalWidth) / 2;
    
    // Add padding around pieces for easier touch on mobile
    const touchPadding = this.game.renderer.isMobile ? 15 : 5;
    
    for (let i = 0; i < this.game.hand.length; i++) {
      const piece = this.game.hand[i];
      if (!piece) continue;
      
      const slotX = startX + i * (pieceSlotWidth + spacingBetween);
      const pieceWidth = piece.width * handCellSize;
      const pieceHeight = piece.height * handCellSize;
      const offsetX = (pieceSlotWidth - pieceWidth) / 2;
      
      // Check bounding box of the entire piece with padding for easier touch
      const pieceLeft = slotX + offsetX - touchPadding;
      const pieceRight = slotX + offsetX + pieceWidth + touchPadding;
      const pieceTop = handY - touchPadding;
      const pieceBottom = handY + pieceHeight + touchPadding;
      
      if (x >= pieceLeft && x <= pieceRight && y >= pieceTop && y <= pieceBottom) {
        return i;
      }
    }
    
    return null;
  }

  getGridPosition(canvasX, canvasY, piece = null) {
    // If we have a piece, adjust for its offset (matching drawDraggingPiece)
    let adjustedX = canvasX;
    let adjustedY = canvasY;
    
    if (piece) {
      const gridCellSize = this.game.renderer.cellSize;
      const offsetX = (piece.width * gridCellSize) / 2;
      // On touch, anchor from bottom; on mouse, center vertically
      const offsetY = this.isTouch ? (piece.height * gridCellSize) : (piece.height * gridCellSize) / 2;
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
    
    // Draw the piece following the cursor (pass isTouch flag)
    this.game.renderer.drawDraggingPiece(this.selectedPiece, this.mousePos.x, this.mousePos.y, this.isTouch);
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
