<script setup lang="ts">
import type { TreeNodeModel } from 'tdesign-vue-next'
import type { PropType } from 'vue'
import type { DNoteFormMode, IArticle } from '@/types/articleTypes'
import type { ICategory } from '@/types/categoryTypes'
import { Button as TButton, Input as TInput, Option as TOption, Select as TSelect, Tag as TTag } from 'tdesign-vue-next'
import { computed, ref, watch } from 'vue'
import { createArticleApi, getArticleByIdApi } from '@/api/article'
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
watch(() => props.articleInfo, (articleInfo) => {
  article.value = { ...articleInfo }

  if (article.value?.id && !article.value.content) {
    getArticleByIdApi(article.value.id).then((res) => {
      if (res.code === 200) {
        article.value = res.data
      }
    })
  }
})

function resetArticle() {
  article.value = {
    type: 'NOTE',
    title: '',
    content: '',
  }
}

function close(isNeedRefresh: boolean = false) {
  if (props.mode !== 'add')
    resetArticle()
  emits('close', isNeedRefresh)
}

function saveArticle() {
  if (!article.value.title)
    return tdMessage.warning('请输入标题')
  if (!article.value.content)
    return tdMessage.warning('请输入内容')
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
      resetArticle()
      close(true)
    }
  }).catch((error: any) => {
    console.error(error)
    tdMessage.error('保存失败')
  })
}
</script>

<template>
  <div class="p-4 flex flex-col h-full overflow-hidden items-center">
    <div class="head-bar flex justify-between items-center overflow-hidden" :class="isPreview ? 'w-80%' : 'w-full'">
      <div v-show="isShowBack" class="left cursor-pointer flex items-center hover:c-font-hover" @click="close(false)">
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

    <Editor
      v-model="article.content" :is-preview="isPreview" class="flex-1 m-t-4 p-4 rounded-xl"
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
