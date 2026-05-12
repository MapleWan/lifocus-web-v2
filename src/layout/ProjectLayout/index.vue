<script setup lang="ts">
import type { TProjectList } from '@/types/projectTypes'
import { Option as TOption, Popup as TPopup, RadioButton as TRadioButton, RadioGroup as TRadioGroup, Select as TSelect } from 'tdesign-vue-next'
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { logoutApi } from '@/api/auth'
import { getProjectListApi } from '@/api/project'
import ChatIcon from '@/assets/svg/chat.svg'
import CreateIcon from '@/assets/svg/create.svg'
import DashboardIcon from '@/assets/svg/dashboard.svg'
import { useTdMessage } from '@/hooks/useTdMessage'
import { useMainStore } from '@/stores/main'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const mainStore = useMainStore()
const router = useRouter()
const route = useRoute()
const tdMessage = useTdMessage()
const project = ref(mainStore.currentProjectId)
const projectList = ref<TProjectList>([])

watch(project, (newValue) => {
  mainStore.setCurrentProjectId(newValue)
})

export type TTabType = 'dailog' | 'dashboard' | 'create'
const tabType = ref('dashboard')

watch(tabType, (newValue) => {
  switch (newValue) {
    case 'dailog':
      router.push({ name: 'projectDialog' })
      break
    case 'dashboard':
      router.push({ name: 'projectDashboard' })
      break
    case 'create':
      router.push({ name: 'articleCreate' })
      break
  }
})

function logout() {
  logoutApi().then((res) => {
    if (res.code === 200) {
      tdMessage.success('退出登录成功')
      router.push({ name: 'login' })
    }
  })
}

function goToDashboard() {
  router.push({ name: 'dashboard' })
}

onMounted(() => {
  switch (route.name) {
    case 'projectDialog':
      tabType.value = 'dailog'
      break
    case 'projectDashboard':
      tabType.value = 'dashboard'
      break
    case 'articleCreate':
      tabType.value = 'create'
      break
  }
  getProjectListApi().then((res) => {
    projectList.value = res.data
  })
})
</script>

<template>
  <div class="app-shell">
    <header class="app-topbar">
      <div class="topbar-left">
        <div class="brand-wrap" @click="goToDashboard">
          <div class="brand-logo-wrap">
            <span class="brand-logo-glow" aria-hidden="true" />
            <img src="@/assets/images/logo.png" class="brand-logo" alt="LiFocus">
          </div>
          <span class="brand-title">LiFocus</span>
        </div>

        <span class="topbar-divider" />

        <div class="project-switcher">
          <span class="switcher-eyebrow">Project</span>
          <TSelect
            v-model="project"
            class="switcher-select"
            placeholder="请选择项目"
            auto-width
            filterable
            :borderless="true"
          >
            <TOption v-for="item in projectList" :key="item.id" :value="item.id" :label="item.name" />
          </TSelect>
        </div>
      </div>

      <div class="topbar-mid">
        <TRadioGroup v-model="tabType" class="layout-tabs" variant="default-filled" default-value="dashboard">
          <TRadioButton value="dailog">
            <span class="tab-inner">
              <ChatIcon class="tab-icon" />
              <span>对话</span>
            </span>
          </TRadioButton>
          <TRadioButton value="dashboard">
            <span class="tab-inner">
              <DashboardIcon class="tab-icon" />
              <span>工作台</span>
            </span>
          </TRadioButton>
          <TRadioButton value="create">
            <span class="tab-inner">
              <CreateIcon class="tab-icon" />
              <span>创建</span>
            </span>
          </TRadioButton>
        </TRadioGroup>
      </div>

      <div class="topbar-right">
        <TPopup destroy-on-close placement="bottom-right">
          <button class="user-chip" type="button">
            <img src="@/assets/images/favicon1.jpg" class="user-avatar" alt="avatar">
            <span class="user-name">{{ userStore.nickname }}</span>
            <span class="user-caret" aria-hidden="true" />
          </button>
          <template #content>
            <div class="user-menu">
              <button class="user-menu-item user-menu-item-danger" type="button" @click="logout">
                退出登录
              </button>
            </div>
          </template>
        </TPopup>
      </div>
    </header>

    <main class="app-main">
      <RouterView class="app-view" />
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background:
    radial-gradient(900px 400px at 0% -5%, rgba(61, 34, 102, 0.12), transparent 60%),
    radial-gradient(900px 420px at 100% 110%, rgba(67, 123, 112, 0.14), transparent 60%),
    linear-gradient(135deg, #f7f8fb, #edf4f2);
}

/* =========== top bar =========== */
.app-topbar {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 18px;
  border-bottom: 1px solid rgba(80, 54, 109, 0.08);
  background: rgba(255, 255, 255, 0.78);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  z-index: 2;
}

.topbar-left,
.topbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 0 0 auto;
}

.topbar-mid {
  flex: 1;
  display: flex;
  justify-content: center;
}

/* brand */
.brand-wrap {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 4px 6px 4px 4px;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.brand-wrap:hover {
  background: rgba(61, 34, 102, 0.05);
}

.brand-logo-wrap {
  position: relative;
  width: 34px;
  height: 34px;
  flex: 0 0 auto;
}

.brand-logo-glow {
  position: absolute;
  inset: -4px;
  border-radius: 10px;
  background: radial-gradient(closest-side, rgba(67, 123, 112, 0.4), transparent 70%);
  filter: blur(6px);
  opacity: 0.75;
  pointer-events: none;
}

.brand-logo {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 8px;
  object-fit: cover;
  box-shadow: 0 6px 16px rgba(61, 34, 102, 0.18);
}

.brand-title {
  background: linear-gradient(135deg, #3d2266, #437b70);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-size: 17px;
  font-weight: 800;
  letter-spacing: -0.01em;
}

.topbar-divider {
  width: 1px;
  height: 22px;
  background: rgba(80, 54, 109, 0.14);
}

/* project switcher */
.project-switcher {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 2px 10px 2px 12px;
  border: 1px solid rgba(80, 54, 109, 0.1);
  border-radius: 999px;
  background: #fff;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.project-switcher:hover {
  border-color: rgba(67, 123, 112, 0.3);
  box-shadow: 0 4px 12px rgba(45, 25, 76, 0.05);
}

.switcher-eyebrow {
  color: rgba(29, 17, 50, 0.5);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.switcher-select {
  max-width: 260px;
}

.switcher-select :deep(.t-input),
.switcher-select :deep(.t-input:hover),
.switcher-select :deep(.t-input.t-is-focused),
.switcher-select :deep(.t-input--focused),
.switcher-select :deep(.t-select-input),
.switcher-select :deep(.t-select-input:hover),
.switcher-select :deep(.t-select-input--borderless),
.switcher-select :deep(.t-select-input.t-is-focused) {
  min-width: 0 !important;
  width: auto !important;
  padding: 0 !important;
  border: none !important;
  box-shadow: none !important;
  background: transparent !important;
}

.switcher-select :deep(.t-input__inner),
.switcher-select :deep(.t-input__inner input),
.switcher-select :deep(.t-select-input__single) {
  width: auto !important;
  min-width: 0 !important;
  max-width: 220px !important;
  color: #1d1132;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* =========== tabs =========== */
.layout-tabs :deep(.t-radio-group) {
  position: relative;
  padding: 4px;
  border: 1px solid rgba(80, 54, 109, 0.08);
  border-radius: 12px;
  background: rgba(248, 246, 252, 0.8);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
}

.layout-tabs :deep(.t-radio-group.t-radio-group--filled) {
  background: rgba(248, 246, 252, 0.8);
}

/* 隐藏 TDesign 内置的滑动指示器，避免切换时白块闪烁 */
.layout-tabs :deep(.t-radio-group__bg-block),
.layout-tabs :deep(.t-radio-group__block),
.layout-tabs :deep(.t-radio-button__former-checked-inner),
.layout-tabs :deep(.t-radio-group--filled .t-radio-group__bg-block) {
  display: none !important;
  opacity: 0 !important;
  background: transparent !important;
}

.layout-tabs :deep(.t-radio-button) {
  position: relative;
  height: 34px;
  padding: 0 16px;
  border: none !important;
  border-radius: 8px !important;
  background: transparent !important;
  color: rgba(29, 17, 50, 0.6) !important;
  font-weight: 700 !important;
  transition: color 0.18s ease, background-color 0.18s ease;
  will-change: background-color, color;
}

.layout-tabs :deep(.t-radio-button::before),
.layout-tabs :deep(.t-radio-button::after) {
  display: none !important;
  content: none !important;
}

.layout-tabs :deep(.t-radio-button:hover) {
  color: #3d2266 !important;
  background: rgba(255, 255, 255, 0.65) !important;
}

.layout-tabs :deep(.t-is-checked.t-radio-button) {
  background: linear-gradient(135deg, #3d2266, #437b70) !important;
  color: #fff !important;
  box-shadow: 0 6px 18px rgba(61, 34, 102, 0.28);
}

.layout-tabs :deep(.t-radio-button__former) {
  display: none;
}

.tab-inner {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.tab-icon {
  width: 14px;
  height: 14px;
}

/* =========== user chip =========== */
.user-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 38px;
  padding: 3px 12px 3px 3px;
  border: 1px solid rgba(80, 54, 109, 0.1);
  border-radius: 999px;
  background: #fff;
  color: #1d1132;
  cursor: pointer;
  font: inherit;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.user-chip:hover {
  border-color: rgba(67, 123, 112, 0.32);
  box-shadow: 0 6px 16px rgba(45, 25, 76, 0.08);
}

.user-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 0 0 2px rgba(67, 123, 112, 0.18);
}

.user-name {
  max-width: 120px;
  overflow: hidden;
  font-size: 13px;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-caret {
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 5px solid rgba(29, 17, 50, 0.5);
}

.user-menu {
  display: flex;
  flex-direction: column;
  min-width: 140px;
  padding: 4px;
}

.user-menu-item {
  height: 34px;
  padding: 0 12px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #1d1132;
  cursor: pointer;
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  text-align: left;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.user-menu-item:hover {
  background: rgba(67, 123, 112, 0.08);
  color: #437b70;
}

.user-menu-item-danger:hover {
  background: rgba(168, 89, 90, 0.1);
  color: #a8595a;
}

/* =========== main =========== */
.app-main {
  flex: 1;
  min-height: 0;
  display: flex;
  padding: 16px;
  overflow: hidden;
}

.app-view {
  width: 100%;
  height: 100%;
  overflow: hidden;
  padding: 16px;
  border: 1px solid rgba(80, 54, 109, 0.08);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.88);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.6) inset,
    0 12px 36px rgba(45, 25, 76, 0.06);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

/* responsive */
@media (max-width: 960px) {
  .app-topbar {
    flex-wrap: wrap;
    gap: 10px;
  }

  .topbar-mid {
    order: 3;
    width: 100%;
    justify-content: flex-start;
  }

  .user-name {
    display: none;
  }
}
</style>
