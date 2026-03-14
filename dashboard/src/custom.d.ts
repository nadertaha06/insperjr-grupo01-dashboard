declare module "*.svg" {
    const content: string;
    export default content;
  }
  
  declare module '*.png' {
    const value: string;
    export default value;
  }
  
  declare module '*.jpg' {
    const value: string;
    export default value;
  }

  interface ImportMetaEnv {
    readonly DEV: boolean;
    /** URL do backend (origem, sem /api/v1). Ex.: https://seu-backend.onrender.com */
    readonly VITE_API_URL?: string;
    /** Base completa da API (alternativa a VITE_API_URL). Ex.: https://seu-backend.onrender.com/api/v1 */
    readonly VITE_API_BASE_URL?: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }