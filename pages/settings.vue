<template>
  <div class="container settings-page">
    <Header>
      <h1>Settings</h1>
    </Header>

    <main>
      <div class="settings-panel">
        <h2>Appearance</h2>
        <div class="setting-row">
          <label class="toggle-label">Light Theme</label>
          <label class="toggle-switch">
            <input id="theme-toggle" type="checkbox" />
            <span class="toggle-slider"></span>
          </label>
        </div>
        <p class="note">Toggle light/dark theme for the app. This setting is persisted.</p>
      </div>
    </main>
  </div>
</template>

<script setup>
import Header from '~/components/Header.vue';
import { onMounted, onBeforeUnmount } from 'vue';

function updateMeta(isLight) {
  const themeColorMeta = document.getElementById('theme-color-meta');
  const appleStatusBar = document.getElementById('apple-status-bar');
  if (themeColorMeta) themeColorMeta.setAttribute('content', isLight ? '#e3f2fd' : '#1a1a2e');
  if (appleStatusBar) appleStatusBar.setAttribute('content', isLight ? 'default' : 'black-translucent');
}

let inputEl = null;

function handleChange(e) {
  const isLight = !!e.target.checked;
  localStorage.setItem('blocklogic-theme', isLight ? 'light' : 'dark');
  document.body.classList.toggle('light-theme', isLight);
  updateMeta(isLight);
  // Broadcast to other parts of the app (Game instance listens for this)
  window.dispatchEvent(new CustomEvent('blocklogic-theme-change', { detail: { isLight } }));
}

onMounted(() => {
  inputEl = document.getElementById('theme-toggle');
  if (!inputEl) return;
  const saved = localStorage.getItem('blocklogic-theme');
  const isLight = saved === 'light';
  inputEl.checked = isLight;
  document.body.classList.toggle('light-theme', isLight);
  updateMeta(isLight);
  inputEl.addEventListener('change', handleChange);
});

onBeforeUnmount(() => {
  if (inputEl) inputEl.removeEventListener('change', handleChange);
});
</script>

<style scoped>
@import '/src/commons/buttons.css';

.settings-panel { background: #11121a; padding: 20px; border-radius: 10px; border: 2px solid #0f3460; }
.setting-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.toggle-label { color: #e0e6f1; margin-right: 12px; }
.toggle-switch { position: relative; display: inline-block; width: 48px; height: 28px; }
.toggle-switch input { opacity: 0; width: 0; height: 0; }
.toggle-slider { position: absolute; cursor: pointer; top: 4px; left: 4px; right: 4px; bottom: 4px; background-color: #ccc; transition: .2s; border-radius: 14px; }
.toggle-slider:before { content: ""; position: absolute; height: 18px; width: 18px; left: 5px; bottom: 3px; background-color: white; transition: .2s; border-radius: 50%; }
.toggle-switch input:checked + .toggle-slider { background-color: #4ecca3; }
.toggle-switch input:checked + .toggle-slider:before { transform: translateX(18px); }
.note { color: #9aa3c7; font-size: 0.9rem; margin-top: 10px; }
</style>
