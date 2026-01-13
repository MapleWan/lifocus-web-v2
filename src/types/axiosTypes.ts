export interface IResponse<T> {
  code: number
  message: string
  data: T
}

export interface IHeader {
  'X-Project-Id'?: string
}
