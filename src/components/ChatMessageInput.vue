<template>
  <div class="chat-message-input">
    <OffPlatformDetector
      :aiConfidenceThreshold="aiConfidenceThreshold"
      :enableAiDetection="enableAiDetection"
      :enableRegexDetection="enableRegexDetection"
      :allowForceSend="allowForceSend"
      :maxChars="maxChars"
      :placeholder="placeholder"
      :supportedLanguages="supportedLanguages"
      :aiDetectionDebounce="aiDetectionDebounce"
      @send="handleSend"
      @detection-warning="handleDetectionWarning"
      @detection-error="handleDetectionError"
    />
    
    <!-- Statistics display (optional, for demonstration purposes) -->
    <div v-if="showStats" class="detection-stats">
      <div class="stats-title">Detection Statistics</div>
      <div class="stats-item">
        <span class="stats-label">Messages sent:</span>
        <span class="stats-value">{{ stats.messagesSent }}</span>
      </div>
      <div class="stats-item">
        <span class="stats-label">Messages flagged:</span>
        <span class="stats-value">{{ stats.messagesFlagged }}</span>
      </div>
      <div class="stats-item">
        <span class="stats-label">Regex detections:</span>
        <span class="stats-value">{{ stats.regexDetections }}</span>
      </div>
      <div class="stats-item">
        <span class="stats-label">AI detections:</span>
        <span class="stats-value">{{ stats.aiDetections }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import OffPlatformDetector from './OffPlatformDetector.vue';

export default {
  name: 'ChatMessageInput',
  components: {
    OffPlatformDetector
  },
  props: {
    // Whether to show detection statistics (for demonstration)
    showStats: {
      type: Boolean,
      default: false
    },
    // Threshold for AI confidence to trigger a warning (0-100)
    aiConfidenceThreshold: {
      type: Number,
      default: 70
    },
    // Whether to enable AI-based detection
    enableAiDetection: {
      type: Boolean,
      default: true
    },
    // Whether to enable regex-based detection
    enableRegexDetection: {
      type: Boolean,
      default: true
    },
    // Whether to allow force sending a flagged message
    allowForceSend: {
      type: Boolean,
      default: false
    },
    // Maximum characters allowed in the message
    maxChars: {
      type: Number,
      default: 500
    },
    // Placeholder text for the message input
    placeholder: {
      type: String,
      default: 'Type your message here...'
    },
    // Languages to check for off-platform communication
    supportedLanguages: {
      type: Array,
      default: () => ['en', 'es', 'fr', 'de', 'zh', 'ja', 'ru']
    },
    // Debounce time for AI detection in milliseconds
    aiDetectionDebounce: {
      type: Number,
      default: 500
    }
  },
  data() {
    return {
      stats: {
        messagesSent: 0,
        messagesFlagged: 0,
        regexDetections: 0,
        aiDetections: 0
      }
    };
  },
  methods: {
    handleSend(data) {
      // Update statistics
      this.stats.messagesSent++;
      if (data.wasFlagged) {
        this.stats.messagesFlagged++;
      }
      
      // Emit the send event to parent
      this.$emit('send', data);
    },
    
    handleDetectionWarning(data) {
      // Update statistics based on detection type
      if (data.type === 'regex') {
        this.stats.regexDetections++;
      } else if (data.type === 'ai') {
        this.stats.aiDetections++;
      }
      
      // Emit the warning event to parent
      this.$emit('detection-warning', data);
    },
    
    handleDetectionError(error) {
      // Emit the error event to parent
      this.$emit('detection-error', error);
    },
    
    resetStats() {
      this.stats = {
        messagesSent: 0,
        messagesFlagged: 0,
        regexDetections: 0,
        aiDetections: 0
      };
    }
  }
};
</script>

<style scoped>
.chat-message-input {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.detection-stats {
  margin-top: 20px;
  padding: 12px;
  background-color: #f5f5f7;
  border-radius: 8px;
  font-size: 14px;
}

.stats-title {
  font-weight: bold;
  margin-bottom: 8px;
  font-size: 16px;
}

.stats-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.stats-label {
  color: #666;
}

.stats-value {
  font-weight: 500;
}
</style>
<template>
  <div class="chat-input-container">
    <div class="input-wrapper">
      <textarea
        v-model="message"
        :placeholder="placeholder"
        class="chat-input"
        @keydown.enter.prevent="onEnterPress"
        @input="onInputChanged"
        ref="chatInputRef"
        :maxlength="maxChars"
      ></textarea>
      
      <div class="input-controls">
        <div class="char-counter" :class="{ 'char-limit-warning': isApproachingLimit }">
          {{ message.length }}/{{ maxChars }}
        </div>
        <button 
          class="send-button" 
          :disabled="!canSend" 
          @click="sendMessage"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    </div>
    
    <!-- Warning when potential off-platform communication is detected -->
    <div v-if="showWarning" class="detection-warning">
      <div class="warning-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      <div class="warning-content">
        <div class="warning-title">Potential off-platform communication detected</div>
        <div class="warning-message">
          Your message appears to contain contact information or an attempt to move communication to another platform.
        </div>
        <div v-if="detectionResult.reason" class="warning-reason">
          {{ detectionResult.reason }}
        </div>
      </div>
      <div class="warning-actions">
        <button 
          v-if="allowForceSend" 
          class="force-send-button"
          @click="forceSendMessage"
        >
          Send anyway
        </button>
        <button 
          class="edit-button"
          @click="focusInput"
        >
          Edit message
        </button>
      </div>
    </div>
    
    <!-- Stats bar for detailed information (only shown when enabled) -->
    <div v-if="showStats && message.length > 0" class="detection-stats">
      <div class="stats-item">
        <span class="stats-label">Status:</span>
        <span class="stats-value" :class="getStatusClass">
          {{ detectionResult.detected ? 'Flagged' : 'Safe' }}
        </span>
      </div>
      <div class="stats-item">
        <span class="stats-label">Method:</span>
        <span class="stats-value">{{ detectionResult.detectionType || 'None' }}</span>
      </div>
      <div class="stats-item">
        <span class="stats-label">Confidence:</span>
        <span class="stats-value">{{ detectionResult.confidence }}%</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, nextTick } from 'vue';
import { detectWithRegex } from '../utils/regexDetection.js';
import debounce from 'lodash/debounce';

export default {
  name: 'ChatMessageInput',
  props: {
    // Configuration props
    placeholder: {
      type: String,
      default: 'Type a message...'
    },
    maxChars: {
      type: Number,
      default: 500
    },
    aiConfidenceThreshold: {
      type: Number,
      default: 70
    },
    enableAiDetection: {
      type: Boolean,
      default: true
    },
    enableRegexDetection: {
      type: Boolean,
      default: true
    },
    allowForceSend: {
      type: Boolean,
      default: false
    },
    supportedLanguages: {
      type: Array,
      default: () => ['en']
    },
    showStats: {
      type: Boolean,
      default: false
    },
    aiDetectionDebounce: {
      type: Number,
      default: 500
    }
  },
  emits: ['send', 'detection-warning', 'detection-error'],
  setup(props, { emit }) {
    const message = ref('');
    const chatInputRef = ref(null);
    const detectionResult = ref({
      detected: false,
      confidence: 0,
      reason: '',
      detectionType: null
    });
    const showWarning = ref(false);
    const isAnalyzing = ref(false);
    const analysisQueued = ref(false);
    
    // Minimum characters before detection is performed
    const MIN_DETECTION_LENGTH = 6;
    
    const canSend = computed(() => {
      return message.value.trim().length > 0 && !showWarning.value;
    });
    
    const isApproachingLimit = computed(() => {
      return message.value.length > props.maxChars * 0.9;
    });
    
    const getStatusClass = computed(() => {
      return {
        'status-safe': !detectionResult.value.detected,
        'status-flagged': detectionResult.value.detected
      };
    });
    
    // Create a debounced version of the detection function
    const debouncedDetection = debounce(async () => {
      if (message.value.trim().length < MIN_DETECTION_LENGTH) {
        showWarning.value = false;
        detectionResult.value = {
          detected: false,
          confidence: 0,
          reason: '',
          detectionType: null
        };
        return;
      }
      
      try {
        isAnalyzing.value = true;
        
        // Always start with regex detection as it's faster
        if (props.enableRegexDetection) {
          const regexResult = detectWithRegex(message.value);
          
          if (regexResult.detected) {
            detectionResult.value = {
              detected: true,
              confidence: regexResult.confidence,
              reason: regexResult.reason,
              detectionType: 'regex'
            };
            
            // Emit warning event
            emit('detection-warning', {
              message: message.value,
              type: 'regex',
              confidence: regexResult.confidence
            });
            
            showWarning.value = true;
            isAnalyzing.value = false;
            return;
          }
        }
        
        // Reset if no detection
        showWarning.value = false;
        detectionResult.value = {
          detected: false,
          confidence: 0,
          reason: '',
          detectionType: null
        };
        
        isAnalyzing.value = false;
        
        // If there was a queued analysis, run it now
        if (analysisQueued.value) {
          analysisQueued.value = false;
          debouncedDetection();
        }
      } catch (error) {
        console.error('Error in message detection:', error);
        emit('detection-error', { message: error.message });
        isAnalyzing.value = false;
      }
    }, props.aiDetectionDebounce);
    
    // Watch for message changes to trigger detection
    watch(message, (newValue) => {
      if (newValue.trim().length >= MIN_DETECTION_LENGTH) {
        if (isAnalyzing.value) {
          analysisQueued.value = true;
          return;
        }
        
        debouncedDetection();
      } else {
        showWarning.value = false;
        detectionResult.value = {
          detected: false,
          confidence: 0,
          reason: '',
          detectionType: null
        };
      }
    });
    
    // Send message function
    const sendMessage = () => {
      if (!canSend.value) return;
      
      emit('send', {
        message: message.value,
        wasFlagged: false,
        detectionType: null,
        confidence: 0
      });
      
      // Clear the input
      message.value = '';
    };
    
    // Force send message (when warning is active)
    const forceSendMessage = () => {
      if (!props.allowForceSend || !message.value.trim()) return;
      
      emit('send', {
        message: message.value,
        wasFlagged: detectionResult.value.detected,
        detectionType: detectionResult.value.detectionType,
        confidence: detectionResult.value.confidence
      });
      
      // Clear the input and warning
      message.value = '';
      showWarning.value = false;
    };
    
    // Focus the input
    const focusInput = async () => {
      showWarning.value = false;
      await nextTick();
      chatInputRef.value.focus();
    };
    
    // Handle enter key
    const onEnterPress = (event) => {
      // If shift+enter, allow line break
      if (event.shiftKey) return;
      
      // Otherwise, try to send message
      if (canSend.value) {
        sendMessage();
      }
    };
    
    // Handle input change
    const onInputChanged = () => {
      // Any additional processing if needed
    };
    
    return {
      message,
      chatInputRef,
      detectionResult,
      showWarning,
      canSend,
      isApproachingLimit,
      getStatusClass,
      sendMessage,
      forceSendMessage,
      focusInput,
      onEnterPress,
      onInputChanged
    };
  }
}
</script>

<style scoped>
.chat-input-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  background-color: #FFFFFF;
  border-top: 1px solid #E5E5EA;
  padding: 12px;
}

.input-wrapper {
  display: flex;
  position: relative;
  width: 100%;
}

.chat-input {
  flex: 1;
  height: 80px;
  min-height: 80px;
  max-height: 150px;
  padding: 12px;
  border-radius: 18px;
  border: 1px solid #E5E5EA;
  font-family: inherit;
  font-size: 14px;
  resize: none;
  outline: none;
  background-color: #F9F9F9;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.chat-input:focus {
  border-color: #007AFF;
  box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.2);
}

.input-controls {
  position: absolute;
  right: 12px;
  bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.char-counter {
  font-size: 12px;
  color: #8E8E93;
}

.char-limit-warning {
  color: #FF9500;
}

.send-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background-color: #007AFF;
  color: white;
  cursor: pointer;
  transition: background-color 0.2s;
}

.send-button:hover {
  background-color: #0062CC;
}

.send-button:disabled {
  background-color: #C7C7CC;
  cursor: not-allowed;
}

/* Warning styles */
.detection-warning {
  margin-top: 12px;
  padding: 12px;
  border-radius: 8px;
  background-color: rgba(255, 59, 48, 0.1);
  border: 1px solid #FF3B30;
  display: flex;
  gap: 12px;
}

.warning-icon {
  color: #FF3B30;
  margin-top: 2px;
}

.warning-content {
  flex: 1;
}

.warning-title {
  font-weight: bold;
  margin-bottom: 4px;
  color: #FF3B30;
}

.warning-message {
  font-size: 14px;
  color: #333333;
  margin-bottom: 4px;
}

.warning-reason {
  font-size: 13px;
  color: #8E8E93;
  font-style: italic;
}

.warning-actions {
  display: flex;
  margin-top: 8px;
  gap: 8px;
}

.force-send-button,
.edit-button {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 14px;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.force-send-button {
  background-color: #FF3B30;
  color: white;
}

.force-send-button:hover {
  background-color: #D62f25;
}

.edit-button {
  background-color: #E5E5EA;
  color: #333333;
}

.edit-button:hover {
  background-color: #D1D1D6;
}

/* Stats styles */
.detection-stats {
  display: flex;
  margin-top: 8px;
  font-size: 12px;
  color: #8E8E93;
  gap: 16px;
}

.stats-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.stats-label {
  font-weight: bold;
}

.stats-value.status-safe {
  color: #34C759;
}

.stats-value.status-flagged {
  color: #FF3B30;
}
</style>
