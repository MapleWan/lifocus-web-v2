<script setup lang="ts">
import type { IArticle } from '@/types/articleTypes'
import { Button as TButton, Input as TInput, Loading as TLoading } from 'tdesign-vue-next'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getSharedArticleApi } from '@/api/article'
import Editor from '@/components/Editor/index.vue'
import { useTdMessage } from '@/hooks/useTdMessage'

const tdMessage = useTdMessage()

const route = useRoute()
const articleId = route.params.id as string
const urlPassword = route.query.pwd as string | undefined
const article = ref<IArticle | null>(null)
const loading = ref(false)
const password = ref('')

async function fetchArticle(pwd: string = '', isHashed: boolean = false) {
  loading.value = true
  try {
    const response = await getSharedArticleApi(
      articleId,
      pwd ? { password: pwd, is_hashed: isHashed } : undefined,
    )
    if (response.code === 200 || response.code === 0) {
      article.value = response.data
    }
    else {
      tdMessage.error(response.message || '获取文章失败')
    }
  }
  catch (err: any) {
    tdMessage.error(err?.message || '获取文章失败，请稍后重试')
  }
  finally {
    loading.value = false
  }
}

function submitPassword() {
  if (!password.value) {
    tdMessage.error('请输入密码')
    return
  }
  // 用户手动输入的密码，is_hashed 为 false
  fetchArticle(password.value, false)
}

onMounted(() => {
  // 如果有 URL 传入的密码，使用 is_hashed: true
  if (urlPassword) {
    fetchArticle(urlPassword, true)
  }
  // else {
  // 没有密码，尝试直接获取（可能是不需要密码的分享）
  // fetchArticle()
  // }
})
</script>

<template>
  <div class="share-container">
    <!-- 密码输入表单 -->
    <div v-if="!article && !loading" class="password-form-wrapper">
      <div class="password-form">
        <h2>请输入密码访问文章</h2>
        <TInput
          v-model="password"
          type="password"
          placeholder="请输入密码"
          @keyup.enter="submitPassword"
        />
        <TButton theme="primary" class="submit-btn" @click="submitPassword">
          确定
        </TButton>
      </div>
    </div>

    <!-- 加载中 -->
    <div v-if="loading" class="loading-wrapper">
      <TLoading text="加载中..." />
    </div>

    <!-- 文章内容预览 - 参考 article-form.vue 样式 -->
    <div v-if="article" class="article-preview">
      <!-- 头部栏 -->
      <div class="head-bar">
        <div class="head-content">
          <div class="head-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M16 13H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M16 17H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M10 9H9H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <div class="head-title-wrapper">
            <div class="title">
              {{ article.title }}
            </div>
          </div>
        </div>
      </div>

      <!-- 内容区域 - 使用 Editor 组件预览 -->
      <div class="content-area">
        <Editor
          v-model="article.content"
          :is-preview="true"
          :editor-config="{ disabled: true }"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ===== 基础容器 ===== */
.share-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* ===== 密码表单样式 ===== */
.password-form-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 24px;
}

.password-form {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.2) inset;
  padding: 48px 40px;
  max-width: 420px;
  width: 100%;
  text-align: center;
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.password-form h2 {
  margin-bottom: 32px;
  color: #1a1a2e;
  font-size: 24px;
  font-weight: 600;
  letter-spacing: -0.5px;
}

.password-form :deep(.t-input) {
  border-radius: 12px;
  height: 48px;
  font-size: 15px;
}

.password-form :deep(.t-input__inner) {
  padding: 0 16px;
}

.submit-btn {
  margin-top: 24px;
  width: 100%;
  height: 48px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 14px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
}

/* ===== 加载中样式 ===== */
.loading-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

/* ===== 文章预览样式 ===== */
.article-preview {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #f8fafc;
}

/* 头部栏 */
.head-bar {
  padding: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-bottom: none;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
  position: sticky;
  top: 0;
  z-index: 10;
}

.head-content {
  display: flex;
  align-items: center;
  gap: 16px;
  max-width: 900px;
  margin: 0 auto;
  padding: 20px 32px;
  width: 100%;
}

.head-icon {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}

.head-icon svg {
  width: 24px;
  height: 24px;
  color: white;
}

.head-title-wrapper {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.head-label {
  font-size: 12px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.head-bar .title {
  font-size: 18px;
  font-weight: 600;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.2px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* 内容区域 */
.content-area {
  flex: 1;
  padding: 32px 24px;
  display: flex;
  justify-content: center;
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  overflow: hidden;
}

.content-area :deep(.md-editor) {
  max-width: 860px;
  width: 100%;
  background: #ffffff;
  border-radius: 16px;
  box-shadow:
    0 10px 40px -10px rgba(102, 126, 234, 0.15),
    0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 48px 56px;
  border: 1px solid rgba(226, 232, 240, 0.6);
  height: calc(100vh - 160px) !important;
}

/* 预览内容样式优化 */
.content-area :deep(.md-editor .md-editor-preview) {
  font-size: 16px;
  line-height: 1.8;
  color: #334155;
}

/* ===== 响应式适配 ===== */
@media (max-width: 768px) {
  .password-form {
    padding: 32px 24px;
    margin: 16px;
  }

  .password-form h2 {
    font-size: 20px;
    margin-bottom: 24px;
  }

  .head-content {
    padding: 16px 20px;
    gap: 12px;
  }

  .head-icon {
    width: 38px;
    height: 38px;
    border-radius: 10px;
  }

  .head-icon svg {
    width: 20px;
    height: 20px;
  }

  .head-label {
    font-size: 11px;
  }

  .head-bar .title {
    font-size: 16px;
  }

  .content-area {
    padding: 20px 16px;
    background: #f8fafc;
  }

  .content-area :deep(.md-editor) {
    padding: 28px 24px;
    border-radius: 12px;
    box-shadow:
      0 4px 20px rgba(102, 126, 234, 0.1),
      0 2px 8px rgba(0, 0, 0, 0.04);
  }

  .content-area :deep(.md-editor .md-editor-preview) {
    font-size: 15px;
  }

  .content-area :deep(.md-editor .md-editor-preview h1) {
    font-size: 22px;
  }

  .content-area :deep(.md-editor .md-editor-preview h2) {
    font-size: 18px;
  }
}
</style>
