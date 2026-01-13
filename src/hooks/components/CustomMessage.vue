<!-- src/components/MessageItem.vue -->
<script setup lang="ts">
import type { MessageOptions } from '../hooksType.ts'
import { CloseIcon } from 'tdesign-icons-vue-next'
import { computed, isVNode, onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps<MessageOptions>()

const visible = ref(false)
let timer: any = null

const isVNodeMessage = computed(() => {
  return isVNode(props.message)
})

onMounted(() => {
  visible.value = true
  if (props.duration && props.duration > 0) {
    timer = setTimeout(() => {
      visible.value = false
    }, props.duration)
  }
})

onBeforeUnmount(() => {
  if (timer)
    clearTimeout(timer)
})

function closeMessage() {
  visible.value = false
  if (timer)
    clearTimeout(timer)
}
</script>

<template>
  <transition name="message-fade">
    <div v-show="visible" class="message" :class="type">
      <component :is="message" v-if="isVNodeMessage" />
      <span v-else>{{ message }}</span>
      <div v-if="closeBtn" class="close-btn absolute right-0 top-0" @click="closeMessage">
        <CloseIcon fill-color="transparent" class="w-4 h-4 cursor-pointer hover:text-primary-100" :stroke-width="2" />
      </div>
    </div>
  </transition>
</template>

<style scoped>
.message {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 16px;
  border-radius: 4px;
  color: white;
  z-index: 9999;
  max-width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.message.success {
  background-color: #67C23A;
}

.message.error {
  background-color: #F56C6C;
}

.message.warning {
  background-color: #E6A23C;
}

.message.info {
  background-color: #909399;
}

.message-fade-enter-active,
.message-fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.message-fade-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-100%);
}

.message-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-100%);
}
</style>
