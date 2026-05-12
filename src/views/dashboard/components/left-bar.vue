<script setup lang="ts">
import type { IProjectInfo, TProjectList } from '@/types/projectTypes'
import dayjs from 'dayjs'
import { Popconfirm as TPopconfirm } from 'tdesign-vue-next'
import { computed, onMounted, ref } from 'vue'

import { useRouter } from 'vue-router'
import { logoutApi } from '@/api/auth'
import { getRecentProjectListApi } from '@/api/project'
import LogoutIcon from '@/assets/svg/logout.svg'
import NoDataIcon from '@/assets/svg/noData.svg'
import ProjectIcon from '@/assets/svg/project.svg'
import SearchIcon from '@/assets/svg/search.svg'
import SettingIcon from '@/assets/svg/setting.svg'
import { useTdMessage } from '@/hooks/useTdMessage'
import { useMainStore } from '@/stores/main'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const mainStore = useMainStore()
const userStore = useUserStore()
const tdMessage = useTdMessage()
const projectList = ref<TProjectList>([])

const todayUpdateCount = computed(() => {
  return projectList.value.filter(p => dayjs(p.update_time).isSame(dayjs(), 'day')).length
})

function formatRelativeTime(time?: string) {
  if (!time)
    return ''
  const now = dayjs()
  const target = dayjs(time)
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
  return target.format('MM-DD')
}

function openProject(project: IProjectInfo) {
  mainStore.setCurrentProjectId(project.id)
  router.push({ name: 'projectDashboard' })
}

function logout() {
  logoutApi().then((res) => {
    if (res.code === 200) {
      tdMessage.success('退出登录成功')
      router.push({ name: 'login' })
    }
  })
}

onMounted(() => {
  getRecentProjectListApi().then((res) => {
    projectList.value = res.data
  })
})
</script>

<template>
  <div class="sidebar-shell">
    <div class="top-bar">
      <div class="brand-block">
        <div class="brand-logo-wrap">
          <span class="brand-logo-glow" aria-hidden="true" />
          <img src="@/assets/images/logo.png" class="brand-logo" alt="LiFocus">
        </div>
        <div class="brand-text">
          <div class="brand-title">
            LiFocus
          </div>
          <div class="brand-subtitle">
            Keep thoughts moving
          </div>
        </div>
      </div>
    </div>

    <button class="search-trigger" type="button">
      <SearchIcon class="search-trigger-icon" />
      <span class="search-trigger-text">快速查找...</span>
      <kbd class="search-trigger-kbd">⌘ K</kbd>
    </button>

    <div class="sidebar-summary">
      <div class="stat-card stat-primary">
        <span class="stat-accent" />
        <div class="stat-icon">
          <ProjectIcon />
        </div>
        <div class="stat-body">
          <div class="stat-value">
            {{ projectList.length }}
          </div>
          <div class="stat-label">
            近期项目
          </div>
        </div>
      </div>
      <div class="stat-card stat-accent-card">
        <span class="stat-accent" />
        <div class="stat-icon stat-icon-accent">
          <span class="live-indicator" />
        </div>
        <div class="stat-body">
          <div class="stat-value">
            {{ todayUpdateCount }}
          </div>
          <div class="stat-label">
            今日活跃
          </div>
        </div>
      </div>
    </div>

    <div class="recent-head">
      <div>
        <p>Recent</p>
        <h2>近期项目</h2>
      </div>
      <span v-if="projectList.length > 0" class="recent-count">{{ projectList.length }}</span>
    </div>

    <div class="mid-list">
      <ScrollBar class="h-full overflow-x-hidden">
        <template v-if="projectList?.length > 0">
          <div class="recent-list">
            <button
              v-for="project in projectList"
              :key="project.id"
              class="project-item"
              :title="project.name"
              type="button"
              @click="openProject(project)"
            >
              <span class="project-icon">
                <ProjectIcon v-if="!project.icon" />
                <img v-else :src="project.icon" alt="">
              </span>
              <span class="project-item-body">
                <span class="project-item-title">
                  {{ project.name }}
                </span>
                <span class="project-item-time">
                  {{ formatRelativeTime(project.update_time) }}
                </span>
              </span>
              <span class="project-item-arrow" aria-hidden="true">→</span>
            </button>
          </div>
        </template>
        <template v-else>
          <div class="empty-state">
            <NoDataIcon />
            <span>暂无近期项目</span>
          </div>
        </template>
      </ScrollBar>
    </div>

    <div class="bottom-bar">
      <img src="@/assets/images/favicon1.jpg" class="avatar" alt="avatar">
      <div class="user-meta">
        <span>{{ userStore.nickname }}</span>
        <p>Signed in</p>
      </div>
      <div class="bottom-actions">
        <button class="icon-button" type="button" aria-label="设置">
          <SettingIcon />
        </button>
        <TPopconfirm content="退出登录？" @confirm="logout">
          <button class="icon-button icon-button-danger" type="button" aria-label="退出登录">
            <LogoutIcon />
          </button>
        </TPopconfirm>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sidebar-shell {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 14px;
  overflow: hidden;
}

/* ======== Brand ======== */
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.brand-block {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-logo-wrap {
  position: relative;
  width: 44px;
  height: 44px;
  flex: 0 0 auto;
}

.brand-logo-glow {
  position: absolute;
  inset: -4px;
  border-radius: 12px;
  background: radial-gradient(closest-side, rgba(67, 123, 112, 0.45), transparent 70%);
  filter: blur(8px);
  opacity: 0.8;
  pointer-events: none;
}

.brand-logo {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 10px;
  object-fit: cover;
  box-shadow: 0 10px 24px rgba(61, 34, 102, 0.2);
}

.avatar {
  width: 40px;
  height: 40px;
  flex: 0 0 auto;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 0 0 2px rgba(67, 123, 112, 0.18);
}

.brand-title {
  color: #1d1132;
  font-size: 18px;
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.01em;
}

.brand-subtitle,
.user-meta p,
.recent-head p,
.stat-label {
  margin: 0;
  color: rgba(29, 17, 50, 0.48);
  font-size: 11px;
  font-weight: 700;
  line-height: 1.4;
  letter-spacing: 0.04em;
}

/* ======== Search trigger ======== */
.search-trigger {
  width: 100%;
  height: 36px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0 10px 0 12px;
  border: 1px solid rgba(80, 54, 109, 0.12);
  border-radius: 999px;
  background: #fff;
  color: rgba(29, 17, 50, 0.5);
  cursor: pointer;
  font: inherit;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
}

.search-trigger:hover {
  border-color: rgba(67, 123, 112, 0.3);
  background: #fbfdfc;
  box-shadow: 0 4px 12px rgba(45, 25, 76, 0.05);
}

.search-trigger-icon {
  width: 14px;
  height: 14px;
  color: #3d2266;
  flex: 0 0 auto;
}

.search-trigger-text {
  flex: 1;
  font-size: 12px;
  text-align: left;
}

.search-trigger-kbd {
  padding: 2px 6px;
  border: 1px solid rgba(80, 54, 109, 0.12);
  border-radius: 6px;
  background: #f4f6f9;
  color: rgba(29, 17, 50, 0.6);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 10px;
  font-weight: 700;
}

/* ======== Icon buttons ======== */
.icon-button {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  border: 1px solid rgba(80, 54, 109, 0.12);
  border-radius: 8px;
  background: #fff;
  color: #3d2266;
  cursor: pointer;
  transition: border-color 0.2s ease, color 0.2s ease, background-color 0.2s ease;
}

.icon-button:hover {
  border-color: rgba(67, 123, 112, 0.34);
  background: #edf4f2;
  color: #437b70;
}

.icon-button.icon-button-danger:hover {
  border-color: rgba(205, 100, 100, 0.34);
  background: #fdecec;
  color: #c24a4a;
}

.icon-button svg {
  width: 16px;
  height: 16px;
}

/* ======== Stat cards ======== */
.sidebar-summary {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.stat-card {
  position: relative;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px 10px 14px;
  overflow: hidden;
  border: 1px solid rgba(80, 54, 109, 0.1);
  border-radius: 10px;
  background: linear-gradient(135deg, #fbfbfe, #f4f8f7);
  box-shadow: 0 2px 8px rgba(45, 25, 76, 0.04);
}

.stat-accent {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 3px;
  background: linear-gradient(180deg, #3d2266, #437b70);
  border-radius: 3px 0 0 3px;
}

.stat-accent-card .stat-accent {
  background: linear-gradient(180deg, #4c9687, #5b8f5a);
}

.stat-icon {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  border-radius: 8px;
  background: rgba(61, 34, 102, 0.1);
  color: #3d2266;
}

.stat-icon-accent {
  background: rgba(67, 123, 112, 0.12);
  color: #437b70;
}

.stat-icon svg {
  width: 14px;
  height: 14px;
}

.live-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4c9687;
  box-shadow: 0 0 0 3px rgba(76, 150, 135, 0.25);
  animation: sb-pulse 1.8s ease-in-out infinite;
}

@keyframes sb-pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.3);
    opacity: 0.65;
  }
}

.stat-body {
  min-width: 0;
  flex: 1;
}

.stat-value {
  color: #1d1132;
  font-size: 18px;
  font-weight: 800;
  line-height: 1.15;
  font-variant-numeric: tabular-nums;
}

.stat-label {
  margin-top: 2px;
}

/* ======== Recent head ======== */
.recent-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 10px;
}

.recent-head p {
  margin: 0;
  text-transform: uppercase;
}

.recent-head h2 {
  margin: 2px 0 0;
  color: #1d1132;
  font-size: 14px;
  font-weight: 800;
  line-height: 1.2;
}

.recent-count {
  min-width: 22px;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(61, 34, 102, 0.08);
  color: #3d2266;
  font-size: 11px;
  font-weight: 800;
  text-align: center;
  font-variant-numeric: tabular-nums;
}

/* ======== Recent list ======== */
.mid-list {
  min-height: 0;
  flex: 1;
  overflow: hidden;
}

.recent-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-right: 4px;
}

.project-item {
  width: 100%;
  min-height: 44px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border: 1px solid transparent;
  border-radius: 10px;
  background: transparent;
  color: #2d194c;
  cursor: pointer;
  text-align: left;
  transition: border-color 0.2s ease, background-color 0.2s ease, transform 0.2s ease;
}

.project-item:hover {
  border-color: rgba(67, 123, 112, 0.18);
  background: linear-gradient(90deg, #f4f8f7, #fbfbfe);
  transform: translateX(2px);
}

.project-item:hover .project-item-arrow {
  opacity: 1;
  transform: translateX(0);
}

.project-item:hover .project-icon {
  background: linear-gradient(135deg, #3d2266, #437b70);
  color: #fff;
}

.project-icon {
  width: 30px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  border-radius: 8px;
  background: rgba(61, 34, 102, 0.08);
  color: #3d2266;
  transition: background 0.2s ease, color 0.2s ease;
}

.project-icon svg,
.project-icon img {
  width: 16px;
  height: 16px;
}

.project-item-body {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.project-item-title {
  min-width: 0;
  overflow: hidden;
  font-size: 13px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.project-item-time {
  color: rgba(29, 17, 50, 0.44);
  font-size: 11px;
  font-weight: 600;
}

.project-item-arrow {
  color: #437b70;
  font-size: 14px;
  font-weight: 800;
  opacity: 0;
  transform: translateX(-4px);
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.empty-state {
  height: 100%;
  min-height: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: rgba(29, 17, 50, 0.48);
  font-size: 13px;
}

.empty-state svg {
  width: 120px;
  max-width: 70%;
  height: auto;
}

/* ======== Bottom bar ======== */
.bottom-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid rgba(80, 54, 109, 0.1);
  border-radius: 12px;
  background:
    linear-gradient(135deg, rgba(61, 34, 102, 0.04), rgba(67, 123, 112, 0.04)),
    #fbfbfe;
}

.user-meta {
  min-width: 0;
  flex: 1;
}

.user-meta span {
  display: block;
  overflow: hidden;
  color: #1d1132;
  font-size: 13px;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bottom-actions {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex: 0 0 auto;
}

@media (max-width: 900px) {
  .sidebar-summary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
