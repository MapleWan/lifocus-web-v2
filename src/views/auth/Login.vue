<script setup lang="tsx">
import type { FormInstanceFunctions, FormRule } from 'tdesign-vue-next'
import type { Reactive } from 'vue'
import type { ILoginParams } from '@/types/loginTypes'
import Cookies from 'js-cookie'
import { LockOnIcon, UserIcon } from 'tdesign-icons-vue-next'
import { Button as TButton, Checkbox as TCheckbox, Form as TForm, FormItem as TFormItem, Input as TInput } from 'tdesign-vue-next'
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { loginApi } from '@/api/auth'
// import { useCustomMessage } from '@/hooks/useCustomMessage'
import { useTdMessage } from '@/hooks/useTdMessage'
import { useUserStore } from '@/stores/user'
import { setToken } from '@/utils/auth'

const userStore = useUserStore()

const router = useRouter()

// const useMessage = useCustomMessage()
const useMessage = useTdMessage()

const loginForm: Reactive<ILoginParams> = reactive<ILoginParams>({
  username: '',
  password: '',
})
const rules: Record<string, FormRule[]> = {
  username:
    [{ required: true, message: 'Please input username', type: 'error', trigger: 'blur' }],
  password: [
    { required: true, message: 'Please input password', type: 'error', trigger: 'blur' },
  ],
}

const loginFormRef = ref<FormInstanceFunctions>()

const rememberMe = ref(true)
const renderUserIcon = () => <UserIcon />
const renderPasswordIcon = () => <LockOnIcon />

function login() {
  loginFormRef.value?.validate().then((res) => {
    // 使用 自定义的消息组件
    // const vnodeContent = h(
    //   'div',
    //   {},
    //   [
    //     '操作有误，',
    //     h('a', { href: '#' }, '前往查看'),
    //   ],
    // )
    // useMessage.success(vnodeContent, 30000, true)

    // 使用 tdesign-vue-next 的消息组件
    // const content = () => {
    //   return (
    //     <div>
    //       操作有误，
    //       <a href="#">前往查看</a>
    //     </div>
    //   )
    // }
    // useMessage.success(content)
    if (res === true) {
      Cookies.set('isRemember', String(rememberMe.value))
      loginApi(loginForm).then((res) => {
        console.log(res)
        if (res.code === 200) {
          setToken(res.data.access_token, res.data.refresh_token, String(res.data.expire_time))
          useMessage.success('Login success')
          userStore.getCurrentUser().then(() => {
            router.push({ name: 'dashboard' })
          })
        }
        else {
          throw new Error(res?.message || '登录失败')
        }
      }).catch((error) => {
        useMessage.error(`${error.message}`)
      })
    }
  })
}

function goToRegister() {
  router.push({ name: 'register' })
}
</script>

<template>
  <div class="auth-card animate__animated animate__fadeIn">
    <div class="auth-card__header">
      <p class="auth-card__eyebrow">
        Welcome back
      </p>
      <h2>Sign in</h2>
      <p>Pick up your focused workspace right where you left it.</p>
    </div>

    <TForm
      ref="loginFormRef" :data="loginForm" :rules="rules" label-align="top" :required-mark="false"
      @keydown.enter="login"
    >
      <TFormItem name="username">
        <template #label>
          <div class="auth-label">
            Username
          </div>
        </template>
        <TInput v-model="loginForm.username" :prefix-icon="renderUserIcon" clearable size="large" placeholder="Username" />
      </TFormItem>

      <TFormItem name="password">
        <template #label>
          <div class="auth-label">
            Password
          </div>
        </template>
        <TInput v-model="loginForm.password" :prefix-icon="renderPasswordIcon" type="password" clearable size="large" placeholder="Password" />
      </TFormItem>

      <TFormItem>
        <div class="auth-options">
          <TCheckbox v-model="rememberMe">
            Remember me
          </TCheckbox>
          <button class="auth-link" type="button" @click="goToRegister">
            Register Now
          </button>
        </div>
      </TFormItem>

      <TFormItem>
        <TButton theme="primary" class="auth-submit" @click="login">
          Login
        </TButton>
      </TFormItem>
    </TForm>
  </div>
</template>

<style scoped>
.auth-card {
  width: 100%;
  max-width: 380px;
}

.auth-card__header {
  margin-bottom: 28px;
}

.auth-card__eyebrow {
  margin: 0 0 10px;
  color: #437b70;
  font-size: 13px;
  font-weight: 800;
  text-transform: uppercase;
}

.auth-card h2 {
  margin: 0;
  color: #1d1132;
  font-size: 34px;
  line-height: 1.1;
  letter-spacing: 0;
}

.auth-card__header p:last-child {
  margin: 12px 0 0;
  color: rgba(29, 17, 50, 0.6);
  font-size: 14px;
  line-height: 1.7;
}

.auth-label {
  color: #2d194c;
  font-size: 13px;
  font-weight: 800;
}

.auth-options {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.auth-link {
  padding: 0;
  border: 0;
  color: #685182;
  background: transparent;
  font: inherit;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  white-space: nowrap;
}

.auth-link:hover {
  color: #3d2266;
}

.auth-submit {
  width: 100%;
  height: 46px;
  border: 0;
  border-radius: 8px;
  background: linear-gradient(135deg, #3d2266, #437b70);
  box-shadow: 0 14px 30px rgba(61, 34, 102, 0.2);
  font-weight: 800;
}

.auth-card :deep(.t-form__item) {
  margin-bottom: 20px;
}

.auth-card :deep(.t-input) {
  height: 46px;
  border-color: rgba(80, 54, 109, 0.18);
  border-radius: 8px;
  background: #fbfbfe;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
}

.auth-card :deep(.t-input:hover),
.auth-card :deep(.t-input.t-is-focused) {
  border-color: rgba(80, 54, 109, 0.48);
  background: #fff;
  box-shadow: 0 0 0 3px rgba(128, 108, 151, 0.12);
}

.auth-card :deep(.t-input__prefix .t-icon) {
  color: #437b70;
}

@media (max-width: 480px) {
  .auth-card h2 {
    font-size: 30px;
  }

  .auth-options {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
