<template>
  <div class="score-display">
    <div class="score-item">
      <span class="score-label">Score:</span>
      <span class="score-value">{{ currentScore.toLocaleString() }}</span>
    </div>

    <!-- When used for daily, show Daily Tries + Daily High; otherwise show global High Score -->
    <template v-if="showDaily">
      <div class="score-item">
        <span class="score-label">Daily tries</span>
        <span class="score-value">{{ dailyTries }}</span>
      </div>
      <div class="score-item">
        <span class="score-label">Daily high</span>
        <span class="score-value">{{ Number(dailyHigh).toLocaleString() }}</span>
      </div>
      <div class="score-item">
        <span class="score-label">Target</span>
        <span class="score-value">{{ targetScore !== null ? Number(targetScore).toLocaleString() : '-' }}</span>
      </div>
    </template>
    <template v-else>
      <div class="score-item">
        <span class="score-label">High Score:</span>
        <span class="score-value">{{ highScore.toLocaleString() }}</span>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';

const props = defineProps({
  showDaily: { type: Boolean, default: false },
  dailyId: { type: [String, Number], default: null }
});

const currentScore = ref(0);
const highScore = ref(0);
const dailyTries = ref(0);
const dailyHigh = ref(0);
const targetScore = ref(null);

function readDailyValues(id) {
  try {
    if (!id) return;
    const dailyKey = `blocklogic-daily-${id}`;
    const raw = localStorage.getItem(dailyKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      dailyTries.value = typeof parsed.tries === 'number' ? parsed.tries : 0;
    } else {
      dailyTries.value = 0;
    }
    const highKey = `blocklogic-daily-high-${id}`;
    const rawHigh = localStorage.getItem(highKey);
    dailyHigh.value = rawHigh ? Number(rawHigh) : 0;
  } catch (e) {
    dailyTries.value = 0; dailyHigh.value = 0;
  }
}

function handleUpdate(e) {
  const d = e && e.detail ? e.detail : {};
  if (typeof d.currentScore === 'number') currentScore.value = d.currentScore;
  if (typeof d.highScore === 'number') highScore.value = d.highScore;
  // refresh daily values when score updates
  if (props.showDaily && props.dailyId) readDailyValues(props.dailyId);
  // update target score from game challenge if available
  try {
    const T = window && window.game && window.game.challenge && typeof window.game.challenge.targetScore === 'number' ? window.game.challenge.targetScore : null;
    targetScore.value = T;
  } catch (err) { targetScore.value = null; }
}

function handleDailyEvent(e) {
  const d = e && e.detail ? e.detail : {};
  if (d && d.id && String(d.id) === String(props.dailyId)) {
    if (typeof d.tries === 'number') dailyTries.value = d.tries;
    if (typeof d.won !== 'undefined') {
      // no-op for now
    }
    if (typeof d.high === 'number') dailyHigh.value = d.high;
  }
}

onMounted(() => {
  try {
    if (window && window.game && window.game.scoreManager) {
      currentScore.value = window.game.scoreManager.getScore();
      highScore.value = window.game.scoreManager.getHighScore();
    }
  } catch (e) {}
  window.addEventListener('blocklogic-score-update', handleUpdate);
  window.addEventListener('blocklogic-daily-update', handleDailyEvent);
  if (props.showDaily && props.dailyId) readDailyValues(props.dailyId);
  // read initial target score if present on global game
  try { targetScore.value = window && window.game && window.game.challenge && typeof window.game.challenge.targetScore === 'number' ? window.game.challenge.targetScore : null; } catch (err) { targetScore.value = null; }
});

onBeforeUnmount(() => {
  window.removeEventListener('blocklogic-score-update', handleUpdate);
  window.removeEventListener('blocklogic-daily-update', handleDailyEvent);
});

watch(() => props.dailyId, (id) => { if (props.showDaily) readDailyValues(id); try { targetScore.value = window && window.game && window.game.challenge && typeof window.game.challenge.targetScore === 'number' ? window.game.challenge.targetScore : null; } catch (err) { targetScore.value = null; } });
</script>

<style scoped>
.score-display { display:flex; justify-content:center; gap:40px; font-size:18px; }
.score-item { display:flex; flex-direction:column; align-items:center; min-width: 100px; }
.score-label { color:#888; font-size:14px; margin-bottom:5px; }
.score-value { color:#4ecca3; font-size:28px; font-weight:bold; }
</style>
