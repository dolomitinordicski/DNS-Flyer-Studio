import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';
const connection=fileURLToPath(new URL('./dnsCore.ts',import.meta.url));
export default defineConfig({base:'/',plugins:[{name:'test-only-demo-connection',enforce:'pre',resolveId(source){
  if(source.endsWith('/dnsCore')||source.endsWith('/dnsCore.ts'))return connection;
}},react(),tailwindcss()],server:{host:'127.0.0.1',port:4180,strictPort:true}});
