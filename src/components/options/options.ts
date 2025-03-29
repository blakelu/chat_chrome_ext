import { createApp } from 'vue'
// import ElementPlus from 'element-plus'
// import 'element-plus/dist/index.css'
// import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './options.vue'
// import '@/assets/styles/index.less'

const app = createApp(App)

// Register all Element Plus icons
// for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
//   app.component(`ep-${key}`, component)
// }

// app.use(ElementPlus)
app.mount('#app')
