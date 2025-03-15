import { createApp } from 'vue'
import './style.css'
import '@/assets/fonts/iconfont.js'
import '@/assets/fonts/iconfont.css'
import App from './App.vue'
import { ToastPlugin } from './plugins/toastPlugin.ts'

const app = createApp(App)
app.use(ToastPlugin)
app.mount('#app')
