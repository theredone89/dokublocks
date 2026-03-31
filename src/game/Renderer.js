export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.gridSize = 9;
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
    this.resize();
  }

  setTheme(isLight) { this.colors = isLight ? this.lightColors : this.darkColors; }

  resize() {
    const isMobile = window.innerWidth <= 768;
    this.isMobile = isMobile;
    const padding = isMobile ? 10 : 40;
    const maxWidth = Math.min(window.innerWidth - padding, 600);
    const sideOffset = isMobile ? 10 : 50;
    this.cellSize = Math.floor((maxWidth - sideOffset * 2) / 9);
    this.cellSize = Math.max(this.cellSize, 30);
    this.cellSize = Math.min(this.cellSize, 50);
    const gridWidth = this.cellSize * 9;
    this.gridOffset = { x: Math.floor((maxWidth - gridWidth) / 2), y: isMobile ? 10 : 30 };
    const handMargin = isMobile ? 10 : 20;
    const spacingBetween = isMobile ? 10 : 20;
    const availableHandWidth = maxWidth - (handMargin * 2) - (spacingBetween * 2);
    const maxHandCellFromWidth = Math.floor(availableHandWidth / 3 / 5);
    this.handCellSize = isMobile ? Math.min(Math.floor(this.cellSize * 0.7), maxHandCellFromWidth) : Math.floor(this.cellSize * 0.6);
    this.handCellSize = Math.max(this.handCellSize, 20);
    const handHeight = (this.handCellSize * 5) + (isMobile ? 30 : 50);
    this.canvas.width = maxWidth;
    this.canvas.height = this.gridOffset.y + (this.cellSize * 9) + handHeight;
  }

  drawGrid(gridData) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = this.colors.background;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawCells(gridData);
    this.drawGridLines();
  }

  drawCells(gridData) {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const x = this.gridOffset.x + col * this.cellSize;
        const y = this.gridOffset.y + row * this.cellSize;
        this.ctx.fillStyle = gridData[row][col] === 1 ? this.colors.filledCell : this.colors.emptyCell;
        this.ctx.fillRect(x + 1, y + 1, this.cellSize - 2, this.cellSize - 2);
      }
    }
  }

  drawGridLines() {
    this.ctx.strokeStyle = this.colors.gridLine;
    this.ctx.lineWidth = 1;
    for (let i = 0; i <= 9; i++) {
      const offset = i * this.cellSize;
      this.ctx.beginPath();
      this.ctx.moveTo(this.gridOffset.x + offset, this.gridOffset.y);
      this.ctx.lineTo(this.gridOffset.x + offset, this.gridOffset.y + 9 * this.cellSize);
      this.ctx.stroke();
      this.ctx.beginPath();
      this.ctx.moveTo(this.gridOffset.x, this.gridOffset.y + offset);
      this.ctx.lineTo(this.gridOffset.x + 9 * this.cellSize, this.gridOffset.y + offset);
      this.ctx.stroke();
    }
    this.ctx.strokeStyle = this.colors.subgridLine;
    this.ctx.lineWidth = 3;
    for (let i = 0; i <= 9; i += 3) {
      const offset = i * this.cellSize;
      this.ctx.beginPath();
      this.ctx.moveTo(this.gridOffset.x + offset, this.gridOffset.y);
      this.ctx.lineTo(this.gridOffset.x + offset, this.gridOffset.y + 9 * this.cellSize);
      this.ctx.stroke();
      this.ctx.beginPath();
      this.ctx.moveTo(this.gridOffset.x, this.gridOffset.y + offset);
      this.ctx.lineTo(this.gridOffset.x + 9 * this.cellSize, this.gridOffset.y + offset);
      this.ctx.stroke();
    }
  }

  drawHand(pieces) {
    const handY = this.gridOffset.y + (9.5 * this.cellSize);
    const handCellSize = this.handCellSize || 30;
    const handMargin = this.isMobile ? 10 : 20;
    const spacingBetween = this.isMobile ? 10 : 20;
    const pieceSlotWidth = handCellSize * 5;
    const totalWidth = (pieceSlotWidth * 3) + (spacingBetween * 2);
    const startX = (this.canvas.width - totalWidth) / 2;
    pieces.forEach((piece, index) => {
      if (!piece) return;
      const slotX = startX + index * (pieceSlotWidth + spacingBetween);
      const pieceWidth = piece.width * handCellSize;
      const offsetX = (pieceSlotWidth - pieceWidth) / 2;
      for (let row = 0; row < piece.shape.length; row++) {
        for (let col = 0; col < piece.shape[row].length; col++) {
          if (piece.shape[row][col] === 1) {
            const x = slotX + offsetX + col * handCellSize;
            const y = handY + row * handCellSize;
            this.ctx.fillStyle = this.colors.filledCell;
            this.ctx.fillRect(x, y, handCellSize - 2, handCellSize - 2);
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
    clears.rows.forEach(rowIndex => {
      const y = this.gridOffset.y + rowIndex * this.cellSize;
      this.ctx.fillRect(this.gridOffset.x, y, 9 * this.cellSize, this.cellSize);
    });
    clears.cols.forEach(colIndex => {
      const x = this.gridOffset.x + colIndex * this.cellSize;
      this.ctx.fillRect(x, this.gridOffset.y, this.cellSize, 9 * this.cellSize);
    });
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
    const alpha = 1 - progress;
    this.ctx.globalAlpha = alpha;
    const scale = 1 + (progress * 0.3);
    cells.forEach(({ row, col }) => {
      const centerX = this.gridOffset.x + (col + 0.5) * this.cellSize;
      const centerY = this.gridOffset.y + (row + 0.5) * this.cellSize;
      const size = this.cellSize * scale;
      const x = centerX - size / 2;
      const y = centerY - size / 2;
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
    const cellSize = this.cellSize;
    const offsetX = (piece.width * cellSize) / 2;
    const offsetY = isTouch ? (piece.height * cellSize) : (piece.height * cellSize) / 2;
    this.ctx.save();
    this.ctx.globalAlpha = 0.8;
    for (let row = 0; row < piece.shape.length; row++) {
      for (let col = 0; col < piece.shape[row].length; col++) {
        if (piece.shape[row][col] === 1) {
          const x = mouseX - offsetX + col * cellSize;
          const y = mouseY - offsetY + row * cellSize;
          this.ctx.fillStyle = this.colors.filledCell;
          this.ctx.fillRect(x, y, cellSize - 2, cellSize - 2);
          this.ctx.strokeStyle = this.colors.ghost;
          this.ctx.lineWidth = 2;
          this.ctx.strokeRect(x, y, cellSize - 2, cellSize - 2);
        }
      }
    }
    this.ctx.restore();
  }
}
