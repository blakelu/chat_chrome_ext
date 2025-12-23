<template>
  <div class="shortcuts-settings">
    <div class="shortcuts-table">
      <div class="shortcuts-row">
        <div class="shortcuts-action">流式输出</div>
        <div class="shortcuts-keys">
          <el-switch v-model="commonSettings.stream" />
        </div>
      </div>
      <div class="shortcuts-row">
        <div class="flex items-center gap-1">
          <div class="shortcuts-action">模型温度</div>
          <el-tooltip
            effect="dark"
            content="模型生成文本的随机程度。值越大， 回复内容越有多样性、创造性、随机性；设为0根据事实回答。日常聊天建议设置为0.7"
            placement="top"
          >
            <el-icon size="16"><ep-QuestionFilled /></el-icon>
          </el-tooltip>
        </div>
        <div class="shortcuts-keys">
          <el-slider v-model="commonSettings.temperature" :min="0" :max="1" :step="0.1" />
        </div>
      </div>
      <div class="shortcuts-row">
        <div class="flex items-center gap-1">
          <div class="shortcuts-action">上下文数</div>
          <el-tooltip effect="dark" content="要保留在上下文中的消息数量，上下文越多，消耗的token越多。普通聊天建议 5-10" placement="top">
            <el-icon size="16"><ep-QuestionFilled /></el-icon>
          </el-tooltip>
        </div>
        <div class="shortcuts-keys">
          <el-slider v-model="commonSettings.limitContext" :min="1" :max="10" :step="1" />
        </div>
      </div>
      <div class="shortcuts-row">
        <div class="shortcuts-action">Blinko地址</div>
        <div class="shortcuts-keys">
          <el-input v-model="commonSettings.blinkoUrl" size="large" placeholder="输入Blinko地址" clearable>
            <template #prefix>
              <el-icon><ep-link /></el-icon>
            </template>
          </el-input>
        </div>
      </div>
      <div class="shortcuts-row">
        <div class="shortcuts-action">Blinko Token</div>
        <div class="shortcuts-keys">
          <el-input v-model="commonSettings.blinkoToken" size="large" placeholder="输入Blinko Token" clearable>
            <template #prefix>
              <el-icon><ep-key /></el-icon>
            </template>
          </el-input>
        </div>
      </div>
    </div>
    <div class="shortcuts-table">
      <div class="shortcuts-row">
        <div class="shortcuts-action">打开侧边栏</div>
        <div class="shortcuts-keys">
          <span class="key">Ctrl</span>
          <span>+</span>
          <span class="key">Shift</span>
          <span>+</span>
          <span class="key">Y</span>
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
        <div class="shortcuts-action">打开设置</div>
        <div class="shortcuts-keys">
          <span class="key">Ctrl</span>
          <span>+</span>
          <span class="key">,</span>
        </div>
      </div>
    </div>

    <div class="shortcuts-note">
      <el-alert type="info" :closable="false" show-icon> Mac用户请将 Ctrl 替换为 Command (⌘) </el-alert>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAppStorage } from '@/composables/useAppStorage.ts'

const settings = ref({
  temperature: 0.7,
  limitContext: 6,
  stream: true,
  prompt: '',
  blinkoUrl: '',
  blinkoToken: ''
})
const commonSettings = useAppStorage('COMMON_SETTINGS', settings.value)
</script>

<style lang="less" scoped>
.shortcuts-settings {
  margin-top: 8px;

  .section-title {
    font-size: 18px;
    font-weight: 600;
    color: #0f172a;
    margin: 0 0 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid #e2e8f0;
  }
}
.shortcuts-table {
  padding: 0 16px;
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);

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
      gap: 6px;
      width: 200px;
      display: flex;
      align-items: center;
      justify-content: flex-end;

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
</style>
