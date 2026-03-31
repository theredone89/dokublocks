<template>
  <div :id="id" class="modal hidden" role="dialog" :aria-label="ariaLabel">
    <div class="modal-content">
      <slot />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  id: { type: String, default: '' },
  ariaLabel: { type: String, default: 'Modal' }
});
</script>

<style scoped>
/* Modal core */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  display: none;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal:not(.hidden) {
  display: flex;
}

/* Modal content */
.modal-content {
  background: #1a1a2e;
  padding: 40px;
  border-radius: 10px;
  text-align: center;
  color: #fff;
  max-width: 400px;
  width: 90%;
  border: 3px solid #e94560;
  box-shadow: 0 10px 40px rgba(233, 69, 96, 0.5);
}

.modal-content h2 {
  font-size: 36px;
  color: #e94560;
  margin-bottom: 20px;
}

:deep(.dialog-content) {
  max-width: 400px;
}

:deep(.dialog-content p) {
  margin: 0 0 20px 0;
  font-size: 1.1em;
  line-height: 1.5;
  color: #fff;
}

:deep(.final-score) {
  font-size: 24px;
  color: #4ecca3;
  margin: 20px 0;
  font-weight: bold;
}

:deep(.final-score span) {
  font-size: 48px;
  display: block;
  margin-top: 10px;
}

:deep(.high-score-text) {
  font-size: 16px;
  color: #888;
  margin-bottom: 20px;
}

:deep(.username-input) {
  margin: 30px 0;
}

:deep(.username-input label) {
  display: block;
  margin-bottom: 10px;
  color: #888;
  font-size: 14px;
}

:deep(.username-input input) {
  width: 100%;
  padding: 12px;
  font-size: 16px;
  border: 2px solid #0f3460;
  border-radius: 5px;
  background: #16213e;
  color: #fff;
  text-align: center;
}

:deep(.username-input input:focus) {
  outline: none;
  border-color: #e94560;
}

:deep(.modal-buttons) {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 20px;
  flex-wrap: wrap;
}

:deep(.modal-buttons .game-button) {
  flex: 1;
  min-width: 120px;
}

:deep(.modal-buttons .game-button.secondary) {
  background: #53354a;
}

:deep(.modal-buttons .game-button.secondary:hover) {
  background: #6b4559;
}

/* Buttons used inside modals */
/* Base button styles moved to public/css/buttons.css; modal keeps layout-related rules above */
</style>


