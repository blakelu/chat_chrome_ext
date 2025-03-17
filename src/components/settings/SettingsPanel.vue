<template>
  <el-drawer
    v-model="drawer"
    title="会话设置"
    direction="rtl"
    size="320px"
  >
    <div class="settings-panel">
      <div class="settings-section">
        <div class="section-title">基础设置</div>
        
        <div class="setting-item">
          <span class="setting-label">流式输出</span>
          <el-switch v-model="settings.stream" />
        </div>
        
        <div class="setting-item">
          <span class="setting-label">温度</span>
          <div class="setting-control">
            <el-slider 
              v-model="settings.temperature" 
              :min="0" 
              :max="2" 
              :step="0.1" 
              show-input
            />
          </div>
        </div>
        
        <div class="setting-item">
          <span class="setting-label">上下文限制</span>
          <div class="setting-control">
            <el-input-number 
              v-model="settings.limitContext" 
              :min="1" 
              :max="20" 
              size="small" 
            />
          </div>
        </div>

        <div class="setting-item" v-if="modelType === 'dalle'">
          <span class="setting-label">图像尺寸</span>
          <div class="setting-control">
            <el-select v-model="settings.dalleSize" size="small">
              <el-option label="1024x1024" value="1024x1024" />
              <el-option label="1024x1792" value="1024x1792" />
              <el-option label="1792x1024" value="1792x1024" />
            </el-select>
          </div>
        </div>

        <div class="setting-item" v-if="modelType === 'dalle'">
          <span class="setting-label">图像风格</span>
          <div class="setting-control">
            <el-radio-group v-model="settings.dalleStyle" size="small">
              <el-radio-button label="vivid">生动</el-radio-button>
              <el-radio-button label="natural">自然</el-radio-button>
            </el-radio-group>
          </div>
        </div>
      </div>
      
      <div class="settings-section">
        <div class="section-title">系统提示词</div>
        <el-input
          v-model="settings.prompt"
          type="textarea"
          :rows="4"
          placeholder="可以设定AI的角色和行为规则..."
        />
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  settings: {
    type: Object,
    required: true
  },
  modelName: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:modelValue']);

const drawer = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const modelType = computed(() => {
  if (props.modelName.includes('dall-e')) {
    return 'dalle';
  } else if (props.modelName.includes('tts')) {
    return 'tts';
  }
  return 'chat';
});
</script>

<style lang="less" scoped>
.settings-panel {
  padding: 16px;
  
  .settings-section {
    margin-bottom: 24px;
    
    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--app-text-color);
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--app-border-color);
    }
    
    .setting-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      
      .setting-label {
        font-size: 14px;
        color: var(--app-text-color);
      }
      
      .setting-control {
        width: 60%;
      }
    }
  }
}
</style>
