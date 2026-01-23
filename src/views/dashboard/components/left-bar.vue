<script setup lang="ts">
import SearchIcon from '@/assets/svg/search.svg'
import SettingIcon from '@/assets/svg/setting.svg'

const projectList = []
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
      <ScrollBar class="h-full">
        项目列表
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

<style scoped></style>
