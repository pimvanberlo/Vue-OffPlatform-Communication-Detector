import { createApp } from 'vue';
import App from './App.vue';

// Optionally, you could register the OffPlatformDetector component globally
// import OffPlatformDetector from './components/OffPlatformDetector.vue';
// app.component('OffPlatformDetector', OffPlatformDetector);

const app = createApp(App);
app.mount('#app');
