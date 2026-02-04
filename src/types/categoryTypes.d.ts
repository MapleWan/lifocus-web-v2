import type { IApiResponse } from './apiTypes'

// 定义分类（目录）的基本信息类型
export interface ICategory {
  id: number;
  project_id: string;
  name: string;
  parent_id: number | null;
  icon: string | null;
  description: string | null;
  is_deleted: boolean;
  delete_time: string | null;
  create_time: string;
  update_time: string;
  full_path: string;
  children?: ICategory[];
}

// 分类响应数据类型
export type ICategoryResponse = IApiResponse<ICategory[]>;

// 创建分类请求参数类型
export interface ICreateCategoryRequest {
  name: string;
  parent_id?: string | number | null;
  category_full_path?: string | null;
  icon?: string | null;
  description?: string | null;
}

// 更新分类请求参数类型
export interface IUpdateCategoryRequest {
  id: number;
  name?: string;
  parent_id?: number | null;
  icon?: string | null;
  description?: string | null;
}
