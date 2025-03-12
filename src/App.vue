<template>
  <div id="app">
    <h1>Off-Platform Communication Detector Demo</h1>
    <div class="demo-container">
      <ChatMessageInput 
        :showStats="true"
        :aiConfidenceThreshold="70"
        :enableAiDetection="true"
        :enableRegexDetection="true"
        :allowForceSend="false"
        @send="handleMessageSent"
        @detection-warning="handleDetectionWarning"
      />
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
  methods: {
    handleMessageSent(data) {
      console.log('Message sent:', data);
    },
    handleDetectionWarning(data) {
      console.log('Detection warning:', data);
    }
  }
}
</script>

<style scoped>
#app {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
  padding: 0 20px;
}

.demo-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

h1 {
  font-size: 24px;
  margin-bottom: 30px;
}
</style>