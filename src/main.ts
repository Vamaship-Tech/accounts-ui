import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'

// Suppress specific noisy third-party console warnings in all environments
const originalWarn = window.console.warn.bind(window.console)
const originalError = window.console.error.bind(window.console)
const suppressionRegexes = [
  /Feature Policy: Skipping unsupported feature name ["']identity-credentials-get["']/,
  /Content-Security-Policy warnings/i,
]
const shouldSuppress = (args: unknown[]): boolean => {
  try {
    const first = args[0] as unknown
    const message = typeof first === 'string'
      ? first
      : first instanceof Error
        ? first.message
        : String(first)
    return suppressionRegexes.some((re) => re.test(message))
  } catch {
    return false
  }
}
window.console.warn = (...args: any[]) => {
  if (shouldSuppress(args)) return
  originalWarn(...args)
}
window.console.error = (...args: any[]) => {
  if (shouldSuppress(args)) return
  originalError(...args)
}

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
