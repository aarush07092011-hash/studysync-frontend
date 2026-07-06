/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the backend API in production (e.g. https://studysync-api.onrender.com). */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
