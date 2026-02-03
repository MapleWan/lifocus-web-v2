import type { ICategoryResponse } from '@/types/categoryTypes'
import { httpClient } from '@/utils/request'

/**
 * 获取项目下的目录列表
 */
export function getCategoryListApi() {
  return httpClient.get<ICategoryResponse>({ url: '/category' })
}
