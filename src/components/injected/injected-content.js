import { createApp } from 'vue'
import App from './App.vue'
import './index.css'

window.onload = async () => {
  const el = document.querySelector('body')
  if (el) {
    el.insertAdjacentHTML('afterend', '<div id="closeAI-app"></div>')
    const app = createApp(App)
    app.mount('#closeAI-app')
  }
}
