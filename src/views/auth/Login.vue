<script setup lang="tsx">
import type { FormInstanceFunctions, FormRule } from 'tdesign-vue-next'
import type { Reactive, VNode } from 'vue'
import type { ILoginParams } from '@/types/loginTypes'
import Cookies from 'js-cookie'
import { Button as TButton, Checkbox as TCheckbox, Form as TForm, FormItem as TFormItem, Input as TInput } from 'tdesign-vue-next'
import { h, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { loginApi } from '@/api/auth'
// import { useCustomMessage } from '@/hooks/useCustomMessage'
import { useTdMessage } from '@/hooks/useTdMessage'
import { setToken } from '@/utils/auth'

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
          router.push({ name: 'dashboard' })
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
  <div class="login-container w-xs sm:w-sm animate__animated animate__lightSpeedInLeft">
    <div class="text-3xl font-bold text-center m-b-4 ">
      Login
    </div>
    <div class="text-sm text-center m-b-4">
      To get start, you need to sign in here.
    </div>
    <div class="div-border-shadow bg-background-white p-6">
      <TForm
        ref="loginFormRef" :data="loginForm" :rules="rules" label-align="top" :required-mark="false"
        @keydown.enter="login"
      >
        <TFormItem name="username">
          <template #label>
            <div class="text-primary-100 font-bold">
              Username
            </div>
          </template>
          <TInput v-model="loginForm.username" clearable placeholder="Username" />
        </TFormItem>

        <TFormItem name="password">
          <template #label>
            <div class="text-primary-100 font-bold">
              Password
            </div>
          </template>
          <TInput v-model="loginForm.password" type="password" clearable placeholder="Password" />
        </TFormItem>
        <TFormItem>
          <div class="flex items-center justify-between w-full">
            <TCheckbox v-model="rememberMe">
              Remember me
            </TCheckbox>
            <div class="cursor-pointer text-primary-50 hover:text-primary-40" @click="goToRegister">
              Register Now
            </div>
          </div>
        </TFormItem>
        <TFormItem>
          <TButton theme="primary" class="w-full" @click="login">
            Login
          </TButton>
        </TFormItem>
      </TForm>
    </div>
  </div>
</template>

<style scoped></style>
