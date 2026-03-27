<template>
  <div class="container">
    <client-only>
      <div id="offline-banner" class="offline-banner hidden">
        📡 <span id="offline-text">Checking connection...</span>
      </div>
    </client-only>

    <Header>
      <div class="header-top">
      </div>
      <ScoreDisplay />
    </Header>

    <main>
      <div class="game-area">
        <canvas id="game-canvas"></canvas>
        <button id="test-open-modal-btn" class="game-button" @click="openTestModal">Test Submit Score</button>
      </div>
    </main>
  </div>

  <Modal id="game-over-modal">
    <h2>Game Over!</h2>
    <p class="final-score">Score: <span id="final-score">0</span></p>
    <p class="high-score-text">High Score: <span id="modal-high-score">0</span></p>

    <div class="username-input">
      <label for="username">Enter Name:</label>
      <input id="username" type="text" maxlength="20" placeholder="Player">
    </div>

    <div class="modal-buttons">
      <button id="submit-score-btn" class="game-button">Submit Score</button>
      <button id="play-again-btn" class="game-button">Play Again</button>
    </div>
  </Modal>

  <Modal id="dialog-modal">
    <div class="dialog-content">
      <p id="dialog-message"></p>
      <div class="modal-buttons">
        <button id="dialog-ok-btn" class="game-button">OK</button>
      </div>
    </div>
  </Modal>

  <Modal id="confirm-modal">
    <div class="dialog-content">
      <p id="confirm-message"></p>
      <div class="modal-buttons">
        <button id="confirm-yes-btn" class="game-button">Yes</button>
        <button id="confirm-no-btn" class="game-button secondary">No</button>
      </div>
    </div>
  </Modal>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import Header from '~/components/Header.vue';
import ScoreDisplay from '~/components/ScoreDisplay.vue';
import Modal from '~/components/Modal.vue';

// Import game modules (ESM)
import Game from '~/src/game/Game.js';

const canvasRef = ref(null);

const emitOnlineEvent = () => { window.dispatchEvent(new Event('app-online')); };

let gameInstance = null;

onMounted(async () => {
  window.addEventListener('online', emitOnlineEvent);

  // Initialize Game using ESM modules and the local canvas
  const canvas = document.getElementById('game-canvas');
  if (!canvas) return;

  // Load daily initial state from API
  try {
    const resp = await fetch('/api/daily');
    if (resp.ok) {
      const json = await resp.json();
      if (json && json.success && json.data) {
        gameInstance = new Game(canvas, json.data);
      } else if (json && json.data) {
        gameInstance = new Game(canvas, json.data);
      } else {
        gameInstance = new Game(canvas);
      }
    } else {
      gameInstance = new Game(canvas);
    }
  } catch (e) {
    console.warn('[Daily Page] Failed to load daily data, starting default game', e);
    gameInstance = new Game(canvas);
  }

  // Expose for compatibility
  window.game = gameInstance;

  console.log('[Daily Page] Game initialized via ESM modules (daily)');
});

function openTestModal() {
  if (window && window.game && typeof window.game.showGameOverModal === 'function') {
    window.game.showGameOverModal();
    return;
  }
  const m = document.getElementById('game-over-modal'); if (m) m.classList.remove('hidden');
}

onBeforeUnmount(() => { window.removeEventListener('online', emitOnlineEvent); if (gameInstance && typeof gameInstance.backupManager?.stopAutoSync === 'function') gameInstance.backupManager.stopAutoSync(); });
</script>

<style scoped>
@import '/src/commons/buttons.css';
.game-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

#game-canvas {
  border: 3px solid #0f3460;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  cursor: pointer;
  min-width: 360px;
  min-height: 360px;
}
</style>
