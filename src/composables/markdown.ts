import MarkdownIt from 'markdown-it'
import markdownItCodeCopy from 'markdown-it-code-copy'
import highlight from 'highlight.js'
import hljsVueLanguage from 'highlight.js/lib/languages/xml'
import 'highlight.js/styles/atom-one-dark.css'
import { ElMessage } from 'element-plus'

highlight.registerLanguage('vue', hljsVueLanguage)
const mdOptions: MarkdownIt.Options = {
  html: true, // Enable HTML tags in source
  linkify: true,
  typographer: true,
  breaks: true,
  langPrefix: 'language-',
  highlight(str: string, lang: string) {
    if (lang && highlight.getLanguage(lang)) {
      try {
        return '<pre class="hljs"><code>' + highlight.highlight(str, { language: lang, ignoreIllegals: true }).value + '</code></pre>'
      } catch (__) {}
    }
    return ''
  }
}

export default new MarkdownIt(mdOptions).use(markdownItCodeCopy, {
  iconStyle: 'color: white; font-size: 18px;',
  iconClass: 'iconfont icon-copy_code',
  successIconClass: 'iconfont .icon-fuzhichenggong',
  onSuccess: (trigger: HTMLElement) => {
    ElMessage.success('copied to clipboard')
  }
})
