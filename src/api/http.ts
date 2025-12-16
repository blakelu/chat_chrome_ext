import axiosInstance from './axios.ts'

export const get = (url: string, params?: object, headers?: object) => {
  return axiosInstance({
    url: url,
    method: 'get',
    params: params,
    headers: {
      ...translateStr(headers)
    }
  })
}

export const post = ({ url, data, headersType, headers }: { url: string; data?: object; headersType?: string; headers?: object }) => {
  return axiosInstance({
    url: url,
    method: 'post',
    data: data,
    headers: {
      'Content-Type': headersType || 'application/json;charset=UTF-8',
      ...translateStr(headers)
    }
  })
}
export const upload = (url: string, data: any = {}, headers?: object) => {
  const fd = new FormData()
  Object.keys(data).forEach((key) => {
    if (Array.isArray(data[key]) && data[key].length) {
      data[key].forEach((item: any) => {
        fd.append(key, item)
      })
    } else {
      fd.append(key, data[key])
    }
  })
  return axiosInstance({
    url: url,
    method: 'post',
    data: fd,
    headers: {
      'Content-Type': 'multipart/form-data;charset=UTF-8',
      ...translateStr(headers)
    }
  })
}

// 获取请求函数，默认get
export const http = (type?: string) => {
  switch (type) {
    case 'get':
      return get

    case 'post':
      return post

    default:
      return get
  }
}
const prefix = 'javascript:'
// 对输入字符进行转义处理
export const translateStr = (target?: string | object) => {
  if (typeof target === 'undefined') {
    return {}
  }
  if (typeof target === 'string') {
    if (target.startsWith(prefix)) {
      const funcStr = target.split(prefix)[1]
      let result
      try {
        result = new Function(`${funcStr}`)()
      } catch (error) {
        console.error(error)
      }
      return result
    } else {
      return target
    }
  }
  for (const key in target) {
    if (Object.prototype.hasOwnProperty.call(target, key)) {
      const subTarget = (target as any)[key]
      ;(target as any)[key] = translateStr(subTarget)
    }
  }
  return target
}
