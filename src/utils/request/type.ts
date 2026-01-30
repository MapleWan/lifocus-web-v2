import type { AxiosRequestConfig, AxiosResponse } from 'axios'

// 针对AxiosRequestConfig配置进行扩展
export interface LFInterceptors<T = AxiosResponse> {
  requestSuccessFn?: (config: AxiosRequestConfig) => AxiosRequestConfig
  requestFailureFn?: (err: any) => any
  responseSuccessFn?: (res: T) => T
  responseFailureFn?: (err: any) => any
}

export interface LFRequestConfig<T = AxiosResponse> extends AxiosRequestConfig {
  interceptors?: LFInterceptors<T> | null | undefined
  isRefreshToken?: boolean
}
