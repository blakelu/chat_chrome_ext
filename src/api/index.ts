import { get } from './http.ts'

// 获取配置文件
export const getTestConfig = (data: any) => get(`https://yswy-resource.obs.cn-east-3.myhuaweicloud.com/close/testApi.json`, data)
