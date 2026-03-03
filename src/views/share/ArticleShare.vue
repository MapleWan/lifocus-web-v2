<script setup lang="ts">
import dayjs from 'dayjs'
import { Button as TButton, Input as TInput, Loading as TLoading } from 'tdesign-vue-next'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getSharedArticleApi } from '@/api/article'

const route = useRoute()
const articleId = route.params.id as string
const article = ref<any>(null)
const loading = ref(true)
const password = ref('')
const error = ref('')

function formatDate(date: string) {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

async function fetchArticle(pwd?: string) {
  loading.value = true
  error.value = ''
  try {
    const response = await getSharedArticleApi(articleId, pwd ? { password: pwd, is_hashed: false } : undefined)
    if (response.code === 0) {
      article.value = response.data
    }
    else {
      error.value = response.message || '获取文章失败'
    }
  }
  catch (err) {
    error.value = '获取文章失败，请稍后重试'
  }
  finally {
    loading.value = false
  }
}

function submitPassword() {
  fetchArticle(password.value)
}

onMounted(() => {
  fetchArticle()
})
</script>

<template>
  <div class="share-container">
    <div class="share-content">
      <h1 v-if="article" class="article-title">
        {{ article.title }}
      </h1>
      <div v-if="!article && !loading" class="password-form">
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
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </div>
      <div v-if="loading" class="loading">
        <TLoading text="加载中..." />
      </div>
      <div v-if="article" class="article-content">
        <div class="article-meta">
          <span>分类：{{ article.category.name }}</span>
          <span>更新时间：{{ formatDate(article.update_time) }}</span>
        </div>
        <div class="content" v-html="article.content" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.share-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.share-content {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 40px;
  max-width: 800px;
  width: 100%;
}

.article-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #333;
}

.password-form {
  text-align: center;
}

.password-form h2 {
  margin-bottom: 20px;
  color: #333;
}

.submit-btn {
  margin-top: 16px;
  width: 100%;
}

.error-message {
  color: #ff4d4f;
  margin-top: 12px;
}

.loading {
  text-align: center;
  padding: 40px;
}

.article-meta {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  color: #666;
  font-size: 14px;
}

.article-content {
  line-height: 1.6;
  color: #333;
}

.content {
  white-space: pre-wrap;
}

@media (max-width: 768px) {
  .share-content {
    padding: 20px;
  }

  .article-title {
    font-size: 20px;
  }
}
</style>
