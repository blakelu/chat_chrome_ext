// import { get, post } from '@/api/http'
import { get, post } from '@/api/fetch'
import { AnyObject } from '@/interface'

// 获取电视墙工单详情根据第三方设备id
export const queryLastUnfinishTaskByThirdVerifyId = (params: AnyObject) => {
  return get(`${import.meta.env.VITE_BASE_URL}/workorder/quesTask/queryLastUnfinishTaskByThirdVerifyId`, params)
}
