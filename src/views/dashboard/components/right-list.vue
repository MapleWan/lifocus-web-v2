<script setup lang="ts">
import { Divider } from 'tdesign-vue-next'
import ProjectList from './project-list.vue'
import TimeLine from './time-line.vue'
</script>

<template>
  <div class="right-list h-full overflow-hidden flex flex-col gap-2">
    <div class="top-project-list h-50% overflow-hidden">
      <ProjectList />
    </div>

    <Divider dashed style="margin: 2px 0" />
    <div class="bottom-time-line h-50% overflow-hidden">
      <TimeLine />
    </div>
  </div>
</template>

<style scoped></style>
