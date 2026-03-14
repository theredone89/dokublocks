<template>
  <header class="app-header">
    <div class="header-inner">
      <div class="header-slot">
        <slot />
      </div>
      <div class="header-actions">
        <MenuButton :to="to" :id="id" :aria-label="ariaLabel" />
      </div>
    </div>
  </header>
</template>

<script setup>
import MenuButton from '~/components/MenuButton.vue';
import { onMounted } from 'vue';

const props = defineProps({
  to: { type: [String, Object], default: '/menu' },
  id: { type: String, default: 'back-btn' },
  ariaLabel: { type: String, default: 'Menu' }
});

onMounted(() => {
  try {
    if (window && window.game && typeof window.game.updateScoreDisplay === 'function') {
      // Ensure score UI shows persisted values after Vue mounts (avoid hydration overwrite)
      window.game.updateScoreDisplay();
    }
  } catch (e) {
    // ignore
  }
});
</script>

<style scoped>
.app-header { width: 100%; margin-bottom: 20px; }
.header-inner { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.header-slot { display: flex; align-items: center; gap: 12px; flex: 1; }
.header-actions { display: flex; align-items: center; }

/* Styles for slotted header content (applies to children via deep selector) */
:deep(.header-top) {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 16px;
  margin-bottom: 14px;
  margin-top: 12px;
  flex-wrap: wrap;
}

:deep(.logo) {
  max-width: 300px;
  width: calc(60% - 2px);
  margin-left: 1px;
  filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.5));
}

:deep(.theme-toggle) {
  display: flex;
  align-items: center;
  gap: 10px;
}

:deep(.theme-icon) {
  height: 24px;
  width: 24px;
  filter: brightness(0) invert(1);
}

:deep(.toggle-label) {
  font-size: 14px;
  color: var(--header-text-color, #fff);
  white-space: nowrap;
}

</style>
