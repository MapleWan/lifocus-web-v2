<script setup lang="ts">
import type { DropdownProps, FormProps, TableProps } from 'tdesign-vue-next'
import type { Ref } from 'vue'
import type { IAddProjectParams, IProjectInfo } from '@/types/projectTypes'
import dayjs from 'dayjs'
import { Button as TButton, Dialog as TDialog, Dropdown as TDropdown, DropdownItem as TDropdownItem, Form as TForm, FormItem as TFormItem, Input as TInput, Option as TOption, Select as TSelect, Table as TTable, Textarea as TTextarea } from 'tdesign-vue-next'
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { createProjectApi, getProjectListApi } from '@/api/project'
import ActiveIcon from '@/assets/svg/active.svg'
import CardIcon from '@/assets/svg/card.svg'
import CollectionIcon from '@/assets/svg/collection.svg'
import ListIcon from '@/assets/svg/list.svg'
import NoDataIcon from '@/assets/svg/noData.svg'
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
  <div class="project-list-shell">
    <div class="project-head">
      <div class="project-title-block">
        <p>Projects</p>
        <h2>项目工作台</h2>
      </div>

      <div class="project-actions">
        <TButton theme="primary" class="create-button" @click="projectFormDialogVisible = true">
          创建项目
        </TButton>
        <div class="view-switch" aria-label="视图切换">
          <button
            class="view-switch__item"
            :class="{ active: listType === 'card' }"
            type="button"
            :aria-pressed="listType === 'card'"
            @click="listType = 'card'"
          >
            <CardIcon />
            <span>卡片</span>
          </button>
          <button
            class="view-switch__item"
            :class="{ active: listType === 'list' }"
            type="button"
            :aria-pressed="listType === 'list'"
            @click="listType = 'list'"
          >
            <ListIcon />
            <span>表格</span>
          </button>
        </div>
      </div>
    </div>

    <div class="project-toolbar">
      <div class="tabs">
        <button
          class="tab-button"
          :class="{ active: currentProjectTabType === 'active' }"
          type="button"
          @click="changeProjectTabType('active')"
        >
          <ActiveIcon />
          <span>活跃中</span>
        </button>

        <button
          class="tab-button"
          :class="{ active: currentProjectTabType === 'archived' }"
          type="button"
          @click="changeProjectTabType('archived')"
        >
          <CollectionIcon />
          <span>已归档</span>
        </button>
      </div>

      <div class="project-filters">
        <TDropdown v-if="listType === 'card'" trigger="click" @click="changeSort">
          <button class="sort-button" type="button">
            <SortIcon />
            <span>{{ sortTips }}</span>
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
            <TDropdownItem value="name-desc" divider>
              项目名称⬇
            </TDropdownItem>
            <TDropdownItem value="name-asc" divider>
              项目名称⬆
            </TDropdownItem>
          </template>
        </TDropdown>

        <TInput v-model="searchName" class="search-input" placeholder="名称搜索，按回车键搜索" clearable size="medium" @enter="search">
          <template #suffixIcon>
            <SearchIcon class="search-icon" />
          </template>
        </TInput>
      </div>
    </div>

    <div class="project-list-body">
      <ScrollBar class="h-full overflow-x-hidden">
        <div class="project-container-content" :class="{ 'grid': listType === 'card', 'list-mode': listType === 'list' }">
          <template v-if="projectList.length > 0 && listType === 'card'">
            <ProjectCard v-for="project in projectList" :key="project.id" :project-info="project" @click="openProject(project.id)" />
          </template>

          <template v-else-if="projectList.length > 0">
            <TTable
              :columns="tableColumns"
              :data="projectList"
              row-key="id"
              row-class-name="cursor-pointer"
              :hover="true"
              @sort-change="sortChange"
              @row-click="tableRowOpenProject"
            />
          </template>

          <div v-else class="empty-project">
            <NoDataIcon />
            <h3>暂无项目</h3>
            <p>创建一个项目，开始整理你的想法和资料。</p>
            <TButton theme="primary" @click="projectFormDialogVisible = true">
              创建项目
            </TButton>
          </div>
        </div>
      </ScrollBar>
    </div>

    <TDialog
      v-model:visible="projectFormDialogVisible"
      :footer="false"
      dialog-class-name="project-editor-dialog"
      placement="center"
      width="520px"
    >
      <template #header>
        <div class="form-dialog-title">
          <span>New Project</span>
          <h3>创建项目</h3>
          <p>给新想法留出一个清晰的位置。</p>
        </div>
      </template>

      <TForm
        class="form-dialog-form"
        :data="projectFormData"
        :rules="projectFormRules"
        label-align="top"
        :required-mark="false"
        @submit="handleProjectSubmit"
      >
        <TFormItem label="名称" name="name">
          <TInput v-model="projectFormData.name" size="large" placeholder="例如：LiFocus 设计优化" />
        </TFormItem>

        <TFormItem label="类型" name="type">
          <TSelect v-model="projectFormData.type" size="large">
            <template v-for="value in EProjectType" :key="value.value">
              <TOption :label="value.label" :value="value.value" />
            </template>
          </TSelect>
        </TFormItem>
        <TFormItem label="描述" name="description">
          <TTextarea v-model="projectFormData.description" class="dialog-textarea" placeholder="写下项目目标、范围或你接下来要推进的重点。" />
        </TFormItem>
        <TFormItem>
          <div class="form-dialog-actions">
            <TButton theme="default" variant="outline" class="dialog-cancel" @click="projectFormDialogVisible = false">
              取消
            </TButton>
            <TButton theme="primary" type="submit" class="dialog-submit">
              创建项目
            </TButton>
          </div>
        </TFormItem>
      </TForm>
    </TDialog>
  </div>
</template>

<style scoped>
.project-list-shell {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 14px;
  overflow: hidden;
}

.project-head,
.project-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.project-title-block p {
  margin: 0 0 4px;
  color: rgba(29, 17, 50, 0.48);
  font-size: 11px;
  font-weight: 700;
}

.project-title-block h2 {
  margin: 0;
  color: #1d1132;
  font-size: 18px;
  font-weight: 800;
  line-height: 1.25;
  letter-spacing: 0;
}

.project-actions,
.project-filters,
.tabs {
  display: flex;
  align-items: center;
  gap: 10px;
}

.create-button {
  height: 38px;
  border: 0;
  border-radius: 8px;
  background: linear-gradient(135deg, #3d2266, #437b70);
  box-shadow: 0 10px 24px rgba(61, 34, 102, 0.16);
  font-weight: 800;
}

.project-toolbar {
  padding: 10px;
  border: 1px solid rgba(80, 54, 109, 0.09);
  border-radius: 8px;
  background: #fbfbfe;
}

.view-switch {
  display: grid;
  grid-template-columns: repeat(2, minmax(72px, 1fr));
  gap: 4px;
  padding: 4px;
  border: 1px solid rgba(80, 54, 109, 0.1);
  border-radius: 8px;
  background: #f4f8f7;
}

.view-switch__item {
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 0 10px;
  border: 1px solid transparent;
  border-radius: 6px;
  background: transparent;
  color: rgba(29, 17, 50, 0.56);
  cursor: pointer;
  font: inherit;
  font-size: 13px;
  font-weight: 800;
  white-space: nowrap;
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
}

.view-switch__item:hover {
  color: #254e48;
}

.view-switch__item.active {
  border-color: rgba(67, 123, 112, 0.18);
  background: #fff;
  color: #1d1132;
  box-shadow: 0 8px 18px rgba(45, 25, 76, 0.08);
}

.view-switch__item svg {
  width: 15px;
  height: 15px;
}

.tab-button,
.sort-button {
  min-height: 34px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: rgba(29, 17, 50, 0.56);
  cursor: pointer;
  font: inherit;
  font-size: 14px;
  font-weight: 800;
  white-space: nowrap;
  transition: border-color 0.2s ease, background-color 0.2s ease, color 0.2s ease;
}

.tab-button {
  padding: 0 12px;
}

.sort-button {
  padding: 0 10px;
  color: #685182;
  background: #fff;
  border-color: rgba(80, 54, 109, 0.1);
}

.tab-button.active,
.tab-button:hover,
.sort-button:hover {
  border-color: rgba(67, 123, 112, 0.18);
  background: #edf4f2;
  color: #254e48;
}

.tab-button svg,
.sort-button svg,
.search-icon {
  width: 16px;
  height: 16px;
}

.search-input {
  width: 260px;
}

.project-list-body {
  min-height: 0;
  flex: 1;
  overflow: hidden;
}

.project-container-content {
  min-height: 100%;
  padding: 4px 4px 12px;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  grid-auto-rows: 146px;
  gap: 12px;
}

.project-container-content.list-mode {
  display: block;
}

.project-container-content :deep(.t-table) {
  overflow: hidden;
  border: 1px solid rgba(80, 54, 109, 0.1);
  border-radius: 8px;
}

.empty-project {
  min-height: 260px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 28px;
  color: rgba(29, 17, 50, 0.56);
  text-align: center;
}

.empty-project svg {
  width: 150px;
  max-width: 70%;
  height: auto;
}

.empty-project h3 {
  margin: 0;
  color: #1d1132;
  font-size: 16px;
  font-weight: 800;
}

.empty-project p {
  margin: 0 0 6px;
  font-size: 14px;
}

:global(.project-editor-dialog) {
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 24px 80px rgba(29, 17, 50, 0.2);
}

:global(.project-editor-dialog .t-dialog__header) {
  padding: 0;
  border-bottom: 0;
}

:global(.project-editor-dialog .t-dialog__body) {
  padding: 20px 24px 24px;
}

:global(.project-editor-dialog .t-dialog__close) {
  top: 18px;
  right: 18px;
  color: rgba(255, 255, 255, 0.82);
}

.form-dialog-title {
  width: 100%;
  padding: 16px 24px;
  color: #fff;
  background: linear-gradient(135deg, #3d2266, #437b70);
}

.form-dialog-title span {
  display: block;
  margin-bottom: 4px;
  color: rgba(255, 255, 255, 0.72);
  font-size: 10px;
  font-weight: 700;
}

.form-dialog-title h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  line-height: 1.25;
  letter-spacing: 0;
}

.form-dialog-title p {
  margin: 6px 0 0;
  color: rgba(255, 255, 255, 0.76);
  font-size: 12px;
  line-height: 1.5;
}

.form-dialog-form {
  padding: 2px 0 0;
}

.form-dialog-form :deep(.t-form__item) {
  margin-bottom: 18px;
}

.form-dialog-form :deep(.t-form__label) {
  color: #2d194c;
  font-size: 13px;
  font-weight: 800;
}

.form-dialog-form :deep(.t-input),
.form-dialog-form :deep(.t-select__wrap),
.form-dialog-form :deep(.t-textarea__inner) {
  border-color: rgba(80, 54, 109, 0.16);
  border-radius: 8px;
  background: #fbfbfe;
}

.form-dialog-form :deep(.t-input:hover),
.form-dialog-form :deep(.t-input.t-is-focused),
.form-dialog-form :deep(.t-textarea__inner:hover),
.form-dialog-form :deep(.t-textarea__inner:focus) {
  border-color: rgba(67, 123, 112, 0.42);
  box-shadow: 0 0 0 3px rgba(67, 123, 112, 0.1);
}

.dialog-textarea :deep(.t-textarea__inner) {
  min-height: 112px;
  resize: vertical;
}

.form-dialog-actions {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 4px;
}

.dialog-cancel,
.dialog-submit {
  min-width: 96px;
  height: 38px;
  border-radius: 8px;
  font-weight: 800;
}

.dialog-submit {
  border: 0;
  background: linear-gradient(135deg, #3d2266, #437b70);
  box-shadow: 0 10px 24px rgba(61, 34, 102, 0.16);
}

@media (max-width: 760px) {
  .project-head,
  .project-toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .project-actions,
  .project-filters,
  .tabs,
  .search-input,
  .view-switch {
    width: 100%;
  }

  .view-switch {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .project-actions,
  .project-filters {
    justify-content: space-between;
  }

  .tabs {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .tab-button {
    justify-content: center;
  }
}

@media (max-width: 560px) {
  :global(.project-editor-dialog) {
    width: calc(100vw - 28px) !important;
  }

  .form-dialog-title,
  :global(.project-editor-dialog .t-dialog__body) {
    padding: 20px;
  }

  .form-dialog-actions {
    flex-direction: column-reverse;
  }

  .dialog-cancel,
  .dialog-submit {
    width: 100%;
  }
}
</style>
