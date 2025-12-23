import { get, post } from './http.ts'
import { useAppStorage } from '@/composables/useAppStorage.ts'
const commonSettings: any = useAppStorage('COMMON_SETTINGS', {})

// 获取配置文件
export const getTestConfig = (data: any) => get(`https://yswy-resource.obs.cn-east-3.myhuaweicloud.com/close/testApi.json`, data)

// 添加blinko笔记
export const addBlinkoNote = (data: any) =>
  post({
    url: `${commonSettings.value.blinkoUrl}/api/v1/note/upsert`,
    data,
    headers: {
      Authorization: `Bearer ${commonSettings.value.blinkoToken}`
    }
  })
