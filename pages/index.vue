<template>
  <div class="loader-page">
    <div class="card">
      <img v-if="logo" :src="logo" alt="Game logo" class="logo" />

      <div class="progress-wrap" role="progressbar" :aria-valuenow="progress" aria-valuemin="0" aria-valuemax="100">
        <div class="progress-bar" :style="`width: ${progress}%`"></div>
      </div>
      <div class="progress-meta">{{ progress }}%</div>

      <!-- button removed: automatic redirect to /menu after load -->
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const progress = ref(0)
const finished = ref(false)

// Chosen logo from public/img directory
const logo = '/img/vectorink-vectorizer-result.svg'

// Assets to preload (coarse per-file progress)
const assets = [
  logo,
  '/js/Game.js',
  '/js/Grid.js',
  '/js/Pieces.js',
  '/js/Renderer.js',
  '/js/ScoreManager.js',
  '/js/ScoreBackupManager.js',
  '/js/InputHandler.js',
  '/js/main.js'
]

function preloadAsset(url) {
  return fetch(url, { cache: 'reload' })
    .then((res) => {
      if (!res.ok) throw new Error(`Failed to load ${url}`)
      return res.blob()
    })
}

onMounted(async () => {
  let loaded = 0
  for (const a of assets) {
    try {
      // sequential fetch keeps UI progress predictable on slow networks
      // each asset counts equally toward progress
      // small artificial delay to make UX smoother on too-fast loads
      await preloadAsset(a)
      loaded += 1
      progress.value = Math.round((loaded / assets.length) * 100)
    } catch (e) {
      // still advance progress on error, but log
      console.warn(e)
      loaded += 1
      progress.value = Math.round((loaded / assets.length) * 100)
    }
    // gentle pacing for nicer reveal
    await new Promise((r) => setTimeout(r, 120))
  }

  finished.value = true
  // small delay then go to menu automatically
  setTimeout(() => router.push('/menu'), 700)
})


</script>

<style scoped>
.loader-page{
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  display:flex;
  align-items:center;
  justify-content:center;
  background: linear-gradient(180deg, #0f1724 0%, #071024 60%);
  color: #e6eef8;
}
.card{
  width:420px;
  max-width:90%;
  text-align:center;
  padding:28px 28px 32px;
  border-radius:12px;
  backdrop-filter: blur(6px) saturate(120%);
  box-shadow: 0 10px 30px rgba(2,6,23,0.6), inset 0 1px 0 rgba(255,255,255,0.02);
  background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.02));
}
.logo{
  width:240px;
  height:auto;
  display:block;
  margin:6px auto 12px;
  filter: drop-shadow(0 6px 18px rgba(2,6,23,0.6));
}
.title{
  margin:0 0 18px;
  font-size:22px;
  letter-spacing:1px;
  color:#f7fbff;
}
.progress-wrap{
  height:14px;
  background: rgba(255,255,255,0.06);
  border-radius:10px;
  overflow:hidden;
  margin:6px 0 8px;
}
.progress-bar{
  height:100%;
  background: linear-gradient(90deg,#6ee7b7,#60a5fa);
  transition: width 260ms cubic-bezier(.2,.9,.1,1);
}
.progress-meta{
  font-size:12px;
  opacity:0.9;
  margin-bottom:12px;
}
</style>
