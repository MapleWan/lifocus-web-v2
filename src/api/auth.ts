import type { ILoginParams, ILoginResult, IRegisterParams, IRegisterResult } from '@/types/loginTypes'
import { httpClient } from '@/utils/request'

/**
 * 登录接口
 */
export function loginApi(data: ILoginParams) {
  return httpClient.post<ILoginResult>({
    url: '/auth/login',
    data,
  })
}

/**
 * 注册接口
 */
export function registerApi(data: IRegisterParams) {
  return httpClient.post<IRegisterResult>({
    url: '/auth/register',
    data,
  })
}

/**
 * 登出接口
 */
export function logoutApi() {
  return httpClient.post({
    url: '/auth/logout',
  })
}

/**
 * 查询当前用户信息
 */
export function getCurrentUserApi() {
  return httpClient.get<IRegisterResult>({
    url: '/user',
  })
}
