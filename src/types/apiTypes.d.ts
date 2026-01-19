// 定义通用的 API 响应类型
export interface IApiResponse<T = any> {
  code: number
  message: string
  data: T
}
