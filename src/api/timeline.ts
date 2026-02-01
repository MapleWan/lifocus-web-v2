import type { IAddTimelineParams, ITimeline, TAddTimelineResult, TTimelineResult } from '@/types/timelineTypes'
import { httpClient } from '@/utils/request'

/**
 * 获取今日时间线
 * @param params
 * @param params.create_start_time 开始时间
 * @param params.create_end_time 结束时间
 */
export function getTodayTimelineApi(params: {
  create_start_time: string
  create_end_time: string
}) {
  return httpClient.get<TTimelineResult>({
    url: '/timeline/user-timeline',
    params,
  })
}

/**
 * 添加时间线
 * @param data
 * @param data.title 标题
 * @param data.type 类型
 * @param data.content 内容
 * @param data.description 描述
 */
export function addTimelineApi(data: IAddTimelineParams) {
  return httpClient.post<TAddTimelineResult>({
    url: '/timeline',
    data,
  })
}

/**
 * 更新时间线
 */
export function updateTimelineApi(id: string, data: Partial<ITimeline>) {
  return httpClient.put<TAddTimelineResult>({
    url: `/timeline/${id}`,
    data,
  })
}
