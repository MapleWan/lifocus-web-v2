<script setup lang="ts">
import type { FormProps } from 'tdesign-vue-next'
import type { IAddTimelineParams, TTimelineList } from '@/types/timelineTypes'
import dayjs from 'dayjs'
import { Button as TButton, DatePicker as TDatePicker, Dialog as TDialog, Form as TForm, FormItem as TFormItem, Input as TInput, Option as TOption, Select as TSelect, Textarea as TTextarea } from 'tdesign-vue-next'

import { computed, onMounted, ref, watch } from 'vue'
import { addTimelineApi, getTodayTimelineApi } from '@/api/timeline'
import AddIcon from '@/assets/svg/add.svg'
import NoDataIcon from '@/assets/svg/noData.svg'
import { useTdMessage } from '@/hooks/useTdMessage'
import { ETimelineStatus, ETimelineType } from '@/utils/enums/timelineEnum'
import TimelineItem from './timeline-item.vue'

const useMessage = useTdMessage()
type TimelineViewItem = {
  endLabel: string
  item: TTimelineList[number]
  statusColor: string
  timeLabel: string
}

const options = ref<TimelineViewItem[]>([])
// {
//   label: '2022-01-01',
//   content: '已完成的时间',
//   dotColor: '#fff',
// },

const timeLineList = ref<TTimelineList>()
const currentDate = ref(dayjs().format('YYYY-MM-DD'))
const statusToColor = ETimelineStatus.reduce((acc, cur) => {
  acc[cur.value] = cur.dotColor
  return acc
}, {} as Record<string, string>)

const timelineFormDialogVisible = ref(false)
const timelineFormData = ref<IAddTimelineParams>({
  title: '',
  type: 'LIFE',
  content: '',
  description: '',
})

const timelineFormRules: FormProps['rules'] = {
  title: [
    { required: true, message: '请输入标题', type: 'error', trigger: 'blur' },
  ],
  type: [
    { required: true, message: '请选择类型', type: 'error' },
  ],
  content: [
    { required: true, message: '请输入内容', type: 'error', trigger: 'blur' },
  ],
}

const timelineStats = computed(() => {
  const list = timeLineList.value || []
  return {
    finished: list.filter(item => item.status === 'FINISHED').length,
    progressing: list.filter(item => item.status === 'PROGRESSING').length,
    paused: list.filter(item => item.status === 'PAUSED').length,
    total: list.length,
  }
})

const weekdayLabel = computed(() => {
  const map = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return map[dayjs(currentDate.value).day()]
})

const isToday = computed(() => dayjs(currentDate.value).isSame(dayjs(), 'day'))

function handleTimelineSubmit() {
  addTimelineApi(timelineFormData.value).then((res) => {
    if (res.code === 200) {
      useMessage.success('添加成功')
      timelineFormDialogVisible.value = false
      timelineFormData.value = {
        title: '',
        type: 'LIFE',
        content: '',
        description: '',
      }
      getTodayTimeline()
    }
    else {
      useMessage.error(res.message)
    }
  })
}

watch(currentDate, () => {
  getTodayTimeline()
})
function getTodayTimeline() {
  getTodayTimelineApi(
    {
      create_start_time: `${dayjs(currentDate.value).format('YYYY-MM-DD')} 00:00:00`,
      create_end_time: `${dayjs(currentDate.value).format('YYYY-MM-DD')} 23:59:59`,
    },
  ).then((res) => {
    timeLineList.value = res.data
    options.value = res.data.map(item => ({
      endLabel: item?.end_time ? dayjs(item.end_time).format('HH:mm') : '',
      item,
      statusColor: statusToColor[item.status] || 'primary',
      timeLabel: dayjs(item.create_time).format('HH:mm'),
    }))
  })
}
onMounted(() => {
  getTodayTimeline()
})
</script>

<template>
  <div class="timeline-shell">
    <div class="timeline-head">
      <div class="timeline-title-block">
        <div class="timeline-eyebrow">
          <span class="eyebrow-dot" />
          <span>Timeline</span>
          <span v-if="isToday" class="eyebrow-today">Today</span>
        </div>
        <div class="timeline-title-row">
          <h2>时间线</h2>
          <span class="timeline-date">{{ currentDate }} · {{ weekdayLabel }}</span>
        </div>
        <div class="timeline-stats">
          <span class="stat stat-total">
            <i />{{ timelineStats.total }} 条记录
          </span>
          <span class="stat stat-progress">
            <i />{{ timelineStats.progressing }} 进行中
          </span>
          <span v-if="timelineStats.paused > 0" class="stat stat-paused">
            <i />{{ timelineStats.paused }} 已暂停
          </span>
          <span class="stat stat-finished">
            <i />{{ timelineStats.finished }} 已完成
          </span>
        </div>
      </div>
      <div class="timeline-actions">
        <TDatePicker v-model="currentDate" class="date-picker" />
        <TButton theme="primary" class="add-timeline-button" @click="timelineFormDialogVisible = true">
          <template #icon>
            <AddIcon class="add-icon" />
          </template>
          添加
        </TButton>
      </div>
    </div>

    <div class="timeline-body">
      <ScrollBar class="h-full">
        <div v-if="options.length > 0" class="timeline-feed">
          <div
            v-for="(item, index) in options"
            :key="item.item.id"
            class="timeline-row"
            :class="[`row-${item.statusColor}`, { 'row-last': index === options.length - 1 }]"
          >
            <div class="timeline-rail">
              <span class="timeline-time">{{ item.timeLabel }}</span>
              <span v-if="item.endLabel" class="timeline-end">→ {{ item.endLabel }}</span>
            </div>
            <div class="timeline-track">
              <span class="timeline-dot" :class="`dot-${item.statusColor}`">
                <i />
              </span>
              <span v-if="index !== options.length - 1" class="timeline-line" />
            </div>
            <TimelineItem :timeline="item.item" :index="index" @refresh="getTodayTimeline" />
          </div>
        </div>
        <div v-else class="timeline-empty">
          <div class="empty-illustration">
            <NoDataIcon />
          </div>
          <h3>今天还没有动静</h3>
          <p>记录一件正在推进的小事，节奏就从这里开始。</p>
          <TButton theme="primary" variant="outline" class="empty-action" @click="timelineFormDialogVisible = true">
            添加第一条
          </TButton>
        </div>
      </ScrollBar>
    </div>

    <TDialog
      v-model:visible="timelineFormDialogVisible"
      :footer="false"
      dialog-class-name="timeline-editor-dialog"
      placement="center"
      width="560px"
    >
      <template #header>
        <div class="form-dialog-title">
          <span>New Timeline</span>
          <h3>添加时间线</h3>
          <p>记录正在发生的事，稍后就能回看你的节奏。</p>
        </div>
      </template>

      <TForm
        class="form-dialog-form"
        :data="timelineFormData"
        :rules="timelineFormRules"
        label-align="top"
        :required-mark="false"
        @submit="handleTimelineSubmit"
      >
        <TFormItem label="标题" name="title">
          <TInput v-model="timelineFormData.title" size="large" placeholder="例如：完成主页 UI 优化" />
        </TFormItem>

        <TFormItem label="类型" name="type">
          <TSelect v-model="timelineFormData.type" size="large">
            <template v-for="value in ETimelineType" :key="value.value">
              <TOption :label="value.label" :value="value.value" />
            </template>
          </TSelect>
        </TFormItem>

        <TFormItem label="内容" name="content">
          <TTextarea v-model="timelineFormData.content" class="dialog-textarea" placeholder="记录具体动作、过程或当前进展。" />
        </TFormItem>
        <TFormItem label="描述" name="description">
          <TTextarea v-model="timelineFormData.description" class="dialog-textarea dialog-textarea--small" placeholder="补充背景、阻塞点或后续提醒。" />
        </TFormItem>
        <TFormItem>
          <div class="form-dialog-actions">
            <TButton theme="default" variant="outline" class="dialog-cancel" @click="timelineFormDialogVisible = false">
              取消
            </TButton>
            <TButton theme="primary" type="submit" class="dialog-submit">
              添加记录
            </TButton>
          </div>
        </TFormItem>
      </TForm>
    </TDialog>
  </div>
</template>

<style scoped>
.timeline-shell {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 14px;
  overflow: hidden;
}

/* ============ Head ============ */
.timeline-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px;
  border: 1px solid rgba(80, 54, 109, 0.08);
  border-radius: 12px;
  background:
    linear-gradient(135deg, rgba(61, 34, 102, 0.04), rgba(67, 123, 112, 0.05)),
    #fff;
  box-shadow: 0 4px 14px rgba(45, 25, 76, 0.04);
}

.timeline-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
  color: rgba(29, 17, 50, 0.52);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.eyebrow-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3d2266, #437b70);
}

.eyebrow-today {
  margin-left: 2px;
  padding: 2px 6px;
  border-radius: 999px;
  background: linear-gradient(135deg, #3d2266, #437b70);
  color: #fff;
  font-size: 10px;
  letter-spacing: 0.06em;
}

.timeline-title-row {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.timeline-title-block h2 {
  margin: 0;
  color: #1d1132;
  font-size: 20px;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.01em;
}

.timeline-date {
  color: #437b70;
  font-size: 12px;
  font-weight: 700;
}

.timeline-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}

.stat {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 9px;
  border: 1px solid transparent;
  border-radius: 999px;
  background: rgba(29, 17, 50, 0.04);
  color: rgba(29, 17, 50, 0.62);
  font-size: 11px;
  font-weight: 700;
}

.stat i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.55;
}

.stat-total {
  background: rgba(61, 34, 102, 0.07);
  color: #3d2266;
}

.stat-progress {
  background: rgba(67, 123, 112, 0.1);
  color: #437b70;
}

.stat-paused {
  background: rgba(185, 135, 46, 0.12);
  color: #9a6d1d;
}

.stat-finished {
  background: rgba(91, 143, 90, 0.12);
  color: #446f43;
}

.timeline-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-top: 2px;
}

.date-picker {
  width: 150px;
}

.date-picker :deep(.t-input) {
  border-color: rgba(80, 54, 109, 0.14);
  border-radius: 8px;
  background: #fff;
}

.add-timeline-button {
  height: 36px;
  padding: 0 16px;
  border: 0;
  border-radius: 8px;
  background: linear-gradient(135deg, #3d2266, #437b70);
  font-weight: 800;
  box-shadow: 0 8px 18px rgba(61, 34, 102, 0.22);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.add-timeline-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 22px rgba(61, 34, 102, 0.28);
}

.add-icon {
  width: 14px;
  height: 14px;
}

/* ============ Body ============ */
.timeline-body {
  min-height: 0;
  flex: 1;
  overflow: hidden;
  padding: 12px 12px 12px 6px;
  border: 1px solid rgba(80, 54, 109, 0.08);
  border-radius: 12px;
  background:
    radial-gradient(1200px 320px at -10% -10%, rgba(61, 34, 102, 0.05), transparent 50%),
    radial-gradient(800px 260px at 110% 110%, rgba(67, 123, 112, 0.06), transparent 50%),
    #fbfbfe;
}

.timeline-feed {
  display: flex;
  flex-direction: column;
  padding: 4px 4px 12px;
}

.timeline-row {
  display: grid;
  grid-template-columns: 56px 22px minmax(0, 1fr);
  gap: 10px;
  padding-bottom: 14px;
}

.timeline-row.row-last {
  padding-bottom: 4px;
}

.timeline-rail {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding-top: 14px;
  color: rgba(29, 17, 50, 0.58);
  text-align: right;
  line-height: 1;
}

.timeline-time {
  font-size: 13px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  color: #1d1132;
}

.timeline-end {
  margin-top: 6px;
  color: rgba(29, 17, 50, 0.42);
  font-size: 11px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.timeline-track {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.timeline-dot {
  position: relative;
  z-index: 1;
  width: 14px;
  height: 14px;
  margin-top: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #fff;
  box-shadow:
    0 0 0 2px #fbfbfe,
    0 0 0 4px rgba(128, 108, 151, 0.22),
    0 4px 10px rgba(45, 25, 76, 0.12);
}

.timeline-dot i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #806c97;
}

.timeline-dot.dot-primary {
  box-shadow:
    0 0 0 2px #fbfbfe,
    0 0 0 4px rgba(67, 123, 112, 0.25),
    0 4px 10px rgba(67, 123, 112, 0.2);
}

.timeline-dot.dot-primary i {
  background: linear-gradient(135deg, #4c9687, #437b70);
  animation: dot-pulse 1.8s ease-in-out infinite;
}

.timeline-dot.dot-warning {
  box-shadow:
    0 0 0 2px #fbfbfe,
    0 0 0 4px rgba(185, 135, 46, 0.28),
    0 4px 10px rgba(185, 135, 46, 0.2);
}

.timeline-dot.dot-warning i {
  background: linear-gradient(135deg, #d29a37, #b9872e);
}

.timeline-dot.dot-success {
  box-shadow:
    0 0 0 2px #fbfbfe,
    0 0 0 4px rgba(91, 143, 90, 0.25),
    0 4px 10px rgba(91, 143, 90, 0.18);
}

.timeline-dot.dot-success i {
  background: linear-gradient(135deg, #6fa86d, #5b8f5a);
}

@keyframes dot-pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.35);
    opacity: 0.7;
  }
}

.timeline-line {
  flex: 1;
  width: 2px;
  margin-top: 4px;
  margin-bottom: -10px;
  border-radius: 2px;
  background: linear-gradient(180deg, rgba(80, 54, 109, 0.2), rgba(80, 54, 109, 0.04));
}

/* ============ Empty ============ */
.timeline-empty {
  min-height: 260px;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 24px;
  color: rgba(29, 17, 50, 0.56);
  text-align: center;
}

.empty-illustration {
  position: relative;
  padding: 10px;
  border-radius: 50%;
  background: radial-gradient(closest-side, rgba(67, 123, 112, 0.08), transparent 70%);
}

.empty-illustration svg {
  width: 140px;
  max-width: 70%;
  height: auto;
  filter: drop-shadow(0 6px 14px rgba(45, 25, 76, 0.08));
}

.timeline-empty h3 {
  margin: 4px 0 0;
  color: #1d1132;
  font-size: 16px;
  font-weight: 800;
}

.timeline-empty p {
  margin: 0;
  font-size: 13px;
  line-height: 1.55;
}

.empty-action {
  margin-top: 6px;
  height: 34px;
  border-radius: 8px;
  font-weight: 700;
}

/* ============ Dialog ============ */
:global(.timeline-editor-dialog) {
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 24px 80px rgba(29, 17, 50, 0.2);
}

:global(.timeline-editor-dialog .t-dialog__header) {
  padding: 0;
  border-bottom: 0;
}

:global(.timeline-editor-dialog .t-dialog__body) {
  padding: 20px 24px 24px;
}

:global(.timeline-editor-dialog .t-dialog__close) {
  top: 18px;
  right: 18px;
  color: rgba(255, 255, 255, 0.82);
}

.form-dialog-title {
  width: 100%;
  padding: 18px 24px;
  color: #fff;
  background: linear-gradient(135deg, #3d2266, #437b70);
}

.form-dialog-title span {
  display: block;
  margin-bottom: 4px;
  color: rgba(255, 255, 255, 0.72);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.form-dialog-title h3 {
  margin: 0;
  font-size: 17px;
  font-weight: 800;
  line-height: 1.25;
}

.form-dialog-title p {
  margin: 6px 0 0;
  color: rgba(255, 255, 255, 0.76);
  font-size: 12px;
  line-height: 1.5;
}

.form-dialog-form {
  padding: 2px 0 0;
}

.form-dialog-form :deep(.t-form__item) {
  margin-bottom: 18px;
}

.form-dialog-form :deep(.t-form__label) {
  color: #2d194c;
  font-size: 13px;
  font-weight: 800;
}

.form-dialog-form :deep(.t-input),
.form-dialog-form :deep(.t-select__wrap),
.form-dialog-form :deep(.t-textarea__inner) {
  border-color: rgba(80, 54, 109, 0.16);
  border-radius: 8px;
  background: #fbfbfe;
}

.form-dialog-form :deep(.t-input:hover),
.form-dialog-form :deep(.t-input.t-is-focused),
.form-dialog-form :deep(.t-textarea__inner:hover),
.form-dialog-form :deep(.t-textarea__inner:focus) {
  border-color: rgba(67, 123, 112, 0.42);
  box-shadow: 0 0 0 3px rgba(67, 123, 112, 0.1);
}

.dialog-textarea :deep(.t-textarea__inner) {
  min-height: 104px;
  resize: vertical;
}

.dialog-textarea--small :deep(.t-textarea__inner) {
  min-height: 82px;
}

.form-dialog-actions {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 4px;
}

.dialog-cancel,
.dialog-submit {
  min-width: 96px;
  height: 38px;
  border-radius: 8px;
  font-weight: 800;
}

.dialog-submit {
  border: 0;
  background: linear-gradient(135deg, #3d2266, #437b70);
  box-shadow: 0 10px 24px rgba(61, 34, 102, 0.16);
}

/* ============ Responsive ============ */
@media (max-width: 640px) {
  .timeline-head {
    flex-direction: column;
    align-items: stretch;
  }

  .timeline-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .date-picker,
  .add-timeline-button {
    width: 100%;
  }

  .timeline-row {
    grid-template-columns: 48px 20px minmax(0, 1fr);
    gap: 8px;
  }

  :global(.timeline-editor-dialog) {
    width: calc(100vw - 28px) !important;
  }

  .form-dialog-title,
  :global(.timeline-editor-dialog .t-dialog__body) {
    padding: 20px;
  }

  .form-dialog-actions {
    flex-direction: column-reverse;
  }

  .dialog-cancel,
  .dialog-submit {
    width: 100%;
  }
}
</style>
