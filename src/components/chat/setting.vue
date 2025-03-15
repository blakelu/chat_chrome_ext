<template>
  <div class="settings-drawer">
    <el-drawer v-model="drawer" size="95%" direction="btt" :destroy-on-close="false">
      <template #header>
        <div class="drawer-header">
          <h3>设置中心</h3>
          <el-button @click="drawer = false" size="small" class="close-btn" type="default">
            完成
          </el-button>
        </div>
      </template>
      <div class="drawer-content">
        <el-tabs v-model="activeName" class="settings-tabs">
          <el-tab-pane label="API设置" name="API">
            <div class="tab-content">
              <chooseApi @confirm="onConfirm" />
            </div>
          </el-tab-pane>
          <el-tab-pane label="模型设置" name="model">
            <div class="tab-content">
              <chooseModel />
            </div>
          </el-tab-pane>
          <el-tab-pane label="界面设置" name="ui">
            <div class="tab-content">
              <div class="ui-settings">
                <h4 class="section-title">界面设置</h4>
                
                <div class="setting-section">
                  <div class="setting-row">
                    <span class="setting-label">界面主题</span>
                    <div class="theme-selector">
                      <div 
                        class="theme-option light"
                        :class="{'active': themeSettings.theme === 'light'}"
                        @click="setTheme('light')"
                      >
                        <div class="theme-preview">
                          <div class="theme-header"></div>
                          <div class="theme-body"></div>
                        </div>
                        <span>浅色</span>
                      </div>
                      <div 
                        class="theme-option dark"
                        :class="{'active': themeSettings.theme === 'dark'}"
                        @click="setTheme('dark')"
                      >
                        <div class="theme-preview">
                          <div class="theme-header"></div>
                          <div class="theme-body"></div>
                        </div>
                        <span>深色</span>
                      </div>
                      <div 
                        class="theme-option auto"
                        :class="{'active': themeSettings.theme === 'auto'}"
                        @click="setTheme('auto')"
                      >
                        <div class="theme-preview">
                          <div class="theme-header"></div>
                          <div class="theme-body"></div>
                        </div>
                        <span>自动</span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="setting-row">
                    <span class="setting-label">字体大小</span>
                    <el-radio-group v-model="themeSettings.fontSize" size="small">
                      <el-radio-button label="small">小</el-radio-button>
                      <el-radio-button label="medium">中</el-radio-button>
                      <el-radio-button label="large">大</el-radio-button>
                    </el-radio-group>
                  </div>
                  
                  <div class="setting-row">
                    <span class="setting-label">界面紧凑度</span>
                    <el-radio-group v-model="themeSettings.density" size="small">
                      <el-radio-button label="compact">紧凑</el-radio-button>
                      <el-radio-button label="comfortable">舒适</el-radio-button>
                    </el-radio-group>
                  </div>
                </div>
                
                <h4 class="section-title">滚动和动画设置</h4>
                <div class="setting-section">
                  <div class="setting-row">
                    <span class="setting-label">允许平滑滚动</span>
                    <el-switch v-model="themeSettings.smoothScrolling" />
                  </div>
                  
                  <div class="setting-row">
                    <span class="setting-label">动画效果</span>
                    <el-switch v-model="themeSettings.animations" />
                  </div>
                </div>
                
                <h4 class="section-title">无障碍设置</h4>
                <div class="setting-section">
                  <div class="setting-row">
                    <span class="setting-label">高对比度</span>
                    <el-switch v-model="themeSettings.highContrast" />
                  </div>
                  
                  <div class="setting-row">
                    <span class="setting-label">减少动态效果</span>
                    <el-switch v-model="themeSettings.reducedMotion" />
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="快捷键" name="shortcuts">
            <div class="tab-content">
              <div class="shortcuts-settings">
                <h4 class="section-title">快捷键设置</h4>
                
                <div class="shortcuts-table">
                  <div class="shortcuts-row">
                    <div class="shortcuts-action">打开侧边栏</div>
                    <div class="shortcuts-keys">
                      <span class="key">Ctrl</span>
                      <span>+</span>
                      <span class="key">Shift</span>
                      <span>+</span>
                      <span class="key">I</span>
                    </div>
                  </div>
                  
                  <div class="shortcuts-row">
                    <div class="shortcuts-action">新建会话</div>
                    <div class="shortcuts-keys">
                      <span class="key">Ctrl</span>
                      <span>+</span>
                      <span class="key">I</span>
                    </div>
                  </div>
                  
                  <div class="shortcuts-row">
                    <div class="shortcuts-action">发送消息</div>
                    <div class="shortcuts-keys">
                      <span class="key">Ctrl</span>
                      <span>+</span>
                      <span class="key">Enter</span>
                    </div>
                  </div>
                  
                  <div class="shortcuts-row">
                    <div class="shortcuts-action">清除当前会话</div>
                    <div class="shortcuts-keys">
                      <span class="key">Ctrl</span>
                      <span>+</span>
                      <span class="key">Shift</span>
                      <span>+</span>
                      <span class="key">Del</span>
                    </div>
                  </div>
                </div>
                
                <div class="shortcuts-note">
                  <el-alert type="info" :closable="false" show-icon>
                    Mac用户请将 Ctrl 替换为 Command (⌘)
                  </el-alert>
                </div>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="关于" name="about">
            <div class="tab-content about-tab">
              <div class="about-section">
                <img src="@/assets/icons/ROBOT.png" alt="Logo" class="app-logo">
                <h2>CloseAI</h2>
                <p class="version">v1.0.0</p>
                
                <div class="badges">
                  <span class="badge version-badge">1.0.0</span>
                  <span class="badge type-badge">Chrome 扩展</span>
                  <span class="badge status-badge">Beta</span>
                </div>
                
                <p class="description">
                  这是一个强大的 Chrome 扩展程序，通过便捷的侧边栏让您可以在任何网页中轻松访问 AI 助手。
                  支持多种模型和自定义设置，满足各种需求场景。
                </p>
                
                <div class="features">
                  <h4>主要功能</h4>
                  <div class="feature-grid">
                    <div class="feature-item">
                      <el-icon class="feature-icon"></el-icon>
                      <span>多种 AI 模型</span>
                    </div>
                    <div class="feature-item">
                      <el-icon class="feature-icon"></el-icon>
                      <span>角色提示模板</span>
                    </div>
                    <div class="feature-item">
                      <el-icon class="feature-icon"></el-icon>
                      <span>图像生成</span>
                    </div>
                    <div class="feature-item">
                      <el-icon class="feature-icon"></el-icon>
                      <span>语音合成</span>
                    </div>
                    <div class="feature-item">
                      <el-icon class="feature-icon"></el-icon>
                      <span>多API配置</span>
                    </div>
                    <div class="feature-item">
                      <el-icon class="feature-icon"></el-icon>
                      <span>历史会话管理</span>
                    </div>
                  </div>
                </div>
                
                <div class="github-info">
                  <a href="https://github.com/blakelu/chat_chrome_ext" target="_blank" class="github-link">
                    <el-icon></el-icon>
                    访问 GitHub 仓库
                  </a>
                </div>
                
                <p class="copyright">
                  &copy; {{ new Date().getFullYear() }} CloseAI Team. 保留所有权利。
                </p>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import chooseApi from './chooseApi.vue'
import chooseModel from './chooseModel.vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})
const emit = defineEmits(['update:show', 'confirm'])

const drawer = useVModel(props, 'show', emit)
const activeName = ref('API')

// UI theme settings (these would need to be connected to actual theme implementation)
const defaultThemeSettings = {
  theme: 'light', // light, dark, auto
  fontSize: 'medium', // small, medium, large 
  density: 'comfortable', // compact, comfortable
  smoothScrolling: true,
  animations: true,
  highContrast: false,
  reducedMotion: false
}

const themeSettings = useStorage('UI_SETTINGS', defaultThemeSettings, localStorage, { mergeDefaults: true })

const setTheme = (theme: string) => {
  themeSettings.value.theme = theme
  document.documentElement.setAttribute('data-theme', theme)
  ElMessage.success(`已切换至${theme === 'light' ? '浅色' : theme === 'dark' ? '深色' : '自动'}模式`)
}

// Apply theme on component mount
onMounted(() => {
  const theme = themeSettings.value.theme
  if (theme === 'auto') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light')
  } else {
    document.documentElement.setAttribute('data-theme', theme)
  }
})

const onConfirm = (val: any) => {
  emit('confirm', val)
}
</script>

<style lang="less" scoped>
.settings-drawer {
  :deep(.el-drawer__header) {
    margin-bottom: 0;
    padding: 0;
  }
  
  :deep(.el-drawer__body) {
    padding: 0;
    overflow: hidden;
  }
  
  .drawer-header {
    padding: 16px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #e2e8f0;
    
    h3 {
      font-size: 20px;
      font-weight: 600;
      color: #0f172a;
      margin: 0;
    }
    
    .close-btn {
      font-weight: 500;
    }
  }
  
  .drawer-content {
    height: 100%;
    display: flex;
    flex-direction: column;
    
    .settings-tabs {
      height: 100%;
      display: flex;
      flex-direction: column;
      
      :deep(.el-tabs__header) {
        background-color: #f8fafc;
        padding: 0 20px;
        margin: 0;
        border-bottom-color: #e2e8f0;
        
        .el-tabs__nav-wrap {
          display: flex;
          justify-content: center;
        }
        
        .el-tabs__item {
          height: 50px;
          line-height: 50px;
          font-size: 16px;
          font-weight: 500;
          color: #64748b;
          transition: all 0.3s ease;
          padding: 0 24px;
          
          &.is-active {
            color: #3b82f6;
            font-weight: 600;
          }
          
          &:hover {
            color: #3b82f6;
          }
        }
        
        .el-tabs__active-bar {
          background-color: #3b82f6;
          height: 3px;
          bottom: 0;
          border-radius: 3px 3px 0 0;
        }
      }
      
      :deep(.el-tabs__content) {
        flex: 1;
        overflow-y: auto;
        
        .el-tab-pane {
          height: 100%;
        }
      }
    }
    
    .tab-content {
      height: 100%;
      padding: 0;
      
      &.about-tab {
        display: flex;
        justify-content: center;
        padding: 20px 0;
        
        .about-section {
          max-width: 600px;
          text-align: center;
          padding: 20px;
          
          .app-logo {
            width: 80px;
            height: 80px;
            margin-bottom: 16px;
            border-radius: 16px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }
          
          h2 {
            font-size: 24px;
            font-weight: 700;
            color: #0f172a;
            margin: 0 0 4px;
          }
          
          .version {
            font-size: 14px;
            color: #64748b;
            margin: 0 0 16px;
          }
          
          .badges {
            display: flex;
            justify-content: center;
            gap: 8px;
            margin-bottom: 24px;
            
            .badge {
              padding: 4px 10px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 500;
              
              &.version-badge {
                background-color: #e0f2fe;
                color: #0284c7;
              }
              
              &.type-badge {
                background-color: #f0fdf4;
                color: #16a34a;
              }
              
              &.status-badge {
                background-color: #fef3c7;
                color: #d97706;
              }
            }
          }
          
          .description {
            font-size: 16px;
            color: #334155;
            line-height: 1.6;
            margin-bottom: 24px;
          }
          
          .features {
            background-color: #f8fafc;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 24px;
            text-align: left;
            
            h4 {
              font-size: 18px;
              font-weight: 600;
              color: #0f172a;
              margin: 0 0 16px;
              text-align: center;
            }
            
            .feature-grid {
              display: grid;
              grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
              gap: 16px;
              
              .feature-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 8px;
                padding: 16px 10px;
                background-color: #fff;
                border-radius: 8px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
                
                .feature-icon {
                  font-size: 24px;
                  color: #3b82f6;
                }
                
                span {
                  font-size: 14px;
                  color: #334155;
                  font-weight: 500;
                }
              }
            }
          }
          
          .github-info {
            margin-bottom: 24px;
            
            .github-link {
              display: inline-flex;
              align-items: center;
              gap: 6px;
              padding: 8px 16px;
              background-color: #24292e;
              color: #fff;
              border-radius: 8px;
              text-decoration: none;
              font-weight: 500;
              transition: all 0.2s ease;
              
              &:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
              }
            }
          }
          
          .copyright {
            font-size: 13px;
            color: #94a3b8;
          }
        }
      }
    }
  }
  
  // UI Settings Tab
  .ui-settings {
    padding: 20px;
    
    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: #0f172a;
      margin: 0 0 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid #e2e8f0;
    }
    
    .setting-section {
      margin-bottom: 24px;
      
      .setting-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 8px;
        border-bottom: 1px solid #f1f5f9;
        
        &:last-child {
          border-bottom: none;
        }
        
        .setting-label {
          font-size: 15px;
          color: #334155;
        }
      }
    }
    
    .theme-selector {
      display: flex;
      gap: 16px;
      
      .theme-option {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        
        &.active .theme-preview {
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.4);
        }
        
        .theme-preview {
          width: 64px;
          height: 64px;
          border-radius: 8px;
          border: 2px solid #e2e8f0;
          overflow: hidden;
          transition: all 0.2s ease;
          
          .theme-header {
            height: 16px;
          }
          
          .theme-body {
            height: 48px;
          }
        }
        
        &.light {
          .theme-header {
            background-color: #3b82f6;
          }
          
          .theme-body {
            background-color: #f8fafc;
          }
        }
        
        &.dark {
          .theme-header {
            background-color: #2563eb;
          }
          
          .theme-body {
            background-color: #111827;
          }
        }
        
        &.auto {
          .theme-header {
            background: linear-gradient(to right, #3b82f6 50%, #2563eb 50%);
          }
          
          .theme-body {
            background: linear-gradient(to right, #f8fafc 50%, #111827 50%);
          }
        }
        
        span {
          font-size: 13px;
          color: #64748b;
        }
      }
    }
  }
  
  // Shortcuts Tab
  .shortcuts-settings {
    padding: 20px;
    
    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: #0f172a;
      margin: 0 0 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid #e2e8f0;
    }
    
    .shortcuts-table {
      margin-bottom: 24px;
      
      .shortcuts-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 14px 8px;
        border-bottom: 1px solid #f1f5f9;
        
        &:last-child {
          border-bottom: none;
        }
        
        .shortcuts-action {
          font-size: 15px;
          color: #334155;
        }
        
        .shortcuts-keys {
          display: flex;
          align-items: center;
          gap: 6px;
          
          .key {
            background-color: #f1f5f9;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
            padding: 3px 8px;
            font-size: 13px;
            font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
            color: #475569;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
          }
        }
      }
    }
    
    .shortcuts-note {
      margin-top: 24px;
    }
  }
}
</style>
