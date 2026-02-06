import type { IArticleFilter, TArticlePageResponse } from '@/types/articleTypes'
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
