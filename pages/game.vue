<template>
  <div class="container">
    <div id="offline-banner" class="offline-banner hidden">
      📡 <span id="offline-text">You are offline - using local storage</span>
    </div>

    <header>
      <div class="header-top">
        <NuxtLink to="/menu" class="back-button-fixed" id="back-btn" aria-label="Back to menu">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </NuxtLink>
        <img src="/img/vectorink-vectorizer-result.svg" alt="BlockLogic" class="logo">
        <div class="theme-toggle">
          <label class="toggle-switch">
            <input id="theme-toggle" type="checkbox">
            <span class="toggle-slider"></span>
          </label>
          <img src="/img/dark-theme-svgrepo-com.svg" alt="Toggle theme" class="theme-icon">
        </div>
      </div>
      <div class="score-display">
        <div class="score-item">
          <span class="score-label">Score:</span>
          <span id="current-score" class="score-value">0</span>
        </div>
        <div class="score-item">
          <span class="score-label">High Score:</span>
          <span id="high-score" class="score-value">0</span>
        </div>
      </div>
    </header>

    <main>
      <div class="game-area">
        <canvas id="game-canvas"></canvas>
        <button id="restart-btn" class="game-button">Restart Game</button>
      </div>

      <!-- Leaderboard moved to its own page -->
    </main>
  </div>

  <div id="game-over-modal" class="modal hidden">
    <div class="modal-content">
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
    </div>
  </div>

  <div id="dialog-modal" class="modal hidden">
    <div class="modal-content dialog-content">
      <p id="dialog-message"></p>
      <div class="modal-buttons">
        <button id="dialog-ok-btn" class="game-button">OK</button>
      </div>
    </div>
  </div>

  <div id="confirm-modal" class="modal hidden">
    <div class="modal-content dialog-content">
      <p id="confirm-message"></p>
      <div class="modal-buttons">
        <button id="confirm-yes-btn" class="game-button">Yes</button>
        <button id="confirm-no-btn" class="game-button secondary">No</button>
      </div>
    </div>
  </div>
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

onBeforeUnmount(() => {
  window.removeEventListener('online', emitOnlineEvent);
});
</script>
