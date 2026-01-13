import type { VNode } from 'vue'

export interface MessageOptions {
  message: string | VNode
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  closeBtn?: boolean
}

export type { VNode }
