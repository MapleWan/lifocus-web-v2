import type { TNode } from 'tdesign-vue-next'
import { MessagePlugin } from 'tdesign-vue-next'

export function useTdMessage() {
  return {
    success: (
      message: string | TNode,
      duration: number = 3000,
      closeBtn: boolean = false,
      icon: boolean = true,
    ) => {
      MessagePlugin.success({
        content: message,
        closeBtn,
        duration,
        icon,
      })
    },
    error: (
      message: string | TNode,
      duration: number = 3000,
      closeBtn: boolean = false,
      icon: boolean = true,
    ) => {
      MessagePlugin.error({
        content: message,
        closeBtn,
        duration,
        icon,
      })
    },
    warning: (
      message: string | TNode,
      duration: number = 3000,
      closeBtn: boolean = false,
      icon: boolean = true,
    ) => {
      MessagePlugin.warning({
        content: message,
        closeBtn,
        duration,
        icon,
      })
    },
    info: (
      message: string | TNode,
      duration: number = 3000,
      closeBtn: boolean = false,
      icon: boolean = true,
    ) => {
      MessagePlugin.info({
        content: message,
        closeBtn,
        duration,
        icon,
      })
    },
  }
}
