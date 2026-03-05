<script setup lang="ts">
import type { TreeNodeModel } from 'tdesign-vue-next'
import type { IArticle, IArticleFilter } from '@/types/articleTypes'
import type { ICategory } from '@/types/categoryTypes'
import { useClipboard, useInfiniteScroll } from '@vueuse/core'
import dayjs from 'dayjs'

import { Input as TInput, Popconfirm as TPopconfirm, Popup as TPopup, Skeleton as TSkeleton, Tag as TTag } from 'tdesign-vue-next'
import { computed, onMounted, ref, watch } from 'vue'
import { deleteArticleApi, getArticleListApi, updateArticleApi } from '@/api/article'
import CancelShare from '@/assets/svg/cancelShare.svg'
import CopyIcon from '@/assets/svg/copy.svg'
import DeleteIcon from '@/assets/svg/delete.svg'
import EditIcon from '@/assets/svg/edit.svg'
import ShareIcon from '@/assets/svg/share.svg'
import CustomCard from '@/components/CustomCard/index.vue'
import { useTdMessage } from '@/hooks/useTdMessage'
import { EArticleStatus, EArticleType } from '@/utils/enums/articleEnum'

const props = defineProps<{
  currentNode: TreeNodeModel<ICategory> | undefined
}>()

const emits = defineEmits(['viewArticle', 'editArticle'])

const tdMessage = useTdMessage()

const { copy, isSupported } = useClipboard()

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
function getArticleList(searchParams: {
  title?: string
  order_by?: keyof IArticle
  order_direction?: 'asc' | 'desc'
} = {
  title: '',
  order_by: 'update_time',
  order_direction: 'desc',
}) {
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
  getArticleListApi({ ...params, ...searchParams }).then((res) => {
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

function search(searchParams: {
  title?: string
  order_by?: keyof IArticle
  order_direction?: 'asc' | 'desc'
}) {
  articleList.value = []
  currentPageNo.value = 1
  currentPageSize.value = 10
  currentTotal.value = 0
  getArticleList(searchParams)
}

// 监听当前节点变化，重新获取文章列表
watch(() => props.currentNode, () => {
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

// 分享文章处理逻辑
const sharePassword = ref('')

// 取消分享文章处理逻辑
function cancelShareArticle(article: IArticle) {
  sharePassword.value = ''
  updateArticleApi(article.id, {
    category_id: props.currentNode?.value ? String(props.currentNode.value) : '',
    category_full_path: props.currentNode?.data.full_path || '',
    is_shared: false,
    share_password: '',
  }).then((res) => {
    if (res.code === 200) {
      tdMessage.success('取消分享成功')
      refresh()
    }
    else {
      tdMessage.error('取消分享失败')
    }
  }).catch((err) => {
    console.error(err)
    tdMessage.error('取消分享失败')
  })
}

function shareArticle(article: IArticle) {
  updateArticleApi(article.id, {
    category_id: props.currentNode?.value ? String(props.currentNode.value) : '',
    category_full_path: props.currentNode?.data.full_path || '',
    is_shared: true,
    share_password: sharePassword.value,
  }).then((res) => {
    if (res.code === 200) {
      tdMessage.success('分享成功')
      refresh()
    }
    else {
      tdMessage.error('分享失败')
    }
  }).catch((err) => {
    console.error(err)
    tdMessage.error('分享失败')
  }).finally(() => {
    sharePassword.value = ''
  })
}

// 复制分享链接
function copyShareLink(article: IArticle) {
  const baseUrl = window.location.origin
  const shareUrl = `${baseUrl}/share/${article.id}?pwd=${article.share_password || ''}`

  // 优先使用 VueUse 的 copy 方法
  if (isSupported.value) {
    copy(shareUrl).then(() => {
      tdMessage.success('分享链接已复制到剪贴板')
    }).catch(() => {
      fallbackCopy(shareUrl)
    })
  }
  else {
    // 降级方案：使用传统复制方法
    fallbackCopy(shareUrl)
  }
}

// 降级复制方法
function fallbackCopy(text: string) {
  const textArea = document.createElement('textarea')
  textArea.value = text
  textArea.style.position = 'fixed'
  textArea.style.top = '0'
  textArea.style.left = '0'
  textArea.style.width = '2em'
  textArea.style.height = '2em'
  textArea.style.padding = '0'
  textArea.style.border = 'none'
  textArea.style.outline = 'none'
  textArea.style.boxShadow = 'none'
  textArea.style.background = 'transparent'
  textArea.style.opacity = '0'

  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()

  try {
    const successful = document.execCommand('copy')
    if (successful) {
      tdMessage.success('分享链接已复制到剪贴板')
    }
    else {
      tdMessage.error('复制失败，请手动复制链接')
    }
  }
  catch (err) {
    console.error('复制失败:', err)
    tdMessage.error('复制失败，请手动复制链接')
  }
  finally {
    document.body.removeChild(textArea)
  }
}

defineExpose({
  refresh,
  search,
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

                <template v-if="article.is_shared">
                  <CopyIcon
                    v-tooltip="{ content: '复制分享链接', placement: 'top' }"
                    class="text-primary-40 w-4 h-4 cursor-pointer hover:text-primary-100"
                    @click.stop="copyShareLink(article)"
                  />
                  <TPopconfirm content="确定要取消分享吗？" @confirm="cancelShareArticle(article)">
                    <CancelShare class="text-primary-40 w-4 h-4 cursor-pointer hover:text-primary-100" />
                  </TPopconfirm>
                </template>
                <TPopup v-else trigger="click">
                  <ShareIcon class="text-primary-40 w-4 h-4 cursor-pointer hover:text-primary-100" />
                  <template #content>
                    <div class="p-2 flex flex-col gap-2">
                      <div class="font-bold">
                        分享文章
                      </div>
                      <div class="flex gap-2">
                        <TInput
                          v-model="sharePassword"
                          type="password"
                          :placeholder="article.is_shared ? '分享密码（可选）' : '修改密码'"
                          style="width: 200px; margin-left: 20px;"
                        />
                        <TButton @click="shareArticle(article)">
                          确认
                        </TButton>
                      </div>
                    </div>
                  </template>
                </TPopup>
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
              <div class="text-sm text-gray-500 text-overflow m-x-2" :title="article.category.name">
                {{ article.category.name }}
              </div>
              <div class="text-sm text-gray-500 text-overflow" :title="dayjs(article.update_time).format('YY-MM-DD HH:mm')">
                {{ dayjs(article.update_time).format('YY-MM-DD HH:mm') }}
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
