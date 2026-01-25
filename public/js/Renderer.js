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
      highlight: '#e94560',
      ghost: '#4ecca3'
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

  drawCells(gridData) {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const x = this.gridOffset.x + col * this.cellSize;
        const y = this.gridOffset.y + row * this.cellSize;
        
        // Fill cell
        this.ctx.fillStyle = gridData[row][col] === 1 
          ? this.colors.filledCell 
          : this.colors.emptyCell;
        this.ctx.fillRect(x + 1, y + 1, this.cellSize - 2, this.cellSize - 2);
      }
    }
  }

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

  drawHand(pieces) {
    const handY = this.gridOffset.y + 10 * this.cellSize;
    const handCellSize = 30;
    const spacing = 150;
    
    pieces.forEach((piece, index) => {
      if (!piece) return; // Piece already used
      
      const handX = this.gridOffset.x + index * spacing;
      
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

  drawGhostPreview(piece, gridX, gridY) {
    if (!piece) return;
    
    this.ctx.globalAlpha = 0.4;
    
    for (let row = 0; row < piece.shape.length; row++) {
      for (let col = 0; col < piece.shape[row].length; col++) {
        if (piece.shape[row][col] === 1) {
          const x = this.gridOffset.x + (gridX + col) * this.cellSize;
          const y = this.gridOffset.y + (gridY + row) * this.cellSize;
          
          this.ctx.fillStyle = this.colors.ghost;
          this.ctx.fillRect(x + 1, y + 1, this.cellSize - 2, this.cellSize - 2);
        }
      }
    }
    
    this.ctx.globalAlpha = 1.0;
  }

  highlightClears(clears) {
    if (!clears) return;
    
    this.ctx.globalAlpha = 0.3;
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

  drawFloatingText(x, y, text, alpha) {
    this.ctx.save();
    this.ctx.globalAlpha = alpha;
    this.ctx.font = 'bold 24px Arial';
    this.ctx.fillStyle = this.colors.highlight;
    this.ctx.textAlign = 'center';
    this.ctx.fillText(text, x, y);
    this.ctx.restore();
  }

  drawDraggingPiece(piece, mouseX, mouseY) {
    if (!piece) return;
    
    const cellSize = 30;
    // Center the piece on the cursor
    const offsetX = (piece.width * cellSize) / 2;
    const offsetY = (piece.height * cellSize) / 2;
    
    this.ctx.save();
    this.ctx.globalAlpha = 0.8;
    
    for (let row = 0; row < piece.shape.length; row++) {
      for (let col = 0; col < piece.shape[row].length; col++) {
        if (piece.shape[row][col] === 1) {
          const x = mouseX - offsetX + col * cellSize;
          const y = mouseY - offsetY + row * cellSize;
          
          // Draw block
          this.ctx.fillStyle = this.colors.filledCell;
          this.ctx.fillRect(x, y, cellSize - 2, cellSize - 2);
          
          // Draw border
          this.ctx.strokeStyle = this.colors.ghost;
          this.ctx.lineWidth = 2;
          this.ctx.strokeRect(x, y, cellSize - 2, cellSize - 2);
        }
      }
    }
    
    this.ctx.restore();
  }
}
