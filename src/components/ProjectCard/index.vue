<script setup lang="ts">
import type { IProjectInfo } from '@/types/projectTypes'
import dayjs from 'dayjs'
import { onMounted } from 'vue'
import ProjectIcon from '@/assets/svg/project.svg'

// defineProps<{ projectInfo: IProjectInfo }>({
//   projectInfo: {
//     type: Object,
//     required: true,
//   },
// })

defineProps<{ projectInfo: IProjectInfo }>()

onMounted(() => {
})
</script>

<template>
  <div
    class="project-card p-4 rounded-3xl hover:shadow-none bg-background-primary cursor-pointer"
    style="border: 1px solid rgba(2, 4, 26, 0.16);"
  >
    <div class="overflow-hidden flex flex-col h-full">
      <div
        class="header flex items-center justify-between cursor-pointer" :title="projectInfo.name"
      >
        <ProjectIcon class="w-7 h-7 flex-shrink-0" />
        <div class="title line-clamp-1 font-bold text-xl">
          {{ projectInfo.name }}
        </div>
      </div>
      <div class="flex-1 overflow-hidden text-primary-40">
        <ScrollBar class="h-full overflow-x-hidden">
          <div class="w-full h-full">
            {{ projectInfo?.description || '暂无描述' }}
          </div>
        </ScrollBar>
      </div>

      <div class="time text-sm text-primary-40 text-right m-t-2">
        {{ dayjs(projectInfo.update_time).format('YYYY-MM-DD HH:mm:ss') }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.project-card {
  will-change: transform, box-shadow;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.project-card:hover {
  transform: translateY(-8px);
}

:deep(.simplebar-content-wrapper) {
  display: flex !important;
  justify-content: center;
  align-items: center;
}
</style>
