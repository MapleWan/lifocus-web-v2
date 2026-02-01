import type { IApiResponse } from "./apiTypes"

export type TTimelineType = "WORK" | "LIFE" | "LEARNING" | "ENTERTAINMENT" | "HEALTH" | "FINANCE" | "TRAVEL" | "MEETING" | "REMINDER"

export type TTimelineStatus = "PROGRESSING" | "PAUSED" | "FINISHED"
export interface ITimeline {
  id: string
  title: string
  type: TTimelineType
  content: string
  status: TTimelineStatus
  description: string
  importance: number
  is_summaried: boolean
  start_time: string
  end_time?: string
  create_time: string
  update_time: string
}

export interface IAddTimelineParams {
  title: string
  type: TTimelineType
  content: string
  description?: string
}
export type TTimelineList = Array<ITimeline>
export type TTimelineResult = IApiResponse<TTimelineList>


export interface ITimelineFilter {
  type?: TTimelineType
  status?: TTimelineStatus
  start_time?: string
  end_time?: string
}

export type TAddTimelineResult = IApiResponse<ITimeline>
