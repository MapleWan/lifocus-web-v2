import type { IAttachmentFilter, TAttachmentPageResult, TAttachmentResult } from '@/types/attachmentTypes'
import { httpClient } from '@/utils/request'

/**
 * 上传附件
 */
export function uploadAttachmentApi(formData: FormData, onUploadProgress?: (progressEvent: any) => void) {
  return httpClient.post<TAttachmentResult>({
    url: '/attachment',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress,
  })
}

/**
 * 获取附件列表（分页）
 */
export function getAttachmentListApi(params: IAttachmentFilter) {
  return httpClient.get<TAttachmentPageResult>({
    url: '/attachment',
    params,
  })
}

/**
 * 删除附件
 */
export function deleteAttachmentApi(id: string) {
  return httpClient.delete<TAttachmentResult>({
    url: `/attachment/${id}`,
  })
}

/**
 * 下载附件（返回 blob）
 */
export function downloadAttachmentBlob(id: string) {
  return httpClient.get<Blob>({
    url: `/attachment/${id}/download`,
    responseType: 'blob',
  })
}

/**
 * 预览附件（返回 blob）
 */
export function previewAttachmentBlob(id: string) {
  return httpClient.get<Blob>({
    url: `/attachment/${id}/preview`,
    responseType: 'blob',
  })
}
