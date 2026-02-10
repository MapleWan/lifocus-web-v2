import type { IApiResponse } from './apiTypes'

export interface IProjectInfo {
  id: string,
  type: string,
  name: string,
  icon: string,
  description: string,
  status: string,
  create_time: string,
  update_time: string,
}

export interface IAddProjectParams {
  name: string,
  description: string,
  type: string,
  status: string,
}

export type TProjectList = Array<IProjectInfo>

export type TProjectResult = IApiResponse<TProjectList>

export type TAddProjectResult = IApiResponse<IProjectInfo>

