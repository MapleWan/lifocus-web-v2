<script setup lang="ts">
import dayjs from 'dayjs'
import { Timeline as TTimeLine, TimelineItem as TTimeLineItem } from 'tdesign-vue-next'

const options = [
  {
    label: '2022-01-01',
    content: '已完成的时间',
    dotColor: 'primary',
  },
  {
    label: '2022-02-01',
    content: '成功的时间',
    dotColor: 'success',
  },
  {
    label: '2022-03-01',
    content: '危险时间',
    dotColor: 'error',
  },
  {
    label: '2022-04-01',
    content: '告警事件',
    dotColor: 'warning',
  },
  {
    label: '2022-04-01',
    content: '默认的时间',
  },
  {
    label: '2022-04-01',
    content: '自定义主题色',
    dotColor: 'yellowgreen',
  },
]
</script>

<template>
  <div class="h-full overflow-hidden">
    <div class="font-bold text-primary-90">
      今日时间线 ({{ dayjs().format('YYYY-MM-DD') }})
    </div>
    <ScrollBar class="h-full p-4">
      <TTimeLine mode="same" label-align="alternate" layout="vertical">
        <TTimeLineItem v-for="(item, index) in options" :key="index" :label="item.label" :dot-color="item.dotColor">
          {{ item.content }}
        </TTimeLineItem>
      </TTimeLine>
    </ScrollBar>
  </div>
</template>

<style scoped></style>
