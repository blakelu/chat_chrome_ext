<template>
  <div class="about-section">
    <img src="@/assets/icons/icon.png" alt="Logo" class="app-logo">
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
          <el-icon class="feature-icon"><ep-cpu /></el-icon>
          <span>多种 AI 模型</span>
        </div>
        <div class="feature-item">
          <el-icon class="feature-icon"><ep-avatar /></el-icon>
          <span>角色提示模板</span>
        </div>
        <div class="feature-item">
          <el-icon class="feature-icon"><ep-picture /></el-icon>
          <span>图像生成</span>
        </div>
        <div class="feature-item">
          <el-icon class="feature-icon"><ep-microphone /></el-icon>
          <span>语音合成</span>
        </div>
        <div class="feature-item">
          <el-icon class="feature-icon"><ep-connection /></el-icon>
          <span>多API配置</span>
        </div>
        <div class="feature-item">
          <el-icon class="feature-icon"><ep-clock /></el-icon>
          <span>历史会话管理</span>
        </div>
      </div>
    </div>
    
    <p class="copyright">
      &copy; {{ new Date().getFullYear() }} CloseAI Team. 保留所有权利。
    </p>
  </div>
</template>

<script setup lang="ts">
// No script content needed for this component
</script>

<style lang="less" scoped>
.about-section {
  width: 600px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  .app-logo {
    width: 80px;
    height: 80px;
    margin-bottom: 16px;
    border-radius: 16px;
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
    width: 100%;
    background-color: #f8fafc;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 24px;
    display: flex;
    flex-direction: column;
    
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
</style>
