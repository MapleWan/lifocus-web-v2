import type { AxiosInstance } from 'axios'
import type { LFRequestConfig } from './type'
import axios from 'axios'
import { useTdMessage } from '@/hooks/useTdMessage'
import { removeToken } from '../auth'

const useMessage = useTdMessage()

class LFRequest {
  instance: AxiosInstance

  // request实例 => axios的实例
  constructor(config: LFRequestConfig) {
    this.instance = axios.create(config)

    // 每个instance实例都添加拦截器
    this.instance.interceptors.request.use(
      (config) => {
        return config
      },
      (err) => {
        return err
      },
    )
    const interceptors = config?.interceptors
    this.instance.interceptors.response.use(
      (res) => {
        return res.data
      },
      (err) => {
        if (err?.status === 401) {
          removeToken()
          useMessage.error('登录状态异常，请重新登录')
          window.location.href = '/auth/login'
        }
        if (err?.status !== 200) {
          return Promise.reject(err?.response?.data || '系统错误')
        }
      },
    )

    // 针对特定的LFRequest实例添加拦截器
    this.instance.interceptors.request.use(
      interceptors?.requestSuccessFn,
      interceptors?.requestFailureFn,
    )
    this.instance.interceptors.response.use(
      config.interceptors?.responseSuccessFn,
      config.interceptors?.responseFailureFn,
    )
  }

  // 封装网络请求的方法
  // T => IResData
  request<T = any>(config: LFRequestConfig<T>) {
    // return this.instance.request<any, T>(config)
    // 单次请求的成功拦截处理
    if (config.interceptors?.requestSuccessFn) {
      config = config.interceptors.requestSuccessFn(config)
    }
    return new Promise<T>((resolve, reject) => {
      this.instance
        .request<any, T>(config)
        .then((res) => {
          // 单次响应的成功拦截处理
          if (config.interceptors?.responseSuccessFn) {
            res = config.interceptors.responseSuccessFn(res)
          }
          resolve(res)
        })
        .catch((err) => {
          reject(err)
        })
    })
  }

  get<T = any>(config: LFRequestConfig<T>) {
    return this.request({ ...config, method: 'GET' })
  }

  post<T = any>(config: LFRequestConfig<T>) {
    return this.request({ ...config, method: 'POST' })
  }

  delete<T = any>(config: LFRequestConfig<T>) {
    return this.request({ ...config, method: 'DELETE' })
  }

  patch<T = any>(config: LFRequestConfig<T>) {
    return this.request({ ...config, method: 'PATCH' })
  }
}

export default LFRequest
