<script setup lang="ts">
import type { DropdownProps, FormProps, TableProps } from 'tdesign-vue-next'
import type { Ref } from 'vue'
import type { IAddProjectParams, IProjectInfo } from '@/types/projectTypes'
import dayjs from 'dayjs'
import { Button as TButton, Dialog as TDialog, Dropdown as TDropdown, DropdownItem as TDropdownItem, Form as TForm, FormItem as TFormItem, Input as TInput, Option as TOption, RadioButton as TRadioButton, RadioGroup as TRadioGroup, Select as TSelect, Table as TTable, Textarea as TTextarea } from 'tdesign-vue-next'
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { createProjectApi, getProjectListApi } from '@/api/project'
import ActiveIcon from '@/assets/svg/active.svg'
import CardIcon from '@/assets/svg/card.svg'
import CollectionIcon from '@/assets/svg/collection.svg'
import ListIcon from '@/assets/svg/list.svg'
import SearchIcon from '@/assets/svg/search.svg'
import SortIcon from '@/assets/svg/sort.svg'
import ProjectCard from '@/components/ProjectCard/index.vue'
import { useTdMessage } from '@/hooks/useTdMessage'
import { useMainStore } from '@/stores/main'
import { EProjectType } from '@/utils/enums/projectEnum'

const tdMessage = useTdMessage()
const mainStore = useMainStore()
const router = useRouter()
const currentProjectTabType: Ref<'active' | 'archived'> = ref('active')
function changeProjectTabType(type: 'active' | 'archived') {
  currentProjectTabType.value = type
}

const listType: Ref<'card' | 'list'> = ref('card')

const sortField = ref<'create_time' | 'update_time' | 'name'>('update_time')
const sortDirection = ref<'asc' | 'desc'>('desc')
const sortTips = computed(() => {
  const sortFieldToValue: Record<'create_time' | 'update_time' | 'name', string> = {
    create_time: '创建时间',
    update_time: '更新时间',
    name: '项目名称',
  }
  return `${sortFieldToValue[sortField.value]} ${sortDirection.value === 'asc' ? '⬆' : '⬇'}`
})
const changeSort: DropdownProps['onClick'] = (data) => {
  const [orderBy, orderDirection] = typeof data?.value === 'string' ? data?.value?.split('-') : []
  sortField.value = orderBy as 'create_time' | 'update_time' | 'name'
  sortDirection.value = orderDirection as 'asc' | 'desc'
  getProjectList()
}

const projectList = ref<IProjectInfo[]>([])

onMounted(() => {
  getProjectList()
})

watch(currentProjectTabType, () => {
  getProjectList()
})

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
    sortField.value = sortVal.sortBy as 'create_time' | 'update_time' | 'name'
    sortDirection.value = sortVal.descending ? 'desc' : 'asc'
    getProjectList()
  }
}

const tableRowOpenProject: TableProps['onRowClick'] = (data) => {
  openProject(data.row.id)
}

function openProject(projectId: string) {
  mainStore.setCurrentProjectId(projectId)
  router.push({ name: 'projectDashboard' })
}

const projectFormDialogVisible = ref(false)
const projectFormData = ref<IAddProjectParams>({
  name: '',
  description: '',
  type: 'NOTE',
  status: 'ACTIVE',
})

const projectFormRules: FormProps['rules'] = {
  name: [
    { required: true, message: '请输入标题', type: 'error', trigger: 'blur' },
  ],
}

function handleProjectSubmit() {
  createProjectApi({ ...projectFormData.value, status: 'ACTIVE' }).then((res) => {
    if (res.code === 200) {
      projectFormDialogVisible.value = false
      getProjectList()
      tdMessage.success('项目创建成功')
      projectFormData.value = {
        name: '',
        description: '',
        type: 'NOTE',
        status: 'ACTIVE',
      }
    }
  }).catch((error) => {
    console.error(error)
    tdMessage.error(`项目创建失败：${error.message}`)
  })
}

// 搜索项目名关键字
const searchName = ref('')
function search() {
  getProjectList()
}

function getProjectList() {
  getProjectListApi({
    name: searchName.value,
    status: currentProjectTabType.value === 'active' ? 'ACTIVE' : 'ARCHIVED',
    order_by: sortField.value,
    order_direction: sortDirection.value,
  }).then((res) => {
    projectList.value = res.data
  })
}
</script>

<template>
  <div class="h-full flex flex-col overflow-hidden gap-2">
    <div class="project-container-head flex justify-between">
      <div class="flex items-center select-none gap-2">
        <div
          class="flex items-center text-primary-50 cursor-pointer"
          :class="{ 'text-primary-100!': currentProjectTabType === 'active' }"
          @click="changeProjectTabType('active')"
        >
          <ActiveIcon class="w-4 h-4" />
          <div class="m-l-1">
            活跃中
          </div>
        </div>

        <div
          class="flex items-center text-primary-50 cursor-pointer"
          :class="{ 'text-primary-100!': currentProjectTabType === 'archived' }"
          @click="changeProjectTabType('archived')"
        >
          <CollectionIcon class="w-4 h-4" />
          <div class="m-l-1">
            已归档
          </div>
        </div>
        <div class="flex items-center gap-2">
          <TDropdown v-if="listType === 'card'" trigger="click" @click="changeSort">
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
              <TDropdownItem value="name-desc" divider>
                项目名称⬇
              </TDropdownItem>
              <TDropdownItem value="name-asc" divider>
                项目名称⬆
              </TDropdownItem>
            </template>
          </TDropdown>

          <TInput v-model="searchName" placeholder="名称搜索, 按回车键搜索" clearable size="small" @enter="search">
            <template #suffixIcon>
              <SearchIcon class="w-4 h-4 cursor-pointer c-gray-400" />
            </template>
          </TInput>
        </div>
      </div>

      <div class="flex items-center gap-4">
        <TButton theme="primary" shape="round" size="medium" @click="projectFormDialogVisible = true">
          创建项目
        </TButton>
        <TRadioGroup v-model="listType" variant="primary-filled" default-value="card">
          <TRadioButton value="card">
            <CardIcon class="w-4 h-4" />
          </TRadioButton>
          <TRadioButton value="list">
            <ListIcon class="w-4 h-4" />
          </TRadioButton>
        </TRadioGroup>
      </div>
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

    <TDialog v-model:visible="projectFormDialogVisible" header="添加项目" :footer="false">
      <TForm :data="projectFormData" :rules="projectFormRules" @submit="handleProjectSubmit">
        <TFormItem label="名称" name="name">
          <TInput v-model="projectFormData.name" placeholder="" />
        </TFormItem>

        <TFormItem label="类型" name="type">
          <TSelect v-model="projectFormData.type">
            <template v-for="value in EProjectType" :key="value.value">
              <TOption :label="value.label" :value="value.value" />
            </template>
          </TSelect>
        </TFormItem>
        <TFormItem label="描述" name="description">
          <TTextarea v-model="projectFormData.description" placeholder="请输入描述" />
        </TFormItem>
        <TFormItem>
          <div class="flex justify-end w-full gap-2">
            <TButton theme="default" @click="projectFormDialogVisible = false">
              取消
            </TButton>
            <TButton theme="primary" type="submit">
              确定
            </TButton>
          </div>
        </TFormItem>
      </TForm>
    </TDialog>
  </div>
</template>

<style scoped lang="scss">
.project-container-content {
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  grid-auto-rows: 160px;
  gap: 16px;
}
</style>
