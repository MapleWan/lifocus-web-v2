<script setup lang="ts">
import type { IAttachment } from '@/types/attachmentTypes'
import { MdPreview } from 'md-editor-v3'
import { Dialog as TDialog } from 'tdesign-vue-next'
import { onBeforeUnmount, ref, watch } from 'vue'
import { previewAttachmentBlob } from '@/api/attachment'
import { useTdMessage } from '@/hooks/useTdMessage'

const props = defineProps<{
  visible: boolean
  attachment: IAttachment | null
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

const tdMessage = useTdMessage()
const previewUrl = ref('')
const previewText = ref('')
const loading = ref(false)

// 不支持在线预览的类型
const UNSUPPORTED_KINDS = ['WORD', 'PPT', 'EXCEL']

async function loadPreview() {
  if (!props.attachment) {
    return
  }

  // 不支持的类型直接跳过加载
  if (UNSUPPORTED_KINDS.includes(props.attachment.kind)) {
    previewUrl.value = ''
    previewText.value = ''
    return
  }

  loading.value = true
  try {
    const blob = await previewAttachmentBlob(props.attachment.id)
    const blobObj = blob as Blob

    if (['MARKDOWN', 'TEXT'].includes(props.attachment.kind)) {
      const text = await blobObj.text()
      previewText.value = text
      previewUrl.value = ''
    }
    else {
      previewUrl.value = URL.createObjectURL(blobObj)
      previewText.value = ''
    }
  }
  catch (err: any) {
    console.error('预览加载失败:', err)
    tdMessage.error(err?.message || '预览加载失败')
  }
  finally {
    loading.value = false
  }
}

function onClose() {
  emit('update:visible', false)
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = ''
  }
  previewText.value = ''
}

watch(() => props.visible, (val) => {
  if (val && props.attachment) {
    loadPreview()
  }
})

onBeforeUnmount(() => {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }
})
</script>

<template>
  <div>
    <TDialog
      :visible="visible"
      :header="attachment?.name || '预览'"
      :footer="false"
      width="80%"
      top="5vh"
      @close="onClose"
    >
      <div class="preview-container">
        <div v-if="loading" class="preview-loading">
          <div class="loading-spinner">⏳</div>
          <div>加载中...</div>
        </div>
        <template v-else>
          <!-- 图片 -->
          <div v-if="attachment?.kind === 'IMAGE' && previewUrl" class="preview-image">
            <img :src="previewUrl" :alt="attachment.name">
          </div>

          <!-- PDF -->
          <iframe
            v-else-if="attachment?.kind === 'PDF' && previewUrl"
            :src="previewUrl"
            class="preview-iframe"
          />

          <!-- 视频 -->
          <div v-else-if="attachment?.kind === 'VIDEO' && previewUrl" class="preview-media">
            <video controls :src="previewUrl" class="preview-video" />
          </div>

          <!-- 音频 -->
          <div v-else-if="attachment?.kind === 'AUDIO' && previewUrl" class="preview-media">
            <audio controls :src="previewUrl" class="preview-audio" />
          </div>

          <!-- Markdown -->
          <div v-else-if="attachment?.kind === 'MARKDOWN'" class="preview-markdown">
            <MdPreview :model-value="previewText" />
          </div>

          <!-- 纯文本 -->
          <div v-else-if="attachment?.kind === 'TEXT'" class="preview-text">
            <pre>{{ previewText }}</pre>
          </div>

          <!-- 不支持预览 (WORD / PPT / EXCEL 等) -->
          <div v-else class="preview-not-supported">
            <div class="not-supported-icon">📄</div>
            <div>该文件类型暂不支持在线预览</div>
            <div class="hint">请点击下载后在本地查看</div>
          </div>
        </template>
      </div>
    </TDialog>
  </div>
</template>

<style scoped>
.preview-container {
  min-height: 400px;
  max-height: 80vh;
  overflow: auto;
}

.preview-loading {
  text-align: center;
  padding: 80px 20px;
  color: #9ca3af;
}

.preview-loading .loading-spinner {
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

.preview-image {
  text-align: center;
}

.preview-image img {
  max-width: 100%;
  max-height: 75vh;
  object-fit: contain;
}

.preview-iframe {
  width: 100%;
  height: 75vh;
  border: none;
}

.preview-media {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.preview-video {
  max-width: 100%;
  max-height: 70vh;
}

.preview-audio {
  width: 100%;
  max-width: 600px;
}

.preview-markdown {
  padding: 20px;
}

.preview-text {
  padding: 20px;
  background: #f9fafb;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
}

.preview-not-supported {
  text-align: center;
  padding: 60px 20px;
  color: #9ca3af;
}

.not-supported-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.3;
}

.hint {
  margin-top: 8px;
  font-size: 12px;
}
</style>
