<script setup lang="ts">
import type { IProjectInfo } from '@/types/projectTypes'
import dayjs from 'dayjs'
import { Tag as TTag } from 'tdesign-vue-next'
import { computed, onMounted } from 'vue'
import ProjectIcon from '@/assets/svg/project.svg'
import { EProjectStatus } from '@/utils/enums/projectEnum'

const props = defineProps<{ projectInfo: IProjectInfo }>()

// 项目状态值转文本
const projectStatusValueToText = EProjectStatus.reduce((acc, cur) => {
  acc[cur.value] = cur.label
  return acc
}, {} as Record<string, string>)

const relativeTime = computed(() => {
  const now = dayjs()
  const target = dayjs(props.projectInfo.update_time)
  const diffMin = now.diff(target, 'minute')
  if (diffMin < 1)
    return '刚刚'
  if (diffMin < 60)
    return `${diffMin} 分钟前`
  const diffHour = now.diff(target, 'hour')
  if (diffHour < 24)
    return `${diffHour} 小时前`
  const diffDay = now.diff(target, 'day')
  if (diffDay < 7)
    return `${diffDay} 天前`
  if (diffDay < 30)
    return `${Math.floor(diffDay / 7)} 周前`
  return target.format('YYYY-MM-DD')
})

onMounted(() => {
})
</script>

<template>
  <div
    class="project-card"
    :class="[`status-${projectInfo.status.toLowerCase()}`]"
  >
    <span class="card-accent" />
    <span class="card-glow" aria-hidden="true" />
    <div class="card-inner">
      <div class="header" :title="projectInfo.name">
        <span class="project-icon">
          <ProjectIcon />
        </span>
        <div class="title">
          {{ projectInfo.name }}
        </div>
        <TTag
          class="status-tag"
          variant="light"
          size="small"
          :theme="projectInfo.status === 'ACTIVE' ? 'success' : 'primary'"
        >
          <span v-if="projectInfo.status === 'ACTIVE'" class="status-dot" />
          {{ projectStatusValueToText[projectInfo.status] }}
        </TTag>
      </div>
      <div class="description" :class="{ 'is-empty': !projectInfo?.description }">
        {{ projectInfo?.description || '还没有描述' }}
      </div>

      <div class="time">
        <span class="time-label">最近更新</span>
        <span class="time-value" :title="dayjs(projectInfo.update_time).format('YYYY-MM-DD HH:mm:ss')">
          {{ relativeTime }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.project-card {
  position: relative;
  height: 100%;
  padding: 12px 12px 10px;
  overflow: hidden;
  border: 1px solid rgba(80, 54, 109, 0.1);
  border-radius: 10px;
  background: linear-gradient(180deg, #fff, #fbfbfe);
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(45, 25, 76, 0.04);
  transition:
    transform 0.25s ease,
    border-color 0.25s ease,
    box-shadow 0.25s ease;
}

/* 顶部渐变精细 accent 线 */
.card-accent {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #3d2266, #437b70 60%, #5b8f5a);
  opacity: 0.5;
  transition: opacity 0.25s ease, height 0.25s ease;
}

.project-card.status-archived .card-accent {
  background: linear-gradient(90deg, #806c97, #b9a8cc);
  opacity: 0.4;
}

/* 右上角柔和光斑，hover 时浮现 */
.card-glow {
  position: absolute;
  top: -30px;
  right: -30px;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: radial-gradient(closest-side, rgba(67, 123, 112, 0.22), transparent 70%);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.project-card:hover {
  border-color: rgba(67, 123, 112, 0.3);
  box-shadow: 0 12px 26px rgba(45, 25, 76, 0.1);
  transform: translateY(-2px);
}

.project-card:hover .card-accent {
  height: 3px;
  opacity: 1;
}

.project-card:hover .card-glow {
  opacity: 1;
}

.project-card:hover .title {
  color: #3d2266;
}

.project-card:hover .project-icon {
  background: linear-gradient(135deg, #3d2266, #437b70);
  color: #fff;
  box-shadow: 0 6px 14px rgba(61, 34, 102, 0.24);
}

.card-inner {
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow: hidden;
}

.header {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.project-icon {
  width: 30px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  border-radius: 8px;
  background: linear-gradient(135deg, #edf4f2, #f4eef8);
  color: #3d2266;
  box-shadow: inset 0 0 0 1px rgba(80, 54, 109, 0.06);
  transition: background 0.25s ease, color 0.25s ease, box-shadow 0.25s ease;
}

.project-icon svg {
  width: 16px;
  height: 16px;
}

.title {
  min-width: 0;
  flex: 1;
  overflow: hidden;
  color: #1d1132;
  font-size: 14px;
  font-weight: 800;
  line-height: 1.25;
  letter-spacing: -0.005em;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.2s ease;
}

.status-tag {
  flex: 0 0 auto;
}

.status-tag :deep(.t-tag) {
  height: 20px;
  padding: 0 6px;
  font-size: 11px;
}

.status-dot {
  display: inline-block;
  width: 5px;
  height: 5px;
  margin-right: 4px;
  border-radius: 50%;
  background: #5b8f5a;
  box-shadow: 0 0 0 2px rgba(91, 143, 90, 0.2);
  animation: card-pulse 2s ease-in-out infinite;
  vertical-align: middle;
}

@keyframes card-pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.25);
    opacity: 0.65;
  }
}

.description {
  min-height: 0;
  flex: 1;
  overflow: hidden;
  color: rgba(29, 17, 50, 0.62);
  font-size: 12.5px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  word-break: break-word;
}

.description.is-empty {
  color: rgba(29, 17, 50, 0.34);
  font-style: italic;
}

.time {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-top: 6px;
  border-top: 1px dashed rgba(80, 54, 109, 0.12);
  color: rgba(29, 17, 50, 0.52);
  font-size: 11px;
}

.time-label {
  color: rgba(29, 17, 50, 0.4);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.time-value {
  min-width: 0;
  overflow: hidden;
  color: #437b70;
  font-size: 11.5px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  text-align: right;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 已归档状态 */
.project-card.status-archived {
  background: linear-gradient(180deg, #fafafc, #f5f4f8);
}

.project-card.status-archived .title {
  color: rgba(29, 17, 50, 0.68);
}

.project-card.status-archived .project-icon {
  background: rgba(128, 108, 151, 0.12);
  color: #685182;
}

.project-card.status-archived .time-value {
  color: #685182;
}

:deep(.simplebar-content-wrapper) {
  height: 100%;
}
</style>
