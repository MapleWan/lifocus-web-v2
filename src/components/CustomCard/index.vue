<script setup lang="ts">
import { computed, ref } from 'vue'

// 定义组件 Props
interface Props {
  /** 卡片标题 */
  title?: string
  /** 卡片副标题 */
  subtitle?: string
  /** 是否显示阴影 */
  shadow?: boolean
  /** 悬停时是否显示阴影 */
  hoverShadow?: boolean
  /** 卡片尺寸 */
  size?: 'small' | 'medium' | 'large'
  /** 卡片边框 */
  bordered?: boolean
  /** 是否可点击 */
  clickable?: boolean
  /** 自定义类名 */
  customClass?: string
  /** 封面图片 */
  cover?: string
  /** 加载状态 */
  loading?: boolean
}

// 默认 Props
const props = withDefaults(defineProps<Props>(), {
  shadow: false,
  hoverShadow: true,
  size: 'medium',
  bordered: true,
  clickable: false,
  loading: false,
})

// 定义 emits
const emit = defineEmits<{
  (e: 'click'): void
}>()

// 内部状态
const isHovered = ref(false)

// 计算卡片类名
const cardClasses = computed(() => {
  const classes = ['lf-card']

  // 尺寸类
  classes.push(`lf-card--${props.size}`)

  // 边框样式
  if (props.bordered) {
    classes.push('lf-card--bordered')
  }

  // 阴影样式
  if (props.shadow) {
    classes.push('lf-card--shadow')
  }

  // 悬停阴影
  if (props.hoverShadow && isHovered.value) {
    classes.push('lf-card--hover-shadow')
  }

  // 可点击样式
  if (props.clickable) {
    classes.push('lf-card--clickable')
  }

  // 自定义类名
  if (props.customClass) {
    classes.push(props.customClass)
  }

  return classes.join(' ')
})

// 处理卡片点击事件
function handleClick() {
  if (props.clickable) {
    emit('click')
  }
}

// 处理鼠标悬停
function handleMouseEnter() {
  isHovered.value = true
}

function handleMouseLeave() {
  isHovered.value = false
}
</script>

<template>
  <div
    :class="cardClasses"
    @click="handleClick"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- 加载遮罩 -->
    <div v-if="loading" class="lf-card__loading">
      <div class="lf-card__loading-spinner" />
      <div class="lf-card__loading-text">
        加载中...
      </div>
    </div>

    <!-- 封面 -->
    <div v-if="cover" class="lf-card__cover">
      <img :src="cover" :alt="title || 'cover'">
    </div>

    <!-- 卡片内容 -->
    <div class="lf-card__body">
      <!-- 标题区域 -->
      <div v-if="title || subtitle" class="lf-card__header">
        <div v-if="title" class="lf-card__title">
          <div class="flex-1 text-overflow">
            {{ title }}
          </div>

          <!-- 操作区域 -->
          <div
            v-if="$slots.actions"
            class="lf-card__operations"
            @click.stop
          >
            <slot name="actions" />
          </div>
        </div>
        <div v-if="subtitle" class="lf-card__subtitle">
          {{ subtitle }}
        </div>
      </div>

      <!-- 内容区域 -->
      <div v-if="$slots.default" class="lf-card__content">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 基础卡片样式 */
.lf-card {
  position: relative;
  background: var(--lf-card-bg, #ffffff);
  border-radius: var(--lf-card-radius, 8px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  width: 100%;
}

/* 尺寸变量 */
.lf-card--small {
  --lf-card-padding: 12px;
}

.lf-card--medium {
  --lf-card-padding: 16px;
}

.lf-card--large {
  --lf-card-padding: 24px;
}

/* 边框样式 */
.lf-card--bordered {
  border: 1px solid var(--lf-card-border-color, #e0e0e0);
}

/* 阴影样式 */
.lf-card--shadow {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.lf-card--hover-shadow {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

/* 可点击样式 */
.lf-card--clickable {
  cursor: pointer;
}

.lf-card--clickable:hover {
  transform: translateY(-2px);
}

/* 加载状态 */
.lf-card__loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.lf-card__loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #1890ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 8px;
}

.lf-card__loading-text {
  font-size: 14px;
  color: #666;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 封面样式 */
.lf-card__cover {
  width: 100%;
  height: auto;
}

.lf-card__cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* 卡片主体 */
.lf-card__body {
  padding: var(--lf-card-padding);
}

/* 标题区域 */
.lf-card__header {
  margin-bottom: 12px;
}

.lf-card__title {
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
  color: var(--lf-text-primary, #333);
  margin-bottom: 4px;
  line-height: 1.4;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.lf-card__subtitle {
  font-size: 14px;
  color: var(--lf-text-secondary, #666);
  line-height: 1.4;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

/* 内容区域 */
.lf-card__content {
  line-height: 1.6;
  color: var(--lf-text-primary, #333);
}

/* 操作区域 */
.lf-card__operations {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .lf-card--large {
    --lf-card-padding: 16px;
  }

  .lf-card__title {
    font-size: 16px;
  }

  .lf-card__body {
    padding: var(--lf-card-padding);
  }
}

/* 暗色主题适配 */
/* @media (prefers-color-scheme: dark) {
  .lf-card {
    --lf-card-bg: #1f1f1f;
    --lf-card-border-color: #404040;
    --lf-text-primary: #ffffff;
    --lf-text-secondary: #bfbfbf;
    --lf-border-color: #404040;
  }
} */
</style>
