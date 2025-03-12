<template>
  <div class="off-platform-detector">
    <!-- Message input area -->
    <div class="message-input-container">
      <textarea
        v-model="message"
        :placeholder="placeholder"
        class="message-input"
        @input="handleInput"
        :disabled="isAnalyzing"
        ref="messageInput"
      ></textarea>
      <div class="char-count" :class="{ 'char-limit-exceeded': isCharLimitExceeded }">
        {{ message.length }}/{{ maxChars }}
      </div>
    </div>

    <!-- Warning display area -->
    <div v-if="showWarning" class="warning-container">
      <div class="warning-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      <div class="warning-content">
        <div class="warning-title">{{ warningTitle }}</div>
        <div class="warning-message">{{ warningMessage }}</div>
      </div>
    </div>

    <!-- Loading indicator -->
    <div v-if="isAnalyzing" class="loading-container">
      <div class="loading-spinner"></div>
      <div class="loading-text">Analyzing message...</div>
    </div>

    <!-- Action buttons -->
    <div class="action-buttons">
      <button
        class="send-button"
        @click="handleSend"
        :disabled="!canSend || isAnalyzing"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
        </svg>
        Send
      </button>
    </div>

    <!-- Forced send confirmation dialog -->
    <div v-if="showForceSendDialog" class="force-send-dialog">
      <div class="force-send-content">
        <div class="force-send-title">Are you sure?</div>
        <div class="force-send-message">
          This message has been flagged as potentially containing off-platform communication.
          Sharing contact information violates our community guidelines.
        </div>
        <div class="force-send-actions">
          <button class="cancel-button" @click="cancelForceSend">Cancel</button>
          <button class="force-button" @click="confirmForceSend">I understand the risks</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { detectOffPlatformCommunication } from '../services/offPlatformDetection';
import { basicRegexCheck } from '../utils/regexPatterns';

export default {
  name: 'OffPlatformDetector',
  props: {
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
      message: '',
      isAnalyzing: false,
      showWarning: false,
      warningTitle: 'Off-platform communication detected',
      warningMessage: 'Sharing contact information violates our guidelines.',
      detectionConfidence: 0,
      showForceSendDialog: false,
      debounceTimeout: null,
      lastAnalyzedMessage: '',
      detectionType: null, // 'regex' or 'ai'
    };
  },
  computed: {
    canSend() {
      return this.message.trim().length > 0 && 
             this.message.length <= this.maxChars &&
             (!this.showWarning || this.allowForceSend);
    },
    isCharLimitExceeded() {
      return this.message.length > this.maxChars;
    }
  },
  methods: {
    handleInput() {
      this.showWarning = false;
      
      // Clear previous timeout
      if (this.debounceTimeout) {
        clearTimeout(this.debounceTimeout);
      }
      
      const currentMessage = this.message.trim();
      
      // Don't analyze if empty or the same as the last analyzed message
      if (!currentMessage || currentMessage === this.lastAnalyzedMessage) {
        return;
      }
      
      // Only perform regex check while typing
      if (this.enableRegexDetection) {
        const regexResult = basicRegexCheck(currentMessage, this.supportedLanguages);
        if (regexResult.detected) {
          this.showOffPlatformWarning('regex', regexResult.pattern, 100);
          return;
        }
      }
      
      // AI detection is now only done on send, not during typing
    },
    
    async analyzeWithAI(messageText) {
      if (!messageText || messageText === this.lastAnalyzedMessage) {
        return;
      }
      
      this.isAnalyzing = true;
      this.lastAnalyzedMessage = messageText;
      
      try {
        const result = await detectOffPlatformCommunication(messageText);
        
        if (result.confidence >= this.aiConfidenceThreshold) {
          this.showOffPlatformWarning('ai', result.reason, result.confidence);
          return true; // Return true if flagged
        }
        return false; // Return false if not flagged
      } catch (error) {
        console.error('Error analyzing message:', error);
        // Optionally notify the user of error
        this.$emit('detection-error', error);
        return false;
      } finally {
        this.isAnalyzing = false;
      }
    },
    
    showOffPlatformWarning(type, reason, confidence) {
      this.showWarning = true;
      this.detectionType = type;
      this.detectionConfidence = confidence;
      
      if (type === 'regex') {
        this.warningTitle = 'Contact sharing detected';
        this.warningMessage = `We detected ${reason}. Sharing contact information violates our community guidelines.`;
      } else {
        this.warningTitle = 'Potential off-platform communication detected';
        this.warningMessage = reason || 'Our system detected potential off-platform communication. Please review our guidelines.';
      }
      
      this.$emit('detection-warning', {
        type,
        confidence,
        reason,
        message: this.message
      });
    },
    
    async handleSend() {
      if (!this.canSend) {
        return;
      }
      
      // If already flagged by regex and force send is allowed
      if (this.showWarning && this.allowForceSend) {
        this.showForceSendDialog = true;
        return;
      }
      
      // Run AI detection only when sending, not during typing
      if (this.enableAiDetection && this.message.trim().length > 10) {
        const flagged = await this.analyzeWithAI(this.message.trim());
        
        // If AI flagged it and force send is allowed, show dialog
        if (flagged && this.allowForceSend) {
          this.showForceSendDialog = true;
          return;
        } 
        
        // If AI flagged it and force send is not allowed, prevent sending
        if (flagged && !this.allowForceSend) {
          return;
        }
      }
      
      // No issues detected or force send confirmed
      this.sendMessage();
    },
    
    sendMessage() {
      const messageToSend = this.message.trim();
      
      this.$emit('send', {
        message: messageToSend,
        wasFlagged: this.showWarning,
        detectionType: this.detectionType,
        confidence: this.detectionConfidence
      });
      
      // Reset component state
      this.message = '';
      this.showWarning = false;
      this.showForceSendDialog = false;
      this.lastAnalyzedMessage = '';
      this.detectionType = null;
      this.detectionConfidence = 0;
      
      // Focus back on input
      this.$nextTick(() => {
        if (this.$refs.messageInput) {
          this.$refs.messageInput.focus();
        }
      });
    },
    
    cancelForceSend() {
      this.showForceSendDialog = false;
    },
    
    confirmForceSend() {
      this.sendMessage();
    },
    
    resetComponent() {
      this.message = '';
      this.showWarning = false;
      this.isAnalyzing = false;
      this.showForceSendDialog = false;
      this.lastAnalyzedMessage = '';
      if (this.debounceTimeout) {
        clearTimeout(this.debounceTimeout);
      }
    }
  }
};
</script>

<style scoped>
.off-platform-detector {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: #333333;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  box-sizing: border-box;
}

.message-input-container {
  position: relative;
  margin-bottom: 12px;
}

.message-input {
  width: 100%;
  min-height: 80px;
  padding: 12px;
  border: 1px solid #E5E5EA;
  border-radius: 8px;
  font-size: 14px;
  resize: vertical;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.3s;
}

.message-input:focus {
  border-color: #007AFF;
  box-shadow: 0 0 0 1px rgba(0, 122, 255, 0.2);
}

.message-input:disabled {
  background-color: #f8f8f8;
  cursor: not-allowed;
}

.char-count {
  position: absolute;
  bottom: 8px;
  right: 12px;
  font-size: 12px;
  color: #999;
}

.char-limit-exceeded {
  color: #FF3B30;
  font-weight: bold;
}

.warning-container {
  display: flex;
  background-color: rgba(255, 59, 48, 0.1);
  border: 1px solid #FF3B30;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
}

.warning-icon {
  flex-shrink: 0;
  color: #FF3B30;
  margin-right: 12px;
  display: flex;
  align-items: flex-start;
}

.warning-content {
  flex-grow: 1;
}

.warning-title {
  font-weight: bold;
  margin-bottom: 4px;
  color: #FF3B30;
}

.warning-message {
  font-size: 14px;
  line-height: 1.4;
}

.loading-container {
  display: flex;
  align-items: center;
  padding: 8px 0;
  margin-bottom: 12px;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(0, 122, 255, 0.3);
  border-radius: 50%;
  border-top-color: #007AFF;
  animation: spin 1s linear infinite;
  margin-right: 8px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  font-size: 14px;
  color: #007AFF;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
}

.send-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background-color: #007AFF;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.send-button:hover:not(:disabled) {
  background-color: #0062cc;
}

.send-button:disabled {
  background-color: #B8DAFF;
  cursor: not-allowed;
}

.force-send-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.force-send-content {
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.force-send-title {
  font-weight: bold;
  font-size: 18px;
  margin-bottom: 12px;
  color: #FF3B30;
}

.force-send-message {
  margin-bottom: 16px;
  line-height: 1.5;
}

.force-send-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-button {
  padding: 8px 16px;
  border: 1px solid #E5E5EA;
  background-color: white;
  border-radius: 6px;
  cursor: pointer;
}

.force-button {
  padding: 8px 16px;
  background-color: #FF3B30;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
</style>
