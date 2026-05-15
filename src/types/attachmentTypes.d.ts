import type { IApiResponse } from './apiTypes'

export type TAttachmentKind = 'IMAGE' | 'PDF' | 'WORD' | 'PPT' | 'EXCEL' | 'AUDIO' | 'VIDEO' | 'MARKDOWN' | 'TEXT'

export interface IAttachment {
  id: string
  user_id: string
  project_id: string
  category_id: number | null
  name: string
  stored_name: string
  ext: string
  mime_type: string
  size: number
  kind: TAttachmentKind
  storage_path: string
  is_deleted: boolean
  delete_time: string | null
  create_time: string
  update_time: string
}

export interface IAttachmentFilter {
  project_id: string
  category_id?: number
  kind?: TAttachmentKind
  keyword?: string
  page?: number
  page_size?: number
}

export interface IAttachmentPageResponse {
  page: number
  page_size: number
  total: number
  pages: number
  data: IAttachment[]
}

export type TAttachmentResult = IApiResponse<IAttachment>
export type TAttachmentPageResult = IApiResponse<IAttachmentPageResponse>
export type TAttachmentListResult = IApiResponse<IAttachment[]>
