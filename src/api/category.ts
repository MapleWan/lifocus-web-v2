import type { ICategoryResponse, ICreateCategoryRequest } from '@/types/categoryTypes'
import { httpClient } from '@/utils/request'

/**
 * 获取项目下的目录列表
 */
export function getCategoryListApi() {
  return httpClient.get<ICategoryResponse>({
    url: '/category',
  })
}

/**
 * 新建目录
 * @param data
 * name 目录名称
 * parent_id 父目录ID
 */
export function createCategoryApi(data: ICreateCategoryRequest) {
  return httpClient.post<ICategoryResponse>({
    url: '/category',
    data,
  })
}

/**
 * 更新目录
 * @param id 目录ID
 * @param data
 * name 目录名称
 * category_full_path 目录全路径
 */
export function updateCategoryApi(id: string, data: ICreateCategoryRequest) {
  return httpClient.put<ICategoryResponse>({
    url: `/category/${id}`,
    data,
  })
}

/**
 * 删除目录
 * @param id 目录ID
 */
export function deleteCategoryApi(id: string, category_full_path: string) {
  return httpClient.delete<ICategoryResponse>({
    url: `/category/${id}`,
    data: { category_full_path },
  })
}
