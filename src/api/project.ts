import type { IAddProjectParams, TAddProjectResult, TProjectResult } from '@/types/projectTypes'
import dayjs from 'dayjs'
import { httpClient } from '@/utils/request'
// 获取最近一个月更新过的项目列表
export function getRecentProjectListApi() {
  return httpClient.get<TProjectResult>({
    url: '/project/user-project',
    params: {
      update_start_time: dayjs().subtract(30, 'day').format('YYYY-MM-DD HH:mm:ss'),
    },
  })
}

interface IProjectListParams {
  name?: string
  status?: 'ACTIVE' | 'ARCHIVED'
  order_by?: string
  order_direction?: 'asc' | 'desc'
  create_start_time?: string
  create_end_time?: string
  update_start_time?: string
  update_end_time?: string
}
// 获取项目列表，非分页接口
export function getProjectListApi(params?: IProjectListParams) {
  return httpClient.get<TProjectResult>({
    url: '/project/user-project',
    params,
  })
}

export function createProjectApi(data: IAddProjectParams) {
  return httpClient.post<TAddProjectResult>({
    url: '/project',
    data,
  })
}
