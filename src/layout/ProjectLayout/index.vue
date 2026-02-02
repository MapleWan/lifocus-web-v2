<script setup lang="ts">
import type { TProjectList } from '@/types/projectTypes'
import { Option as TOption, Popup as TPopup, RadioButton as TRadioButton, RadioGroup as TRadioGroup, Select as TSelect } from 'tdesign-vue-next'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { logoutApi } from '@/api/auth'
import { getProjectListApi } from '@/api/project'
import ChatIcon from '@/assets/svg/chat.svg'
import CreateIcon from '@/assets/svg/create.svg'
import DashboardIcon from '@/assets/svg/dashboard.svg'
import { useTdMessage } from '@/hooks/useTdMessage'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const router = useRouter()
const tdMessage = useTdMessage()
const project = ref('')
const projectList = ref<TProjectList>([])
onMounted(() => {
  getProjectListApi().then((res) => {
    projectList.value = res.data
  })
})

export type TTabType = 'dailog' | 'dashboard' | 'create'
const tabType = ref('dashboard')

function logout() {
  logoutApi().then((res) => {
    if (res.code === 200) {
      tdMessage.success('退出登录成功')
      router.push({ name: 'login' })
    }
  })
}
</script>

<template>
  <div class="top-bar bg-background-primary flex items-center justify-between">
    <div class="top-bar-left flex items-center gap-2 p-4">
      <img src="@/assets/images/logo.png" class="w-10 h-10">
      <div class="text-primary-100 font-bold text-xl">
        LiFocus
      </div>
      <TSelect v-model="project" label="项目：" placeholder="请选择项目" auto-width clearable :borderless="true">
        <TOption v-for="item in projectList" :key="item.id" :value="item.id" :label="item.name" />
      </TSelect>
    </div>

    <div class="top-bar-mid">
      <TRadioGroup v-model="tabType" variant="primary-filled" default-value="dashboard">
        <TRadioButton value="dailog">
          <div class="flex items-center gap-2">
            <ChatIcon class="w-4 h-4" /> 对话
          </div>
        </TRadioButton>
        <TRadioButton value="dashboard">
          <div class="flex items-center gap-2">
            <DashboardIcon class="w-4 h-4" /> 工作台
          </div>
        </TRadioButton>
        <TRadioButton value="create">
          <div class="flex items-center gap-2">
            <CreateIcon class="w-4 h-4" /> 创建
          </div>
        </TRadioButton>
      </TRadioGroup>
    </div>

    <div class="top-bar-right">
      <TPopup destroy-on-close>
        <div class=" flex items-center gap-2">
          <img src="@/assets/images/favicon1.jpg" class="w-6 h-6 rounded" alt="avator">
          <div class="nickname p-2 font-bold text-overflow">
            {{ userStore.nickname }}
          </div>
        </div>
        <template #content>
          <div class="hover:bg-background-secondary p-2 rounded-lg cursor-pointer" @click="logout">
            退出登录
          </div>
        </template>
      </TPopup>
    </div>
  </div>
  <div class="project-layout p-4 bg-background-primary h-full flex flex-col">
    <div class="flex-1 overflow-hidden m-1">
      <RouterView class="h-full w-full" />
    </div>
  </div>
</template>

<style scoped>
:deep(.t-radio-group.t-radio-group--filled) {
  background: inherit;
}
</style>
