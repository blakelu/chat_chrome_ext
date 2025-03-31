import axios, { type AxiosResponse, type AxiosRequestConfig, AxiosError } from 'axios'

const axiosInstance = axios.create({
  baseURL: '',
  timeout: 60000,
  headers: {}
})

axiosInstance.interceptors.request.use(
  (config) => {
    return config
  },
  (error: AxiosRequestConfig) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
axiosInstance.interceptors.response.use(
  (res: AxiosResponse) => {
    return Promise.resolve(res.data)
  },
  (err: AxiosError) => {
    if (err.code === 'ERR_NETWORK') {
      err.message = '网络不佳，请稍后重试'
    }
    return Promise.reject(err)
  }
)

export default axiosInstance
