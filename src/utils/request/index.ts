import type { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import axios from 'axios'
import { getToken, removeToken } from '../auth'

const whiteList: string[] = ['/auth/login', '/auth/register']

const request: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_API,
  timeout: 60000, // 请求超时时间
})

// 请求拦截器
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (config.url && whiteList.includes(config.url)) {
      return config
    }
    // 添加时间戳防止缓存
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now(),
      }
    }

    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  },
)

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse) => {
    const { data } = response
    // 根据业务状态码处理
    if (data.code !== 200) {
      // token 过期，跳转到登录页
      if (data.code === 401) {
        window.location.href = '/auth/login'
      }
      return Promise.reject(new Error(data.message || '服务错误'))
    }

    return data
  },
  (error: AxiosError) => {
    let message = '请求失败'
    if (error.response) {
      const errorMsg = (error.response?.data as any)?.message || ''
      const { status } = error.response

      switch (status) {
        case 400:
          message = errorMsg || '请求参数错误'
          break
        case 401:
          message = '未授权，请登录'
          removeToken()
          window.location.href = '/auth/login'
          break
        case 403:
          message = errorMsg || '拒绝访问'
          break
        case 404:
          message = errorMsg || `请求地址出错: ${error.config?.url}`
          break
        case 408:
          message = errorMsg || '请求超时'
          break
        case 500:
          message = errorMsg || '服务器内部错误'
          break
        case 501:
          message = errorMsg || '服务未实现'
          break
        case 502:
          message = errorMsg || '网关错误'
          break
        case 503:
          message = errorMsg || '服务不可用'
          break
        case 504:
          message = errorMsg || '网关超时'
          break
        case 505:
          message = errorMsg || 'HTTP版本不受支持'
          break
        default:
          message = `连接错误${status}`
      }
    }
    else if (error.request) {
      if (error.code === 'ECONNABORTED') {
        message = '请求超时，请检查网络连接'
      }
      else {
        message = '网络异常，请检查网络连接'
      }
    }
    else {
      message = error.message || '未知错误'
    }
    return Promise.reject(message)
  },
)

export default request
