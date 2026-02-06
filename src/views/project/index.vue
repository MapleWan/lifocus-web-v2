<script setup lang="ts">
import type { TreeNodeModel, TreeProps } from 'tdesign-vue-next'
import type { IArticle } from '@/types/articleTypes'
import { Button as TButton, Input as TInput, Popconfirm as TPopconfirm, Popup as TPopup, Tree as TTree } from 'tdesign-vue-next'
import { onMounted, ref, watch } from 'vue'
import { getArticleListApi } from '@/api/article'
import { createCategoryApi, deleteCategoryApi, getCategoryListApi, updateCategoryApi } from '@/api/category'
import AddIcon from '@/assets/svg/add.svg'
import DeleteIcon from '@/assets/svg/delete.svg'
import EditIcon from '@/assets/svg/edit.svg'
import { useTdMessage } from '@/hooks/useTdMessage'
import { useMainStore } from '@/stores/main'
import FileList from './components/file-list.vue'

const mainStore = useMainStore()
const tdMessage = useTdMessage()
const categoryTreeData = ref<TreeProps['data']>([])

const newNodeName = ref<string>('')
const currentNodeName = ref<string>('')
const currentNode = ref<TreeNodeModel | null>(null)

watch(() => mainStore.currentProjectId, () => {
  getCategoryList()
})

function getCategoryList() {
  getCategoryListApi().then((res) => {
    categoryTreeData.value = [{
      id: -1,
      name: '全部',
      children: res.data,
    }]
  })
}

function appendNode(node: TreeNodeModel) {
  if (!newNodeName.value) {
    tdMessage.error('请输入节点名称')
    return
  }
  createCategoryApi({ name: newNodeName.value, parent_id: node?.value === -1 ? null : node?.value }).then((res) => {
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
function editNode(node: TreeNodeModel) {
  if (!newNodeName.value) {
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

function handleNodeClick(data: any) {
  const node = data.node as TreeNodeModel
  if (node?.actived) {
    // 选中
    currentNode.value = node
  }
  else {
    // 取消选中
    if (currentNode.value?.value === node.value) {
      currentNode.value = null
    }
  }
}

onMounted(() => {
  getCategoryList()
})
</script>

<template>
  <div class="flex gap-2 h-full overflow-hidden">
    <div class="left w-64 p-r-4 border-r-1 border-r-dashed border-r-solid border-primary-10">
      <TTree :data="categoryTreeData" :keys="{ label: 'name', value: 'id' }" activable hover transition :expand-level="1" @click="handleNodeClick">
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
    <div class="right flex-1 p-4 p-t-0 overflow-hidden flex flex-col gap-4">
      <div class="right-header flex items-center justify-between gap-2">
        <div class="font-bold">
          文章列表
        </div>
        <div>
          <TButton theme="primary">
            <template #icon>
              <AddIcon class="w-4 h-4" />
            </template>
            添加
          </TButton>
        </div>
      </div>
      <FileList :current-node="currentNode" />
    </div>
  </div>
</template>

<style scoped>
</style>
