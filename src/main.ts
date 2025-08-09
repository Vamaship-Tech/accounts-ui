import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import { clearAllAuthenticationData, isFromEcom3uiLogout } from './utils/auth'

// IMMEDIATE AUTH CLEARING - Check URL parameters as soon as app loads
if (isFromEcom3uiLogout()) {
    console.log('🚨 MAIN.TS: Detected logout from ecom3-ui - immediately clearing all auth data');
    clearAllAuthenticationData();
}

const app = createApp(App)

app.use(createPinia()).use(router).mount('#app')
