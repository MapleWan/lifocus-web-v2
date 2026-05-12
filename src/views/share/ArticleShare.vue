<script setup lang="ts">
import type { IArticle } from '@/types/articleTypes'
import dayjs from 'dayjs'
import { Button as TButton, Input as TInput, Tag as TTag } from 'tdesign-vue-next'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getSharedArticleApi } from '@/api/article'
import LogoIcon from '@/assets/svg/logo.svg'
import Editor from '@/components/Editor/index.vue'
import { useTdMessage } from '@/hooks/useTdMessage'
import { EArticleStatus, EArticleType } from '@/utils/enums/articleEnum'

const tdMessage = useTdMessage()

const route = useRoute()
const articleId = route.params.id as string
const urlPassword = route.query.pwd as string | undefined
const article = ref<IArticle | null>(null)
const loading = ref(false)
const password = ref('')

const articleTypeValueToText = EArticleType.reduce((acc, cur) => {
  acc[cur.value] = cur.label
  return acc
}, {} as Record<string, string>)

const articleStatusValueToText = EArticleStatus.reduce((acc, cur) => {
  acc[cur.value] = cur.label
  return acc
}, {} as Record<string, string>)

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
  <div class="share-shell">
    <!-- 密码输入门 -->
    <div v-if="!article && !loading" class="gate-wrap">
      <div class="gate-card">
        <div class="gate-badge">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" stroke-width="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            <circle cx="12" cy="16" r="1.2" fill="currentColor" />
          </svg>
        </div>
        <p class="gate-eyebrow">
          Protected Share
        </p>
        <h2 class="gate-title">
          这是一篇受密码保护的文章
        </h2>
        <p class="gate-hint">
          请输入分享者提供的访问密码，继续阅读
        </p>

        <TInput
          v-model="password"
          class="gate-input"
          type="password"
          placeholder="请输入密码"
          @keyup.enter="submitPassword"
        />

        <TButton class="gate-submit" theme="primary" block @click="submitPassword">
          解锁阅读
        </TButton>

        <div class="gate-footer">
          <LogoIcon class="gate-footer-logo" />
          <span>Powered by LiFocus</span>
        </div>
      </div>
    </div>

    <!-- 加载中 -->
    <div v-if="loading" class="loading-wrap">
      <div class="loading-box">
        <div class="load-dot" />
        <div class="load-dot" style="animation-delay: 0.15s" />
        <div class="load-dot" style="animation-delay: 0.3s" />
        <span>正在加载分享内容...</span>
      </div>
    </div>

    <!-- 文章预览 -->
    <div v-if="article" class="article-wrap">
      <!-- 顶部品牌栏 -->
      <header class="share-topbar">
        <div class="share-topbar-inner">
          <div class="share-brand">
            <LogoIcon class="share-brand-logo" />
            <span class="share-brand-text">LiFocus</span>
            <span class="share-brand-divider" />
            <span class="share-brand-tag">文章分享</span>
          </div>
          <div class="share-topbar-meta">
            <span v-if="article.update_time" class="share-meta-time">
              {{ dayjs(article.update_time).format('YYYY-MM-DD HH:mm') }}
            </span>
          </div>
        </div>
      </header>

      <!-- 文章卡片 -->
      <main class="article-main">
        <article class="article-card">
          <div class="article-head">
            <p class="article-eyebrow">
              Shared Article
            </p>
            <h1 class="article-title">
              {{ article.title }}
            </h1>
            <div class="article-meta">
              <TTag v-if="article.type" variant="light" :theme="article.type === 'NOTE' ? 'primary' : 'success'" size="small">
                {{ articleTypeValueToText[article.type] }}
              </TTag>
              <TTag v-if="article.status" variant="light-outline" :theme="article.status === 'ACTIVE' ? 'success' : 'primary'" size="small">
                {{ articleStatusValueToText[article.status] }}
              </TTag>
              <span v-if="article.category?.name" class="article-meta-cat">
                {{ article.category.name }}
              </span>
              <span v-if="article.update_time" class="article-meta-time">
                · 更新于 {{ dayjs(article.update_time).format('YYYY-MM-DD') }}
              </span>
            </div>
          </div>

          <div class="article-divider" />

          <div class="article-body">
            <Editor
              v-model="article.content"
              :is-preview="true"
              :editor-config="{ disabled: true }"
            />
          </div>
        </article>

        <footer class="share-footer">
          <span>内容由作者通过 LiFocus 分享产生</span>
        </footer>
      </main>
    </div>
  </div>
</template>

<style scoped>
/* ============ shell ============ */
.share-shell {
  position: relative;
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  background:
    radial-gradient(1100px 500px at -5% -10%, rgba(61, 34, 102, 0.16), transparent 60%),
    radial-gradient(1100px 500px at 110% 110%, rgba(67, 123, 112, 0.16), transparent 60%),
    radial-gradient(600px 300px at 50% 120%, rgba(128, 108, 151, 0.1), transparent 70%),
    linear-gradient(135deg, #f7f8fb, #edf4f2);
}

.share-shell::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(to right, rgba(61, 34, 102, 0.04) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(61, 34, 102, 0.04) 1px, transparent 1px);
  background-size: 40px 40px;
  mask-image: radial-gradient(ellipse at center, rgba(0, 0, 0, 0.9), transparent 70%);
  -webkit-mask-image: radial-gradient(ellipse at center, rgba(0, 0, 0, 0.9), transparent 70%);
}

/* ============ gate (密码门) ============ */
.gate-wrap {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 32px 20px;
}

.gate-card {
  width: 100%;
  max-width: 420px;
  padding: 40px 36px 28px;
  border: 1px solid rgba(80, 54, 109, 0.1);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.7),
    0 24px 60px rgba(45, 25, 76, 0.12);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  text-align: center;
  animation: gate-in 0.45s ease-out;
}

@keyframes gate-in {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}

.gate-badge {
  width: 58px;
  height: 58px;
  margin: 0 auto 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  background: linear-gradient(135deg, #3d2266, #437b70);
  color: #fff;
  box-shadow: 0 12px 28px rgba(61, 34, 102, 0.3);
}

.gate-badge svg {
  width: 28px;
  height: 28px;
}

.gate-eyebrow {
  margin: 0 0 8px;
  color: rgba(29, 17, 50, 0.5);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.gate-title {
  margin: 0 0 8px;
  color: #1d1132;
  font-size: 19px;
  font-weight: 800;
  letter-spacing: -0.01em;
}

.gate-hint {
  margin: 0 0 22px;
  color: rgba(29, 17, 50, 0.55);
  font-size: 13px;
  line-height: 1.6;
}

.gate-input :deep(.t-input) {
  height: 46px;
  border: 1px solid rgba(80, 54, 109, 0.12);
  border-radius: 12px;
  background: #fff;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.gate-input :deep(.t-input.t-is-focused) {
  border-color: rgba(67, 123, 112, 0.45);
  box-shadow: 0 0 0 4px rgba(67, 123, 112, 0.12);
}

.gate-input :deep(.t-input__inner) {
  padding: 0 14px;
  font-size: 14px;
  font-weight: 600;
}

.gate-submit {
  margin-top: 18px !important;
  height: 46px !important;
  border-radius: 12px !important;
  border-color: transparent !important;
  background: linear-gradient(135deg, #3d2266, #437b70) !important;
  font-size: 15px !important;
  font-weight: 800 !important;
  letter-spacing: 0.02em;
  box-shadow: 0 10px 24px rgba(61, 34, 102, 0.28);
  transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease !important;
}

.gate-submit:hover {
  filter: brightness(1.06);
  transform: translateY(-1px);
  box-shadow: 0 14px 30px rgba(61, 34, 102, 0.34);
}

.gate-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 22px;
  color: rgba(29, 17, 50, 0.4);
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.gate-footer-logo {
  width: 14px;
  height: 14px;
  opacity: 0.75;
}

/* ============ loading ============ */
.loading-wrap {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.loading-box {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 22px;
  border: 1px solid rgba(80, 54, 109, 0.08);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.85);
  box-shadow: 0 12px 28px rgba(45, 25, 76, 0.08);
  color: #3d2266;
  font-size: 13px;
  font-weight: 700;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.load-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3d2266, #437b70);
  animation: load-bounce 0.9s ease-in-out infinite;
}

@keyframes load-bounce {
  0%, 100% { transform: translateY(0); opacity: 0.55; }
  50% { transform: translateY(-6px); opacity: 1; }
}

/* ============ article ============ */
.article-wrap {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
}

/* 顶部品牌栏 */
.share-topbar {
  position: sticky;
  top: 0;
  z-index: 5;
  padding: 10px 20px;
  border-bottom: 1px solid rgba(80, 54, 109, 0.08);
  background: rgba(255, 255, 255, 0.78);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.share-topbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  max-width: 1080px;
  margin: 0 auto;
}

.share-brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.share-brand-logo {
  width: 26px;
  height: 26px;
  color: #3d2266;
}

.share-brand-text {
  background: linear-gradient(135deg, #3d2266, #437b70);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-size: 16px;
  font-weight: 800;
  letter-spacing: -0.01em;
}

.share-brand-divider {
  width: 1px;
  height: 18px;
  background: rgba(80, 54, 109, 0.14);
}

.share-brand-tag {
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(67, 123, 112, 0.1);
  color: #437b70;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.share-topbar-meta {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: rgba(29, 17, 50, 0.55);
  font-size: 12.5px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

/* 主体 */
.article-main {
  flex: 1;
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
  padding: 28px 20px 40px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.article-card {
  position: relative;
  padding: 36px 40px 28px;
  border: 1px solid rgba(80, 54, 109, 0.08);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.7),
    0 18px 50px rgba(45, 25, 76, 0.06);
  overflow: hidden;
}

.article-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #3d2266, #437b70, #5b8f5a);
}

.article-head {
  margin-bottom: 18px;
}

.article-eyebrow {
  margin: 0 0 8px;
  color: rgba(29, 17, 50, 0.45);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.article-title {
  margin: 0 0 14px;
  color: #1d1132;
  font-size: 28px;
  font-weight: 800;
  line-height: 1.25;
  letter-spacing: -0.01em;
  word-break: break-word;
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  color: rgba(29, 17, 50, 0.5);
  font-size: 12.5px;
  font-weight: 600;
}

.article-meta-cat {
  color: #437b70;
  font-weight: 700;
}

.article-meta-cat::before {
  content: '#';
  margin-right: 2px;
  color: #5b8f5a;
  font-weight: 800;
}

.article-meta-time {
  color: rgba(29, 17, 50, 0.45);
}

.article-divider {
  height: 1px;
  margin: 0 -4px 18px;
  background: linear-gradient(90deg, transparent, rgba(80, 54, 109, 0.18), transparent);
}

.article-body {
  min-height: 320px;
}

/* 预览内容内部样式 */
.article-body :deep(.md-editor) {
  background: transparent;
  border: none;
  height: auto !important;
}

.article-body :deep(.md-editor-preview) {
  padding: 0;
  font-size: 15.5px;
  line-height: 1.85;
  color: #1d1132;
}

/* footer */
.share-footer {
  display: flex;
  justify-content: center;
  color: rgba(29, 17, 50, 0.4);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.02em;
}

/* ============ responsive ============ */
@media (max-width: 768px) {
  .gate-card {
    padding: 32px 24px 22px;
    border-radius: 16px;
  }

  .gate-title {
    font-size: 17px;
  }

  .share-topbar {
    padding: 8px 14px;
  }

  .share-brand-text {
    font-size: 15px;
  }

  .share-brand-tag {
    display: none;
  }

  .article-main {
    padding: 18px 12px 28px;
  }

  .article-card {
    padding: 22px 18px 18px;
    border-radius: 14px;
  }

  .article-title {
    font-size: 22px;
  }

  .article-body :deep(.md-editor-preview) {
    font-size: 15px;
  }
}
</style>
