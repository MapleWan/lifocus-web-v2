<script setup lang="ts">
import leftBar from './components/left-bar.vue'
import rightList from './components/right-list.vue'
</script>

<template>
  <div class="dashboard-container">
    <div class="left dashboard-panel dashboard-sidebar">
      <left-bar />
    </div>
    <div class="right dashboard-panel dashboard-main">
      <right-list />
    </div>
  </div>
</template>

<style scoped>
.dashboard-container {
  position: relative;
  height: 100%;
  display: grid;
  grid-template-columns: minmax(260px, 300px) minmax(0, 1fr);
  gap: 18px;
  padding: 20px;
  overflow: hidden;
  background:
    radial-gradient(1000px 420px at -5% -10%, rgba(61, 34, 102, 0.14), transparent 60%),
    radial-gradient(900px 380px at 110% 110%, rgba(67, 123, 112, 0.14), transparent 60%),
    radial-gradient(600px 280px at 50% 120%, rgba(128, 108, 151, 0.08), transparent 70%),
    linear-gradient(135deg, #f7f8fb, #edf4f2);
}

.dashboard-container::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(rgba(80, 54, 109, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(80, 54, 109, 0.04) 1px, transparent 1px);
  background-size: 36px 36px;
  mask-image: radial-gradient(1200px 600px at 50% 0%, #000, transparent 70%);
  -webkit-mask-image: radial-gradient(1200px 600px at 50% 0%, #000, transparent 70%);
  opacity: 0.6;
}

.dashboard-panel {
  position: relative;
  min-height: 0;
  overflow: hidden;
  border: 1px solid rgba(80, 54, 109, 0.08);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.86);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.6) inset,
    0 12px 36px rgba(45, 25, 76, 0.07);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.dashboard-sidebar {
  padding: 18px;
}

.dashboard-main {
  padding: 18px;
}

@media (max-width: 900px) {
  .dashboard-container {
    grid-template-columns: 1fr;
    grid-template-rows: auto minmax(0, 1fr);
    overflow: auto;
  }

  .dashboard-sidebar {
    min-height: 280px;
  }

  .dashboard-main {
    min-height: 720px;
  }
}

@media (max-width: 560px) {
  .dashboard-container {
    gap: 12px;
    padding: 12px;
  }

  .dashboard-sidebar,
  .dashboard-main {
    padding: 14px;
  }
}
</style>
