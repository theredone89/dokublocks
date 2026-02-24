class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.gridSize = 9;
    
    // Color schemes
    this.darkColors = {
      background: '#1a1a2e',
      gridLine: '#677698',
      subgridLine: '#829eb8',
      emptyCell: '#16213e',
      filledCell: '#123768', 
      highlight: '#4ecca3',
      ghost: '#90caf9'
    };
    
    this.lightColors = {
      background: '#f5f5f5',
      gridLine: '#125ec2',
      subgridLine: '#0f417f',
      emptyCell: '#ffffff',
      filledCell: '#3a8dd1',
      highlight: '#3603c0',
      ghost: '#41a6ff'
    };
    
    this.colors = this.darkColors;
    
    // Initialize sizes based on screen
    this.resize();
  }

  setTheme(isLight) {
    this.colors = isLight ? this.lightColors : this.darkColors;
  }

  resize() {
    // Calculate available width (minimal padding on mobile)
    const isMobile = window.innerWidth <= 768;
    this.isMobile = isMobile;
    const padding = isMobile ? 10 : 40;
    const maxWidth = Math.min(window.innerWidth - padding, 600);
    
    // Calculate cell size to fit the grid with minimal offsets
    // Grid needs: offset + (9 cells * cellSize) + offset
    const sideOffset = isMobile ? 10 : 50;
    this.cellSize = Math.floor((maxWidth - sideOffset * 2) / 9);
    
    // Minimum cell size for playability
    this.cellSize = Math.max(this.cellSize, 30);
    // Maximum cell size for desktop
    this.cellSize = Math.min(this.cellSize, 50);
    
    // Calculate canvas dimensions
    const gridWidth = this.cellSize * 9;
    this.gridOffset = { 
      x: Math.floor((maxWidth - gridWidth) / 2), 
      y: isMobile ? 10 : 30 
    };
    
    // Hand area needs space below grid
    // Calculate hand cell size based on available width for 3 pieces with spacing
    const handMargin = isMobile ? 10 : 20; // Margin on each side
    const spacingBetween = isMobile ? 10 : 20;
    const availableHandWidth = maxWidth - (handMargin * 2) - (spacingBetween * 2);
    // Each piece slot needs to fit max 5 blocks, divide available width by 3 pieces
    const maxHandCellFromWidth = Math.floor(availableHandWidth / 3 / 5);
    
    // Hand cell size - bigger on mobile for easier touch, but constrained by width
    this.handCellSize = isMobile 
      ? Math.min(Math.floor(this.cellSize * 0.7), maxHandCellFromWidth)
      : Math.floor(this.cellSize * 0.6);
    
    // Ensure minimum size for usability
    this.handCellSize = Math.max(this.handCellSize, 20);
    
    // Hand height must fit 5 blocks + some padding
    const handHeight = (this.handCellSize * 5) + (isMobile ? 30 : 50);
    
    // Set canvas size
    this.canvas.width = maxWidth;
    this.canvas.height = this.gridOffset.y + (this.cellSize * 9) + handHeight;
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
    const handY = this.gridOffset.y + (9.5 * this.cellSize);
    const handCellSize = this.handCellSize || 30;
    
    // Calculate layout with margins
    const handMargin = this.isMobile ? 10 : 20;
    const spacingBetween = this.isMobile ? 10 : 20;
    const pieceSlotWidth = handCellSize * 5; // Max piece width (5 blocks)
    const totalWidth = (pieceSlotWidth * 3) + (spacingBetween * 2);
    
    // Center the hand area with margins
    const startX = (this.canvas.width - totalWidth) / 2;
    
    pieces.forEach((piece, index) => {
      if (!piece) return; // Piece already used
      
      // Calculate slot position with spacing
      const slotX = startX + index * (pieceSlotWidth + spacingBetween);
      
      // Center piece within its slot
      const pieceWidth = piece.width * handCellSize;
      const offsetX = (pieceSlotWidth - pieceWidth) / 2;
      
      // Draw piece preview
      for (let row = 0; row < piece.shape.length; row++) {
        for (let col = 0; col < piece.shape[row].length; col++) {
          if (piece.shape[row][col] === 1) {
            const x = slotX + offsetX + col * handCellSize;
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

  drawClearingCells(cells, progress) {
    if (!cells || cells.length === 0) return;
    
    this.ctx.save();
    
    // Fade out: alpha goes from 1 to 0
    const alpha = 1 - progress;
    this.ctx.globalAlpha = alpha;
    
    // Zoom: scale goes from 1 to 1.3
    const scale = 1 + (progress * 0.3);
    
    cells.forEach(({ row, col }) => {
      const centerX = this.gridOffset.x + (col + 0.5) * this.cellSize;
      const centerY = this.gridOffset.y + (row + 0.5) * this.cellSize;
      
      const size = this.cellSize * scale;
      const x = centerX - size / 2;
      const y = centerY - size / 2;
      
      // Draw scaled cell
      this.ctx.fillStyle = this.colors.highlight;
      this.ctx.fillRect(x + 1, y + 1, size - 2, size - 2);
    });
    
    this.ctx.restore();
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

  drawDraggingPiece(piece, mouseX, mouseY, isTouch = false) {
    if (!piece) return;
    
    const cellSize = this.cellSize; // Use grid cell size for proper alignment
    // Center the piece horizontally on the cursor
    const offsetX = (piece.width * cellSize) / 2;
    // On touch, anchor from bottom; on mouse, center vertically
    const offsetY = isTouch ? (piece.height * cellSize) : (piece.height * cellSize) / 2;
    
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
