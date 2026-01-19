import type { IApiResponse } from './apiTypes'

/**
 * 登录参数
 */
export interface ILoginParams {
  username: string
  password: string
}

/**
 * 登录结果
 */
interface LoginResult {
  access_token: string
  refresh_token: string
  expire_time: number
}

export type ILoginResult = IApiResponse<LoginResult>

/**
 * 注册参数
 */
export interface IRegisterParams {
  username: string
  password: string
  repeatPassword?: string
  email: string
}

/**
 * 注册结果
 */
export interface IUserInfo {
  id: string
  username: string
  nickname: string
  email: string
  avatar: string
  role: string
  create_time: string
  update_time: string
}

export type IRegisterResult = IApiResponse<IUserInfo>
