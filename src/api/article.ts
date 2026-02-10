import type { IApiResponse } from '@/types/apiTypes'
import type { IAddArticleParams, IArticle, IArticleFilter, TArticlePageResponse } from '@/types/articleTypes'
import { httpClient } from '@/utils/request'

/**
 * 获取项目某一目录下的文章列表
 */
export function getArticleListApi(data: IArticleFilter) {
  return httpClient.post<TArticlePageResponse>({
    url: `/article/category-article`,
    data,
  })
}

/**
 * 根据id获取文章
 * @param id
 */
export function getArticleByIdApi(id: string) {
  return httpClient.get<IApiResponse<IArticle>>({
    url: `/article/${id}`,
  })
}

/**
 * 创建文章
 * @param data
 */
export function createArticleApi(data: IAddArticleParams) {
  return httpClient.post<IApiResponse<IArticle>>({
    url: '/article',
    data,
  })
}

/**
 * 更新文章
 * @param id
 * @param data
 */
export function updateArticleApi(id: string, data: Partial<IArticle> & { category_full_path: string }) {
  return httpClient.put<IApiResponse<IArticle>>({
    url: `/article/${id}`,
    data,
  })
}

/**
 * 删除文章
 * @param id
 */
export function deleteArticleApi(id: string, data: {
  category_full_path: string
}) {
  return httpClient.delete<IApiResponse<IArticle>>({
    url: `/article/${id}`,
    data,
  })
}
