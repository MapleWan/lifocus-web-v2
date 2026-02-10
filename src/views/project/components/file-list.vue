<script setup lang="ts">
import type { TreeNodeModel } from 'tdesign-vue-next'
import type { IArticle, IArticleFilter } from '@/types/articleTypes'
import type { ICategory } from '@/types/categoryTypes'
import { useInfiniteScroll } from '@vueuse/core'
import dayjs from 'dayjs'

import { Card as TCard, Popconfirm as TPopconfirm, Skeleton as TSkeleton, Tag as TTag } from 'tdesign-vue-next'
import { computed, onMounted, ref, watch } from 'vue'
import { deleteArticleApi, getArticleListApi } from '@/api/article'
import DeleteIcon from '@/assets/svg/delete.svg'
import EditIcon from '@/assets/svg/edit.svg'
import CustomCard from '@/components/CustomCard/index.vue'
import { useTdMessage } from '@/hooks/useTdMessage'
import { EArticleStatus, EArticleType } from '@/utils/enums/articleEnum'

const props = defineProps<{
  currentNode: TreeNodeModel<ICategory> | undefined
}>()

const emits = defineEmits(['viewArticle', 'editArticle'])

const tdMessage = useTdMessage()

const fileListRef = ref<HTMLElement | null>()

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

const articleList = ref<IArticle[]>([]) // 文章列表
const currentPageNo = ref<number>(1) // 当前页码
const currentPageSize = ref<number>(10) // 每页大小
const currentTotal = ref<number>(0) // 总数

// 是否有更多内容
const hasMore = computed(() => {
  return (currentPageNo.value - 1) * currentPageSize.value < currentTotal.value
})

const isLoading = ref<boolean>(false) // 是否正在加载

// 获取文章列表(分页)
function getArticleList() {
  if (isLoading.value)
    return
  isLoading.value = true
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
  }).finally(() => {
    isLoading.value = false
  })
}

function refresh() {
  articleList.value = []
  currentPageNo.value = 1
  currentPageSize.value = 10
  currentTotal.value = 0
  getArticleList()
}

// 监听当前节点变化，重新获取文章列表
watch(() => props.currentNode, () => {
  console.log(props.currentNode, '------------')
  refresh()
})

// 监听滚动加载更多
useInfiniteScroll(
  fileListRef,
  () => {
    // load more
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

// 处理文章点击
function viewArticle(article: IArticle) {
  emits('viewArticle', article)
}

function editArticle(article: IArticle) {
  emits('editArticle', article)
}

function deleteArticle(article: IArticle) {
  deleteArticleApi(article.id, {
    category_full_path: props.currentNode?.data.full_path || '',
  }).then((res) => {
    if (res.code === 200) {
      tdMessage.success('删除成功')
      refresh()
    }
    else {
      tdMessage.error('删除失败')
    }
  }).catch((err) => {
    console.error(err)
    tdMessage.error('删除失败')
  })
}

defineExpose({
  refresh,
})

onMounted(() => {
  getArticleList()
})
</script>

<template>
  <div ref="fileListRef" class="p-t-1 h-full overflow-auto custom-scrollbar">
    <TSkeleton :loading="isLoading && articleList.length === 0" animation="gradient" theme="paragraph">
      <div v-if="articleList.length" class="file-list">
        <template v-for="article in articleList" :key="article.id">
          <CustomCard :title="article.title" hover-shadow class="cursor-pointer" clickable @click="viewArticle(article)">
            <template #actions>
              <div class="flex items-center gap-2">
                <EditIcon class="text-primary-40 w-4 h-4 cursor-pointer hover:text-primary-100" @click.stop="editArticle(article)" />
                <TPopconfirm content="确定要删除吗？" @confirm="deleteArticle(article)">
                  <DeleteIcon class="text-primary-40 w-4 h-4 cursor-pointer hover:text-primary-100" />
                </TPopconfirm>
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
                {{ dayjs(article.update_time).format('YY-MM-DD HH:mm:ss') }}
              </div>
            </div>
          </CustomCard>
        </template>
      </div>
      <div v-else class="flex flex-col items-center gap-2">
        <div class="text-center text-primary-30 text-sm">
          暂无数据
        </div>
      </div>
      <div v-if="hasMore" class="flex justify-center items-center py-4">
        <div class="flex items-center gap-2 text-primary-50 text-sm">
          <div class="w-2 h-2 rounded-full bg-primary-50 animate-bounce" />
          <div class="w-2 h-2 rounded-full bg-primary-50 animate-bounce" style="animation-delay: 0.2s" />
          <div class="w-2 h-2 rounded-full bg-primary-50 animate-bounce" style="animation-delay: 0.4s" />
          <span>滚动加载更多内容...</span>
        </div>
      </div>
    </TSkeleton>
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
