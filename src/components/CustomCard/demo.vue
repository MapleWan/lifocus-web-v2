<script setup lang="ts">
import { ref } from 'vue'

import DeleteIcon from '@/assets/svg/delete.svg'
import EditIcon from '@/assets/svg/edit.svg'

import CustomCard from '@/components/CustomCard/index.vue'

// 模拟数据
const articles = ref([
  {
    id: 1,
    title: 'Vue 3 Composition API 最佳实践',
    content: '深入探讨 Vue 3 Composition API 的使用技巧和最佳实践...',
    author: '张三',
    date: '2024-01-15',
    tags: ['Vue', '前端'],
    cover: 'https://picsum.photos/400/200?random=1',
  },
  {
    id: 2,
    title: 'TypeScript 类型系统详解',
    content: '全面解析 TypeScript 的类型系统，包括高级类型和泛型...',
    author: '李四',
    date: '2024-01-14',
    tags: ['TypeScript', '编程'],
    cover: 'https://picsum.photos/400/200?random=2',
  },
  {
    id: 3,
    title: '现代化 CSS 布局技术',
    content: '介绍 Grid、Flexbox 等现代 CSS 布局技术的应用场景...',
    author: '王五',
    date: '2024-01-13',
    tags: ['CSS', '前端'],
    cover: 'https://picsum.photos/400/200?random=3',
  },
])

// 处理卡片点击
function handleCardClick(article: any) {
  console.log('点击了文章:', article.title)
}

// 处理编辑操作
function handleEdit(article: any) {
  console.log('编辑文章:', article.title)
}

// 处理删除操作
function handleDelete(article: any) {
  console.log('删除文章:', article.title)
}
</script>

<template>
  <div class="demo-container h-full p-6 overflow-auto">
    <h2 class="text-2xl font-bold mb-6">
      CustomCard 组件演示
    </h2>

    <!-- 基础用法 -->
    <section class="mb-8">
      <h3 class="text-xl font-semibold mb-4">
        基础卡片
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <CustomCard
          v-for="article in articles"
          :key="article.id"
          :title="article.title"
          :subtitle="`作者: ${article.author} | 发布时间: ${article.date}`"
          :cover="article.cover"
          clickable
          @click="handleCardClick(article)"
        >
          <p class="text-gray-600 mb-4 line-clamp-3">
            {{ article.content }}
          </p>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="tag in article.tags"
              :key="tag"
              class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
            >
              {{ tag }}
            </span>
          </div>

          <template #actions>
            <div class="flex items-center gap-2">
              <EditIcon
                class="w-5 h-5 text-blue-500 cursor-pointer hover:text-blue-700"
                @click.stop="handleEdit(article)"
              />
              <DeleteIcon
                class="w-5 h-5 text-red-500 cursor-pointer hover:text-red-700"
                @click.stop="handleDelete(article)"
              />
            </div>
          </template>
        </CustomCard>
      </div>
    </section>

    <!-- 不同尺寸 -->
    <section class="mb-8">
      <h3 class="text-xl font-semibold mb-4">
        不同尺寸
      </h3>
      <div class="flex flex-col gap-4">
        <CustomCard title="小尺寸卡片" size="small">
          这是一个小尺寸的卡片，适合展示简短信息。
        </CustomCard>

        <CustomCard title="中等尺寸卡片" size="medium">
          这是一个中等尺寸的卡片，默认尺寸，适用于大多数场景。
        </CustomCard>

        <CustomCard title="大尺寸卡片" size="large">
          这是一个大尺寸的卡片，提供更多的内边距，适合展示详细内容。
        </CustomCard>
      </div>
    </section>

    <!-- 特殊样式 -->
    <section class="mb-8">
      <h3 class="text-xl font-semibold mb-4">
        特殊样式
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- 无边框卡片 -->
        <CustomCard
          title="无边框卡片"
          :bordered="false"
          custom-class="bg-gradient-to-r from-purple-50 to-pink-50"
        >
          这个卡片没有边框，使用了自定义背景渐变色。
        </CustomCard>

        <!-- 固定阴影卡片 -->
        <CustomCard
          title="固定阴影卡片"
          :shadow="true"
          custom-class="border-l-4 border-l-blue-500"
        >
          这个卡片始终显示阴影，并且左侧有一个蓝色边框装饰。
        </CustomCard>
      </div>
    </section>

    <!-- 加载状态 -->
    <section class="mb-8">
      <h3 class="text-xl font-semibold mb-4">
        加载状态
      </h3>
      <CustomCard
        title="加载中的卡片"
        :loading="true"
        custom-class="h-48"
      >
        这个卡片正在加载内容...
      </CustomCard>
    </section>
  </div>
</template>

<style scoped>
.demo-container {
  max-width: 1200px;
  margin: 0 auto;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
