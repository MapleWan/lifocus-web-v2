<script setup lang="ts">
import { ref } from 'vue'
import ProjectList from './project-list.vue'
import TimeLine from './time-line.vue'

type TabKey = 'project' | 'timeline'
const activeTab = ref<TabKey>('timeline')

const tabs: { key: TabKey, label: string, desc: string }[] = [
  { key: 'timeline', label: '时间线', desc: 'Timeline' },
  { key: 'project', label: '项目工作台', desc: 'Projects' },
]
</script>

<template>
  <div class="right-list">
    <div class="section-tabs" role="tablist">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="section-tab"
        :class="{ active: activeTab === tab.key }"
        role="tab"
        :aria-selected="activeTab === tab.key"
        type="button"
        @click="activeTab = tab.key"
      >
        <span class="tab-desc">{{ tab.desc }}</span>
        <span class="tab-label">{{ tab.label }}</span>
      </button>
    </div>

    <section v-show="activeTab === 'project'" class="workspace-section">
      <ProjectList />
    </section>

    <section v-show="activeTab === 'timeline'" class="workspace-section">
      <TimeLine />
    </section>
  </div>
</template>

<style scoped>
.right-list {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 14px;
  overflow: hidden;
}

.section-tabs {
  display: inline-flex;
  align-self: flex-start;
  gap: 4px;
  padding: 4px;
  border: 1px solid rgba(80, 54, 109, 0.1);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 4px 14px rgba(45, 25, 76, 0.05);
  backdrop-filter: blur(6px);
}

.section-tab {
  position: relative;
  min-width: 128px;
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  padding: 8px 18px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: rgba(29, 17, 50, 0.52);
  cursor: pointer;
  font: inherit;
  text-align: left;
  transition:
    background 0.25s ease,
    color 0.25s ease,
    border-color 0.25s ease,
    box-shadow 0.25s ease,
    transform 0.25s ease;
}

.tab-desc {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  opacity: 0.7;
}

.tab-label {
  font-size: 14px;
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.005em;
}

.section-tab:hover {
  color: #254e48;
  background: rgba(237, 244, 242, 0.7);
}

.section-tab.active {
  color: #fff;
  background: linear-gradient(135deg, #3d2266, #437b70);
  box-shadow: 0 8px 18px rgba(61, 34, 102, 0.22);
}

.section-tab.active .tab-desc {
  color: rgba(255, 255, 255, 0.8);
  opacity: 1;
}

.workspace-section {
  min-height: 0;
  flex: 1;
  overflow: hidden;
  padding: 16px;
  border: 1px solid rgba(80, 54, 109, 0.09);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.78);
}

@media (max-width: 900px) {
  .section-tab {
    min-width: 108px;
    padding: 8px 14px;
  }
}

@media (max-width: 560px) {
  .section-tabs {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-self: stretch;
  }

  .section-tab {
    min-width: 0;
    padding: 8px 12px;
  }

  .workspace-section {
    padding: 12px;
  }
}
</style>
