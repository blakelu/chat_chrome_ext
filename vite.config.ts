import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import crx from 'vite-plugin-crx-mv3'
// 按需引入
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
// 按需映入icons
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export const commonConfig = {
  plugins: [
    vue(),
    crx.default({
      manifest: './src/manifest.json'
    }),
    AutoImport({
      imports: ['vue', 'vue-router', '@vueuse/core'],
      dts: true,
      resolvers: [ElementPlusResolver()]
    }),
    Components({
      resolvers: [
        // 自动注册图标组件
        IconsResolver({
          // 修改Icon组件前缀，不设置则默认为i,禁用则设置为false
          prefix: false,
          // 指定collection，即指定为elementplus图标集ep
          enabledCollections: ['ep']
        }),
        // 自动导入 Element Plus 组件
        ElementPlusResolver()
      ]
    }),
    // Icons图标自动下载
    Icons({
      autoInstall: true
    }),
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
      minify: false,
      rollupOptions: {
        output: {
          manualChunks(id) {
            // 判断是否为第三方依赖，将其拆分到 vendor 中
            if (id.includes('node_modules')) {
              // 这里代码可以优化一下，但是我懒，我相信你一定可以的！
              if (id.includes('dayjs')) {
                return 'dayjs'
              } else if (id.includes('lodash')) {
                return 'lodash'
              } else if (id.includes('highlight')) {
                return 'highlight'
              } else if (id.includes('markdown-it')) {
                return 'markdown-it'
              } else {
                return 'vendor'
              }
            }
          }
        }
      }
    }
  }
})
