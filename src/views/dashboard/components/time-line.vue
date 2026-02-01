<script setup lang="ts">
import type { FormProps } from 'tdesign-vue-next'
import type { IAddTimelineParams, TTimelineList } from '@/types/timelineTypes'
import dayjs from 'dayjs'
import { Button as TButton, Dialog as TDialog, Form as TForm, FormItem as TFormItem, Input as TInput, Option as TOption, Select as TSelect, Textarea as TTextarea, Timeline as TTimeLine, TimelineItem as TTimeLineItem } from 'tdesign-vue-next'

import { onMounted, ref } from 'vue'
import { addTimelineApi, getTodayTimelineApi } from '@/api/timeline'
import NoDataIcon from '@/assets/svg/noData.svg'
import { useTdMessage } from '@/hooks/useTdMessage'
import { ETimelineStatus, ETimelineType } from '@/utils/enums/timelineEnum'
import TimelineItem from './timeline-item.vue'

const useMessage = useTdMessage()
const options = ref()
// {
//   label: '2022-01-01',
//   content: '已完成的时间',
//   dotColor: '#fff',
// },

const timeLineList = ref<TTimelineList>()
const statusToColor = ETimelineStatus.reduce((acc, cur) => {
  acc[cur.value] = cur.dotColor
  return acc
}, {} as Record<string, string>)
function getTodayTimeline() {
  getTodayTimelineApi(
    {
      create_start_time: `${dayjs().format('YYYY-MM-DD')} 00:00:00`,
      create_end_time: `${dayjs().format('YYYY-MM-DD')} 23:59:59`,
    },
  ).then((res) => {
    timeLineList.value = res.data
    options.value = res.data.map(item => ({
      label: `${dayjs(item.create_time).format('YYYY-MM-DD HH:mm:ss')} ${item?.end_time ? ` ~ ${dayjs(item.end_time).format('YYYY-MM-DD HH:mm:ss')}` : ''}`,
      content: `${item.title}\n${item.content}`,
      dotColor: statusToColor[item.status],
      item,
    }))
  })
}

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

onMounted(() => {
  getTodayTimeline()
})
</script>

<template>
  <div class="h-full overflow-hidden flex flex-col">
    <div class="font-bold text-primary-90">
      今日时间线 ({{ dayjs().format('YYYY-MM-DD') }})
    </div>
    <div class="flex-1 overflow-hidden">
      <ScrollBar class="h-full p-4">
        <TTimeLine v-if="timeLineList && timeLineList.length > 0" mode="same" label-align="alternate" layout="vertical">
          <TTimeLineItem v-for="(item, index) in options" :key="index" :label="item.label" :dot-color="item.dotColor">
            <TimelineItem :timeline="item.item" :index="index" @refresh="getTodayTimeline" />
          <!-- {{ item.content }} -->
          </TTimeLineItem>
        </TTimeLine>
        <div v-else class="flex flex-col justify-center items-center h-full">
          <NoDataIcon />
          <span class="text-primary-50">暂无数据</span>
        </div>
      </ScrollBar>
    </div>
    <TButton size="small" @click="timelineFormDialogVisible = true">
      +
    </TButton>
    <TDialog v-model:visible="timelineFormDialogVisible" header="添加时间线" :footer="false">
      <TForm :data="timelineFormData" :rules="timelineFormRules" @submit="handleTimelineSubmit">
        <TFormItem label="标题" name="title">
          <TInput v-model="timelineFormData.title" placeholder="" />
        </TFormItem>

        <TFormItem label="类型" name="type">
          <TSelect v-model="timelineFormData.type">
            <template v-for="value in ETimelineType" :key="value.value">
              <TOption :label="value.label" :value="value.value" />
            </template>
          </TSelect>
        </TFormItem>

        <TFormItem label="内容" name="content">
          <TTextarea v-model="timelineFormData.content" placeholder="请输入内容" />
        </TFormItem>
        <TFormItem label="描述" name="description">
          <TTextarea v-model="timelineFormData.description" placeholder="请输入描述" />
        </TFormItem>
        <TFormItem>
          <div class="flex justify-end w-full gap-2">
            <TButton theme="default" @click="timelineFormDialogVisible = false">
              取消
            </TButton>
            <TButton theme="primary" type="submit">
              确定
            </TButton>
          </div>
        </TFormItem>
      </TForm>
    </TDialog>
  </div>
</template>

<style scoped></style>
