<template>
  <el-dialog 
    v-model="dialogVisible" 
    title="导出对话"
    width="500px"
    class="export-dialog"
    destroy-on-close
  >
    <div class="export-options">
      <div class="format-selector">
        <label>导出格式</label>
        <el-radio-group v-model="format">
          <el-radio label="markdown">Markdown</el-radio>
          <el-radio label="json">JSON</el-radio>
          <el-radio label="txt">纯文本</el-radio>
          <el-radio label="html">HTML</el-radio>
        </el-radio-group>
      </div>
      
      <div class="export-preview">
        <div class="preview-header">
          <span>预览</span>
          <el-button 
            type="primary" 
            text 
            @click="copyContent"
            class="copy-btn"
          >
            <el-icon><ep-document-copy /></el-icon>
            复制内容
          </el-button>
        </div>
        <div class="preview-content">
          <pre>{{ previewContent }}</pre>
        </div>
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="close">取消</el-button>
        <el-button type="primary" @click="download">
          <el-icon><ep-download /></el-icon>
          下载文件
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import { marked } from 'marked';
import { saveAs } from 'file-saver';

const props = defineProps({
  messages: {
    type: Array,
    required: true
  },
  visible: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:visible', 'copy', 'download']);

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
});

const format = ref('markdown');
const previewContent = computed(() => generateExportContent());

const close = () => {
  dialogVisible.value = false;
};

const generateExportContent = () => {
  if (props.messages.length === 0) return '无内容可导出';
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const title = `对话导出 - ${timestamp}`;
  
  switch (format.value) {
    case 'markdown':
      return generateMarkdown(title);
    case 'json':
      return JSON.stringify(props.messages, null, 2);
    case 'txt':
      return generatePlainText(title);
    case 'html':
      return generateHTML(title);
    default:
      return '选择导出格式';
  }
};

const generateMarkdown = (title) => {
  let md = `# ${title}\n\n`;
  
  props.messages.forEach(message => {
    const role = message.role === 'user' ? '👤 用户' : '🤖 AI助手';
    md += `## ${role}\n\n`;
    
    if (typeof message.content === 'string') {
      md += `${message.content}\n\n`;
    } else if (message.content?.type === 'audio') {
      md += `[音频内容]\n\n`;
    } else if (Array.isArray(message.content)) {
      const textContent = message.content.find(c => c.type === 'text')?.text;
      const imageUrls = message.content.filter(c => c.type === 'image_url').map(c => c.image_url.url);
      
      if (textContent) md += `${textContent}\n\n`;
      
      imageUrls.forEach(url => {
        md += `![图片](${url})\n\n`;
      });
    }
  });
  
  return md;
};

const generatePlainText = (title) => {
  let text = `${title}\n\n`;
  
  props.messages.forEach(message => {
    const role = message.role === 'user' ? '用户:' : 'AI助手:';
    text += `${role}\n`;
    
    if (typeof message.content === 'string') {
      text += `${message.content}\n\n`;
    } else if (message.content?.type === 'audio') {
      text += `[音频内容]\n\n`;
    } else if (Array.isArray(message.content)) {
      const textContent = message.content.find(c => c.type === 'text')?.text;
      
      if (textContent) text += `${textContent}\n\n`;
      text += `[包含图片]\n\n`;
    }
  });
  
  return text;
};

const generateHTML = (title) => {
  let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: system-ui, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
    .message { padding: 12px; margin-bottom: 12px; border-radius: 8px; }
    .user { background-color: #f0f9ff; border-left: 4px solid #3b82f6; }
    .assistant { background-color: #f8fafc; border-left: 4px solid #64748b; }
    .role { font-weight: bold; margin-bottom: 8px; }
    img { max-width: 100%; border-radius: 4px; }
    pre { background-color: #f1f5f9; padding: 12px; border-radius: 4px; overflow-x: auto; }
    code { font-family: monospace; }
  </style>
</head>
<body>
  <h1>${title}</h1>`;

  props.messages.forEach(message => {
    const isUser = message.role === 'user';
    const roleClass = isUser ? 'user' : 'assistant';
    const roleName = isUser ? '用户' : 'AI助手';
    
    html += `\n\n  <div class="message ${roleClass}">
    <div class="role">${roleName}</div>
    <div class="content">`;
    
    if (typeof message.content === 'string') {
      html += marked(message.content);
    } else if (message.content?.type === 'audio') {
      html += '<p>[音频内容]</p>';
    } else if (Array.isArray(message.content)) {
      const textContent = message.content.find(c => c.type === 'text')?.text;
      const imageUrls = message.content.filter(c => c.type === 'image_url').map(c => c.image_url.url);
      
      if (textContent) html += marked(textContent);
      
      imageUrls.forEach(url => {
        html += `\n      <img src="${url}" alt="图片">`;
      });
    }
    
    html += '\n    </div>\n  </div>';
  });
  
  html += '\n</body>\n</html>';
  return html;
};

const copyContent = async () => {
  const content = generateExportContent();
  try {
    await navigator.clipboard.writeText(content);
    emit('copy', { success: true, format: format.value });
  } catch (error) {
    emit('copy', { success: false, error });
  }
};

const download = () => {
  const content = generateExportContent();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
  let filename = `chat-export-${timestamp}`;
  let mimeType;
  
  switch (format.value) {
    case 'markdown':
      filename += '.md';
      mimeType = 'text/markdown';
      break;
    case 'json':
      filename += '.json';
      mimeType = 'application/json';
      break;
    case 'html':
      filename += '.html';
      mimeType = 'text/html';
      break;
    default:
      filename += '.txt';
      mimeType = 'text/plain';
  }
  
  const blob = new Blob([content], { type: mimeType });
  saveAs(blob, filename);
  
  emit('download', { filename, format: format.value });
  dialogVisible.value = false;
};
</script>

<style lang="less" scoped>
.export-dialog {
  :deep(.closeai-dialog__body) {
    padding-top: 10px;
  }

  .export-options {
    display: flex;
    flex-direction: column;
    gap: 20px;
    
    .format-selector {
      display: flex;
      flex-direction: column;
      gap: 10px;
      
      label {
        font-weight: 500;
        color: var(--app-text-color);
      }
    }
    
    .export-preview {
      border: 1px solid var(--app-border-color);
      border-radius: 8px;
      
      .preview-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 16px;
        background-color: var(--app-bg-color);
        border-bottom: 1px solid var(--app-border-color);
        border-radius: 8px 8px 0 0;
        font-weight: 500;
        
        .copy-btn {
          display: flex;
          align-items: center;
          gap: 4px;
        }
      }
      
      .preview-content {
        max-height: 300px;
        overflow: auto;
        padding: 16px;
        
        pre {
          margin: 0;
          white-space: pre-wrap;
          font-size: 13px;
          line-height: 1.5;
          font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
          color: var(--app-text-secondary);
        }
      }
    }
  }
}
</style>
