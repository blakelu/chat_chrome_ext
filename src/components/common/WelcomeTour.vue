<template>
  <div v-if="showTour" class="welcome-tour">
    <div class="tour-backdrop" @click="skipTour"></div>
    <div class="tour-step" :style="currentStepStyle">
      <div class="tour-content">
        <div class="step-count">{{ currentStep + 1 }}/{{ steps.length }}</div>
        <h3 class="step-title">{{ steps[currentStep].title }}</h3>
        <p class="step-description">{{ steps[currentStep].description }}</p>
        
        <div class="tour-actions">
          <el-button 
            size="small" 
            @click="skipTour" 
            text
          >跳过</el-button>
          <div class="navigation-buttons">
            <el-button 
              size="small" 
              @click="prevStep" 
              v-if="currentStep > 0"
            >上一步</el-button>
            <el-button 
              size="small" 
              type="primary" 
              @click="nextStep"
            >{{ currentStep === steps.length - 1 ? '完成' : '下一步' }}</el-button>
          </div>
        </div>
      </div>
      <div class="tour-arrow" :class="steps[currentStep].arrowPosition || 'bottom'"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useStorage } from '@vueuse/core';

interface TourStep {
  title: string;
  description: string;
  element: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  arrowPosition?: 'top' | 'bottom' | 'left' | 'right';
}

const steps: TourStep[] = [
  {
    title: '欢迎使用 CloseAI',
    description: '这个简短的向导将帮助您了解主要功能和操作方式。',
    element: '.mode-select',
    position: 'bottom',
  },
  {
    title: '选择模型',
    description: '在这里可以选择不同的 AI 模型，包括OpenAI的GPT系列、图像生成和语音转换模型。',
    element: '.model-selector',
    position: 'right',
  },
  {
    title: '会话操作',
    description: '使用这些工具按钮上传图片、调整参数、设置角色扮演等功能。',
    element: '.tools-left',
    position: 'bottom',
  },
  {
    title: '主要功能',
    description: '这些按钮可以切换主题、打开设置、清空对话或新建会话。',
    element: '.tools-right',
    position: 'bottom',
    arrowPosition: 'top'
  },
  {
    title: '输入区域',
    description: '在这里输入您的问题，支持Ctrl+Enter快速发送，上下键导航历史消息。',
    element: '.custom-textarea',
    position: 'top',
    arrowPosition: 'bottom'
  },
  {
    title: '开始对话吧',
    description: '您已了解所有基本功能，现在可以开始与 AI 助手对话了！',
    element: '.enter-icon',
    position: 'left',
  },
];

const props = defineProps({
  autoStart: {
    type: Boolean,
    default: true
  }
});

const currentStep = ref(0);
const showTour = ref(false);
const firstVisit = useStorage('FIRST_VISIT', true);

// Calculate position for current step
const currentStepStyle = computed(() => {
  try {
    const element = document.querySelector(steps[currentStep.value].element);
    if (!element) return { top: '50%', left: '50%' };
    
    const rect = element.getBoundingClientRect();
    const position = steps[currentStep.value].position;
    
    let style = {};
    const margin = 12; // margin between target and tooltip
    
    switch (position) {
      case 'top':
        style = {
          bottom: `${window.innerHeight - rect.top + margin}px`,
          left: `${rect.left + rect.width / 2}px`,
          transform: 'translateX(-50%)'
        };
        break;
      case 'bottom':
        style = {
          top: `${rect.bottom + margin}px`,
          left: `${rect.left + rect.width / 2}px`,
          transform: 'translateX(-50%)'
        };
        break;
      case 'left':
        style = {
          right: `${window.innerWidth - rect.left + margin}px`,
          top: `${rect.top + rect.height / 2}px`,
          transform: 'translateY(-50%)'
        };
        break;
      case 'right':
        style = {
          left: `${rect.right + margin}px`,
          top: `${rect.top + rect.height / 2}px`,
          transform: 'translateY(-50%)'
        };
        break;
      default:
        style = { top: '50%', left: '50%' };
    }
    
    return style;
  } catch (error) {
    console.error('Error positioning tour step:', error);
    return { top: '50%', left: '50%' };
  }
});

// Start tour if it's first visit
onMounted(() => {
  if (props.autoStart && firstVisit.value) {
    // Small delay to ensure DOM is fully loaded
    setTimeout(() => {
      startTour();
    }, 1000);
  }
});

// Navigation methods
function nextStep() {
  if (currentStep.value < steps.length - 1) {
    currentStep.value++;
  } else {
    completeTour();
  }
}

function prevStep() {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
}

function skipTour() {
  completeTour();
}

function startTour() {
  showTour.value = true;
  currentStep.value = 0;
}

function completeTour() {
  showTour.value = false;
  firstVisit.value = false;
}

// Expose methods
defineExpose({
  startTour,
  skipTour
});
</script>

<style scoped>
.welcome-tour {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10000;
  pointer-events: none;
}

.tour-backdrop {
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  pointer-events: auto;
}

.tour-step {
  position: fixed;
  width: 320px;
  pointer-events: auto;
  z-index: 10001;
}

.tour-content {
  background-color: var(--app-card-bg);
  border-radius: var(--app-border-radius-lg);
  box-shadow: var(--app-shadow-lg);
  padding: 20px;
}

.step-count {
  font-size: 12px;
  color: var(--app-text-secondary);
  margin-bottom: 8px;
}

.step-title {
  font-size: var(--app-font-size-large);
  font-weight: 600;
  margin: 0 0 8px 0;
  color: var(--app-text-color);
}

.step-description {
  font-size: var(--app-font-size-base);
  color: var(--app-text-secondary);
  margin: 0 0 16px 0;
  line-height: 1.6;
}

.tour-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.navigation-buttons {
  display: flex;
  gap: 8px;
}

.tour-arrow {
  position: absolute;
  width: 12px;
  height: 12px;
  background-color: var(--app-card-bg);
  transform: rotate(45deg);
  
  &.top {
    top: -6px;
    left: 50%;
    transform: translateX(-50%) rotate(45deg);
  }
  
  &.bottom {
    bottom: -6px;
    left: 50%;
    transform: translateX(-50%) rotate(45deg);
  }
  
  &.left {
    left: -6px;
    top: 50%;
    transform: translateY(-50%) rotate(45deg);
  }
  
  &.right {
    right: -6px;
    top: 50%;
    transform: translateY(-50%) rotate(45deg);
  }
}
</style>
