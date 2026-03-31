<template>
  <div class="menu-page">
    <div class="menu-container">
      <img src="/img/vectorink-vectorizer-result.svg" alt="BlockLogic" class="menu-logo">

      <nav class="menu-list">
        <NuxtLink id="continue-btn" to="/game" class="menu-item">Continue</NuxtLink>
        <NuxtLink id="new-game-btn" to="/new" class="menu-item">New Game</NuxtLink>
        <NuxtLink to="/daily" class="menu-item">Daily Challenge</NuxtLink>
        <NuxtLink to="/leaderboard" class="menu-item">Leaderboard</NuxtLink>
        <NuxtLink to="/settings" class="menu-item">Settings</NuxtLink>
      </nav>
    </div>
  </div>
</template>

<script setup>
// No functionality yet — static menu shown at load
</script>

<style scoped>
.menu-page {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  /* Use the game's base color and a lighter variation for a softer gradient */
  background: linear-gradient(50deg, #1a1a2e 0%, #172949 100%);
  color: var(--text-color, #fff);
  z-index: 1000;
}
.menu-container {
  text-align: center;
  padding: 2rem;
  width: 360px;
  border-radius: 12px;
  background: radial-gradient(circle at 0% 0%, rgb(104 163 255 / 15%) 0%, rgb(104 163 255 / 1%) 100%);
  box-shadow: 0 8px 24px rgba(2,6,23,0.6);
}
.menu-logo { width: 240px; height: auto; margin: 0 0 1rem 0; }
.menu-list { display: flex; flex-direction: column; gap: 0.75rem; }
.menu-item {
  padding: 0.75rem 1rem;
  background: linear-gradient(180deg,#111827,#0b1220);
  color: inherit;
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  text-decoration: none;
}
.menu-item:hover { background: linear-gradient(179deg, #1c2c4b, #0c1424); cursor: pointer;    box-shadow: inset 0px 2px 2px #5f7aa945;}
</style>
