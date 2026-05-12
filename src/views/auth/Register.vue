<script setup lang="tsx">
import type { FormInstanceFunctions, FormRule } from 'tdesign-vue-next'
import type { Reactive } from 'vue'
import type { IRegisterParams } from '@/types/loginTypes'
import { LockOnIcon, MailIcon, UserAddIcon, UserIcon } from 'tdesign-icons-vue-next'
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
const renderUserIcon = () => <UserIcon />
const renderPasswordIcon = () => <LockOnIcon />
const renderEmailIcon = () => <MailIcon />

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
          throw new Error(res?.message || '注册失败')
        }
      }).catch((error) => {
        useMessage.error(`${error.message}`)
      })
    }
  })
}

function goToSignin() {
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="auth-card animate__animated animate__fadeIn">
    <div class="auth-card__header">
      <p class="auth-card__eyebrow">
        Start fresh
      </p>
      <h2>Create account</h2>
      <p>Set up your LiFocus space and keep your ideas moving.</p>
    </div>

    <TForm
      ref="registerFormRef" :data="registerForm" :rules="rules" label-align="top" :required-mark="false"
      @keydown.enter="register"
    >
      <TFormItem name="username">
        <template #label>
          <div class="auth-label">
            Username
          </div>
        </template>
        <TInput v-model="registerForm.username" :prefix-icon="renderUserIcon" clearable size="large" placeholder="Username" />
      </TFormItem>

      <TFormItem name="password">
        <template #label>
          <div class="auth-label">
            Password
          </div>
        </template>
        <TInput v-model="registerForm.password" :prefix-icon="renderPasswordIcon" type="password" clearable size="large" placeholder="Password" />
      </TFormItem>

      <TFormItem name="repeatPassword">
        <template #label>
          <div class="auth-label">
            Confirm Password
          </div>
        </template>
        <TInput v-model="registerForm.repeatPassword" :prefix-icon="renderPasswordIcon" type="password" clearable size="large" placeholder="Confirm password" />
      </TFormItem>

      <TFormItem name="email">
        <template #label>
          <div class="auth-label">
            Email
          </div>
        </template>
        <TInput v-model="registerForm.email" :prefix-icon="renderEmailIcon" clearable size="large" placeholder="Email" />
      </TFormItem>

      <TFormItem>
        <div class="auth-options">
          <TCheckbox v-model="agreeTerms">
            I Agree to the Terms & Conditions
          </TCheckbox>
          <button class="auth-link" type="button" @click="goToSignin">
            To Sign In
          </button>
        </div>
      </TFormItem>

      <TFormItem>
        <TButton theme="primary" class="auth-submit" @click="register">
          <template #icon>
            <UserAddIcon />
          </template>
          Create An Account
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
  margin-bottom: 24px;
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
  font-size: 32px;
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
  margin-bottom: 16px;
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
    font-size: 28px;
  }

  .auth-options {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
