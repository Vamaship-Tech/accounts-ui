/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_MAIN_APP_URL: string
  readonly VITE_MAINTENANCE_MODE?: string
  readonly VITE_MAINTENANCE_MESSAGE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 