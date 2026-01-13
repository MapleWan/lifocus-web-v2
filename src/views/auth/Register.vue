<script setup lang="tsx">
import type { FormInstanceFunctions, FormRule } from 'tdesign-vue-next'
import type { Reactive } from 'vue'
import type { IRegisterParams } from '@/types/loginTypes'
import { Button as TButton, Checkbox as TCheckbox, Form as TForm, FormItem as TFormItem, Input as TInput } from 'tdesign-vue-next'
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { registerApi } from '@/api/auth'
import { useTdMessage } from '@/hooks/useTdMessage'

const router = useRouter()

const useMessage = useTdMessage()

const registerForm: Reactive<IRegisterParams> = reactive<IRegisterParams>({
  username: '',
  password: '',
  repeatPassword: '',
  email: '',
})
const rules: Record<string, FormRule[]> = {
  username:
    [{ required: true, message: 'Please input username', type: 'error', trigger: 'blur' }],
  password: [
    { required: true, message: 'Please input password', type: 'error', trigger: 'blur' },
    { validator: value => /^(?=.*[a-z])(?=.*\d).{8,}$/i.test(value), message: 'At least one letter and one number, 8 characters long', type: 'error', trigger: 'blur' },
  ],
  repeatPassword: [
    { required: true, message: 'Please input repeatPassword', type: 'error', trigger: 'blur' },
    { validator: value => value === registerForm.password, message: 'Two passwords do not match!', type: 'error', trigger: 'blur' },
  ],
  email: [
    { required: true, message: 'Please input email', type: 'error', trigger: 'blur' },
    { validator: value => /\S[^\s@]*@\S+\.\S+/.test(value), message: 'Please input a valid email', type: 'error', trigger: 'blur' },
  ],
}

const registerFormRef = ref<FormInstanceFunctions>()

const agreeTerms = ref(true)

function register() {
  if (!agreeTerms.value) {
    useMessage.error('Please read and agree to the terms and conditions')
    return
  }
  registerFormRef.value?.validate().then((res) => {
    if (res === true) {
      registerApi(registerForm).then((res) => {
        if (res.code === 200) {
          useMessage.success('Register success')
          router.push({ name: 'login' })
        }
        else {
          throw new Error('""')
        }
      }).catch((error) => {
        useMessage.error(`${error}`)
      })
    }
  })
}

function goToSignin() {
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="login-container w-xs sm:w-sm animate__animated animate__lightSpeedInLeft">
    <div class="text-3xl font-bold text-center m-b-4 ">
      Sign Up
    </div>
    <div class="text-sm text-center m-b-4">
      To get started, you need to sign up here.
    </div>
    <div class="div-border-shadow bg-background-white p-6">
      <TForm ref="registerFormRef" :data="registerForm" :rules="rules" label-align="top" :required-mark="false"
        @keydown.enter="register">
        <TFormItem name="username">
          <template #label>
            <div class="text-primary-100 font-bold">
              Username
            </div>
          </template>
          <TInput v-model="registerForm.username" clearable placeholder="Username" />
        </TFormItem>

        <TFormItem name="password">
          <template #label>
            <div class="text-primary-100 font-bold">
              Password
            </div>
          </template>
          <TInput v-model="registerForm.password" type="password" clearable placeholder="Password" />
        </TFormItem>

        <TFormItem name="repeatPassword">
          <template #label>
            <div class="text-primary-100 font-bold">
              Password
            </div>
          </template>
          <TInput v-model="registerForm.repeatPassword" type="password" clearable placeholder="Password" />
        </TFormItem>
        <TFormItem name="email">
          <template #label>
            <div class="text-primary-100 font-bold">
              Email
            </div>
          </template>
          <TInput v-model="registerForm.email" clearable placeholder="Email" />
        </TFormItem>
        <TFormItem>
          <div class="flex items-center justify-between w-full">
            <TCheckbox v-model="agreeTerms">
              I Agree to the Terms & Conditions
            </TCheckbox>
            <div class="cursor-pointer text-primary-50 hover:text-primary-40" @click="goToSignin">
              To Sign In
            </div>
          </div>
        </TFormItem>
        <TFormItem>
          <TButton theme="primary" class="w-full" @click="register">
            Create An Account
          </TButton>
        </TFormItem>
      </TForm>
    </div>
  </div>
</template>

<style scoped></style>
