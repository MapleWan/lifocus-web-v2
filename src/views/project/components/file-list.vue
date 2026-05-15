<script setup lang="ts">
import type { TreeNodeModel } from 'tdesign-vue-next'
import type { IArticle, IArticleFilter } from '@/types/articleTypes'
import type { ICategory } from '@/types/categoryTypes'
import { useClipboard, useInfiniteScroll } from '@vueuse/core'
import dayjs from 'dayjs'

import { Button as TButton, Input as TInput, Popconfirm as TPopconfirm, Popup as TPopup, Skeleton as TSkeleton, Tag as TTag } from 'tdesign-vue-next'
import { computed, onMounted, ref, watch } from 'vue'
import { deleteArticleApi, getArticleListApi, updateArticleApi } from '@/api/article'
import CancelShare from '@/assets/svg/cancelShare.svg'
import CopyIcon from '@/assets/svg/copy.svg'
import DeleteIcon from '@/assets/svg/delete.svg'
import EditIcon from '@/assets/svg/edit.svg'
import NoDataIcon from '@/assets/svg/noData.svg'
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
  <div ref="fileListRef" class="file-list-scroll">
    <TSkeleton :loading="isLoading && articleList.length === 0" animation="gradient" theme="paragraph">
      <div v-if="articleList.length" class="file-grid">
        <template v-for="article in articleList" :key="article.id">
          <CustomCard :title="article.title" hover-shadow class="note-card" clickable @click="viewArticle(article)">
            <template #actions>
              <div class="note-actions">
                <button class="action-icon" title="编辑" @click.stop="editArticle(article)">
                  <EditIcon />
                </button>
                <TPopconfirm content="确定要删除吗？" @confirm="deleteArticle(article)">
                  <button class="action-icon action-icon-danger" title="删除" @click.stop>
                    <DeleteIcon />
                  </button>
                </TPopconfirm>

                <template v-if="article.is_shared">
                  <TPopup content="复制分享链接" placement="top">
                    <button
                      class="action-icon action-icon-accent"
                      title="复制链接"
                      @click.stop="copyShareLink(article)"
                    >
                      <CopyIcon />
                    </button>
                  </TPopup>
                  <TPopconfirm content="确定要取消分享吗？" @confirm="cancelShareArticle(article)">
                    <button class="action-icon" title="取消分享" @click.stop>
                      <CancelShare />
                    </button>
                  </TPopconfirm>
                </template>
                <TPopup v-else trigger="click">
                  <button class="action-icon action-icon-accent" title="分享" @click.stop>
                    <ShareIcon />
                  </button>
                  <template #content>
                    <div class="share-popup">
                      <div class="share-popup-title">
                        分享文章
                      </div>
                      <div class="share-popup-row">
                        <TInput v-model="sharePassword" type="password" placeholder="分享密码（可选）" />
                        <TButton theme="primary" @click="shareArticle(article)">
                          确认
                        </TButton>
                      </div>
                    </div>
                  </template>
                </TPopup>
              </div>
            </template>

            <div class="note-meta">
              <div class="note-tags">
                <TTag variant="light" :theme="article.type === 'NOTE' ? 'primary' : 'success'" size="small">
                  {{ articleTypeValueToText[article.type] }}
                </TTag>
                <TTag variant="light-outline" :theme="article.status === 'ACTIVE' ? 'success' : 'primary'" size="small">
                  {{ articleStatusValueToText[article.status] }}
                </TTag>
                <span v-if="article.is_shared" class="share-flag">
                  <ShareIcon />
                  <span>已分享</span>
                </span>
              </div>
              <div class="note-foot">
                <span class="note-cat" :title="article.category.name">
                  {{ article.category.name }}
                </span>
                <span class="note-time" :title="dayjs(article.update_time).format('YYYY-MM-DD HH:mm')">
                  {{ dayjs(article.update_time).format('YY-MM-DD HH:mm') }}
                </span>
              </div>
            </div>
          </CustomCard>
        </template>
      </div>

      <div v-else class="empty-state">
        <NoDataIcon class="empty-illus" />
        <p class="empty-title">
          暂无文章
        </p>
        <p class="empty-hint">
          点击右上角「新建文章」开始记录
        </p>
      </div>

      <div v-if="hasMore" class="loading-more">
        <div class="load-dot" />
        <div class="load-dot" style="animation-delay: 0.15s" />
        <div class="load-dot" style="animation-delay: 0.3s" />
        <span>滚动加载更多</span>
      </div>
    </TSkeleton>
  </div>
</template>

<style scoped>
.file-list-scroll {
  height: 100%;
  padding: 4px 2px 4px 0;
  overflow-y: auto;
  overflow-x: hidden;
}

.file-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 14px;
  padding: 2px;
}

/* ====== card shell ====== */
.note-card :deep(.lf-card) {
  border: 1px solid rgba(80, 54, 109, 0.1);
  border-radius: 12px;
  background: #fff;
  overflow: hidden;
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.6) inset;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.note-card :deep(.lf-card:hover) {
  border-color: rgba(67, 123, 112, 0.3);
  box-shadow: 0 14px 28px rgba(45, 25, 76, 0.08);
  transform: translateY(-2px);
}

.note-card :deep(.lf-card--hover-shadow) {
  transform: translateY(-2px);
  box-shadow: 0 14px 28px rgba(45, 25, 76, 0.08);
}

.note-card :deep(.lf-card__body) {
  padding: 14px 14px 12px;
}

.note-card :deep(.lf-card__header) {
  margin-bottom: 10px;
}

.note-card :deep(.lf-card__title) {
  margin-bottom: 0;
  color: #1d1132;
  font-size: 15px;
  font-weight: 800;
  line-height: 1.3;
}

/* accent line on hover */
.note-card :deep(.lf-card)::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #3d2266, #437b70, #5b8f5a);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.note-card :deep(.lf-card:hover)::before {
  opacity: 1;
}

/* ====== actions ====== */
.note-actions {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.action-icon {
  width: 26px;
  height: 26px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 1px solid transparent;
  border-radius: 7px;
  background: transparent;
  color: rgba(29, 17, 50, 0.5);
  cursor: pointer;
  transition: border-color 0.2s ease, background-color 0.2s ease, color 0.2s ease;
}

.action-icon svg {
  width: 13px;
  height: 13px;
}

.action-icon:hover {
  border-color: rgba(67, 123, 112, 0.3);
  background: #f4f8f7;
  color: #437b70;
}

.action-icon.action-icon-accent:hover {
  border-color: rgba(61, 34, 102, 0.3);
  background: #f5f1fb;
  color: #3d2266;
}

.action-icon.action-icon-danger:hover {
  border-color: rgba(168, 89, 90, 0.3);
  background: #fdf2f2;
  color: #a8595a;
}

/* ====== meta ====== */
.note-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.note-tags {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.share-flag {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  height: 22px;
  padding: 0 8px;
  border-radius: 4px;
  background: rgba(67, 123, 112, 0.1);
  color: #437b70;
  font-size: 11px;
  font-weight: 700;
}

.share-flag svg {
  width: 10px;
  height: 10px;
}

.note-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px dashed rgba(80, 54, 109, 0.1);
  color: rgba(29, 17, 50, 0.55);
  font-size: 11.5px;
}

.note-cat {
  min-width: 0;
  overflow: hidden;
  color: #437b70;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.note-cat::before {
  content: '#';
  margin-right: 2px;
  color: #5b8f5a;
  font-weight: 800;
}

.note-time {
  flex: 0 0 auto;
  color: rgba(29, 17, 50, 0.48);
  font-variant-numeric: tabular-nums;
}

/* ====== share popup ====== */
.share-popup {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 6px 4px;
  min-width: 260px;
}

.share-popup-title {
  color: #1d1132;
  font-size: 13px;
  font-weight: 800;
}

.share-popup-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ====== empty ====== */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 48px 20px;
}

.empty-illus {
  width: 180px;
  max-width: 50%;
  height: auto;
  opacity: 0.85;
}

.empty-title {
  margin: 4px 0 0;
  color: #1d1132;
  font-size: 14px;
  font-weight: 800;
}

.empty-hint {
  margin: 0;
  color: rgba(29, 17, 50, 0.5);
  font-size: 12.5px;
}

/* ====== loading more ====== */
.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 16px 0;
  color: rgba(61, 34, 102, 0.6);
  font-size: 12.5px;
  font-weight: 600;
}

.load-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3d2266, #437b70);
  animation: load-bounce 0.9s ease-in-out infinite;
}

@keyframes load-bounce {
  0%, 100% {
    transform: translateY(0);
    opacity: 0.55;
  }
  50% {
    transform: translateY(-5px);
    opacity: 1;
  }
}

/* ====== scrollbar ====== */
.file-list-scroll::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.file-list-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.file-list-scroll::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, rgba(61, 34, 102, 0.25), rgba(67, 123, 112, 0.25));
  border: 2px solid transparent;
  border-radius: 4px;
  background-clip: content-box;
  transition: background 0.2s ease;
}

.file-list-scroll::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, rgba(61, 34, 102, 0.45), rgba(67, 123, 112, 0.45));
  background-clip: content-box;
}
</style>
