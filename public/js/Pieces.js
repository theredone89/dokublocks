// Piece shapes defined as matrices
const PIECE_SHAPES = {
  // Single block
  DOT: [[1]],

  // Dominoes
  DOMINO_H: [[1, 1]],
  DOMINO_V: [[1], [1]],

  // Trominoes
  L_SMALL: [[1, 0], [1, 1]],
  L_SMALL_R: [[0, 1], [1, 1]],
  L_SMALL_F: [[1, 1], [1, 0]],
  L_SMALL_FR: [[1, 1], [0, 1]],
  LINE_3_H: [[1, 1, 1]],
  LINE_3_V: [[1], [1], [1]],

  // Tetrominoes
  L_LARGE: [[1, 0], [1, 0], [1, 1]],
  L_LARGE_R: [[0, 1], [0, 1], [1, 1]],
  L_LARGE_F: [[1, 1], [1, 0], [1, 0]],
  L_LARGE_FR: [[1, 1], [0, 1], [0, 1]],
  T_SHAPE: [[1, 1, 1], [0, 1, 0]],
  T_SHAPE_R: [[0, 1], [1, 1], [0, 1]],
  T_SHAPE_F: [[0, 1, 0], [1, 1, 1]],
  T_SHAPE_L: [[1, 0], [1, 1], [1, 0]],
  SQUARE: [[1, 1], [1, 1]],
  Z_SHAPE: [[1, 1, 0], [0, 1, 1]],
  S_SHAPE: [[0, 1, 1], [1, 1, 0]],
  LINE_4_H: [[1, 1, 1, 1]],
  LINE_4_V: [[1], [1], [1], [1]],

  // Pentominoes
  LINE_5_H: [[1, 1, 1, 1, 1]],
  LINE_5_V: [[1], [1], [1], [1], [1]],
  PLUS: [[0, 1, 0], [1, 1, 1], [0, 1, 0]],
  CORNER_3X3: [[1, 1, 1], [1, 0, 0], [1, 0, 0]],
  CORNER_3X3_R: [[1, 1, 1], [0, 0, 1], [0, 0, 1]],
};

// Piece class
class Piece {
  constructor(shape, name) {
    this.shape = shape;
    this.name = name;
    this.width = shape[0].length;
    this.height = shape.length;
  }

  // Count number of blocks in piece
  getBlockCount() {
    let count = 0;
    for (let row = 0; row < this.shape.length; row++) {
      for (let col = 0; col < this.shape[row].length; col++) {
        if (this.shape[row][col] === 1) {
          count++;
        }
      }
    }
    return count;
  }
}

// Piece generator class
class PieceGenerator {
  constructor() {
    this.availableShapes = Object.keys(PIECE_SHAPES);
    this.smallPieces = ['DOT', 'DOMINO_H', 'DOMINO_V']; // 1-2 cell pieces
  }

  getRandomPiece(gridFillPercentage = 0) {
    // When grid is over 82% full, favor smaller pieces
    if (gridFillPercentage > 82) {
      // 33% chance of getting a small piece when grid is crowded
      if (Math.random() < 0.33) {
        const randomIndex = Math.floor(Math.random() * this.smallPieces.length);
        const shapeName = this.smallPieces[randomIndex];
        return new Piece(PIECE_SHAPES[shapeName], shapeName);
      }
    }
    
    // Default random selection
    const randomIndex = Math.floor(Math.random() * this.availableShapes.length);
    const shapeName = this.availableShapes[randomIndex];
    return new Piece(PIECE_SHAPES[shapeName], shapeName);
  }

  generateBatch(gridFillPercentage = 0) {
    return [
      this.getRandomPiece(gridFillPercentage),
      this.getRandomPiece(gridFillPercentage),
      this.getRandomPiece(gridFillPercentage)
    ];
  }
}
