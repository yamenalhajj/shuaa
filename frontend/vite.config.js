import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Port 3000 is the origin the backend's CORS allowlist expects (ALLOWED_ORIGINS).
// strictPort so a taken port fails loudly instead of silently moving to a
// port the backend would reject.
export default defineConfig({
  plugins: [react()],
  server: { port: 3000, strictPort: true },
});
