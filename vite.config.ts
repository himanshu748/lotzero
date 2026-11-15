import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig(({mode})=>({root:'static/lotzero-ui',base:'./',plugins:[react()],define:{'import.meta.env.VITE_LOCAL_DEMO':JSON.stringify(mode==='rehearsal'?'true':'false')},build:{outDir:'dist',emptyOutDir:true},server:{port:4173,strictPort:true}}));
