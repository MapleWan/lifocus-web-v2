<script setup lang="ts">
import type { DropdownProps, TreeNodeModel, TreeProps } from 'tdesign-vue-next'
import type { DNoteFormMode, IArticle } from '@/types/articleTypes'
import type { ICategory, ICreateCategoryRequest } from '@/types/categoryTypes'
import { Button as TButton, Dropdown as TDropdown, DropdownItem as TDropdownItem, Input as TInput, Popconfirm as TPopconfirm, Popup as TPopup, Tree as TTree } from 'tdesign-vue-next'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { createCategoryApi, deleteCategoryApi, getCategoryListApi, updateCategoryApi } from '@/api/category'

import AddIcon from '@/assets/svg/add.svg'
import DeleteIcon from '@/assets/svg/delete.svg'
import EditIcon from '@/assets/svg/edit.svg'
import NoDataIcon from '@/assets/svg/noData.svg'
import SearchIcon from '@/assets/svg/search.svg'
import SortIcon from '@/assets/svg/sort.svg'
import { useTdMessage } from '@/hooks/useTdMessage'
import { useMainStore } from '@/stores/main'
import ArticleForm from './components/article-form.vue'
import FileList from './components/file-list.vue'

const mainStore = useMainStore()
const tdMessage = useTdMessage()
const categoryTreeData = ref<TreeProps['data']>([])
const fileListRef = ref()

const newNodeName = ref<string>('')
const currentNodeName = ref<string>('')
const currentNode = ref<TreeNodeModel<ICategory> | undefined>(undefined)
const treeActivedValue = ref()
const treeRef = ref()
const sortField = ref<'create_time' | 'update_time' | 'title'>('update_time')
const sortDirection = ref<'asc' | 'desc'>('desc')
const sortTips = computed(() => {
  const sortFieldToValue: Record<'create_time' | 'update_time' | 'title', string> = {
    create_time: '创建时间',
    update_time: '更新时间',
    title: '文章标题',
  }
  return `${sortFieldToValue[sortField.value]} ${sortDirection.value === 'asc' ? '⬆' : '⬇'}`
})

watch(() => mainStore.currentProjectId, () => {
  currentNode.value = undefined
  getCategoryList()
})

watch(() => treeActivedValue.value, () => {
  if (treeActivedValue.value.length && treeRef.value) {
    currentNode.value = treeRef.value.getItem(treeActivedValue.value[0])
  }
  else {
    currentNode.value = undefined
  }
})

function getCategoryList() {
  getCategoryListApi().then((res) => {
    categoryTreeData.value = res.data
    if (res.data.length) {
      treeActivedValue.value = [res.data[0]?.id]
      nextTick(() => {
        currentNode.value = treeRef.value.getItem(res.data[0]?.id)
      })
    }
  })
}

function createCategory(data: ICreateCategoryRequest) {
  createCategoryApi(data).then((res) => {
    if (res.code === 200) {
      newNodeName.value = ''
      getCategoryList()
      tdMessage.success('添加成功')
    }
    else {
      tdMessage.error('添加失败')
    }
  }).catch((error: any) => {
    console.error(error)
    tdMessage.error(`添加失败`)
  })
}

function addFirstCategory() {
  if (!newNodeName.value) {
    tdMessage.error('请输入节点名称')
    return
  }
  createCategory({ name: newNodeName.value, parent_id: null })
}

// 添加节点
function appendNode(node: TreeNodeModel) {
  if (!newNodeName.value) {
    tdMessage.error('请输入节点名称')
    return
  }
  createCategory({ name: newNodeName.value, parent_id: node?.value === -1 ? null : node?.value })
}

// 编辑节点
function editNode(node: TreeNodeModel) {
  if (!currentNodeName.value) {
    tdMessage.error('请输入节点名称')
    return
  }
  updateCategoryApi(String(node.value), { name: currentNodeName.value, category_full_path: node.data.full_path }).then((res) => {
    if (res.code === 200) {
      currentNodeName.value = ''
      getCategoryList()
      tdMessage.success('编辑成功')
    }
    else {
      tdMessage.error('编辑失败')
    }
  }).catch((error: any) => {
    console.error(error)
    tdMessage.error(`编辑失败`)
  })
}

// 删除节点
function removeNode(node: TreeNodeModel) {
  deleteCategoryApi(String(node.value), node.data.full_path).then((res) => {
    if (res.code === 200) {
      getCategoryList()
      tdMessage.success('删除成功')
    }
    else {
      tdMessage.error('删除失败')
    }
  }).catch((error: any) => {
    console.error(error)
    tdMessage.error(`删除失败`)
  })
}

// 笔记 添加 查看 编辑 弹窗逻辑
const isShowCreateNoteDialog = ref(false)
const articleFormMode = ref<DNoteFormMode>('add')
const currentArticle = ref<IArticle | undefined>(undefined)

// 处理文章点击
function viewArticle(article: IArticle) {
  currentArticle.value = article
  articleFormMode.value = 'view'
  isShowCreateNoteDialog.value = true
}

// 添加文章
function addArticle() {
  if (!currentNode.value || currentNode.value.value === -1)
    return tdMessage.warning('请先选中一个目录')
  currentArticle.value = undefined
  articleFormMode.value = 'add'
  isShowCreateNoteDialog.value = true
}

// 编辑文章
function editArticle(article: IArticle) {
  currentArticle.value = article
  articleFormMode.value = 'edit'
  isShowCreateNoteDialog.value = true
}

// 排序
const changeSort: DropdownProps['onClick'] = (data) => {
  const [orderBy, orderDirection] = typeof data?.value === 'string' ? data?.value?.split('-') : []
  sortField.value = orderBy as 'create_time' | 'update_time' | 'title'
  sortDirection.value = orderDirection as 'asc' | 'desc'
  search()
}

// 搜索标题关键字
const searchTitle = ref('')
// 搜索
function search() {
  fileListRef.value.search({
    title: searchTitle.value,
    order_by: sortField.value,
    order_direction: sortDirection.value,
  })
}

// 关闭弹窗
function closeCreateNoteDialog(isNeedRefresh: boolean = false) {
  currentArticle.value = undefined
  isShowCreateNoteDialog.value = false
  searchTitle.value = ''
  if (isNeedRefresh) {
    if (fileListRef.value)
      fileListRef.value.refresh()
  }
}

onMounted(() => {
  // 获取分类列表
  getCategoryList()
})
</script>

<template>
  <div class="project-wrapper">
    <!-- 左：分类树 -->
    <aside class="pane pane-left">
      <div class="pane-head">
        <div>
          <p class="eyebrow">
            Categories
          </p>
          <h3 class="pane-title">
            分类管理
          </h3>
        </div>
        <span v-if="categoryTreeData && categoryTreeData.length" class="count-pill">
          {{ categoryTreeData.length }}
        </span>
      </div>

      <div v-if="categoryTreeData && categoryTreeData.length" class="pane-body">
        <TPopup trigger="click" placement="bottom-left">
          <TButton class="add-root-btn" theme="primary" variant="outline" size="small" block>
            <template #icon>
              <AddIcon class="w-4 h-4" />
            </template>
            添加根节点
          </TButton>
          <template #content>
            <div class="popup-form">
              <div class="popup-form-title">
                添加子节点
              </div>
              <div class="popup-form-row">
                <TInput v-model="newNodeName" placeholder="节点名称" autofocus @enter="addFirstCategory" />
                <TButton theme="primary" @click="addFirstCategory">
                  添加
                </TButton>
              </div>
            </div>
          </template>
        </TPopup>

        <div class="tree-wrapper">
          <TTree
            ref="treeRef"
            v-model:actived="treeActivedValue"
            :data="categoryTreeData"
            :keys="{ label: 'name', value: 'id' }"
            activable hover transition
            :expand-level="1"
          >
            <template #label="{ node }">
              {{ node.label }}
            </template>
            <template #operations="{ node }">
              <div class="tree-node-ops">
                <TPopup v-if="node.value !== -1" trigger="click">
                  <EditIcon class="tree-op-icon" @click="currentNodeName = node.label" />
                  <template #content>
                    <div class="popup-form">
                      <div class="popup-form-title">
                        编辑子节点
                      </div>
                      <div class="popup-form-row">
                        <TInput v-model="currentNodeName" placeholder="节点名称" autofocus @enter="editNode(node)" />
                        <TButton theme="primary" @click="editNode(node)">
                          确定
                        </TButton>
                      </div>
                    </div>
                  </template>
                </TPopup>
                <TPopup trigger="click">
                  <AddIcon class="tree-op-icon" />
                  <template #content>
                    <div class="popup-form">
                      <div class="popup-form-title">
                        添加子节点
                      </div>
                      <div class="popup-form-row">
                        <TInput v-model="newNodeName" placeholder="节点名称" autofocus @enter="appendNode(node)" />
                        <TButton theme="primary" @click="appendNode(node)">
                          添加
                        </TButton>
                      </div>
                    </div>
                  </template>
                </TPopup>
                <TPopconfirm v-if="node.value !== -1" content="确认删除节点?" @confirm="removeNode(node)">
                  <DeleteIcon class="tree-op-icon tree-op-danger" />
                </TPopconfirm>
              </div>
            </template>
          </TTree>
        </div>
      </div>

      <div v-else class="pane-empty">
        <NoDataIcon class="pane-empty-illus" />
        <p class="pane-empty-title">
          暂无分类
        </p>
        <p class="pane-empty-hint">
          先创建一个分类，开始组织你的文章
        </p>
        <TPopup trigger="click" placement="bottom-left">
          <TButton theme="primary">
            <template #icon>
              <AddIcon class="w-4 h-4" />
            </template>
            创建分类
          </TButton>
          <template #content>
            <div class="popup-form">
              <div class="popup-form-title">
                添加根节点
              </div>
              <div class="popup-form-row">
                <TInput v-model="newNodeName" placeholder="节点名称" autofocus @enter="addFirstCategory" />
                <TButton theme="primary" @click="addFirstCategory">
                  添加
                </TButton>
              </div>
            </div>
          </template>
        </TPopup>
      </div>
    </aside>

    <!-- 右：文章列表 -->
    <section class="pane pane-right">
      <template v-if="currentNode">
        <div class="right-header">
          <div class="right-header-title">
            <p class="eyebrow">
              Articles
            </p>
            <h2 class="right-title" :title="currentNode.label">
              {{ currentNode.label }}
            </h2>
          </div>

          <div class="right-header-tools">
            <TDropdown trigger="click" @click="changeSort">
              <button class="tool-chip sort-chip" type="button">
                <SortIcon class="tool-chip-icon" />
                <span class="tool-chip-text">{{ sortTips }}</span>
              </button>
              <template #dropdown>
                <TDropdownItem value="update_time-desc" divider>
                  更新时间⬇
                </TDropdownItem>
                <TDropdownItem value="update_time-asc" divider>
                  更新时间⬆
                </TDropdownItem>
                <TDropdownItem value="create_time-desc" divider>
                  创建时间⬇
                </TDropdownItem>
                <TDropdownItem value="create_time-asc" divider>
                  创建时间⬆
                </TDropdownItem>
                <TDropdownItem value="title-desc" divider>
                  文章标题⬇
                </TDropdownItem>
                <TDropdownItem value="title-asc" divider>
                  文章标题⬆
                </TDropdownItem>
              </template>
            </TDropdown>

            <TInput v-model="searchTitle" class="search-input" placeholder="按回车搜索标题" clearable size="small" @enter="search">
              <template #suffixIcon>
                <SearchIcon class="w-4 h-4 cursor-pointer c-gray-400" />
              </template>
            </TInput>

            <TButton theme="primary" @click="addArticle">
              <template #icon>
                <AddIcon class="w-4 h-4" />
              </template>
              新建文章
            </TButton>
          </div>
        </div>

        <FileList ref="fileListRef" class="file-list-shell" :current-node="currentNode" @view-article="viewArticle" @edit-article="editArticle" />
      </template>

      <div v-else class="right-empty">
        <NoDataIcon class="right-empty-illus" />
        <p class="right-empty-title">
          选择一个分类开始
        </p>
        <p class="right-empty-hint">
          从左侧树形菜单选择一个目录，查看其下的文章列表
        </p>
      </div>
    </section>

    <transition
      enter-active-class="duration-300 ease-out" enter-from-class="opacity-0 translate-x-5"
      leave-active-class="duration-300 ease-in" leave-to-class="opacity-0 translate-x-5"
    >
      <ArticleForm
        v-show="isShowCreateNoteDialog" class="absolute left-0 top-0 bg-background-secondary z-5 w-full h-full overflow-hidden" :mode="articleFormMode" :current-node="currentNode" :article-info="currentArticle" @close="closeCreateNoteDialog"
      />
    </transition>
  </div>
</template>

<style scoped>
.project-wrapper {
  position: relative;
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  gap: 16px;
  height: 100%;
  overflow: hidden;
}

/* ===== pane ===== */
.pane {
  position: relative;
  min-height: 0;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(80, 54, 109, 0.08);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.85);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.6) inset,
    0 8px 24px rgba(45, 25, 76, 0.05);
}

.pane-left {
  padding: 14px 12px;
  gap: 12px;
}

.pane-right {
  padding: 16px 18px;
  gap: 14px;
  overflow: hidden;
}

.pane-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 10px;
  padding: 2px 4px 10px;
  border-bottom: 1px dashed rgba(80, 54, 109, 0.1);
}

.eyebrow {
  margin: 0;
  color: rgba(29, 17, 50, 0.48);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.pane-title {
  margin: 2px 0 0;
  color: #1d1132;
  font-size: 15px;
  font-weight: 800;
  line-height: 1.2;
}

.count-pill {
  min-width: 22px;
  padding: 2px 8px;
  border-radius: 999px;
  background: linear-gradient(135deg, rgba(61, 34, 102, 0.1), rgba(67, 123, 112, 0.1));
  color: #3d2266;
  font-size: 11px;
  font-weight: 800;
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.pane-body {
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: auto;
}

.add-root-btn {
  width: 100%;
  justify-content: center;
}

.tree-wrapper {
  flex: 1;
  min-height: 0;
  padding: 4px 2px;
  border-radius: 8px;
}

.tree-wrapper :deep(.t-tree) {
  --td-text-color-primary: #1d1132;
}

.tree-wrapper :deep(.t-tree__item) {
  position: relative;
  margin: 1px 0;
  padding-left: 6px;
  padding-right: 4px;
  border-radius: 8px;
  transition: background-color 0.18s ease, color 0.18s ease;
}

.tree-wrapper :deep(.t-tree__item:hover) {
  background: rgba(61, 34, 102, 0.05);
}

.tree-wrapper :deep(.t-tree__item--active),
.tree-wrapper :deep(.t-tree__item.t-is-active),
.tree-wrapper :deep(.t-tree__item.t-is-actived),
.tree-wrapper :deep(.t-tree__item--actived) {
  background: rgba(61, 34, 102, 0.1);
  color: #3d2266;
  font-weight: 700;
}

.tree-wrapper :deep(.t-tree__item--active)::before,
.tree-wrapper :deep(.t-tree__item.t-is-active)::before,
.tree-wrapper :deep(.t-tree__item.t-is-actived)::before,
.tree-wrapper :deep(.t-tree__item--actived)::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 2px;
  width: 3px;
  height: 55%;
  transform: translateY(-50%);
  border-radius: 2px;
  background: linear-gradient(180deg, #3d2266, #437b70);
  pointer-events: none;
}

.tree-wrapper :deep(.t-tree__label) {
  padding-left: 2px;
  font-size: 13.5px;
  line-height: 1.5;
}

.tree-wrapper :deep(.t-tree__icon) {
  color: rgba(29, 17, 50, 0.55);
}

.tree-wrapper :deep(.t-tree__operations) {
  display: inline-flex;
  align-items: center;
}

.tree-node-ops {
  display: inline-flex;
  align-items: center;
  margin-left: 6px;
  gap: 6px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

:deep(.t-tree__item):hover .tree-node-ops,
:deep(.t-tree__item--active) .tree-node-ops,
:deep(.t-tree__item.t-is-active) .tree-node-ops,
:deep(.t-tree__item.t-is-actived) .tree-node-ops,
:deep(.t-tree__item--actived) .tree-node-ops {
  opacity: 1;
}

.tree-op-icon {
  width: 14px;
  height: 14px;
  color: #3d2266;
  cursor: pointer;
  transition: color 0.2s ease, transform 0.2s ease;
}

.tree-op-icon:hover {
  color: #437b70;
  transform: scale(1.15);
}

.tree-op-danger:hover {
  color: #a8595a;
}

/* ===== popup form ===== */
.popup-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 6px 4px;
  min-width: 220px;
}

.popup-form-title {
  color: #1d1132;
  font-size: 13px;
  font-weight: 800;
}

.popup-form-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ===== empty states ===== */
.pane-empty,
.right-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 24px 18px;
}

.pane-empty-illus {
  width: 120px;
  max-width: 70%;
  height: auto;
  opacity: 0.9;
}

.pane-empty-title,
.right-empty-title {
  margin: 4px 0 0;
  color: #1d1132;
  font-size: 14px;
  font-weight: 800;
}

.pane-empty-hint,
.right-empty-hint {
  margin: 0 0 8px;
  color: rgba(29, 17, 50, 0.5);
  font-size: 12.5px;
  text-align: center;
  line-height: 1.6;
}

.right-empty-illus {
  width: 180px;
  max-width: 40%;
  height: auto;
  opacity: 0.85;
}

/* ===== right header ===== */
.right-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 12px;
  border-bottom: 1px dashed rgba(80, 54, 109, 0.1);
}

.right-header-title {
  min-width: 0;
}

.right-title {
  margin: 2px 0 0;
  overflow: hidden;
  color: #1d1132;
  font-size: 18px;
  font-weight: 800;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.right-header-tools {
  display: inline-flex;
  align-items: center;
  flex: 0 0 auto;
  gap: 10px;
}

.tool-chip {
  height: 32px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 12px;
  border: 1px solid rgba(80, 54, 109, 0.12);
  border-radius: 8px;
  background: #fff;
  color: rgba(29, 17, 50, 0.72);
  cursor: pointer;
  font: inherit;
  transition: border-color 0.2s ease, background-color 0.2s ease, color 0.2s ease;
}

.tool-chip:hover {
  border-color: rgba(67, 123, 112, 0.32);
  background: #f4f8f7;
  color: #437b70;
}

.tool-chip-icon {
  width: 14px;
  height: 14px;
}

.tool-chip-text {
  font-size: 12.5px;
  font-weight: 700;
  white-space: nowrap;
}

.search-input {
  width: 200px;
}

.search-input :deep(.t-input) {
  border-radius: 8px;
}

.file-list-shell {
  flex: 1;
  min-height: 0;
  /* 滚动交给内部 .file-list-scroll 处理，不在这里设 overflow: hidden */
}

@media (max-width: 900px) {
  .project-wrapper {
    grid-template-columns: 1fr;
    grid-template-rows: auto minmax(0, 1fr);
    overflow: auto;
  }

  .right-header {
    flex-wrap: wrap;
    gap: 10px;
  }

  .search-input {
    width: 100%;
  }
}
</style>
