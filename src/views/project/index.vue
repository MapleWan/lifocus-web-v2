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
  <div class="flex gap-2 h-full overflow-hidden relative">
    <div class="left w-64 p-r-4 border-r-1 border-r-dashed border-r-solid border-primary-10">
      <div v-if="categoryTreeData && categoryTreeData.length" class="flex flex-col gap-2 justify-between">
        <TPopup trigger="click">
          <TButton theme="primary" variant="dashed" size="small">
            <template #icon>
              <AddIcon class="w-4 h-4" />
            </template>
            添加根节点
          </TButton>
          <template #content>
            <div class="p-2 flex flex-col gap-2">
              <div class="font-bold">
                添加子节点
              </div>
              <div class="flex gap-2">
                <TInput v-model="newNodeName" placeholder="节点名称" autofocus @enter="addFirstCategory" />
                <TButton @click="addFirstCategory">
                  添加
                </TButton>
              </div>
            </div>
          </template>
        </TPopup>
        <TTree ref="treeRef" v-model:actived="treeActivedValue" :data="categoryTreeData" :keys="{ label: 'name', value: 'id' }" activable hover transition :expand-level="1">
          <template #label="{ node }">
            {{ node.label }}
          </template>
          <template #operations="{ node }">
            <div class="flex items-center m-l-1 gap-1 hover:opacity-100 transition-opacity group-hover:opacity-100">
              <TPopup v-if="node.value !== -1" trigger="click">
                <EditIcon class="c-primary-100 w-4 h-4 cursor-pointer hover:text-primary-50" @click="currentNodeName = node.label" />
                <template #content>
                  <div class="p-2 flex flex-col gap-2">
                    <div class="font-bold">
                      编辑子节点
                    </div>
                    <div class="flex gap-2">
                      <TInput v-model="currentNodeName" placeholder="节点名称" autofocus @enter="editNode(node)" />
                      <TButton @click="editNode(node)">
                        确定
                      </TButton>
                    </div>
                  </div>
                </template>
              </TPopup>
              <TPopup trigger="click">
                <AddIcon class="c-primary-100 w-4 h-4 cursor-pointer hover:text-primary-50" />
                <template #content>
                  <div class="p-2 flex flex-col gap-2">
                    <div class="font-bold">
                      添加子节点
                    </div>
                    <div class="flex gap-2">
                      <TInput v-model="newNodeName" placeholder="节点名称" autofocus @enter="appendNode(node)" />
                      <TButton @click="appendNode(node)">
                        添加
                      </TButton>
                    </div>
                  </div>
                </template>
              </TPopup>
              <TPopconfirm v-if="node.value !== -1" content="确认删除节点?" @confirm="removeNode(node)">
                <DeleteIcon class="c-primary-100 w-3 h-3 cursor-pointer hover:text-primary-50" />
              </TPopconfirm>
            </div>
          </template>
        </TTree>
      </div>
      <div v-else class="flex flex-col items-center gap-2">
        <div class="text-center text-primary-30 text-sm">
          暂无分类，请先添加
        </div>
        <TPopup trigger="click">
          <TButton theme="primary">
            <template #icon>
              <AddIcon class="w-4 h-4" />
            </template>
            添加分类
          </TButton>
          <template #content>
            <div class="p-2 flex flex-col gap-2">
              <div class="font-bold">
                添加子节点
              </div>
              <div class="flex gap-2">
                <TInput v-model="newNodeName" placeholder="节点名称" autofocus @enter="addFirstCategory" />
                <TButton @click="addFirstCategory">
                  添加
                </TButton>
              </div>
            </div>
          </template>
        </TPopup>
      </div>
    </div>
    <div class="right flex-1 p-4 p-t-0 overflow-hidden flex flex-col gap-4">
      <template v-if="currentNode">
        <div class="right-header flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="font-bold">
              文章列表
            </div>
            <div class="flex items-center gap-2">
              <TDropdown trigger="click" @click="changeSort">
                <div class="cursor-pointer flex items-center gap-2 c-gray-500">
                  <SortIcon class="w-4 h-4 hover:text-primary-50" />
                  <div class="text-sm text-gray-500 w-20">
                    {{ sortTips }}
                  </div>
                </div>
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
              <TInput v-model="searchTitle" placeholder="标题搜索, 按回车键搜索" clearable size="small" @enter="search">
                <template #suffixIcon>
                  <SearchIcon class="w-4 h-4 cursor-pointer c-gray-400" />
                </template>
              </TInput>
            </div>
          </div>
          <div>
            <TButton theme="primary" @click="addArticle">
              <template #icon>
                <AddIcon class="w-4 h-4" />
              </template>
              添加
            </TButton>
          </div>
        </div>
        <FileList ref="fileListRef" :current-node="currentNode" @view-article="viewArticle" @edit-article="editArticle" />
      </template>
      <div v-else class="flex flex-col items-center gap-2">
        <div class="text-center text-primary-30 text-sm">
          请先选择一个分类查询
        </div>
      </div>
    </div>

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
</style>
