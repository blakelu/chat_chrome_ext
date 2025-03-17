<template>
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
          <span class="key">N</span>
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
</template>

<script setup lang="ts">
// No script content needed for this component
</script>

<style lang="less" scoped>
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
</style>
