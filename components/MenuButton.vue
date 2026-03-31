<template>
  <NuxtLink :to="to" class="menu-button" :id="id" :aria-label="ariaLabel">
    <svg viewBox="0 0 24 24" width="24" height="24" fill="#fff" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M3 6h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      <path d="M3 12h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      <path d="M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    </svg>
  </NuxtLink>
</template>

<script setup>
const props = defineProps({
  to: { type: [String, Object], default: '/menu' },
  id: { type: String, default: undefined },
  ariaLabel: { type: String, default: 'Menu' }
});
</script>

<style scoped>
/* Keep appearance consistent with existing .menu-button rules in global CSS */
</style>

<style>
.menu-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: rgba(15, 52, 96, 0.9);
  color: #fff;
  text-decoration: none;
  box-shadow: 0 6px 18px rgba(0,0,0,0.35);
}

.menu-button svg { width: 20px; height: 14px; }

.menu-button:hover { background: #e94560; color: #fff; }

body.light-theme .menu-button { background: #fff; color: #333; }
</style>
