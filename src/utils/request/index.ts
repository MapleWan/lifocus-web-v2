import type { LFRequestConfig } from './type'
import { useTdMessage } from '@/hooks/useTdMessage'
import { getRefreshToken, getToken } from '../auth'

import { getCurrentProjectId } from '../project'
import LFRequest from './request'

const useMessage = useTdMessage()
// 需要忽略的白名单
const whiteList: string[] = ['/auth/login', '/auth/register']

export const httpClient = new LFRequest({
  baseURL: import.meta.env.VITE_BASE_API,
  timeout: 60000,
  interceptors: {
    requestSuccessFn: (config: LFRequestConfig) => {
      if (whiteList.includes(config.url as string)) {
        if (config.isRefreshToken && config?.headers)
          config.headers.Authorization = `Bearer ${getRefreshToken()}`
        return config
      }

      const token = getToken()?.accessToken || ''
      // console.log(token, '配置')

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
      }
      const projectId = getCurrentProjectId() || ''
      if (projectId && config.headers)
        config.headers['X-Project-Id'] = projectId
      if (!token) {
        useMessage.error('登录状态异常，请重新登录')
        window.location.href = '/auth/login'
      }
      return config
    },
  },
})
