<script setup lang="ts">
import { ref } from 'vue'
import { useMainStore } from '@/stores/main'
import ResourcePanel from './components/ResourcePanel/index.vue'

const mainStore = useMainStore()
const activeSection = ref<'resource' | 'article' | 'knowledge'>('resource')
</script>

<template>
  <div class="create-page">
    <div class="create-header">
      <h3>资源创建</h3>
      <div class="section-tabs">
        <button
          class="section-tab"
          :class="{ active: activeSection === 'resource' }"
          @click="activeSection = 'resource'"
        >
          资源管理
        </button>
        <button
          class="section-tab"
          :class="{ active: activeSection === 'article' }"
          @click="activeSection = 'article'"
        >
          文章管理
        </button>
        <button
          class="section-tab"
          :class="{ active: activeSection === 'knowledge' }"
          @click="activeSection = 'knowledge'"
        >
          知识库
        </button>
      </div>
    </div>

    <div class="create-content">
      <!-- 资源管理 -->
      <div v-if="activeSection === 'resource'" class="section-content">
        <ResourcePanel :project-id="mainStore.currentProjectId" />
      </div>

      <!-- 文章管理（占位） -->
      <div v-else-if="activeSection === 'article'" class="section-placeholder">
        <div class="placeholder-icon">📝</div>
        <div>文章管理功能开发中...</div>
      </div>

      <!-- 知识库（占位） -->
      <div v-else-if="activeSection === 'knowledge'" class="section-placeholder">
        <div class="placeholder-icon">📚</div>
        <div>知识库功能开发中...</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.create-page {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.create-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--td-border-level-2-color, #e5e7eb);
}

.create-header h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--td-text-color-primary, #1f2937);
}

.section-tabs {
  display: flex;
  gap: 8px;
}

.section-tab {
  padding: 8px 16px;
  border: 1px solid var(--td-border-level-2-color, #e5e7eb);
  background: var(--td-bg-color-container, #fff);
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  color: var(--td-text-color-secondary, #6b7280);
  transition: all 0.2s;
}

.section-tab:hover {
  color: var(--td-text-color-primary, #1f2937);
  border-color: var(--td-brand-color, #818cf8);
}

.section-tab.active {
  background: var(--td-brand-color, #818cf8);
  color: #fff;
  border-color: var(--td-brand-color, #818cf8);
}

.create-content {
  flex: 1;
  overflow: auto;
}

.section-content {
  height: 100%;
}

.section-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: var(--td-text-color-placeholder, #9ca3af);
}

.placeholder-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.3;
}
</style>
