<script setup lang="ts">
import type { TreeNodeModel } from 'tdesign-vue-next'
import type { IArticle, IArticleFilter } from '@/types/articleTypes'
import { useInfiniteScroll } from '@vueuse/core'
import dayjs from 'dayjs'
import { Card as TCard, Tag as TTag } from 'tdesign-vue-next'

import { computed, onMounted, ref, watch } from 'vue'
import { getArticleListApi } from '@/api/article'
import DeleteIcon from '@/assets/svg/delete.svg'
import EditIcon from '@/assets/svg/edit.svg'
import { EArticleStatus, EArticleType } from '@/utils/enums/articleEnum'

const props = defineProps<{
  currentNode: TreeNodeModel | null
}>()

const fileListRef = ref<HTMLElement | null>()

const articleTypeValueToText = EArticleType.reduce((acc, cur) => {
  acc[cur.value] = cur.label
  return acc
}, {} as Record<string, string>)

const articleStatusValueToText = EArticleStatus.reduce((acc, cur) => {
  acc[cur.value] = cur.label
  return acc
}, {} as Record<string, string>)

const articleList = ref<IArticle[]>([])
const currentPageNo = ref<number>(1)
const currentPageSize = ref<number>(10)
const currentTotal = ref<number>(0)

const hasMore = computed(() => {
  return currentPageNo.value * currentPageSize.value < currentTotal.value
})
function getArticleList() {
  const params: IArticleFilter = {
    page_no: currentPageNo.value,
    page_size: currentPageSize.value,
  }
  if (props?.currentNode?.value) {
    params.category_id = props.currentNode.value
  }
  getArticleListApi(params).then((res) => {
    currentPageNo.value = res?.data?.page_no + 1
    currentPageSize.value = res?.data?.page_size || 2
    currentTotal.value = res?.data?.total || 0
    articleList.value = articleList.value.concat(res?.data?.data || [])
  })
}

watch(() => props.currentNode, () => {
  console.log(props.currentNode, 'currentNode')
  articleList.value = []
  currentPageNo.value = 1
  currentPageSize.value = 10
  currentTotal.value = 0
  getArticleList()
})

watch(hasMore, (newValue) => {
  console.log('hasMore', newValue)
})

useInfiniteScroll(
  fileListRef,
  () => {
    // load more
    console.log('load more')
    getArticleList()
  },
  {
    distance: 10,
    canLoadMore: () => {
      // inidicate when there is no more content to load so onLoadMore stops triggering
      // if (noMoreContent) return false
      return hasMore.value // for demo purposes
    },
  },
)

onMounted(() => {
  getArticleList()
})
</script>

<template>
  <div ref="fileListRef" class="p-t-1 h-full overflow-auto custom-scrollbar">
    <div class="file-list">
      <template v-for="article in articleList" :key="article.id">
        <TCard :title="article.title" hover-shadow class="cursor-pointer">
          <template #actions>
            <div class="flex items-center gap-2">
              <EditIcon class="c-primary-100 w-4 h-4 cursor-pointer hover:text-primary-50" />
              <DeleteIcon class="c-primary-100 w-4 h-4 cursor-pointer hover:text-primary-50" />
            </div>
          </template>
          <div class="flex justify-between items-center">
            <div class="gap-2 flex">
              <TTag variant="light" :theme="article.type === 'NOTE' ? 'primary' : 'success'">
                {{ articleTypeValueToText[article.type] }}
              </TTag>
              <TTag variant="light" :theme="article.status === 'ACTIVE' ? 'success' : 'primary'">
                {{ articleStatusValueToText[article.status] }}
              </TTag>
            </div>
            <div class="text-sm text-gray-500">
              {{ dayjs(article.update_time).format('YY-MM-DD HH:mm') }}
            </div>
          </div>
        </TCard>
      </template>
    </div>
    <div v-if="hasMore" class="flex justify-center items-center py-4">
      <div class="flex items-center gap-2 text-primary-50 text-sm">
        <div class="w-2 h-2 rounded-full bg-primary-50 animate-bounce" />
        <div class="w-2 h-2 rounded-full bg-primary-50 animate-bounce" style="animation-delay: 0.2s" />
        <div class="w-2 h-2 rounded-full bg-primary-50 animate-bounce" style="animation-delay: 0.4s" />
        <span>加载更多内容...</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.file-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

/* 卡片悬停增强效果 */
:deep(.t-card) {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 12px;
  overflow: hidden;
}

:deep(.t-card:hover) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
}

/* 自定义滚动条样式 */
.custom-scrollbar {
  /* Webkit browsers (Chrome, Safari, Edge) */
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #d9d9d9, #bfbfbf);
    border-radius: 4px;
    border: 2px solid transparent;
    background-clip: content-box;
    transition: all 0.3s ease;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, #bfbfbf, #a6a6a6);
    border: 1px solid transparent;
  }

  &::-webkit-scrollbar-corner {
    background: transparent;
  }

  /* Firefox 滚动条样式 */
  scrollbar-width: thin;
  scrollbar-color: #d9d9d9 transparent;

  /* 滚动时的平滑效果 */
  scroll-behavior: smooth;
}
</style>
