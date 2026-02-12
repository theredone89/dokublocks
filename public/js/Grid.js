class Grid {
  constructor() {
    this.size = 9;
    this.cells = this.initializeGrid();
  }

  initializeGrid() {
    // Create 9x9 array filled with 0s (empty cells)
    return Array(9).fill().map(() => Array(9).fill(0));
  }

  reset() {
    this.cells = this.initializeGrid();
  }

  getCell(x, y) {
    if (x < 0 || x >= 9 || y < 0 || y >= 9) {
      return null;
    }
    return this.cells[y][x];
  }

  setCell(x, y, value) {
    if (x >= 0 && x < 9 && y >= 0 && y < 9) {
      this.cells[y][x] = value;
    }
  }

  canPlacePiece(piece, startX, startY) {
    // Check if piece can be placed at given position
    for (let row = 0; row < piece.shape.length; row++) {
      for (let col = 0; col < piece.shape[row].length; col++) {
        if (piece.shape[row][col] === 1) {
          const gridX = startX + col;
          const gridY = startY + row;

          // Boundary check
          if (gridX < 0 || gridX >= 9 || gridY < 0 || gridY >= 9) {
            return false;
          }

          // Collision check
          if (this.cells[gridY][gridX] === 1) {
            return false;
          }
        }
      }
    }
    return true;
  }

  placePiece(piece, startX, startY) {
    // Place piece on grid (assumes validation already done)
    for (let row = 0; row < piece.shape.length; row++) {
      for (let col = 0; col < piece.shape[row].length; col++) {
        if (piece.shape[row][col] === 1) {
          const gridX = startX + col;
          const gridY = startY + row;
          this.cells[gridY][gridX] = 1;
        }
      }
    }
  }

  checkClears(cells = this.cells) {
    const clears = {
      rows: [],
      cols: [],
      squares: []
    };

    // Check rows
    for (let row = 0; row < 9; row++) {
      if (cells[row].every(cell => cell === 1)) {
        clears.rows.push(row);
      }
    }

    // Check columns
    for (let col = 0; col < 9; col++) {
      let isFull = true;
      for (let row = 0; row < 9; row++) {
        if (cells[row][col] === 0) {
          isFull = false;
          break;
        }
      }
      if (isFull) {
        clears.cols.push(col);
      }
    }

    // Check 3x3 squares
    for (let squareRow = 0; squareRow < 3; squareRow++) {
      for (let squareCol = 0; squareCol < 3; squareCol++) {
        if (this.isSquareFullInCells(cells, squareRow, squareCol)) {
          clears.squares.push({ row: squareRow, col: squareCol });
        }
      }
    }

    return clears;
  }

  isSquareFullInCells(cells, squareRow, squareCol) {
    const startRow = squareRow * 3;
    const startCol = squareCol * 3;

    for (let row = startRow; row < startRow + 3; row++) {
      for (let col = startCol; col < startCol + 3; col++) {
        if (cells[row][col] === 0) {
          return false;
        }
      }
    }
    return true;
  }

  isSquareFull(squareRow, squareCol) {
    const startRow = squareRow * 3;
    const startCol = squareCol * 3;

    for (let row = startRow; row < startRow + 3; row++) {
      for (let col = startCol; col < startCol + 3; col++) {
        if (this.cells[row][col] === 0) {
          return false;
        }
      }
    }
    return true;
  }

  getFilledPercentage() {
    let filledCount = 0;
    const totalCells = this.size * this.size;
    
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        if (this.cells[row][col] === 1) {
          filledCount++;
        }
      }
    }
    
    return (filledCount / totalCells) * 100;
  }

  clearLines(clears) {
    // Clear rows
    clears.rows.forEach(row => {
      for (let col = 0; col < 9; col++) {
        this.cells[row][col] = 0;
      }
    });

    // Clear columns
    clears.cols.forEach(col => {
      for (let row = 0; row < 9; row++) {
        this.cells[row][col] = 0;
      }
    });

    // Clear squares
    clears.squares.forEach(square => {
      const startRow = square.row * 3;
      const startCol = square.col * 3;
      for (let row = startRow; row < startRow + 3; row++) {
        for (let col = startCol; col < startCol + 3; col++) {
          this.cells[row][col] = 0;
        }
      }
    });
  }
}
