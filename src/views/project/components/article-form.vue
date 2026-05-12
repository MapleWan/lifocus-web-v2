<script setup lang="ts">
import type { TreeNodeModel } from 'tdesign-vue-next'
import type { PropType } from 'vue'
import type { DNoteFormMode, IArticle } from '@/types/articleTypes'
import type { ICategory } from '@/types/categoryTypes'
import dayjs from 'dayjs'
import _ from 'lodash'
import { Button as TButton, Input as TInput, Option as TOption, Select as TSelect, Tag as TTag } from 'tdesign-vue-next'
import { computed, ref, watchEffect } from 'vue'
import { createArticleApi, getArticleByIdApi, updateArticleApi } from '@/api/article'
import DoubleLeft from '@/assets/svg/doubleLeft.svg'
import Editor from '@/components/Editor/index.vue'

import { useTdMessage } from '@/hooks/useTdMessage'
import { EArticleStatus, EArticleType } from '@/utils/enums/articleEnum'

const props = defineProps({
  mode: {
    type: String as PropType<DNoteFormMode>,
    default: () => 'add', // add, view, edit
  },
  articleInfo: {
    type: Object as (PropType<IArticle> | null),
    default: () => ({
      type: 'NOTE',
      title: '',
      content: '',
    }),
  },
  isShowBack: {
    type: Boolean,
    default: true,
  },
  currentNode: {
    type: Object as PropType<TreeNodeModel<ICategory>>,
    default: () => null,
  },
})

const emits = defineEmits(['close'])

// 文章类型值转文本
const articleTypeValueToText = EArticleType.reduce((acc, cur) => {
  acc[cur.value] = cur.label
  return acc
}, {} as Record<string, string>)

// 文章状态值转文本
const articleStatusValueToText = EArticleStatus.reduce((acc, cur) => {
  acc[cur.value] = cur.label
  return acc
}, {} as Record<string, string>)

const tdMessage = useTdMessage()

const isPreview = computed(() => props.mode === 'view')
const modeLabel = computed(() => {
  switch (props.mode) {
    case 'add': return 'Create'
    case 'edit': return 'Edit'
    case 'view': return 'Reading'
    default: return ''
  }
})
const article = ref<Partial<IArticle>>(props.articleInfo)
const savingLoading = ref(false)
const isLoading = ref(false)

// 节流根据文章 id 获取文章详情
const getArticleByIdDebounce = _.debounce(() => {
  isLoading.value = true
  getArticleByIdApi(props.articleInfo.id).then((res) => {
    if (res.code === 200) {
      article.value = res.data
    }
  }).catch((error: any) => {
    console.error(error)
  }).finally(() => {
    isLoading.value = false
  })
}, 100)
watchEffect(() => {
  if (props.mode !== 'add' && props.articleInfo.id && !props.articleInfo.content) {
    getArticleByIdDebounce()
  }
})

function resetArticle() {
  article.value = {
    type: 'NOTE',
    title: '',
    content: '',
  }
}

const isRefresh = ref(false) // 关闭时是否需要刷新

function close() {
  if (props.mode !== 'add')
    resetArticle()
  emits('close', isRefresh.value)
}

function saveArticle() {
  if (!article.value.title)
    return tdMessage.warning('请输入标题')
  if (!article.value.content)
    return tdMessage.warning('请输入内容')
  if (article.value.id) {
    updateArticleApi(article.value.id, {
      category_id: props.currentNode?.value ? String(props.currentNode.value) : '',
      category_full_path: String(props.currentNode.data.full_path),
      type: article.value?.type,
      status: 'ACTIVE',
      title: article.value.title,
      content: article.value.content,
    }).then((res) => {
      if (res.code === 200) {
        tdMessage.success('保存成功')
        isRefresh.value = true
      }
    }).catch((error: any) => {
      console.error(error)
      tdMessage.error(error?.message || '保存失败')
    })
  }
  else {
    createArticleApi({
      category_id: props.currentNode?.value ? String(props.currentNode.value) : '',
      category_full_path: String(props.currentNode.data.full_path),
      type: article.value?.type || 'NOTE',
      status: 'ACTIVE',
      title: article.value.title,
      content: article.value.content,
    }).then((res) => {
      if (res.code === 200) {
        tdMessage.success('保存成功')
        isRefresh.value = true
        resetArticle()
        close()
      }
    }).catch((error: any) => {
      console.error(error)
      tdMessage.error(error?.message || '保存失败')
    })
  }
}
</script>

<template>
  <div class="article-form">
    <!-- Top bar -->
    <header class="form-topbar" :class="isPreview ? 'is-view' : 'is-edit'">
      <button v-show="isShowBack" class="back-btn" type="button" @click="close">
        <DoubleLeft />
        <span>工作台</span>
      </button>

      <div class="topbar-center">
        <template v-if="isPreview">
          <span class="mode-eyebrow">{{ modeLabel }}</span>
          <div class="view-tags">
            <TTag variant="light" :theme="article.type === 'NOTE' ? 'primary' : 'success'" size="small">
              {{ article?.type ? articleTypeValueToText[article.type] : '' }}
            </TTag>
            <TTag variant="light-outline" :theme="article.status === 'ACTIVE' ? 'success' : 'primary'" size="small">
              {{ article?.status ? articleStatusValueToText[article.status] : '' }}
            </TTag>
            <TTag v-if="article.is_shared" variant="light" theme="success" size="small">
              已分享
            </TTag>
          </div>
          <h2 class="view-title" :title="article.title">
            {{ article.title }}
          </h2>
        </template>
        <template v-else>
          <span class="mode-eyebrow">{{ modeLabel }}</span>
          <TSelect v-model="article.type" class="type-select" placeholder="类别" :borderless="true">
            <TOption v-for="item in EArticleType" :key="item.value" :value="item.value" :label="item.label" />
          </TSelect>
          <TInput
            v-model="article.title"
            class="title-input"
            placeholder="给笔记一个标题..."
            maxlength="100"
            :show-limit-number="false"
          />
        </template>
      </div>

      <div class="topbar-right">
        <template v-if="isPreview">
          <div class="view-meta">
            <span v-if="article.category?.name" class="view-meta-cat" :title="article.category.name">
              {{ article.category.name }}
            </span>
            <span v-if="article.update_time" class="view-meta-time">
              {{ dayjs(article.update_time).format('YY-MM-DD HH:mm') }}
            </span>
          </div>
        </template>
        <TButton v-else class="save-btn" theme="primary" :loading="savingLoading" @click="saveArticle">
          保存
        </TButton>
      </div>
    </header>

    <!-- Body -->
    <div v-if="isLoading" class="editor-shell is-loading" :class="{ 'is-view': isPreview }">
      <div class="loading-content">
        <div class="loading-dot" />
        <div class="loading-dot" style="animation-delay: 0.15s" />
        <div class="loading-dot" style="animation-delay: 0.3s" />
        <span>内容加载中...</span>
      </div>
    </div>
    <div v-else class="editor-shell" :class="{ 'is-view': isPreview }">
      <Editor
        v-model="article.content"
        :is-preview="isPreview"
        class="editor-inner"
        :editor-config="{ disabled: savingLoading && isPreview }"
      />
    </div>
  </div>
</template>

<style scoped>
.article-form {
  position: absolute;
  inset: 0;
  z-index: 5;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  width: 100%;
  height: 100%;
  padding: 18px 22px 20px;
  overflow: hidden;
  background:
    radial-gradient(800px 300px at 0% -8%, rgba(61, 34, 102, 0.08), transparent 60%),
    radial-gradient(800px 300px at 110% 110%, rgba(67, 123, 112, 0.1), transparent 60%),
    linear-gradient(135deg, #fafafc, #f2f6f5);
}

/* ============ top bar ============ */
.form-topbar {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 8px 14px;
  border: 1px solid rgba(80, 54, 109, 0.08);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.85);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.6),
    0 6px 18px rgba(45, 25, 76, 0.05);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.form-topbar.is-view {
  width: min(82%, 1080px);
}

.back-btn {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 32px;
  padding: 0 12px 0 8px;
  border: 1px solid rgba(80, 54, 109, 0.1);
  border-radius: 8px;
  background: #fff;
  color: rgba(29, 17, 50, 0.75);
  cursor: pointer;
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  transition: border-color 0.2s ease, background-color 0.2s ease, color 0.2s ease, transform 0.2s ease;
}

.back-btn:hover {
  color: #3d2266;
  border-color: rgba(67, 123, 112, 0.3);
  background: #f4f8f7;
  transform: translateX(-2px);
}

.back-btn svg {
  width: 16px;
  height: 16px;
}

.topbar-center {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  overflow: hidden;
}

.mode-eyebrow {
  flex: 0 0 auto;
  padding: 2px 8px;
  border-radius: 999px;
  background: linear-gradient(135deg, rgba(61, 34, 102, 0.08), rgba(67, 123, 112, 0.08));
  color: #3d2266;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.view-tags {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.view-title {
  flex: 1;
  min-width: 0;
  margin: 0;
  color: #1d1132;
  font-size: 16px;
  font-weight: 800;
  line-height: 1.3;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.type-select {
  flex: 0 0 auto;
  width: 92px;
}

.type-select :deep(.t-input),
.type-select :deep(.t-input:hover),
.type-select :deep(.t-input.t-is-focused) {
  min-width: 0 !important;
  padding: 0 6px !important;
  border: 1px solid rgba(80, 54, 109, 0.1) !important;
  border-radius: 8px !important;
  box-shadow: none !important;
  background: #fff !important;
}

.title-input {
  flex: 1;
  min-width: 0;
}

.title-input :deep(.t-input) {
  border: 1px solid rgba(80, 54, 109, 0.1);
  border-radius: 8px;
  background: #fff;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.title-input :deep(.t-input.t-is-focused) {
  border-color: rgba(67, 123, 112, 0.4);
  box-shadow: 0 0 0 3px rgba(67, 123, 112, 0.1);
}

.title-input :deep(.t-input__inner) {
  color: #1d1132;
  font-size: 14px;
  font-weight: 700;
}

.topbar-right {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 8px;
}

.view-meta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: rgba(29, 17, 50, 0.55);
  font-size: 12px;
  font-weight: 600;
}

.view-meta-cat {
  max-width: 140px;
  overflow: hidden;
  color: #437b70;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.view-meta-cat::before {
  content: '#';
  margin-right: 2px;
  color: #5b8f5a;
  font-weight: 800;
}

.view-meta-time {
  font-variant-numeric: tabular-nums;
}

/* save button - brand gradient */
.save-btn {
  min-width: 88px;
  height: 34px;
  border-radius: 8px !important;
  background: linear-gradient(135deg, #3d2266, #437b70) !important;
  border-color: transparent !important;
  font-weight: 800 !important;
  box-shadow: 0 6px 16px rgba(61, 34, 102, 0.22);
  transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease !important;
}

.save-btn:hover {
  filter: brightness(1.06);
  box-shadow: 0 10px 22px rgba(61, 34, 102, 0.28);
  transform: translateY(-1px);
}

/* ============ editor shell ============ */
.editor-shell {
  flex: 1;
  min-height: 0;
  width: 100%;
  border: 1px solid rgba(80, 54, 109, 0.08);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.6),
    0 10px 28px rgba(45, 25, 76, 0.06);
  overflow: hidden;
}

.editor-shell.is-view {
  width: min(82%, 1080px);
}

.editor-inner {
  width: 100%;
  height: 100%;
  padding: 16px 24px;
}

/* loading state */
.editor-shell.is-loading {
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-content {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #3d2266;
  font-size: 13px;
  font-weight: 700;
}

.loading-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3d2266, #437b70);
  animation: loading-bounce 0.9s ease-in-out infinite;
}

@keyframes loading-bounce {
  0%, 100% { transform: translateY(0); opacity: 0.55; }
  50% { transform: translateY(-6px); opacity: 1; }
}

/* responsive */
@media (max-width: 900px) {
  .form-topbar.is-view,
  .editor-shell.is-view {
    width: 100%;
  }

  .view-title {
    font-size: 14px;
  }

  .view-meta {
    display: none;
  }
}
</style>
