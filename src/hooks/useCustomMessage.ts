import type { VNode, VNodeProps } from 'vue'
import type { MessageOptions } from './hooksType.ts'
// src/composables/useMessage.js
import { createVNode, render } from 'vue'
import MessageItem from './components/CustomMessage.vue'

let seed = 1

export function useCustomMessage(elRef?: HTMLElement) {
  const messages = new Map() // 用于管理多个消息实例（可选，用于手动关闭）

  const createMessage = (options: MessageOptions) => {
    const id = `msg_${seed++}`
    const targetNode = elRef || document.body
    const container = document.createElement('div')
    targetNode.appendChild(container)
    // const container = document.createElement('div')
    // document.body.appendChild(container)

    // 使用 Object.assign 合并默认值和传入选项，避免重复定义错误
    const props = Object.assign(
      {},
      {
        message: '',
        type: 'info',
        duration: 3000,
      },
      options,
    )

    const vnode = createVNode(MessageItem, props as VNodeProps)

    // 挂载
    render(vnode, container)

    // 自动清理
    const destroy = () => {
      if (messages.has(id)) {
        messages.delete(id)
      }
      render(null, container)
      targetNode.removeChild(container)
    }

    // 设置自动销毁
    if (props.duration > 0) {
      setTimeout(() => {
        destroy()
      }, props.duration + 300)
    }

    messages.set(id, destroy)

    return {
      close: destroy,
    }
  }

  return {
    // 便捷方法
    success: (message: string | VNode, duration = 3000, closeBtn = false) =>
      createMessage({ message, type: 'success', duration, closeBtn }),
    error: (message: string | VNode, duration = 3000, closeBtn = false) =>
      createMessage({ message, type: 'error', duration, closeBtn }),
    warning: (message: string | VNode, duration = 3000, closeBtn = false) =>
      createMessage({ message, type: 'warning', duration, closeBtn }),
    info: (message: string | VNode, duration = 3000, closeBtn = false) =>
      createMessage({ message, type: 'info', duration, closeBtn }),
    // 通用方法
    open: createMessage,
  }
}
