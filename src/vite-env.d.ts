/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ENABLE_AI: string;
  readonly VITE_GROQ_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
