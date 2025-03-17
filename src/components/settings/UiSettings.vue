<template>
  <div class="ui-settings">
    <h4 class="section-title">界面设置</h4>
    
    <div class="setting-section">
      <div class="setting-row">
        <span class="setting-label">界面主题</span>
        <div class="theme-selector">
          <div 
            class="theme-option light"
            :class="{'active': themeSettings.theme === 'light'}"
            @click="updateTheme('light')"
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
            @click="updateTheme('dark')"
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
            @click="updateTheme('auto')"
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
</template>

<script setup lang="ts">
const props = defineProps({
  themeSettings: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['updateTheme']);

const updateTheme = (theme) => {
  emit('updateTheme', theme);
};
</script>

<style lang="less" scoped>
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
</style>
