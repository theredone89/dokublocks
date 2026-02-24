<template>
  <div class="container">
    <div id="offline-banner" class="offline-banner hidden">
      📡 <span id="offline-text">You are offline - using local storage</span>
    </div>

    <header>
      <div class="header-top">
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

      <aside id="leaderboard-container">
        <h2>Leaderboard</h2>
        <div id="leaderboard-loading" class="loading">Loading...</div>
        <ol id="leaderboard-list" class="hidden"></ol>
        <button id="refresh-leaderboard-btn" class="game-button">Refresh</button>
      </aside>
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

const emitOnlineEvent = () => {
  window.dispatchEvent(new Event('app-online'));
};

onMounted(() => {
  window.addEventListener('online', emitOnlineEvent);
});

onBeforeUnmount(() => {
  window.removeEventListener('online', emitOnlineEvent);
});
</script>
