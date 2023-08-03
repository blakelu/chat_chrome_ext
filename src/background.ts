// 不支持ajax 使用fetch代替
import { queryLastUnfinishTaskByThirdVerifyId } from '@/api/home'
console.log('service worker')

// function queryOrder(thirdVerifyId = '') {
//   const params = { thirdVerifyId }
//   queryLastUnfinishTaskByThirdVerifyId(params).then((res: any) => {
//     console.log('结果:', res)
//   })
// }
// queryOrder('12312312')
