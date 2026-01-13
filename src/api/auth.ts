import type {
  ILoginParams,
  ILoginResult,
  IRegisterParams,
  IRegisterResult,
} from '@/types/loginTypes'
import request from '@/utils/request'

/*
 * 登录
 * @param data
 *  { username: string; password: string }
 * @returns { Promise<LoginResult> }
 */
export function loginApi(data: ILoginParams) {
  return request({
    url: '/auth/login',
    method: 'post',
    data,
  }) as Promise<ILoginResult>
}

/**
 * 注册
 * @param data
 *  { username: string; password: string; email: string }
 * @returns { Promise<LoginResult> }
 */
export function registerApi(data: IRegisterParams) {
  return request({
    url: '/auth/register',
    method: 'post',
    data,
  }) as Promise<IRegisterResult>
}
