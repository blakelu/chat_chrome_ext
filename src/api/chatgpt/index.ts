import { get, post } from '@/api/fetch'
import { AnyObject } from '@/interface'

const bodyCommonParams = { max_tokens: 60, n: 1, stop: '\n' }
// const apiUrl = 'https://api.openai.com/v1/engines/davinci-codex/completions'
// const authKey = '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'
const apiUrl = 'https://ai.fakeopen.com/v1/chat/completions'
const authKey = 'pk-this-is-a-real-free-pool-token-for-everyone'
// 获取chat
export const chat = (params: AnyObject) => {
  return get(apiUrl, { ...bodyCommonParams, ...params }, { Authorization: `Bearer ${authKey}` })
}
