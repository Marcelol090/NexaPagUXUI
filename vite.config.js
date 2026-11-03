import { defineConfig } from 'vite';
import { resolve } from 'node:path';
export default defineConfig({ base:'./', build:{target:'es2022', sourcemap:false,rollupOptions:{input:{main:resolve(process.cwd(),'index.html'),materials:resolve(process.cwd(),'materials.html'),lab:resolve(process.cwd(),'lab.html')}}}, server:{port:5173} });
