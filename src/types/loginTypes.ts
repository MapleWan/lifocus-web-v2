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
export interface ILoginResult {
  code: number
  message: string
  data: {
    access_token: string
    refresh_token: string
    expire_time: number
  }
}

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
export interface IRegisterResult {
  code: number
  message: string
  data: {
    id: string
    username: string
    nickname: string
    email: string
    avatar: string
    role: string
    create_time: string
    update_time: string
  }
}

/**
 * 用户信息
 */
export type IUserInfo = IRegisterResult['data']
