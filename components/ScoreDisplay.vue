<template>
  <div class="score-display">
    <div class="score-item">
      <span class="score-label">Score:</span>
      <span class="score-value">{{ currentScore.toLocaleString() }}</span>
    </div>
    <div class="score-item">
      <span class="score-label">High Score:</span>
      <span class="score-value">{{ highScore.toLocaleString() }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

const currentScore = ref(0);
const highScore = ref(0);

function handleUpdate(e) {
  const d = e && e.detail ? e.detail : {};
  if (typeof d.currentScore === 'number') currentScore.value = d.currentScore;
  if (typeof d.highScore === 'number') highScore.value = d.highScore;
}

onMounted(() => {
  try {
    if (window && window.game && window.game.scoreManager) {
      currentScore.value = window.game.scoreManager.getScore();
      highScore.value = window.game.scoreManager.getHighScore();
    }
  } catch (e) {}
  window.addEventListener('blocklogic-score-update', handleUpdate);
});

onBeforeUnmount(() => {
  window.removeEventListener('blocklogic-score-update', handleUpdate);
});
</script>

<style scoped>
.score-display { display:flex; justify-content:center; gap:40px; font-size:18px; }
.score-item { display:flex; flex-direction:column; align-items:center; min-width: 100px; }
.score-label { color:#888; font-size:14px; margin-bottom:5px; }
.score-value { color:#4ecca3; font-size:28px; font-weight:bold; }
</style>
