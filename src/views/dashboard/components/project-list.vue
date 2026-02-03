<script setup lang="ts">
import type { DropdownProps, TableProps } from 'tdesign-vue-next'
import type { Ref } from 'vue'
import type { IProjectInfo } from '@/types/projectTypes'
import dayjs from 'dayjs'
import { Dropdown as TDropdown, DropdownItem as TDropdownItem, RadioButton as TRadioButton, RadioGroup as TRadioGroup, Table as TTable } from 'tdesign-vue-next'
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getProjectListApi } from '@/api/project'
import ActiveIcon from '@/assets/svg/active.svg'
import CardIcon from '@/assets/svg/card.svg'
import CollectionIcon from '@/assets/svg/collection.svg'
import ListIcon from '@/assets/svg/list.svg'
import SortIcon from '@/assets/svg/sort.svg'
import ProjectCard from '@/components/ProjectCard/index.vue'
import { useMainStore } from '@/stores/main'

const mainStore = useMainStore()
const router = useRouter()
const currentProjectTabType: Ref<'active' | 'archived'> = ref('active')
function changeProjectTabType(type: 'active' | 'archived') {
  currentProjectTabType.value = type
}

const listType: Ref<'card' | 'list'> = ref('card')

const changeSort: DropdownProps['onClick'] = (data) => {
  let [orderBy, orderDirection] = typeof data?.value === 'string' ? data?.value?.split('-') : []
  orderDirection = orderDirection === 'up' ? 'asc' : 'desc'
  getProjectList(orderBy as keyof IProjectInfo, orderDirection as 'asc' | 'desc')
}

const projectList = ref<IProjectInfo[]>([])

onMounted(() => {
  getProjectList()
})

watch(currentProjectTabType, () => {
  getProjectList()
})

function getProjectList(order_by: keyof IProjectInfo = 'update_time', order_direction: 'asc' | 'desc' = 'desc') {
  getProjectListApi({
    status: currentProjectTabType.value === 'active' ? 'ACTIVE' : 'ARCHIVED',
    order_by,
    order_direction,
  }).then((res) => {
    projectList.value = res.data
  })
}

const tableColumns = ref<TableProps['columns']>([
  {
    colKey: 'name',
    title: '项目名称',
    sorter: (a, b) => a.name.localeCompare(b.name),
    sortType: 'all',
  },
  {
    colKey: 'description',
    title: '项目描述',
  },
  {
    colKey: 'update_time',
    title: '更新时间',
    width: 200,
    cell: (h, { row }) => dayjs(row.update_time).format('YYYY-MM-DD HH:mm:ss'),
    sorter: true,
    sortType: 'all',
  },
  {
    colKey: 'create_time',
    title: '创建时间',
    width: 200,
    cell: (h, { row }) => dayjs(row.update_time).format('YYYY-MM-DD HH:mm:ss'),
    sorter: true,
    sortType: 'all',
  },
])
const sortChange: TableProps['onSortChange'] = (sortVal, _) => {
  if (!Array.isArray(sortVal)) {
    getProjectList(sortVal.sortBy as keyof IProjectInfo, sortVal.descending ? 'desc' : 'asc')
  }
}

const tableRowOpenProject: TableProps['onRowClick'] = (data) => {
  openProject(data.row.id)
}

function openProject(projectId: string) {
  mainStore.setCurrentProjectId(projectId)
  router.push({ name: 'projectDashboard' })
}
</script>

<template>
  <div class="h-full flex flex-col overflow-hidden gap-2">
    <div class="project-container-head flex justify-between">
      <div class="flex items-center select-none">
        <div
          class="flex items-center text-primary-50 m-r-4 cursor-pointer"
          :class="{ 'text-primary-100!': currentProjectTabType === 'active' }"
          @click="changeProjectTabType('active')"
        >
          <ActiveIcon class="w-4 h-4" />
          <div class="m-l-2">
            活跃中
          </div>
        </div>

        <div
          class="flex items-center text-primary-50 cursor-pointer"
          :class="{ 'text-primary-100!': currentProjectTabType === 'archived' }"
          @click="changeProjectTabType('archived')"
        >
          <CollectionIcon class="w-4 h-4" />
          <div class="m-l-2">
            已归档
          </div>
        </div>

        <TDropdown v-if="listType === 'card'" trigger="click" @click="changeSort">
          <div class=" m-l-4 cursor-pointer">
            <SortIcon class="w-4 h-4" />
          </div>
          <template #dropdown>
            <TDropdownItem value="update_time-down" divider>
              更新时间⬇
            </TDropdownItem>
            <TDropdownItem value="update_time-up" divider>
              更新时间⬆
            </TDropdownItem>
            <TDropdownItem value="create_time-down" divider>
              创建时间⬇
            </TDropdownItem>
            <TDropdownItem value="create_time-up" divider>
              创建时间⬆
            </TDropdownItem>
            <TDropdownItem value="name-down" divider>
              项目名称⬇
            </TDropdownItem>
            <TDropdownItem value="name-up" divider>
              项目名称⬆
            </TDropdownItem>
          </template>
        </TDropdown>
      </div>

      <TRadioGroup v-model="listType" variant="primary-filled" default-value="card">
        <TRadioButton value="card">
          <CardIcon class="w-4 h-4" />
        </TRadioButton>
        <TRadioButton value="list">
          <ListIcon class="w-4 h-4" />
        </TRadioButton>
      </TRadioGroup>
    </div>

    <div class="flex-1 overflow-hidden">
      <ScrollBar class="h-full overflow-x-hidden">
        <div class="project-container-content p-4" :class="{ grid: listType === 'card', flex: listType === 'list' }">
          <!-- <ProjectCard /> -->
          <template v-if="listType === 'card'">
            <template v-for="project in projectList" :key="project.id">
              <ProjectCard :project-info="project" @click="openProject(project.id)" />
            </template>
          </template>
          <template v-else>
            <TTable :columns="tableColumns" :data="projectList" row-key="id" row-class-name="cursor-pointer" :hover="true" @sort-change="sortChange" @row-click="tableRowOpenProject" />
          </template>
        </div>
      </ScrollBar>
    </div>
  </div>
</template>

<style scoped lang="scss">
.project-container-content {
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  grid-auto-rows: 200px;
  gap: 16px;
}
</style>
