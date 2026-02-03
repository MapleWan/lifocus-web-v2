<script setup lang="ts">
import type { TreeProps } from 'tdesign-vue-next'
import { Button as TButton, Tree as TTree } from 'tdesign-vue-next'
import { onMounted, ref } from 'vue'
import { getCategoryListApi } from '@/api/category'
import AddIcon from '@/assets/svg/add.svg'
import DeleteIcon from '@/assets/svg/delete.svg'

const categoryTreeData = ref<TreeProps['data']>([])

function append(node: TreeProps['data']) {
  console.log(node)
}
function remove(node: TreeProps['data']) {
  console.log(node)
}

onMounted(() => {
  getCategoryListApi().then((res) => {
    categoryTreeData.value = [{
      id: -1,
      name: '全部',
      children: res.data,
    }]
  })
})
</script>

<template>
  <div class="flex gap-2 h-full overflow-hidden">
    <div class="left w-50 p-r-4 border-r-1 border-r-dashed border-r-solid border-primary-10">
      <TTree :data="categoryTreeData" :keys="{ label: 'name', value: 'id' }" activable hover transition :expand-level="1">
        <template #label="{ node }">
          {{ node.label }}
        </template>
        <template #operations="{ node }">
          <div class="flex items-center gap-2 opacity-0 hover:opacity-100 transition-opacity group-hover:opacity-100">
            <AddIcon class="c-primary-100 w-4 h-4 cursor-pointer hover:text-primary-50" @click="append(node)" />
            <DeleteIcon class="c-primary-100 w-4 h-4 cursor-pointer hover:text-primary-50" @click="remove(node)" />
          </div>
        </template>
      </TTree>
    </div>
    <div class="right flex-1 overflow-hidden flex flex-col">
      右边
    </div>
  </div>
</template>

<style scoped>
</style>
