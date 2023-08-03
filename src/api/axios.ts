import axios, { AxiosResponse, AxiosRequestConfig } from 'axios'
import { ResultEnum } from '@/enums'

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL_DSM,
  timeout: ResultEnum.TIMEOUT
})

axiosInstance.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    return config
  },
  (error: AxiosRequestConfig) => {
    Promise.reject(error)
  }
)

// 响应拦截器
axiosInstance.interceptors.response.use(
  (res: AxiosResponse) => {
    const { code } = res.data as { code: number }
    if (code === ResultEnum.DATA_SUCCESS) return Promise.resolve(res.data)
    // 重定向
    // if (ErrorPageNameMap.get(code)) redirectErrorPage(code)
    return Promise.resolve(res.data)
  },
  (err: AxiosResponse) => {
    Promise.reject(err)
  }
)

export default axiosInstance
