import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env vars - this allows REACT_APP_ prefixed vars to work
  const env = loadEnv(mode, process.cwd(), ['REACT_APP_', 'VITE_'])
  
  return {
    plugins: [
      react({
        babel: {
          plugins: [['babel-plugin-react-compiler']],
        },
      }),
    ],
    // Expose REACT_APP_ prefixed environment variables
    envPrefix: ['REACT_APP_', 'VITE_'],
    // Define REACT_APP_API_URL for client-side access
    define: {
      'import.meta.env.REACT_APP_API_URL': JSON.stringify(env.REACT_APP_API_URL || env.VITE_API_URL || ''),
    },
  }
})
