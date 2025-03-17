import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import crx from 'vite-plugin-crx-mv3'
import { fileURLToPath, URL } from 'node:url'
import { VitePWA } from 'vite-plugin-pwa'
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
    // VitePWA({
    //   registerType: 'autoUpdate',
    //   includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
    //   manifest: {
    //     name: 'CloseAI Chat',
    //     short_name: 'CloseAI',
    //     description: 'AI assistant Chrome extension with multiple models support',
    //     theme_color: '#3b82f6',
    //     icons: [
    //       {
    //         src: 'pwa-192x192.png',
    //         sizes: '192x192',
    //         type: 'image/png'
    //       },
    //       {
    //         src: 'pwa-512x512.png',
    //         sizes: '512x512',
    //         type: 'image/png',
    //         purpose: 'any maskable'
    //       }
    //     ]
    //   },
    //   workbox: {
    //     runtimeCaching: [
    //       {
    //         urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
    //         handler: 'CacheFirst',
    //         options: {
    //           cacheName: 'google-fonts-cache',
    //           expiration: {
    //             maxEntries: 10,
    //             maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
    //           },
    //           cacheableResponse: {
    //             statuses: [0, 200]
    //           }
    //         }
    //       },
    //       {
    //         urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
    //         handler: 'CacheFirst',
    //         options: {
    //           cacheName: 'gstatic-fonts-cache',
    //           expiration: {
    //             maxEntries: 10,
    //             maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
    //           },
    //           cacheableResponse: {
    //             statuses: [0, 200]
    //           }
    //         }
    //       }
    //     ]
    //   }
    // })
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
      emptyOutDir: mode == 'production',
      minify: false,
      rollupOptions: {
        output: {
          manualChunks: {
            'element-plus': ['element-plus'],
            'openai': ['openai'],
            'markdown': ['markdown-it'],
          }
        }
      }
    }
  }
})
