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
