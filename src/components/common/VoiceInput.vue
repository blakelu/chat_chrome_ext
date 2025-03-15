<template>
  <div class="voice-input">
    <el-tooltip :content="recording ? '点击停止录音' : '点击开始录音'" placement="top">
      <button 
        class="voice-button" 
        :class="{ recording }" 
        @click="toggleRecording"
        :disabled="!hasPermission || processing"
      >
        <template v-if="recording">
          <div class="recording-indicator">
            <span></span><span></span><span></span>
          </div>
          <el-icon></el-icon>
        </template>
        <el-icon v-else></el-icon>
      </button>
    </el-tooltip>
    
    <transition name="fade">
      <div v-if="recording || processing" class="status-text">
        {{ processing ? '处理中...' : recordingTime }}
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
  maxDuration: {
    type: Number,
    default: 60 // Maximum recording duration in seconds
  }
});

const emit = defineEmits(['result', 'error', 'start', 'stop']);

const recording = ref(false);
const processing = ref(false);
const hasPermission = ref(false);
const recordingTime = ref('00:00');
const mediaRecorder = ref<MediaRecorder | null>(null);
const audioChunks = ref<Blob[]>([]);
const startTime = ref<number>(0);
const timerInterval = ref<number | null>(null);

// Check for microphone permissions
onMounted(async () => {
  try {
    // Just checking if we have permission
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach(track => track.stop());
    hasPermission.value = true;
  } catch (error) {
    console.error('Microphone permission denied:', error);
    hasPermission.value = false;
  }
});

// Clean up when component is destroyed
onBeforeUnmount(() => {
  if (recording.value) {
    stopRecording();
  }
  if (timerInterval.value) {
    window.clearInterval(timerInterval.value);
  }
});

// Start the recording timer
const startTimer = () => {
  startTime.value = Date.now();
  if (timerInterval.value) window.clearInterval(timerInterval.value);
  
  timerInterval.value = window.setInterval(() => {
    const elapsedSeconds = Math.floor((Date.now() - startTime.value) / 1000);
    const minutes = Math.floor(elapsedSeconds / 60).toString().padStart(2, '0');
    const seconds = (elapsedSeconds % 60).toString().padStart(2, '0');
    recordingTime.value = `${minutes}:${seconds}`;
    
    // Auto-stop if max duration reached
    if (elapsedSeconds >= props.maxDuration) {
      stopRecording();
    }
  }, 1000);
};

// Toggle recording state
const toggleRecording = async () => {
  if (recording.value) {
    stopRecording();
  } else {
    startRecording();
  }
};

// Start recording audio
const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder.value = new MediaRecorder(stream);
    audioChunks.value = [];
    
    // Handle data available event
    mediaRecorder.value.addEventListener('dataavailable', event => {
      if (event.data.size > 0) {
        audioChunks.value.push(event.data);
      }
    });
    
    // Handle recording stop event
    mediaRecorder.value.addEventListener('stop', async () => {
      // Stop all tracks in the stream
      stream.getTracks().forEach(track => track.stop());
      
      if (audioChunks.value.length > 0) {
        processing.value = true;
        
        try {
          const audioBlob = new Blob(audioChunks.value, { type: 'audio/wav' });
          
          // Emit the audio blob for further processing
          emit('result', audioBlob);
        } catch (error) {
          console.error('Error processing audio:', error);
          emit('error', 'Failed to process audio');
        } finally {
          processing.value = false;
        }
      }
    });
    
    // Start recording
    mediaRecorder.value.start();
    recording.value = true;
    startTimer();
    emit('start');
    
  } catch (error) {
    console.error('Error starting recording:', error);
    emit('error', 'Failed to start recording');
  }
};

// Stop recording
const stopRecording = () => {
  if (mediaRecorder.value && mediaRecorder.value.state !== 'inactive') {
    mediaRecorder.value.stop();
    recording.value = false;
    
    if (timerInterval.value) {
      window.clearInterval(timerInterval.value);
      timerInterval.value = null;
    }
    
    emit('stop');
  }
};

// Request permissions manually
const requestPermission = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach(track => track.stop());
    hasPermission.value = true;
    return true;
  } catch (error) {
    console.error('Microphone permission denied:', error);
    hasPermission.value = false;
    return false;
  }
};

// Expose functions to parent components
defineExpose({
  startRecording,
  stopRecording,
  requestPermission,
  hasPermission
});
</script>

<style scoped>
.voice-input {
  display: flex;
  align-items: center;
  gap: 8px;
}

.voice-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--app-card-bg);
  border: 1px solid var(--app-border-color);
  color: var(--app-text-color);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  box-shadow: var(--app-shadow-sm);
}

.voice-button:hover {
  background-color: var(--app-bg-color);
  transform: translateY(-2px);
  box-shadow: var(--app-shadow-md);
}

.voice-button:active {
  transform: translateY(0);
}

.voice-button.recording {
  background-color: rgba(var(--app-danger-rgb, 239, 68, 68), 0.1);
  border-color: var(--app-danger);
  color: var(--app-danger);
  animation: pulse 2s infinite;
}

.recording-indicator {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: var(--app-danger);
  display: flex;
  align-items: center;
  justify-content: center;
}

.recording-indicator span {
  display: inline-block;
  width: 2px;
  height: 5px;
  background-color: #fff;
  margin: 0 1px;
  animation: soundwave 0.5s infinite alternate;
}

.recording-indicator span:nth-child(1) {
  animation-delay: 0.1s;
}

.recording-indicator span:nth-child(2) {
  animation-delay: 0.2s;
  height: 8px;
}

.recording-indicator span:nth-child(3) {
  animation-delay: 0.3s;
}

.status-text {
  font-size: var(--app-font-size-small);
  color: var(--app-text-secondary);
  min-width: 40px;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(var(--app-danger-rgb, 239, 68, 68), 0.4);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(var(--app-danger-rgb, 239, 68, 68), 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(var(--app-danger-rgb, 239, 68, 68), 0);
  }
}

@keyframes soundwave {
  0% {
    height: 3px;
  }
  100% {
    height: 8px;
  }
}

/* For reduced motion users */
[data-reduced-motion="true"] .voice-button.recording {
  animation: none;
  background-color: var(--app-danger);
  color: white;
}

[data-reduced-motion="true"] .recording-indicator span {
  animation: none;
}
</style>
