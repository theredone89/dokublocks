<template>
  <div class="container leaderboard-page">
    <Header>
      <h1>Leaderboard</h1>
    </Header>

    <main>
      <div id="leaderboard-area">
        <div v-if="loading" class="skeleton-container" aria-busy="true" aria-label="Loading leaderboard">
          <ul class="skeleton-list" role="list">
            <li v-for="n in 10" :key="n" class="skeleton-item">
              <span class="skeleton-rank skeleton-line"></span>
              <span class="skeleton-name skeleton-line"></span>
              <span class="skeleton-score skeleton-line"></span>
            </li>
          </ul>
        </div>
        <ol id="leaderboard-list" v-else>
          <li v-for="(entry, index) in scores" :key="entry.id">
            <span class="leaderboard-rank">#{{ index + 1 }}</span>
            <span class="leaderboard-name">{{ entry.username }}</span>
            <span class="leaderboard-score">{{ entry.score.toLocaleString() }}</span>
          </li>
        </ol>
        <div class="leaderboard-actions">
          <button id="refresh-leaderboard-btn" class="game-button" @click="refresh">Refresh</button>
          <NuxtLink to="/new" class="game-button">New Game</NuxtLink>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Header from '~/components/Header.vue';

const scores = ref([]);
const loading = ref(true);

const backupManager = typeof ScoreBackupManager !== 'undefined' ? new ScoreBackupManager() : null;

async function loadLeaderboard() {
  loading.value = true;
  try {
    const response = await fetch('/api/leaderboard');
    if (!response.ok) throw new Error('Failed to fetch leaderboard');
    const data = await response.json();
    if (data.success && data.data) {
      if (backupManager) {
        scores.value = backupManager.getCombinedLeaderboard(data.data);
      } else {
        scores.value = data.data;
      }
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error('Error loading leaderboard:', error);
    if (backupManager) {
      scores.value = backupManager.getBackupScores();
    } else {
      scores.value = [];
    }
  } finally {
    loading.value = false;
  }
}

function refresh() {
  loadLeaderboard();
}

onMounted(() => {
  loadLeaderboard();
});
</script>

<style scoped>
@import '/src/commons/buttons.css';

.leaderboard-page { padding: 1rem; }

#leaderboard-area {
  background: #1a1a2e;
  padding: 20px;
  border-radius: 10px;
  min-width: 300px;
  border: 2px solid #0f3460;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

#leaderboard-area h2 {
  margin: 0 0 15px 0;
  color: #e94560;
  text-align: center;
  font-size: 24px;
}

#leaderboard-list {
  list-style: none;
  padding: 0;
  margin: 0 0 15px 0;
  min-width: 320px;

  @media screen and (min-width: 768px) {
    min-width: 490px;  
  }
}

#leaderboard-list li {
  display: flex;
  justify-content: space-between;
  padding: 12px;
  margin: 5px 0;
  background: #16213e;
  border-radius: 5px;
  transition: background 0.3s;
}

#leaderboard-list li:hover { background: #0f3460; }

.leaderboard-rank {
  font-weight: bold;
  color: #e94560;
  margin-right: 10px;
  min-width: 30px;
}

.leaderboard-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.leaderboard-score {
  font-weight: bold;
  color: #4ecca3;
  margin-left: 10px;
}

/* Responsive adjustments
   Mirror responsive behavior from global stylesheet where needed */
@media (max-width: 768px) {
  #leaderboard-area {
    width: 100%;
    max-width: 400px;
    min-width: auto;
    padding: 15px;
  }
}

.leaderboard-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 10px;
}

/* Skeleton loader styles */
.skeleton-container { padding: 0 0 1px; } 
.skeleton-list { list-style: none; padding: 0; margin: 0; min-width: 320px; }

@media screen and (min-width: 768px) {
  .skeleton-list { min-width: 490px; }
}

.skeleton-item, #leaderboard-list li {
  display: grid;
  grid-template-columns: 38px 1fr 80px;
  align-items: center;
  gap: 12px;
  height: 48px;
  padding: 0 12px;
  margin: 6px 0;
  background: #16213e;
  border-radius: 5px;
}

.skeleton-line { display: inline-block; height: 14px; width: 100%; background: linear-gradient(90deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02)); border-radius: 4px; animation: skeleton-pulse 1.2s ease-in-out infinite; }
.skeleton-rank { width: 28px; justify-self: start; }
.skeleton-name { width: 100%; margin: 0; }
.skeleton-score { width: 80px; justify-self: end; }

@keyframes skeleton-pulse { 0% { opacity: 0.6 } 50% { opacity: 0.3 } 100% { opacity: 0.6 } }

/* Button base styles are in public/css/buttons.css */

</style>
