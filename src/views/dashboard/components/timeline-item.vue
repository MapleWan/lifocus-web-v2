<script setup lang="ts">
import type { PropType } from 'vue'
import type { ITimeline } from '@/types/timelineTypes'
import dayjs from 'dayjs'
import { Button as TButton, Tag as TTag } from 'tdesign-vue-next'
import { updateTimelineApi } from '@/api/timeline'
import { useTdMessage } from '@/hooks/useTdMessage'
import { ETimelineStatus, ETimelineType } from '@/utils/enums/timelineEnum'

const props = defineProps({
  timeline: {
    type: Object as PropType<ITimeline>,
    required: true,
  },
  index: {
    type: [String, Number],
    required: true,
  },
})

const emits = defineEmits(['refresh'])

const tdMessage = useTdMessage()

const timelineTypeToName: Record<string, string> = {}

const timelineTypeToTheme: Record<string, 'default' | 'primary' | 'warning' | 'danger' | 'success'> = ETimelineType.reduce((acc, cur) => {
  timelineTypeToName[cur.value] = cur.label
  acc[cur.value] = cur.theme
  return acc
}, {} as Record<string, 'default' | 'primary' | 'warning' | 'danger' | 'success'>)

const timelineStatusToName: Record<string, string> = ETimelineStatus.reduce((acc, cur) => {
  acc[cur.value] = cur.label
  return acc
}, {} as Record<string, string>)
const timelineStatusToTheme: Record<string, 'default' | 'primary' | 'warning' | 'danger' | 'success'> = {
  PROGRESSING: 'primary',
  PAUSED: 'warning',
  FINISHED: 'success',
}

function handlePauseAction() {
  // 这里可以触发父组件的事件或调用API
  updateTimelineApi(props.timeline.id, { status: 'PAUSED' }).then((res) => {
    if (res.code === 200) {
      tdMessage.success('暂停任务成功')
      emits('refresh')
    }
    else {
      tdMessage.error('暂停任务失败')
      emits('refresh')
    }
  })
}

function handleResumeAction() {
  // 这里可以触发父组件的事件或调用API
  updateTimelineApi(props.timeline.id, { status: 'PROGRESSING' }).then((res) => {
    if (res.code === 200) {
      tdMessage.success('继续任务成功')
      emits('refresh')
    }
    else {
      tdMessage.error('继续任务失败')
      emits('refresh')
    }
  })
}

function handleFinishAction() {
  // 这里可以触发父组件的事件或调用API
  updateTimelineApi(props.timeline.id, { status: 'FINISHED', end_time: dayjs().format('YYYY-MM-DD HH:mm:ss') }).then((res) => {
    if (res.code === 200) {
      tdMessage.success('结束任务成功')
      emits('refresh')
    }
    else {
      tdMessage.error('结束任务失败')
      emits('refresh')
    }
  })
}
</script>

<template>
  <div
    class="timeline-card group"
    :class="[`card-${timeline.status.toLowerCase()}`, { actionable: timeline.status !== 'FINISHED' }]"
  >
    <span class="status-bar" />
    <div class="header">
      <div class="title-group">
        <div class="timeline-title">
          {{ timeline.title }}
        </div>
        <div class="timeline-tags">
          <TTag :theme="timelineTypeToTheme[timeline.type]" size="small" variant="light">
            {{ timelineTypeToName[timeline.type] }}
          </TTag>
          <TTag :theme="timelineStatusToTheme[timeline.status]" size="small" variant="light-outline">
            <span v-if="timeline.status === 'PROGRESSING'" class="live-dot" />
            {{ timelineStatusToName[timeline.status] }}
          </TTag>
        </div>
      </div>
    </div>

    <div class="timeline-content">
      {{ timeline.content }}
    </div>

    <div v-if="timeline.description" class="timeline-desc">
      <span class="desc-label">备注</span>
      {{ timeline.description }}
    </div>

    <div
      v-if="timeline.status !== 'FINISHED'"
      class="timeline-actions"
    >
      <TButton
        v-if="timeline.status === 'PAUSED'"
        class="action-btn action-btn-primary"
        theme="default"
        variant="outline"
        @click="handleResumeAction"
      >
        继续
      </TButton>

      <TButton
        v-if="timeline.status === 'PROGRESSING'"
        class="action-btn action-btn-warning"
        theme="default"
        variant="outline"
        @click="handlePauseAction"
      >
        暂停
      </TButton>

      <TButton
        v-if="timeline.status === 'PAUSED' || timeline.status === 'PROGRESSING'"
        class="action-btn action-btn-danger"
        theme="default"
        variant="outline"
        @click="handleFinishAction"
      >
        结束
      </TButton>
    </div>
  </div>
</template>

<style scoped>
.timeline-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 9px;
  padding: 12px 14px 12px 18px;
  overflow: hidden;
  border: 1px solid rgba(80, 54, 109, 0.09);
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 4px 14px rgba(45, 25, 76, 0.04);
  transition: border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease;
}

.status-bar {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 4px;
  background: linear-gradient(180deg, #806c97, rgba(128, 108, 151, 0.4));
}

.card-progressing .status-bar {
  background: linear-gradient(180deg, #4c9687, #437b70);
}

.card-paused .status-bar {
  background: linear-gradient(180deg, #d29a37, #b9872e);
}

.card-finished .status-bar {
  background: linear-gradient(180deg, #6fa86d, #5b8f5a);
}

.card-finished {
  background: linear-gradient(180deg, #fafbfa, #f6f8f6);
}

.card-finished .timeline-title {
  color: rgba(29, 17, 50, 0.58);
}

.card-finished .timeline-content {
  color: rgba(29, 17, 50, 0.52);
}

.timeline-card.actionable {
  cursor: pointer;
}

.timeline-card.actionable:hover {
  border-color: rgba(67, 123, 112, 0.26);
  box-shadow: 0 14px 30px rgba(45, 25, 76, 0.09);
  transform: translateY(-1px);
}

.card-progressing.actionable:hover {
  box-shadow: 0 14px 30px rgba(67, 123, 112, 0.15);
}

.card-paused.actionable:hover {
  box-shadow: 0 14px 30px rgba(185, 135, 46, 0.15);
}

.header {
  position: relative;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.title-group {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.timeline-title {
  min-width: 0;
  overflow: hidden;
  color: #1d1132;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: -0.005em;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.timeline-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.live-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  margin-right: 4px;
  border-radius: 50%;
  background: #437b70;
  box-shadow: 0 0 0 2px rgba(67, 123, 112, 0.2);
  animation: live-pulse 1.6s ease-in-out infinite;
  vertical-align: middle;
}

@keyframes live-pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.3);
    opacity: 0.65;
  }
}

.timeline-content {
  color: rgba(29, 17, 50, 0.74);
  font-size: 13.5px;
  line-height: 1.6;
  word-break: break-word;
}

.timeline-desc {
  position: relative;
  padding: 8px 10px 8px 12px;
  border-left: 2px solid rgba(80, 54, 109, 0.15);
  border-radius: 0 8px 8px 0;
  background: linear-gradient(90deg, rgba(80, 54, 109, 0.04), rgba(80, 54, 109, 0));
  color: rgba(29, 17, 50, 0.58);
  font-size: 12.5px;
  line-height: 1.55;
}

.desc-label {
  display: inline-block;
  margin-right: 6px;
  padding: 1px 6px;
  border-radius: 4px;
  background: rgba(80, 54, 109, 0.08);
  color: rgba(29, 17, 50, 0.6);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.05em;
  vertical-align: 1px;
}

.timeline-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 2px;
  padding-top: 10px;
  border-top: 1px dashed rgba(80, 54, 109, 0.1);
}

.action-btn {
  min-width: 64px;
  height: 30px;
  padding: 0 14px !important;
  border-radius: 8px !important;
  border-width: 1px !important;
  font-size: 12.5px !important;
  font-weight: 700 !important;
  letter-spacing: 0.02em;
  transition: all 0.2s ease;
}

.action-btn.action-btn-primary {
  border-color: rgba(67, 123, 112, 0.28) !important;
  background: rgba(67, 123, 112, 0.05) !important;
  color: #437b70 !important;
}
.action-btn.action-btn-primary:hover {
  border-color: rgba(67, 123, 112, 0.5) !important;
  background: rgba(67, 123, 112, 0.1) !important;
}

.action-btn.action-btn-warning {
  border-color: rgba(185, 135, 46, 0.28) !important;
  background: rgba(185, 135, 46, 0.05) !important;
  color: #a07327 !important;
}
.action-btn.action-btn-warning:hover {
  border-color: rgba(185, 135, 46, 0.5) !important;
  background: rgba(185, 135, 46, 0.1) !important;
}

.action-btn.action-btn-danger {
  border-color: rgba(168, 89, 90, 0.28) !important;
  background: rgba(168, 89, 90, 0.04) !important;
  color: #a8595a !important;
}
.action-btn.action-btn-danger:hover {
  border-color: rgba(168, 89, 90, 0.5) !important;
  background: rgba(168, 89, 90, 0.09) !important;
  color: #8b3a3a !important;
}
</style>
