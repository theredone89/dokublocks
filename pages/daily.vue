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
      <ScoreDisplay :showDaily="true" :dailyId="selectedId" />
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
    <p v-if="!isDaily" class="high-score-text">High Score: <span id="modal-high-score">0</span></p>

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

  <Modal id="challenge-win-modal">
    <div class="dialog-content">
      <h2>Challenge Reached!</h2>
      <p>Target: <span id="challenge-target">0</span></p>
      <p>Your score: <span id="challenge-current">0</span></p>
      <div class="modal-buttons">
        <button id="challenge-continue-btn" class="game-button">Continue</button>
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
import { computed } from 'vue';
const selectedId = ref(null);
const isDaily = computed(() => !!selectedId.value);

const emitOnlineEvent = () => { window.dispatchEvent(new Event('app-online')); };

let gameInstance = null;

function normalizeGrid(grid) {
  if (!Array.isArray(grid)) return null;
  const size = 9;
  const out = Array.from({ length: size }, () => Array.from({ length: size }, () => 0));
  for (let r = 0; r < Math.min(grid.length, size); r++) {
    const row = grid[r];
    if (!Array.isArray(row)) continue;
    for (let c = 0; c < Math.min(row.length, size); c++) {
      const v = row[c];
      out[r][c] = (typeof v === 'number' && v === 1) ? 1 : 0;
    }
  }
  return out;
}

onMounted(async () => {
  window.addEventListener('online', emitOnlineEvent);

  // Initialize Game using ESM modules and the local canvas
  const canvas = document.getElementById('game-canvas');
  if (!canvas) return;
  // Load daily data from API, pick today's challenge (or ?c= override), pass only initState and targetScore
  let selectedChallenge = null;
  try {
    const resp = await fetch('/api/daily');
    if (resp.ok) {
      const json = await resp.json();
      let dailyList = null;

      if (json && json.data) {
        if (Array.isArray(json.data.daily)) {
          dailyList = json.data.daily;
        } else if (Array.isArray(json.data.challenges)) {
          // backward compatibility
          dailyList = json.data.challenges.map((c, i) => ({ id: c.id || String(i), date: c.date || null, challenge: c }));
        }
      }

        if (dailyList && dailyList.length > 0) {
        const params = new URLSearchParams(window.location.search);
        const idParam = params.get('id');
        const cParam = params.get('c');
        let entry = null;

        // Prefer explicit `id` URL parameter (matches entry.id or nested challenge.id)
        if (idParam !== null) {
          entry = dailyList.find(d => {
            const entryId = d.id ?? (d.challenge && d.challenge.id);
            return entryId !== undefined && String(entryId) === String(idParam);
          });
          // If `id` looks like a numeric index and no match found, allow index fallback
          if (!entry) {
            const idx = parseInt(idParam, 10);
            if (!isNaN(idx) && idx >= 0 && idx < dailyList.length) entry = dailyList[idx];
          }
        }

        // If no entry chosen yet, fall back to `c` index param or today's challenge
        if (!entry) {
          if (cParam !== null) {
            const idx = parseInt(cParam, 10);
            const safeIdx = isNaN(idx) ? 0 : Math.max(0, Math.min(idx, dailyList.length - 1));
            entry = dailyList[safeIdx];
          } else {
            const today = new Date().toISOString().slice(0, 10);
            entry = dailyList.find(d => d.date === today) || dailyList[0];
          }
        }

        if (entry) {
          // challenge payload may be nested under `challenge` key
          selectedChallenge = entry.challenge || entry;
          const initState = {
            id: selectedChallenge.id || entry.id || null,
            grid: normalizeGrid(selectedChallenge.grid),
            hand: Array.isArray(selectedChallenge.hand) ? selectedChallenge.hand : null,
            targetScore: (selectedChallenge && typeof selectedChallenge.targetScore === 'number') ? selectedChallenge.targetScore : null
          };
          selectedId.value = initState.id;
          gameInstance = new Game(canvas, initState);
        } else {
          gameInstance = new Game(canvas);
        }
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
    // no-op: high score tile is hidden via component-scoped CSS

    // ScoreDisplay reads daily tries/high from localStorage when showDaily is true

  // Wire challenge continue button to Game.continueChallenge (or hide modal fallback)
  setTimeout(() => {
    const cont = document.getElementById('challenge-continue-btn');
    if (cont) {
      cont.addEventListener('click', () => {
        if (window.game && typeof window.game.continueChallenge === 'function') {
          window.game.continueChallenge();
        } else {
          const m = document.getElementById('challenge-win-modal'); if (m) m.classList.add('hidden');
        }
      });
    }
  }, 1000);

  // Expose for compatibility
  window.game = gameInstance;
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
