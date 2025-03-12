<template>
  <div id="app">
    <header class="app-header">
      <h1>Off-Platform Communication Detector</h1>
      <p class="app-description">
        A reusable Vue component for detecting and preventing off-platform communication attempts in chat messages.
      </p>
    </header>

    <main class="app-content">
      <div class="demo-container">
        <h2>Demo</h2>
        
        <div class="chat-container">
          <!-- Chat messages display -->
          <div class="chat-messages" ref="chatMessages">
            <div 
              v-for="(message, index) in messages" 
              :key="index" 
              class="chat-message"
              :class="{ 'flagged-message': message.wasFlagged }"
            >
              <div class="message-bubble">
                {{ message.text }}
                <span v-if="message.wasFlagged" class="flag-indicator">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                </span>
              </div>
              <div v-if="message.wasFlagged" class="message-flag-info">
                Flagged as potential off-platform communication
                ({{ message.detectionType === 'regex' ? 'Pattern match' : 'AI detection' }}, 
                confidence: {{ message.confidence }}%)
              </div>
              <div class="message-time">{{ message.time }}</div>
            </div>
          </div>
          
          <!-- Chat input component -->
          <ChatMessageInput
            :showStats="true"
            :aiConfidenceThreshold="70"
            :enableAiDetection="true"
            :enableRegexDetection="true"
            :allowForceSend="true"
            :maxChars="500"
            placeholder="Type a message here..."
            :supportedLanguages="['en', 'es', 'fr', 'de', 'zh', 'ja', 'ru']"
            :aiDetectionDebounce="500"
            @send="onMessageSend"
            @detection-warning="onDetectionWarning"
            @detection-error="onDetectionError"
          />
        </div>
        
        <div class="config-panel">
          <h3>Configuration Options</h3>
          <p>The component supports various configuration options through props:</p>
          <ul>
            <li><strong>aiConfidenceThreshold:</strong> Confidence level (0-100) for AI detection</li>
            <li><strong>enableAiDetection:</strong> Enable/disable AI-based detection</li>
            <li><strong>enableRegexDetection:</strong> Enable/disable regex-based detection</li>
            <li><strong>allowForceSend:</strong> Allow users to force-send flagged messages</li>
            <li><strong>maxChars:</strong> Maximum characters allowed in a message</li>
            <li><strong>supportedLanguages:</strong> Language codes for international detection</li>
          </ul>
        </div>
        
        <div class="test-cases">
          <h3>Test Cases</h3>
          <p>Try copying and pasting these examples:</p>
          <div class="test-case-list">
            <div class="test-case" @click="copyToClipboard('Hey, message me on WhatsApp at 555-123-4567')">
              Phone number: "Hey, message me on WhatsApp at 555-123-4567"
            </div>
            <div class="test-case" @click="copyToClipboard('My email is user@example.com, send me a message there')">
              Email: "My email is user@example.com, send me a message there"
            </div>
            <div class="test-case" @click="copyToClipboard('Let\'s continue this conversation on Instagram, my handle is @user.name')">
              Social media: "Let's continue this conversation on Instagram, my handle is @user.name"
            </div>
            <div class="test-case" @click="copyToClipboard('Check out my website example.com where we can chat more')">
              URL: "Check out my website example.com where we can chat more"
            </div>
            <div class="test-case" @click="copyToClipboard('Let\'s take this to F a c e b o o k, my username is user.name')">
              Obfuscated: "Let's take this to F a c e b o o k, my username is user.name"
            </div>
            <div class="test-case" @click="copyToClipboard('I think we should continue this conversation somewhere more private. Do you understand what I mean?')">
              Subtle hint: "I think we should continue this conversation somewhere more private. Do you understand what I mean?"
            </div>
          </div>
        </div>
      </div>
    </main>

    <footer class="app-footer">
      <p>This component uses regex patterns and Google Gemini 2.0 Flash Lite API for detection.</p>
    </footer>
    
    <!-- Notifications -->
    <div v-if="notification.show" class="notification" :class="notification.type">
      <div class="notification-content">
        <div class="notification-message">{{ notification.message }}</div>
        <button class="notification-close" @click="hideNotification">×</button>
      </div>
    </div>
  </div>
</template>

<script>
import ChatMessageInput from './components/ChatMessageInput.vue';

export default {
  name: 'App',
  components: {
    ChatMessageInput
  },
  data() {
    return {
      messages: [],
      notification: {
        show: false,
        message: '',
        type: 'info',
        timeout: null
      }
    };
  },
  methods: {
    onMessageSend(data) {
      // Format and add the message to the chat
      const now = new Date();
      const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      this.messages.push({
        text: data.message,
        time: timeString,
        wasFlagged: data.wasFlagged,
        detectionType: data.detectionType,
        confidence: data.confidence
      });
      
      // Scroll to the bottom of chat
      this.$nextTick(() => {
        if (this.$refs.chatMessages) {
          this.$refs.chatMessages.scrollTop = this.$refs.chatMessages.scrollHeight;
        }
      });
    },
    
    onDetectionWarning(data) {
      this.showNotification(`Warning: Potential off-platform communication detected (${data.type}, ${data.confidence}% confidence)`, 'warning');
    },
    
    onDetectionError(error) {
      this.showNotification(`Error analyzing message: ${error.message}`, 'error');
    },
    
    showNotification(message, type = 'info') {
      // Clear existing timeout if there is one
      if (this.notification.timeout) {
        clearTimeout(this.notification.timeout);
      }
      
      // Show new notification
      this.notification = {
        show: true,
        message,
        type,
        timeout: setTimeout(() => {
          this.hideNotification();
        }, 5000)
      };
    },
    
    hideNotification() {
      this.notification.show = false;
      if (this.notification.timeout) {
        clearTimeout(this.notification.timeout);
        this.notification.timeout = null;
      }
    },
    
    copyToClipboard(text) {
      navigator.clipboard.writeText(text)
        .then(() => {
          this.showNotification('Test case copied to clipboard', 'info');
        })
        .catch(err => {
          console.error('Could not copy text: ', err);
        });
    }
  }
};
</script>

<style>
/* Global styles */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-size: 16px;
  line-height: 1.5;
  color: #333333;
  background-color: #f5f5f7;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* App layout */
#app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.app-header {
  text-align: center;
  margin-bottom: 30px;
  padding: 20px 0;
  border-bottom: 1px solid #E5E5EA;
}

h1 {
  font-size: 2rem;
  margin-bottom: 10px;
  color: #333333;
}

.app-description {
  color: #666666;
  max-width: 600px;
  margin: 0 auto;
}

.app-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.demo-container {
  background-color: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 24px;
}

h2, h3 {
  margin-bottom: 16px;
  color: #333333;
}

/* Chat container */
.chat-container {
  background-color: #FFFFFF;
  border-radius: 8px;
  margin-bottom: 30px;
  border: 1px solid #E5E5EA;
  overflow: hidden;
}

.chat-messages {
  height: 400px;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background-color: #f9f9f9;
}

.chat-message {
  display: flex;
  flex-direction: column;
  align-self: flex-start;
  max-width: 80%;
}

.message-bubble {
  background-color: #E5E5EA;
  padding: 10px 14px;
  border-radius: 18px;
  position: relative;
  word-break: break-word;
}

.flagged-message .message-bubble {
  background-color: rgba(255, 59, 48, 0.1);
  border: 1px solid #FF3B30;
}

.flag-indicator {
  color: #FF3B30;
  margin-left: 6px;
  display: inline-flex;
  align-items: center;
}

.message-flag-info {
  font-size: 12px;
  color: #FF3B30;
  margin-top: 4px;
}

.message-time {
  font-size: 12px;
  color: #8E8E93;
  margin-top: 4px;
}

/* Config panel */
.config-panel {
  margin-bottom: 30px;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  border: 1px solid #E5E5EA;
}

.config-panel ul {
  padding-left: 20px;
}

.config-panel li {
  margin-bottom: 8px;
}

/* Test cases */
.test-cases {
  margin-bottom: 30px;
}

.test-case-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.test-case {
  padding: 12px;
  background-color: #f0f0f5;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.test-case:hover {
  background-color: #e5e5ea;
}

/* Footer */
.app-footer {
  margin-top: 40px;
  padding-top: 20px;
  text-align: center;
  color: #8E8E93;
  font-size: 14px;
  border-top: 1px solid #E5E5EA;
}

/* Notifications */
.notification {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-width: 400px;
  z-index: 1000;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.notification.info {
  background-color: #007AFF;
  color: white;
}

.notification.warning {
  background-color: #FF9500;
  color: white;
}

.notification.error {
  background-color: #FF3B30;
  color: white;
}

.notification-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.notification-message {
  flex: 1;
}

.notification-close {
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  margin-left: 12px;
}
</style>
