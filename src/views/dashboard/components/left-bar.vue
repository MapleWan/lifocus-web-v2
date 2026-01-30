<script setup lang="ts">
import type { TProjectList } from '@/types/projectTypes'
import { onMounted, ref } from 'vue'
import { getRecentProjectListApi } from '@/api/project'

import NoDataIcon from '@/assets/svg/noData.svg'
import ProjectIcon from '@/assets/svg/project.svg'
import SearchIcon from '@/assets/svg/search.svg'
import SettingIcon from '@/assets/svg/setting.svg'

const projectList = ref<TProjectList>([])

onMounted(() => {
  getRecentProjectListApi().then((res) => {
    projectList.value = res.data
    console.log(res.data)
    console.log(res.data[0]?.id || 'No project found')
  })
})
</script>

<template>
  <div class="w-full h-full overflow-hidden flex flex-col gap-2">
    <!-- 顶部栏 -->
    <div class="top-bar flex items-center justify-between">
      <div class="flex items-center gap-2">
        <img src="@/assets/images/logo.png" class="w-10 h-10">
        <div class="text-primary-100 font-bold text-xl">
          LiFocus
        </div>
      </div>
      <SearchIcon class="c-primary-100 hover:c-font-hover w-6 h-6 cursor-pointer" />
    </div>

    <!-- 中间近期项目列表 -->
    <div class="mid-list flex-1 overflow-hidden ">
      <ScrollBar class="h-full overflow-x-hidden">
        <template v-if="projectList?.length > 0">
          <template v-for="project in projectList" :key="project.id">
            <div
              class="project-item relative flex items-center cursor-pointer hover:bg-background-hover p-2 rounded"
              :title="project.name"
            >
              <ProjectIcon v-if="!project.icon" class="m-r-1 w-6 h-6 flex-shrink-0" />
              <img v-else :src="project.icon" class="m-r-1 w-6 h-6 flex-shrink-0">
              <div class="project-item-title text-ellipsis overflow-hidden whitespace-nowrap">
                {{ project.name }}
              </div>
              <!-- <div>{{ item }}</div> -->
            </div>
          </template>
        </template>
        <template v-else>
          <NoDataIcon class="w-1/2 h-1/2 absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </template>
      </ScrollBar>
    </div>

    <!-- 底部栏 -->
    <div class="bottom-bar flex justify-between items-center ">
      <img src="@/assets/images/favicon1.jpg" class="w-8 h-8 rounded" alt="avator">
      <div class="w-full p-2 font-bold text-overflow">
        Maple Wan
      </div>
      <SettingIcon class="w-10 h-10 cursor-pointer hover:c-font-hover" />
    </div>
  </div>
</template>

<style scoped>
.project-item::after {
  content: '';
  display: block;
  width: 100%;
  position: absolute;
  bottom: 0;
  border-bottom: 1px dashed #e4e7ed;
}
</style>
