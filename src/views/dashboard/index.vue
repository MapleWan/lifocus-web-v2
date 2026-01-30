<script setup lang="ts">
import leftBar from './components/left-bar.vue'
import rightList from './components/right-list.vue'
</script>

<template>
  <div class="dashboard-container bg-background-primary">
    <div class="left w-full h-full overflow-hidden rounded-lg p-4">
      <left-bar />
    </div>
    <div class="right h-full overflow-hidden rounded-lg bg-background-white p-4">
      <right-list />
    </div>
  </div>
</template>

<style scoped>
  .dashboard-container {
    padding: 16px;
    height: 100%;
    gap: 8px;
    display: grid;
    grid-template-columns: minmax(200px, 1fr) 4fr;
  }
</style>
