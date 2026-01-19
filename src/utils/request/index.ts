import LFRequest from './request'

export const httpClient = new LFRequest({
  baseURL: import.meta.env.VITE_BASE_API,
  timeout: 60000,
})
