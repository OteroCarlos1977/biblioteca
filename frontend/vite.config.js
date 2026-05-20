import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// El plugin de React transforma JSX correctamente.
// Sin esta configuracion, el navegador puede recibir JSX sin transformar y
// mostrar errores como "React is not defined".
export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [react()],
});
