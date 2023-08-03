import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import crx from 'vite-plugin-crx-mv3'
// 按需引入
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export const commonConfig = {
  plugins: [
    vue(),
    crx.default({
      manifest: './src/manifest.json'
    }),
    AutoImport({
      resolvers: [ElementPlusResolver()]
    }),
    Components({
      resolvers: [ElementPlusResolver()]
    })
  ]
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    base: './',
    resolve: {
      extensions: ['.js', '.vue'],
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    },
    ...commonConfig,
    build: {
      emptyOutDir: mode == 'production',
      minify: false
    }
  }
})
