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
  <div class="relative flex flex-col gap-2 group p-2" :class="timeline.status !== 'FINISHED' ? 'hover:opacity-75 cursor-pointer' : ''">
    <div
      class="header flex items-center gap-2 relative"
      :class="Number(index) % 2 === 0 ? 'justify-start' : 'flex-row-reverse'"
    >
      <TTag :theme="timelineTypeToTheme[timeline.type]">
        {{ timelineTypeToName[timeline.type] }}
      </TTag>
      <TTag :theme="timelineStatusToTheme[timeline.status]" variant="outline">
        {{ timelineStatusToName[timeline.status] }}
      </TTag>
      <div class="font-bold">
        {{ timeline.title }}
      </div>
    </div>
    <div>{{ timeline.content }}</div>
    <div class="text-sm text-primary-50">
      {{ timeline.description }}
    </div>

    <!-- 悬停蒙版和操作按钮 -->
    <div
      v-if="timeline.status !== 'FINISHED'"
      class="absolute inset-0 bg-black bg-opacity-60 rounded-lg flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      :class="{
        'justify-start pl-4': Number(index) % 2 === 0,
        'justify-end pr-4': Number(index) % 2 !== 0,
      }"
    >
      <!-- 状态为暂停时：显示继续和结束按钮 -->
      <TButton
        v-if="timeline.status === 'PAUSED'"
        size="small"
        variant="outline"
        @click="handleResumeAction"
      >
        继续
      </TButton>

      <!-- 状态为进行中时：显示暂停和结束按钮 -->
      <TButton
        v-if="timeline.status === 'PROGRESSING'"
        size="small"
        variant="outline"
        @click="handlePauseAction"
      >
        暂停
      </TButton>

      <!-- 状态为暂停或进行中时：显示结束按钮 -->
      <TButton
        v-if="timeline.status === 'PAUSED' || timeline.status === 'PROGRESSING'"
        size="small"
        theme="danger"
        variant="outline"
        @click="handleFinishAction"
      >
        结束
      </TButton>
    </div>
  </div>
</template>

<style scoped></style>
