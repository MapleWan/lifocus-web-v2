<script setup lang="ts">
import type { IAttachment, TAttachmentKind } from '@/types/attachmentTypes'
import dayjs from 'dayjs'
import { debounce } from 'lodash'
import { Tag as TTag } from 'tdesign-vue-next'
import { onMounted, ref, watch } from 'vue'
import {
  deleteAttachmentApi,
  downloadAttachmentBlob,
  getAttachmentListApi,
  previewAttachmentBlob,
  uploadAttachmentApi,
} from '@/api/attachment'
import { useTdMessage } from '@/hooks/useTdMessage'
import ResourcePreview from './ResourcePreview.vue'

const props = defineProps<{
  projectId: string
  categoryId?: number
}>()

const tdMessage = useTdMessage()

// 状态
const attachments = ref<IAttachment[]>([])
const loading = ref(false)
const currentView = ref<'grid' | 'list'>('grid')
const currentFilter = ref<'all' | TAttachmentKind | 'doc' | 'media'>('all')
const searchKeyword = ref('')
const uploadingFiles = ref<UploadingFile[]>([])
const previewVisible = ref(false)
const previewAttachment = ref<IAttachment | null>(null)

const pagination = ref({ page: 1, page_size: 20, total: 0 })
const imageUrls = ref<Record<string, string>>({}) // 缓存图片 URL

interface TypeConfig {
  label: string
  theme: 'primary' | 'danger' | 'warning' | 'success' | 'default'
}

interface UploadingFile {
  name: string
  progress: number
  type: string
}

// 获取图片缩略图 URL
function getImageThumbUrl(att: IAttachment): string {
  return imageUrls.value[att.id] || ''
}

// 异步加载图片
async function loadAttachmentImage(att: IAttachment) {
  // 如果已加载过，跳过
  if (imageUrls.value[att.id]) {
    return
  }

  try {
    const blob = await previewAttachmentBlob(att.id)
    const url = URL.createObjectURL(blob as Blob)
    imageUrls.value[att.id] = url
  }
  catch (err) {
    console.error('加载图片失败:', err)
  }
}

// 加载列表中所有图片的缩略图
function loadAllThumbnails() {
  attachments.value
    .filter(att => att.kind === 'IMAGE')
    .forEach(att => loadAttachmentImage(att))
}

// 获取附件列表
async function fetchAttachments() {
  if (!props.projectId) {
    return
  }
  loading.value = true
  try {
    const params: any = {
      project_id: props.projectId,
      page: pagination.value.page,
      page_size: pagination.value.page_size,
    }
    if (props.categoryId) {
      params.category_id = props.categoryId
    }
    if (currentFilter.value !== 'all') {
      if (currentFilter.value === 'doc') {
        // 文档类：PDF/WORD/PPT/EXCEL/MARKDOWN/TEXT
        params.kind = undefined // 前端过滤
      }
      else if (currentFilter.value === 'media') {
        params.kind = undefined // 前端过滤
      }
      else {
        params.kind = currentFilter.value
      }
    }
    if (searchKeyword.value) {
      params.keyword = searchKeyword.value
    }

    const res = await getAttachmentListApi(params)
    if (res.code === 200) {
      let data = res.data.data
      // 前端过滤文档/媒体
      if (currentFilter.value === 'doc') {
        data = data.filter((a: IAttachment) => ['PDF', 'WORD', 'PPT', 'EXCEL', 'MARKDOWN', 'TEXT'].includes(a.kind))
      }
      else if (currentFilter.value === 'media') {
        data = data.filter((a: IAttachment) => ['AUDIO', 'VIDEO'].includes(a.kind))
      }
      attachments.value = data
      pagination.value.total = res.data.total
      // 加载图片缩略图
      loadAllThumbnails()
    }
  }
  catch (err: any) {
    tdMessage.error(err?.message || '获取附件列表失败')
  }
  finally {
    loading.value = false
  }
}

// 上传处理
async function handleFileUpload(files: FileList) {
  for (const file of Array.from(files)) {
    const ext = file.name.split('.').pop()?.toLowerCase() || ''
    const allowedExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'csv', 'mp3', 'wav', 'm4a', 'ogg', 'flac', 'mp4', 'webm', 'mov', 'mkv', 'md', 'markdown', 'txt', 'log']
    if (!allowedExts.includes(ext)) {
      tdMessage.error(`不支持的文件类型：${file.name}`)
      continue
    }
    if (file.size > 100 * 1024 * 1024) {
      tdMessage.error(`文件过大（超过100MB）：${file.name}`)
      continue
    }

    const uploadItem = { name: file.name, progress: 0, type: ext }
    uploadingFiles.value.push(uploadItem)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('project_id', props.projectId)
    if (props.categoryId) {
      formData.append('category_id', String(props.categoryId))
    }

    try {
      await uploadAttachmentApi(formData, (progressEvent: any) => {
        uploadItem.progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
      })
      tdMessage.success(`${file.name} 上传成功`)
    }
    catch (err: any) {
      tdMessage.error(`${file.name} 上传失败：${err?.message || ''}`)
    }
    finally {
      setTimeout(() => {
        uploadingFiles.value = uploadingFiles.value.filter(f => f.name !== file.name)
        fetchAttachments()
      }, 1000)
    }
  }
}

// 删除
async function handleDelete(att: IAttachment) {
  try {
    const res = await deleteAttachmentApi(att.id)
    if (res.code === 200) {
      tdMessage.success('删除成功')
      fetchAttachments()
    }
  }
  catch (err: any) {
    tdMessage.error(err?.message || '删除失败')
  }
}

// 下载
async function handleDownload(att: IAttachment) {
  try {
    const blob = await downloadAttachmentBlob(att.id)
    const url = window.URL.createObjectURL(blob as Blob)
    const link = document.createElement('a')
    link.href = url
    link.download = att.name
    link.click()
    window.URL.revokeObjectURL(url)
  }
  catch (err: any) {
    tdMessage.error(err?.message || '下载失败')
  }
}

// 预览
function handlePreview(att: IAttachment) {
  console.log('handlePreview 被调用:', att)
  previewAttachment.value = att
  previewVisible.value = true
  console.log('previewVisible 设置为 true')
}

// 文件大小格式化
function formatSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }
  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

// 类型标签配置
function getTypeConfig(kind: TAttachmentKind): TypeConfig {
  const configs: Record<TAttachmentKind, TypeConfig> = {
    IMAGE: { label: '图片', theme: 'primary' },
    PDF: { label: 'PDF', theme: 'danger' },
    WORD: { label: 'Word', theme: 'primary' },
    PPT: { label: 'PPT', theme: 'warning' },
    EXCEL: { label: 'Excel', theme: 'success' },
    AUDIO: { label: '音频', theme: 'primary' },
    VIDEO: { label: '视频', theme: 'success' },
    MARKDOWN: { label: 'MD', theme: 'primary' },
    TEXT: { label: 'TXT', theme: 'default' },
  }
  return configs[kind] || { label: kind, theme: 'default' as const }
}

// 搜索防抖
const debouncedSearch = debounce(() => {
  pagination.value.page = 1
  fetchAttachments()
}, 300)

watch(searchKeyword, debouncedSearch)
watch(currentFilter, () => {
  pagination.value.page = 1
  fetchAttachments()
})
watch(() => props.projectId, fetchAttachments, { immediate: false })

onMounted(fetchAttachments)
</script>

<template>
  <div class="resource-panel">
    <!-- 上传区域 -->
    <div class="upload-section">
      <label class="upload-zone">
        <input
          type="file"
          multiple
          class="upload-input"
          @change="handleFileUpload(($event.target as HTMLInputElement).files!)"
        />
        <div class="upload-zone-content">
          <div class="upload-icon">📁</div>
          <div class="upload-text">点击或拖拽文件上传</div>
          <div class="upload-hint">支持图片、PDF、Word、PPT、Excel、音频、视频、Markdown、TXT（≤100MB）</div>
        </div>
      </label>
      <!-- 上传进度 -->
      <div v-if="uploadingFiles.length" class="upload-progress-list">
        <div v-for="f in uploadingFiles" :key="f.name" class="upload-progress-item">
          <span class="file-name">{{ f.name }}</span>
          <div class="progress-bar">
            <div class="progress-bar-inner" :style="{ width: `${f.progress}%` }" />
          </div>
          <span class="progress-text">{{ f.progress }}%</span>
        </div>
      </div>
    </div>

    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="filter-tabs">
        <button
          class="tab-btn"
          :class="{ active: currentFilter === 'all' }"
          @click="currentFilter = 'all'"
        >
          全部
        </button>
        <button
          class="tab-btn"
          :class="{ active: currentFilter === 'IMAGE' }"
          @click="currentFilter = 'IMAGE'"
        >
          图片
        </button>
        <button
          class="tab-btn"
          :class="{ active: currentFilter === 'doc' }"
          @click="currentFilter = 'doc'"
        >
          文档
        </button>
        <button
          class="tab-btn"
          :class="{ active: currentFilter === 'media' }"
          @click="currentFilter = 'media'"
        >
          音视频
        </button>
      </div>
      <input
        v-model="searchKeyword"
        class="search-input"
        type="text"
        placeholder="搜索文件名..."
      />
      <div class="view-toggle">
        <button class="view-btn" :class="{ active: currentView === 'grid' }" @click="currentView = 'grid'">
          ▦
        </button>
        <button class="view-btn" :class="{ active: currentView === 'list' }" @click="currentView = 'list'">
          ☰
        </button>
      </div>
      <span class="count-text">共 {{ pagination.total }} 个</span>
    </div>

    <!-- 列表/网格视图 -->
    <div class="content-area">
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner">⏳</div>
        <div>加载中...</div>
      </div>
      <div v-else-if="!attachments.length" class="empty-state">
        <div class="empty-icon">📂</div>
        <div>暂无资源</div>
      </div>

      <!-- 网格视图 -->
      <div v-if="currentView === 'grid' && attachments.length" class="grid-view">
        <div v-for="att in attachments" :key="att.id" class="resource-card">
          <div class="card-thumb" @click="handlePreview(att)">
            <img v-if="att.kind === 'IMAGE'" :src="getImageThumbUrl(att)" :alt="att.name" class="thumb-image" />
            <div v-else class="thumb-placeholder">
              <span class="file-ext">{{ att.ext }}</span>
            </div>
          </div>
          <div class="card-info">
            <div class="card-name" :title="att.name">{{ att.name }}</div>
            <div class="card-meta">
              <TTag size="small" :theme="getTypeConfig(att.kind).theme">
                {{ getTypeConfig(att.kind).label }}
              </TTag>
              <span>{{ formatSize(att.size) }}</span>
            </div>
            <div class="card-time">{{ dayjs(att.create_time).format('YYYY-MM-DD HH:mm') }}</div>
          </div>
          <div class="card-actions">
            <button class="action-btn" title="预览" @click="handlePreview(att)">👁</button>
            <button class="action-btn" title="下载" @click="handleDownload(att)">⬇</button>
            <button class="action-btn danger" title="删除" @click="handleDelete(att)">🗑</button>
          </div>
        </div>
      </div>

      <!-- 列表视图 -->
      <div v-if="currentView === 'list' && attachments.length" class="list-view">
        <table>
          <thead>
            <tr>
              <th>文件名</th>
              <th>类型</th>
              <th>大小</th>
              <th>上传时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="att in attachments" :key="att.id">
              <td class="name-cell" :title="att.name">{{ att.name }}</td>
              <td>
                <TTag size="small" :theme="getTypeConfig(att.kind).theme">
                  {{ getTypeConfig(att.kind).label }}
                </TTag>
              </td>
              <td>{{ formatSize(att.size) }}</td>
              <td>{{ dayjs(att.create_time).format('YYYY-MM-DD HH:mm') }}</td>
              <td class="action-cell">
                <button class="link-btn" @click="handlePreview(att)">预览</button>
                <button class="link-btn" @click="handleDownload(att)">下载</button>
                <button class="link-btn danger" @click="handleDelete(att)">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 预览弹窗 -->
    <ResourcePreview
      v-show="previewAttachment"
      v-model:visible="previewVisible"
      :attachment="previewAttachment"
    />
  </div>
</template>

<style scoped>
.resource-panel {
  padding: 16px;
}

.upload-section {
  margin-bottom: 20px;
}

.upload-zone {
  display: block;
  border: 2px dashed var(--td-border-level-2-color, #e5e7eb);
  border-radius: 8px;
  padding: 32px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--td-bg-color-container, #fff);
}

.upload-zone:hover {
  border-color: var(--td-brand-color, #818cf8);
  background: rgba(129, 140, 248, 0.03);
}

.upload-input {
  display: none;
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.upload-text {
  font-size: 14px;
  color: var(--td-text-color-primary, #1f2937);
  margin-bottom: 6px;
}

.upload-hint {
  font-size: 12px;
  color: var(--td-text-color-placeholder, #9ca3af);
}

.upload-progress-list {
  margin-top: 16px;
}

.upload-progress-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: var(--td-bg-color-container, #fff);
  border-radius: 6px;
  margin-bottom: 8px;
}

.file-name {
  flex: 1;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.progress-bar {
  width: 120px;
  height: 6px;
  background: var(--td-bg-color-secondarycontainer, #f3f4f6);
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar-inner {
  height: 100%;
  background: var(--td-brand-color, #818cf8);
  border-radius: 3px;
  transition: width 0.3s;
}

.progress-text {
  font-size: 12px;
  color: var(--td-text-color-placeholder, #9ca3af);
  width: 36px;
  text-align: right;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filter-tabs {
  display: flex;
  gap: 0;
  background: var(--td-bg-color-secondarycontainer, #f3f4f6);
  border-radius: 6px;
  overflow: hidden;
}

.tab-btn {
  padding: 7px 14px;
  font-size: 12px;
  font-weight: 500;
  color: var(--td-text-color-secondary, #6b7280);
  cursor: pointer;
  border: none;
  background: transparent;
  transition: all 0.2s;
}

.tab-btn:hover {
  color: var(--td-text-color-primary, #1f2937);
  background: var(--td-bg-color-container, #fff);
}

.tab-btn.active {
  background: var(--td-brand-color, #818cf8);
  color: #fff;
}

.search-input {
  flex: 1;
  min-width: 180px;
  padding: 7px 12px;
  border: 1px solid var(--td-border-level-2-color, #e5e7eb);
  border-radius: 6px;
  font-size: 13px;
}

.view-toggle {
  display: flex;
  gap: 4px;
}

.view-btn {
  width: 32px;
  height: 32px;
  border: 1px solid var(--td-border-level-2-color, #e5e7eb);
  background: var(--td-bg-color-container, #fff);
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
}

.view-btn.active {
  background: var(--td-brand-color, #818cf8);
  color: #fff;
  border-color: var(--td-brand-color, #818cf8);
}

.count-text {
  font-size: 12px;
  color: var(--td-text-color-placeholder, #9ca3af);
}

.content-area {
  min-height: 200px;
}

.loading-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--td-text-color-placeholder, #9ca3af);
}

.loading-spinner {
  font-size: 48px;
  margin-bottom: 12px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--td-text-color-placeholder, #9ca3af);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.3;
}

.grid-view {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.resource-card {
  background: var(--td-bg-color-container, #fff);
  border: 1px solid var(--td-border-level-2-color, #e5e7eb);
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  transition: all 0.2s;
}

.resource-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-thumb {
  height: 140px;
  background: var(--td-bg-color-secondarycontainer, #f3f4f6);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.thumb-placeholder {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--td-bg-color-container, #fff);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--td-text-color-placeholder, #9ca3af);
  text-transform: uppercase;
}

.thumb-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.thumb-placeholder.image-bg {
  background: linear-gradient(135deg, #e0e7ff 0%, #dbeafe 100%);
}

.card-info {
  padding: 14px;
}

.card-name {
  font-size: 13px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 8px;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--td-text-color-placeholder, #9ca3af);
}

.card-time {
  font-size: 11px;
  color: var(--td-text-color-placeholder, #9ca3af);
  margin-top: 6px;
}

.card-actions {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s;
}

.resource-card:hover .card-actions {
  opacity: 1;
  visibility: visible;
}

.action-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #fff;
  transform: scale(1.1);
}

.action-btn.danger:hover {
  color: #ef4444;
}

.list-view {
  background: var(--td-bg-color-container, #fff);
  border: 1px solid var(--td-border-level-2-color, #e5e7eb);
  border-radius: 8px;
  overflow: hidden;
}

.list-view table {
  width: 100%;
  border-collapse: collapse;
}

.list-view th,
.list-view td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid var(--td-border-level-2-color, #e5e7eb);
  font-size: 13px;
}

.list-view th {
  background: var(--td-bg-color-secondarycontainer, #f3f4f6);
  font-weight: 600;
}

.name-cell {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.action-cell {
  display: flex;
  gap: 8px;
}

.link-btn {
  background: none;
  border: none;
  color: var(--td-brand-color, #818cf8);
  cursor: pointer;
  font-size: 13px;
}

.link-btn:hover {
  text-decoration: underline;
}

.link-btn.danger {
  color: #ef4444;
}
</style>
