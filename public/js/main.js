// Wait for DOM to load
// Handle `?continue=1` and `?new=1` query params after Game instance is created
const handleQueryActions = (gameInstance) => {
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('continue') === '1') {
      if (gameInstance && typeof gameInstance.loadState === 'function') {
        setTimeout(() => {
          gameInstance.loadState();
          history.replaceState(null, '', window.location.pathname + window.location.hash);
        }, 0);
      }
    } else if (params.get('new') === '1') {
      if (gameInstance && typeof gameInstance.clearSavedState === 'function') {
        setTimeout(() => {
          gameInstance.clearSavedState();
          if (typeof gameInstance.init === 'function') {
            gameInstance.init();
          }
          history.replaceState(null, '', window.location.pathname + window.location.hash);
        }, 0);
      }
    }
  } catch (e) {
    console.warn('Failed to handle query actions for game:', e);
  }
};

const initIfCanvasPresent = () => {
  const canvas = document.getElementById('game-canvas');
  if (!canvas) return false;

  // If there is an existing global game, verify it's bound to the current canvas
  if (window.game) {
    try {
      if (window.game.canvas === canvas) {
        // already initialized for this canvas
        try { handleQueryActions(window.game); } catch (e) { /* ignore */ }
        return true;
      } else {
        // Existing game instance is for a different/old canvas (e.g., navigation back). Try to stop it if possible.
        try {
          if (typeof window.game.stop === 'function') {
            window.game.stop();
          } else if (typeof window.game._running !== 'undefined') {
            window.game._running = false;
          }
        } catch (e) {
          console.warn('Failed to stop previous game instance', e);
        }
        // Allow GC and continue to create a fresh instance
        window.game = null;
      }
    } catch (e) {
      // In case reading window.game.canvas throws, clear and re-init
      window.game = null;
    }
  }

  try {
    const game = new Game(canvas);
    window.game = game;
    console.log('BlockLogic game initialized');
    console.log('Use window.game to access game instance');
    console.log('Drag pieces from below the grid to place them');
    // Apply query actions (load or clear saved state)
    try { handleQueryActions(game); } catch (e) { /* ignore */ }
    return true;
  } catch (e) {
    console.error('Failed to initialize game:', e);
    return false;
  }
};

// Expose helpers for page-specific initialization
window.initBlockLogicGame = initIfCanvasPresent;
window.handleBlockLogicQueryActions = handleQueryActions;

if (document.readyState === 'complete' || document.readyState === 'interactive') {
  // Try immediately in case page was already parsed
  if (!initIfCanvasPresent()) {
    // Observe DOM mutations and initialize when canvas is added (e.g., client-side route navigation)
    const observer = new MutationObserver((mutations, obs) => {
      if (initIfCanvasPresent()) {
        obs.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
} else {
  document.addEventListener('DOMContentLoaded', () => {
    if (!initIfCanvasPresent()) {
      const observer = new MutationObserver((mutations, obs) => {
        if (initIfCanvasPresent()) {
          obs.disconnect();
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }
  });
}
