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
import { onBeforeUnmount, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const emitOnlineEvent = () => {
  window.dispatchEvent(new Event('app-online'));
};

onMounted(() => {
  window.addEventListener('online', emitOnlineEvent);
    
  // Ensure game initializes when this page is mounted (handles client-side navigation)
  try {
    const tryInit = () => {
      if (!window || typeof window.initBlockLogicGame !== 'function') return false;
      try {
        const started = window.initBlockLogicGame();
        if (started) {
          console.log('[Game Page] initBlockLogicGame succeeded');
          if (typeof window.handleBlockLogicQueryActions === 'function') {
            try { window.handleBlockLogicQueryActions(window.game); } catch (e) { console.warn('[Game Page] query handler failed', e); }
          }
          return true;
        }
      } catch (err) {
        console.warn('[Game Page] initBlockLogicGame threw', err);
      }
      return false;
    };

    if (!tryInit()) {
      // Retry a few times in case scripts or DOM are still initializing
      let attempts = 0;
      const maxAttempts = 15;
      const intervalMs = 200;
      const interval = setInterval(() => {
        attempts += 1;
        if (tryInit() || attempts >= maxAttempts) {
          clearInterval(interval);
          if (attempts >= maxAttempts) console.warn('[Game Page] initBlockLogicGame failed after retries');
        }
      }, intervalMs);
    }
  } catch (e) {
    console.error('[Game Page] initialization error', e);
  }
});

// Component imports
import Header from '~/components/Header.vue';
import ScoreDisplay from '~/components/ScoreDisplay.vue';
import Modal from '~/components/Modal.vue';

function openTestModal() {
  try {
    if (window && window.game && typeof window.game.showGameOverModal === 'function') {
      window.game.showGameOverModal();
      return;
    }
  } catch (e) {}
  const m = document.getElementById('game-over-modal');
  if (m) m.classList.remove('hidden');
}

onBeforeUnmount(() => {
  window.removeEventListener('online', emitOnlineEvent);
});
</script>

<style scoped>
@import '/src/commons/buttons.css';
/* Game page specific styles moved here to avoid global CSS leakage */
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
  /* Prevent CLS by reserving space for the canvas */
  min-width: 360px;
  min-height: 360px;
}

/* Buttons are provided by public/css/buttons.css */

/* Modal styles moved into components/Modal.vue */
</style>
