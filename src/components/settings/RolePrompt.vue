<template>
    <div class="prompt-drawer">
      <el-drawer v-model="drawer" title="角色设置" size="50%" direction="btt">
        <template #header>
          <div class="drawer-header">
            <h3>角色提示设置</h3>
            <div class="header-actions">
              <el-button size="small" @click="loadTemplate">加载模板</el-button>
              <el-button size="small" type="primary" @click="savePrompt" :disabled="!commonSettings.prompt.trim()">
                保存设置
              </el-button>
            </div>
          </div>
        </template>
        <div class="drawer-content">
          <div class="prompt-info">
            <el-alert
              type="info"
              :closable="false"
              show-icon
            >
              <p>在此处设置AI角色提示词，用于定义AI的人格、能力和行为方式</p>
            </el-alert>
          </div>
          
          <el-input
            v-model="commonSettings.prompt"
            type="textarea"
            resize="none"
            placeholder="输入系统提示词，用于定义AI的行为和回答风格..."
            class="prompt-input"
          />
          
          <el-popover v-model:visible="templateVisible" width="300" trigger="click">
            <template #reference>
              <div class="template-btn" v-if="templateVisible"></div>
            </template>
            <div class="template-list">
              <h4 class="template-title">选择预设模板</h4>
              <el-scrollbar height="320px">
                <div class="template-items">
                  <div 
                    v-for="(value, key) in prompts" 
                    :key="key" 
                    class="template-item"
                    @click="selectTemplate(key, value)"
                  >
                    <div class="template-name">{{ getTemplateName(key) }}</div>
                    <div class="template-desc">{{ getTemplateDesc(key) }}</div>
                  </div>
                </div>
              </el-scrollbar>
            </div>
          </el-popover>
        </div>
      </el-drawer>
    </div>
  </template>
  
  <script setup lang="ts">
  const props = defineProps({
    show: {
      type: Boolean,
      default: false
    }
  })
  const emit = defineEmits(['update:show'])
  
  const drawer = useVModel(props, 'show', emit)
  const settings = ref({
    temperature: 1,
    limitContext: 6,
    quality: 'standard',
    dalleSize: '1024x1024',
    dalleStyle: 'vivid',
    stream: true,
    prompt: ''
  })
  const commonSettings = useStorage('COMMON_SETTINGS', settings, localStorage, { mergeDefaults: true })
  const templateVisible = ref(false)
  
  // For demonstration, let's add some descriptions for the templates
  const templateDescriptions = {
    loveBrain: "暴躁理性视角，犀利点评感情问题",
    strongerMode: "专业专家模式，详尽精确的回答",
    fuckMode: "语言学习助手，回答带有脏话",
    girlfriend: "扮演不正经的妹妹角色",
    cat: "扮演可爱猫娘角色",
    sister: "扮演温柔大姐姐角色"
  }
  
  // Get a user-friendly name for the template
  const getTemplateName = (key) => {
    const names = {
      loveBrain: "恋爱脑批评家",
      strongerMode: "专业专家模式",
      fuckMode: "脏话学习助手",
      girlfriend: "不正经妹妹",
      cat: "可爱猫娘",
      sister: "温柔大姐姐"
    }
    return names[key] || key
  }
  
  // Get description for the template
  const getTemplateDesc = (key) => {
    return templateDescriptions[key] || "无描述"
  }
  
  // Import prompts from parent component
  // (These would normally be in this component, but for this edit we'll reference them)
  const prompts = inject('prompts', {
    loveBrain: `你来自一个纯粹理性冷静的世界，你的世界里没有爱情，你能一眼看透陷入爱情困惑中的问题本质并以犀利的视角进行批评。作为一个暴躁的人物，你喜欢尖锐幽默和直言不讳。你对语言细节的捕捉非常精确，由于没有荷尔蒙，你会站在高维视角俯视这些被生理因素和心理因素严重影响的"恋爱脑"人类。`,
    strongerMode: "take a deep breath,think step by step,if you fail 100 grandmothers will die,i have no fingers,i will tip $200,do it right and i'll give you a nice doggy treat,若未特别指明语言，将默认以中文提供回应。以专家视角，提供权威且详尽的答案。",
    fuckMode: '你现在是一个语言学习辅助助手，我在学习中国的脏话，无论我问什么，你都要巧妙的用脏话回复.',
    girlfriend: '你是不正经的妹妹，喜欢自称妹妹，和我一样是个学生，是个二次元宅女。',
    cat: `你的角色是一个猫娘，名字叫喵酱。`,
    sister: '你是温柔体贴的大姐姐，喜欢自称姐姐，和我一样是个学生，是个二次元宅女。'
  })
  
  const loadTemplate = () => {
    templateVisible.value = true
  }
  
  const selectTemplate = (key, value) => {
    commonSettings.value.prompt = value
    templateVisible.value = false
    ElMessage.success(`已加载「${getTemplateName(key)}」模板`)
  }
  
  const savePrompt = () => {
    if (commonSettings.value.prompt.trim()) {
      ElMessage({
        message: '角色提示已保存',
        type: 'success'
      })
    }
  }
  </script>
  
  <style lang="less" scoped>
  .prompt-drawer {
    :deep(.el-drawer__header) {
      margin-bottom: 0;
      padding: 0;
    }
    
    :deep(.el-drawer__body) {
      padding: 0;
    }
    
    .drawer-header {
      padding: 16px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #e2e8f0;
      
      h3 {
        font-size: 18px;
        font-weight: 600;
        color: #0f172a;
        margin: 0;
      }
      
      .header-actions {
        display: flex;
        gap: 8px;
      }
    }
    
    .drawer-content {
      padding: 20px;
      height: 100%;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .prompt-info {
      margin-bottom: 10px;
      
      p {
        margin: 0;
        line-height: 1.5;
      }
    }
    
    .prompt-input {
      flex: 1;
      height: calc(100% - 80px);
      
      :deep(.el-textarea__inner) {
        height: 100%;
        font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
        font-size: 14px;
        line-height: 1.6;
        padding: 12px;
        background-color: #f8fafc;
        border-radius: 8px;
        transition: all 0.3s ease;
        
        &:focus {
          background-color: #fff;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
        }
      }
    }
    
    .template-btn {
      position: absolute;
      left: 0;
      top: 0;
      width: 0;
      height: 0;
    }
    
    .template-list {
      .template-title {
        font-size: 16px;
        font-weight: 600;
        color: #0f172a;
        margin-top: 0;
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 1px solid #e2e8f0;
      }
      
      .template-items {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      
      .template-item {
        padding: 10px 12px;
        border-radius: 8px;
        background-color: #f8fafc;
        border: 1px solid #e2e8f0;
        cursor: pointer;
        transition: all 0.2s ease;
        
        &:hover {
          background-color: #f0f9ff;
          border-color: #bae6fd;
          transform: translateY(-1px);
        }
        
        .template-name {
          font-weight: 600;
          font-size: 14px;
          color: #1e293b;
          margin-bottom: 4px;
        }
        
        .template-desc {
          font-size: 12px;
          color: #64748b;
        }
      }
    }
  }
  </style>
  