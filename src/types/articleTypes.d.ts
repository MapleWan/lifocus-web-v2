import type { IApiResponse } from "./apiTypes"

export type TArticleStatus = 'ACTIVE' | 'ARCHIVED'

export type TArticleType = 'NOTE' | 'DAILY'

export type DNoteFormMode = 'add' | 'edit' | 'view'

export interface IArticle {
  id: string
  category_id: string
  type: TArticleType
  title: string
  status: TArticleStatus
  content?: string
  is_shared: boolean
  is_deleted: boolean
  create_time: string
  update_time: string
  category: {
    id: string,
    name: string,
  }
}

export interface IAddArticleParams {
  category_id: string
  category_full_path: string
  type: TArticleType
  title: string
  status?: TArticleStatus
  content: string
}

export type TArticleResponse = IApiResponse<IArticle[]>

export type TArticlePageResponse = IApiResponse<
    {
      page_no: number
      page_size: number
      pages: number
      total: number
      data: IArticle[]
    }
>

export interface IArticleFilter {
  title?: string
  category_id?: string | number | null
  status?: TArticleStatus
  type?: TArticleType
  is_shared?: boolean
  page_no?: number
  page_size?: number
  update_start_time?: string
  update_end_time?: string
  create_start_time?: string
  create_end_time?: string
}
