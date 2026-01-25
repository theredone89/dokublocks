// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
  // Get canvas element
  const canvas = document.getElementById('game-canvas');
  
  if (!canvas) {
    console.error('Canvas element not found');
    return;
  }
  
  // Initialize game
  const game = new Game(canvas);
  
  // Make game accessible globally for debugging
  window.game = game;
  
  console.log('BlockLogic game initialized');
  console.log('Use window.game to access game instance');
  console.log('Drag pieces from below the grid to place them');
});
