<script setup lang="ts">
import type { TreeNodeModel } from 'tdesign-vue-next'
import type { PropType } from 'vue'
import type { DNoteFormMode, IArticle } from '@/types/articleTypes'
import type { ICategory } from '@/types/categoryTypes'
import _ from 'lodash'
import { Button as TButton, Input as TInput, Option as TOption, Select as TSelect, Tag as TTag } from 'tdesign-vue-next'
import { computed, ref, watch, watchEffect } from 'vue'
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
  <div class="p-4 flex flex-col h-full overflow-hidden items-center">
    <div class="head-bar flex justify-between items-center overflow-hidden" :class="isPreview ? 'w-80%' : 'w-full'">
      <div v-show="isShowBack" class="left cursor-pointer flex items-center hover:c-font-hover" @click="close">
        <DoubleLeft class="w-6 h-6" />
        <span>工作台</span>
      </div>
      <div class="mid flex-1 flex items-center justify-between gap-2 overflow-hidden" :class="{ 'm-x-4': isShowBack, 'm-r-4': !isShowBack }">
        <template v-if="isPreview">
          <TTag variant="light" :theme="article.type === 'NOTE' ? 'primary' : 'success'">
            {{ article?.type ? articleTypeValueToText[article.type] : '' }}
          </TTag>
          <TTag variant="light" :theme="article.status === 'ACTIVE' ? 'success' : 'primary'">
            {{ article?.status ? articleStatusValueToText[article.status] : '' }}
          </TTag>
          <TTag v-if="article.is_shared" variant="light" theme="success">
            已分享
          </TTag>
          <div class="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-center font-bold">
            {{ article.title }}
          </div>
        </template>
        <template v-else>
          <TSelect v-model="article.type" placeholder="请选择类别" :borderless="true" style="width: fit-content;">
            <TOption v-for="item in EArticleType" :key="item.value" :value="item.value" :label="item.label" />
          </TSelect>
          <TInput
            v-model="article.title" placeholder="笔记标题" :readonly="isPreview" maxlength="100"
            :show-limit-number="false" style="min-width: 160px;"
          />
        </template>
      </div>
      <div v-if="!isPreview" class="right">
        <TButton theme="primary" :loading="savingLoading" @click="saveArticle">
          保存
        </TButton>
      </div>
    </div>
    <!-- <ScrollBar class="flex-1 m-t-4 overflow-hidden">
      <Editor
        v-model="article.content" :is-preview="isPreview" class="p-4 h-full!"
        :editor-config="{ disabled: savingLoading && isPreview }"
      />
    </ScrollBar> -->
    <div v-if="isLoading" class="flex-1 m-t-4 rounded-xl w-80% bg-background-white">
      <div class="flex items-center justify-center w-full h-full ">
        <div class="flex items-center gap-2 text-primary-50 text-sm">
          <div class="w-2 h-2 rounded-full bg-primary-50 animate-bounce" />
          <div class="w-2 h-2 rounded-full bg-primary-50 animate-bounce" style="animation-delay: 0.2s" />
          <div class="w-2 h-2 rounded-full bg-primary-50 animate-bounce" style="animation-delay: 0.4s" />
          <span>内容加载中...</span>
        </div>
      </div>
    </div>
    <Editor
      v-else
      v-model="article.content" :is-preview="isPreview" class="flex-1 m-t-4 p-x-6 p-y-4 rounded-xl"
      :editor-config="{ disabled: savingLoading && isPreview }"
    />
  </div>
</template>

<style scoped>
/* :deep(.simplebar-content-wrapper) {
  height: 100% !important;
  overflow: hidden !important;
}

:deep(.simplebar-content) {
  height: 100% !important;
  overflow: hidden !important;
} */
/* :deep(.t-select__wrap) {
  width: 150px;
} */
</style>
