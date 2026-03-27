<template>
  <!-- This page is only for handling redirects, no UI needed -->
</template>

<script setup>
import { onMounted } from 'vue';

onMounted(() => {
  console.log('[Game Mode] Clearing saved game and redirecting to /game');
  localStorage.removeItem('blocklogic-save');
  navigateTo('/game');
});
</script>
