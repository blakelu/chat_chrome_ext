import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path, { resolve } from 'path'
import crx from 'vite-plugin-crx-mv3'
import { fileURLToPath, URL } from 'node:url'
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
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    ...commonConfig,
    optimizeDeps: {
      include: ['markdown-it', '@element-plus/icons-vue', 'dayjs']
    },
    build: {
      assetsInlineLimit: 8192,
      emptyOutDir: mode == 'production',
      minify: false,
      rollupOptions: {
        // input: {
        //   popup: resolve(__dirname, 'popup.html'),
        //   background: resolve(__dirname, 'src/background.js'),
        //   contentScript: resolve(__dirname, 'src/contentScript.js'),
        //   injectedContent: resolve(__dirname, 'src/components/injected/injected-content.js'),
        //   injectedApp: resolve(__dirname, 'src/components/injected/injected-app.js')
        // },
        output: {
          // assetFileNames: 'assets/[name].[ext]',
          // entryFileNames: (chunkInfo) => {
          //   return 'assets/[name]-[hash].js'
          // },
          chunkFileNames: 'assets/[name]-[hash].js',
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('element-plus')) {
                return 'element-plus'
              }
              if (id.includes('openai')) {
                return 'openai'
              }
              if (id.includes('markdown-it')) {
                return 'markdown'
              }
            }
          }
        }
      }
    }
  }
})
